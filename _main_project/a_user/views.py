from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponse
from django.conf import settings
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.urls import reverse

from a_user.forms import RegistrationForm, AccountAuthenticationForm, AccountUpdateForm
from a_user.models import Account, BlockedUser
from a_friends.models import FriendList, FriendRequest
from a_friends.utils import get_friend_request_or_false
from a_friends.friend_request_status import FriendRequestStatus
from a_friends.serializers import FriendRequestSerializer

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .serializers import AccountSerializer

from a_chat.models import ChatRoom
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


@api_view(["POST"])
def api_register_view(request, *args, **kwargs):
	user = request.user
	if user.is_authenticated:
		return Response({"message": f"You are already authenticated as {user.email}."})
	form = RegistrationForm(request.data)
	if form.is_valid():
		form.save()
		email = form.cleaned_data.get('email')
		raw_password = form.cleaned_data.get('password1')
		account = authenticate(email=email, password=raw_password)
		login(request, account)
		profile_image_url = account.profile_image.url if account.profile_image else get_default_profile_image()
		return Response({
			"message": "Registration Successful", 
			"redirect": reverse('js_home'),
			"profile_image_url": profile_image_url,
			"username": account.username,
		}, status=status.HTTP_201_CREATED)
	else:
		return Response({"message": form.getErrors()})


@api_view(["GET"])
def api_logout_view(request):
	logout(request)
	return Response({"message": "You have been logged out."})
	# return redirect('home')


@api_view(["POST"])
def api_login_view(request, *args, **kwargs):
	context = {}
	user = request.user

	if user.is_authenticated:
		return Response({"message": f"You are already authenticated as {user.email}."})
	form = AccountAuthenticationForm(request.data)
	if form.is_valid():
		email = form.cleaned_data.get('email')
		password = form.cleaned_data.get('password')
		account = authenticate(email=email, password=password)
		profile_image_url = account.profile_image.url if account.profile_image else get_default_profile_image()
		if account:
			login(request, account)
			return Response({
				"message": "Login Successful", 
				"redirect": reverse('js_home'),
				"profile_image_url": profile_image_url,
				"username": account.username,
			}, status=status.HTTP_200_OK)
		else:
			return Response({"message": "Invalid login credentials."})
	else:
		return Response({"message": form.getErrors()})


@api_view(['GET'])
def api_logged_in_user_view(request):
	user = request.user
	if user.is_authenticated:
		profile_image_url = user.profile_image.url if user.profile_image else get_default_profile_image()
		return Response({
			'id': user.id,
			'username': user.username,
			'profile_image_url': profile_image_url,
		}, status=status.HTTP_200_OK)
	return Response(status=status.HTTP_204_NO_CONTENT)


def det_redirect_if_exists(request):
	redirect = None
	if request.GET:
		if request.GET.get('next'):
			redirect = str(request.GET.get('next'))
	return redirect


@api_view(['GET'])
def api_profile_view(request, *args, **kwargs):
	context = {}
	user_id = kwargs.get('user_id')

	try:
		account = Account.objects.get(pk=user_id)
	except Account.DoesNotExist:
		return Response({"message": "User not found."}, status=status.HTTP_204_NO_CONTENT)

# FriendRequestSerializer(friend_request, many=True).data

	if account:
		account_data = AccountSerializer(account).data
		context['id'] = account_data['id']
		context['email'] = account_data['email']
		context['username'] = account_data['username']
		context['profile_image'] = account_data['profile_image'] if account.profile_image else None
		context['hide_email'] = account_data['hide_email']

		# determine the relationship status between the logged-in user and the user whose profile is being viewed
		try:
			friend_list = FriendList.objects.get(user=account)
		except FriendList.DoesNotExist:
			friend_list = FriendList(user=account)
			friend_list.save()
		friends = friend_list.friends.all()
		context['friends'] = [AccountSerializer(friend).data for friend in friends]

		is_self = True
		is_friend = False
		user = request.user
		request_sent = FriendRequestStatus.NO_REQUEST_SENT.value
		friend_request = None
		is_blocked = False
		
		# This check says : `If you are not looking at your own profile, then..`
		if user.is_authenticated and user != account:
			is_self = False
			if friends.filter(pk=user.id):
				is_friend = True
			else:
				is_friend = False
				# case 1: the user is not a friend and request status = `THEY_SENT_YOU`
				pending_friend_request = get_friend_request_or_false(sender=account, receiver=user) 
				if pending_friend_request:
					request_sent = FriendRequestStatus.THEY_SENT_TO_YOU.value
					context['pending_friend_request_id'] = pending_friend_request.id

				# case 2: the user is not a friend and request status = `YOU_SENT_TO_THEM`	
				elif get_friend_request_or_false(sender=user, receiver=account) is not False:
					pending_friend_request = get_friend_request_or_false(sender=user, receiver=account)
					if pending_friend_request:
						request_sent = FriendRequestStatus.SENT_BY_YOU.value
						context['pending_friend_request_id'] = pending_friend_request.id

				# case 3: the user is not a friend and request status = `NO_REQUEST_SENT`
				else:
					request_sent = FriendRequestStatus.NO_REQUEST_SENT.value
			
			is_blocked = BlockedUser.objects.filter(user=user, blocked_user=account).exists()

		# This check means : `If you are not logged in, then..`
		elif not user.is_authenticated:
			is_self = False
		
		# This check means : `If you are looking at your own profile, then..`
		else:
			try:
				friend_request = FriendRequest.objects.filter(receiver=user, is_active=True)
			except:
				friend_request = None

		context['is_self'] = is_self
		context['is_friend'] = is_friend
		context['BASE_URL'] = settings.BASE_URL
		context['request_sent'] = request_sent
		context['friend_request'] = FriendRequestSerializer(friend_request, many=True).data
		context['is_blocked'] = is_blocked

	return Response(context, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_edit_profile_view(request, *args, **kwargs):
	user_id = kwargs.get('user_id')
	try:
		account = Account.objects.get(pk=user_id)
	except Account.DoesNotExist:
		return Response("User not found.", status=status.HTTP_204_NO_CONTENT)

	if account.pk != request.user.pk:
		return Response("You cannot edit someone else's profile.", status=status.HTTP_403_FORBIDDEN)

	form = AccountUpdateForm(request.data, request.FILES, instance=request.user)
	if form.is_valid():
		print('saving form')
		print(form.cleaned_data)
		form.save()
		return Response({"message": "Profile updated successfully."}, status=status.HTTP_200_OK)
	else:
		return Response({"errors": form.errors}, status=status.HTTP_400_BAD_REQUEST)
	context = {
		'form': form.as_p(),
		'DATA_UPLOAD_MAX_MEMORY_SIZE': settings.DATA_UPLOAD_MAX_MEMORY_SIZE,
	}
	return Response(context, status=status.HTTP_200_OK)


@api_view(['GET'])
def api_account_search_view(request, *args, **kwargs):
	context = {}

	if request.method == 'GET':
		search_query = request.GET.get('q')
		if search_query and len(search_query) > 0:
			search_results = Account.objects.filter(username__icontains=search_query).distinct()
			user = request.user
			accounts = [] # ..list structure: `[(account1, True), (account2, False), ...]` true/False is for friend status

		if user.is_authenticated:
			try:
				user_friend_list = FriendList.objects.get(user=user)
				for account in search_results:
					account_data = AccountSerializer(account).data
					accounts.append((account_data, user_friend_list.is_mutual_friend(account)))
			except FriendList.DoesNotExist:
				for account in search_results:
					account_data = AccountSerializer(account).data
					accounts.append((account_data, False))
			context['accounts'] = accounts
		else:
			for account in search_results:
				account_data = AccountSerializer(account).data
				accounts.append((account_data, False)) # False for indicating that the user is not a friend
			context['accounts'] = accounts

	return Response(context, status=status.HTTP_200_OK)


@login_required
@api_view(['POST'])
def api_block_user_view(request, user_id):
	user_to_block = get_object_or_404(Account, id=user_id)
	BlockedUser.objects.get_or_create(user=request.user, blocked_user=user_to_block)
	
	chat_room = ChatRoom.objects.filter(members=user_to_block).filter(members=request.user).first()

	if chat_room:
		room_name = chat_room.room_name

		channel_layer = get_channel_layer()

		# DEBUG #
		print(f"Room name: {room_name}, chat.close_connection")

		async_to_sync(channel_layer.group_send)(
			room_name,
			{
				"type": "chat.close_connection",
				"message": f"You have been blocked by {request.user.username}.",
			}
		)

	return Response({"message": f'You have blocked {user_to_block.username}.'}, status=status.HTTP_200_OK)


@login_required
@api_view(['POST'])
def api_unblock_user_view(request, user_id):
	user_to_unblock = get_object_or_404(Account, id=user_id)
	BlockedUser.objects.filter(user=request.user, blocked_user=user_to_unblock).delete()
	# messages.success(request, f'You have unblocked {user_to_unblock.username}.')
	return Response({"message": f'You have unblocked {user_to_unblock.username}.'}, status=status.HTTP_200_OK)
	# return redirect('a_user:profile', user_id=user_id)

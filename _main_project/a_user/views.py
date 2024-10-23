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

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status


@api_view(["GET", "POST"])
def register_view(request, *args, **kwargs):
	user = request.user
	if user.is_authenticated:
		return Response({"message": f"You are already authenticated as {user.email}."})
	if request.method == 'GET':
		return redirect('js_home')
	if request.method == 'POST':
		form = RegistrationForm(request.data)
		if form.is_valid():
			form.save()
			email = form.cleaned_data.get('email')
			raw_password = form.cleaned_data.get('password1')
			account = authenticate(email=email, password=raw_password)
			login(request, account)
		else:
			return Response({"message": "Registration Form not valid."})
	return Response({"message": "Registration Successful", "redirect": reverse('js_home')}, status=status.HTTP_201_CREATED)


def det_redirect_if_exists(request):
	redirect = None
	if request.GET:
		if request.GET.get('next'):
			redirect = str(request.GET.get('next'))
	return redirect


@api_view(["GET"])
def logout_view(request):
	logout(request)
	return Response({"message": "You have been logged out."})
	# return redirect('home')


@api_view(["POST"])
def login_view(request, *args, **kwargs):
	context = {}
	user = request.user

	if user.is_authenticated:
		return Response({"message": f"You are already authenticated as {user.email}."})
	if request.method == 'POST':
		form = AccountAuthenticationForm(request.data)
		if form.is_valid():
			email = form.cleaned_data.get('email')
			password = form.cleaned_data.get('password')
			user = authenticate(email=email, password=password)
			if user:
				login(request, user)
			else:
				return Response({"message": "Invalid login credentials."})
		else:
			return Response({"message": "Login Form not valid."})
	return Response({"message": "Login Successful", "redirect": reverse('js_home')}, status=status.HTTP_201_CREATED)


def det_redirect_if_exists(request):
	redirect = None
	if request.GET:
		if request.GET.get('next'):
			redirect = str(request.GET.get('next'))
	return redirect


def profile_view(request, *args, **kwargs):
	context = {}
	user_id = kwargs.get('user_id')

	try:
		account = Account.objects.get(pk=user_id)
	except Account.DoesNotExist:
		return HttpResponse("User not found.")

	if account:
		context['id'] = account.id
		context['email'] = account.email
		context['username'] = account.username
		context['profile_image'] = account.profile_image
		context['hide_email'] = account.hide_email

		# determine the relationship status between the logged-in user and the user whose profile is being viewed
		try:
			friend_list = FriendList.objects.get(user=account)
		except FriendList.DoesNotExist:
			friend_list = FriendList(user=account)
			friend_list.save()
		friends = friend_list.friends.all()
		context['friends'] = friends

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
		context['friend_request'] = friend_request
		context['is_blocked'] = is_blocked

	return render(request, 'a_user/profile.html', context)


def edit_profile_view(request, *args, **kwargs):
	if not request.user.is_authenticated:
		return redirect('login')

	user_id = kwargs.get('user_id')
	try:
		account = Account.objects.get(pk=user_id)
	except Account.DoesNotExist:
		return HttpResponse("User not found.")

	if account.pk != request.user.pk:
		return HttpResponse("You cannot edit someone else's profile.")

	context = {}

	if request.POST:
		form = AccountUpdateForm(request.POST, request.FILES, instance=request.user)
		if form.is_valid():
			form.save()
			return redirect('a_user:profile', user_id=account.pk)
		else:
			form = AccountUpdateForm(
				request.POST,
				instance=request.user,
				initial={
					'id': account.pk,
					'email': account.email,
					'username': account.username,
					'profile_image': account.profile_image,
					'hide_email': account.hide_email,
				}
			)
	else:
		form = AccountUpdateForm(
			initial={
				'id': account.pk,
				'email': account.email,
				'username': account.username,
				'profile_image': account.profile_image,
				'hide_email': account.hide_email,
			}
		)

	context['form'] = form
	context['DATA_UPLOAD_MAX_MEMORY_SIZE'] = settings.DATA_UPLOAD_MAX_MEMORY_SIZE

	return render(request, 'a_user/edit_profile.html', context)

def account_search_view(request, *args, **kwargs):
	context = {}

	if request.method == 'GET':
		search_query = request.GET.get('q')
		if len(search_query) > 0:
			# the following query will return all the accounts whose email or username contains the search query
			search_results = Account.objects.filter(email__icontains=search_query).filter(username__icontains=search_query).distinct()
			user = request.user
			accounts = [] # ..list structure: `[(account1, True), (account2, False), ...]` true/False is for friend status

			if user.is_authenticated:
				try:
					user_friend_list = FriendList.objects.get(user=user)
					for account in search_results:
						accounts.append((account, user_friend_list.is_mutual_friend(account)))
				except FriendList.DoesNotExist:
					for account in search_results:
						accounts.append((account, False))
				context['accounts'] = accounts
			else:
				for account in search_results:
					accounts.append((account, False)) # False for indicating that the user is not a friend
				context['accounts'] = accounts

	return render(request, 'a_user/search_results.html', context)


@login_required
def block_user_view(request, user_id):
	user_to_block = get_object_or_404(Account, id=user_id)
	BlockedUser.objects.get_or_create(user=request.user, blocked_user=user_to_block)
	messages.success(request, f'You have blocked {user_to_block.username}.')
	return redirect('a_user:profile', user_id=user_id)


@login_required
def unblock_user_view(request, user_id):
	user_to_unblock = get_object_or_404(Account, id=user_id)
	BlockedUser.objects.filter(user=request.user, blocked_user=user_to_unblock).delete()
	messages.success(request, f'You have unblocked {user_to_unblock.username}.')
	return redirect('a_user:profile', user_id=user_id)

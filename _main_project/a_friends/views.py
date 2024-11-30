from django.http import HttpResponse
from django.contrib import messages
from django.shortcuts import render, redirect
from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import get_object_or_404

from a_friends.forms import SendFriendRequestForm, HandleFriendRequestForm, RemoveFriendForm
from a_friends.models import FriendRequest, FriendList
from a_user.models import Account, BlockedUser

from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from .serializers import FriendRequestSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_send_friend_request_view(request, username):
	other_user = get_object_or_404(Account, username=username)
	if BlockedUser.objects.filter(user=other_user, blocked_user=request.user).exists():
		return Response({'error': 'You are blocked by this user and cannot send friend request'}, status=status.HTTP_403_FORBIDDEN)

	form = SendFriendRequestForm(request.POST)
	if form.is_valid():
		receiver = form.cleaned_data.get('receiver_id')
		FriendRequest.objects.create(sender=request.user, receiver=receiver)
		return Response({'success': 'Friend request sent'}, status=status.HTTP_200_OK)
	else:
		return Response({'error': 'Invalid form data'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_friend_requests_view(request, *args, **kwargs):
	user = request.user
	user_id = kwargs.get('user_id')
	account = get_object_or_404(Account, pk=user_id)
	if account == user:
		friend_requests = FriendRequest.objects.filter(receiver=account, is_active=True)
		serializer = FriendRequestSerializer(friend_requests, many=True)
		return Response(serializer.data, status=status.HTTP_200_OK);
	else:
		return Response({'error': 'You can\'t view another user\'s friend requests.'}, status=status.HTTP_403_FORBIDDEN)


def cancel_friend_request_view(request):
	# DEBUG #
	# print(request.POST)
	# # # # #
	if request.method == 'POST':
		form = HandleFriendRequestForm(request.POST)
		if form.is_valid():
			friend_request_id = form.cleaned_data.get('friend_request_id')
			friend_request_id.cancel()
			messages.success(request, f'Friend request cancelled')
			return redirect('a_user:profile', user_id=friend_request_id.receiver.id)
		else:
			# print(form.errors)
			return HttpResponse('Invalid form data.. (Debug: cancel_friend_request_view)')
	else:
		messages.error(request, 'Debug: This is a POST-only endpoint')
		return redirect('a_user:profile', user_id=request.user.id)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_accept_friend_request_view(request):
	form = HandleFriendRequestForm(request.POST)
	if form.is_valid():
		friend_request_id = form.cleaned_data.get('friend_request_id')
		friend_request_id.accept()
		return Response({'success': 'Friend request accepted'}, status=status.HTTP_200_OK)
	else:
		return Response({'error': 'Invalid form data'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_decline_friend_request_view(request):
	form = HandleFriendRequestForm(request.POST)
	if form.is_valid():
		friend_request_id = form.cleaned_data.get('friend_request_id')
		friend_request_id.decline()
		return Response({'success': 'Friend request declined'}, status=status.HTTP_200_OK)
	else:
		return Response({'error': 'Invalid form data'}, status=status.HTTP_400_BAD_REQUEST)


def remove_friend_view(request):
	user = request.user
	# DEBUG #
	# print(request.POST)
	# print(f'this user: {user.id}')
    # # # # #
	if not user.is_authenticated:
		messages.error(request, 'You must be authenticated to remove a friend')
		return redirect('login')

	if request.method == 'POST':
		form = RemoveFriendForm(request.POST)
		if form.is_valid():
			to_be_removed_user = form.cleaned_data.get('friend_id')
			try:
				friend_list = FriendList.objects.get(user=user)
			except ObjectDoesNotExist:
				messages.error(request, 'Invalid user id or FriendList not found')
				return redirect('a_user:profile', user_id=user.id)

			friend_list.unfriend(to_be_removed_user)
			messages.success(request, f'Friend removed')
			return redirect('a_user:profile', user_id=to_be_removed_user.id)
		else:
			# DEBUG #
			print(form.errors)
			return HttpResponse('Invalid form data.. remove_friend_view')
	
	else: # Never happens..
		messages.error(request, 'Debug: This is a POST-only endpoint')
		return redirect('a_user:profile', user_id=user.id)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_friend_list_view(request, *args, **kwargs):
	context = {}
	user = request.user
	user_id = kwargs.get('user_id')
	if user_id:
		try:
			this_user = Account.objects.get(pk=user_id)
			context['this_user'] = this_user
		except Account.DoesNotExist:
			return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
		try:
			friend_list = FriendList.objects.get(user=this_user)
		except FriendList.DoesNotExist:
			return Response({'error': 'Friend list not found'}, status=status.HTTP_404_NOT_FOUND)

		# Must be friend to view friend list
		if user != this_user:
			if not user in friend_list.friends.all():
				return Response({'error': 'You must be friends to view their friend list'}, status=status.HTTP_403_FORBIDDEN)

		# Get the friend list
		friends = [] # List of friends [(account1, True), (account2, False), ...]
		user_friend_list = FriendList.objects.get(user=user)
		for friend in friend_list.friends.all():
			friends.append((friend, user_friend_list.is_mutual_friend(friend)))
		context['friends'] = friends

	return Response(friends, status=status.HTTP_200_OK)

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import Http404
from django.contrib import messages

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import ChatRoom, Message
from .forms import ChatMessageCreateForm, NewGroupChatForm, ChatRoomEditForm
from a_user.models import Account, BlockedUser


@login_required
def chat_view(request, room_name='public-chat'):
	chat_room = get_object_or_404(ChatRoom, room_name=room_name)
	chat_messages = chat_room.chat_messages.all()[:20]
	form = ChatMessageCreateForm()
	other_user = None

	if chat_room.is_private:
		if request.user not in chat_room.members.all():
			raise Http404()
		for member in chat_room.members.all():
			if member != request.user:
				other_user = member
				break
	
	if chat_room.groupchat_name:
		if request.user not in chat_room.members.all():
			chat_room.members.add(request.user)

	if request.htmx:
		form = ChatMessageCreateForm(request.POST)
		if form.is_valid():
			new_message = form.save(commit=False)
			new_message.room = chat_room
			new_message.author = request.user
			new_message.save()

			# return redirect('a_chat:chat')
			context = {
				'message': new_message,
				'user': request.user,
			}
			return render(request, 'a_chat/partials/chat_message_p.html', context)

	context = {
		'chat_room': chat_room,
		'chat_messages': chat_messages,
		'form': form,
		'other_user': other_user,
	}

	return render(request, 'a_chat/chat.html', context)


@api_view(['GET'])
@login_required
def get_or_create_chatroom(request, username):
	if request.user.username == username:
		return Response({'error': 'You cannot chat with yourself.'}, status=status.HTTP_400_BAD_REQUEST)

	other_user = Account.objects.get(username=username)

	# Check if the user is blocked by any of the members of the chat room.
	# if BlockedUser.objects.filter(user=other_user, blocked_user=request.user).exists():
	# 	messages.warning(request, 'You are blocked by this user and cannot send messages.')
	# 	return redirect('a_user:profile', user_id=other_user.id)

	my_chatrooms = request.user.chat_rooms.filter(is_private=True)

	if my_chatrooms.exists():
		for room in my_chatrooms:
			if other_user in room.members.all():
				room = room
				break
			else:
				room = ChatRoom.objects.create(is_private=True)
				room.members.add(request.user, other_user)
	else:
		room = ChatRoom.objects.create(is_private=True)
		room.members.add(request.user, other_user)

	return Response({'room_name': room.room_name}, status=status.HTTP_200_OK);


@login_required
def create_groupchat(request):
	form = NewGroupChatForm()

	if request.method == 'POST':
		form = NewGroupChatForm(request.POST)
		if form.is_valid():
			new_groupchat = form.save(commit=False)
			new_groupchat.admin = request.user
			new_groupchat.save()
			new_groupchat.members.add(request.user)
			return redirect('a_chat:chat-room', new_groupchat.room_name)

	context = {
		'form': form,
	}
	return render(request, 'a_chat/create_groupchat.html', context)


@login_required
def chatroom_edit_view(request, room_name):
	chat_room = get_object_or_404(ChatRoom, room_name=room_name)
	if request.user != chat_room.admin:
		raise Http404()

	form = ChatRoomEditForm(instance=chat_room)

	if request.method == 'POST':
		form = ChatRoomEditForm(request.POST, instance=chat_room)
		if form.is_valid():
			form.save()
			
			remove_members = request.POST.getlist('remove_members')
			for member_id in remove_members:
				member = Account.objects.get(id=member_id)
				chat_room.members.remove(member)

			return redirect('a_chat:chat-room', room_name=room_name)

	context = {
		'form': form,
		'chat_room': chat_room,
	}
	return render(request, 'a_chat/chatroom_edit.html', context)


@login_required
def chatroom_delete_view(request, room_name):
	chat_room = get_object_or_404(ChatRoom, room_name=room_name)
	if request.user != chat_room.admin:
		raise Http404()

	if request.method == 'POST':
		chat_room.delete()
		messages.success(request, 'Group chat deleted successfully.')
		return redirect('home')

	context = {
		'chat_room': chat_room,
	}
	return render(request, 'a_chat/chatroom_delete.html', context)


@login_required
def chatroom_leave_view(request, room_name):
	chat_room = get_object_or_404(ChatRoom, room_name=room_name)
	if request.user not in chat_room.members.all():
		raise Http404()

	if request.method == 'POST':
		chat_room.members.remove(request.user)
		messages.success(request, 'You have left the group chat.')
		return redirect('home')

	context = {
		'chat_room': chat_room,
	}
	return render(request, 'a_chat/chatroom_leave.html', context)


@login_required
@api_view(['GET'])
def get_user_chatrooms(request):
	chatrooms = request.user.chat_rooms.all()
	chatrooms_data = []

	for chatroom in chatrooms:
		chatroom_data = {
			'room_name': chatroom.room_name,
			'is_private': chatroom.is_private,
			'groupchat_name': chatroom.groupchat_name,
			# 'admin': chatroom.admin.username,
			'members': [member.username for member in chatroom.members.all()],
		}
		chatrooms_data.append(chatroom_data)

	return Response(chatrooms_data, status=status.HTTP_200_OK)

@login_required
@api_view(['GET'])
def get_last_50_chat_messages(request, room_name):
	chat_room = get_object_or_404(ChatRoom, room_name=room_name)
	chat_messages = chat_room.chat_messages.all().order_by('-created')[:50]
	messages_data = [{'author': message.author.username, 'content': message.msg_content, 'created': message.created} for message in chat_messages]
	messages_data.reverse()
	return Response(messages_data, status=status.HTTP_200_OK)
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import Http404

from .models import ChatRoom, Message
from .forms import ChatMessageCreateForm
from a_user.models import Account


@login_required
def chat_view(request, room_name='public-chat'):
	chat_room = get_object_or_404(ChatRoom, room_name=room_name)
	chat_messages = chat_room.chat_messages.all()[:20]
	form = ChatMessageCreateForm()

	otehr_user = None
	if chat_room.is_private:
		if request.user not in chat_room.members.all():
			raise Http404()
		for member in chat_room.members.all():
			if member != request.user:
				otehr_user = member
				break

	# if request.method == 'POST':
	# if request.headers.get('HX-Request') == 'true':
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
			# return render(request, 'a_chat/chat_message.html', context)

	context = {
		'chat_room': chat_room,
		'chat_messages': chat_messages,
		'form': form,
		'other_user': otehr_user,
	}

	return render(request, 'a_chat/chat.html', context)


@login_required
def get_or_create_chatroom(request, username):
	if request.user.username == username:
		return redirect('home')

	other_user = Account.objects.get(username=username)
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

	return redirect('a_chat:chat_room', room.room_name)


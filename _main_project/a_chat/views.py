from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required

from .models import ChatRoom, Message
from .forms import ChatMessageCreateForm


@login_required
def chat_view(request):
	chat_room = get_object_or_404(ChatRoom, room_name='public-chat')
	chat_messages = chat_room.chat_messages.all()[:20]
	form = ChatMessageCreateForm()

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

	context = {
		'chat_room': chat_room,
		'chat_messages': chat_messages,
		'form': form,
	}

	return render(request, 'a_chat/chat.html', context)

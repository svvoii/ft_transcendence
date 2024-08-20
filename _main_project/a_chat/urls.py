from django.urls import path
from .views import chat_view, get_or_create_chatroom


app_name = 'a_chat'

urlpatterns = [
	path('', chat_view, name='chat'),
	path('chat/<username>', get_or_create_chatroom, name='start-chat'),
	path('chat/room/<room_name>', chat_view, name='chat_room'),
]

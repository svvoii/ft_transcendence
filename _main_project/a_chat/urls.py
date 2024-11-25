from django.urls import path
from .views import chat_view, get_or_create_chatroom, create_groupchat, chatroom_edit_view, chatroom_delete_view, chatroom_leave_view, get_user_chatrooms


app_name = 'a_chat'

urlpatterns = [
	path('', chat_view, name='chat'),
	path('chat/<username>', get_or_create_chatroom, name='start-chat'),
	path('chat/room/<room_name>', chat_view, name='chat-room'),
	path('chat/new_groupchat/', create_groupchat, name='new-groupchat'),
	path('chat/edit/<room_name>', chatroom_edit_view, name='edit-chatroom'),
	path('chat/delete/<room_name>', chatroom_delete_view, name='delete-chatroom'),
	path('chat/leave/<room_name>', chatroom_leave_view, name='leave-chatroom'),
	path('get_chatrooms/', get_user_chatrooms, name='get-chatrooms'),
]

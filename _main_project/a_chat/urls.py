from django.urls import path
from .views import chat_view, api_get_or_create_chatroom, create_groupchat, chatroom_edit_view, chatroom_delete_view, chatroom_leave_view, api_get_user_chatrooms, api_get_last_50_chat_messages


app_name = 'a_chat'

urlpatterns = [
	path('', chat_view, name='chat'),
	path('chat/<username>', api_get_or_create_chatroom, name='start-chat'),
	path('chat/room/<room_name>', chat_view, name='chat-room'),
	path('chat/new_groupchat/', create_groupchat, name='new-groupchat'),
	path('chat/edit/<room_name>', chatroom_edit_view, name='edit-chatroom'),
	path('chat/delete/<room_name>', chatroom_delete_view, name='delete-chatroom'),
	path('chat/leave/<room_name>', chatroom_leave_view, name='leave-chatroom'),
	path('chat/get_chatrooms/', api_get_user_chatrooms, name='get-chatrooms'),
	path('chat/<room_name>/messages/', api_get_last_50_chat_messages, name='get-all-chat-messages'),
]

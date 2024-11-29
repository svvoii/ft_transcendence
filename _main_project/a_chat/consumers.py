import json
from django.shortcuts import get_object_or_404
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from .models import ChatRoom, Message
from .serializers import MessageSerializer

class ChatConsumer(WebsocketConsumer):

	def connect(self):
		self.user = self.scope['user']
		self.room_name = self.scope['url_route']['kwargs']['room_name']
		self.room = get_object_or_404(ChatRoom, room_name=self.room_name)

		async_to_sync(self.channel_layer.group_add)(
			self.room_name,
			self.channel_name,
		)

		# Online user tracking
		if self.user not in self.room.users_online.all():
			self.room.users_online.add(self.user)
			self.update_online_count()

		self.accept()


	def disconnect(self, close_code):
		async_to_sync(self.channel_layer.group_discard)(
			self.room_name,
			self.channel_name,
		)

		# Online user tracking
		if self.user in self.room.users_online.all():
			self.room.users_online.remove(self.user)
			self.update_online_count()


	def receive(self, text_data):
		data = json.loads(text_data)
		msg_content = data['message']

		# Save the message to the database
		message = Message.objects.create(room=self.room, author=self.user, msg_content=msg_content)

		async_to_sync(self.channel_layer.group_send)(
			self.room_name,
			{
				'type': 'chat_message',
				'message': MessageSerializer(message).data,
				'user': self.user.username,
			}
		)


	def chat_message(self, event):
		message = event['message']
		user = event['user']

		self.send(text_data=json.dumps({
			'message': message,
			'user': user,
		}))


	def update_online_count(self):
		async_to_sync(self.channel_layer.group_send)(
			self.room_name,
			{
				'type': 'online_count',
				'count': self.room.users_online.count(),
			}
		)


	def online_count(self, event):
		count = event['count']

		self.send(text_data=json.dumps({
			'online_count': count,
		}))
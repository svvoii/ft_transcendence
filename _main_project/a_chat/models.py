from django.db import models
from a_user.models import Account
import shortuuid


# The following model / db table will be storing chatrooms.
class ChatRoom(models.Model):
	room_name = models.CharField(max_length=128, unique=True, default=shortuuid.uuid)
	groupchat_name = models.CharField(max_length=128, null=True, blank=True)
	admin = models.ForeignKey(Account, related_name='group_chats', blank=True, null=True, on_delete=models.SET_NULL)
	users_online = models.ManyToManyField(Account, related_name='online_in_rooms', blank=True)
	members = models.ManyToManyField(Account, related_name='chat_rooms', blank=True) 
	is_private = models.BooleanField(default=False)

	def __str__(self):
		return self.room_name


# The following model / db table will be storing messages.
class Message(models.Model):
	room = models.ForeignKey(ChatRoom, related_name='chat_messages', on_delete=models.CASCADE,)
	author = models.ForeignKey('a_user.Account', on_delete=models.CASCADE,)
	msg_content = models.CharField(max_length=512)
	created = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f'{self.author.username} : {self.msg_content}'
	
	class Meta:
		ordering = ['-created']


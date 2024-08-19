from django.db import models
from a_user.models import Account


# The following model / db table will be storing chatrooms.
class ChatRoom(models.Model):
	room_name = models.CharField(max_length=128, unique=True)
	users_online = models.ManyToManyField(Account, related_name='online_in_rooms', blank=True)
	# messages = models.ManyToManyField('a_chat.Message', related_name='chat_room')

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

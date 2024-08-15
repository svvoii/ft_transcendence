from django.db import models
from django.conf import settings
from django.utils import timezone


class FriendList(models.Model):

	# This is the account who owns the friend list (one user has one friend list)
	user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='user')

	# This is the list of friends (many users have many friends)
	friends = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=True, related_name='friends')

	def __str__(self):
		return self.user.username
	
	def add_friend(self, account):
		if not account in self.friends.all():
			self.friends.add(account)
			self.save()
	
	def remove_friend(self, account):
		if account in self.friends.all():
			self.friends.remove(account)

	def unfriend(self, to_be_removed):
		initiator_friends_list = self # This is the user who originally initiated the removal
		initiator_friends_list.remove_friend(to_be_removed)

		# Remove the initiator from the to_be_removed user's friend list
		friend_list = FriendList.objects.get(user=to_be_removed)
		friend_list.remove_friend(initiator_friends_list.user)	

	def is_mutual_friend(self, friend):
		if friend in self.friends.all():
			return True
		return False


class FriendRequest(models.Model):
	sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sender')
	receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='receiver')
	is_active = models.BooleanField(blank=False, null=False, default=True)
	timestamp = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return self.sender.username
	
	def accept(self):
		receiver_friend_list = FriendList.objects.get(user=self.receiver)
		if receiver_friend_list:
			receiver_friend_list.add_friend(self.sender)
			sender_friend_list = FriendList.objects.get(user=self.sender)
			if sender_friend_list:
				sender_friend_list.add_friend(self.receiver)
				self.is_active = False
				self.save()

	def decline(self):
		self.is_active = False
		self.save()

	def cancel(self):
		self.is_active = False
		self.save()

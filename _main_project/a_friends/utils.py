from a_friends.models import FriendRequest

def get_friend_request_or_false(sender, receiver):
	try:
		friend_request = FriendRequest.objects.get(sender=sender, receiver=receiver, is_active=True)
		return friend_request
	except FriendRequest.DoesNotExist:
		return False

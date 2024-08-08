from enum import Enum


class FriendRequestStatus(Enum):
	NO_REQUEST_SENT = 0
	SENT_BY_YOU = 1
	THEY_SENT_TO_YOU = 2

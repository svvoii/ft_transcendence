import shortuuid
from django.db import models
from a_user.models import Account


class GameSession(models.Model):
	game_id = models.CharField(max_length=64, default=shortuuid.uuid, unique=True)
	player1 = models.ForeignKey(Account, on_delete=models.CASCADE, related_name="player1", null=True, blank=True)
	player2 = models.ForeignKey(Account, on_delete=models.CASCADE, related_name="player2", null=True, blank=True)
	player1_score = models.IntegerField(default=0)
	player2_score = models.IntegerField(default=0)
	created_at = models.DateTimeField(auto_now_add=True)
	is_active = models.BooleanField(default=True)
 
	def __str__(self):
		return self.game_id

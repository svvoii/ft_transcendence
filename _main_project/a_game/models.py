from django.db import models
from a_user.models import Account
import shortuuid


class GameSession(models.Model):
	session_id = models.CharField(max_length=64, unique=True, default=shortuuid.uuid)
	player1 = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='player1', null=True, blank=True)
	player2 = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='player2', null=True, blank=True)
	player1_score = models.IntegerField(default=0)
	player2_score = models.IntegerField(default=0)
	is_active = models.BooleanField(default=True)
	date_created = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return self.session_id
	
	def update_score(self, player, score):
		if player == 1:
			self.player1_score += score
		elif player == 2:
			self.player2_score += score
		self.save()

	def end_game_session(self):
		self.is_active = False
		self.save()

	def get_game_state(self):
		return {
			'player1': self.player1.username,
			'player2': self.player2.username,
			'player1_score': self.player1_score,
			'player2_score': self.player2_score,
			'is_active': self.is_active
		}


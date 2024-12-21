import shortuuid
from django.db import models
from a_user.models import Account


class GameSession(models.Model):
	game_id = models.CharField(max_length=64, default=shortuuid.uuid, unique=True)
	number_of_players = models.IntegerField(default=1, choices=[(0, 'AI'), (1, 'Single'), (2, 'Multi_2'), (3, 'Multi_3'), (4, 'Multi_4')])
	player1 = models.ForeignKey(Account, on_delete=models.CASCADE, related_name="player1", null=True, blank=True)
	player2 = models.ForeignKey(Account, on_delete=models.CASCADE, related_name="player2", null=True, blank=True)
	player3 = models.ForeignKey(Account, on_delete=models.CASCADE, related_name="player3", null=True, blank=True)
	player4 = models.ForeignKey(Account, on_delete=models.CASCADE, related_name="player4", null=True, blank=True)
	score1 = models.IntegerField(default=0)
	score2 = models.IntegerField(default=0)
	score3 = models.IntegerField(default=0)
	score4 = models.IntegerField(default=0)
	created_at = models.DateTimeField(auto_now_add=True)
	is_active = models.BooleanField(default=True)
	winner = models.ForeignKey(Account, on_delete=models.CASCADE, related_name="winner", null=True, blank=True)
 
	def __str__(self):
		return self.game_id
	
	def get_role(self, user):
		if self.player1 == user:
			return 'player1'
		elif self.player2 == user:
			return
		elif self.player3 == user:
			return 'player3'
		elif self.player4 == user:
			return 'player4'
		else:
			return None


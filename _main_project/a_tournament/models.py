from django.db import models
from a_user.models import Account
import shortuuid
from django.core.validators import MaxValueValidator

from django.db.models.signals import m2m_changed
from django.dispatch import receiver
from channels.generic.websocket import WebsocketConsumer

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

# import time

REQUIRED_NB_PLAYERS = 2

# tournament_ids = set()

class Tournament(models.Model):
    tournament_name = models.CharField(max_length=128, unique=True, default=shortuuid.uuid)
    players = models.ManyToManyField(Account, related_name='tournaments', blank=True)
    nb_players = models.IntegerField(default=0, editable=True, validators=[MaxValueValidator(REQUIRED_NB_PLAYERS)])
    winner = models.ForeignKey(Account, related_name='tournaments_won', blank=True, null=True, on_delete=models.SET_NULL)
    created = models.DateTimeField(auto_now_add=True)


    # def add_tournament_id(self):
    #     tournament_ids.add(self.tournament_name) 
        

    def __str__(self):
        return self.tournament_name

    def updateNbPlayers(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.nb_players = self.players.count()
        super().save(*args, **kwargs)

    def clean(self):
        if self.players.count() != NB_PLAYERS:
            raise ValidationError(f'The number of players must be exactly {NB_PLAYERS}.')

    class Meta:
        ordering = ['-created']

    def create_matches(self):
        players = list(self.players.all())
        matches = []
        for i in range(0, len(players), 2):
            if i+1 < len(players):
                match = Match.objects.create(tournament=self, player1=player[i], player2=players[i+1])
                matches.append(match)
        return matches

    # def update_players_with_winners
    #     winners = []
    #     for match in self.matches

# @receiver(m2m_changed, sender=Tournament.players.through)
# def check_players_count(sender, instance, **kwargs):
#     if instance.players.count() == REQUIRED_NB_PLAYERS:
#         channel_layer = get_channel_layer()

#         # time.sleep(5)

#         async_to_sync(channel_layer.group_send)(
#             f"tournament_{instance.tournament_name}",
#             {
#                 'type': 'full_lobby',
#                 'message': "The lobby is full. The game will start soon.",
#             }
#         )


class AllTournaments(models.Model):
    tournaments = models.ManyToManyField(Tournament, related_name='all_tournaments')
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return ', '.join([tournament.tournament_name for tournament in self.tournaments.all()])

    class Meta:
        ordering = ['-created']

class Match(models.Model):
    tournament = models.ForeignKey(Tournament, related_name='matches', on_delete=models.CASCADE)
    player1 = models.ForeignKey(Account, related_name='matches_as_player1', on_delete=models.CASCADE)
    player2 = models.ForeignKey(Account, related_name='matches_as_player2', on_delete=models.CASCADE)
    winner = models.ForeignKey(Account, related_name='matches_won', blank=True, null=True, on_delete=models.SET_NULL)
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.player1.username} vs {self.player2.username}'

    class Meta:
        ordering = ['-created']


class TournamentMessage(models.Model):
	tournament_room = models.ForeignKey(Tournament, related_name='tournament_messages', on_delete=models.CASCADE,)
	msg_content = models.CharField(max_length=512)
	created = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f'{self.msg_content}'
	
	class Meta:
		ordering = ['-created']


from django.db import models
from a_user.models import Account
import shortuuid
from django.core.validators import MaxValueValidator

from django.db.models.signals import m2m_changed
from django.dispatch import receiver
from channels.generic.websocket import WebsocketConsumer

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

# from .utils import create_round_1_matches

from django.http import Http404, JsonResponse, HttpRequest
from django.shortcuts import get_object_or_404

import json

from a_game.views import GameSession, create_game_with_2_players_internal


REQUIRED_NB_PLAYERS = 4


class Tournament(models.Model):
	tournament_name = models.CharField(max_length=128, unique=True, default=shortuuid.uuid)
	players = models.ManyToManyField(Account, related_name='tournaments', blank=True)
	nb_players = models.IntegerField(default=0, editable=True, validators=[MaxValueValidator(REQUIRED_NB_PLAYERS)])
	winner = models.ForeignKey(Account, related_name='tournaments_won', blank=True, null=True, on_delete=models.SET_NULL)
	created = models.DateTimeField(auto_now_add=True)
	round_1 = models.ForeignKey('Round_1', related_name='tournament_round_1', blank=True, null=True, on_delete=models.SET_NULL)
	round_2 = models.ForeignKey('Round_2', related_name='tournament_round_2', blank=True, null=True, on_delete=models.SET_NULL)

	def __str__(self):
		return self.tournament_name

	def updateNbPlayers(self, *args, **kwargs):
		super().save(*args, **kwargs)
		self.nb_players = self.players.count()
		super().save(*args, **kwargs)

		# if (self.nb_players == REQUIRED_NB_PLAYERS):
		# 	print('[MAX NB PLAYERS REACHED] creating round 1 matches')
		# 	self.create_round_1_matches()


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


	#create the first round of the tournament
	def create_round_1_matches(self):
		tournament_name = self.tournament_name
		if not self.round_1:
			round_1 = Round_1.objects.create(tournament=self)
			self.round_1 = round_1
			self.save()

		for player in self.players.all():
			self.round_1.players.add(player)

		player_names = [player.username for player in self.round_1.players.all()]

		game_session_1, status_1 = create_game_with_2_players_internal(player_names[0], player_names[1])
		game_session_2, status_2 = create_game_with_2_players_internal(player_names[2], player_names[3])

		if not isinstance(game_session_1, GameSession):
			raise ValueError("game_session_1 must be a GameSession instance")
		if not isinstance(game_session_2, GameSession):
			raise ValueError("game_session_2 must be a GameSession instance")

		self.round_1.game_session_1 = game_session_1
		self.round_1.game_session_2 = game_session_2
		self.round_1.save()
		self.save()

		return 200


	def create_round_2_match(self):
		tournament_name = self.tournament_name
		if not self.round_2:
			round_2 = Round_2.objects.create(tournament=self)
			self.round_2 = round_2
			self.save()

		for player in self.round_1.winners.all():
			self.round_2.players.add(player)

		player_names = [player.username for player in self.round_2.players.all()]

		if (len(player_names) != 2):
			raise ValueError("Not enough players for round 2")

		game_session, status = create_game_with_2_players_internal(player_names[0], player_names[1])

		self.round_2.game_session = game_session
		self.round_2.save()
		self.save()

		return 200

class Match(models.Model):
	tournament = models.ForeignKey(Tournament, related_name='matches', on_delete=models.CASCADE)
	players = models.ManyToManyField(Account, related_name='Match_as_players', blank=True)
	winner = models.ForeignKey(Account, related_name='matches_won', blank=True, null=True, on_delete=models.SET_NULL)
	created = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f'{self.player1.username} vs {self.player2.username}'

	class Meta:
		ordering = ['-created']


# class TournamentMessage(models.Model):
# 	tournament_room = models.ForeignKey(Tournament, related_name='tournament_messages', on_delete=models.CASCADE,)
# 	msg_content = models.CharField(max_length=512)
# 	created = models.DateTimeField(auto_now_add=True)

# 	def __str__(self):
# 		return f'{self.msg_content}'
	
# 	class Meta:
# 		ordering = ['-created']


class Round_1(models.Model):
	tournament_name = models.ForeignKey(Tournament, related_name='round_1_as_tournament', on_delete=models.CASCADE)
	players = models.ManyToManyField(Account, related_name='round_1_as_players', blank=True)
	winners = models.ManyToManyField(Account, related_name='round_1_as_winners', blank=True)
	created = models.DateTimeField(auto_now_add=True)
	game_session_1 = models.ForeignKey(GameSession, related_name='round_1_as_game_session_1', blank=True, null=True, on_delete=models.SET_NULL)
	game_session_2 = models.ForeignKey(GameSession, related_name='round_1_as_game_session_2', blank=True, null=True, on_delete=models.SET_NULL)

	def __str__(self):
		return f'round_1 {self.tournament.tournament_name}'


class Round_2(models.Model):
	tournament_name = models.ForeignKey(Tournament, related_name='round_2_as_tournament', on_delete=models.CASCADE)
	players = models.ManyToManyField(Account, related_name='round_2_as_players', blank=True)
	winner = models.ForeignKey(Account, related_name='round_2_as_winner', blank=True, null=True, on_delete=models.SET_NULL)
	created = models.DateTimeField(auto_now_add=True)
	game_session = models.ForeignKey(GameSession, related_name='round_2_as_game_session', blank=True, null=True, on_delete=models.SET_NULL)

	def __str__(self):
		return f'round_2 {self.tournament.tournament_name}'



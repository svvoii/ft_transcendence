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

from a_game.views import GameSession, create_game_round_1_internal, create_game_round_2_internal


REQUIRED_NB_PLAYERS = 4


class Tournament(models.Model):
	tournament_name = models.CharField(max_length=128, unique=True, default=shortuuid.uuid)
	players = models.ManyToManyField(Account, related_name='tournaments', blank=True)
	winner = models.ForeignKey(Account, related_name='tournaments_won', blank=True, null=True, on_delete=models.SET_NULL)
	created = models.DateTimeField(auto_now_add=True)
	round_1 = models.ForeignKey('Round_1', related_name='tournament_round_1', blank=True, null=True, on_delete=models.SET_NULL)
	round_2 = models.ForeignKey('Round_2', related_name='tournament_round_2', blank=True, null=True, on_delete=models.SET_NULL)
	tournament_is_full = models.BooleanField(default=False)

	def __str__(self):
		return self.tournament_name


	def clean(self):
		if self.players.count() != NB_PLAYERS:
			raise ValidationError(f'The number of players must be exactly {NB_PLAYERS}.')

	class Meta:
		ordering = ['-created']

	def assign_players_to_round_1(self):
		if self.players.count() == REQUIRED_NB_PLAYERS:
			round_1 = self.round_1
			round_1.players.set(self.players.all())
			players = self.players.all()

			round_1.game_session_1.player1 = players[0]
			round_1.game_session_1.player2 = players[1]
			round_1.game_session_2.player1 = players[2]
			round_1.game_session_2.player2 = players[3]
			
			round_1.save()
			self.round_1 = round_1
			self.save()
			# self.tournament_is_full = True


	def create_round_1_matches(self):
		tournament_name = self.tournament_name
		if not self.round_1:
			round_1 = Round_1.objects.create(tournament=self)
			self.round_1 = round_1
			self.save()

		game_session_1, status_1 = create_game_round_1_internal()
		game_session_2, status_2 = create_game_round_1_internal()


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

		game_session, status = create_game_round_2_internal()

		self.round_2.game_session = game_session
		self.round_2.save()
		self.save()

		return 200

	def get_standings(self):
		r1_player_names = [player.username for player in self.round_1.players.all()]

		r2_player_names = ['', '']
		if (self.round_2.player1 and self.round_2.player2):
			r2_player_names = [self.round_2.player1.username, self.round_2.player2.username]

		if self.winner:
			winner = self.winner.username
		else:
			winner = ''

		standings = {
			'user1round1': r1_player_names[0],
			'user2round1': r1_player_names[1],
			'user3round1': r1_player_names[2],
			'user4round1': r1_player_names[3],
			'user1round2': r2_player_names[0],
			'user2round2': r2_player_names[1],
			'userWinner': winner,
		}
		return standings


class Round_1(models.Model):
	tournament_name = models.ForeignKey(Tournament, related_name='round_1_as_tournament', on_delete=models.CASCADE)
	players = models.ManyToManyField(Account, related_name='round_1_as_players', blank=True)
	winners = models.ManyToManyField(Account, related_name='round_1_as_winners', blank=True)
	created = models.DateTimeField(auto_now_add=True)
	game_session_1 = models.ForeignKey(GameSession, related_name='round_1_as_game_session_1', blank=True, null=True, on_delete=models.SET_NULL)
	game_session_2 = models.ForeignKey(GameSession, related_name='round_1_as_game_session_2', blank=True, null=True, on_delete=models.SET_NULL)
	countdowns_finished = models.ManyToManyField(Account, related_name='countdowns_1_finished', blank=True)

	def __str__(self):
		return f'round_1 {self.tournament.tournament_name}'


class Round_2(models.Model):
	tournament_name = models.ForeignKey(Tournament, related_name='round_2_as_tournament', on_delete=models.CASCADE)
	# players = models.ManyToManyField(Account, related_name='round_2_as_players', blank=True)
	player1 = models.ForeignKey(Account, on_delete=models.CASCADE, related_name="round_2_player1", null=True, blank=True)
	player2 = models.ForeignKey(Account, on_delete=models.CASCADE, related_name="round_2_player2", null=True, blank=True)

	winner = models.ForeignKey(Account, related_name='round_2_as_winner', blank=True, null=True, on_delete=models.SET_NULL)
	created = models.DateTimeField(auto_now_add=True)
	game_session = models.ForeignKey(GameSession, related_name='round_2_as_game_session', blank=True, null=True, on_delete=models.SET_NULL)
	countdowns_finished = models.ManyToManyField(Account, related_name='countdowns_2_finished', blank=True)

	def __str__(self):
		return f'round_2 {self.tournament.tournament_name}'


import json
from django.shortcuts import get_object_or_404
from asgiref.sync import async_to_sync, sync_to_async
from channels.generic.websocket import WebsocketConsumer # , AsyncronousWebsocketConsumer
from .models import Tournament, REQUIRED_NB_PLAYERS
from a_user.models import Account
# from .utils import create_round_1_matches

from django.db import transaction

class TournamentLobbyConsumer(WebsocketConsumer):
	user_finished_countdown_round_1 = False
	user_finished_countdown_round_2 = False
	# clients = {}

	def connect(self):
		self.tournament_name = self.scope['url_route']['kwargs']['tournament_name']
		self.room = get_object_or_404(Tournament, tournament_name=self.tournament_name)
		self.room_group_name = f"tournament_{self.tournament_name}"
		self.user = get_object_or_404(Account, username=self.scope['user'].username)
		self.tournament = get_object_or_404(Tournament, tournament_name=self.tournament_name)

		async_to_sync(self.channel_layer.group_add)(
			self.room_group_name,
			self.channel_name
		)
		self.accept()

		# if self.room_group_name not in TournamentLobbyConsumer.clients:
		# 	TournamentLobbyConsumer.clients[self.room_group_name] = []
		# TournamentLobbyConsumer.clients[self.room_group_name].append(self.channel_name)


	def disconnect(self, code):
		async_to_sync(self.channel_layer.group_discard)(
			self.room_group_name,
			self.channel_name
		)
		
		# if self.room_group_name in TournamentLobbyConsumer.clients:
		# 	TournamentLobbyConsumer.clients[self.room_group_name].remove(self.channel_name)
		# 	if not TournamentLobbyConsumer.clients[self.room_group_name]:
		# 		del TournamentLobbyConsumer.clients[self.room_group_name]

		players = self.room.players.all()
		player_names = [player.username for player in players]
		last_player_name = player_names[-1] if player_names else None

		async_to_sync(self.channel_layer.group_send)(
			self.room_group_name,
			{
				'type': 'player_leaving_tournament',
				'message': 'A player has left the tournament lobby',
				'player_names': player_names,
				'max_nb_players_reached': len(player_names) == REQUIRED_NB_PLAYERS,
				'last_player_name': last_player_name,
			}
		)


	def receive(self, text_data):
		text_data_json = json.loads(text_data)
		message = text_data_json.get('message')
		message_type = text_data_json.get('type')
		tournamentID = text_data_json.get('tournamentID')

		players = self.room.players.all()
		player_names = [player.username for player in players]
		last_player_name = player_names[-1] if player_names else None

		if (message_type == 'add_player_to_tournament'):
			add_player_to_tournament(self.user, tournamentID)
			async_to_sync(self.channel_layer.group_send) (
				self.room_group_name,
				{
					'message': 'Add player to tournament.',
					'type': message_type,
					'tournamentID': tournamentID
				}
			)
		elif (message_type == 'new_player' and len(player_names) < REQUIRED_NB_PLAYERS):
			async_to_sync(self.channel_layer.group_send) (
				self.room_group_name,
				{
					'type': 'new_player',
					'message': 'A new player has entered the lobby',
					'player_names': player_names,
					'max_nb_players_reached': len(player_names) == REQUIRED_NB_PLAYERS,
					'last_player_name': last_player_name,
				}
			)

		elif (message_type == 'new_player' and len(player_names) == REQUIRED_NB_PLAYERS):
			user_game_id = get_game_id_round_1(self.user, self.tournament_name)
			if not self.user_finished_countdown_round_1:
				self.user_finished_countdown_round_1 = True
				async_to_sync(self.channel_layer.group_send)(
					self.room_group_name,
					{
						'type': 'start_round_1',
						'message': 'Round 1 has started',
						'player_names': player_names,
						'game_id': user_game_id,
					}
				)
			# # some check for if were in round 2
			# 	async_to_sync(self.channel_layer.group_send)(
			# 		self.room_group_name,
			# 		{
			# 			'type': 'start_round_2',
			# 			'message': 'Round 1 has started',
			# 			'player_names': player_names,
			# 			'game_id': user_game_id,
			# 		}
			# 	)

		elif (message_type == 'game_finished'):
			async_to_sync(self.channel_layer.group_send)(
				self.room_group_name,
				{
					'type': 'game_finished',
					'game_index': text_data_json.get('game_index'),
					'player_names': player_names,
					'winner': text_data_json.get('winner'),
				}
			)
			
		elif (message_type == 'start_round_2'):
			if not self.user_finished_countdown_round_2:
				self.user_finished_countdown_round_2 = True
			user_game_id = get_game_id_round_2(self.user, self.tournament_name)
			countdown_finished = self.tournament.round_2.countdowns_finished.filter(username=self.user.username).exists()

			self.send(text_data=json.dumps({
				'type': 'start_round_2',
				'message': 'Round_2 has started',
				'player_names': [self.tournament.round_2.player1.username, self.tournament.round_2.player2.username],
				'game_id': user_game_id,
				'countdown_finished': countdown_finished,
			}))


		elif (message_type == 'round_1_countdown_finished'):
			self.round_1_countdown_finished(self.tournament_name);
		
		elif (message_type == 'round_2_countdown_finished'):
			self.round_2_countdown_finished(self.tournament_name);


	def add_player_to_tournament(self, event):
		message = event['message']
		tournamentID = event['tournamentID']
		self.send(text_data=json.dumps({
			'type': event['type'],
			'message': 'Add player to tournament.',
			'tournamentID': tournamentID
		}))

	def new_player(self, event):
		message = event['message']
		player_names = event['player_names']
		max_nb_players_reached = event['max_nb_players_reached']
		last_player_name = event['last_player_name']
		self.send(text_data=json.dumps({
			'type': 'new_player',
			'message': message,
			'player_names': player_names,
			'max_nb_players_reached': max_nb_players_reached,
			'last_player_name': last_player_name,
		}))

	def start_round_1(self, event):
		# tournament = get_object_or_404(Tournament, tournament_name=self.tournament_name)

		player_names = [player.username for player in self.tournament.players.all()]

		game_id = None

		if self.user.username in [player_names[0], player_names[1]]:
			game_id = self.tournament.round_1.game_session_1.game_id
		elif self.user.username in [player_names[2], player_names[3]]:
			game_id = self.tournament.round_1.game_session_2.game_id

		message = event['message']
		player_names = event['player_names']
		countdown_finished = self.tournament.round_1.countdowns_finished.filter(username=self.user.username).exists()

		self.send(text_data=json.dumps({
			'type': 'start_round_1',
			'message': message,
			'player_names': player_names,
			'game_id': game_id,
			'countdown_finished': countdown_finished,
			'standings' : self.tournament.get_standings(),
		}))
	
	def round_1_countdown_finished(self, tournament_name):
		# tournament = get_object_or_404(Tournament, tournament_name=tournament_name)
		self.tournament.round_1.countdowns_finished.add(self.user)
		self.tournament.save()

	def round_2_countdown_finished(self, tournament_name):
		# tournament = get_object_or_404(Tournament, tournament_name=tournament_name)
		self.tournament.round_2.countdowns_finished.add(self.user)
		self.tournament.save()

	def game_finished(self, event):
		game_index = event['game_index']
		winner_name = event['winner']
		player_names = event['player_names']
		winner = get_object_or_404(Account, username=winner_name)
		self.tournament = get_object_or_404(Tournament, tournament_name=self.tournament_name)

		round_1 = self.tournament.round_1
		round_2 = self.tournament.round_2

		if game_index == 'round_1_game_1' and not round_1.winners.filter(username=winner_name).exists():
			round_1.winners.add(winner)
			round_2.player1 = winner
			round_2.game_session.player1 = winner
		elif game_index == 'round_1_game_2' and not round_1.winners.filter(username=winner_name).exists():
			round_1.winners.add(winner)
			round_2.player2 = winner
			round_2.game_session.player2 = winner
		elif game_index == 'round_2_game':
			if not round_2.winner:
				round_2.winner = winner
				self.tournament.winner = winner

		round_1.save()
		round_2.save()
		self.tournament.save()

		ready_for_round_2 = round_1.winners.count() == 2

		if not self.tournament.round_2.winner:
			self.send(text_data=json.dumps({
				'type': 'game_finished',
				'game_index': game_index,
				'winner': winner_name,
				'standings' : self.tournament.get_standings(),
				'ready_for_round_2': ready_for_round_2,	
			}))
		elif self.tournament.round_2.winner:
			self.send(text_data=json.dumps({
				'type': 'game_finished',
				'game_index': game_index,
				'winner': winner_name,
				'standings' : self.tournament.get_standings(),
				'ready_for_round_2': False,
			}))



	def player_leaving_tournament(self, event):
		message = event['message']
		player_names = event['player_names']
		max_nb_players_reached = event['max_nb_players_reached']
		last_player_name = event['last_player_name']
		self.send(text_data=json.dumps({
			'type': event['type'],
			'message': message,
			'player_names': player_names,
			'max_nb_players_reached': max_nb_players_reached,
			'last_player_name': last_player_name,
		}))


def add_player_to_tournament(user, tournament_name):
	if Tournament.objects.filter(tournament_name=tournament_name).exists():
		tournament = get_object_or_404(Tournament, tournament_name=tournament_name)

		if not tournament.players.filter(username=user.username).exists():
			tournament.players.add(user)

		players = [player.username for player in tournament.players.all()]
		nb_players = f'{len(players)}'
		max_nb_players_reached = int(nb_players) == REQUIRED_NB_PLAYERS

		if max_nb_players_reached: # and user.username == players[-1]:
			# tournament.tournament_is_full = True
			tournament.assign_players_to_round_1()

		return True
	return False
	

def get_game_id_round_1(user, tournament_name):
	user_game_id = None

	if Tournament.objects.filter(tournament_name=tournament_name).exists():
		tournament = get_object_or_404(Tournament, tournament_name=tournament_name)

		player_names = [player.username for player in tournament.players.all()]


		if not (tournament.round_1.game_session_1 or tournament.round_1.game_session_2):
			print('[DEBUG] Round_1 NOT CREATED')

		if (len(player_names) == 4):
			if user.username in [player_names[0], player_names[1]]:
				user_game_id = tournament.round_1.game_session_1.game_id
			elif user.username in [player_names[2], player_names[3]]:
				user_game_id = tournament.round_1.game_session_2.game_id

	return user_game_id


def get_game_id_round_2(user, tournament_name):
	user_game_id = None

	if Tournament.objects.filter(tournament_name=tournament_name).exists():
		tournament = get_object_or_404(Tournament, tournament_name=tournament_name)

		if (tournament.round_2.player1 and tournament.round_2.player2):
			user_game_id = tournament.round_2.game_session.game_id

	return user_game_id



# def update_round_1_winners(tournament_name, winner_name):
# 	if Tournament.objects.filter(tournament_name=tournament_name).exists():
# 		tournament = get_object_or_404(Tournament, tournament_name=tournament_name)
# 		if Account.objects.filter(username=winner_name).exists():
# 			winner = get_object_or_404(Account, username=winner_name)

# 			round_1 = tournament.round_1
# 			round_1.winners.add(winner)
# 			round_1.save()

def player_is_already_in_tournament(tournament_name, player_name):
	if Tournament.objects.filter(tournament_name=tournament_name).exists():
		tournament = get_object_or_404(Tournament, tournament_name=tournament_name)
		if Account.objects.filter(username=player_name).exists():
			player = get_object_or_404(Account, username=player_name)
			if player in tournament.players.all():
				print("player is in the tournament")
				return True
		print("player is not in the tournament")
	return False

import datetime

def printwt(message):
    print(f"{datetime.datetime.now()}: {message}")

import json
from django.shortcuts import get_object_or_404
from asgiref.sync import async_to_sync, sync_to_async
from channels.generic.websocket import WebsocketConsumer # , AsyncronousWebsocketConsumer
from .models import Tournament, REQUIRED_NB_PLAYERS
from a_user.models import Account
# from .utils import create_round_1_matches

from django.db import transaction

class TournamentLobbyConsumer(WebsocketConsumer):
	# clients = {}

	def connect(self):
		self.tournament_name = self.scope['url_route']['kwargs']['tournament_name']
		self.room = get_object_or_404(Tournament, tournament_name=self.tournament_name)
		self.room_group_name = f"tournament_{self.tournament_name}"
		
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
		message_type = text_data_json.get('type')
		players = self.room.players.all()
		player_names = [player.username for player in players]
		last_player_name = player_names[-1] if player_names else None

		# if len(player_names) == REQUIRED_NB_PLAYERS:
		# 	create_round_1_matches(self.tournament_name)
		# print('HAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA')
		# print(f"Received message: {text_data_json}")

		if (message_type == 'new_player' and len(player_names) < REQUIRED_NB_PLAYERS):
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
			if not sync_to_async(player_is_already_in_tournament)(self.tournament_name, text_data_json.get('player_name')):
				print("sending a message to everyone that it's time to start round 1")
				async_to_sync(self.channel_layer.group_send)(
					self.room_group_name,
					{
						'type': 'start_round_1',
						'message': 'Round 1 has started',
						'player_names': player_names,
					}
				)
			else: #making sure the player comes back to the game if they refresh the page
				print("just sending a message to the person who refreshed the page")
				self.send(
					text_data=json.dumps({
						'type': 'start_round_1',
						'message': 'Round 1 has started',
						'player_names': player_names,
					})
				)

		elif (message_type == 'game_finished'):
			async_to_sync(self.channel_layer.group_send)(
				self.room_group_name,
				{
					'type': 'game_finished',
					'game_index': text_data_json.get('game_index'),
					'winner': text_data_json.get('winner'),
				}
			)
			##### possible fix to start round 2
			if text_data_json.get('game_index') == 'round_1_game_1' or 'round_1_game_2':
			# 	# add winner to round 1 winners list
				print("updating round 1 winners")
				update_round_1_winners(self.tournament_name, text_data_json.get('winner'))
				if Tournament.objects.filter(tournament_name=self.tournament_name).exists():
					tournament = get_object_or_404(Tournament, tournament_name=self.tournament_name)
					print("winners in round_1.winners are: ", tournament.round_1.winners.all())
			# 	if (tournament.round_1.winners.count() == 2):
			# 		async_to_sync(self.channel_layer.group_send)(
			# 			self.room_group_name,
			# 			{
			# 				'type': 'start_round_2',
			# 				'message': 'Round 2 has started',
			# 				'player_names': player_names,
			# 			}
			# 		)
			# elif text_data_json.get('game_index') == r'round_2*':
				# update round_2 in the db




			# game_index = text_data_json.get('game_index')
			
		# elif (message_type == 'start_round_2'):
		# 	async_to_sync(self.channel_layer.group_send)(
		# 		self.room_group_name,
		# 		{
		# 			'type': 'start_round_2',
		# 			'message': 'Round 2 has started',
		# 			'player_names': player_names,
		# 		}
		# 	)

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
		message = event['message']
		player_names = event['player_names']
		self.send(text_data=json.dumps({
			'type': 'start_round_1',
			'message': message,
			'player_names': player_names,
		}))

	def game_finished(self, event):
		game_index = event['game_index']
		winner = event['winner']
		self.send(text_data=json.dumps({
			'type': 'game_finished',
			'game_index': game_index,
			'winner': winner,
		}))

	# def start_round_2(self, event):
	# 	message = event['message']
	# 	player_names = event['player_names']
	# 	self.send(text_data=json.dumps({
	# 		'type': 'start_round_2',
	# 		'message': message,
	# 		'player_names': player_names,
	# 	}))


	# def list_clients(self):
	# 	return TournamentLobbyConsumer.clients.get(self.room_group_name, [])

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


def update_round_1_winners(tournament_name, winner_name):
	if Tournament.objects.filter(tournament_name=tournament_name).exists():
		tournament = get_object_or_404(Tournament, tournament_name=tournament_name)
		if Account.objects.filter(username=winner_name).exists():
			winner = get_object_or_404(Account, username=winner_name)

			round_1 = tournament.round_1
			round_1.winners.add(winner)
			round_1.save()
			# tournament.save()

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
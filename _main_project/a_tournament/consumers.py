
import json
from django.shortcuts import get_object_or_404
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from .models import Tournament, REQUIRED_NB_PLAYERS
from .utils import create_round_1_matches

class TournamentLobbyConsumer(WebsocketConsumer):
	clients = {}

	def connect(self):
		self.tournament_name = self.scope['url_route']['kwargs']['tournament_name']
		self.room = get_object_or_404(Tournament, tournament_name=self.tournament_name)
		self.room_group_name = f"tournament_{self.tournament_name}"
		


		async_to_sync(self.channel_layer.group_add)(
			self.room_group_name,
			self.channel_name
		)
		self.accept()

		if self.room_group_name not in TournamentLobbyConsumer.clients:
			TournamentLobbyConsumer.clients[self.room_group_name] = []
		TournamentLobbyConsumer.clients[self.room_group_name].append(self.channel_name)



	def disconnect(self, code):
		async_to_sync(self.channel_layer.group_discard)(
			self.room_group_name,
			self.channel_name
		)
		
		if self.room_group_name in TournamentLobbyConsumer.clients:
			TournamentLobbyConsumer.clients[self.room_group_name].remove(self.channel_name)
			if not TournamentLobbyConsumer.clients[self.room_group_name]:
				del TournamentLobbyConsumer.clients[self.room_group_name]

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
		players = self.room.players.all()
		player_names = [player.username for player in players]
		last_player_name = player_names[-1] if player_names else None

		if len(player_names) == REQUIRED_NB_PLAYERS:
			create_round_1_matches(self.tournament_name)

		async_to_sync(self.channel_layer.group_send)(
			self.room_group_name,
			{
				'type': 'new_player',
				'message': 'A new player has entered the lobby',
				'player_names': player_names,
				'max_nb_players_reached': len(player_names) == REQUIRED_NB_PLAYERS,
				'last_player_name': last_player_name,
			}
		)

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

	# def full_lobby(self, event):
	# 	message = event['message']

	# 	self.send(text_data=json.dumps({
	# 		# 'type': event['type'],
	# 		'type': 'full_lobby',
	# 		'message': message,
	# 		'list_of_clients': self.list_clients(),
	# 	}))

	def list_clients(self):
		return TournamentLobbyConsumer.clients.get(self.room_group_name, [])

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

class TournamentLogicConsumer(WebsocketConsumer):

	def connect(self):
		self.tournament_name = self.scope['url_route']['kwargs']['tournament_name']
		self.room = get_object_or_404(Tournament, tournament_name=self.tournament_name)
		self.room_group_name = f"tournament_{self.tournament_name}"
		
		async_to_sync(self.channel_layer.group_add)(
			self.room_group_name,
			self.channel_name
		)
		self.accept()


	def disconnect(self, code):
		async_to_sync(self.channel_layer.group_discard)(
			self.room_group_name,
			self.channel_name
		)

		# players = self.room.players.all()
		# player_names = [player.username for player in players]

		# async_to_sync(self.channel_layer.group_send)(
		# 	self.room_group_name,
		# 	{
		# 		'type': 'player_leaving_tournament',
		# 		'message': 'A player has left the tournament lobby',
		# 		'player_names': player_names,
		# 		'max_nb_players_reached': len(player_names) == REQUIRED_NB_PLAYERS,
		# 		'last_player_name': last_player_name,
		# 	}
		# )


	def receive(self, text_data):
		text_data_json = json.loads(text_data)
		players = self.room.players.all()
		player_names = [player.username for player in players]

		
		# async_to_sync(self.channel_layer.group_send)(
		# 	self.room_group_name,
		# 	{
		# 		'type': 'new_player',
		# 		'message': 'A new player has entered the lobby',
		# 		'player_names': player_names,
		# 		'max_nb_players_reached': len(player_names) == REQUIRED_NB_PLAYERS,
		# 		'last_player_name': last_player_name,
		# 	}
		# )
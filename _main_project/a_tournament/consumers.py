
import json
from django.shortcuts import get_object_or_404
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from .models import Tournament

class TournamentLobbyConsumer(WebsocketConsumer):
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
        pass

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        #######################################################
        # Check if the message says that all players are ready#


        game_room_url = f"/game/{self.room.tournament_name}"

        self.send(text_data=json.dumps({
            'message': f"Welcome to the hunger pongs. Room ID : {game_room_url}"
        }))

        #generate N/2 rooms links
        #send the links to the players
        #draw the tree

        #######################################################

    def send_message(self, message):
        self.send(text_data=json.dumps({
            'message': "Let me decide who goes first."
        }))
    


	# def chat_message(self, event):
	# 	message = event['message']
	# 	user = event['user']

	# 	self.send(text_data=json.dumps({
	# 		'message': message,
	# 		'user': user,
	# 	}))

	# def update_online_count(self):
	# 	async_to_sync(self.channel_layer.group_send)(
	# 		self.room_name,
	# 		{
	# 			'type': 'online_count',
	# 			'count': self.room.users_online.count(),
	# 		}
	# 	)

	# def online_count(self, event):
	# 	count = event['count']

	# 	self.send(text_data=json.dumps({
	# 		'online_count': count,
	# 	}))


class TournamentNewPlayerConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()

    def disconnect(self):
        pass

    def receive(self, text_data):
        self.send(text_data=json.dumps({
            'type': 'new_player',
        }))
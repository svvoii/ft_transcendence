import json
import asyncio
import pickle
from django.core.cache import cache
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import GameSession
from .game_logic import GameState, FPS

# `game_tasks` is a dictionary that stores the game loop task for each game_id.
# This way there is only one task to run the game loop for each game_id.
game_tasks = {}

# ready_players will store the list of players who are ready to play for each game_id
ready_players = {}


MODE_TO_STR = {0: 'AI', 1: 'Single', 2: 'Multi_2', 3: 'Multi_3', 4: 'Multi_4'}

@database_sync_to_async
def get_game_state_from_db(game_id):
	active_session = GameSession.objects.filter(game_id=game_id, is_active=True).first()
	if active_session:
		game_state = GameState()
		game_state.game_mode = MODE_TO_STR.get(active_session.mode, 'Single')
		game_state.num_players = active_session.mode
		game_state.score1 = active_session.score1
		game_state.score2 = active_session.score2
		game_state.score3 = active_session.score3
		game_state.score4 = active_session.score4
		return game_state
	return None

async def load_game_state(game_id):
	cached_game_state = cache.get(game_id)
	if cached_game_state is None:
		print(f"Game state not found for game_id: {game_id}. Loading from the database...")
		game_state = await get_game_state_from_db(game_id)
		if game_state:
			cache.set(game_id, pickle.dumps(game_state))
		return game_state
	return pickle.loads(cached_game_state)


class PongConsumer(AsyncWebsocketConsumer):

	async def connect(self):
		self.game_id = self.scope["url_route"]["kwargs"]["game_id"]
		self.game_group_name = f"pong_{self.game_id}"

		# Get the game state for the game_id
		# cached_game_state = cache.get(self.game_id)
		# if cached_game_state is None:
		self.game_state = await load_game_state(self.game_id)
		if self.game_state is None:
			print(f"Game state not found for game_id: {self.game_id}")
			await self.close()
			return
		
		# self.game_state = pickle.loads(cached_game_state)

		# DEBUG #
		# print(f"Retrieved game state for game_id: {self.game_id}: {self.game_state}")
		# print(f"Type of game_state: {type(self.game_state)}")
		# print(f"Attributes of game_state: {self.game_state.__dict__}")

		self.mode = self.game_state.game_mode
		self.num_players = self.game_state.num_players

		# DEBUG #
		# print(f"...WebSocket, game_id: {self.game_id}, mode: {self.mode}, num_players: {self.num_players}")

		await self.channel_layer.group_add(
            self.game_group_name,
            self.channel_name
        )

		await self.accept()


	async def disconnect(self, close_code):
		await self.channel_layer.group_discard(
            self.game_group_name,
			self.channel_name
		)

		# Remove the player from the ready players list
		if self.game_id in ready_players:
			if self.channel_name in ready_players[self.game_id]:
				ready_players[self.game_id].remove(self.channel_name)
			if not ready_players[self.game_id]:
				del ready_players[self.game_id]

		if self.game_id in game_tasks:
			game_tasks[self.game_id].cancel()
			del game_tasks[self.game_id]


	async def receive(self, text_data):
		data = json.loads(text_data)
		message_type = data.get("type")
		# number_of_players = data.get("number_of_players")

		if message_type == "get_initial_state":
			# DEBUG #
			print(f"Inital state requested via WebSocket for game_id: {self.game_id}")

			await self.send(text_data=json.dumps({
				"type": "initial_state",
				"state": self.game_state.get_state(),
			}))

		if message_type == "player_ready":
			if self.game_id not in ready_players:
				ready_players[self.game_id] = []
			ready_players[self.game_id].append(self.channel_name)

			# if len(ready_players[self.game_id]) == number_of_players or self.mode == 'Single':
			if len(ready_players[self.game_id]) >= self.num_players:
				if self.game_id not in game_tasks:
					game_tasks[self.game_id] = asyncio.create_task(self.game_loop())
					print("Game loop started..")
			else:
				print("Waiting for another player to get ready..")

	# This is called from the views.py file when the user clicks the quit button
	async def game_quit(self, event):
		message = event["message"]
		await self.send(text_data=json.dumps({
			"type": "game_quit",
			"message": message,
		}))

	async def game_loop(self):
		while not self.game_state.game_over:
			
			cached_game_state = cache.get(self.game_id)
			if cached_game_state is None:
				print(f"Game state not found for game_id: {self.game_id}")
				await self.end_game()
				return
			else:
				self.game_state = pickle.loads(cached_game_state)
   
			self.game_state.update()

			await self.channel_layer.group_send(
				self.game_group_name,
                {
                    "type": "update_state",
                    "ball_x": self.game_state.ball_x,
                    "ball_y": self.game_state.ball_y,
					"score1": self.game_state.score1,
					"score2": self.game_state.score2,
					"score3": self.game_state.score3,
					"score4": self.game_state.score4,
					"paddle1": self.game_state.paddle1,
					"paddle2": self.game_state.paddle2,
					"paddle3": self.game_state.paddle3,
					"paddle4": self.game_state.paddle4,
                }
            )

			cache.set(self.game_id, pickle.dumps(self.game_state), timeout=None)

			await asyncio.sleep(1 / FPS)  # 60 FPS
		
		# Game over
		await self.end_game()
			

	async def update_state(self, event):
		ball_x = event["ball_x"]
		ball_y = event["ball_y"]
		score1 = event["score1"]
		score2 = event["score2"]
		score3 = event["score3"]
		score4 = event["score4"]
		paddle1 = event["paddle1"]
		paddle2 = event["paddle2"]
		paddle3 = event["paddle3"]
		paddle4 = event["paddle4"]

		# DEBUG #
		# print(f"Received update: paddle1: {paddle1}, paddle2: {paddle2}")

		await self.send(text_data=json.dumps({
			"type": "update_state",
			"ball_x": ball_x,
			"ball_y": ball_y, 
			"score1": score1,
			"score2": score2,
			"score3": score3,
			"score4": score4,
			"paddle1": paddle1,
			"paddle2": paddle2,
			"paddle3": paddle3,
			"paddle4": paddle4,
		}))

	# This will close the connection and end the game loop
	async def end_game(self):

		await self.channel_layer.group_send(
			self.game_group_name,
			{
				"type": "game_over",
				# "winner": self.game_state.winner,
				"winner": getattr(self.game_state, "winner", None),
			}
		)

		await self.channel_layer.group_discard(
			self.game_group_name,
			self.channel_name
		)
  
		if self.game_id in game_tasks:
			game_tasks[self.game_id].cancel()
			del game_tasks[self.game_id]


	async def game_over(self, event):
		winner = event["winner"]
		await self.send(text_data=json.dumps({
			"type": "game_over",
			"winner": winner,
		}))
		await self.close()

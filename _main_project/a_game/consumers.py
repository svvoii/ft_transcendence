import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from .game_logic import FPS, game_states, game_st_lock

# `game_tasks` is a dictionary that stores the game loop task for each game_id.
# This way there is only one task to run the game loop for each game_id.
game_tasks = {}

# ready_players will store the list of players who are ready to play for each game_id
ready_players = {}

class PongConsumer(AsyncWebsocketConsumer):

	async def connect(self):
		# global game_states
		self.game_id = self.scope["url_route"]["kwargs"]["game_id"]
		self.game_group_name = f"pong_{self.game_id}"

		async with game_st_lock:
			if self.game_id in game_states: # `game_states` is a dictionary declared in game_logic.py, it stores the game state for each game_id
				self.game_state = game_states[self.game_id]
				self.mode = game_states[self.game_id].game_mode # Getting game_mode from the game_states dictionary
				self.num_players = game_states[self.game_id].num_players
			else:
				await self.close()
				return

		await self.channel_layer.group_add(
            self.game_group_name,
            self.channel_name
        )

		await self.accept()

		# print(f"Sending game_mode to the player: {self.mode}")
		# # Send the initial game state to the player
		# await self.send(text_data=json.dumps({
		# 	"type": "game_mode",
		# 	"mode": self.mode,
		# }))

	async def disconnect(self, close_code):
		await self.channel_layer.group_discard(
            self.game_group_name,
			self.channel_name
		)

		# Remove the player from the ready players list
		if self.game_id in ready_players:
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

	async def game_loop(self):
		while not self.game_state.game_over:
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

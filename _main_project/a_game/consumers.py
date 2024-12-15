import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from .game_logic import game_states, FPS

# `game_tasks` is a dictionary that stores the game loop task for each game_id.
# This way there is only one task to run the game loop for each game_id.
game_tasks = {}

# connected players will store the list of connected players for each game_id
connected_players = {}

class PongConsumer(AsyncWebsocketConsumer):

	async def connect(self):
		global game_states
		self.game_id = self.scope["url_route"]["kwargs"]["game_id"]
		self.mode = self.scope["url_route"]["kwargs"]["mode"]
		self.game_group_name = f"pong_{self.game_id}"
        
		# `game_states` is a dictionary declared in game_logic.py, it stores the game state for each game_id
		# There should be only one GameState object per game_id
		if self.game_id in game_states:
			self.game_state = game_states[self.game_id]
		else:
			await self.close()
			return

		await self.channel_layer.group_add(
            self.game_group_name,
            self.channel_name
        )

		await self.accept()

		# Add the player to the connected players list
		if self.game_id not in connected_players:
			connected_players[self.game_id] = []
		connected_players[self.game_id].append(self.channel_name)

		if self.mode == 'multiplayer' and len(connected_players[self.game_id]) < 2:
			print("Waiting for another player to connect..")
		elif self.game_id in game_tasks:
			print("Game loop already started..")
		else:
			game_tasks[self.game_id] = asyncio.create_task(self.game_loop())
			print("Game loop started..")
			
		# if len(connected_players[self.game_id]) == 2 and self.game_id not in game_tasks:
		# 	game_tasks[self.game_id] = asyncio.create_task(self.game_loop())
		# 	print("Game loop started..")
		# else:
		# 	print("Waiting for another player to connect..")

		# if self.game_id not in game_tasks:
		# 	game_tasks[self.game_id] = asyncio.create_task(self.game_loop())
	
	async def disconnect(self, close_code):
		await self.channel_layer.group_discard(
            self.game_group_name,
			self.channel_name
		)

		# Remove the player from the connected players list
		if self.game_id in connected_players:
			connected_players[self.game_id].remove(self.channel_name)
			if not connected_players[self.game_id]:
				del connected_players[self.game_id]

		if self.game_id in game_tasks:
			game_tasks[self.game_id].cancel()
			del game_tasks[self.game_id]

	async def receive(self, text_data):
		pass

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
					# "winner": getattr(self.game_state, "winner", None),
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
		# winner = event["winner"]

		await self.send(text_data=json.dumps({
			"type": "update_state",
			"ball_x": ball_x,
			"ball_y": ball_y, 
			"score1": score1,
			"score2": score2,
			# "winner": winner,
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

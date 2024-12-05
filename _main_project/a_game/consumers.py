import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from .game_logic import game_states, FPS

# `game_tasks` is a dictionary that stores the game loop task for each game_id.
# This way there is only one task to run the game loop for each game_id.
game_tasks = {}

class PongConsumer(AsyncWebsocketConsumer):

	async def connect(self):
		global game_states
		self.game_id = self.scope["url_route"]["kwargs"]["game_id"]
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

		if self.game_id not in game_tasks:
			game_tasks[self.game_id] = asyncio.create_task(self.game_loop())
	
	async def disconnect(self, close_code):
		await self.channel_layer.group_discard(
            self.game_group_name,
			self.channel_name
		)

		if self.game_id in game_tasks:
			game_tasks[self.game_id].cancel()
			del game_tasks[self.game_id]

	async def receive(self, text_data):
		pass
        # data = json.loads(text_data)
        # key = data["key"]
        # player = data["role"]

        # if key == "up":
        #     self.game_state.move_paddle(player, -1)
        # elif key == "down":
        #     self.game_state.move_paddle(player, 1)

	async def game_loop(self):
		while True:
			self.game_state.update_ball_position()
			await self.channel_layer.group_send(
				self.game_group_name,
                {
                    "type": "ball_update",
                    "ball_x": self.game_state.ball_x,
                    "ball_y": self.game_state.ball_y,
                }
            )
			await asyncio.sleep(1 / FPS)  # 60 FPS

	async def ball_update(self, event):
		ball_x = event["ball_x"]
		ball_y = event["ball_y"]

		await self.send(text_data=json.dumps({
			"type": "ball_update",
			"ball_x": ball_x,
			"ball_y": ball_y
		}))

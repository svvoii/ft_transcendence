import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from . import models


CANVAS_WIDTH = 800
CANVAS_HEIGHT = 600
PADDLE_WIDTH = 10
PADDLE_HEIGHT = 100
PADDLE_SPEED = 10
BALL_WIDTH = 10
BALL_HEIGHT = 10
BALL_SPEED = 5
BALL_VELOCITY_X = 4
BALL_VELOCITY_Y = 4
FPS = 60

game_tasks = {}
game_states = {}


class GameState:
	def __init__(self):
		self.async_task = None
		self.paddle1 = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2
		self.paddle2 = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2
		self.ball_x = CANVAS_WIDTH / 2 - BALL_WIDTH / 2
		self.ball_y = CANVAS_HEIGHT / 2 - BALL_HEIGHT / 2
		self.ball_velocity_x = BALL_VELOCITY_X
		self.ball_velocity_y = BALL_VELOCITY_Y
	
	async def update_ball_position(self):
		self.ball_x += self.ball_velocity_x
		self.ball_y += self.ball_velocity_y

		# Check for collision with the top and bottom walls
		if self.ball_y <= 0 or self.ball_y >= CANVAS_HEIGHT - BALL_HEIGHT:
			self.ball_velocity_y *= -1

		# Check for collision with the paddles
		if self.ball_x <= PADDLE_WIDTH:
			if self.paddle1 <= self.ball_y <= self.paddle1 + PADDLE_HEIGHT:
				self.ball_velocity_x *= -1
			else:
				self.reset_ball()
		elif self.ball_x >= CANVAS_WIDTH - PADDLE_WIDTH - BALL_WIDTH:
			if self.paddle2 <= self.ball_y <= self.paddle2 + PADDLE_HEIGHT:
				self.ball_velocity_x *= -1
			else:
				self.reset_ball()

	def reset_ball(self):
		self.ball_x = CANVAS_WIDTH / 2 - BALL_WIDTH / 2
		self.ball_y = CANVAS_HEIGHT / 2 - BALL_HEIGHT / 2
		self.ball_velocity_x *= -1
		self.ball_velocity_y *= -1



class PongConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		self.game_id = self.scope["url_route"]["kwargs"]["game_id"]
		self.game_group_name = f"pong_{self.game_id}"
		
		if self.game_id not in game_states:
			game_states[self.game_id] = GameState()

		self.game_state = game_states[self.game_id]

		await self.channel_layer.group_add(
			self.game_group_name,
			self.channel_name
		)

		await self.accept()

		await self.channel_layer.group_send(
			self.game_group_name,
			{
				"type": "paddles_update",
				"paddle1": self.game_state.paddle1,
				"paddle2": self.game_state.paddle2,
			}
		)

		# Initialize the game loop
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
		data = json.loads(text_data)
		key = data["key"]
		player = data["role"]

		if key == "ArrowUp":
			if player == "player1":
				self.game_state.paddle1 = max(0, self.game_state.paddle1_y - PADDLE_SPEED)
			else:
				self.game_state.paddle2 = max(0, self.game_state.paddle2_y - PADDLE_SPEED)
		elif key == "ArrowDown":
			if player == "player1":
				self.game_state.paddle1 = min(CANVAS_HEIGHT - PADDLE_HEIGHT, self.game_state.paddle1_y + PADDLE_SPEED)
			else:
				self.game_state.paddle2 = min(CANVAS_HEIGHT - PADDLE_HEIGHT, self.game_state.paddle2_y + PADDLE_SPEED)

		await self.channel_layer.group_send(
			self.game_group_name,
			{
				"type": "paddles_update",
				"paddle1": self.game_state.paddle1,
				"paddle2": self.game_state.paddle2,
			}
		)

	async def paddles_update(self, event):
		await self.send(text_data=json.dumps(event))

	async def game_loop(self):
		while True:
			await self.game_state.update_ball_position()

			await self.channel_layer.group_send(
				self.game_group_name,
				{
					"type": "ball_update",
					"ball_x": self.game_state.ball_x,
					"ball_y": self.game_state.ball_y,
				}
			)

			await asyncio.sleep(1 / FPS)

	async def ball_update(self, event):
		await self.send(text_data=json.dumps(event))

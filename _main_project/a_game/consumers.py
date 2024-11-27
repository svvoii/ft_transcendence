import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer # This is the base class for all consumers. It handles the WebSocket protocol and connection management asynchronously.
from channels.db import database_sync_to_async
from .models import GameSession


# Constants
CANVAS_WIDTH = 800
CANVAS_HEIGHT = 600
PADDLE_HEIGHT = 100
PADDLE_WIDTH = 20
PADDLE_SPEED = 20
BALL_INITIAL_X = CANVAS_WIDTH // 2
BALL_INITIAL_Y = CANVAS_HEIGHT // 2
BALL_VELOCITY_X = 4
BALL_VELOCITY_Y = 4
FPS = 60

game_states = {} # {game_id: GameState} This dictionary will store the game state for each game session. There should be only one GameState object per game session.


# This class will reflect the state of one game session.
class GameState:
	def __init__(self):
		self.asyncio_task = None # This is needed to store the asyncio task for the game loop
		self.paddle1_y = CANVAS_HEIGHT // 2
		self.paddle2_y = CANVAS_HEIGHT // 2
		self.ball_x = BALL_INITIAL_X
		self.ball_y = BALL_INITIAL_Y
		self.ball_velocity_x = BALL_VELOCITY_X
		self.ball_velocity_y = BALL_VELOCITY_Y
		# self.player1_score = 0
		# self.player2_score = 0

	def update_ball_position(self):
		self.ball_x += self.ball_velocity_x
		self.ball_y += self.ball_velocity_y

		# Check if the ball hits bottom or top of the canvas
		if self.ball_y <= 0 or self.ball_y >= CANVAS_HEIGHT:
			self.ball_velocity_y *= -1

		# Check if the ball hits the paddles
		if self.ball_x <= PADDLE_WIDTH:
			if self.paddle1_y <= self.ball_y <= self.paddle1_y + PADDLE_HEIGHT:
				self.ball_velocity_x *= -1
			else:
				# self.player2_score += 1
				self.reset_ball()
		elif self.ball_x >= CANVAS_WIDTH - PADDLE_WIDTH:
			if self.paddle2_y <= self.ball_y <= self.paddle2_y + PADDLE_HEIGHT:
				self.ball_velocity_x *= -1
			else:
				# self.player1_score += 1
				self.reset_ball()

	def reset_ball(self):
		self.ball_x = BALL_INITIAL_X
		self.ball_y = BALL_INITIAL_Y
		self.ball_velocity_x *= -1
		self.ball_velocity_y *= -1
		

# This class handles WebSocket connections. Each connection creates a new instance of this class.
class GameConsumer(AsyncWebsocketConsumer):

	async def connect(self):
		self.game_id = self.scope['url_route']['kwargs']['game_id'] # This retrieves the game_id from the URL path
		self.game_group_name = f'game_{self.game_id}'
		self.user = self.scope['user']

		# Make sure there is only one GameState object per game session (since there will be multiple WebSocket connections / GameConsumer instances per game session)
		if self.game_id not in game_states:
			game_states[self.game_id] = GameState()

		self.game_state = game_states[self.game_id]

		# Adding the user to the game group
		await self.channel_layer.group_add(
			self.game_group_name,
			self.channel_name
		)

		await self.accept()

		# Send initial paddles position to the client that just connected
		await self.send(text_data=json.dumps({
			'type': 'update_paddles',
			'paddle1_y': self.game_state.paddle1_y,
			'paddle2_y': self.game_state.paddle2_y
		}))

		# Start the game loop if it's not already running
		if self.game_state.asyncio_task is None:
			self.game_state.asyncio_task = asyncio.create_task(self.game_loop())


	async def disconnect(self, close_code):
		# Leave game group when the WebSocket connection is closed
		await self.channel_layer.group_discard(
			self.game_group_name,
			self.channel_name
		)
		# DEBUG #
		print("GameConsumer disconnect called...")
		# # # # #

		# If there are no more WebSocket connections, stop the game loop
		if self.game_state.asyncio_task:
			self.game_state.asyncio_task.cancel()
			self.game_state.asyncio_task = None
			# DEBUG #
			print("Game loop stopped...")


	async def receive(self, text_data):
		data = json.loads(text_data)
		key = data.get('key') # 'key' is the variable name sent by the client
		player = data.get('player') # 'player' is the variable name sent by the client (player1 or player2)

		# Update the paddle position based on the key pressed
		if player == 'player1':
			if key == 'ArrowUp':
				self.game_state.paddle1_y -= PADDLE_SPEED
			elif key == 'ArrowDown':
				self.game_state.paddle1_y += PADDLE_SPEED
		elif player == 'player2':
			if key == 'ArrowUp':
				self.game_state.paddle2_y -= PADDLE_SPEED
			elif key == 'ArrowDown':
				self.game_state.paddle2_y += PADDLE_SPEED

		# Respecting the boundaries of the canvas
		self.game_state.paddle1_y = max(0, min(CANVAS_HEIGHT - PADDLE_HEIGHT, self.game_state.paddle1_y))
		self.game_state.paddle2_y = max(0, min(CANVAS_HEIGHT - PADDLE_HEIGHT, self.game_state.paddle2_y))

		# Send the updated paddle positions to the game group
		await self.channel_layer.group_send(
			self.game_group_name,
			{
				'type': 'update_paddles', # this is the method `update_paddles` that will be called once the client receives the message via websocket
				'paddle1_y': self.game_state.paddle1_y,
				'paddle2_y': self.game_state.paddle2_y
			}
		)

	# This method is called when the client receives a message via WebSocket
	async def update_paddles(self, event):
		paddle1_y = event['paddle1_y']
		paddle2_y = event['paddle2_y']

		await self.send(text_data=json.dumps({
			'type': 'update_paddles',
			'paddle1_y': paddle1_y,
			'paddle2_y': paddle2_y
		}))

	async def game_loop(self):
		while True:
			self.game_state.update_ball_position()

			# Broadcast the updated ball position to the game group
			await self.channel_layer.group_send(
				self.game_group_name,
				{
					'type': 'update_ball', # this is the method that will be called once the client receives the message via websocket
					'ball_x': self.game_state.ball_x,
					'ball_y': self.game_state.ball_y
				}
			)

			await asyncio.sleep(1 / FPS)

	# This method is called when the client receives a message via WebSocket
	async def update_ball(self, event):
		ball_x = event['ball_x']
		ball_y = event['ball_y']

		await self.send(text_data=json.dumps({
			'type': 'update_ball',
			'ball_x': ball_x,
			'ball_y': ball_y
		}))

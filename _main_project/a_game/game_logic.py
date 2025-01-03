# This file contains the game logic for the Pong game. 
# The GameState class object is initialized once the game session is created in the views.py file.
# The GameState objects are stored in the Redis cache with the game_id as the key.
# There can be only one GameState object per game_id / game session.

import random
import math
import asyncio
from .models import GameSession


CANVAS_WIDTH = 600
CANVAS_HEIGHT = 600
PADDLE_WIDTH = 10
PADDLE_HEIGHT = 60
PADDLE_SPEED = 30
BALL_RADIUS = 8
BALL_VELOCITY_X = 4
BALL_VELOCITY_Y = 4
WINNING_SCORE = 10
FPS = 60


class GameState:
	def __init__(self):
		self.game_mode = None
		self.num_players = 0
		self.paddle1 = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2
		self.paddle2 = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2
		self.paddle3 = CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2
		self.paddle4 = CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2
		self.last_paddle_touch = None
		self.previous_direction = None
		self.ball_x = CANVAS_WIDTH / 2 - BALL_RADIUS / 2
		self.ball_y = CANVAS_HEIGHT / 2 - BALL_RADIUS / 2
		self.ball_velocity_x = BALL_VELOCITY_X
		self.ball_velocity_y = BALL_VELOCITY_Y
		self.score1 = 0
		self.score2 = 0
		self.score3 = 0
		self.score4 = 0
		self.game_over = False

	def get_state(self):
		return {
			"game_mode": self.game_mode,
			"num_players": self.num_players,
			"paddle1": self.paddle1,
            "paddle2": self.paddle2,
			"paddle3": self.paddle3,
			"paddle4": self.paddle4,
            "score1": self.score1,
            "score2": self.score2,
			"score3": self.score3,
			"score4": self.score4,
        }

	def update(self):
		if self.game_over:
			return

		# Ball collision with left wall
		if self.ball_x - BALL_RADIUS <= 0:
			if self.num_players > 2:
				if self.last_paddle_touch is None:
					self.change_ball_direction('x')
				else:
					self.assign_score_and_reset_ball(self.last_paddle_touch)
			else:
				self.assign_score_and_reset_ball(self.last_paddle_touch, 'score2')
		# Paddle 1 collision (left paddle)
		elif self.ball_x - BALL_RADIUS <= PADDLE_WIDTH:
			if self.paddle1 <= self.ball_y <= self.paddle1 + PADDLE_HEIGHT:
				self.change_ball_direction('x')
				self.ball_x = PADDLE_WIDTH + BALL_RADIUS
				self.last_paddle_touch = 1
		
		# Ball collision with right wall
		if self.ball_x + BALL_RADIUS >= CANVAS_WIDTH:
			if self.num_players > 2:
				if self.last_paddle_touch is None:
					self.change_ball_direction('x')
				else:
					self.assign_score_and_reset_ball(self.last_paddle_touch)
			else:
				self.assign_score_and_reset_ball(self.last_paddle_touch, 'score1')
		# Paddle 2 collision (right paddle)
		elif self.ball_x + BALL_RADIUS >= CANVAS_WIDTH - PADDLE_WIDTH:
			if self.paddle2 <= self.ball_y <= self.paddle2 + PADDLE_HEIGHT:
				self.change_ball_direction('x')
				self.ball_x = CANVAS_WIDTH - PADDLE_WIDTH - BALL_RADIUS
				self.last_paddle_touch = 2
		
		if self.num_players >= 3:
			# Ball collision with top wall
			if self.ball_y - BALL_RADIUS <= 0:
				if self.last_paddle_touch is None:
					self.change_ball_direction('y')
				else:
					self.assign_score_and_reset_ball(self.last_paddle_touch)
			# Paddle 3 collision (top paddle)
			elif self.ball_y - BALL_RADIUS <= PADDLE_WIDTH:
				if self.paddle3 <= self.ball_x <= self.paddle3 + PADDLE_HEIGHT:
					self.change_ball_direction('y')
					self.ball_y = PADDLE_WIDTH + BALL_RADIUS
					self.last_paddle_touch = 3
		else: # top wall collision (if there are only 2 players)
			if self.ball_y - BALL_RADIUS <= 0:
				self.change_ball_direction('y')

		if self.num_players == 4:
			# Ball collision with bottom wall
			if self.ball_y + BALL_RADIUS >= CANVAS_HEIGHT:
				if self.last_paddle_touch is None:
					self.change_ball_direction('y')
				else:
					self.assign_score_and_reset_ball(self.last_paddle_touch)
			# Paddle 4 collision (bottom paddle)
			elif self.ball_y + BALL_RADIUS >= CANVAS_HEIGHT - PADDLE_WIDTH:
				if self.paddle4 <= self.ball_x <= self.paddle4 + PADDLE_HEIGHT:
					self.change_ball_direction('y')
					self.ball_y = CANVAS_HEIGHT - PADDLE_WIDTH - BALL_RADIUS
					self.last_paddle_touch = 4
		else: # bottom wall collision (if there are 2 or 3 players)
			if self.ball_y + BALL_RADIUS >= CANVAS_HEIGHT:
				self.change_ball_direction('y')

		self.ball_x += self.ball_velocity_x
		self.ball_y += self.ball_velocity_y

		self.check_winner()

	def change_ball_direction(self, direction):
		# if self.last_paddle_touch is None:
		print(f'Changing ball direction: {direction}')
		if direction == 'x':
			self.ball_velocity_x *= -1
		elif direction == 'y':
			self.ball_velocity_y *= -1
		# self.add_random_velocity()

	# If the ball hits the wall, the last player to touch the ball is None
	# In this case, the score is not assigned to any player and the ball is bounced back
	def assign_score_and_reset_ball(self, player, score=None):
		if self.num_players > 2:
			if player is not None:
				if player == 1:
					self.score1 += 1
				elif player == 2:
					self.score2 += 1
				elif player == 3:
					self.score3 += 1
				elif player == 4:
					self.score4 += 1
		if score is not None:
			if score == 'score1':
				self.score1 += 1
			elif score == 'score2':
				self.score2 += 1
		
		self.reset_ball()

	def reset_ball(self):
		print('Resetting ball...')
		self.ball_x = CANVAS_WIDTH / 2 - BALL_RADIUS / 2
		self.ball_y = CANVAS_HEIGHT / 2 - BALL_RADIUS / 2

		# Ramdomize the direction of the ball
		direction = random.choice(['-x', 'x', '-y', 'y'])
		while direction == self.previous_direction:
			direction = random.choice(['-x', 'x', '-y', 'y'])
		self.previous_direction = direction
		print('direction:', direction)
		if direction == '-x': # Top left
			self.ball_velocity_x = -abs(self.ball_velocity_x)
			self.ball_velocity_y = abs(self.ball_velocity_y)
		elif direction == 'x': # Top right
			self.ball_velocity_x = abs(self.ball_velocity_x)
			self.ball_velocity_y = -abs(self.ball_velocity_y)
		elif direction == '-y': # Bottom left
			self.ball_velocity_x = abs(self.ball_velocity_x)
			self.ball_velocity_y = -abs(self.ball_velocity_y)
		elif direction == 'y': # Bottom right
			self.ball_velocity_x = -abs(self.ball_velocity_x)
			self.ball_velocity_y = abs(self.ball_velocity_y)
		# self.ball_velocity_x *= -1
		# self.ball_velocity_y *= -1
		
		self.add_random_velocity()
		self.last_paddle_touch = None
	
	def add_random_velocity(self):
		self.ball_velocity_x += random.uniform(-0.5, 0.5)
		self.ball_velocity_y += random.uniform(-0.5, 0.5)

		# Normalize the velocity
		# speed = math.sqrt(self.ball_velocity_x ** 2 + self.ball_velocity_y ** 2)
		# self.ball_velocity_x = (self.ball_velocity_x / speed) * BALL_VELOCITY_X
		# self.ball_velocity_y = (self.ball_velocity_y / speed) * BALL_VELOCITY_Y

	def move_paddle(self, paddle, direction):
		# DEBUG # 
		# print(f'Moving paddle {paddle}')

		if paddle == 1:
			self.paddle1 += direction * PADDLE_SPEED
		elif paddle == 2:
			self.paddle2 += direction * PADDLE_SPEED
		elif paddle == 3:
			self.paddle3 += direction * PADDLE_SPEED
		elif paddle == 4:
			self.paddle4 += direction * PADDLE_SPEED

        # Ensure paddles stay within bounds
		self.paddle1 = max(0, min(self.paddle1, CANVAS_HEIGHT - PADDLE_HEIGHT))
		self.paddle2 = max(0, min(self.paddle2, CANVAS_HEIGHT - PADDLE_HEIGHT))
		self.paddle3 = max(0, min(self.paddle3, CANVAS_WIDTH - PADDLE_WIDTH))
		self.paddle4 = max(0, min(self.paddle4, CANVAS_WIDTH - PADDLE_WIDTH))
	
	# To get the winner of the game: 
	def check_winner(self):
		if self.score1 >= WINNING_SCORE:
			self.game_over = True
			self.winner = "player1"
		elif self.score2 >= WINNING_SCORE:
			self.game_over = True
			self.winner = "player2"
		elif self.score3 >= WINNING_SCORE:
			self.game_over = True
			self.winner = "player3"
		elif self.score4 >= WINNING_SCORE:
			self.game_over = True
			self.winner = "player4"


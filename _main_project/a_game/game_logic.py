# This file contains the game logic for the Pong game. 
# The GameState class object is initialized once the game session is created in the views.py file.
# The GameState objects are stored in the game_states dictionary, with the game_id as the key.
# There can be only one GameState object per game_id / game session.

CANVAS_WIDTH = 800
CANVAS_HEIGHT = 600
PADDLE_WIDTH = 10
PADDLE_HEIGHT = 100
PADDLE_SPEED = 20
BALL_WIDTH = 10
BALL_HEIGHT = 10
BALL_VELOCITY_X = 5
BALL_VELOCITY_Y = 5
WINNING_SCORE = 3
FPS = 60


game_states = {}

class GameState:
	def __init__(self):
		self.paddle1 = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2
		self.paddle2 = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2
		self.ball_x = CANVAS_WIDTH / 2 - BALL_WIDTH / 2
		self.ball_y = CANVAS_HEIGHT / 2 - BALL_HEIGHT / 2
		self.ball_velocity_x = BALL_VELOCITY_X
		self.ball_velocity_y = BALL_VELOCITY_Y
		self.score1 = 0
		self.score2 = 0
		self.game_over = False

	def get_state(self):
		return {
			"paddle1": self.paddle1,
            "paddle2": self.paddle2,
            "score1": self.score1,
            "score2": self.score2,
			# "winner": getattr(self, "winner", None)
        }

	def update(self):
		if self.game_over:
			return

		# Top and bottom wall collision
		if self.ball_y <= 0 or self.ball_y >= CANVAS_HEIGHT - BALL_HEIGHT:
			self.ball_velocity_y *= -1

		# Paddle 1 collision
		if self.ball_x <= PADDLE_WIDTH:
			if self.paddle1 <= self.ball_y <= self.paddle1 + PADDLE_HEIGHT:
				self.ball_velocity_x *= -1
			else:
				self.score2 += 1
				self.reset_ball()
		
		# Paddle 2 collision
		if self.ball_x >= CANVAS_WIDTH - PADDLE_WIDTH - BALL_WIDTH:
			if self.paddle2 <= self.ball_y <= self.paddle2 + PADDLE_HEIGHT:
				self.ball_velocity_x *= -1
			else:
				self.score1 += 1
				self.reset_ball()

		self.ball_x += self.ball_velocity_x
		self.ball_y += self.ball_velocity_y

		self.check_winner()

	def reset_ball(self):
		self.ball_x = CANVAS_WIDTH / 2 - BALL_WIDTH / 2
		self.ball_y = CANVAS_HEIGHT / 2 - BALL_HEIGHT / 2
		self.ball_velocity_x *= -1
		self.ball_velocity_y *= -1

	def move_paddle(self, paddle, direction):
		if paddle == 1:
			self.paddle1 += direction * PADDLE_SPEED
		elif paddle == 2:
			self.paddle2 += direction * PADDLE_SPEED

        # Ensure paddles stay within bounds
		self.paddle1 = max(0, min(self.paddle1, CANVAS_HEIGHT - PADDLE_HEIGHT))
		self.paddle2 = max(0, min(self.paddle2, CANVAS_HEIGHT - PADDLE_HEIGHT))
	
	# To get the winner of the game: 
	# `getattr(game_states[game_id], "winner", None)` - this will return the winner of the game if the game is over, otherwise it will return None
	def check_winner(self):
		if self.score1 >= WINNING_SCORE:
			self.game_over = True
			self.winner = "player1"
		elif self.score2 >= WINNING_SCORE:
			self.game_over = True
			self.winner = "player2"


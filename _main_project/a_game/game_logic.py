# This file contains the game logic for the Pong game. 
# The GameState class object is initialized once the game session is created in the views.py file.
# The GameState objects are stored in the game_states dictionary, with the game_id as the key.
# There can be only one GameState object per game_id / game session.

CANVAS_WIDTH = 600
CANVAS_HEIGHT = 600
PADDLE_WIDTH = 10
PADDLE_HEIGHT = 60
PADDLE_SPEED = 20
BALL_WIDTH = 10
BALL_HEIGHT = 10
BALL_VELOCITY_X = 3
BALL_VELOCITY_Y = 3
WINNING_SCORE = 3
FPS = 60


game_states = {}

class GameState:
	def __init__(self):
		self.game_mode = None
		self.num_players = 0
		self.paddle1 = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2
		self.paddle2 = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2
		self.paddle3 = CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2
		self.paddle4 = CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2
		self.ball_x = CANVAS_WIDTH / 2 - BALL_WIDTH / 2
		self.ball_y = CANVAS_HEIGHT / 2 - BALL_HEIGHT / 2
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
		
		# Paddle 3 collision
		if self.ball_y <= PADDLE_WIDTH:
			if self.paddle3 <= self.ball_x <= self.paddle3 + PADDLE_WIDTH:
				self.ball_velocity_y *= -1
			else:
				self.score4 += 1
				self.reset_ball()

		# Paddle 4 collision
		if self.ball_y >= CANVAS_HEIGHT - PADDLE_WIDTH - BALL_WIDTH:
			if self.paddle4 <= self.ball_x <= self.paddle4 + PADDLE_WIDTH:
				self.ball_velocity_y *= -1
			else:
				self.score3 += 1
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
	# `getattr(game_states[game_id], "winner", None)` - this will return the winner of the game if the game is over, otherwise it will return None
	def check_winner(self):
		if self.score1 >= WINNING_SCORE:
			self.game_over = True
			self.winner = "player1"
		elif self.score2 >= WINNING_SCORE:
			self.game_over = True
			self.winner = "player2"


# Description: CLI Pong game client
# Before running this script, make sure to view the variables in the `env_cli` file.
# Make sure the Django project is running.
# To run the script: python cli_pong.py

import asyncio
import websockets
import requests
import json
import curses
import sys
import os
import logging
from dotenv import load_dotenv

import logging_config
from api_requests import register_user, login_user, create_game_session, join_game_session, get_game_state, move_paddle, end_game_session, quit_game_session


script_dir = os.path.dirname(os.path.abspath(__file__))
settings_file = os.path.join(script_dir, 'env_cli')
load_dotenv(settings_file)


API_URL = os.getenv('HOST', 'http://localhost:8000')
USE_HTTPS = os.getenv('USE_HTTPS', 'false')
GAME_MODE = os.getenv('GAME_MODE', 'Single')

# The following variables must match the values in the Django project !!!
CANVAS_WIDTH = 600
CANVAS_HEIGHT = 600
PADDLE_HEIGHT = 60

# DEBUG #
logging.debug("API_URL: %s", API_URL)
logging.debug("USE_HTTPS: %s", os.getenv("USE_HTTPS", "false"))
logging.debug("GAME_MODE: %s", GAME_MODE)
# # # # #

def get_credentials():
	logging.debug("Getting user credentials...")

	email = os.getenv('CLI_EMAIL', 'test@test.test')
	username = os.getenv('CLI_USERNAME', 'test')
	password = os.getenv('CLI_PASSWORD', 'qetwry135246')

	if not email or not username or not password:
		print("Please provide email, username, and password in the .env file.")
		# logging.error("Please provide email, username, and password.")
		return None, None, None
	
	return email, username, password


def handle_login(email, username, password):
	try:
		register_user(email, username, password, password)
		session, csrf_token = login_user(email, password)
		if not session and not csrf_token:
			return None, None
	except requests.RequestException as e:
		logging.error("Registration / Login failed: %s", e)
		return None, None

	return session, csrf_token


def start_game_session(session, csrf_token):
	game_id = os.getenv('GAME_ID', None)
	game_mode = GAME_MODE

	# Create the game session if game_id is not provided
	logging.debug("Game ID: %s", game_id)
	if not game_id:
		try:
			game_id = create_game_session(session, csrf_token, game_mode)
			logging.debug("Created Game ID: %s", game_id)
			print(f"Server returned created Game ID: {game_id}")
		except requests.RequestException as e:
			logging.error("Failed to create game session: %s", e)
			return None, None

	try:
		# Join the game session
		role = join_game_session(session, csrf_token, game_id)
		paddle = int(role[-1])
		print(f"Joined as: {role}")
		logging.debug("Joined as: %s", role)
		# get_game_state(session, game_id)
	except requests.RequestException as e:
		logging.error("Failed to join game session: %s", e)
		return None, None

	return game_id, paddle


def run_game_loop(stdscr, session, csrf_token, game_id, paddle):
	loop = asyncio.new_event_loop()
	asyncio.set_event_loop(loop)
	winner = loop.run_until_complete(
		handle_websocket(stdscr, session, csrf_token, game_id, paddle)
	)
	return winner


def get_websocket_url(game_id):
	ws_protocol = 'wss' if os.getenv('USE_HTTPS', 'false').lower() == 'true' else 'ws'
	host = os.getenv('HOST', 'localhost:8000')
	if 'http' in host:
		host = host.split('//')[1]
	websocket_url = f'{ws_protocol}://{host}/ws/pong/{game_id}/'
	logging.debug("Connecting via Websocket on URL: %s", websocket_url)
	return websocket_url


# Function to get user input
def get_user_input(stdscr, paddle):
	stdscr.nodelay(True)
	direction = None
	try:
		ch = stdscr.getch()
		if ch == -1: # No key pressed
			return paddle, direction

		if ch == curses.KEY_UP or ch == ord('w'):
			direction = -1
		elif ch == curses.KEY_DOWN or ch == ord('s'):
			direction = 1
			
		if GAME_MODE == 'Single':
			if ch == ord('w') or ch == ord('s'):
				paddle = 1
			elif ch == curses.KEY_UP or ch == curses.KEY_DOWN:
				paddle = 2
		
		return paddle, direction

	except Exception as e:
		logging.error("Error getting user input: %s", e)
		return None, None


# Function to draw the game state
def draw_game_state(stdscr, game_state):
	stdscr.clear()
	term_height, term_width = stdscr.getmaxyx()

	# Scaling the canvas to fit the terminal window
	scale_x = term_width / CANVAS_WIDTH
	scale_y = term_height / CANVAS_HEIGHT

	# Scaling the paddle height
	scaled_paddle_height = int(PADDLE_HEIGHT * scale_y)

    # Draw paddles
	for i in range(scaled_paddle_height):
		paddle1 = int(game_state['paddle1'] * scale_y) + i
		paddle2 = int(game_state['paddle2'] * scale_y) + i
		if 0 <= paddle1 < term_height:
			stdscr.addstr(paddle1, int(1 * scale_x), 'H')
		if 0 <= paddle2 < term_height:
			stdscr.addstr(paddle2, int((CANVAS_WIDTH - 2) * scale_x), 'H')

	if GAME_MODE == 'Multi_3' or GAME_MODE == 'Multi_4':
		for i in range(scaled_paddle_height):
			paddle3 = int(game_state['paddle3'] * scale_x) + i
			paddle4 = int(game_state['paddle4'] * scale_x) + i
			if 0 <= paddle3 < term_width:
				stdscr.addstr(int(1 * scale_y), paddle3, '=')
			if 0 <= paddle4 < term_width:
				stdscr.addstr(int((CANVAS_HEIGHT - 2) * scale_y), paddle4, '=')

	# Draw ball
	ball = '[X]'
	ball_y = int(game_state['ball_y'] * scale_y)
	ball_x = int(game_state['ball_x'] * scale_x)
	if ball_y + 3 >= term_height:
		ball_y = term_height - 3
	if ball_x + 3 >= term_width:
		ball_x = term_width - 3
	
	stdscr.addstr(ball_y, ball_x, ball)

	# Draw scores
	player1_score = f"P1 score: {game_state['score1']}"
	player2_score = f"P2 score: {game_state['score2']}"
	stdscr.addstr(term_height // 2, 8, player1_score)
	stdscr.addstr(term_height // 2, term_width - len(player2_score) - 8, player2_score)
	if GAME_MODE == 'Multi_3' or GAME_MODE == 'Multi_4':
		player3_score = f"P3 score: {game_state['score3']}"
		player4_score = f"P4 score: {game_state['score4']}"
		stdscr.addstr(8, term_width // 2 - 8, player3_score)
		stdscr.addstr(term_height - 8, term_width // 2 - len(player4_score) - 8, player4_score)

	stdscr.refresh()

# Function to handle WebSocket messages
async def handle_websocket(stdscr, session, csrf_token, game_id, paddle):
	websocket_url = get_websocket_url(game_id)
	headers = {
		'Origin': API_URL,
		'Cookie': f'csrftoken={csrf_token}; sessionid={session.cookies["sessionid"]}',
	}
	try:
		async with websockets.connect(websocket_url, additional_headers=headers) as websocket:

			winner = None

			# Send `player_ready` message to trigger the game loop
			await websocket.send(json.dumps({
				'type': 'player_ready',
			}))
			print("Sent player_ready message to start the game loop.")

			while True:
				message = await websocket.recv()
				data = json.loads(message)
				message_type = data.get('type')

				if message_type == 'initial_state' or message_type == 'update_state':
					game_state = data.get('state')
					if not game_state:
						game_state = data
					draw_game_state(stdscr, game_state)
				elif message_type == 'game_quit':
					logging.debug("Quit message received.")
				elif message_type == 'game_over':
					logging.debug("Game over message received.")
					winner = data.get('winner')
					# end_game_session(session, csrf_token, game_id)

				# Get user input for paddle movement
				paddle_input, direction = get_user_input(stdscr, paddle)
				# logging.debug("Paddle: %s, Direction: %s", paddle_input, direction)
				if direction is not None:
					move_paddle(session, csrf_token, game_id, paddle_input, direction)
	except websockets.exceptions.ConnectionClosedOK:
		logging.debug("Websocket connection closed.")
	
	end_game_session(session, csrf_token, game_id)
		
	return winner


# Main function
def main(stdscr):

	email, username, password = get_credentials()
	if not email or not username or not password:
		return

	logging.debug("Handling registration and login...")
	session, csrf_token = handle_login(email, username, password)
	if not session:
		return

	logging.debug("Requesting game session...")
	game_id, paddle = start_game_session(session, csrf_token)
	if not game_id:
		return	

	winner = None
	try:
		winner = run_game_loop(stdscr, session, csrf_token, game_id, paddle)
	except KeyboardInterrupt:
		logging.debug("Game stopped by user.")
		quit_game_session(session, csrf_token)
	finally:
		logging.debug("Game over. Winner: %s", winner)

	return winner
		

if __name__ == "__main__":
	winner = curses.wrapper(main)
	if winner:
		print(f"Game Over! Winner: {winner}")
	else:
		print("Something went wrong. Please check the logs...")

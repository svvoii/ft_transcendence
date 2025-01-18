import asyncio
import websockets
import requests
import json
import curses
import sys
import os
from dotenv import load_dotenv
import logging


script_dir = os.path.dirname(__file__)

logfile_path = os.path.join(script_dir, 'cli_pong.log')
logging.basicConfig(filename=logfile_path, level=logging.DEBUG, format='%(levelname)s - %(message)s')


load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../api_test')))

from test_api import register_user, login_user, create_game_session, join_game_session, get_game_state, move_paddle, end_game_session, quit_game_session


# WEBSOCKET_URL = 'ws/pong/<str:game_id>/'
EMAIL = os.getenv('CLI_EMAIL', 'test@test.test')
USERNAME = os.getenv('CLI_USERNAME', 'test')
PASSWORD = os.getenv('CLI_PASSWORD', 'qetwry135246')
API_URL = os.getenv('HOST', 'http://localhost:8000')
PADDLE_MOVE_ENDPOINT = '/game/move_paddle/'


# DEBUG #
logging.debug("EMAIL: %s", EMAIL)
logging.debug("USERNAME: %s", USERNAME)
logging.debug("PASSWORD: %s", PASSWORD)
logging.debug("API_URL: %s", API_URL)
logging.debug("USE_HTTPS: %s", os.getenv("USE_HTTPS", "false"))
logging.debug("PADDLE_MOVE_ENDPOINT: %s", PADDLE_MOVE_ENDPOINT)

def get_ws_protocol():
	return 'wss' if os.getenv('USE_HTTPS', 'false').lower() == 'true' else 'ws'


def get_websocket_url(game_id):
	ws_protocol = get_ws_protocol()
	host = os.getenv('HOST', 'localhost:8000')
	return f'{ws_protocol}://{host}/ws/pong/{game_id}/'


# Function to get user input
def get_user_input(stdscr):
    stdscr.nodelay(True)
    try:
        ch = stdscr.getch()
        if ch == curses.KEY_UP:
            return -1 # Move up
        elif ch == curses.KEY_DOWN:
            return 1 # Move down
    except:
        pass
    return None


# Function to draw the game state
def draw_game_state(stdscr, game_state):
    stdscr.clear()
    height, width = stdscr.getmaxyx()

    # Draw paddles
    stdscr.addstr(int(game_state['paddle1']), 1, '|')
    stdscr.addstr(int(game_state['paddle2']), width - 2, '|')
    stdscr.addstr(1, int(game_state['paddle3']), '-')
    stdscr.addstr(height - 2, int(game_state['paddle4']), '-')

    # Draw ball
    stdscr.addstr(int(game_state['ball_y']), int(game_state['ball_x']), 'O')

    # Draw scores
    stdscr.addstr(0, width // 2 - 10, f"Player 1: {game_state['score1']}  Player 2: {game_state['score2']}")
    stdscr.addstr(1, width // 2 - 10, f"Player 3: {game_state['score3']}  Player 4: {game_state['score4']}")

    stdscr.refresh()

# Function to handle WebSocket messages
async def handle_websocket(stdscr, session, csrf_token, game_id, paddle):
	websocket_url = get_websocket_url(game_id)
	async with websockets.connect(websocket_url) as websocket:
		while True:
			message = await websocket.recv()
			game_state = json.loads(message)
			print(f"Received game state: {game_state}")
			draw_game_state(stdscr, game_state)

            # Get user input for paddle movement
			direction = get_user_input(stdscr)
			if direction is not None:
				move_paddle(session, csrf_token, game_id, paddle, direction)


# Main function
def main(stdscr):
	# DEBUG #
	print("Starting CLI Pong Game..")

	email = EMAIL
	username = USERNAME
	password = PASSWORD

	if not email or not username or not password:
		print("Please provide email, username, and password in the .env file.")
		# logging.error("Please provide email, username, and password.")
		return

    # Register the user
	register_user(email, username, password, password)

    # Log in the user
	session, csrf_token = login_user(email, password)
	if session and csrf_token:
		game_id = os.getenv('GAME_ID', None)
		game_mode = os.getenv('GAME_MODE', 'Single')

		# Create the game session if game_id is not provided
		if not game_id:
			game_id = create_game_session(session, csrf_token, game_mode)
			print(f"Created Game ID: {game_id}")
		
		# Join the game session
		role = join_game_session(session, csrf_token, game_id)
		paddle = int(role[-1])
		print(f"Joined as: {role}")
		get_game_state(session, game_id)


		loop = asyncio.new_event_loop()
		asyncio.set_event_loop(loop)
		loop.run_until_complete(handle_websocket(stdscr, session, csrf_token, game_id, paddle))
		
	else:
		print("Failed to log in. Please check your credentials.")

if __name__ == "__main__":
    curses.wrapper(main)

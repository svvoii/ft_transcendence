import requests
import os
import logging
from dotenv import load_dotenv

import logging_config


script_dir = os.path.dirname(os.path.abspath(__file__))
settings_file = os.path.join(script_dir, 'env_cli')
load_dotenv(settings_file)

# API endpoints:
# BASE_URL = 'http://127.0.0.1:8000/'
BASE_URL = os.getenv('HOST', 'http://localhost:8000')
REGISTER_URL = f'{BASE_URL}/register/'
LOGIN_URL = f'{BASE_URL}/login/'
CREATE_GAME_URL = f'{BASE_URL}/game/create_game/'
JOIN_GAME_URL = f'{BASE_URL}/game/join_game/'
GAME_STATE_URL = f'{BASE_URL}/game/game_state/'
MOVE_PADDLE_URL = f'{BASE_URL}/game/move_paddle/'
END_GAME_URL = f'{BASE_URL}/game/end_game/'
QUIT_GAME_URL = f'{BASE_URL}/game/quit_game/'


# Function to test the `api_register_view` endpoint
def register_user(email, username, password1, password2):
	try:
		api_endpoint = REGISTER_URL
		headers = {
			'X-Requested-With': 'XMLHttpRequest'
		}
		data = {
			'email': email,
			'username': username,
			'password1': password1,
			'password2': password2
		}
		response = requests.post(api_endpoint, headers=headers, json=data)
		response_json = response.json()

		print(f'POST /register/. Status Code: {response.status_code}. Response: {response_json}\n')
		logging.debug('Registration response status code: %s. Response: %s', response.status_code, response_json)
	except requests.exceptions.RequestException as e:
		logging.error('Registration request failed: %s', e)
		if isinstance(e, requests.exceptions.ConnectionError):
			logging.error('Connection Error: Make sure the server is running.')
		print('`register` Request failed.\n')

# Function to test the `api_login_view` endpoint
def login_user(email, password):
	try:
		api_endpoint = LOGIN_URL
		headers = {
			'X-Requested-With': 'XMLHttpRequest'
		}
		data = {
			'email': email,
			'password': password
		}
		session = requests.Session()
		response = session.post(api_endpoint, headers=headers, json=data)
		response_json = response.json()
  
		print(f'POST /login/. Status Code: {response.status_code}. Response: {response_json}\n')
		csrf_token = response.cookies.get('csrftoken')
		logging.debug('Login response status code: %s. Response: %s', response.status_code, response_json)
		return session, csrf_token
	except requests.exceptions.RequestException as e:
		logging.error('Login request failed: %s', e)
		if isinstance(e, requests.exceptions.ConnectionError):
			logging.error('Connection Error: Make sure the server is running.')
		print('`login` Request failed.\n')
		return None, None


# Function to test the `create_game_session` endpoint
def create_game_session(session, csrf_token, mode):
	try:
		api_endpoint = CREATE_GAME_URL
		headers = {
			'X-CSRFToken': csrf_token,
			'X-Requested-With': 'XMLHttpRequest',
			'Referer': BASE_URL
		}
		data = {
			'mode': mode
		}
		response = session.post(api_endpoint, headers=headers, json=data)
		responce_json = response.json()

		# if not response.ok:
		# 	logging.error('Error creating game session: %s', responce_json)
		# 	return None
		print(f'POST /game/create_game/. Status Code: {response.status_code}. Response: {responce_json}\n')
		logging.debug('Game session created. Response: %s', responce_json)
		game_id = responce_json.get('game_id')
		return game_id
	except requests.exceptions.RequestException as e:
		logging.error('Error requesting / creating game session: %s', e)
		print('`create_game` Request failed.\n')
		return None


# Function to test the `join_game_session` endpoint
def join_game_session(session, csrf_token, game_id):
	try:
		api_endpoint = f'{JOIN_GAME_URL}{game_id}/'
		headers = {
			'X-CSRFToken': csrf_token,
			'X-Requested-With': 'XMLHttpRequest',
			'Referer': BASE_URL
		}
		response = session.post(api_endpoint, headers=headers)
		response_json = response.json()

		# if not response.ok:
		# 	logging.error('Error joining game session: %s', response_json)
		# 	return None	

		# print(f'POST /game/join_game/{game_id}/. Status Code: {response.status_code}')
		print(f'POST /game/join_game/{game_id}/. Status Code: {response.status_code}. Response: {response_json}\n')
		logging.debug('Joined game session successfully. Response: %s', response_json)
		role = response_json.get('role')
		return role
	except requests.exceptions.RequestException as e:
		logging.error('Error joining game session: %s', e)
		print('`join_game` Request failed.\n')
		return None


# Function to test the get_game_state endpoint
def get_game_state(session, game_id):
	try:
		api_endpoint = f'{GAME_STATE_URL}{game_id}/'
		headers = {
			'X-Requested-With': 'XMLHttpRequest',
			'Referer': BASE_URL
		}
		response = session.get(api_endpoint, headers=headers)
		response_json = response.json()

		# if not response.ok:
		# 	logging.error('Error getting game state: %s', response_json)
		# 	print(f'GET /game/game_state/{game_id}/. Status Code: {response.status_code}. Response: {response_json}\n')
		# 	return

		print(f'GET /game/game_state/{game_id}/. Response: {response_json}\n')
		logging.debug('Game state received. Response: %s', response.json())
	except requests.exceptions.RequestException as e:
		logging.error('Error getting game state: %s', e)
		print('`get_game_state` Request failed.\n')


# Function to test the move_paddle endpoint
def move_paddle(session, csrf_token, game_id, paddle, direction):
	try:
		api_endpoint = f'{MOVE_PADDLE_URL}{game_id}/'
		headers = {
			'X-CSRFToken': csrf_token,
			'X-Requested-With': 'XMLHttpRequest',
			'Referer': BASE_URL
		}
		data = {
			'paddle': paddle,
			'direction': direction
		}
		response = session.post(api_endpoint, headers=headers, json=data)
		response_json = response.json()

		# if not response.ok:
		# 	logging.error('Error moving paddle: %s', response_json)
		# 	print(f'POST /game/move_paddle/{game_id}/. Status Code: {response.status_code}. Response: {response_json}\n')
		# 	return

		print(f'POST /game/move_paddle/{game_id}/. Response: {response_json}\n')
		logging.debug('Paddle moved successfully. Response: %s', response_json)
	except requests.exceptions.RequestException as e:
		logging.error('Error moving paddle: %s', e)
		print('`move_paddle` Request failed.\n')


# Function to test the `end_game_session` endpoint
def end_game_session(session, csrf_token, game_id):
	try:
		api_endpoint = f'{END_GAME_URL}{game_id}/'
		headers = {
			'X-CSRFToken': csrf_token,
			'X-Requested-With': 'XMLHttpRequest',
			'Referer': BASE_URL
		}
		response = session.post(api_endpoint, headers=headers)
		response_json = response.json()

		# if not response.ok:
		# 	logging.error('Error ending game session: %s', response_json)
		# 	print(f'POST /game/end_game_session/{game_id}/. Status Code: {response.status_code}. Response: {response_json}\n')
		# 	return

		print(f'POST /game/end_game_session/{game_id}/. Status Code: {response.status_code}\n')
		logging.debug('Game session ended successfully. Response status: %s', response.status_code)
	except requests.exceptions.RequestException as e:
		logging.error('Error ending game session: %s', e)
		print('`end_game` Request failed.\n')

# Function to test the `quit_game_session` endpoint
def quit_game_session(session, csrf_token):
	try:
		api_endpoint = QUIT_GAME_URL
		headers = {
			'X-CSRFToken': csrf_token,
			'X-Requested-With': 'XMLHttpRequest',
			'Referer': BASE_URL
		}
		response = session.post(api_endpoint, headers=headers)
		response_json = response.json()

		# if not response.ok:
		# 	logging.error('Error quitting game session: %s', response_json)
		# 	return

		print(f'POST /game/quit_game/. Status Code: {response.status_code}. Response: {response_json}\n')
		logging.debug('Game session ended successfully. Response: %s', response_json)
	except requests.exceptions.RequestException as e:
		logging.error('Error quitting game session: %s', e)
		print('`quit_game` Request failed.\n')


# # # # #  MAIN FUNCTION  # # # # #

if __name__ == '__main__':

	email = 'testuser@example.com'
	username = 'testuser'
	password = 'qetwry135246'
	mode = 'Single'
	game_id = None
	role = None

	print('Testing `register_user` endpoint...')
	register_user(email, username, password, password)
	
	print('Testing `login_user` endpoint...')
	session, csrf_token = login_user(email, password)
	print('CSRF Token:', csrf_token)
	print(f'Session: { session }\n')

	if session and csrf_token:
		print('Testing `create_game_session` endpoint...')
		game_id = create_game_session(session, csrf_token, mode)
		# print(f'Game ID: { game_id }\n')

		if game_id:
			print('Testing `join_game_session` endpoint...')
			role = join_game_session(session, csrf_token, game_id)
			# print(f'Role: { role }\n')

			print(f'Testing `get_game_state` endpoint...')
			get_game_state(session, game_id)
		else:
			print('Cannot test `join_game_session` or `get_game_state` endpoints without a game ID.\n')

		# Testing the move_paddle function
		if role:
			print('Testing `move_paddle` endpoint...')
			paddle = int(role[-1]) # role is always 'player1', 'player2', etc.
			# print(f'Paddle: { paddle }\n')
			direction = -1 # ..for 'up'
			# direction = 1 # ..for 'down'
			move_paddle(session, csrf_token, game_id, paddle, direction)
		else:
			print('Cannot test `move_paddle` endpoint without a role.\n')

		# Testing the quit_game_session function
		print('Testing `quit_game_session` endpoint...')
		quit_game_session(session, csrf_token)

		# Testing the end_game_session function
		# print('Testing `end_game_session` endpoint...')
		# end_game_session(session, csrf_token, game_id)

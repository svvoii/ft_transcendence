import requests

# Define the base URL of your Django application
BASE_URL = 'http://127.0.0.1:8000/'

# Function to test the `api_register_view` endpoint
def test_register_user(email, username, password1, password2):
	api_endpoint = f'{BASE_URL}/register/'
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
	print('POST /register/')
	print('Status Code:', response.status_code)
	try:
		response_json = response.json()
		print(f'Response: { response_json }\n')
	except:
		print('`register` Response is not JSON format:', response.text)

# Function to test the `api_login_view` endpoint
def test_login_user(email, password):
	api_endpoint = f'{BASE_URL}/login/'
	headers = {
		'X-Requested-With': 'XMLHttpRequest'
	}
	data = {
		'email': email,
		'password': password
	}
	session = requests.Session()
	response = session.post(api_endpoint, headers=headers, json=data)
	print('POST /login/')
	print('Status Code:', response.status_code)
	try:
		response_json = response.json()
		print(f'Response: { response_json }\n')
		csrf_token = response.cookies.get('csrftoken')
		return session, csrf_token
	except:
		print('`login` Response is not JSON format:', response.text)
		return None, None


# Function to test the `create_game_session` endpoint
def test_create_game_session(session, csrf_token, mode):
	api_endpoint = f'{BASE_URL}/game/create_game/'
	headers = {
		'X-CSRFToken': csrf_token,
		'X-Requested-With': 'XMLHttpRequest'
	}
	data = {
		'mode': mode
	}
	response = session.post(api_endpoint, headers=headers, json=data)
	print('POST /game/create_game/')
	print('Status Code:', response.status_code)
	try:
		response_json = response.json()
		print(f'Response: { response_json }\n')
		return response.json().get('game_id')
	except:
		print('create_game` Response is not JSON format:', response.text)
		return None


# Function to test the `join_game_session` endpoint
def test_join_game_session(session, csrf_token, game_id):
	api_endpoint = f'{BASE_URL}/game/join_game/{game_id}/'
	headers = {
		'X-CSRFToken': csrf_token,
		'X-Requested-With': 'XMLHttpRequest'
	}
	response = session.post(api_endpoint, headers=headers)
	print(f'POST /game/join_game/{game_id}/')
	print('Status Code:', response.status_code)
	try:
		response_json = response.json()
		print(f'Response: { response_json }\n')
		return response.json().get('role')
	except:
		print('`join_game` Response is not JSON format:', response.text)
		return None


# Function to test the get_game_state endpoint
def test_get_game_state(session, game_id):
	api_endpoint = f'{BASE_URL}/game/game_state/{game_id}/'
	headers = {
		'X-Requested-With': 'XMLHttpRequest'
    }
	response = session.get(api_endpoint, headers=headers)
	print(f'GET /game/game_state/{game_id}/')
	print('Status Code:', response.status_code)
	try:
		response_json = response.json()
		print(f'Response: { response_json }\n')
	except:
		print('`game_state` Response is not JSON format:', response.text)

# Function to test the move_paddle endpoint
def test_move_paddle(session, csrf_token, game_id, paddle, direction):
	api_endpoint = f'{BASE_URL}/game/move_paddle/{game_id}/'
	headers = {
		'X-CSRFToken': csrf_token,
		'X-Requested-With': 'XMLHttpRequest'
    }
	data = {
        'paddle': paddle,
        'direction': direction
    }
	response = session.post(api_endpoint, headers=headers, json=data)
	print(f'POST /game/move_paddle/{game_id}/')
	print('Status Code:', response.status_code)
	try:
		response_json = response.json()
		print(f'Response: { response_json }\n')
	except:
		print('`move_paddle` Response is not JSON format:', response.text)


# Function to test the `end_game_session` endpoint
def test_end_game_session(session, csrf_token, game_id):
	api_endpoint = f'{BASE_URL}/game/end_game/{game_id}/'
	headers = {
		'X-CSRFToken': csrf_token,
		'X-Requested-With': 'XMLHttpRequest'
	}
	response = session.post(api_endpoint, headers=headers)
	print(f'POST /game/end_game_session/{game_id}/')
	print('Status Code:', response.status_code)
	try:
		response_json = response.json()
		print(f'Response: { response_json }\n')
	except:
		print('`end_game` Response is not JSON format:', response.text)

# Function to test the `quit_game_session` endpoint
def test_quit_game_session(session, csrf_token):
	api_endpoint = f'{BASE_URL}/game/quit_game/'
	headers = {
		'X-CSRFToken': csrf_token,
		'X-Requested-With': 'XMLHttpRequest' 
	}
	response = session.post(api_endpoint, headers=headers)
	print(f'POST /game/quit_game/')
	print('Status Code:', response.status_code)
	try:
		response_json = response.json()
		print(f'Response: { response_json }\n')
	except:
		print('`quit_game` Response is not JSON format:', response.text)


# # # # #  MAIN FUNCTION  # # # # #

if __name__ == '__main__':

	email = 'testuser@example.com'
	username = 'testuser'
	password1 = 'qetwry135246'
	password2 = 'qetwry135246'
	game_id = 'is obtained from the create_game_session response'
	role = 'is obtained from the join_game_session response'

	print('Testing `register_user` endpoint...')
	test_register_user(email, username, password1, password2)
	
	print('Testing `login_user` endpoint...')
	session, csrf_token = test_login_user(email, password1)
	# print('CSRF Token:', csrf_token)
	# print(f'Session: { session }\n')

	print('Testing `create_game_session` endpoint...')
	mode = 'Single'
	game_id = test_create_game_session(session, csrf_token, mode)
	# print(f'Game ID: { game_id }\n')

	print('Testing `join_game_session` endpoint...')
	role = test_join_game_session(session, csrf_token, game_id)
	# print(f'Role: { role }\n')

	print(f'Testing `get_game_state` endpoint...')
	test_get_game_state(session, game_id)

	# Testing the move_paddle function
	print('Testing `move_paddle` endpoint...')
	paddle = int(role[-1]) # role is always 'player1', 'player2', etc.
	# print(f'Paddle: { paddle }\n')
	direction = -1 # ..for 'up'
	# direction = 1 # ..for 'down'
	test_move_paddle(session, csrf_token, game_id, paddle, direction)

	# Testing the end_game_session function
	# print('Testing `end_game_session` endpoint...')
	# test_end_game_session(session, csrf_token, game_id)

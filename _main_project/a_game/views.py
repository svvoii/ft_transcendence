from django.contrib.auth.decorators import login_required
from django.db import models
from .models import GameSession
from .game_logic import GameState, game_states, game_st_lock

from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.response import Response


# This function is called when the user clicks the "Create Game" button
# On the front-end in the `fetch` call to this endpoint:
# - The `user` is passed in the request body
# The logic creates a new game session if an active game session does not already exist for the user
@api_view(["POST"])
@login_required
def create_game_session(request):
	global game_states
	context = {}
	print('Create game session called.. request.data:', request.data)
	user = request.user
	game_mode = request.data.get('mode')

	# Mapping mode to number of players
	mode_to_players = {'AI': 0, 'Single': 1, 'Multi_2': 2, 'Multi_3': 3, 'Multi_4': 4}

	number_of_players = mode_to_players.get(game_mode, 1)

	active_session = GameSession.objects.filter(is_active=True).filter(
		models.Q(player1=user) | models.Q(player2=user) | models.Q(player3=user) | models.Q(player4=user)
	).first()

	if active_session:
		context['game_id'] = active_session.game_id
		context['message'] = 'Game session already exists for this user.'
		# DEBUG #
		print(f'Game session already exists, game_id: {active_session.game_id}')

		return Response(context, status=200)

	new_game_session = GameSession.objects.create(
    	player1=None,
    	player2=None,
		player3=None,
		player4=None,
		mode=number_of_players
    )
	new_game_session.save()
	context['game_id'] = new_game_session.game_id
	context['message'] = 'Game session created successfully.'

	# DEBUG #
	print(f'NEW Game session created with ID {new_game_session.game_id}')

	# Create a new game state object for the new game session
	game_states[new_game_session.game_id] = GameState()

	# Setting game_mode in the GameState object
	game_state = game_states[new_game_session.game_id]
	game_state.game_mode = game_mode
	game_state.num_players = number_of_players
 
	return Response(context, status=201)

# This function is called when the user clicks the "Join Game" button
# On the front-end in the `fetch` call to this endpoint:
# - The `game_id` is passed as a URL parameter
# - The `user` is passed in the request body
# The logic checks if the game session is active and if the user is already in the active game session
# Players are assigned to the game session in the order they join
@api_view(["POST"])
@login_required
def join_game_session(request, game_id):
	print('Join game session called.. request.data:', request.data)

	context = {}
	user = request.user

	try:
		game_session = GameSession.objects.get(game_id=game_id)
	except GameSession.DoesNotExist:
		context['message'] = 'Game session does not exist.'
		return Response(context, status=400)

	if game_session.is_active:
		if game_session.player1 == user or game_session.player2 == user or game_session.player3 == user or game_session.player4 == user:
			context['message'] = 'User is already in the game session.'
		elif not game_session.player1:
			game_session.player1 = user
		elif not game_session.player2:
			game_session.player2 = user
		elif not game_session.player3:
			game_session.player3 = user
		elif not game_session.player4:
			game_session.player4 = user
		else:
			context['message'] = 'Game session is full.'
			return Response(context, status=400)

		game_session.save()
		context['game_id'] = game_session.game_id
		context['role'] = game_session.get_role(user)
		# DEBUG #
		print(f'User {user} joined the game session with ID {game_id} as {context["role"]}')

		return Response(context, status=200)
	else:
		context['message'] = 'Game session is not active.'
		return Response(context, status=400)


# This function is called when the game is loaded to get the initial game state
# On the front-end in the `fetch` call to this endpoint:
# - The `game_id` is passed as a URL parameter
@api_view(["GET"])
@login_required
def get_game_state(request, game_id):
	global game_states
	# print('Get game state called.. request.data:', request.data)
	context = {}

	if not game_id:
		print('Game ID is required.')
		context['message'] = 'Game ID is required.'
		return Response(context, status=400)

	if game_id not in game_states:
		print(f'Game session with ID {game_id} does not exist.')
		context['message'] = 'Game session with this ID does not exist.'
		return Response(context, status=400)

	game_state = game_states[game_id]
	context = game_state.get_state()
	# print(f'Game state for ID {game_id}: {game_state.get_state()}')
	return Response(context, status=200)


# This function is called when the user presses the up or down arrow key to move the paddle
# On the front-end in the `fetch` call to this endpoint:
# - The `game_id` is passed as a URL parameter
# - The `paddle` and `direction` are passed in the request body
# - The `paddle` value must be either 1, 2, 3 or 4, representing the player's paddle
@api_view(["POST"])
@login_required
def move_paddle(request, game_id):
	global game_states
	# print('Move paddle called.. request.data:', request.data)
	context = {}
	user = request.user

	if game_id not in game_states:
		context['message'] = 'Game session with this ID does not exist.'
		return Response(context, status=400)

	game_state = game_states[game_id]

	data = request.data
	paddle = data.get('paddle')
	direction = data.get('direction')

	if paddle and direction:
		game_state.move_paddle(paddle, direction)
		# context['message'] = 'Paddle move successful.'
		context = game_state.get_state()
		return Response(context, status=200)
	
	context['message'] = 'Invalid request.'
	return Response(context, status=400)

		

# This function is called when the game is over to end the game session
# The game results and the winner are saved to the GameSession object / model
# The GameState object is deleted from the `game_states` dictionary
@api_view(["POST"])
@login_required
def end_game_session(request, game_id):
	global game_states
	context = {}

	# Check if the game id exists in the game_states dictionary
	if game_id not in game_states:
		context['message'] = 'Game session has already ended.'
		return Response(context, status=400)

	game_session = GameSession.objects.filter(game_id=game_id).first()
	if not game_session:
		context['message'] = 'Game session does not exist.'
		return Response(context, status=400)

	game_session.score1 = game_states[game_id].score1
	game_session.score2 = game_states[game_id].score2
	game_session.score3 = game_states[game_id].score3
	game_session.score4 = game_states[game_id].score4

	scores = {
		'player1': game_session.score1,
		'player2': game_session.score2,
		'player3': game_session.score3,
		'player4': game_session.score4
	}

	winner_role = max(scores, key=scores.get)
	winner = getattr(game_session, winner_role)
	
	game_session.winner = winner
	game_session.is_active = False
	game_session.save()

	# DEBUG #
	print(f'Game session ended. Winner: {winner}')
	print(f'Player 1: {game_states[game_id].score1}, Player 2: {game_states[game_id].score2}')
	print(f'Player 3: {game_states[game_id].score3}, Player 4: {game_states[game_id].score4}')
	print(f'is_active: {game_session.is_active}')

	# Delete the game state object from the dictionary
	# del game_states[game_id]

	context['message'] = 'Game session ended successfully.'
	return Response(context, status=200)


# This function is called when the user clicks the "Quit Game" button
@api_view(["POST"])
@login_required
def quit_game_session(request):
	global game_states
	context = {}
	user = request.user

	active_session = GameSession.objects.filter(is_active=True).filter(
		models.Q(player1=user) | models.Q(player2=user) | models.Q(player3=user) | models.Q(player4=user)
	).first()

	if not active_session:
		context['message'] = 'No active game session for this player.'
		return Response(context, status=204)
	
	game_id = active_session.game_id
	if game_id not in game_states:
		context['message'] = 'Game session has already ended.'
		return Response(context, status=202)

	# This will stop the game loop
	# game_states[game_id].game_over = True
	player_role = active_session.get_role(user)

	if active_session.player1 == user:
		active_session.score1 = 0
	elif active_session.player2 == user:
		active_session.score2 = 0
	elif active_session.player3 == user:
		active_session.score3 = 0
	elif active_session.player4 == user:
		active_session.score4 = 0

	active_session.save()
	context['message'] = 'Player {player_role} has quit the game.'

	print(f'{player_role} has quit the game.')
	print(f'is_active: {active_session.is_active}')

	return Response(context, status=200)


# This is an API endpoint to create a game session with 2 players
@api_view(["POST"])
@login_required
def create_game_with_2_players(request):
	global game_states
	context = {}
	
	data = request.data
	username1 = data.get('player1')
	username2 = data.get('player2')

	if not username1 or not username2:
		context['message'] = 'Both players are required.'
		return Response(context, status=400)

	player1 = User.objects.filter(username=username1).first()
	player2 = User.objects.filter(username=username2).first()

	if not player1 or not player2:
		context['message'] = 'Player does not exist.'
		return Response(context, status=400)

	active_session = GameSession.objects.filter(is_active=True).filter(
		models.Q(player1=player1) | models.Q(player2=player1) | models.Q(player1=player2) | models.Q(player2=player2)
	).first()
 
	if active_session:
		context['message'] = 'Game session already exists for these players.'
		context['game_id'] = active_session.game_id
		return Response(context, status=200)
	
	new_game_session = GameSession.objects.create(
		player1=player1,
		player2=player2,
		mode=2
	)
	new_game_session.save()

	context['game_id'] = new_game_session.game_id
	context['message'] = 'Game session created successfully.'

	# DEBUG #
	print(f'NEW Game session created with ID {new_game_session.game_id}')
	# # # # #

	# Create a new game state object for the new game session
	game_states[new_game_session.game_id] = GameState()

	# Setting game_mode in the GameState object
	game_state = game_states[new_game_session.game_id]
	game_state.game_mode = 'Multi_2'
	game_state.num_players = 2

	return Response(context, status=201)


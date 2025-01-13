import pickle
from django.contrib.auth.decorators import login_required
from django.db import models
from django.core.cache import cache
from .models import GameSession
from .game_logic import GameState
from a_user.models import Account, UserGameStats
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

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
	# DEBUG #
	print('Create game session called.. request.data:', request.data)
	# # # # #
	context = {}
	user = request.user
	data = request.data
	game_mode_string = data.get('mode')

	if not game_mode_string:
		context['message'] = 'Game mode is required.'
		# DEBUG #
		print('No Game mode is provided.')
		return Response(context, status=400)

	# Convert the game mode string to an integer
	game_modes = {'AI': 0, 'Single': 1, 'Multi_2': 2, 'Multi_3': 3, 'Multi_4': 4}
	number_of_players = game_modes.get(game_mode_string)

	active_session = GameSession.objects.filter(is_active=True).filter(
		models.Q(player1=user) | models.Q(player2=user) | models.Q(player3=user) | models.Q(player4=user)
	).first()

	if active_session:
		context['game_id'] = active_session.game_id
		context['message'] = 'Game session already exists for this user.'
		# DEBUG #
		print(f'Game session already exists, game_id: {active_session.game_id}')
		# # # # #
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
	print(f'NEW Game session created with ID {new_game_session.game_id}. Mode: {game_mode_string}')
	# # # # #

	# Create a new game state object for the new game session
	game_state = GameState()
	cache.set(new_game_session.game_id, pickle.dumps(game_state), timeout=None)	

	# Setting game_mode in the GameState object
	game_state = pickle.loads(cache.get(new_game_session.game_id))
	game_state.game_mode = game_mode_string
	game_state.num_players = number_of_players

	cache.set(new_game_session.game_id, pickle.dumps(game_state), timeout=None)

	# DEBUG #
	print(f'Cached: Game mode: {game_state.game_mode}, Number of players: {game_state.num_players}')
 
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
		context['game_id'] = game_id
		context['message'] = f'Game session with ID : { game_id } does not exist.'
		return Response(context, status=400)

	if not game_session.is_active:
		context['message'] = 'Game session is not active.'
		return Response(context, status=400)

	players = [game_session.player1, game_session.player2, game_session.player3, game_session.player4]
	if user in players:
		context['message'] = 'User is already in the game session.'
		context['role'] = game_session.get_role(user)
		# DEBUG #
		print(f'User {user} is already in an active game session with ID {game_id}')
		# # # # #
		return Response(context, status=200)

	num_players = game_session.mode
	for i in range(num_players):
		if not players[i]:
			players[i] = user
			break
	else: # If the loop completes without breaking (apparantly it is a valid syntax in Python !)
		context['message'] = 'Game session is full.'
		# DEBUG #
		print(f'Game session with ID {game_id} is full.')
		# # # # #
		return Response(context, status=400)
	
	game_session.player1, game_session.player2, game_session.player3, game_session.player4 = players

	game_session.save()
	# context['game_id'] = game_session.game_id
	context['role'] = game_session.get_role(user)
	# DEBUG #
	print(f'User {user} joined the game session with ID {game_id} as {context["role"]}')

	return Response(context, status=200)


# This function is called when the game is loaded to get the initial game state
# (On the front-end in the `fetch` call to this endpoint) - this functionality is changed to be performed via the WebSocket due possible issues with the race conditions in an async environment of the game loop
# - The `game_id` is passed as a URL parameter
@api_view(["GET"])
@login_required
def get_game_state(request, game_id):
	context = {}
	# DEBUG #
	# print('Get game state called.. request.data:', request.data)

	if not game_id:
		print('Game ID is required.')
		context['message'] = 'Game ID is required.'
		return Response(context, status=400)
	
	cached_game_state = cache.get(game_id)
	if not cached_game_state:
		print(f'Game State object with ID {game_id} does not exist.')
		context['game_id'] = game_id
		context['message'] = f'Game State object with this ID : { game_id } does not exist.'
		return Response(context, status=400)
	
	game_state = pickle.loads(cached_game_state)

	context = game_state.get_state()
	return Response(context, status=200)


# This function is called when the user presses the up or down arrow key to move the paddle
# On the front-end in the `fetch` call to this endpoint:
# - The `game_id` is passed as a URL parameter
# - The `paddle` and `direction` are passed in the request body
# - The `paddle` value must be either 1, 2, 3 or 4, representing the player's paddle
# - The `direction` value must be either -1 or 1, representing the up or down / left or right movement
@api_view(["POST"])
@login_required
def move_paddle(request, game_id):
	# print('Move paddle called.. request.data:', request.data)
	context = {}
	user = request.user

	cached_game_state = cache.get(game_id)
	if not cached_game_state:
		context['message'] = 'Game session with this ID does not exist.'
		return Response(context, status=400)

	data = request.data
	paddle = data.get('paddle')
	direction = data.get('direction')

	# DEBUG #
	# print(f'Paddle: {paddle}, Direction: {direction}')
	if paddle and direction:
		game_state = pickle.loads(cached_game_state)
		# DEBUG #
		# print(f'..before move_paddle: {game_state.get_state()}')
		game_state.move_paddle(paddle, direction)
		context = game_state.get_state()
		# DEBUG #
		# print(f'..after move_paddle: {game_state.get_state()}')
		cache.set(game_id, pickle.dumps(game_state), timeout=None)
  
		return Response(context, status=200)
	
	context['message'] = 'Invalid request.'
	return Response(context, status=400)

		

# This function is called when the game is over to end the game session
# The game results and the winner are saved to the GameSession object / model
# The GameState object is deleted from the Redis cache
@api_view(["POST"])
@login_required
def end_game_session(request, game_id):
	context = {}

	cached_game_state = cache.get(game_id)
	if not cached_game_state:	
		context['message'] = 'Game session has already ended.'
		return Response(context, status=400)

	game_session = GameSession.objects.filter(game_id=game_id).first()
	if not game_session:
		context['message'] = 'Game session does not exist.'
		return Response(context, status=400)
	
	game_state = pickle.loads(cached_game_state)

	game_session.score1 = game_state.score1
	game_session.score2 = game_state.score2
	game_session.score3 = game_state.score3
	game_session.score4 = game_state.score4

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

	# Update UserGameStats for each player
	update_user_game_stats(game_session)

	# DEBUG #
	print(f'Game session ended. Winner: {winner}')
	print(f'Player 1: {game_state.score1}, Player 2: {game_state.score2}')
	print(f'Player 3: {game_state.score3}, Player 4: {game_state.score4}')
	print(f'is_active: {game_session.is_active}')

	# Delete the game state object from the cache
	cache.delete(game_id)

	context['message'] = 'Game session ended successfully.'
	return Response(context, status=200)

# Helper function to update the UserGameStats for each player
def update_user_game_stats(game_session):
	players = [game_session.player1, game_session.player2, game_session.player3, game_session.player4]
	for player in players:
		if player:
			user_game_stats = UserGameStats.objects.get(user=player)
			is_win = (player == game_session.winner)
			user_game_stats.update_stats(is_win)


# This function is called when the user clicks the "Quit Game" button
# The logic is to mark the game session as inactive as soon as at least one player quits the game
@api_view(["POST"])
@login_required
def quit_game_session(request):
	context = {}
	user = request.user

	active_session = GameSession.objects.filter(is_active=True).filter(
		models.Q(player1=user) | models.Q(player2=user) | models.Q(player3=user) | models.Q(player4=user)
	).first()

	if not active_session:
		context['message'] = 'No active game session for this player.'
		return Response(context, status=204)
	
	game_id = active_session.game_id
	cached_game_state = cache.get(game_id)
	if not cached_game_state:
		context['message'] = 'Game session has already ended.'
		return Response(context, status=202)

	player_role = active_session.get_role(user)

	if active_session.player1 == user:
		active_session.score1 = 0
	elif active_session.player2 == user:
		active_session.score2 = 0
	elif active_session.player3 == user:
		active_session.score3 = 0
	elif active_session.player4 == user:
		active_session.score4 = 0

	if active_session.is_active:
		active_session.is_active = False

	# Notify the other players via WebSocket
	channel_layer = get_channel_layer()
	async_to_sync(channel_layer.group_send)(
		f'pong_{game_id}', {
			'type': 'game_quit',
			'message': f'{player_role} has quit the game.',
			'quitting_player': player_role
		}
	)

	# Delete the game state object from the cache
	cache.delete(game_id)

	active_session.save()
	context['message'] = 'Player {player_role} has quit the game.'

	print(f'{player_role} has quit the game.')
	print(f'is_active: {active_session.is_active}')

	return Response(context, status=200)


# This is an API endpoint to create a game session with 2 players
@api_view(["POST"])
@login_required
def create_game_with_2_players(request):
	context = {}
	
	user = request.user
	data = request.data
	username1 = data.get('player1')
	username2 = data.get('player2')

	if not username1 or not username2:
		context['message'] = 'Both players are required.'
		return Response(context, status=400)

	player1 = Account.objects.filter(username=username1).first()
	player2 = Account.objects.filter(username=username2).first()

	if not player1 or not player2:
		context['message'] = f'User {username1} or {username2} does not exist.'
		return Response(context, status=400)

	active_session = GameSession.objects.filter(is_active=True).filter(
		( models.Q(player1=player1) | models.Q(player1=player2) ) &
		( models.Q(player2=player1) | models.Q(player2=player2) )
	).first()
 
	if active_session:
		context['message'] = 'Game session already exists for these players.'
		context['game_id'] = active_session.game_id
		context['role'] = active_session.get_role(user)
		# DEBUG #
		print(f'Game session already exists for players {username1} and {username2}. Game ID: {active_session.game_id}. Role: {context["role"]}')
		# # # # #
		return Response(context, status=200)
	
	new_game_session = GameSession.objects.create(
		player1=player1,
		player2=player2,
		mode=2
	)
	new_game_session.save()

	context['game_id'] = new_game_session.game_id
	context['role'] = new_game_session.get_role(user)
	context['message'] = 'Game session created successfully.'

	# DEBUG #
	print(f'NEW Game session created with ID {new_game_session.game_id}')
	# # # # #

	# Create a new game state object for the new game session
	game_state = GameState()
	cache.set(new_game_session.game_id, pickle.dumps(game_state), timeout=None)

	# Setting game_mode in the GameState object
	game_state = pickle.loads(cache.get(new_game_session.game_id))
	game_state.game_mode = 'Multi_2'
	game_state.num_players = 2

	cache.set(new_game_session.game_id, pickle.dumps(game_state), timeout=None)

	# DEBUG #
	print(f'Cached: Game mode: {game_state.game_mode}, Number of players: {game_state.num_players}')

	return Response(context, status=201)

# This is an internal version of the above function for use in the tournament logic
def create_game_with_2_players_internal(username1, username2):
	context = {}

	if not username1 or not username2:
		context['message'] = 'Both players are required.'
		return context, 400

	player1 = Account.objects.filter(username=username1).first()
	player2 = Account.objects.filter(username=username2).first()

	if not player1 or not player2:
		context['message'] = f'User {username1} or {username2} does not exist.'
		return context, 400
	
	new_game_session = GameSession.objects.create(
		player1=player1,
		player2=player2,
		mode=2
	)
	new_game_session.save()

	context['game_id'] = new_game_session.game_id
	# context['role'] = new_game_session.get_role(user)
	context['message'] = 'Game session created successfully.'

	# DEBUG #
	print(f'NEW Game session created with ID {new_game_session.game_id}')
	# # # # #

	# Create a new game state object for the new game session
	game_state = GameState()
	cache.set(new_game_session.game_id, pickle.dumps(game_state))

	# Setting game_mode in the GameState object
	game_state = pickle.loads(cache.get(new_game_session.game_id))
	game_state.game_mode = 'Multi_2'
	game_state.num_players = 2

	cache.set(new_game_session.game_id, pickle.dumps(game_state))

	# DEBUG #
	print(f'Cached: Game mode: {game_state.game_mode}, Number of players: {game_state.num_players}')

	return context, 201


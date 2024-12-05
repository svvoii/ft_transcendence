from django.contrib.auth.decorators import login_required
from .models import GameSession
from .game_logic import GameState, game_states

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
	print('Create game session called.. request.data:', request.data)
	user = request.user
	context = {}
	active_session = GameSession.objects.filter(is_active=True).filter(player1=user).first()
	if not active_session:
		active_session = GameSession.objects.filter(is_active=True).filter(player2=user).first()

	if active_session:
		context['game_id'] = active_session.game_id
		context['message'] = 'Game session already exists for this user.'
		return Response(context, status=200)

	new_game_session = GameSession.objects.create(player1=None, player2=None)
	new_game_session.save()
	context['game_id'] = new_game_session.game_id
	context['message'] = 'Game session created successfully.'

	# Create a new game state object for the new game session
	game_states[new_game_session.game_id] = GameState()
 
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
	# game_id = request.data.get('game_id')
	try:
		game_session = GameSession.objects.get(game_id=game_id)
	except GameSession.DoesNotExist:
		context['message'] = 'Game session does not exist.'
		return Response(context, status=400)

	if game_session.is_active:
		if game_session.player1 == user or game_session.player2 == user:
			context['message'] = 'User already joined the game session.'
			context['game_id'] = game_session.game_id
			context['role'] = 'player1' if game_session.player1 == user else 'player2'
		elif not game_session.player1:
			game_session.player1 = user
			context['message'] = 'Player 1 joined the game session.'
			context['role'] = 'player1'
			game_session.save()
		elif not game_session.player2:
			game_session.player2 = user
			context['message'] = 'Player 2 joined the game session.'
			context['role'] = 'player2'
			game_session.save()
		else:
			context['message'] = 'Game session is full.'
			return Response(context, status=400)
        # game_session.save()
		context['game_id'] = game_session.game_id
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
	# print(f'Game state for ID {game_id}: {game_state.get_state()}')
	return Response(game_state.get_state(), status=200)


# This function is called when the user presses the up or down arrow key to move the paddle
# On the front-end in the `fetch` call to this endpoint:
# - The `game_id` is passed as a URL parameter
# - The `paddle` and `direction` are passed in the request body
# - The `paddle` value must be either 1 or 2, representing the player's paddle
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
		context['message'] = 'Paddle move successful.'
		return Response(context, status=200)
	
	context['message'] = 'Invalid request.'
	return Response(context, status=400)

		

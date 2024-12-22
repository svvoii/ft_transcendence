from django.contrib.auth.decorators import login_required
from django.db.models import Q
from .models import GameSession
from .game_logic import GameState, game_states
from a_user.models import Account

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

	# user = request.user
	user_to_join = request.data.get('user_to_join')
	user = Account.objects.filter(username=user_to_join).first()
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
	context = game_state.get_state()
	# print(f'Game state for ID {game_id}: {game_state.get_state()}')
	return Response(context, status=200)


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
	winner = game_session.player1 if game_states[game_id].score1 > game_states[game_id].score2 else game_session.player2
	game_session.winner = winner
	game_session.is_active = False
	game_session.save()

	# DEBUG #
	print(f'Game session ended. Winner: {winner}')
	print(f'Player 1: {game_states[game_id].score1}, Player 2: {game_states[game_id].score2}')
	print(f'is_active: {game_session.is_active}')

	del game_states[game_id]

	context['message'] = 'Game session ended successfully.'
	return Response(context, status=200)


# This function is called when the user clicks the "Quit Game" button
@api_view(["POST"])
@login_required
def quit_game_session(request):
	global game_states
	context = {}
	user = request.user
	active_session = GameSession.objects.filter(is_active=True).filter(player1=user).first()
	if not active_session:
		active_session = GameSession.objects.filter(is_active=True).filter(player2=user).first()
	
	if not active_session:
		context['message'] = 'No active game session for this player.'
		return Response(context, status=300)
	
	game_id = active_session.game_id
	if game_id not in game_states:
		context['message'] = 'Game session has already ended.'
		return Response(context, status=400)

	game_states[game_id].game_over = True
	active_session.score1 = game_states[game_id].score1
	active_session.score2 = game_states[game_id].score2
	active_session.winner = active_session.player1 if active_session.player2 == user else active_session.player2
	active_session.is_active = False
	active_session.save()
	context['message'] = 'Player quit the game session.'

	print(f'Player {active_session.winner} wins the game.')
	print(f'Player 1: {active_session.score1}, Player 2: {active_session.score2}')
	print(f'is_active: {active_session.is_active}')

	del game_states[game_id]

	return Response(context, status=200)


# This function is called when the user clicks the "Invite to Game" button
@api_view(["POST"])
@login_required
def invite_to_game(request):
	global game_states
	user = request.user
	context = {}

	# DEBUG #
	print('invite_to_game called.. request.data:', request.data)

	# first get the users from the request
	player1 = request.data.get('player1')
	player2 = request.data.get('player2')

	# check if both players are provided
	if not player1 or not player2:
		context['message'] = 'Both players must be provided.'
		return Response(context, status=400)
	
	# check which player is the the requestsing user and which is the other user
	requesting_user = user;
	if (player1 == user.username):
		other_user = Account.objects.filter(username=player2).first()
	elif (player2 == user.username):
		other_user = Account.objects.filter(username=player1).first()
	else:
		context['message'] = 'Requesting user is not included in the request.'
		return Response(context, status=400)

	# check if the other user exists
	if not other_user:
		context['message'] = 'Other user does not exist.'
		return Response(context, status=400)

	# at this point we have the requesting user and the other user

	# DEBUG #
	# print('player1:', player1, ' player2:', player2)
	# print('requesting_user:', requesting_user.username, ' other_user:', other_user.username)

	# search for active sessions where the requesting user and the other user are both players
	active_session = GameSession.objects.filter(
		Q(is_active=True) & 
		( Q(player1=requesting_user) | Q(player2=requesting_user) ) &
		( Q(player1=other_user) | Q(player2=other_user) )
	).first()

	# DEBUG #
	# print('active_session:', active_session)

	# check if there is an active game session between the two users
	if active_session:
		context['game_id'] = active_session.game_id
		context['message'] = 'Game session already exists for these users.'
		return Response(context, status=200)

	# create a new game session if one does not already exist
	new_game_session = GameSession.objects.create(player1=requesting_user, player2=other_user)
	new_game_session.save()
	context['game_id'] = new_game_session.game_id
	context['message'] = 'Game session created successfully.'

	# Add the new game state object to the game_states dictionary
	game_states[new_game_session.game_id] = GameState()

	return Response(context, status=201)
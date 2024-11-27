from django.shortcuts import render
# from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from .models import GameSession

from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.response import Response


# @api_view(["GET"])
# def pong_test_func(request):
#   retStr = "This is going to be legendary."
#   data = { retStr }
#   return Response(data)

@login_required
@api_view(["POST"])
def validate_game_id(request):
	game_id = request.data.get('game_id')
	if not game_id:
		return Response({'is_valid': False}, status=400)
	try:
		game_session = GameSession.objects.get(session_id=game_id)
		return Response({'is_valid': True}, status=200)
	except GameSession.DoesNotExist:
		return Response({'is_valid': False, 'error': 'Game session does not exist'}, status=404)
	except Exception as e:
		return Response({'is_valid': False, 'error': str(e)}, status=400)


# @csrf_exempt
@login_required
@api_view(["POST"])
def create_game_session(request):
	user = request.user
	try:
		# Check if user already has an active game session as player1 or player2
		active_session = GameSession.objects.filter(is_active=True).filter(player1=user).first()
		if not active_session:
			active_session = GameSession.objects.filter(is_active=True).filter(player2=user).first()

		if active_session:
			# DEBUG #
			print("User already has an active game session, id:", active_session.session_id)
			# # # # #
			return Response({
				'game_id': active_session.session_id,
				'game_link': f"{request.scheme}://{request.get_host()}/game/join/{active_session.session_id}/"
			}, status=200)
		
		# Create a new game session without any players assigned !!!
		new_game_session = GameSession.objects.create(player1=None, player2=None)
		game_link = f"{request.scheme}://{request.get_host()}/game/join/{new_game_session.session_id}/"

		# DEBUG #
		print("New game session created, id:", new_game_session.session_id)
		# # # # #

		return Response({
			'game_id': new_game_session.session_id,
			'game_link': game_link
		}, status=201)

	except Exception as e:
		return Response({'error': str(e)}, status=400)
	return Response({'error': 'Something went wrong creating the game session'}, status=400)


# @csrf_exempt
@login_required
@api_view(["POST"])
def join_game_session(request, game_id):
	print("join_game_session called...")
	user = request.user
	try:
		role = request.data.get('player_role')
		game_session = GameSession.objects.get(session_id=game_id)

		# Assign the player to a game session based on the role
		if role == 'player1':
			if game_session.player1 is None:
				game_session.player1 = user
				game_session.save()
			elif game_session.player1 != user:
				return Response({'error': 'Player 1 is already assigned to the game session'}, status=400)
		elif role == 'player2':
			if game_session.player2 is None:
				game_session.player2 = user
				game_session.save()
			elif game_session.player2 != user:
				return Response({'error': 'Player 2 is already assigned to the game session'}, status=400)
		elif role == 'spectator':
			# Some otehr logic for spectators if needed
			print("Spectator clicked join game session")
			pass
		
		return Response({
			'game_id': game_session.session_id,
			# 'game_link': f"{request.scheme}://{request.get_host()}/game/join/{game_session.session_id}/"
		}, status=200)

	except GameSession.DoesNotExist:
		return Response({'error': 'Game session does not exist'}, status=404)
	except Exception as e:
		return Response({'error': str(e)}, status=400)

	return Response({'error': 'Something went wrong joining the game session'}, status=400)


# @csrf_exempt
@login_required
@api_view(["POST"])
def role_availability_check(request):
	game_id = request.data.get('game_id')
	role = request.data.get('player_role')
	if not game_id or not role:
		return Response({'error': 'Invalid data'}, status=400)
	try:
		game_session = GameSession.objects.get(session_id=game_id)
		if role == 'player1':
			if game_session.player1 is None:
				return Response({'is_taken': False}, status=200)
			else:
				return Response({'is_taken': True, 'error': 'Player 1 is already assigned.'}, status=400)
		elif role == 'player2':
			if game_session.player2 is None:
				return Response({'is_taken': False}, status=200)
			else:
				return Response({'is_taken': True, 'error': 'Player 2 is already assigned.'}, status=400)
		elif role == 'spectator':
			return Response({'is_taken': False}, status=200)
	except Exception as e:
		return Response({'error': str(e)}, status=400)
	return Response({'error': 'Something went wrong checking the role availability'}, status=400)

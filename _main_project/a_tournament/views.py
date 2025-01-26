from django.shortcuts import render, HttpResponse
from django.http import Http404, JsonResponse, HttpRequest
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from django.db import models

from .models import Tournament, Round_1, Round_2, REQUIRED_NB_PLAYERS
from .consumers import TournamentLobbyConsumer
import json
# from a_user.models import Account, BlockedUser

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from a_game.models import GameSession

import logging

logger = logging.getLogger(__name__)


#CREATE TOURNAMENT
@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_tournament(request):
	tournament = Tournament.objects.create()
	tournament_url = tournament.tournament_name
	tournament.players.add(request.user)
	round_1 = Round_1.objects.create(tournament_name = tournament)
	round_2 = Round_2.objects.create(tournament_name = tournament)
	tournament.round_1 = round_1
	tournament.round_2 = round_2
	tournament.create_round_1_matches()
	tournament.create_round_2_match();

	tournament.save()
	# Tournament.tournament_ids.add(tournament_url)
	# print(Tournament)
	return Response({'status': 'success', 
		'message': 'Tournament created successfully.', 
		'url': f'{tournament_url}' }, 
		status=status.HTTP_201_CREATED)

#GET TOURNAMENT
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def tournament_check_in(request, tournament_name):
	if Tournament.objects.filter(tournament_name=tournament_name).exists():
		tournament = get_object_or_404(Tournament, tournament_name=tournament_name)
		nb_players = tournament.players.count()
		if not tournament.players.filter(username=request.user.username).exists() and nb_players == REQUIRED_NB_PLAYERS:
				return Response({'status': 'error', 
					'nb_players': nb_players, 
					'request.user.username': request.user.username,
					'request.user.id': request.user.id,
					'message': 'Tournament is full.'}, 
					status=status.HTTP_400_BAD_REQUEST)
		else:
			return Response({'status': 'success', 
				'nb_players': nb_players,
				'request.user.username': request.user.username,
				'request.user.id': request.user.id,
				'message': 'Tournament is open.'}, 
				status=status.HTTP_200_OK)
	else:
		return Response({'status': 'error', 
				'request.user.username': request.user.username,
				'request.user.id': request.user.id,
				'message': 'Tournament does not exist.'}, 
				status=status.HTTP_400_BAD_REQUEST)


# GET TOURNAMENT
# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def get_tournament(request, tournament_name):
# 	if Tournament.objects.filter(tournament_name=tournament_name).exists():
# 		tournament = get_object_or_404(Tournament, tournament_name=tournament_name)

# 		if not tournament.players.filter(username=request.user.username).exists():
# 			tournament.players.add(request.user)

# 		players = [player.username for player in tournament.players.all()]
# 		nb_players = f'{len(players)}'
# 		max_nb_players_reached = int(nb_players) == REQUIRED_NB_PLAYERS

# 		player = tournament.players.get(username=request.user.username)
# 		list_of_tournaments = [tournament.tournament_name for tournament in Tournament.objects.all()]

# 		nb_players_in_each = [tournament.players.count() for tournament in Tournament.objects.all()]

# 		update_round_1_players(request, tournament_name)

# 		return Response({'status': 'success', 
# 			'players': players,
# 			'nb_players': nb_players,
# 			'list of tournaments': list_of_tournaments,
# 			'nb_players_in_each': nb_players_in_each,
# 			'max_nb_players_reached': max_nb_players_reached}, 
# 			status=status.HTTP_200_OK)
# 	else:
# 		return Response({'status': 'error', 
# 			'message': 'Tournament does not exist.'}, 
# 			status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def remove_player_from_tournament(request, tournament_name):
	if Tournament.objects.filter(tournament_name=tournament_name).exists():
		tournament = get_object_or_404(Tournament, tournament_name=tournament_name)
		if tournament.players.filter(username=request.user.username).exists() and tournament.players.count() < REQUIRED_NB_PLAYERS:
			player = get_object_or_404(tournament.players, username=request.user.username)
			tournament.players.remove(player)
			tournament_nb_players = tournament.players.count()
			tournament.round_1.players.remove(player)

			if tournament_nb_players == 0:
				tournament.delete()
				return Response({'status': 'success', 
					'message': 'Tournament deleted as there are no players left.'}, 
					status=status.HTTP_200_OK)

			players = [player.username for player in tournament.players.all()]
			nb_players = f'{len(players)}'
			max_nb_players_reached = int(nb_players) == REQUIRED_NB_PLAYERS
			return Response({'status': 'success', 
				'players': players,
				'nb_players': nb_players,
				'max_nb_players_reached': max_nb_players_reached}, 
				status=status.HTTP_200_OK)
		
		elif tournament.players.count() == REQUIRED_NB_PLAYERS:
			return Response({'status': 'error', 
				'message': 'Tournament has already started.',
				'request.user.username': request.user.username,}, 
				status=status.HTTP_200_OK)

		else:
			return Response({'status': 'error', 
				'message': 'Player does not exist in the tournament.',
				'request.user.username': request.user.username,}, 
				status=status.HTTP_400_BAD_REQUEST)

	else:
		return Response({'status': 'error', 
			'message': 'Tournament does not exist.'}, 
			status=status.HTTP_400_BAD_REQUEST)


#START TOURNAMENT
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_game_id_round_1(request, tournament_name):
	if Tournament.objects.filter(tournament_name=tournament_name).exists():
		tournament = get_object_or_404(Tournament, tournament_name=tournament_name)

		player_names = [player.username for player in tournament.players.all()]

		user_game_id = None
		has_started = False

		if not (tournament.round_1.game_session_1 or tournament.round_1.game_session_2):
			print('[DEBUG] Round_1 NOT CREATED')

		if (len(player_names) == 4):
			if request.user.username in [player_names[0], player_names[1]]:
				has_started = tournament.round_1.game_session_1.has_started
				user_game_id = tournament.round_1.game_session_1.game_id
			elif request.user.username in [player_names[2], player_names[3]]:
				has_started = tournament.round_1.game_session_2.has_started
				user_game_id = tournament.round_1.game_session_2.game_id

		else:
			# print('[NOT ENOUGH PLAYERS ERROR]', player_names)
			return Response({'status': 'error', 
				'nb_players': len(player_names),
				'message': 'Not enough players to start the tournament.'}, 
				status=status.HTTP_400_BAD_REQUEST
			)
		
		return Response({'status': 'success',
			'user_game_id': user_game_id,
			'user1round1': f'{player_names[0]}',
			'user2round1': f'{player_names[1]}',
			'user3round1': f'{player_names[2]}',
			'user4round1': f'{player_names[3]}',
			'user1round2': '',
			'user2round2': '',
			'userWinner': '',
			'has_started': has_started,
			'message': 'Round 1 started successfully.'},
			status=status.HTTP_200_OK)
	else:
		return Response({'status': 'error', 
			'message': 'Tournament does not exist.'}, 
			status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def update_round_2_players(request, tournament_name):
	if Tournament.objects.filter(tournament_name=tournament_name).exists():
		tournament = get_object_or_404(Tournament, tournament_name=tournament_name)

		round_2 = tournament.round_2
		round_2.players.add(request.user)
		player_names = [player.username for player in round_2.players.all()]

		try:
			user_index = player_names.index(request.user.username)
		except ValueError:
			user_index = -1

		if user_index == 0:
			round_2.game_session.player1 = request.user
		elif user_index == 1:
			round_2.game_session.player2 = request.user
		else:
			return Response({'status': 'error',
				'message': '[Updating round_2 players] This user is not supposed to be in round_2'},
				status=status.HTTP_400_BAD_REQUEST)
			
		round_2.game_session.save()
		round_2.save()
		tournament.save()

		return Response({'status': 'success',
			'message': 'Player added successfully to round_2.',
			'players': player_names},
			status=status.HTTP_200_OK)
	else:
		return Response({'status': 'error', 
			'message': 'Tournament does not exist.'}, 
			status=status.HTTP_400_BAD_REQUEST)

# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def update_round_1_players(request, tournament_name):
# 	if Tournament.objects.filter(tournament_name=tournament_name).exists():
# 		tournament = get_object_or_404(Tournament, tournament_name=tournament_name)

# 		round_1 = tournament.round_1
# 		round_1.players.add(request.user)
# 		# round_1.players.add(tournament.round_1.game_session_2.winner)

# 		if (not round_1.game_session_1 or not round_1.game_session_2):
# 			return Response({'status': 'error',
# 				'message': 'Game sessions not created.'},
# 				status=status.HTTP_200_OK)
		
# 		game_session_1 = round_1.game_session_1
# 		game_session_2 = round_1.game_session_2

# 		players = [player.username for player in round_1.players.all()]
# 		try:
# 			user_index = players.index(request.user.username)
# 		except ValueError:
# 			user_index = -1


# 		session_1_players = [game_session_1.player1, game_session_1.player2]
# 		session_2_players = [game_session_2.player1, game_session_2.player2]
# 		print('Session 1 Players:', session_1_players)
# 		print('Session 2 Players:', session_2_players)
		
# 		if user_index == 0:
# 			game_session_1.player1 = request.user
# 		elif user_index == 1:
# 			game_session_1.player2 = request.user
# 		elif user_index == 2:
# 			game_session_2.player1 = request.user
# 		elif user_index == 3:
# 			game_session_2.player2 = request.user
# 		else:
# 			return Response({'status': 'error',
# 				'message': '[Updating round_1 players] This user is not supposed to be in round_1'},
# 				status=status.HTTP_400_BAD_REQUEST)
			
# 		round_1.game_session_1.save()
# 		round_1.game_session_2.save()
# 		round_1.save()
# 		tournament.save()

# 		player_names = [player.username for player in round_1.players.all()]

# 		return Response({'status': 'success',
# 			'message': 'Player added successfully to round_1.',
# 			'players': player_names},
# 			status=status.HTTP_200_OK)
# 	else:
# 		return Response({'status': 'error', 
# 			'message': 'Tournament does not exist.'}, 
# 			status=status.HTTP_400_BAD_REQUEST)


# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def get_game_id_round_2(request, tournament_name):
# 	if Tournament.objects.filter(tournament_name=tournament_name).exists():
# 		tournament = get_object_or_404(Tournament, tournament_name=tournament_name)

# 		if not (tournament.round_2.game_session):
# 			return Response({'status': 'error', 
# 				'message': 'Round 2 has not been created yet.'}, 
# 				status=status.HTTP_200_OK)
		

# 		player_names = [player.username for player in tournament.round_2.players.all()]

# 		if (len(player_names) != 2):
# 			return Response({'status': 'error', 
# 				'message': 'Not enough players to start round 2.'}, 
# 				status=status.HTTP_200_OK)

# 		user_game_id = tournament.round_2.game_session.game_id

# 		return Response({'status': 'success',
# 			'user_game_id': user_game_id,
# 			'user1round2': f'{player_names[0]}',
# 			'user2round2': f'{player_names[1]}',
# 			'message': 'Round 2 started successfully.'},
# 			status=status.HTTP_200_OK)
# 	else:
# 		return Response({'status': 'error', 
# 			'message': 'Tournament does not exist.'}, 
# 			status=status.HTTP_400_BAD_REQUEST)


#For GameLogic.js, when closing the game, checking if the game is part of a tournament
#If so, send a Websocket that informs that the game has ended
@api_view(['GET'])
def is_part_of_tournament(request, game_id):
	gameSession = get_object_or_404(GameSession, game_id=game_id)

	print('Game Session:', gameSession.game_id)
	if not(gameSession.player1):
		print('NO PLAYER 1')
	if not (gameSession.player2):
		print('NO PLAYER 2')

	is_round_1_game_1 = Round_1.objects.filter(
		models.Q(game_session_1=gameSession)
	).exists()

	is_round_1_game_2 = Round_1.objects.filter(
		models.Q(game_session_2=gameSession)
	).exists()

	is_round_2_game = Round_2.objects.filter(
		models.Q(game_session=gameSession)
	).exists()

	if gameSession.player1:
		player1_name = gameSession.player1.username
	else:
		player1_name = ''
		
	if gameSession.player2:
		player2_name = gameSession.player2.username
	else:
		player2_name = ''

	if is_round_1_game_1:
		return Response({'status': 'Success', 'player1': player1_name, 'player2': player2_name, 'game_index': 'round_1_game_1'}, status=status.HTTP_200_OK)
	elif is_round_1_game_2:
		return Response({'status': 'Success', 'player1': player1_name, 'player2': player2_name, 'game_index': 'round_1_game_2'}, status=status.HTTP_200_OK)
	elif is_round_2_game:
		return Response({'status': 'Success', 'player1': player1_name, 'player2': player2_name, 'game_index': 'round_2_game'}, status=status.HTTP_200_OK)
	else:
		return Response({'status': 'Error'}, status=status.HTTP_400_BAD_REQUEST)
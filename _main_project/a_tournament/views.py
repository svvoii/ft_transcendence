from django.shortcuts import render
from django.http import Http404, JsonResponse
from .models import Tournament, Round_1, Round_2, REQUIRED_NB_PLAYERS
# from a_user.models import Account, BlockedUser
from .consumers import TournamentLobbyConsumer
import json
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from django.shortcuts import get_object_or_404



# Create your views here.

@permission_classes([IsAuthenticated])
def tournament_view(request):
	tournament_room = get_object_or_404(Tournament, tournament_name=tournament_name)
	tournament_messages = tournament.tournament_messages.all()[:20]
    
	other_user = None
	
	if tournament_room.tournament_name:
		if request.user not in tournament_room.players.all():
			tournament_room.members.add(request.user)


	context = {
		'tournament_room': tournament_room,
		'tournament_messages': tournament_messages,
	}

	return render(request, 'a_tournament/tournament.html', context)


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
    tournament.updateNbPlayers()
    round_1 = Round_1.objects.create(tournament_name = tournament)
    round_2 = Round_2.objects.create(tournament_name = tournament)
    tournament.round_1 = round_1
    tournament.round_2 = round_2
    tournament.save()
    # Tournament.tournament_ids.add(tournament_url)
    print(Tournament)
    return Response({'status': 'success', 
        'message': 'Tournament created successfully.', 
        'url': f'{tournament_url}' }, 
        status=status.HTTP_201_CREATED)

#GET TOURNAMENT
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_tournament(request, tournament_name):
    if Tournament.objects.filter(tournament_name=tournament_name).exists():
        tournament = get_object_or_404(Tournament, tournament_name=tournament_name)
        if not tournament.players.filter(username=request.user.username).exists():
            tournament.players.add(request.user)
            tournament.updateNbPlayers()
        tournament_nb_players = tournament.nb_players
        players = [player.username for player in tournament.players.all()]
        nb_players = f'{tournament_nb_players}'
        max_nb_players_reached = int(nb_players) == REQUIRED_NB_PLAYERS
        return Response({'status': 'success', 
            'players': players,
            'nb_players': nb_players,
            'max_nb_players_reached': max_nb_players_reached}, 
            status=status.HTTP_200_OK)
    else:
        return Response({'status': 'error', 
            'message': 'Tournament does not exist.'}, 
            status=status.HTTP_400_BAD_REQUEST)



#GET TOURNAMENT
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def tournament_check_in(request, tournament_name):
    if Tournament.objects.filter(tournament_name=tournament_name).exists():
        tournament = get_object_or_404(Tournament, tournament_name=tournament_name)
        nb_players = tournament.nb_players
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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def remove_player_from_tournament(request, tournament_name):
    if Tournament.objects.filter(tournament_name=tournament_name).exists():
        tournament = get_object_or_404(Tournament, tournament_name=tournament_name)
        if tournament.players.filter(username=request.user.username).exists():
            player = get_object_or_404(tournament.players, username=request.user.username)
            tournament.players.remove(player)
            tournament.updateNbPlayers()
            tournament_nb_players = tournament.nb_players
            players = [player.username for player in tournament.players.all()]
            nb_players = f'{tournament_nb_players}'
            max_nb_players_reached = int(nb_players) == REQUIRED_NB_PLAYERS
            return Response({'status': 'success', 
                'players': players,
                'nb_players': nb_players,
                'max_nb_players_reached': max_nb_players_reached}, 
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


#DELETE TOURNAMENT
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_tournament(request, tournament_name):
    data = request.data
    tournamentName = data.get('name')
    if Tournament.objects.filter(tournament_name=tournamentName).exists():
        tournament = get_object_or_404(Tournament, tournament_name=tournamentName)
        tournament.delete()
        return Response({'status': 'success', 'tournament_name': f'{tournamentName}', 'message': 'Tournament deleted successfully.'}, status=status.HTTP_200_OK)
    else:
        return Response({'status': 'error', 'message': 'Tournament does not exist.'}, status=status.HTTP_400_BAD_REQUEST)
  

#START TOURNAMENT
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def start_round_1(request, tournament_name):
    if Tournament.objects.filter(tournament_name=tournament_name).exists():
        tournament = get_object_or_404(Tournament, tournament_name=tournament_name)
        for player in tournament.players.all():
            tournament.round_1.players.add(player)
        
        return Response({'status': 'success',
            'player_1': f'{tournament.round_1.players[0]}',
            'player_2': f'{tournament.round_1.players[1]}',
            'player_3': f'{tournament.round_1.players[2]}',
            'player_4': f'{tournament.round_1.players[3]}',
            
            'message': 'Round 1 started successfully.'},
            status=status.HTTP_200_OK)
    else:
        return Response({'status': 'error', 
            'message': 'Tournament does not exist.'}, 
            status=status.HTTP_400_BAD_REQUEST)


            # 'match_1_player_1': f'{tournament.round_1.players[0]}',
            # 'match_1_player_2': f'{tournament.round_1.players[1]}',
            # 'match_2_player_1': f'{tournament.round_1.players[2]}',
            # 'match_2_player_2': f'{tournament.round_1.players[3]}'
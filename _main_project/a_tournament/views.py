from django.shortcuts import render
from django.http import Http404, JsonResponse
from .models import Tournament
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


@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_tournament(request):
    # data = json.loads(request.body)
    # data = request.data
    # tournamentName = data.get('name')
    # url = tournamentName.
    tournament = Tournament.objects.create()
    tournament_url = tournament.tournament_name;
    return Response({'status': 'success', 'message': 'Tournament created successfully.', 'url': f'{tournament_url}' }, status=status.HTTP_201_CREATED)


# @csrf_exempt
# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def create_tournament(request):
#     # data = json.loads(request.body)
#     data = request.data
#     tournamentName = data.get('name')
#     url = tournamentName.
#     if not Tournament.objects.filter(tournament_name=tournamentName).exists():
#         Tournament.objects.create(tournament_name=tournamentName)
#         return Response({'status': 'success', 'message': 'Tournament created successfully.', 'url': }, status=status.HTTP_201_CREATED)
#     else:
#         return Response({'status': 'error', 'message': 'Tournament already exists.'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_tournament(request, tournament_name):
    data = request.data
    tournamentName = data.get('name')
    if Tournament.objects.filter(tournament_name=tournamentName).exists():
        tournament = get_object_or_404(Tournament, tournament_name=tournamentName)
        tournament.delete()
        return Response({'status': 'Tournament deleted'})
    else:
        return Response({'status': 'error', 'message': 'Tournament does not exist.'}, status=status.HTTP_400_BAD_REQUEST)
  

def trigger_server_message(request):
    consumer = TournamentLobbyConsumer()
    consumer.send_server_message()
    return JsonResponse({'status': 'Message sent'})
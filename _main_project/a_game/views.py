from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from . import models

from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.response import Response



@api_view(["POST"])
@login_required
def create_game_session(request):
	user = request.user
	context = {}
	active_session = models.GameSession.objects.filter(is_active=True).filter(player1=user).first()
	if not active_session:
		active_session = models.GameSession.objects.filter(is_active=True).filter(player2=user).first()

	if active_session:
		context['game_id'] = active_session.game_id
		context['message'] = 'Game session already exists for this user.'
		return Response(context, status=400)

	new_game_session = models.GameSession.objects.create(player1=None, player2=None)
	new_game_session.save()
	context['game_id'] = new_game_session.game_id
	context['message'] = 'Game session created successfully.'
	return Response(context, status=201)


@api_view(["POST"])
@login_required
def join_game_session(request):
    user = request.user
    context = {}
    game_id = request.data.get('game_id')
    game_session = models.GameSession.objects.filter(game_id=game_id).first()

    if not game_session:
        context['message'] = 'Game session does not exist.'
        return Response(context, status=400)

    if game_session.is_active:
        if not game_session.player1:
            game_session.player1 = user
            context['message'] = 'Player 1 joined the game session.'
            context['role'] = 'player1'
        elif not game_session.player2:
            game_session.player2 = user
            context['message'] = 'Player 2 joined the game session.'
            context['role'] = 'player2'
        else:
            # Check if there are already 2 spectators
            spectators = game_session.spectators.all()
            if len(spectators) < 2:
                game_session.spectators.add(user)
                context['message'] = 'Joined as spectator.'
                context['role'] = 'spectator'
            else:
                context['message'] = 'Game session is full.'
                return Response(context, status=400)

        game_session.save()
        context['game_id'] = game_session.game_id
        return Response(context, status=200)
    else:
        context['message'] = 'Game session is not active.'
        return Response(context, status=400)

# @api_view(["POST"])
# @login_required
# def join_game_session(request):
# 	user = request.user
# 	context = {}
# 	game_id = request.data.get('game_id')
# 	game_session = models.GameSession.objects.filter(game_id=game_id).first()

# 	if not game_session:
# 		context['message'] = 'Game session does not exist.'
# 		return Response(context, status=400)

# 	if game_session.is_active:
# 		if not game_session.player1:
# 			game_session.player1 = user
# 			context['message'] = 'Player 1 joined the game session.'
# 		elif not game_session.player2:
# 			game_session.player2 = user
# 			context['message'] = 'Player 2 joined the game session.'
# 		else:
# 			context['message'] = 'Joined as spectator.'

# 		game_session.save()
# 		context['game_id'] = game_session.game_id
# 		return Response(context, status=200)
# 	else:
# 		context['message'] = 'Game session is not active.'
# 		return Response(context, status=400)

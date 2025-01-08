# from django.http import Http404, JsonResponse, HttpRequest
# from django.shortcuts import get_object_or_404

# from .models import Tournament, Round_1, Round_2
# import json

# from a_game.views import create_game_with_2_players_internal


# #create the first round of the tournament
# def create_round_1_matches(tournament_name):
#     if Tournament.objects.filter(tournament_name=tournament_name).exists():
#         tournament = get_object_or_404(Tournament, tournament_name=tournament_name)

#         if not tournament.round_1:
#             round_1 = Round_1.objects.create(tournament=tournament)
#             tournament.round_1 = round_1
#             tournament.save()

#         for player in tournament.players.all():
#             tournament.round_1.players.add(player)

#         player_names = [player.username for player in tournament.round_1.players.all()]

#         match_1_context = create_game_with_2_players_internal(player_names[0], player_names[1])
#         game_id_1 = match_1_context[0]['game_id']


#         match_2_context = create_game_with_2_players_internal(player_names[2], player_names[3])
#         game_id_2 = match_2_context[0]['game_id']


#         tournament.round_1.game_id_1 = game_id_1
#         tournament.round_1.game_id_2 = game_id_2

#         print('[create function] tournament.round_1.game_id_1', tournament.round_1.game_id_1)
#         print('[create function] tournament.round_1.game_id_2', tournament.round_1.game_id_2)

#         tournament.save()

#         return 200

#     else:
#         return 400
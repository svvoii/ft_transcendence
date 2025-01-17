from django.urls import path
from . import views

app_name = 'a_tournament'

urlpatterns = [
    path('create_tournament/', views.create_tournament, name='create_tournament'),
    # path('delete_tournament/', views.delete_tournament, name='delete_tournament'),
    # path('delete_tournament/<str:tournament_name>/', views.delete_tournament, name='delete_tournament'),
    path('get_tournament/<str:tournament_name>/', views.get_tournament, name='get_tournament'),
    path('tournament_check_in/<str:tournament_name>/', views.tournament_check_in, name='tournament_check_in'),
    path('remove_player_from_tournament/<str:tournament_name>/', views.remove_player_from_tournament, name='remove_player_from_tournament'),
    # path('start_round_1/<str:tournament_name>/', views.start_round_1, name='start_round_1'),
    path('get_game_id_round_1/<str:tournament_name>/', views.get_game_id_round_1, name='get_game_id_round_1'),
    path('get_game_id_round_2/<str:tournament_name>/', views.get_game_id_round_2, name='get_game_id_round_2'),
	path('is_part_of_tournament/<str:game_id>/', views.is_part_of_tournament, name='is_part_of_tournament'),
    path('create_round_2/<str:tournament_name>/', views.create_round_2, name='create_round_2'),
    path('update_round_1_winners/<str:tournament_name>/', views.update_round_1_winners, name='update_round_1_winners'),
    path('update_round_2_players/<str:tournament_name>/', views.update_round_2_players, name='update_round_2_players'),

]
from django.urls import path
from . import views

urlpatterns = [
	path("create_game/", views.create_game_session, name="create_game"),
	path("join_game/<str:game_id>/", views.join_game_session, name="join_game"),
	path("join_tournament_game/<str:game_id>/", views.join_tournament_game_session, name="join_tournament_game"),
	path("game_state/<str:game_id>/", views.get_game_state, name="game_state"),
	path("move_paddle/<str:game_id>/", views.move_paddle, name="move_paddle"),
	path("end_game/<str:game_id>/", views.end_game_session, name="end_game"),
	path("quit_game/", views.quit_game_session, name="quit_game"),
	path("create_game_with_2_players/", views.create_game_with_2_players, name="create_game_with_2_players"),
	# path("invite_to_game/", views.invite_to_game, name="invite_to_game"),

	#Checking if the game_id is part of a tournament
	# path("check_if_part_of_tournament/<str:game_id>/", views.check_if_part_of_tournament, name="check_if_part_of_tournament"),
]
from django.urls import path
from . import views

urlpatterns = [
	# path("pong_test_func/", views.pong_test_func, name="pong_test_func"),
	path("validate_game_id/", views.validate_game_id, name="validate_game_id"),
	path("create_game/", views.create_game_session, name="create_game_session"),
	path("join_game/<str:game_id>/", views.join_game_session, name="join_game_session"),
	path("check_role/", views.role_availability_check, name="role_availability_check"),
]
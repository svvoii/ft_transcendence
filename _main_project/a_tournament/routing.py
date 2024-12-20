from django.urls import path
from .consumers import TournamentLobbyConsumer


websocket_urlpatterns = [
	path('ws/tournament_lobby/<str:tournament_name>/', TournamentLobbyConsumer.as_asgi()),
]
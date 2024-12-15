from django.urls import path
from .consumers import TournamentLobbyConsumer, TournamentNewPlayerConsumer 


websocket_urlpatterns = [
	path('ws/tournament_lobby/<str:tournament_name>/', TournamentLobbyConsumer.as_asgi()),
	path('ws/tournament/<str:tournament_id>/', TournamentNewPlayerConsumer.as_asgi()),
]
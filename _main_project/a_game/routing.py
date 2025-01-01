from django.urls import path
from . import consumers

websocket_urlpatterns = [
	path("ws/pong/<str:game_id>/", consumers.PongConsumer.as_asgi()),
	# path("ws/pong/<str:game_id>/<str:mode>/", consumers.PongConsumer.as_asgi()),
]
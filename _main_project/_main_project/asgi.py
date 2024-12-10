import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from channels.auth import AuthMiddlewareStack
from a_chat.routing import websocket_urlpatterns as chatroom_ws
from a_tournament.routing import websocket_urlpatterns as tournament_ws

os.environ.setdefault('DJANGO_SETTINGS_MODULE', '_main_project.settings')


application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(
                chatroom_ws + tournament_ws
            )
        )
    ),
})

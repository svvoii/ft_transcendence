"""
ASGI config for _main_project project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from channels.auth import AuthMiddlewareStack


os.environ.setdefault('DJANGO_SETTINGS_MODULE', '_main_project.settings')

django_asgi_app = get_asgi_application()


from a_chat.routing import websocket_urlpatterns as chat_websocket_urlpatterns
from a_game.routing import websocket_urlpatterns as pong_websocket_urlpatterns

websocket_urlpatterns = chat_websocket_urlpatterns + pong_websocket_urlpatterns

application = ProtocolTypeRouter({
	"http": django_asgi_app,
	# Just HTTP for now. (We can add other protocols later.)
	"websocket": AllowedHostsOriginValidator(
		AuthMiddlewareStack(
			URLRouter(
				websocket_urlpatterns
			)
		)
	),
})

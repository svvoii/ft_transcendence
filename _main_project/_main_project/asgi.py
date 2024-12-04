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


from a_chat import routing as a_chat_routing
from a_game import routing as a_game_routing

websocket_urlpatterns = a_chat_routing.websocket_urlpatterns + a_game_routing.websocket_urlpatterns

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

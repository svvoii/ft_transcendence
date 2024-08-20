from django.apps import AppConfig
from django.db.models.signals import post_migrate


class AChatConfig(AppConfig):
	name = 'a_chat'

	def ready(self):
		import a_chat.signals
	
# This signal is used to create a public chatroom when the database is migrated for the first time


# Original default code:
# class AChatConfig(AppConfig):
#     default_auto_field = 'django.db.models.BigAutoField'
#     name = 'a_chat'

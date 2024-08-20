# This line is used to import the signals.py file when the app is loaded to create the public chatroom as long as it does not exist.
default_app_config = 'a_chat.apps.AChatConfig'


# This line will require the `signals.py` in this app:
#####################################################
# from django.db.models.signals import post_migrate
# from django.dispatch import receiver
# from .models import ChatRoom


# # This signal is used to create a public chatroom when the database is migrated for the first time
# @receiver(post_migrate)
# def create_public_chatroom(sender, **kwargs):
#     if not ChatRoom.objects.filter(room_name='public-chat').exists():
#         ChatRoom.objects.create(room_name='public-chat', is_private=False)
#####################################################


# Also change in the `apps.py` file:
#####################################################
# from django.apps import AppConfig
# from django.db.models.signals import post_migrate


# class AChatConfig(AppConfig):
# 	name = 'a_chat'

# 	def ready(self):
# 		import a_chat.signals
#####################################################

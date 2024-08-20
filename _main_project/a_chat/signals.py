from django.db.models.signals import post_migrate
from django.dispatch import receiver
from .models import ChatRoom


# This signal is used to create a public chatroom when the database is migrated for the first time
@receiver(post_migrate)
def create_public_chatroom(sender, **kwargs):
    if not ChatRoom.objects.filter(room_name='public-chat').exists():
        ChatRoom.objects.create(room_name='public-chat', is_private=False)

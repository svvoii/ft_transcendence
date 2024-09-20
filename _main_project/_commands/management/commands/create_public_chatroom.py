from django.core.management.base import BaseCommand
from a_chat.models import ChatRoom


class Command(BaseCommand):
    help = 'Create a public chatroom if it does not exist'

    def handle(self, *args, **kwargs):
        if not ChatRoom.objects.filter(room_name='public-chat').exists():
            ChatRoom.objects.create(room_name='public-chat', is_private=False)
            self.stdout.write(self.style.SUCCESS('Successfully created public chatroom'))
        else:
            self.stdout.write('Public chatroom already exists')

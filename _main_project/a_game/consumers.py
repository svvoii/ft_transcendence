import json
from django.shortcuts import get_object_or_404
from django.template.loader import render_to_string
from asgiref.sync import async_to_sync

from channels.generic.websocket import AsyncWebsocketConsumer

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        data = json.loads(text_data)
        msg_content = data.get('msg_content', '')

        # print("Received coordinates:", msg_content)

        if msg_content == "Hello, world!":
            response = "hello you!"

            await self.send(text_data=json.dumps({
                'message': response
            }))





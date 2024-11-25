import json
from django.shortcuts import get_object_or_404
from django.template.loader import render_to_string
from asgiref.sync import async_to_sync

from channels.generic.websocket import WebsocketConsumer

class GameConsumer(WebsocketConsumer):
	def connect(self):
		self.accept()






import json
from channels.generic.websocket import AsyncWebsocketConsumer # This is the base class for all consumers. It handles the WebSocket protocol and connection management asynchronously.


# This class handles WebSocket connections. Each connection creates a new instance of this class.
class GameConsumer(AsyncWebsocketConsumer):

	# This method is called when a new WebSocket connection is established.
	async def connect(self):
		self.game_id = self.scope['url_route']['kwargs']['game_id'] # This retrieves the game_id from the URL path
		self.game_group_name = f'game_{self.game_id}' # This creates a group name for the game based on the game_id

		# Adding the user to the game group
		await self.channel_layer.group_add(
			self.game_group_name, # The group name to join
			self.channel_name # The unique name of the WebSocket channel
		)

		await self.accept()

	# This method is called when the WebSocket connection is closed.
	async def disconnect(self, close_code):
		# Leave game group
		await self.channel_layer.group_discard(
			self.game_group_name,
			self.channel_name
		)

	# This method is called when the WebSocket connection receives a message from the client.
	async def receive(self, text_data):
		text_data_json = json.loads(text_data)
		message = text_data_json['message']

		# Send message to game group
		await self.channel_layer.group_send(
			self.game_group_name,
			{
				'type': 'game_message',
				'message': message
			}
		)

	# This method handles messages from the game group to the WebSocket.
	async def game_message(self, event):
		message = event['message']

		# Send message to WebSocket
		await self.send(text_data=json.dumps({
			'message': message
		}))


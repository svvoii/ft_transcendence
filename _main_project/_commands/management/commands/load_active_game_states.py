import pickle # Used to serialize and deserialize the `GameState` objects. This is IMPORTANT! Otherwise, the `GameState` objects will not be restored correctly from the cache.
from django.core.management.base import BaseCommand
from a_game.models import GameSession
from a_game.game_logic import GameState
from django.core.cache import cache


MODE_TO_STR = {0: 'AI', 1: 'Single', 2: 'Multi_2', 3: 'Multi_3', 4: 'Multi_4'}

class Command(BaseCommand):
	help = 'Loading active game states from the database...'
    
	def handle(self, *args, **kwargs):
		load_active_game_states()
		self.stdout.write(self.style.SUCCESS('Successfully loaded active game states from the database'))

# The following logic is used to reinstantiate the active `GameState` objects when the server is restarted.
# `game_state` objects are stored in the Redic cache and resored when the server is restarted.
# The django management command `load_active_game_states` (this file) is called in the `entrypoint.sh` file after the migrations are applied and before the server is started.

# Function initializes `GameState` objects where `is_active` is True in the `GameSession` model
def load_active_game_states():
	active_sessions = GameSession.objects.filter(is_active=True)
	for session in active_sessions:
		game_state = GameState()
		game_state.game_mode = MODE_TO_STR.get(session.mode, 'Single')
		game_state.num_players = session.mode
		game_state.score1 = session.score1
		game_state.score2 = session.score2
		game_state.score3 = session.score3
		game_state.score4 = session.score4
		cache.set(session.game_id, pickle.dumps(game_state))
		# print(f'Active game state loaded into cache: {session.game_id}')
	print(f'Active game states loaded into cache: {cache.keys("*")}')

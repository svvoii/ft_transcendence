from django.db import models
from a_user.models import Account
import shortuuid

# NB_PLAYERS = 8

# tournament_ids = set()

class Tournament(models.Model):
    tournament_name = models.CharField(max_length=128, unique=True, default=shortuuid.uuid)
    players = models.ManyToManyField(Account, related_name='tournaments', blank=True)
    nb_players = models.IntegerField(default=0, editable=True)
    winner = models.ForeignKey(Account, related_name='tournaments_won', blank=True, null=True, on_delete=models.SET_NULL)
    created = models.DateTimeField(auto_now_add=True)


    # def add_tournament_id(self):
    #     tournament_ids.add(self.tournament_name) 
        

    def __str__(self):
        return self.tournament_name

    def updateNbPlayers(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.nb_players = self.players.count()
        super().save(*args, **kwargs)


    def clean(self):
        if self.players.count() != NB_PLAYERS:
            raise ValidationError(f'The number of players must be exactly {NB_PLAYERS}.')

    class Meta:
        ordering = ['-created']

    # def create_matches(self):
    #     players = list(self.players.all())
    #     matches = []
    #     for i in range(0, len(players), 2):
    #         match = Match.objects.create(tournament=self, player1=player[i], player2=players[i+1])
    #         matches.append(match)
    #     return matches

    # def update_players_with_winners
    #     winners = []
    #     for match in self.matches

class AllTournaments(models.Model):
    tournaments = models.ManyToManyField(Tournament, related_name='all_tournaments')
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return ', '.join([tournament.tournament_name for tournament in self.tournaments.all()])

    class Meta:
        ordering = ['-created']

class Match(models.Model):
    tournament = models.ForeignKey(Tournament, related_name='matches', on_delete=models.CASCADE)
    player1 = models.ForeignKey(Account, related_name='matches_as_player1', on_delete=models.CASCADE)
    player2 = models.ForeignKey(Account, related_name='matches_as_player2', on_delete=models.CASCADE)
    winner = models.ForeignKey(Account, related_name='matches_won', blank=True, null=True, on_delete=models.SET_NULL)
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.player1.username} vs {self.player2.username}'

    class Meta:
        ordering = ['-created']


class TournamentMessage(models.Model):
	tournament_room = models.ForeignKey(Tournament, related_name='tournament_messages', on_delete=models.CASCADE,)
	msg_content = models.CharField(max_length=512)
	created = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f'{self.msg_content}'
	
	class Meta:
		ordering = ['-created']


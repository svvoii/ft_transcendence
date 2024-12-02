from django.shortcuts import render
from django.http import Http404
from .models import Tournament
from a_user.models import Account, BlockedUser


# Create your views here.

@login_required
def tournament_view(request):
	tournament_room = get_object_or_404(Tournament, tournament_name=tournament_name)
	tournament_messages = tournament.tournament_messages.all()[:20]
    
	other_user = None
	
	if tournament_room.tournament_name:
		if request.user not in tournament_room.players.all():
			tournament_room.members.add(request.user)


	context = {
		'tournament_room': tournament_room,
		'tournament_messages': tournament_messages,
	}

	return render(request, 'a_tournament/tournament.html', context)


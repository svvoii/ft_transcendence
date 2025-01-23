import { user } from '../index.js';

export default class {
  constructor(tournamentID, params) {
    this.socket = new WebSocket(`ws://${window.location.host}/ws/tournament_lobby/${tournamentID}/`); 
    user.setTournamentSocket(this.socket);

    const socket = this.socket;

    this.socket.onopen = function() {
      console.log('WebSocket connection is established.');
      user.setIsInTournament(true, tournamentID);
      const message = {
        'message': 'New player entering the lobby.',
        'type': 'new_player',
        'player_name': user.getUserName()
      };
      socket.send(JSON.stringify(message));
    };

    this.socket.onclose = function() {
      console.log('WebSocket connection is closed.');
      user.setIsInTournament(false, '');
    };

    this.socket.addEventListener('message', async (event) => {
      const data = JSON.parse(event.data);
      if (data.type == 'new_player') {
        this.new_player();
      } else if (data.type == 'player_leaving_tournament') {
        this.player_leaving_tournament();
      } else if (data.type == 'start_round_1') {
        this.start_round_1();
      } else if (data.type == 'game_finished') {
        this.game_finished();
      }
    });
  }

  new_player() {
    console.log('TouramentSocket -> new_player');
    // listOfPlayers.innerHTML = '';
    // data.player_names.forEach( player => {
    //   const li = document.createElement('li');
    //   li.innerText = player;
    //   listOfPlayers.appendChild(li);
    // });
  }

  player_leaving_tournament() {
    console.log('TournamentSocket -> player_leaving_tournament');
    // listOfPlayers.innerHTML = '';
    // data.player_names.forEach( player => {
    //   const li = document.createElement('li');
    //   li.innerText = player;
    //   listOfPlayers.appendChild(li);
    //   fullLobbyDiv.textContent = 'Waiting for more players to join...';
    // });
  }
  
  start_round_1() {
    console.log('TournamentSocket -> start_round_1');
    // fullLobbyDiv.textContent = 'The lobby is full. The tournament will start soon.';
    // this.start_round_1(tournamentID);
  }

  game_finished() {
    console.log('TournamentSocket -> game_finished');
    // if (data.game_index == 'round_1_game_1') {
    //   document.getElementById('round1leftWinner').textContent = data.winner;
    //   this.round_1_game_1_finished = 1;
    // } else if (data.game_index == 'round_1_game_2') {
    //   document.getElementById('round1rightWinner').textContent = data.winner;
    //   this.round_1_game_2_finished = 1;
    // } else if (data.game_index == 'round_2_game') {
    //   document.getElementById('winnerName').textContent = data.winner;
    // }
  }
}


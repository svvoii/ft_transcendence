import { user } from '../index.js';

export default class {
  constructor(tournamentID, params) {
    this.tournamentID = tournamentID;
    this.socket = null;

  }

  async connect_websocket() {
    this.socket = new WebSocket(`ws://${window.location.host}/ws/tournament_lobby/${this.tournamentID}/`); 
    this.socketOpenPromise = new Promise((resolve, reject) => {
      this.socket.addEventListener('open', resolve);
      this.socket.addEventListener('error', reject);
    });
    user.setTournamentSocket(this.socket);

    const socket = this.socket;
    const tournamentID = this.tournamentID;

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
      if (data.type == 'add_player_to_tournament') {
        this.recv_add_player_to_tournament(data);
      } else if (data.type == 'new_player') {
        this.recv_new_player(data);
      } else if (data.type == 'player_leaving_tournament') {
        this.recv_player_leaving_tournament(data);
      } else if (data.type == 'start_round_1') {
        this.recv_start_round_1(data);
      } else if (data.type == 'game_finished') {
        this.recv_game_finished(data);
      }
    });
  }

  ///// RECEIVING MESSAGES /////

  recv_add_player_to_tournament(data) {
    console.log('[TournamentSocket] -> add_player_to_tournament received');
    console.log(data);
  }

  recv_new_player(data) {
    console.log('TournamentSocket -> new_player');
    let listOfPlayers = document.querySelector('.list-of-players');

    listOfPlayers.innerHTML = '';
    data.player_names.forEach( player => {
      const li = document.createElement('li');
      li.innerText = player;
      listOfPlayers.appendChild(li);
    });
  }

  recv_player_leaving_tournament(data) {
    console.log('TournamentSocket -> player_leaving_tournament');
    let listOfPlayers = document.querySelector('.list-of-players');
    let fullLobbyDiv = document.querySelector('.full-lobby-message');

    listOfPlayers.innerHTML = '';
    data.player_names.forEach( player => {
      const li = document.createElement('li');
      li.innerText = player;
      listOfPlayers.appendChild(li);
      fullLobbyDiv.textContent = 'Waiting for more players to join...';
    });
  }
  
  recv_start_round_1(data) {
    console.log('TournamentSocket -> start_round_1');
    // fullLobbyDiv.textContent = 'The lobby is full. The tournament will start soon.';
    // this.start_round_1(tournamentID);
  }

  recv_game_finished(data) {
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

  ///// SENDING MESSAGES /////

  // async send_new_player() {
  //   const message = {
  //     'message': 'New player entering the lobby.',
  //     'type': 'new_player',
  //     'player_name': user.getUserName()
  //   };
  //   await this.send_to_backend(message);
  // }

  async send_add_player_to_tournament() {
    const message = {
      'message': 'Add player to tournament.',
      'type': 'add_player_to_tournament',
      'tournamentID': this.tournamentID
    };
    await this.send_to_backend(message);
  }

  async send_to_backend(message) {
    await this.socketOpenPromise;
    this.socket.send(JSON.stringify(message));
  }
}


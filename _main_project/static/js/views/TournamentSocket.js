import { user, gameBoard, chat } from '../index.js';

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
        'player_name': user.getUserName(),
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
      } else if (data.type == 'start_round_2') {
        this.recv_start_round_2(data);
      } else if (data.type == 'game_finished') {
        this.recv_game_finished(data);
      }
    });
  }

  ///// RECEIVING MESSAGES /////

  recv_add_player_to_tournament(data) {
    console.log('[TournamentSocket] -> add_player_to_tournament received');
    // console.log(data);
  }

  recv_new_player(data) {
    let listOfPlayers = document.querySelector('.list-of-players');

    if (listOfPlayers)
      {
        listOfPlayers.innerHTML = '';
        data.player_names.forEach( player => {
          const li = document.createElement('li');
          li.innerText = player;
          listOfPlayers.appendChild(li);
        });
      }
  }

  recv_player_leaving_tournament(data) {
    console.log('TournamentSocket -> player_leaving_tournament');
    let listOfPlayers = document.querySelector('.list-of-players');
    let fullLobbyDiv = document.querySelector('.full-lobby-message');

    if (listOfPlayers)
      {
        listOfPlayers.innerHTML = '';
        data.player_names.forEach( player => {
          const li = document.createElement('li');
          li.innerText = player;
          listOfPlayers.appendChild(li);
        });
      }
  }
  
  async recv_start_round_1(data) {
    let listOfPlayers = document.querySelector('.list-of-players');
    let fullLobbyDiv = document.querySelector('.full-lobby-message');

    console.log(data);

    if (listOfPlayers)
    {
      listOfPlayers.innerHTML = '';
      data.player_names.forEach( player => {
        const li = document.createElement('li');
        li.innerText = player;
        listOfPlayers.appendChild(li);
      });
    }

    if (fullLobbyDiv)
      fullLobbyDiv.textContent = 'The lobby is full. The tournament will start soon.';
    
    this.showTournamentBracket();
    this.bracketNameFill(data);
    if (data.countdown_finished == false) {
      await this.startCountdown();
      await this.send_countdown_round_1_finished();
    }
    this.startRound(data.game_id);
    // await this.send_game_finished(data.game_index, data.game_id, winnerName);
  }

  recv_game_finished(data) {
    console.log('TournamentSocket -> game_finished');
    console.log(data);
    this.bracketNameFill(data);

    

  }

  async recv_start_round_2(data) {
    console.log('TournamentSocket -> start_round_2');
    console.log(data);

  }

  ///// SENDING MESSAGES /////

  async send_countdown_round_1_finished() {
    const message = {
      'message': 'Round 1 countdown finished.',
      'type': 'round_1_countdown_finished',
      'tournamentID': this.tournamentID
    };
    await this.send_to_backend(message);
  }

  async send_countdown_round_2_finished() {
    const message = {
      'message': 'Round 2 countdown finished.',
      'type': 'round_2_countdown_finished',
      'tournamentID': this.tournamentID
    };
    await this.send_to_backend(message);
  }

  async send_add_player_to_tournament() {
    const message = {
      'message': 'Add player to tournament.',
      'type': 'add_player_to_tournament',
      'tournamentID': this.tournamentID
    };
    await this.send_to_backend(message);
  }

  // async send_game_finished(game_index, game_id, winnerName) {
  //   const message = {
  //     'message': 'Game finished.',
  //     'type': 'game_finished',
  //     'game_index': game_index,
  //     'game_id': game_id,
  //     'winner': winnerName,
  //     };
  //   // socket.send(JSON.stringify(message));
  //   await this.send_to_backend(message);
  // }

  async send_to_backend(message) {
    await this.socketOpenPromise;
    this.socket.send(JSON.stringify(message));
  }




  showTournamentBracket() {
    const tournamentBracket = document.createElement('div');
    tournamentBracket.className = 'tournament-bracket';
    tournamentBracket.classList.add('bracket-container');
  
    const title = document.createElement('h1');
    title.textContent = 'Tournament Bracket';
    title.style.textAlign = 'center';
  
    const paragraph = document.createElement('p');
    paragraph.textContent = 'This is the tournament bracket';
  
    // parent container for round divs
    const roundDiv = document.createElement('div');
    roundDiv.className = 'round-container';
  
    // round 1 left div
    const round1left = document.createElement('div');
    round1left.className = 'round1-left';
  
    const userInfo1 = document.createElement('p');
    userInfo1.id = 'userInfo1';
    userInfo1.textContent = 'Sample username';
  
    const userInfo2 = document.createElement('p');
    userInfo2.id = 'userInfo2';
    userInfo2.textContent = 'Sample username';
  
    round1left.appendChild(userInfo1);
    round1left.appendChild(userInfo2);
  
    // round 1 right div
    const round1right = document.createElement('div');
    round1right.className = 'round1-right';
  
    const userInfo3 = document.createElement('p');
    userInfo3.id = 'userInfo3';
    userInfo3.textContent = 'Sample username';
  
    const userInfo4 = document.createElement('p');
    userInfo4.id = 'userInfo4';
    userInfo4.textContent = 'Sample username';
  
    round1right.appendChild(userInfo3);
    round1right.appendChild(userInfo4);
  
    // round 2 div
    const round2 = document.createElement('div');
    round2.className = 'round2';
  
    const usernameDivrRound2 = document.createElement('div');
    usernameDivrRound2.className = 'username-div-round2';
  
    const round1leftWinner = document.createElement('p');
    round1leftWinner.id = 'round1leftWinner';
    round1leftWinner.textContent = 'Sample username';
  
    const round1rightWinner = document.createElement('p');
    round1rightWinner.id = 'round1rightWinner';
    round1rightWinner.textContent = 'Sample username';
  
    usernameDivrRound2.appendChild(round1leftWinner);
    usernameDivrRound2.appendChild(round1rightWinner);
  
    round2.appendChild(usernameDivrRound2);
  
    // add all the rounds to the round div
    roundDiv.appendChild(round1left);
    roundDiv.appendChild(round2);
    roundDiv.appendChild(round1right);
  
    // winner div
    const winnerDiv = document.createElement('div');
    winnerDiv.className = 'winner-div';
  
    const winnerText = document.createElement('p');
    winnerText.textContent = 'Winner';
  
    const winnerName = document.createElement('p');
    winnerName.id = 'winnerName';
    winnerName.textContent = 'Sample username';
  
    winnerDiv.appendChild(winnerText);
    winnerDiv.appendChild(winnerName);
  
    // countdown
    const countdown = document.createElement('p');
    countdown.id = 'countdown';
    countdown.textContent = 'Waiting for other players to finish their games...';
  
    // append all the elements to the tournament bracket
    tournamentBracket.appendChild(title);
    tournamentBracket.appendChild(roundDiv);
    tournamentBracket.appendChild(winnerDiv);
    tournamentBracket.appendChild(countdown);
  
    document.getElementById('view-content').innerHTML = '';
    document.getElementById('view-content').appendChild(tournamentBracket);
  
  }

  bracketNameFill(updated_data) {
    const data = updated_data.standings;

    for (const key in data) {
      if (data[key] === '') {
        data[key] = 'TBD';
      }
    }
    document.getElementById('userInfo1').textContent = data.user1round1;
    document.getElementById('userInfo2').textContent = data.user2round1;
    document.getElementById('userInfo3').textContent = data.user3round1;
    document.getElementById('userInfo4').textContent = data.user4round1;
    document.getElementById('round1leftWinner').textContent = data.user1round2;
    document.getElementById('round1rightWinner').textContent = data.user2round2;
    document.getElementById('winnerName').textContent = data.userWinner;
  }

  async startCountdown() {

    const countdownElement = document.getElementById('countdown');
    let countdown = 9;

    chat.openChat();
    chat.addChatMessage('system', 'The next tournament round will start in 10 seconds');
    chat.addChatMessage('system', 'Good luck!!!');
    
    countdownElement.style.display = 'block';
    
    const interval = setInterval(() => {
      if (countdown >= 1) {
        countdownElement.textContent = countdown;
        countdown--;
      } else {
        clearInterval(interval);
        countdownElement.style.display = 'none';
      }
    }, 1000);
    await this.sleep(5000);
    chat.closeChat();
    chat.clearChat();
    await this.sleep(5000);
  }
  
  async startRound(game_id) {
    try {
      await gameBoard.joinExistingTournamentGame(game_id);
      console.log("showing the modal");
      gameModal.style.display = 'flex';
    } catch (error) {
      console.error('Error starting the game: ', error);
    }
  }

  sleep(ms) { 
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}


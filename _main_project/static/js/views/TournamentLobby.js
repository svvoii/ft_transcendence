import AbstractView from "./AbstractView.js";
import { user, gameBoard, chat } from "../index.js";
// import { joinTournamentGame } from '../game/GameAPI.js';


export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Tounament Lobby");
    this.name = "TournamentLobby";
    this.round_1_game_1_finished = 0;
    this.round_1_game_2_finished = 0;
    this.round_2_started = 0;
  }

  // async function start_tournament(tournamentID) {
    
  // }

  getDomElements() {
		// Check that the user is logged in
		const logCheck = this.checkUserLoggedIn();
		if (logCheck) return logCheck;

		// Continue creating the view if the user is logged in

    document.getElementById("gameModal").style.display = "none";

    // Create a container div
    const container = document.createElement('div');
    container.className = 'system-author-messages';
    container.classList.add('text-container');

    // Create the paragraph element
    const paragraph = document.createElement('p');
    paragraph.textContent = 'You are viewing the tournament lobby!';

    // Create the h1 element
    const h1 = document.createElement('h1');
    h1.textContent = 'Lobby Link';

    // Create the link paragraph element
    const linkParagraph = document.createElement('p');
    linkParagraph.className = 'lobby-link';

    // Create the button element
    const copyButton = document.createElement('button');
    copyButton.id = 'copyButton';
    copyButton.type = 'select';
    copyButton.textContent = 'Copy tournament ID';

    const playersListTitle = document.createElement('p');
    playersListTitle.textContent = 'List of players :';

    const playersList = document.createElement('ul');
    playersList.className = 'list-of-players';
    document.body.appendChild(playersList);

    const fullLobbyDiv = document.createElement('div');
    fullLobbyDiv.className = 'full-lobby-message';
    fullLobbyDiv.textContent = 'Waiting for more players to join...';

    ///// DEBUG BUTTON /////
    const debugButton = document.createElement('button');
    debugButton.id = 'debugButton';
    debugButton.type = 'select';
    debugButton.textContent = 'Start Tournament';
    const modalButton = document.createElement('button');
    modalButton.id = 'modalButton';
    modalButton.textContent = 'Open Modal';

    // Append all elements to the container
    container.appendChild(paragraph);
    container.appendChild(h1);
    container.appendChild(linkParagraph);
    container.appendChild(copyButton);
    container.appendChild(playersListTitle);
    container.appendChild(playersList);
    container.appendChild(fullLobbyDiv);
    // DEBUG BUTTON //
    container.appendChild(debugButton);
    container.appendChild(modalButton);

    
    return container;
  }

  async afterRender() {
    try {
      //printing the lobby URL, so that the user can copy it
      let lobbyLink = document.querySelector('.lobby-link');
      let listOfPlayers = document.querySelector('.list-of-players');
      let currentUrl = window.location.href;

      let fullLobbyDiv = document.querySelector('.full-lobby-message');
      
      //getting the tournament ID from the URL
      currentUrl = currentUrl.slice(0, -1);
      const tournamentID = currentUrl.substring(currentUrl.lastIndexOf('/') + 1);
      lobbyLink.textContent = tournamentID;


    try {


      // ENTERING NEW PLAYER TO THE DATABASE
      // GETTING THE TOURNAMENT OBJECT AND CREATING ROUND 1 

      const tournament = await fetch(`/tournament/get_tournament/${tournamentID}/`, {
        headers: {
        'X-Requested-With': 'XMLHttpRequest'
        }
      });
      const tournamentDataText = await tournament.text();

      console.log(tournamentDataText);


      //Establishing the websocket connection
      const socket = new WebSocket(`ws://${window.location.host}/ws/tournament_lobby/${tournamentID}/`);
      user.setTournamentSocket(socket);
      socket.onopen = function() {
        console.log('WebSocket connection is established.');
        user.setIsInTournament(true, tournamentID);
        const message = {
          'message': 'New player entering the lobby.',
          'type': 'new_player',
          'player_name': user.getUserName()
        };
        socket.send(JSON.stringify(message));

      };

      socket.onclose = function() {
        console.log('WebSocket connection is closed.');
        user.setIsInTournament(false, '');
      };

      
      socket.addEventListener('message', async (event) => {
        const data = JSON.parse(event.data);
        if (data.type == 'new_player') 
        {
          listOfPlayers.innerHTML = '';
          data.player_names.forEach( player => {
              const li = document.createElement('li');
              li.innerText = player;
              listOfPlayers.appendChild(li);
            });
        }
        else if (data.type == 'player_leaving_tournament') 
        {
          listOfPlayers.innerHTML = '';
          data.player_names.forEach( player => {
              const li = document.createElement('li');
              li.innerText = player;
              listOfPlayers.appendChild(li);
              fullLobbyDiv.textContent = 'Waiting for more players to join...';
            });
        }
        else if (data.type == 'start_round_1')
        {
          fullLobbyDiv.textContent = 'The lobby is full. The tournament will start soon.';
          this.start_round_1(tournamentID);
        } 
        else if (data.type == 'game_finished')
        {
          if (data.game_index == 'round_1_game_1') {
            document.getElementById('round1leftWinner').textContent = data.winner;
            this.round_1_game_1_finished = 1;
          }
          else if (data.game_index == 'round_1_game_2') {
            document.getElementById('round1rightWinner').textContent = data.winner;
            this.round_1_game_2_finished = 1;

          }
          else if (data.game_index == 'round_2_game') {
            document.getElementById('winnerName').textContent = data.winner;

          }

          // if (this.round_1_game_1_finished == 1 && this.round_1_game_2_finished == 1 && this.round_2_started == 0)
          // {
          //   this.round_2_started = 1;
          //   this.start_round_2(tournamentID);
          // }
        }
        // else if (data.type == 'tournament_cancelled')
        // {
        //   fullLobbyDiv.textContent = 'The tournament was cancelled.';
        // }
      });

    }
    catch(error) {
      console.error('Error:', error);
    }

      // Copy the lobby link to the clipboard
      document.getElementById('copyButton').addEventListener('click', async () => {
        navigator.clipboard.writeText(lobbyLink.textContent);
      });

      // DEBUG BUTTON //
      document.getElementById('debugButton').addEventListener('click', async () => {
        console.log('Starting the tournament');
        this.showTournamentBracket();
        this.startCountdown();
      });

      document.getElementById('modalButton').addEventListener('click', async () => {
        gameBoard.joinExistingGame('game-id');
        gameModal.style.display = 'flex';

        // while (this.round_1_game_1_finished == 0 || this.round_1_game_2_finished == 0) {
        //   await this.sleep(2000);
        // }
        // console.log('Starting round 2');
        // // this.round_2_started = 1;
        // this.start_round_2(tournamentID);


      });
      
    } catch (error) {
    }
  };

  async start_round_1(tournamentID) {

    const matchMaking = await fetch(`/tournament/get_game_id_round_1/${tournamentID}/`, {
      headers: {
      'X-Requested-With': 'XMLHttpRequest'
      }
    });

    const matchMakingData = await matchMaking.json();

    if (matchMakingData.status == 'error') {
      console.log('nb_players', matchMakingData.nb_players);
      throw new Error(matchMakingData.message);
    }

    let game_id = matchMakingData.user_game_id;

    this.showTournamentBracket();
    this.bracketNameFill(matchMakingData);
    if (!matchMakingData.has_started) {
      await this.startCountdown(game_id);
    }
    await this.startRound(game_id);

  }

  async start_round_2(tournamentID) {

    //UPDATING ROUND 1 WINNERS

    let round1WinnersData;
    do {
      const round1Winners = await fetch(`/tournament/update_round_1_winners/${tournamentID}/`, {
        headers: {
        'X-Requested-With': 'XMLHttpRequest'
        }
      });
      round1WinnersData = await round1Winners.json();

      if (round1WinnersData.status == 'winners_error') {
        await this.sleep(2000);
        console.log(round1WinnersData.message);
      }
    }
    while (round1WinnersData.status == 'winners_error');

    console.log('[STEP 1] Round_1 Winners updated');
    console.log('round1WinnersData', round1WinnersData);

    // UPDATING ROUND 2 PLAYERS
    
    
    //CREATING AND STARTING ROUND 2
    if (round1WinnersData.is_part_of_round_2 == 'true') {
      
      //IF PLAYER_1 : CREATE ROUND 2
      // if (round1WinnersData.role == 'player_1') {
        //   const creatingRound_2 = await fetch(`/tournament/create_round_2/${tournamentID}/`, {
      //     headers: {
      //     'X-Requested-With': 'XMLHttpRequest'
      //     }
      //   });
      //   const creatingRound2Data = await creatingRound_2.json();
          
      
      //   if (creatingRound2Data.status == 'error') {
        //     throw new Error(creatingRound2Data.message);
        //   }
        // }
        
  
      const round2Players = await fetch(`/tournament/update_round_2_players/${tournamentID}/`, {
        headers: {
        'X-Requested-With': 'XMLHttpRequest'
        }
      });
      const round2PlayersData = await round2Players.json();    

      console.log('[STEP 2] Round_2 Players updated');
      console.log('round2PlayersData', round2PlayersData);

      let matchMakingData;

      console.log('Waiting for both players to be updated to fetch the game_id');

      do {
        const matchMaking = await fetch(`/tournament/get_game_id_round_2/${tournamentID}/`, {
          headers: {
          'X-Requested-With': 'XMLHttpRequest'
          }
        });
        matchMakingData = await matchMaking.json();
  
        if (matchMakingData.status == 'error') {
          await this.sleep(2000);
          console.log(matchMakingData.message);
        }
        
      }
      while (matchMakingData.status == 'error');




      // const matchMaking = await fetch(`/tournament/get_game_id_round_2/${tournamentID}/`, {
      //   headers: {
      //   'X-Requested-With': 'XMLHttpRequest'
      //   }
      // });
      // matchMakingData = await matchMaking.json();

      // if (matchMakingData.status == 'error') {
      //   throw new Error(matchMakingData.message);
      // }


      let game_id = matchMakingData.user_game_id;
      
      await this.startCountdown(game_id);
      await this.startRound(game_id);
    
    }
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
    // console.log('Starting the round');

    // call function to start the round here
    try {
      await gameBoard.joinExistingTournamentGame(game_id);
      console.log("showing the modal");
      gameModal.style.display = 'flex';
    } catch (error) {
      // console.error('Error starting the game: ', error);
    }
    
  }
  
  sleep(ms) { 
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  bracketNameFill(data) {
    // should use data from the server to fill in the bracket
    // const sampleDataForBracket = {
    //   user1round1: 'User1',
    //   user2round1: 'User2',
    //   user3round1: 'User3',
    //   user4round1: 'User4',
    //   user1round2: '',
    //   user2round2: '',
    //   userWinner: ''
    // }
  
    // this.bracketNameFill(sampleDataForBracket);

    
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
}

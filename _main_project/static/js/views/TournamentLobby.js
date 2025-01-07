import AbstractView from "./AbstractView.js";
import { user, gameBoard } from "../index.js";

import { joinGame } from '../game/GameAPI.js';


export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Tounament Lobby");
    this.name = "TournamentLobby";
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
      
      let matchMaking;

      try {

        // console.log('Entering the lobby');

        const socket = new WebSocket(`ws://${window.location.host}/ws/tournament_lobby/${tournamentID}/`);
        user.setTournamentSocket(socket);
        socket.onopen = function() {
          console.log('WebSocket connection is established.');
          user.setIsInTournament(true, tournamentID);
          const message = {
            'message': 'New player entering the lobby.'
          };
          socket.send(JSON.stringify(message));
        };

        socket.onclose = function() {
          console.log('WebSocket connection is closed.');
          user.setIsInTournament(false, '');
        };

        socket.addEventListener('message', async (event) => {
          const data = JSON.parse(event.data);
          console.log('Data received from the websocket :', data);
          if (data.type == 'new_player') {
            listOfPlayers.innerHTML = '';
            data.player_names.forEach( player => {
                const li = document.createElement('li');
                li.innerText = player;
                listOfPlayers.appendChild(li);
              });
            }
          else if (data.type == 'player_leaving_tournament') {
            listOfPlayers.innerHTML = '';
            data.player_names.forEach( player => {
                const li = document.createElement('li');
                li.innerText = player;
                listOfPlayers.appendChild(li);
                fullLobbyDiv.textContent = 'Waiting for more players to join...';
              });
            }

          if (data.max_nb_players_reached == true)
          {
            console.log('check', data.message);
            fullLobbyDiv.textContent = 'The lobby is full. The tournament will start soon.';
            


            matchMaking = await fetch(`/tournament/get_game_id_round_1/${tournamentID}/`);

            const matchMakingData = await matchMaking.text();
            console.log('Match Making Data :', matchMakingData);

            // let game_id = matchMakingData.user_game_id;



                // const gameModal = document.getElementById('gameModal');
                // console.log('Joining existing game, game_id: ', game_id);
            
                //   const role = await joinGame(game_id);
                //   this.paragraph.textContent = `Game ID: ${game_id}`;
                //   gameModal.style.display = 'flex';
            
                //   this.connectWebSocket(role, game_id);
          }
        });

        // Getting the tournament object
        const tournament = await fetch(`/tournament/get_tournament/${tournamentID}/`);


        //printing the tournament data
        const tournamentDataText = await tournament.text();
        console.log('Data after entering the lobby :', tournamentDataText);

        /*********************** CHECKING IF PLAYERS ARE READY TO START *************************/

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
        await this.startCountdown();
        // document.getElementById('view-content').innerHTML = '';
        // document.getElementById('view-content').appendChild(this.getDomElements());
      });

      document.getElementById('modalButton').addEventListener('click', async () => {
        gameBoard.joinExistingGame('game-id');
        gameModal.style.display = 'flex';
      });
      
    } catch (error) {
    }
  };

  showTournamentBracket() {
    const tournamentBracket = document.createElement('div');
    tournamentBracket.className = 'tournament-bracket';
    tournamentBracket.classList.add('text-container');

    const title = document.createElement('h1');
    title.textContent = 'Tournament Bracket';

    const paragraph = document.createElement('p');
    paragraph.textContent = 'This is the tournament bracket';

    const countdown = document.createElement('p');
    countdown.id = 'countdown';
    countdown.textContent = '10';

    tournamentBracket.appendChild(title);
    tournamentBracket.appendChild(paragraph);
    tournamentBracket.appendChild(countdown);

    document.getElementById('view-content').innerHTML = '';
    document.getElementById('view-content').appendChild(tournamentBracket);
  }

  startCountdown() {
    const countdownElement = document.getElementById('countdown');
    let countdown = 10;

    countdownElement.style.display = 'block'; // Ensure the countdown is visible

    const interval = setInterval(() => {
      if (countdown >= 0) {
        countdownElement.textContent = countdown;
        countdown--;
      } else {
        clearInterval(interval);
        countdownElement.style.display = 'none'; // Hide the countdown after it reaches 0
      }
    }, 1000);
  }
}

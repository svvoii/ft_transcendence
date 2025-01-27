import AbstractView from "./AbstractView.js";
import { user, gameBoard, chat } from "../index.js";
import TournamentSocket from "./TournamentSocket.js"
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

    // Append all elements to the container
    container.appendChild(h1);
    container.appendChild(linkParagraph);
    container.appendChild(copyButton);
    container.appendChild(playersListTitle);
    container.appendChild(playersList);
    container.appendChild(fullLobbyDiv);
    
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

      const ts = new TournamentSocket(tournamentID);
      await ts.connect_websocket();

      await ts.send_add_player_to_tournament();

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

      });
      
    } catch (error) {
    }
  };

  async start_round_1(tournamentID) {


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

      let game_id = matchMakingData.user_game_id;
      
      await this.startCountdown(game_id);
      await this.startRound(game_id);
    
    }
  }
  
  sleep(ms) { 
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

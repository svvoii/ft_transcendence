import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Tounament Lobby");
    this.name = "TournamentLobby";
  }

  getDomElements() {

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
    copyButton.textContent = 'Copy tournament ID';

    const info_1 = document.createElement('p');
    info_1.textContent = 'List of players :';

    const playersList = document.createElement('ul');
    playersList.className = 'list-of-players';
    document.body.appendChild(playersList);


    // Append all elements to the container
    container.appendChild(paragraph);
    container.appendChild(h1);
    container.appendChild(linkParagraph);
    container.appendChild(copyButton);
    container.appendChild(info_1);
    container.appendChild(playersList);
    
    return container;
  }

  async afterRender() {

    //printing the lobby URL, so that the user can copy it
    let lobbyLink = document.querySelector('.lobby-link');
    let listOfPlayers = document.querySelector('.list-of-players');
    let currentUrl = window.location.href;
    
    //getting the tournament ID from the URL
    currentUrl = currentUrl.slice(0, -1);
    const tournamentID = currentUrl.substring(currentUrl.lastIndexOf('/') + 1);
    lobbyLink.textContent = tournamentID;
    
    try {

      // Getting the tournament object
      const tournament = await fetch(`/tournament/get_tournament/${tournamentID}/`);

      //printing the tournament data
      const tournamentDataText = await tournament.text();
      console.log('Data received :', tournamentDataText);

      //WEBSOCKET CONNECTION TO UPDATE NEW PLAYERS ENTERING THE LOBBY
      const socket = new WebSocket(`ws://${window.location.host}/ws/tournament_lobby/${tournamentID}/`);

      socket.onopen = function() {
        console.log('WebSocket connection is indeed established.');
        const message = {
          'message': 'New player entering the lobby.'
        };
        socket.send(JSON.stringify(message));
      };
    
      socket.onmessage = function(event) {
        const message = JSON.parse(event.data);
        console.log('Message received from the server:', message);
      };

      //Printing the list of players in the lobby
      socket.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
        if (data.type == 'new_player') {
          listOfPlayers.innerHTML = '';
          data.player_names.forEach( player => {
              const li = document.createElement('li');
              li.innerText = player;
              listOfPlayers.appendChild(li);
            });     
        }
      })
    } 
    
    catch(error) {
      console.error('Error:', error);
    }
    
    document.getElementById('copyButton').addEventListener('click', async () => {
      navigator.clipboard.writeText(lobbyLink.textContent);
    });

  };
}

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
    copyButton.textContent = 'Copy link';

    // Create the ul element
    const ul = document.createElement('ul');

    // Create the li elements
    const players = ['Player 1', 'Player 2', 'Player 3', 'Player 4'];
    players.forEach(player => {
      const li = document.createElement('li');
      li.textContent = player;
      ul.appendChild(li);
    });

    // Append all elements to the container
    container.appendChild(paragraph);
    container.appendChild(h1);
    container.appendChild(linkParagraph);
    container.appendChild(copyButton);
    container.appendChild(ul);
    
    return container;
  }

  async afterRender() {

    //printing the lobby URL, so that the user can copy it
    let lobbyLink = document.querySelector('.lobby-link');
    let currentUrl = window.location.href;
    lobbyLink.textContent = currentUrl;

    //getting the tournament ID from the URL
    currentUrl = currentUrl.slice(0, -1);
    const tournamentID = currentUrl.substring(currentUrl.lastIndexOf('/') + 1);
    
    try {

      // Getting the tournament object
      const tournament = await fetch(`/tournament/get_tournament/${tournamentID}/`);
      
      console.log('Request [get] sent, awaiting response...');

      //receiving the tournament data
      const tournamentDataText = await tournament.text();
      console.log('datatext receive ', tournamentDataText);
      const tournamentData = JSON.parse(tournamentDataText);
  
      console.log(tournamentData);

    } 
    
    catch(error) {
      console.error('Error:', error);
    }


    document.getElementById('copyButton').addEventListener('click', async () => {
      navigator.clipboard.writeText(lobbyLink.textContent);
    });

  };
}

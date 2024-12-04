import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Tounament Lobby");
    this.name = "TournamentLobby";
  }

  getDomElements() {
    // Set the game modal to hidden
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
    linkParagraph.textContent = 'https://www.example.com/tournament_lobby/';

    // Create the button element
    const button = document.createElement('button');
    button.textContent = 'copy link';

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
    container.appendChild(button);
    container.appendChild(ul);



    // const messageBox = document.createElement('div');

    // const systemAuthorSocket = new WebSocket('ws://localhost:8000/ws/tournament_lobby/');

    // systemAuthorSocket.onopen = function() {
    //   console.log('WebSocket connection established.');
    //   const message = {
    //     'message': 'Hello, server! We are ready to play.'
    //   };
    //   systemAuthorSocket.send(JSON.stringify(message));
    // };

    
    // systemAuthorSocket.onmessage = function(event) {
    //   const message = JSON.parse(event.data);

    //   messageBox.className = 'message-box';
    //   messageBox.textContent = message.message;
    //   container.appendChild(messageBox);
    // };


    // systemAuthorSocket.onclose = function(event) {
    //   console.error('WebSocket connection closed:', event);
    // };
    
    // systemAuthorSocket.onerror = function(error) {
    //   console.error('WebSocket error:', error);
    // };   



    return container;
  }
}
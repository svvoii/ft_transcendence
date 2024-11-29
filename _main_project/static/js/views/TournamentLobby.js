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


    return container;
  }
}
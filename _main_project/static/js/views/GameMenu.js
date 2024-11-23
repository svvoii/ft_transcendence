import AbstractView from "./AbstractView.js";
import { gameBoard } from "../index.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Game Menu");
    this.name = "GameMenu";
  }

  getDomElements() {
    // Set the game modal to hidden
    document.getElementById("gameModal").style.display = "none";

    // Create a container div
    const container = document.createElement('div');
    container.classList.add('text-container');

    // Create the paragraph element
    const paragraph = document.createElement('p');
    paragraph.textContent = 'You are viewing the game menu!';

    // Create the button
    const ai_button = document.createElement('button');
    ai_button.id = 'playAIGameBtn';
    ai_button.type = 'select';
    ai_button.textContent = 'Play VS AI';

    // Create the button
    const remote_button = document.createElement('button');
    remote_button.id = 'playRemoteGameBtn';
    remote_button.type = 'select';
    remote_button.textContent = 'Play VS Another Player';

    // Append the paragraph to the container
    container.appendChild(paragraph);
    container.appendChild(ai_button);
    container.appendChild(remote_button);

    return container;
  }

  async afterRender() {
    const gameModal = document.getElementById("gameModal");

    document.getElementById('playAIGameBtn').addEventListener('click', () => {
      // load in AI game on the backend.
      gameModal.style.display = "flex";
      gameBoard.startAIgame();
    });

    document.getElementById('playRemoteGameBtn').addEventListener('click', () => {
      // load in Remote game on the backend.
      gameModal.style.display = "flex";
      gameBoard.startRemotegame();
    });
  }
}
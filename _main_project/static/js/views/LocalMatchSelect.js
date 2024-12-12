import { navigateTo } from "../helpers/helpers.js";
import AbstractView from "./AbstractView.js";
import { gameBoard } from "../index.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Singleplayer Select");
    this.name = "SingleplayerSelect";
  }

  getDomElements() {

    // Create a container div
    const container = document.createElement('div');
    container.classList.add('text-container', 'game-select-button-div');

    // Create the page title
    const setTitle = document.createElement('h1');
    setTitle.textContent = 'Local Match';
    setTitle.style.textAlign = 'center';

    const setDescript = document.createElement('h2');
    setDescript.textContent = 'Select a game mode:';
    setDescript.style.textAlign = 'center';

		// Button to start single player game against AI
		const create_local_match_btn = document.createElement('button');
		create_local_match_btn.id = 'createLocalMatchBtn';
    create_local_match_btn.classList.add('game-select-button');
		create_local_match_btn.type = 'select';
		create_local_match_btn.textContent = 'Play against a friend with 2 paddles on one keyboard';

		// Button to start multiplayer game against another player
		const join_local_match_btn = document.createElement('button');
		join_local_match_btn.id = 'joinLocalMatchBtn';
    join_local_match_btn.classList.add('game-select-button');
		join_local_match_btn.type = 'select';
		join_local_match_btn.textContent = 'Play Against AI';

    // Append the paragraph to the container
    container.appendChild(setTitle);
    container.appendChild(setDescript);
    container.appendChild(create_local_match_btn);
    container.appendChild(join_local_match_btn);

    return container;
  }

  async afterRender() {
    document.getElementById('createLocalMatchBtn').addEventListener('click', async() => {
      console.log('createLocalMatchBtn clicked');
			// gameBoard.startMultiPlayerGame();
			// gameModal.style.display = 'flex';
      // navigateTo('/tournament_setup/');
    });

    document.getElementById('joinLocalMatchBtn').addEventListener('click', async() => {
      console.log('joinLocalMatchBtn clicked');
      // navigateTo('/tournament_lobby/');
    });
  }
}
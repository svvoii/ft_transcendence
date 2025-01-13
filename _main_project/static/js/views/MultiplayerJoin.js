import { navigateTo } from "../helpers/helpers.js";
import AbstractView from "./AbstractView.js";
import { gameBoard } from "../index.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Multiplayer Join");
    this.name = "MultiplayerJoin";
  }

  getDomElements() {

    // Create a container div
    const container = document.createElement('div');
    container.classList.add('text-container', 'game-select-button-div');

    // Create the page title
    const setTitle = document.createElement('h1');
    setTitle.textContent = 'Please Select:';
    setTitle.style.textAlign = 'center';

		// Button to start single player game against AI
		const create_mp_match_btn = document.createElement('button');
		create_mp_match_btn.id = 'createMPMatchBtn';
    create_mp_match_btn.classList.add('game-select-button');
		create_mp_match_btn.type = 'game-select';
		create_mp_match_btn.textContent = 'Create a Match and invite another player';

		// Button to start multiplayer game against another player
		const join_mp_match_btn = document.createElement('button');
		join_mp_match_btn.id = 'joinMPMatchBtn';
    join_mp_match_btn.classList.add('game-select-button');
		join_mp_match_btn.type = 'game-select';
		join_mp_match_btn.textContent = 'Join a Match with antoher player';

    // Append the paragraph to the container
    container.appendChild(setTitle);
    container.appendChild(create_mp_match_btn);
    container.appendChild(join_mp_match_btn);

    return container;
  }

  async afterRender() {
    document.getElementById('createMPMatchBtn').addEventListener('click', async() => {
      console.log('createMPMatchBtn clicked');
			gameBoard.startMultiPlayerGame();
			gameModal.style.display = 'flex';
      // navigateTo('/tournament_setup/');
    });

    document.getElementById('joinMPMatchBtn').addEventListener('click', async() => {
      // console.log('joinMPMatchBtn clicked');
      navigateTo('/tournament_lobby/');
    });
  }
}
import { navigateTo } from "../helpers/helpers.js";
import AbstractView from "./AbstractView.js";
import { gameBoard } from "../index.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Multiplayer Select");
    this.name = "MultiplayerSelect";
  }

  getDomElements() {

    // Create a container div
    const container = document.createElement('div');
    container.classList.add('text-container', 'game-select-button-div');

    // Create the page title
    const setTitle = document.createElement('h1');
    setTitle.textContent = 'Online Multiplayer';
    setTitle.style.textAlign = 'center';

    const setDescript = document.createElement('h2');
    setDescript.textContent = 'Please Select:';
    setDescript.style.textAlign = 'center';

		// Button to start single player game against AI
		const create_mp_match_btn = document.createElement('button');
		create_mp_match_btn.id = 'createMPMatchBtn';
    create_mp_match_btn.classList.add('game-select-button');
		create_mp_match_btn.type = 'select';
		create_mp_match_btn.textContent = 'Create a Match and invite another player';

    const orStatement = document.createElement('h1');
    orStatement.textContent = 'or';
    orStatement.style.textAlign = 'center';

		// Input field to join a game by ID
		const join_game_input = document.createElement('input');
		join_game_input.id = 'joinGameInput';
		join_game_input.type = 'text';
		join_game_input.placeholder = 'Enter Game ID';

		// Button to start multiplayer game against another player
		const join_mp_match_btn = document.createElement('button');
		join_mp_match_btn.id = 'joinMPMatchBtn';
    join_mp_match_btn.classList.add('game-select-button');
		join_mp_match_btn.type = 'select';
		join_mp_match_btn.textContent = 'Join a Match with antoher player';

    // Append the paragraph to the container
    container.appendChild(setTitle);
    container.appendChild(setDescript);
    container.appendChild(create_mp_match_btn);
    container.appendChild(orStatement);
    container.appendChild(join_game_input);
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
			const game_id = document.getElementById('joinGameInput').value;

			if (!game_id) {
				alert('Please enter a game ID');
				return;
			}
			gameBoard.joinExistingGame(game_id);
			// gameModal.style.display = 'flex';
		});
  }
}
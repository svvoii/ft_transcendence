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
		// Check that the user is logged in
		const logCheck = this.checkUserLoggedIn();
		if (logCheck) return logCheck;

		// Continue creating the view if the user is logged in
		const container = document.createElement('div');
		container.classList.add('text-container', 'game-select-button-div');

		const setTitle = document.createElement('h1');
		setTitle.textContent = 'Online Multiplayer';
		setTitle.style.textAlign = 'center';

		const setDescript = document.createElement('h2');
		setDescript.textContent = 'Please Select:';
		setDescript.style.textAlign = 'center';

		const create_mp_match_btn_2 = document.createElement('button');
		create_mp_match_btn_2.id = 'createMPMatchBtn_2';
		create_mp_match_btn_2.classList.add('game-select-button');
		create_mp_match_btn_2.type = 'game-select';
		create_mp_match_btn_2.textContent = 'Create a Multiplayer Match for 2 players';

		const create_mp_match_btn_3 = document.createElement('button');
		create_mp_match_btn_3.id = 'createMPMatchBtn_3';
		create_mp_match_btn_3.classList.add('game-select-button');
		create_mp_match_btn_3.type = 'game-select';
		create_mp_match_btn_3.textContent = 'Create a Muliplayer Match for 3 players';
		// create_mp_match_btn.textContent = 'Create a Match and invite another player';

		const create_mp_match_btn_4 = document.createElement('button');
		create_mp_match_btn_4.id = 'createMPMatchBtn_4';
		create_mp_match_btn_4.classList.add('game-select-button');
		create_mp_match_btn_4.type = 'game-select';
		create_mp_match_btn_4.textContent = 'Create a Multiplayer Match for 4 players';

		const orStatement = document.createElement('h1');
		orStatement.textContent = 'or';
		orStatement.style.textAlign = 'center';

		const join_game_input = document.createElement('input');
		join_game_input.id = 'joinGameInput';
		join_game_input.type = 'text';
		join_game_input.placeholder = 'Enter Game ID';

		// Button to start multiplayer game against another player
		const join_mp_match_btn = document.createElement('button');
		join_mp_match_btn.id = 'joinMPMatchBtn';
		join_mp_match_btn.classList.add('game-select-button');
		join_mp_match_btn.type = 'game-select';
		join_mp_match_btn.textContent = 'Join a Match with antoher player';

		// Append the paragraph to the container
		container.appendChild(setTitle);
		container.appendChild(setDescript);
		container.appendChild(create_mp_match_btn_2);
		container.appendChild(create_mp_match_btn_3);
		container.appendChild(create_mp_match_btn_4);
		container.appendChild(orStatement);
		container.appendChild(join_game_input);
		container.appendChild(join_mp_match_btn);

		return container;
	}

	async afterRender() {

		try {
			document.getElementById('createMPMatchBtn_2').addEventListener('click', async() => {
				console.log('createMPMatchBtn_2 clicked');
				gameBoard.startMultiPlayerGame("Multi_2");
				gameModal.style.display = 'flex';
			});

			document.getElementById('createMPMatchBtn_3').addEventListener('click', async() => {
				console.log('createMPMatchBtn_3 clicked');
				gameBoard.startMultiPlayerGame("Multi_3");
				gameModal.style.display = 'flex';
			});

			document.getElementById('createMPMatchBtn_4').addEventListener('click', async() => {
				console.log('createMPMatchBtn_4 clicked');
				gameBoard.startMultiPlayerGame("Multi_4");
				gameModal.style.display = 'flex';
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
		} catch (error) {
			// console.error('Error:', error);
		}
	}
}
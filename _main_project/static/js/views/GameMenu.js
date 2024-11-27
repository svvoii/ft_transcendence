import AbstractView from "./AbstractView.js";
import { gameBoard } from "../index.js";
import { validateGameId } from '../game/GameLogic.js';
import { roleIsTaken } from '../game/GameLogic.js';

export default class extends AbstractView {
	constructor(params) {
		super(params);
		this.setTitle("Game Menu");
		this.name = "GameMenu";
	}

	getDomElements() {
		document.getElementById("gameModal").style.display = "none";

		const container = document.createElement('div');
		container.classList.add('menu-container');

		const buttonContainer = document.createElement('div');
		buttonContainer.classList.add('button-container');

		const paragraph_01 = document.createElement('p');
		paragraph_01.textContent = 'You are viewing the game menu!';

		const new_game_btn = document.createElement('button');
		new_game_btn.id = 'newGameBtn';
		new_game_btn.type = 'select';
		new_game_btn.textContent = 'Create New Game';

		const paragraph_02 = document.createElement('p');
		paragraph_02.textContent = 'Or join an existing game session:';

		const game_id_input = document.createElement('input');
		game_id_input.id = 'gameIdInput';
		game_id_input.type = 'text';
		game_id_input.placeholder = 'Enter game session ID..';

		const join_game_button = document.createElement('button');
		join_game_button.id = 'joinGameBtn';
		join_game_button.type = 'select';
		join_game_button.textContent = 'Join existing game';

		buttonContainer.appendChild(new_game_btn);
		buttonContainer.appendChild(paragraph_02);
		buttonContainer.appendChild(game_id_input);
		buttonContainer.appendChild(join_game_button);

		container.appendChild(paragraph_01);
		container.appendChild(buttonContainer);

		this.container = container;

		return container;
	}

	// Function to display a role selection dialog
	chooseRole(callback) {
		const roleDialog = document.createElement('div');
		roleDialog.classList.add('role-dialog');
	
		const roleText = document.createElement('p');
		roleText.textContent = 'Choose your role:';
		roleDialog.appendChild(roleText);
	
		const roles = ['player1', 'player2', 'spectator'];
		roles.forEach(role => {
			const roleButton = document.createElement('button');
			roleButton.textContent = role;
			roleButton.addEventListener('click', () => {
				
				this.container.classList.remove('hidden-elements');
				this.container.removeChild(roleDialog);
				callback(role);
			});
			roleDialog.appendChild(roleButton);
		});
	
		this.container.appendChild(roleDialog);
		this.container.classList.add('hidden-elements');
	}


	async afterRender() {
		const gameModal = document.getElementById("gameModal");

		document.getElementById('newGameBtn').addEventListener('click', () => {

			this.chooseRole(async (role) => {
				// * DEBUG * //
				console.log('Role selected:', role);
				// * * * * * //
				gameBoard.startNewGame(role);
				gameModal.style.display = "flex";
			});
		});

		document.getElementById('joinGameBtn').addEventListener('click', async () => {
			const game_id_input = document.getElementById('gameIdInput').value;

			if (game_id_input) {
				const isValidGameId = await validateGameId(game_id_input);
				// * DEBUG * //
				console.log('isValidGameId:', isValidGameId);
				// * * * * * //

				if (isValidGameId) {
					this.chooseRole((role) => {
						if (roleIsTaken(game_id_input, role) === true) {
							alert('This role is already taken !');
							return;
						}
						gameBoard.joinExistingGame(game_id_input, role);
						gameModal.style.display = "flex";
					});
				} else {
					alert('Invalid game session ID');
				}
			} else {
				alert('Please enter a game session ID');
			}
		});
	}

}

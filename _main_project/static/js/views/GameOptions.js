import AbstractView from "./AbstractView.js";
import { gameBoard } from "../index.js";


export default class extends AbstractView {
	constructor(params) {
		super(params);
		this.setTitle("Game Options");
		this.name = "GameOptions";
		this.container = null;
	}

	getDomElements() {
		
		document.getElementById("gameModal").style.display = "none";

		this.container = document.createElement('div');
		this.container.classList.add('text-container');

		// Button to start single player game against AI
		const single_player_button = document.createElement('button');
		single_player_button.id = 'singlePlayerBtn';
		single_player_button.type = 'select';
		single_player_button.textContent = 'Single Player';

		// Button to start multiplayer game against another player
		const multi_player_button = document.createElement('button');
		multi_player_button.id = 'multiPlayerBtn';
		multi_player_button.type = 'select';
		multi_player_button.textContent = 'Multiplayer';

		// Input field to join a game by ID
		const join_game_input = document.createElement('input');
		join_game_input.id = 'joinGameInput';
		join_game_input.type = 'text';
		join_game_input.placeholder = 'Enter Game ID';

		// Button to join a game by ID
		const join_game_button = document.createElement('button');
		join_game_button.id = 'joinGameBtn';
		join_game_button.type = 'select';
		join_game_button.textContent = 'Join Game';

		this.container.appendChild(single_player_button);
		this.container.appendChild(multi_player_button);
		this.container.appendChild(join_game_input);
		this.container.appendChild(join_game_button);

		return this.container;
	}

	chooseMode(callback) {
		// check if the mode dialog is already open
		if (document.querySelector('.mode-dialog')) return;

		// Hiding all elements in the container
		this.container.querySelectorAll('*').forEach(element => {
			element.style.display = 'none';
		});

		const modeDialog = document.createElement('div');
		modeDialog.classList.add('mode-dialog');
	
		const modeText = document.createElement('p');
		modeText.textContent = 'Choose Game Mode for Single Player:';
		modeDialog.appendChild(modeText);
	
		// const modes = ['Single with 2 paddles on one keyboard', 'Aginst AI'];
		const modes = {
			'Single with control over 2 paddles on one keyboard': 'single',
			'Play Aginst AI': 'ai'
		};

		// modes.forEach(mode => {
		Object.keys(modes).forEach(displayText => {
			const modeButton = document.createElement('button');
			modeButton.textContent = displayText;
			modeButton.classList.add('mode-button');
			modeButton.addEventListener('click', () => {
				this.container.classList.remove('hidden-elements');
				this.container.removeChild(modeDialog);
				callback(modes[displayText]);
			});
			modeDialog.appendChild(modeButton);
		});
	
		this.container.appendChild(modeDialog);
		this.container.classList.add('hidden-elements');
	}

	async afterRender() {
		const gameModal = document.getElementById('gameModal');

		document.getElementById('singlePlayerBtn').addEventListener('click', async() => {
			
			this.chooseMode((mode) => {
				gameBoard.startSinglePlayerGame(mode);
				gameModal.style.display = 'flex';
			});
		});

		document.getElementById('multiPlayerBtn').addEventListener('click', async() => {
			gameBoard.startMultiPlayerGame();
			gameModal.style.display = 'flex';
		});

		document.getElementById('joinGameBtn').addEventListener('click', async() => {
			const game_id = document.getElementById('joinGameInput').value;
			await joinGame(game_id);
			gameModal.style.display = 'flex';
		});
	}


}
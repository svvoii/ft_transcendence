import { getGameSession, joinGame, createGameWith2Players, quitGame } from './GameAPI.js';
import { initializeGame } from './GameLogic.js';

export default class GameBoard {
	constructor(appId) {
		this.app = document.querySelector(`#${appId}`);
		this.gameboard = document.createElement('div');
		this.socket = null;
	}

	full_render() {
		this.gameboard.id = "gameModal";
		this.gameboard.classList.add('modal-game');
		this.gameboard.appendChild(this.getDomElements());

		this.app.appendChild(this.gameboard);
		this.afterRender();
	}

	fast_render() {
		this.app.appendChild(this.gameboard);
	}

	getDomElements() {
		const container = document.createElement('div');
		container.classList.add('game-container');

		this.paragraph = document.createElement('p');
		this.paragraph.textContent = '';

		const quitGamebtn = document.createElement('button');
		quitGamebtn.id = 'quitGameBtn';
		quitGamebtn.classList.add('game-select-button');
		quitGamebtn.classList.add('select');
		quitGamebtn.textContent = 'Quit Game';

		const readyBtn = document.createElement('button');
		readyBtn.id = 'readyBtn';
		readyBtn.classList.add('game-select-button');
		readyBtn.classList.add('select');
		readyBtn.textContent = 'Ready';

		const canvas = document.createElement('canvas');
		canvas.id = 'pongCanvas';
		canvas.width = 600;
		canvas.height = 600;
		canvas.classList.add('board');

		container.appendChild(this.paragraph);
		container.appendChild(readyBtn);
		container.appendChild(quitGamebtn);
		container.appendChild(canvas);

		return container;
	}

	async startSinglePlayerGame(mode) {
		// console.log('Single Player Game started, mode: ', mode);

		try {
			const game_id = await getGameSession(mode);
			const role = await joinGame(game_id);
			this.paragraph.textContent = `Game ID: ${game_id}`;

			this.connectWebSocket(role, game_id);
			
		} catch (error) {
			console.error('Error starting the game: ', error);
		}
		
	}

	async startMultiPlayerGame(mode) {
		console.log('Multiplayer game started');

		try {
			const game_id = await getGameSession(mode);
			const role = await joinGame(game_id);
			this.paragraph.textContent = `Game ID: ${game_id}`;

			this.connectWebSocket(role, game_id);

		} catch (error) {
			alert('Error starting the game: ' + error.message);
			console.error('Error starting the game: ', error);
		}

	}

	async joinExistingGame(game_id) {
		const gameModal = document.getElementById('gameModal');
		console.log('Joining existing game, game_id: ', game_id);

		try {
			const role = await joinGame(game_id);
			this.paragraph.textContent = `Game ID: ${game_id}`;
			gameModal.style.display = 'flex';

			this.connectWebSocket(role, game_id);

		} catch (error) {
			alert('Error joining the game: ' + error.message);
		}
	}

	// Function to call grom the Chat.js file when the user clicks `invite to play` button
	async inviteToPlayFromChat(player1, player2) {
		const gameModal = document.getElementById('gameModal');
		console.log('Invite to play button clicked');

		try {
			const { game_id, role } = await createGameWith2Players(player1, player2);
			this.paragraph.textContent = `Game ID: ${game_id}`;
			gameModal.style.display = 'flex';

			this.connectWebSocket(role, game_id);

		} catch (error) {
			alert('Error inviting the player to play: ' + error.message);
		}
	}

	async initQuitGame() {
		const gameModal = document.getElementById('gameModal');
		console.log('Quit Game button clicked');

		try {
			await quitGame();
			if (this.socket) this.socket.close();
			this.resetGameBoard();
			gameModal.style.display = 'none';
		} catch (error) {
			alert('Game is not active. ' + error.message);
		}
	}

	connectWebSocket(role, game_id) {
		if (!this.socket) {
			const ws_protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
			this.socket = new WebSocket(`${ws_protocol}://${window.location.host}/ws/pong/${game_id}/`);
			// this.socket = new WebSocket(`${ws_protocol}://${window.location.host}/ws/pong/${game_id}/${mode}/`);

			initializeGame(this.socket, role, game_id, this);
		}
	}

	resetGameBoard() {
		this.gameboard.innerHTML = '';
		this.gameboard.appendChild(this.getDomElements());
		this.afterRender();
		this.socket = null;
	}

	async afterRender() {

		const quitGamebtn = document.getElementById('quitGameBtn');
		quitGamebtn.addEventListener('click', async () => {
			await this.initQuitGame();
		});

		const readyBtn = document.getElementById('readyBtn');
		readyBtn.addEventListener('click', async () => {
			
			this.socket.send(JSON.stringify({ 
				'type': 'player_ready',
			}));
			readyBtn.style.display = 'none';
		});

	}

};

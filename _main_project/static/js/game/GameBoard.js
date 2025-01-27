import { getGameSession, joinGame, createGameWith2Players, quitGame, joinTournamentGame } from './GameAPI.js';
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

		const buttonsDiv = document.createElement('div');
		buttonsDiv.classList.add('game-buttons');

		const quitGamebtn = document.createElement('button');
		quitGamebtn.id = 'quitGameBtn';
		quitGamebtn.classList.add('game-button');
		quitGamebtn.classList.add('select');
		quitGamebtn.textContent = 'Quit Game';

		const readyBtn = document.createElement('button');
		readyBtn.id = 'readyBtn';
		readyBtn.classList.add('game-button');
		readyBtn.classList.add('select');
		readyBtn.textContent = 'Ready';

		buttonsDiv.appendChild(readyBtn);
		buttonsDiv.appendChild(quitGamebtn);

		// game controls and canvas

		const gameControlsAndCanvas = document.createElement('div');
		gameControlsAndCanvas.classList.add('game-controls-and-canvas');

		// game controls

		const gameControls = document.createElement('div');
		gameControls.classList.add('game-controls');

		const leftCtrlBtn = document.createElement('button');
		leftCtrlBtn.id = 'leftCtrlBtn';
		leftCtrlBtn.classList.add('left-control');
		leftCtrlBtn.textContent = '↑';

		const rightCtrlBtn = document.createElement('button');
		rightCtrlBtn.id = 'rightCtrlBtn';
		rightCtrlBtn.classList.add('right-control');
		rightCtrlBtn.textContent = '↓';

		gameControls.appendChild(leftCtrlBtn);
		gameControls.appendChild(rightCtrlBtn);

		// game canvas

		const gameCanvas = document.createElement('div');
		gameCanvas.id = 'gameCanvas';

		const canvas = document.createElement('canvas');
		canvas.id = 'pongCanvas';
		canvas.width = 600;
		canvas.height = 600;
		canvas.classList.add('board');

		gameCanvas.appendChild(canvas);
		
		gameControlsAndCanvas.appendChild(gameCanvas);
		gameControlsAndCanvas.appendChild(gameControls);

		container.appendChild(this.paragraph);
		container.appendChild(buttonsDiv);
		container.appendChild(gameControlsAndCanvas);

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

	async joinExistingTournamentGame(game_id) {
		const gameModal = document.getElementById('gameModal');
		console.log('Joining existing game, game_id: ', game_id);

		try {
			const role = await joinTournamentGame(game_id);
			if (!role)
				return null;

			this.paragraph.textContent = `Game ID: ${game_id}`;
			gameModal.style.display = 'flex';

			this.connectWebSocket(role, game_id);

		} catch (error) {
			throw new Error('Error joining the game');
			// alert('Error joining the game: ' + error.message);
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

		const hold_speed = 100;

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

		const leftCtrlBtn = document.getElementById('leftCtrlBtn');
		let leftInterval;
		
		const startLeftInterval = () => {
			leftInterval = setInterval(() => {
				const event = new KeyboardEvent('keydown', {
					key: 'ArrowUp',
					code: 'ArrowUp',
					keyCode: 38,
					which: 38,
					bubbles: true
				});
				document.dispatchEvent(event);
			}, hold_speed); // Trigger event 2 times per second (500ms interval)
		};
		
		const clearLeftInterval = () => {
			clearInterval(leftInterval);
		};
		
		leftCtrlBtn.addEventListener('mousedown', startLeftInterval);
		leftCtrlBtn.addEventListener('mouseup', clearLeftInterval);
		leftCtrlBtn.addEventListener('mouseleave', clearLeftInterval);
		leftCtrlBtn.addEventListener('touchstart', startLeftInterval);
		leftCtrlBtn.addEventListener('touchend', clearLeftInterval);
		leftCtrlBtn.addEventListener('touchcancel', clearLeftInterval);
		
		const rightCtrlBtn = document.getElementById('rightCtrlBtn');
		let rightInterval;
		
		const startRightInterval = () => {
			rightInterval = setInterval(() => {
				const event = new KeyboardEvent('keydown', {
					key: 'ArrowDown',
					code: 'ArrowDown',
					keyCode: 40,
					which: 40,
					bubbles: true
				});
				document.dispatchEvent(event);
			}, hold_speed); // Trigger event 2 times per second (500ms interval)
		};
		
		const clearRightInterval = () => {
			clearInterval(rightInterval);
		};
		
		rightCtrlBtn.addEventListener('mousedown', startRightInterval);
		rightCtrlBtn.addEventListener('mouseup', clearRightInterval);
		rightCtrlBtn.addEventListener('mouseleave', clearRightInterval);
		rightCtrlBtn.addEventListener('touchstart', startRightInterval);
		rightCtrlBtn.addEventListener('touchend', clearRightInterval);
		rightCtrlBtn.addEventListener('touchcancel', clearRightInterval);
	}
};

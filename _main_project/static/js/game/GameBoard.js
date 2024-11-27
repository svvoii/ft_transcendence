import { requestGameSession } from './GameLogic.js';
import { joinGame } from './GameLogic.js';


export default class GameBoard {
	constructor(appId) {
		this.app = document.querySelector(`#${appId}`);
		this.gameboard = document.createElement('div');
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
		// Create the main container div
		const container = document.createElement('div');

		// Create the paragraph element for Game ID
		this.paragraph = document.createElement('p');
		this.paragraph.textContent = '';

		// Create the canvas element to draw the game
		const canvas = document.createElement('canvas');
		canvas.width = 800; // this is important to respect the aspect ratio of the game. Must be the same as in consumers.py constant on the server side
		canvas.height = 600; // this is important to respect the aspect ratio of the game. Must be the same as in consumers.py constant on the server side
		canvas.id = 'canvasId'; // must be the same as used in `initializeGame` function in GameLogic.js
		canvas.classList.add('board');

		container.appendChild(this.paragraph);
		container.appendChild(canvas);

		return container;
	}
	
	async startNewGame(role) {
		console.log('New game.. choose role');
		
		const game_id = await requestGameSession();
		joinGame(game_id, role);
		this.paragraph.textContent = 'Game ID: ' + game_id;
	}
	
	async joinExistingGame(game_id, role) {
		console.log('Joining existing game with session ID:', game_id);
		
		joinGame(game_id, role);
		this.paragraph.textContent = 'Game ID: ' + game_id;
	}
	
	async afterRender() {
	}

}

// window.addEventListener('load', () => {
// 	const game_id = localStorage.getItem('game_id');

// 	if (game_id) {
// 		console.log('Game session exists:', game_id);
// 	}
// });

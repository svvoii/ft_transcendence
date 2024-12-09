import AbstractView from "./AbstractView.js";
import { navigateTo } from "../helpers/helpers.js";
import { gameBoard } from "../index.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Game Menu");
    this.name = "GameMenu";
    this.container = null;
  }

  getDomElements() {
    // Set the game modal to hidden
    document.getElementById("gameModal").style.display = "none";

    // Create a this.container div
    this.container = document.createElement('div');
    this.container.classList.add('text-container', 'game-select-button-div');

    const setTitle = document.createElement('h1');
    setTitle.textContent = 'Select a game mode:';
    setTitle.style.textAlign = 'center';

		// Button to start single player game against AI
		const single_player_button = document.createElement('button');
		single_player_button.id = 'singlePlayerBtn';
    single_player_button.classList.add('game-select-button');
		single_player_button.type = 'select';
		single_player_button.textContent = 'Single Player';

		// Button to start multiplayer game against another player
		const multi_player_button = document.createElement('button');
		multi_player_button.id = 'multiPlayerBtn';
    multi_player_button.classList.add('game-select-button');
		multi_player_button.type = 'select';
		multi_player_button.textContent = 'Multiplayer';

    // Create the button
    const tournament_button = document.createElement('button');
    tournament_button.id = 'tournamentBtn';
    tournament_button.classList.add('game-select-button');
    tournament_button.type = 'select';
    tournament_button.textContent = 'Tournament';

    // Append the paragraph to the this.container
    this.container.appendChild(setTitle);
    this.container.appendChild(single_player_button);
    this.container.appendChild(multi_player_button);
    this.container.appendChild(tournament_button);

    return this.container;
  }

  async afterRender() {

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

    document.getElementById('tournamentBtn').addEventListener('click', () => {
      // load in Remote game on the backend.
      navigateTo('/tournament_select/');
    });
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
			modeButton.classList.add('mode-button', "game-select-button");
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

}

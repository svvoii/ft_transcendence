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
		const ai_local_match_btn = document.createElement('button');
		ai_local_match_btn.id = 'aiLocalMatchBtn';
    ai_local_match_btn.classList.add('game-select-button');
		ai_local_match_btn.type = 'select';
		ai_local_match_btn.textContent = 'Play Against AI';

    // Append the paragraph to the container
    container.appendChild(setTitle);
    container.appendChild(setDescript);
    container.appendChild(create_local_match_btn);
    container.appendChild(ai_local_match_btn);

    return container;
  }

  async afterRender() {
    document.getElementById('createLocalMatchBtn').addEventListener('click', async() => {
      // Defining mode here. Will need to change this to a user input
      const mode = 'easy';

      gameBoard.startSinglePlayerGame(mode);
      gameModal.style.display = 'flex';
    });

    document.getElementById('aiLocalMatchBtn').addEventListener('click', async() => {
      console.log('aiLocalMatchBtn clicked');
      // navigateTo('/tournament_lobby/');
    });
  }


  // copied from GameMenu in event listener

      // this.chooseMode((mode) => {
      //   gameBoard.startSinglePlayerGame(mode);
      //   gameModal.style.display = 'flex';
      // });

  // copied over from GameMenu
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
import AbstractView from "./AbstractView.js";
import { navigateTo } from "../helpers/helpers.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Game Menu");
    this.name = "GameMenu";
  }

  getDomElements() {
    // Set the game modal to hidden
    document.getElementById("gameModal").style.display = "none";

    // Create a container div
    const container = document.createElement('div');
    container.classList.add('text-container');

    // Create the paragraph element
    const paragraph = document.createElement('p');
    paragraph.textContent = 'You are viewing the game menu!';

	const gameOptions = document.createElement('button');
	gameOptions.id = 'gameOptionsBtn';
	gameOptions.type = 'select';
	gameOptions.textContent = 'Game Options';

    // Create the button
    const create_tournament_button = document.createElement('button');
    create_tournament_button.id = 'createTournamentBtn';
    create_tournament_button.type = 'select';
    create_tournament_button.textContent = 'Create Tournament';

    // Create the button
    const join_tournament_button = document.createElement('button');
    join_tournament_button.id = 'joinTournamentBtn';
    join_tournament_button.type = 'select';
    join_tournament_button.textContent = 'Join Tournament';

    // Append the paragraph to the container
    container.appendChild(paragraph);
	container.appendChild(gameOptions);
    container.appendChild(create_tournament_button);
    container.appendChild(join_tournament_button);

    return container;
  }

  async afterRender() {

	document.getElementById('gameOptionsBtn').addEventListener('click', () => {
		console.log('Game Options');
		navigateTo('/game_options/');
	});

    document.getElementById('createTournamentBtn').addEventListener('click', () => {
      // load in Remote game on the backend.
      console.log('Create Tournament');
      navigateTo('/tournament_setup_create/');
    });

    document.getElementById('joinTournamentBtn').addEventListener('click', () => {
      // load in Remote game on the backend.
      console.log('Join Tournament');
      navigateTo('/tournament_setup_join/');
    });
  }
}

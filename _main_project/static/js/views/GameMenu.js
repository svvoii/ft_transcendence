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

    // Create a this.container div
    const container = document.createElement('div');
    container.classList.add('text-container', 'game-select-button-div');

    const setTitle = document.createElement('h1');
    setTitle.textContent = 'Select a game mode:';
    setTitle.style.textAlign = 'center';

		// Button to start single player game against AI
		const local_match_button = document.createElement('button');
		local_match_button.id = 'localMatchBtn';
    local_match_button.classList.add('game-select-button');
		local_match_button.type = 'select';
		local_match_button.textContent = 'Local Match';

		// Button to start multiplayer game against another player
		const multi_player_button = document.createElement('button');
		multi_player_button.id = 'multiPlayerBtn';
    multi_player_button.classList.add('game-select-button');
		multi_player_button.type = 'select';
		multi_player_button.textContent = 'Online Multiplayer';

    // Create the button
    const tournament_button = document.createElement('button');
    tournament_button.id = 'tournamentBtn';
    tournament_button.classList.add('game-select-button');
    tournament_button.type = 'select';
    tournament_button.textContent = 'Tournament';

    // Append the paragraph to the container
    container.appendChild(setTitle);
    container.appendChild(local_match_button);
    container.appendChild(multi_player_button);
    container.appendChild(tournament_button);

    return container;
  }

  async afterRender() {

    document.getElementById('localMatchBtn').addEventListener('click', async() => {
			navigateTo('/local_match_select/');
		});

		document.getElementById('multiPlayerBtn').addEventListener('click', async() => {
			navigateTo('/multiplayer_select/');
		});

    document.getElementById('tournamentBtn').addEventListener('click', () => {
      navigateTo('/tournament_select/');
    });
  }
}
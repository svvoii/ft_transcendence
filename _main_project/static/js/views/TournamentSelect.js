import { navigateTo } from "../helpers/helpers.js";
import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Tournament Select");
    this.name = "TournamentSelect";
  }

  getDomElements() {

    // Create a container div
    const container = document.createElement('div');
    container.classList.add('text-container', 'game-select-button-div');

    // Create the page title
    const setTitle = document.createElement('h1');
    setTitle.textContent = 'Tournament';
    setTitle.style.textAlign = 'center';

    const setDescript = document.createElement('h2');
    setDescript.textContent = 'Please Select:';
    setDescript.style.textAlign = 'center';

		// Button to start single player game against AI
		const create_mp_match_btn = document.createElement('button');
		create_mp_match_btn.id = 'createMPMatchBtn';
    create_mp_match_btn.classList.add('game-select-button');
		create_mp_match_btn.type = 'select';
		create_mp_match_btn.textContent = 'Create a Match and invite another player';

    const orStatement = document.createElement('h1');
    orStatement.textContent = 'or';
    orStatement.style.textAlign = 'center';

		// Button to start multiplayer game against another player
		const join_mp_match_btn = document.createElement('button');
		join_mp_match_btn.id = 'joinMPMatchBtn';
    join_mp_match_btn.classList.add('game-select-button');
		join_mp_match_btn.type = 'select';
		join_mp_match_btn.textContent = 'Join a Match with antoher player';

    // Append the paragraph to the container
    container.appendChild(setTitle);
    container.appendChild(setDescript);
    container.appendChild(create_mp_match_btn);
    container.appendChild(orStatement);
    container.appendChild(join_mp_match_btn);

    return container;
  }

  async afterRender() {
    document.getElementById('createMPMatchBtn').addEventListener('click', async() => {
      navigateTo('/tournament_setup_create/');
    });

    document.getElementById('joinMPMatchBtn').addEventListener('click', async() => {
      navigateTo('/tournament_setup_join/');
    });
  }
}
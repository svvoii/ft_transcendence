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

    const form = document.createElement('form');
    form.id = 'tournamentLinkForm';
    form.onsubmit = (event) => event.preventDefault();

    const tournamentLinkInput = document.createElement('input');
    tournamentLinkInput.id = 'tournamentLinkInput';
    tournamentLinkInput.placeholder = 'Enter link';
    tournamentLinkInput.required = true;
    tournamentLinkInput.autofocus = true;

    // Append the paragraph to the container
    container.appendChild(setTitle);
    container.appendChild(setDescript);
    container.appendChild(create_mp_match_btn);
    container.appendChild(orStatement);
    container.appendChild(form);
    container.appendChild(tournamentLinkInput);
    container.appendChild(join_mp_match_btn);

    return container;
  }

  async afterRender() {
    document.getElementById('createMPMatchBtn').addEventListener('click', async() => {
      navigateTo('/tournament_setup_create/');
    });

    document.getElementById('tournamentLinkForm').addEventListener("submit", (e) => {
      e.preventDefault();
    
      console.log('link sent by user : ', document.getElementById('tournamentLinkInput').value);
    });

    document.getElementById('joinMPMatchBtn').addEventListener('click', () => {
      console.log('Join Tournament Lobby Button Clicked');

      try {
          this.navigate_to_tournamentURL_if_valid(document.getElementById('tournamentLinkInput'));
      } catch (error) {
        console.error('Error:', error);
      }
    });
  }

  async navigate_to_tournamentURL_if_valid(linkFormText) {

    const response = await fetch(`/tournament/tournament_check_in/${linkFormText.value}/`, {});

    const responseText = await response.text();
    const data = JSON.parse(responseText);

    console.log("Data before entering lobby :", data);

    if (data.status === 'success') {
      console.log('Tournament exists');
      navigateTo(`/tournament_lobby/${linkFormText.value}/`);
    } 
    else if (data.message == 'Tournament is full.') {
      console.log('Max number of players reached. You cannot join that tournament.');
    }
    else {
      console.log('Tournament does not exist');
      alert('Tournament does not exist');
    }
  }
}
import AbstractView from "./AbstractView.js";
import { navigateTo } from "../helpers/helpers.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Tournament Setup");
    this.name = "TournamentSetup";
  }

  getDomElements() {
    // Set the game modal to hidden
    document.getElementById("gameModal").style.display = "none";

    // Create a container div
    const container = document.createElement('div');
    container.classList.add('text-container');

    // Create the paragraph element
    const paragraph = document.createElement('p');
    paragraph.textContent = 'You are viewing the Tournament Setup Join Page!';

    // Create the button
    const tournament_lobby_button = document.createElement('button');
    tournament_lobby_button.id = 'tournamentLobbyBtn';
    tournament_lobby_button.type = 'select';
    tournament_lobby_button.textContent = 'Join Tournament';


    const form = document.createElement('form');
    form.id = 'tournamentLinkForm';
    form.onsubmit = (event) => event.preventDefault();

    const tournamentLinkInput = document.createElement('input');
    tournamentLinkInput.placeholder = 'Enter link';
    tournamentLinkInput.required = true;
    tournamentLinkInput.autofocus = true;
    form.appendChild(tournamentLinkInput);
    form.appendChild(document.createElement('br'));


    // Append the paragraph to the container
    container.appendChild(paragraph);
    container.appendChild(form);
    container.appendChild(tournament_lobby_button);

    return container;
  }

  async afterRender() {
    document.getElementById('tournamentLobbyBtn').addEventListener('click', () => {
      console.log('Join Tournament Lobby Button Clicked');
      navigateTo('/tournament_lobby/');
    });
  }
}
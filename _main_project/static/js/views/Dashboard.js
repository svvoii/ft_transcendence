import { navigateTo } from "../helpers/helpers.js";
import AbstractView from "./AbstractView.js";
import { user } from '../index.js';

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Dashboard");
    this.name = "Dashboard";
  }

  getDomElements() {
    // Set the game modal to hidden
    document.getElementById("gameModal").style.display = "none";

    const container = document.createElement('div');

    // Create the main container div
    const gifContainer = document.createElement('div');
    gifContainer.classList.add('gif-container');

    const textContainer = document.createElement('div');
    textContainer.classList.add('text-container');

    // Create the h1 element
    const heading = document.createElement('h1');
    heading.textContent = 'Welcome to our TranscenDANCE';
    heading.style.textAlign = 'center';

    // Create the button
    const button = document.createElement('button');
    button.id = 'playGameBtn';
    button.type = 'select';
    button.textContent = 'Start';
    button.classList.add('start-btn')

    // space
    const space = document.createElement('br');

    // Create the warning message
    const warning = document.createElement('p');
    warning.id = 'warningMsg';
    warning.classList.add('warning-message');
    warning.textContent = '';

    // Append all elements to the container
    textContainer.appendChild(heading);
    textContainer.appendChild(button);
    textContainer.appendChild(space);
    textContainer.appendChild(warning);

    container.appendChild(gifContainer);
    container.appendChild(textContainer);

    return container;
  }

  async afterRender() {
    document.getElementById('playGameBtn').addEventListener('click', () => {
      if (user.getLoginStatus()) {
        navigateTo('/game_menu/');
      } else {
        document.getElementById('warningMsg').textContent = 'Please log in to play the game!'
      }
    });
  }
}
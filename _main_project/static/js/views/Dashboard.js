import { navigateTo } from "../helpers/helpers.js";
import AbstractView from "./AbstractView.js";

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

    // Append all elements to the container
    textContainer.appendChild(heading);
    textContainer.appendChild(button);

    container.appendChild(gifContainer);
    container.appendChild(textContainer);

    return container;
  }

  async afterRender() {
    document.getElementById('playGameBtn').addEventListener('click', () => {
      navigateTo('/game_menu/');
    });
  }
}
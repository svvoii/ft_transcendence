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
    // container.classList.add('view-content');
    gifContainer.classList.add('gif-container');

    const textContainer = document.createElement('div');
    textContainer.classList.add('text-container');

    // Create the h1 element
    const heading = document.createElement('h1');
    heading.textContent = 'Welcome to our TranscenDANCE';

    // Create the first paragraph
    const paragraph1 = document.createElement('p');
    paragraph1.textContent = 'This is the dashboard. You can view the list of posts, your settings, or logout.';

    // Create the fourth paragraph
    const paragraph4 = document.createElement('p');
    paragraph4.textContent = 'Blah blah blah, some stuff about matchmaking? IDK....';

    // Create the button
    const button = document.createElement('button');
    button.id = 'playGameBtn';
    button.type = 'select';
    button.textContent = 'Play Game (Coming Soon)';

    // Append all elements to the container
    textContainer.appendChild(heading);
    textContainer.appendChild(paragraph1);
    textContainer.appendChild(paragraph4);
    textContainer.appendChild(button);

    container.appendChild(gifContainer);
    container.appendChild(textContainer);

    return container;
  }

  async afterRender() {
    const gameModal = document.getElementById("gameModal");

    document.getElementById('playGameBtn').addEventListener('click', () => {
      // gameModal.style.display = "flex";
      navigateTo('/game_menu/');
    });
  }
}
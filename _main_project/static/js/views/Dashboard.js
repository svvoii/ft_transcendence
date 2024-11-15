import AbstractView from "./AbstractView.js";
import Game from "./Game.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Dashboard");
    this.name = "Dashboard";
  }

  getDomElements() {
    // Create the main container div
    const container = document.createElement('div');
    container.classList.add('view-content');

    // Create the h1 element
    const heading = document.createElement('h1');
    heading.textContent = 'Welcome back to TranscenDANCE';

    // Create the first paragraph
    const paragraph1 = document.createElement('p');
    paragraph1.textContent = 'This is the dashboard. You can view the list of posts, your settings, or logout.';

    // Create the second paragraph with a link
    const paragraph2 = document.createElement('p');
    const link1 = document.createElement('a');
    link1.href = '/posts/';
    link1.setAttribute('data-link', '');
    link1.textContent = 'View recent posts';
    paragraph2.appendChild(link1);
    paragraph2.appendChild(document.createTextNode('.'));

    // Create the third paragraph with a link
    const paragraph3 = document.createElement('p');
    const link2 = document.createElement('a');
    link2.href = 'home/';
    link2.textContent = 'here';
    paragraph3.appendChild(document.createTextNode("If you'd like to look at the old version, click "));
    paragraph3.appendChild(link2);
    paragraph3.appendChild(document.createTextNode('.'));

    // Create the fourth paragraph
    const paragraph4 = document.createElement('p');
    paragraph4.textContent = 'Blah blah blah, some stuff about matchmaking? IDK....';

    // Create the button
    const button = document.createElement('button');
    button.id = 'playGameBtn';
    button.type = 'select';
    button.textContent = 'Play Game (Coming Soon)';

    // Append all elements to the container
    container.appendChild(heading);
    container.appendChild(paragraph1);
    container.appendChild(paragraph2);
    container.appendChild(paragraph3);
    container.appendChild(paragraph4);
    container.appendChild(button);

    return container;
  }

  async afterRender() {
    const gameModal = document.getElementById("game");

    document.getElementById('playGameBtn').addEventListener('click', async(event) => {
      gameModal.style.display = "block";

      const game = new Game();
      gameModal.innerHTML = await game.getHtml();
      game.afterRender();
    });
  }
}
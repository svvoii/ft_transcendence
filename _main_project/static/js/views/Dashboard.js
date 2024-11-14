import AbstractView from "./AbstractView.js";
import Game from "./Game.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Dashboard");
  }

  async getHtml() {
    return `
      <h1>Welcome back to TranscenDANCE</h1>
      <p>
        This is the dashboard. You can view the list of posts, your settings, or logout.
      </p>
      <p>
        <a href="/posts/" data-link>View recent posts</a>.
      </p>
      <p>
        If you'd like to look at the old version, click <a href="home/" >here</a>.
      </p>
      <p>
        Blah blah blah, some stuff about matchmaking? IDK....
      </p>
      <button id="playGameBtn", type="select">Play Game (Coming Soon)</button>
    `;
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
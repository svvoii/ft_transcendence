import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Game");
  }

  async getHtml() {
    return `
      <p>
        You are viewing the Game!!
      </p>
      <button id="closeGameBtn">Click here to close</button>
    `;
  }

  async afterRender() {
    const game = document.getElementById("game");

    document.getElementById('closeGameBtn').addEventListener('click', async(event) => {
      game.style.display = "none";
    });
  }
}
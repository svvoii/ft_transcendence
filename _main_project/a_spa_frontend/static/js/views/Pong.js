import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
  constructor(params) {
      super(params);
      this.setTitle("Pong");
  }

  async getHtml() {
      return `
        <h1>Ding...</h1>

        <button id="startGame">Pong ?</button>
        <pre class="response-box-pong" id="responsePong"></pre>
      `;
    }
  
  async afterRender() {
    const startGame = document.getElementById("startGame");

    startGame.addEventListener('click', async () => {
      const response = await fetch('http://localhost:8000/pong/pong_test_func/');
      const text = await response.text();

      const responseContainer = document.getElementById("responsePong");
      responseContainer.innerHTML = text;
    });
  }
}
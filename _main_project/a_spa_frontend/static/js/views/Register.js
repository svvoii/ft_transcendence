import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Register");
  }

  async getHtml() {
    return `
      <p>
        You are viewing the register page!
      </p>

      <button id="register-button">Register</button>
    `;
  }

  async afterRender() {
    const registerButton = document.getElementById("register-button");

    registerButton.addEventListener('click', async () => {
      console.log("Register button pressed");
    });

  }
}
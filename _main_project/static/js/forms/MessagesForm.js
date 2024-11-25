import AbstractModalView from "./AbstractModalView.js";
// import { user, chat } from "../index.js";

export default class extends AbstractModalView {
  constructor(modal) {
    super(modal);
    this.setTitle("Messages Form");
    this.loginData = null;
  }

  async createDomElements(data=null) {
    try {
      const container = document.createElement('div');

      const title = document.createElement('h2');
      title.textContent = 'Messages';
      title.classList.add('modal-title');
      container.appendChild(title);

      return container;

    } catch (error) {
      console.log(error);
      return document.createElement('div'); // Return an empty div in case of error
    }
  }
}
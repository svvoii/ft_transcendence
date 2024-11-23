import AbstractModalView from "./AbstractModalView.js";

export default class extends AbstractModalView {
  constructor(modal) {
    super(modal);
    this.setTitle("Search User Form");
    this.loginData = null;
  }

  async createDomElements() {
    const container = document.createElement('div');

    const title = document.createElement('h2');
    title.textContent = 'Search User';
    title.classList.add('modal-title');
    container.appendChild(title);

    return container;
  }
}
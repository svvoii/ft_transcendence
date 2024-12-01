import AbstractModalView from "./AbstractModalView.js";

export default class extends AbstractModalView {
  constructor(modal) {
    super(modal);
    this.setTitle("User Form");
  }

  createDomElements(data=null) {
    // Create the container
    const container = document.createElement('div');

    const title = document.createElement('h2');
    title.textContent = 'Friends List';
    title.classList.add('modal-title');
    container.appendChild(title);

    return container;
  }

  async afterRender() {

  }
}
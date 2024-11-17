import AbstractModalView from "./AbstractModalView.js";

export default class extends AbstractModalView {
  constructor(modal) {
    super(modal);
    this.setTitle("ForgotPassword");
  }

  createDomElements() {
    // Create the container
    const container = document.createElement('div');

    // Create the title
    const title = document.createElement('h2');
    title.textContent = 'Forgot Password';
    title.classList.add('modal-title');

    // const form = document.createElement('form');
    const paragraph = document.createElement('p');
    paragraph.textContent = 'This is the pass reset form';

    container.appendChild(title);
    container.appendChild(paragraph);

    return container;
  }

  async afterRender() {
  }
}
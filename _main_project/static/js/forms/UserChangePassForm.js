import AbstractModalView from "./AbstractModalView.js";

export default class extends AbstractModalView {
  constructor(modal) {
    super(modal);
    this.setTitle("User Change Password Form");
  }

  createDomElements() {
    // Create the container
    const container = document.createElement('div');

    // Create the title
    const title = document.createElement('h2');
    title.textContent = 'Change User Password';
    title.classList.add('modal-title');
    container.appendChild(title);

    // Create the paragraph
    const paragraph = document.createElement('p');
    paragraph.textContent = 'Viewing Change User Password Screen! (WIP)';
    container.appendChild(paragraph);

    return container;
  }
}
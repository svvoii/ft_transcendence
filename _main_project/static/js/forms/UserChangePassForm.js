import AbstractModalView from "./AbstractModalView.js";

export default class extends AbstractModalView {
  constructor(modal) {
    super(modal);
    this.setTitle("User Change Password Form");
  }

  createDomElements() {
    // Create the container
    const container = document.createElement('div');

    // Create the paragraph
    const paragraph = document.createElement('p');
    paragraph.textContent = 'Viewing Change User Pass Screen!';
    container.appendChild(paragraph);

    return container;
  }
}
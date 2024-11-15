import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Settings");
    this.name = "Settings";
  }

  getDomElements() {
    // Create a container div
    const container = document.createElement('div');
    container.classList.add('text-container');

    // Create the paragraph element
    const paragraph = document.createElement('p');
    paragraph.textContent = 'You are viewing the settings!';

    // Append the paragraph to the container
    container.appendChild(paragraph);

    return container;
  }
}
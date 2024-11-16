import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Privacy Policy");
    this.name = "PrivacyPolicy";
  }

  getDomElements() {
    // Set the game modal to hidden
    document.getElementById("gameModal").style.display = "none";

    // Create a container div
    const container = document.createElement('div');
    container.classList.add('text-container');

    // Create the paragraph element
    const paragraph = document.createElement('p');
    paragraph.textContent = 'You are viewing the privacy policy!';

    // Append the paragraph to the container
    container.appendChild(paragraph);

    return container;
  }
}
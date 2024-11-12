import AbstractModalView from "./AbstractModalView.js";

export default class extends AbstractModalView {
  constructor(modal) {
    super(modal);
    this.setTitle("View User Form");
    this.domElements = null;
  }

  async getHtml() {
    try {
      const loginResponse = await fetch('/login_check/');
      const loginData = await loginResponse.json();
      const userResponse = await fetch(`http://localhost:8000/user/${loginData.id}/`);
      const userData = await userResponse.json();
      return `
        <img src="${userData.profile_image}" alt="user image" style="width: 100px; height: 100px;">
        <h3>Username: ${userData.username}</h3>
        <p>Email: ${userData.email}</p>
      `;
    } catch (error) {
      console.log(error);
      return "";
    }
  }

  async init() {
    if (this.domElements === null)
      this.domElements = await this.createDomElements();
  }

  getDomElements() {
    return this.domElements;
  }

  async createDomElements() {
    try {
      const loginResponse = await fetch('/login_check/');
      const loginData = await loginResponse.json();
      const userResponse = await fetch(`http://localhost:8000/user/${loginData.id}/`);
      const userData = await userResponse.json();

      // Create the container
      const container = document.createElement('div');

      // Create the image element
      const img = document.createElement('img');
      img.src = userData.profile_image;
      img.alt = 'user image';
      img.style.width = '100px';
      img.style.height = '100px';
      container.appendChild(img);

      // Create the username heading
      const usernameHeading = document.createElement('h3');
      usernameHeading.textContent = `Username: ${userData.username}`;
      container.appendChild(usernameHeading);

      // Create the email paragraph
      const emailParagraph = document.createElement('p');
      emailParagraph.textContent = `Email: ${userData.email}`;
      container.appendChild(emailParagraph);

      return container;
    } catch (error) {
      console.log(error);
      return document.createElement('div'); // Return an empty div in case of error
    }
  }
}
import AbstractModalView from "./AbstractModalView.js";

export default class extends AbstractModalView {
  constructor(modal) {
    super(modal);
    this.setTitle("View User Form");
    this.loginData = null;
  }

  async createDomElements() {
    try {
      const loginResponse = await fetch('/login_check/');
      this.loginData = await loginResponse.json();
      const userResponse = await fetch(`http://localhost:8000/user/${this.loginData.id}/`);
      const userData = await userResponse.json();

      // Create the container
      const container = document.createElement('div');

      // Create the title
      const title = document.createElement('h2');
      title.textContent = 'View User Profile';
      title.classList.add('modal-title');
      container.appendChild(title);

      // Create the image element
      const img = document.createElement('img');
      img.src = userData.profile_image;
      img.alt = 'user image';
      img.classList.add('user-image');
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
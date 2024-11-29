import AbstractModalView from "./AbstractModalView.js";
import { user, chat } from "../index.js";

export default class extends AbstractModalView {
  constructor(modal) {
    super(modal);
    this.setTitle("View User Form");
    this.loginData = null;
  }

  async createDomElements(data=null) {
    try {
      if (user.getLoginStatus() === false) {
        return ;
      }
      let userResponse = null;
      if (data) {
        userResponse = await fetch(`http://localhost:8000/user/${data.id}/`);
      } else {
        userResponse = await fetch(`http://localhost:8000/user/${user.getUserId()}/`);
      }
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

      // Add a send a message button
      if (data !== null && user.getUserId() !== data.id) {
        const sendAMessageBtn = document.createElement('button');
        sendAMessageBtn.id = 'sendAMessageBtn';
        sendAMessageBtn.classList.add('select-button');
        sendAMessageBtn.textContent = 'Send a Message';
        sendAMessageBtn.addEventListener('click', async() => {
          // Open the chat modal and start a chat with the user
          chat.openChat();
          await chat.startChat(userData.username);
        });

        container.appendChild(sendAMessageBtn);
      }

      return container;
    } catch (error) {
      console.log(error);
      return document.createElement('div'); // Return an empty div in case of error
    }
  }
}
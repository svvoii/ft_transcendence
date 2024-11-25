import AbstractModalView from "./AbstractModalView.js";
import { user, chat, modal } from "../index.js";

export default class extends AbstractModalView {
  constructor(modal) {
    super(modal);
    this.setTitle("Messages Form");
    this.loginData = null;
  }

  async createDomElements(data=null) {
    try {
      const container = document.createElement('div');

      const title = document.createElement('h2');
      title.textContent = 'Messages';
      title.classList.add('modal-title');
      container.appendChild(title);

      const response = await fetch('/chat/get_chatrooms/');
      const chatroom_data = await response.json();

      chatroom_data.forEach(chatroom => {
        const chatroom_div = document.createElement('p');
        chatroom_div.classList.add('chatroom');

        const other_user = chatroom.members[0] === user.getUserName() ? chatroom.members[1] : chatroom.members[0];

        chatroom_div.textContent = other_user;

        chatroom_div.onclick = () => {
          chat.openChat();
          chat.startChat(other_user);
          modal.hide();
        }
        container.appendChild(chatroom_div);
      });

      return container;

    } catch (error) {
      console.log(error);
      return document.createElement('div'); // Return an empty div in case of error
    }
  }
}
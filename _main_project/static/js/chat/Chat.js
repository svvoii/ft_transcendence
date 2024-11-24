import { user } from '../index.js';

export default class Chat {
  constructor(appId) {
    this.title = "Chat";
    this.app = document.querySelector(`#${appId}`);
    this.chat = document.createElement('div');
    this.chat.classList.add('chat');
    this.chat.id = 'resizable';
    this.closedChatBox();
    this.openedChatBox();
    this.chat.querySelector('.chat-box-opened').style.display = 'none';
    this.chat.style.transform = 'translate(50%, 50%)';
  }

  closedChatBox() {
    const closedChatBox = document.createElement('div');
    closedChatBox.classList.add('chat-box-closed');

    closedChatBox.textContent = "Chat +";

    this.chat.appendChild(closedChatBox);
  }

  openedChatBox() {

    const openedChatBox = document.createElement('div');
    openedChatBox.classList.add('chat-box-opened');

    // Create the header
    const header = document.createElement('div');
    header.classList.add('chat-header');
    const title = document.createElement('span');
    title.textContent = this.title;
    const closeSpan = document.createElement('span');
    closeSpan.classList.add('close-chat');
    closeSpan.innerHTML = '&times;';
    header.appendChild(title);
    header.appendChild(closeSpan);

    // Create the messages container
    const messagesContainer = document.createElement('div');
    messagesContainer.classList.add('chat-messages');

    // Create the input area
    const inputArea = document.createElement('div');
    inputArea.classList.add('chat-input');
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Type a message...';
    input.classList.add('chat-input-field');
    const sendButton = document.createElement('button');
    sendButton.textContent = 'Send';
    inputArea.appendChild(input);
    inputArea.appendChild(sendButton);

    // Append all elements to the opened chat box
    openedChatBox.appendChild(header);
    openedChatBox.appendChild(messagesContainer);
    openedChatBox.appendChild(inputArea);

    this.chat.appendChild(openedChatBox);

    // Add event listeners
    closeSpan.addEventListener('click', () => {
      openedChatBox.style.display = 'none';
      this.chat.querySelector('.chat-box-closed').style.display = 'flex';
    });

    this.chat.querySelector('.chat-box-closed').addEventListener('click', () => {
      openedChatBox.style.display = 'flex';
      this.chat.querySelector('.chat-box-closed').style.display = 'none';
    });
  }

  full_render() {
    this.showChatIfLoggedIn();
    this.addEventListeners();
    this.app.appendChild(this.chat);
  }

  fast_render() {
    this.showChatIfLoggedIn();
    this.app.appendChild(this.chat);
  }

  addEventListeners() {
    // Add event listener for clicking the closed chat box
    this.chat.querySelector('.chat-box-closed').addEventListener('click', () => {
      this.openChat();
    });
    // Adds event listener for clicking the close when the chat box is opened
    this.chat.querySelector('.close-chat').addEventListener('click', () => {
      this.closeChat();
    });
  }

  testAddChatMessage(message) {
    const messageContainer = this.chat.querySelector('.chat-messages');
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message');
    messageElement.textContent = message;
    messageContainer.appendChild(messageElement);
  }

  showChatIfLoggedIn() {
    if (user.getLoginStatus()) {
      this.chat.style.display = 'block';
    } else {
      this.chat.style.display = 'none';
    }
  }

  openChat() {
    this.chat.querySelector('.chat-box-closed').style.display = 'none';
    this.chat.querySelector('.chat-box-opened').style.display = 'flex';
    this.app.querySelector('.chat').style.transform = 'translate(0%, 0%)';
    this.app.querySelector('.chat').style.right = '0px';
    this.app.querySelector('.chat').style.bottom = '0px';
  }

  closeChat() {
    this.chat.querySelector('.chat-box-closed').style.display = 'block';
    this.chat.querySelector('.chat-box-opened').style.display = 'none';
    this.app.querySelector('.chat').style.transform = 'translate(50%, 50%)';
    this.app.querySelector('.chat').style.right = '2rem';
    this.app.querySelector('.chat').style.bottom = 'calc(var(--footer-height) / 2)';
  }
};
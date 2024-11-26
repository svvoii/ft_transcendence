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
    title.classList.add('chat-title');
    title.textContent = this.title;
    const inviteButton = document.createElement('button');
    inviteButton.classList.add('chat-invite-button');
    inviteButton.textContent = 'Invite to game';
    inviteButton.style.display = 'none';
    const closeSpan = document.createElement('span');
    closeSpan.classList.add('close-chat');
    closeSpan.innerHTML = '&times;';
    header.appendChild(title);
    header.appendChild(inviteButton);
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
    sendButton.classList.add('chat-send-button');
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

    this.chat.querySelector('.chat-send-button').addEventListener('click', () => {
      const input = this.chat.querySelector('.chat-input-field');
      const message = input.value;
      if (message) {
        this.sendMessage(message);
        input.value = '';
      }
    });

    this.chat.querySelector('.chat-invite-button').addEventListener('click', () => {
      console.log('Invite button clicked');
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

  async startChat(username, room_name=null) {
    // init
    this.closeSocket();
    this.clearChat();
    document.querySelector('.chat-invite-button').style.display = 'block';
    document.querySelector('.chat-title').textContent = `${username}`;
    // Create a chatroom
    try {
      let room_to_open = room_name;
      if (!room_name) {
        const response = await fetch(`http://localhost:8000/chat/chat/${username}`)
        if (!response.ok) {
          throw new Error('Failed to create chatroom');
        }
        const data = await response.json();
        room_to_open = data.room_name;
      }

      const wsUrl = `ws://localhost:8000/ws/chatroom/${room_to_open}/`;
      this.socket = new WebSocket(wsUrl);

      // Handle WebSocket events
      this.socket.onopen = () => {
        // console.log('WebSocket connection established');
        this.testAddChatMessage(`Connected to chat with ${username}`);
      };

      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.online_count) {
            this.testAddChatMessage(`Online Users: ${message.online_count}`);
            return;
          } else if (message.user !== user.getUserName()) {
            this.testAddChatMessage(`${message.user}: ${message.message.msg_content}`);
          }
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      };

      this.socket.onclose = () => {
        // console.log('WebSocket connection closed');
        // this.testAddChatMessage('Chat connection closed');
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.testAddChatMessage('Error in chat connection');
      };

    } catch (error) {
      console.error(error);
    }
  }

  sendMessage(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ message: message }));
      this.testAddChatMessage(`You: ${message}`);
    } else {
      // console.error('WebSocket is not open');
    }
  }

  clearChat() {
    this.chat.querySelector('.chat-messages').innerHTML = '';
    this.chat.querySelector('.chat-title').textContent = this.title;
    this.chat.querySelector('.chat-invite-button').style.display = 'none';
  }

  closeSocket() {
    if (this.socket) {
      this.socket.close();
    }
  }
};
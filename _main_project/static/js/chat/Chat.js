import { user, modal, gameBoard } from '../index.js';
import { createGameWith2Players } from '../game/GameAPI.js';

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

  //// INITIAL RENDERING ////

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

    ///// INVITE BUTTON /////

    this.chat.querySelector('.chat-invite-button').addEventListener('click', async() => {
      // console.log('Invite button clicked');
      try {
		const player1 = user.getUserName();
		const player2 = this.chat.querySelector('.chat-title').textContent; 

		gameBoard.inviteToPlayFromChat(player1, player2);

		gameBoard.resetGameBoard();
		gameModal.style.display = 'flex';

      } catch (error) {
        console.error('Error inviting to game:', error);
      }
    });

    this.chat.querySelector('.chat-input-field').addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        const input = this.chat.querySelector('.chat-input-field');
        const message = input.value;
        if (message) {
          this.sendMessage(message);
          input.value = '';
        }
      }
    });
  }

  //// VISUAL CHAT BOX FUNCTIONS ////

  showChatIfLoggedIn() {
    if (user.getLoginStatus()) {
      this.chat.style.display = 'block';
    } else {
      this.chat.style.display = 'none';
    }
  }

  async setChatTitle(title) {
    document.querySelector('.chat-invite-button').style.display = 'block';
    document.querySelector('.chat-title').textContent = `${title}`;

    const titleClick = async() => {
      const response = await fetch(`/search/?q=${encodeURIComponent(title)}`, {
		headers: {
			'X-Requested-With': 'XMLHttpRequest'
		}
	  });
      if (response.ok) {
        const data = await response.json();
        modal.showForm('userViewForm', data.accounts[0][0]);
      } else {
        console.error('Search request failed');
      }
    };

    document.querySelector('.chat-title').addEventListener('click', titleClick);
    this.chatTitleClickHandler = titleClick;
  }

  openChat() {
    this.chat.querySelector('.chat-box-closed').style.display = 'none';
    this.chat.querySelector('.chat-box-opened').style.display = 'flex';
    this.app.querySelector('.chat').style.transform = 'translate(0%, 0%)';
    this.app.querySelector('.chat').style.right = '0px';
    this.app.querySelector('.chat').style.bottom = '0px';

    const inputBox = this.chat.querySelector('.chat-input-field');
    if (inputBox) {
      inputBox.focus();
    }
  }

  closeChat() {
    this.chat.querySelector('.chat-box-closed').style.display = 'block';
    this.chat.querySelector('.chat-box-opened').style.display = 'none';
    this.app.querySelector('.chat').style.transform = 'translate(50%, 50%)';
    this.app.querySelector('.chat').style.right = '2rem';
    this.app.querySelector('.chat').style.bottom = 'calc(var(--footer-height) / 2)';
  }

  //// CHAT CONNECTION AND SOCKET ////

  async startChat(username) {
    // init
    this.clearChat();
    await this.setChatTitle(username);
    try {
      // Get the chatroom name
      const response = await fetch(`/chat/chat/${username}`, {
		headers: {
			'X-Requested-With': 'XMLHttpRequest'
		}
	  });
      const data = await response.json();
      // console.log("Data:", data);
      if (data.error) {
        this.addChatMessage('system', data.error);
        throw new Error(data.error);
      }
      const room_name = data.room_name;

      const ws_protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
			this.socket = new WebSocket(`${ws_protocol}://${window.location.host}/ws/chatroom/${room_name}/`);

      // Get the chatroom history
      await this.getMessageHistory(room_name);

      // Handle WebSocket events
      this.socket.onopen = () => {
        // console.log('WebSocket connection established');
        this.addChatMessage("system", `Connected to chat with ${username}`);
      };

      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.online_count) {
            this.addChatMessage('system', `Online Users: ${message.online_count}`);
            return;
          } else if (message.user !== user.getUserName()) {
            this.addChatMessage(message.user, message.message.msg_content);
          }
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      };

      this.socket.onclose = () => {
        // console.log('WebSocket connection closed');
        // this.addChatMessage('system', 'Chat connection closed');
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.addChatMessage('system', 'Error in chat connection');
      };
    } catch (error) {
      // console.error(error);
    }
  }

  //// CLEANUP ////

  clearChat() {
    this.chat.querySelector('.chat-messages').innerHTML = '';
    this.chat.querySelector('.chat-title').textContent = this.title;
    this.chat.querySelector('.chat-title').removeEventListener('click', this.chatTitleClickHandler);
    this.chat.querySelector('.chat-invite-button').style.display = 'none';
    this.closeSocket();
  }

  closeSocket() {
    if (this.socket) {
      this.socket.close();
    }
  }

  //// MESSAGES AND HISTORY ////
  
  addChatMessage(sender, message) {
    const messageContainer = this.chat.querySelector('.chat-messages');
    const messageElement = document.createElement('div');

    if (sender === 'You') {
      messageElement.classList.add('chat-message-you');
    } else if (sender === 'system') {
      messageElement.classList.add('chat-message-system');
    } else {
      messageElement.classList.add('chat-message-other')
    }

    messageElement.textContent = message;
    messageContainer.appendChild(messageElement);

    // Scroll to the bottom of the messages container
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }

  sendMessage(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ message: message }));
      this.addChatMessage('You', message);
    } else {
      // console.error('WebSocket is not open');
    }
  }

  async getMessageHistory(room_name) {
    try {
      const response = await fetch(`/chat/chat/${room_name}/messages`, {
		headers: {
			'X-Requested-With': 'XMLHttpRequest'	
		}
	  });

      const data = await response.json();

      if (data.length > 0) {
        data.forEach(message => {
          if (message.author === user.getUserName()) {
            this.addChatMessage('You', message.content);
          } else {
            this.addChatMessage(message.author, message.content);
          }
        });
        this.addChatMessage('system', `End of chat history`);
      } else {
        this.addChatMessage('system', `No chat history yet`);
      }

    } catch (error) {
      console.error(error);
    }
  }

  //// CHATROOMS ////

  // Returns an array of chatroom objects
  async getAllUserChatrooms() {
    try {
      const response = await fetch('/chat/chat/get_chatrooms/', {
		headers: {
			'X-Requested-With': 'XMLHttpRequest'
		}
	  });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
    }
  }

  getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }
};
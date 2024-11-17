export default class Chat {
  constructor(appId) {
    this.title = "Chat";
    this.app = document.querySelector(`#${appId}`);
    this.chat = document.createElement('div');
    this.chat.classList.add('chat');
    this.closedChatBox();
  }

  closedChatBox() {
    this.chat.classList.remove('chat-box-opened');
    this.chat.classList.add('chat-box-closed');
    this.chat.textContent = "Chat +";
  }

  openedChatBox() {
    this.chat.classList.remove('chat-box-closed');
    this.chat.classList.add('chat-box-opened');
    this.chat.textContent = "Chat box opened!!!";
  }

  full_render() {
    this.addEventListeners();
    this.app.appendChild(this.chat);
  }

  fast_render() {
    this.app.appendChild(this.chat);
  }

  addEventListeners() {
    this.chat.addEventListener('click', () => {
      if (this.chat.classList.contains('chat-box-closed')) {
        this.openedChatBox();
      } else {
        this.closedChatBox();
      }
    });
  }

};
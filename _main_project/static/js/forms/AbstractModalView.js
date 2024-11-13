export default class {
  constructor(modal) {
    this.modal = modal;
  }

  setTitle(title) {
    document.title = title;
  }

  createDomElements() {
    return document.createElement('div');
  }

  async afterRender() {
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
}
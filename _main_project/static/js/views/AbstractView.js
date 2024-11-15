// An Abstract class for all views
export default class {
  constructor(params) {
    this.params = params;
    this.name = '';

    // console.log(params);
  }

  // Updated the title of the document when a new view is rendered
  setTitle(title) {
    document.title = title;
  }

  getDomElements() {
    return document.createElement('div');
  }

  async afterRender() {
    // After the view is rendered, this function will be called.
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
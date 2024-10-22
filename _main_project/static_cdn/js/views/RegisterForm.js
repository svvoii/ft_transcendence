import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Register Form");
  }

  async getHtml() {
    const csrfToken = this.getCookie('csrftoken');
    return `
      <div class="modal-content">
        <span class="close">&times;</span>
        <p>This is the register modal!</p>

        <form action="/register/" method="POST">
          <input type="hidden" name="csrfmiddlewaretoken" value="${csrfToken}">
          <input type="email" name="email" placeholder="Email address" required autofocus></br>
          <input type="text" name="username" placeholder="Username" required></br>
          <input type="password" name="password1" placeholder="Password" required></br>
          <input type="password" name="password2" placeholder="Confirm password" required></br>
          <button type="submit">Register</button>
        </form>
      </div>
    `;
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
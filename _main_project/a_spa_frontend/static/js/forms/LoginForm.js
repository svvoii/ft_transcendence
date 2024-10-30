import AbstractView from "../views/AbstractView.js";
import { navigateTo } from "../index.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Login Form");
  }

  async getHtml() {
    const csrfToken = this.getCookie('csrftoken');
    return `
      <p>This is the login modal!</p>

      <form id="loginForm" onsubmit="event.preventDefault();" >
        <input type="hidden" name="csrfmiddlewaretoken" value="${csrfToken}">
        <input type="email" name="email" placeholder="Email address" required autofocus></br>
        <input type="password" name="password" placeholder="Password" required></br>
        <p><span id="message" style="color: red;"></span></p>
        <button type="submit">Login</button>
      </form>
    `;
  }

  async afterRender() {

    const modal = document.getElementById("formModal");

    document.getElementById('loginForm').addEventListener('submit', async(event) => {
      // Create form 
      const form = event.target;
      const formData = new FormData(form);
      const data = {};
      formData.forEach((value, key) => {
        data[key] = value;
      });

      const content = {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-CSRFToken': this.getCookie('csrftoken') // Include CSRF token
        },
        body: JSON.stringify(data)
      };

      try {
        const response = await fetch("/login/", content);
        const result = await response.json();
        const messageDiv = document.getElementById('message');

        if (response.ok) {
          messageDiv.textContent = result.message;
          if (result.redirect) {
            modal.style.display = "none";
            localStorage.setItem('isLoggedIn', true);
            navigateTo(result.redirect);
          }
          // Update user profile image
          if (result.profile_image_url) {
            const userPic = document.getElementById('userPic');
            userPic.src = result.profile_image_url;
            localStorage.setItem('profile_image_url', result.profile_image_url);
          }
          if (result.username) {
            localStorage.setItem('profile_username', result.username);
          }
        } else {
          messageDiv.textContent = JSON.stringify(result.errors);
        }
      } catch (error) {
        console.log('Error occured');
        console.error('Error:', error);
        const messageDiv = document.getElementById('message');
        messageDiv.textContent = 'An error occurred. Please try again.';
      }
    });
  }
}
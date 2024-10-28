import AbstractView from "./AbstractView.js";
import { navigateTo } from "../index.js";

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
        <p class="motherSpeaking">Please enter email address :</p>

        <form id="registrationForm" onsubmit="event.preventDefault();" >
          <input type="hidden" name="csrfmiddlewaretoken" value="${csrfToken}">
          <input type="email" name="email" placeholder="Email address" required autofocus></br>
          <input type="text" name="username" placeholder="Username" required></br>
          <input type="password" name="password1" placeholder="Password" required></br>
          <input type="password" name="password2" placeholder="Confirm password" required></br>
          <p><span id="message" style="color: red;"></span></p>
          <button type="submit">Register</button>
        </form>
      </div>
    `;
  }

  async afterRender() {
    const modal = document.getElementById("modalWindow");

    document.getElementById('registrationForm').addEventListener('submit', async(event) => {
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
        const response = await fetch("/register/", content);
        const result = await response.json();
        const messageDiv = document.getElementById('message');

        if (response.ok) {
          messageDiv.textContent = result.message;
          if (result.redirect) {
            modal.style.display = "none";
            localStorage.setItem('isLoggedIn', true);
            navigateTo(result.redirect);
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
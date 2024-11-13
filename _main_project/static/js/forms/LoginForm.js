import AbstractModalView from "./AbstractModalView.js";
import { navigateTo } from "../helpers/helpers.js";

export default class extends AbstractModalView {
  constructor(modal) {
    super(modal);
    this.setTitle("Login Form");
  }

  createDomElements() {
    const csrfToken = this.getCookie('csrftoken');

    // Create the container
    const container = document.createElement('div');

    // Create the paragraph
    const paragraph = document.createElement('p');
    paragraph.textContent = 'This is the login modal!';
    container.appendChild(paragraph);

    // Create the form
    const form = document.createElement('form');
    form.id = 'loginForm';
    form.onsubmit = (event) => event.preventDefault();

    // Create the CSRF token input
    const csrfInput = document.createElement('input');
    csrfInput.type = 'hidden';
    csrfInput.name = 'csrfmiddlewaretoken';
    // csrfInput.value = csrfToken;
    form.appendChild(csrfInput);

    // Create the email input
    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.name = 'email';
    emailInput.placeholder = 'Email address';
    emailInput.required = true;
    emailInput.autofocus = true;
    form.appendChild(emailInput);
    form.appendChild(document.createElement('br'));

    // Create the password input
    const passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    passwordInput.name = 'password';
    passwordInput.placeholder = 'Password';
    passwordInput.required = true;
    form.appendChild(passwordInput);
    form.appendChild(document.createElement('br'));

    // Create the message paragraph
    const messageParagraph = document.createElement('p');
    const messageSpan = document.createElement('span');
    messageSpan.id = 'message';
    messageSpan.style.color = 'red';
    messageParagraph.appendChild(messageSpan);
    form.appendChild(messageParagraph);

    // Create the submit button
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Login';
    form.appendChild(submitButton);

    // Append the form to the container
    container.appendChild(form);

    return container;
  }

  async afterRender() {
    document.getElementById('loginForm').addEventListener('submit', async(event) => {
    // this.domElements.querySelector('#loginForm').addEventListener('submit', async(event) => {
      // Create form 
      console.log('Login form submitted');
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
            this.modal.hide();
            navigateTo(result.redirect);
          }
          // Update user profile image
          if (result.profile_image_url) {
            const userPic = document.getElementById('userPic');
            userPic.src = result.profile_image_url;
          }
        } else {
          messageDiv.textContent = JSON.stringify(result.errors);
        }
      } catch (error) {
        console.error('Error:', error);
        const messageDiv = document.getElementById('message');
        messageDiv.textContent = 'An error occurred. Please try again.';
      }
    });
  }
}
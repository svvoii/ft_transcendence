import AbstractModalView from "./AbstractModalView.js";
import { navigateTo } from "../helpers/helpers.js";
import { user } from "../index.js";

export default class extends AbstractModalView {
  constructor(modal) {
    super(modal);
    this.setTitle("Login Form");
  }

  createDomElements(data=null) {
    // const csrfToken = this.getCookie('csrftoken');

    // Create the container
    const container = document.createElement('div');

    // Create the paragraph
    const title = document.createElement('h2');
    title.classList.add('modal-title');
    title.textContent = 'Login';
    container.appendChild(title);

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
    messageSpan.classList.add('message');
    messageSpan.id = 'message';
    messageParagraph.appendChild(messageSpan);
    form.appendChild(messageParagraph);

    // Create the submit button
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Login';
    submitButton.style.marginBottom = '0.5rem;'
    form.appendChild(submitButton);

    const oauthContainer = document.createElement('a');
    oauthContainer.classList.add('oauth-container');
    oauthContainer.textContent = 'Login with 42';
    oauthContainer.href = 'http://localhost:8000/accounts/42/login/?process=login';

    // Create the forgot password link
    const forgotPassButton = document.createElement('button');
    forgotPassButton.id = 'forgotPass';
    forgotPassButton.type = 'select';
    forgotPassButton.textContent = 'Forgot Password?';

    // Append the form to the container
    container.appendChild(form);

    container.appendChild(oauthContainer);
    container.appendChild(forgotPassButton);

    return container;
  }

  async afterRender() {
    document.getElementById('loginForm').addEventListener('submit', async(event) => {
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
          user.userLoginCheck();
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
          messageDiv.textContent = '';

          for (const [key, value] of Object.entries(result.errors)) {
            const errorMessage = document.createElement('p');
            errorMessage.classList.add('message');
            errorMessage.textContent = `${key}: ${value}`;
            messageDiv.appendChild(errorMessage);
          }
        }
      } catch (error) {
        console.error('Error:', error);
        const messageDiv = document.getElementById('message');
        messageDiv.textContent = 'An error occurred. Please try again.';
      }
    });

    document.getElementById('forgotPass').addEventListener('click', () => {
      this.modal.showForm('forgotPassForm');
    });
  }
}
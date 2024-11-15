import AbstractModalView from "./AbstractModalView.js";
import { navigateTo } from "../helpers/helpers.js";

export default class extends AbstractModalView {
  constructor(modal) {
    super(modal);
    this.setTitle("Register Form");
  }

  createDomElements() {
    const csrfToken = this.getCookie('csrftoken');

    // Create the container
    const container = document.createElement('div');

    // Create the paragraph
    const title = document.createElement('h2');
    title.classList.add('modal-title');
    title.textContent = 'Register';
    container.appendChild(title);

    // Create the form
    const form = document.createElement('form');
    form.id = 'registrationForm';
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

    // Create the username input
    const usernameInput = document.createElement('input');
    usernameInput.type = 'text';
    usernameInput.name = 'username';
    usernameInput.placeholder = 'Username';
    usernameInput.required = true;
    form.appendChild(usernameInput);
    form.appendChild(document.createElement('br'));

    // Create the password1 input
    const password1Input = document.createElement('input');
    password1Input.type = 'password';
    password1Input.name = 'password1';
    password1Input.placeholder = 'Password';
    password1Input.required = true;
    form.appendChild(password1Input);
    form.appendChild(document.createElement('br'));

    // Create the password2 input
    const password2Input = document.createElement('input');
    password2Input.type = 'password';
    password2Input.name = 'password2';
    password2Input.placeholder = 'Confirm password';
    password2Input.required = true;
    form.appendChild(password2Input);
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
    submitButton.textContent = 'Register';
    form.appendChild(submitButton);

    // Append the form to the container
    container.appendChild(form);

    return container;
  }

  async afterRender() {
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
        console.log('Error occured');
        console.error('Error:', error);
        const messageDiv = document.getElementById('message');
        messageDiv.textContent = 'An error occurred. Please try again.';
      }
    });
  }

}
import { navigateTo } from "../helpers/helpers.js";
import AbstractModalView from "./AbstractModalView.js";

export default class extends AbstractModalView {
  constructor(modal) {
    super(modal);
    this.setTitle("User Edit Form");
    this.loginData = null;
  }

  async createDomElements(data=null) {
    try {
      const loginResponse = await fetch('/login_check/');
      this.loginData = await loginResponse.json();
      const userResponse = await fetch(`http://localhost:8000/user/${this.loginData.id}/`);
      const userData = await userResponse.json();

      // Create the container
      const container = document.createElement('div');

      // Create the title
      const title = document.createElement('h2');
      title.textContent = 'Edit User Profile';
      title.classList.add('modal-title');
      container.appendChild(title);

      // Create the image element
      const img = document.createElement('img');
      img.src = userData.profile_image;
      img.alt = 'user image';
      img.classList.add('user-image');
      container.appendChild(img);

      // Create the line break element
      const br = document.createElement('br');
      container.appendChild(br);

      // Create the form
      const form = document.createElement('form');
      form.id = 'editUserForm';
      form.onsubmit = (event) => event.preventDefault();

      // Create the file input
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.name = 'profile_image';
      form.appendChild(fileInput);
      form.appendChild(document.createElement('br'));

      // Create the username heading
      const usernameHeading = document.createElement('h3');
      usernameHeading.textContent = 'Username';
      form.appendChild(usernameHeading);

      // Create the username input
      const usernameInput = document.createElement('input');
      usernameInput.type = 'text';
      usernameInput.name = 'username';
      usernameInput.placeholder = 'Username';
      usernameInput.required = true;
      usernameInput.value = userData.username;
      form.appendChild(usernameInput);
      form.appendChild(document.createElement('br'));

      // Append the form to the container
      container.appendChild(form);

      // Create the email heading
      const emailHeading = document.createElement('h3');
      emailHeading.textContent = 'Email';
      form.appendChild(emailHeading);

      // Create the email input
      const emailInput = document.createElement('input');
      emailInput.type = 'email';
      emailInput.name = 'email';
      emailInput.placeholder = 'Email address';
      emailInput.required = true;
      emailInput.autofocus = true;
      emailInput.value = userData.email;
      form.appendChild(emailInput);

      // Create the hide email checkbox
      const hideEmailLabel = document.createElement('label');
      const hideEmailCheckbox = document.createElement('input');
      hideEmailCheckbox.type = 'checkbox';
      hideEmailCheckbox.name = 'hide_email';
      hideEmailCheckbox.classList.add('checkbox');
      if (userData.hide_email) {
        hideEmailCheckbox.checked = true;
      }
      hideEmailLabel.appendChild(hideEmailCheckbox);
      hideEmailLabel.appendChild(document.createTextNode('Hide Email'));
      form.appendChild(hideEmailLabel);
      form.appendChild(document.createElement('br'));

      // Create the message paragraph
      const messageParagraph = document.createElement('p');
      const messageSpan = document.createElement('span');
      messageSpan.id = 'message';
      messageSpan.classList.add('message');
      messageParagraph.appendChild(messageSpan);
      form.appendChild(messageParagraph);

      // Create the submit button
      const submitButton = document.createElement('button');
      submitButton.type = 'submit';
      submitButton.textContent = 'Save';
      form.appendChild(submitButton);

      // Append the form to the container
      container.appendChild(form);

      return container;
    } catch (error) {
      console.log(error);
      return document.createElement('div'); // Return an empty div in case of error
    }
  } 

  async afterRender() {
    document.getElementById('editUserForm').addEventListener('submit', async(event) => {
      // Create form 
      const form = event.target;
      const formData = new FormData(form);
      // const data = {};
      // formData.forEach((value, key) => {
      //   data[key] = value;
      // });

      const content = {
        method: 'POST',
        headers: {
          // 'Accept': 'application/json',
          // 'Content-Type': 'application/json',
          'X-CSRFToken': this.getCookie('csrftoken')
        },
        // body: JSON.stringify(data)
        body: formData
      };

      try {
        const response = await fetch(`/user/${this.loginData.id}/edit/`, content);
        const result = await response.json();
        const messageDiv = document.getElementById('message');

        if (response.ok) {
          messageDiv.style.color = 'var(--success-color)';
          messageDiv.textContent = result.message;
          navigateTo(result.redirect);
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
  }
}
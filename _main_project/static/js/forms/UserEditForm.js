import AbstractModalView from "./AbstractModalView.js";

export default class extends AbstractModalView {
  constructor(modal) {
    super(modal);
    this.setTitle("User Edit Form");
    this.domElements = null;
  }

  async getHtml() {
    try {
      // const csrfToken = this.getCookie('csrftoken');
      // <input type="hidden" name="csrfmiddlewaretoken" value="${csrfToken}">
      const loginResponse = await fetch('/login_check/');
      const loginData = await loginResponse.json();
      const userResponse = await fetch(`http://localhost:8000/user/${loginData.id}/`);
      const userData = await userResponse.json();
      return `
        <img src="${userData.profile_image}" alt="user image" style="width: 100px; height: 100px;"><br>
        <form id="editUserForm" onsubmit="event.preventDefault();">
          <input type="file" name="profile_image"><br>
          <h6>Username</h6>
          <input type="text" name="username" placeholder="Username" required value="${userData.username}"><br>
          <h6>Email</h6>
          <input type="email" name="email" placeholder="Email address" required autofocus value="${userData.email}">
          <label>
            <input type="checkbox" name="hide_email" ${userData.hide_email ? 'checked' : ''}>Hide Email
          </label><br>
          <p><span id="message" style="color: red;"></span></p>
          <button type="submit">Save</button>
        </form>
      `;
    } catch (error) {
      console.log(error);
      return "";
    }
  }

  async init() {
    if (this.domElements === null)
      this.domElements = await this.createDomElements();
  }

  getDomElements() {
    return this.domElements;
  }

  async createDomElements() {
    try {
      const loginResponse = await fetch('/login_check/');
      const loginData = await loginResponse.json();
      const userResponse = await fetch(`http://localhost:8000/user/${loginData.id}/`);
      const userData = await userResponse.json();

      // Create the container
      const container = document.createElement('div');

      // Create the form
      const form = document.createElement('form');
      form.id = 'editUserForm';
      form.onsubmit = (event) => event.preventDefault();

      // Create the email heading
      const emailHeading = document.createElement('h6');
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
      messageSpan.style.color = 'red';
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
    const loginResponse = await fetch('/login_check/');
    const loginData = await loginResponse.json();

    document.getElementById('editUserForm').addEventListener('submit', async(event) => {
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
          'X-CSRFToken': this.getCookie('csrftoken')
        },
        body: JSON.stringify(data)
      };

      console.log(content);

      try {
        const response = await fetch(`/user/${loginData.id}/edit/`, content);
        const result = await response.json();
        const messageDiv = document.getElementById('message');

        if (response.ok) {
          messageDiv.style.color = 'green';
          messageDiv.textContent = result.message;
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
import AbstractModalView from "./AbstractModalView.js";

export default class extends AbstractModalView {
  constructor(modal) {
    super(modal);
    this.setTitle("ForgotPassword");
  }

  createDomElements(data=null) {
    // Create the container
    const container = document.createElement('div');

    // Create the title
    const title = document.createElement('h2');
    title.textContent = 'Forgot Password';
    title.classList.add('modal-title');

    // Create the form element
    const form = document.createElement('form');
    form.id = 'resetPassForm';
    form.onsubmit = (event) => event.preventDefault();

    // Create the email input
    const emailInput = document.createElement('input');
    emailInput.name = 'email';
    emailInput.placeholder = 'Email address';
    emailInput.type = 'email';
    emailInput.required = true;
    form.appendChild(emailInput);

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
    submitButton.textContent = 'Send reset email';
    form.appendChild(submitButton);

    container.appendChild(title);
    container.appendChild(form);

    return container;
  }

  async afterRender() {
    document.getElementById('resetPassForm').addEventListener('submit', async(event) => {
      // Create form 
      const form = event.target;
      const formData = new FormData(form);

      const content = {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'x-csrftoken': this.getCookie('csrftoken'),
		  'X-Requested-With': 'XMLHttpRequest'
        },
        body: formData
      };

      try {
        const response = await fetch(`/password/reset/`, content);
        const result = await response.json();
        const messageDiv = document.getElementById('message');

        if (response.ok) {
          messageDiv.style.color = 'var(--success-color)';
          messageDiv.textContent = result.message;
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
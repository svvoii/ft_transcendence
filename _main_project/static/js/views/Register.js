import AbstractView from "./AbstractView.js";
import RegisterForm from "./RegisterForm.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Register");
  }

  async getHtml() {
    return `
      <p>
        You are viewing the register page!
      </p>

      <button id="registerButton">Register</button>
    `;
  }

  async afterRender() {
    const registerButton = document.getElementById("registerButton");
    const modal = document.getElementById("formModal");
    
    registerButton.addEventListener('click', async () => {
      modal.style.display = "block";
      
      const registerForm = new RegisterForm();
      document.querySelector('#formModal').innerHTML = await registerForm.getHtml();
      registerForm.afterRender();
      
      // Define the behavior of the close button after it is in the DOM.
      const span = document.getElementsByClassName("close")[0];
      span.addEventListener('click', () => {
        modal.style.display = "none";
      });
    });
    
    
    window.onclick = event => {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    };
  }
}
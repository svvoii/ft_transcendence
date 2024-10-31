// import all forms
import UserForm from './UserForm.js';
import RegisterForm from './RegisterForm.js';
import LoginForm from './LoginForm.js';
import UserViewForm from './UserViewForm.js';
import UserEditForm from './UserEditForm.js';
import UserChangePassForm from './UserChangePassForm.js';

export class Modal {
  constructor(modalId, contentId) {
    this.modal = document.getElementById(modalId);
    this.form = document.getElementById(contentId);
    this.initEventListeners();

    // Create instances of all forms
    this.userForm = new UserForm(this);
    this.registerForm = new RegisterForm(this);
    this.loginForm = new LoginForm(this);
    this.userViewForm = new UserViewForm(this);
    this.userEditForm = new UserEditForm(this);
    this.userChangePassForm = new UserChangePassForm(this);

    // Create a map of all forms for selecting with showForm
    this.formMap = {
      'userForm': this.userForm,
      'registerForm': this.registerForm,
      'loginForm': this.loginForm,
      'userViewForm': this.userViewForm,
      'userEditForm': this.userEditForm,
      'userChangePassForm': this.userChangePassForm
    }
  }

  initEventListeners() {
    const span = this.modal.querySelector('.close');
    if (span) {
      span.addEventListener('click', () => {
        this.hide();
      });
    }

    window.onclick = event => {
      if (event.target === this.modal) {
        this.hide();
      }
    }
  }

  async show(contentForm) {
    this.form.innerHTML = await contentForm.getHtml();
    contentForm.afterRender();
    this.modal.style.display = "block";
  }

  hide() {
    this.modal.style.display = "none";
  }

  async showForm(formName) {
    const form = this.formMap[formName];
    if (form) {
      // console.log(`showing form: ${formName}`);
      this.show(form);
    } else {
      console.error(`form not found: ${formName}`);
    }
  }
}
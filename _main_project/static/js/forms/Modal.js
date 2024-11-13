// import all forms
import UserForm from './UserForm.js';
import RegisterForm from './RegisterForm.js';
import LoginForm from './LoginForm.js';
import UserViewForm from './UserViewForm.js';
import UserEditForm from './UserEditForm.js';
import UserChangePassForm from './UserChangePassForm.js';
import { loginCheck } from '../helpers/helpers.js';

export default class Modal {
  constructor(appId) {
    this.app = document.querySelector(`#${appId}`);
    // this.modal = document.getElementById(modalId);
    // this.form = document.getElementById(contentId);
    this.modal = document.createElement('div');
    this.modal.id = 'formModal';
    this.modal.classList.add('modal-forms');
    this.createModalElements();
    this.initEventListeners();
    this.form = this.modal.querySelector('#modalContent');

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

  createModalElements() {
    // Create the modal content box div
    const modalContentBox = document.createElement('div');
    modalContentBox.classList.add('modal-content-box');

    // Create the close span
    const closeSpan = document.createElement('span');
    closeSpan.classList.add('close');
    closeSpan.innerHTML = '&times;';

    // Create the back span
    const backSpan = document.createElement('span');
    backSpan.classList.add('back');
    backSpan.innerHTML = '&larrhk;';

    // Create the modal content div
    const modalContent = document.createElement('div');
    modalContent.id = 'modalContent';

    // Append the spans and modal content to the modal content box
    modalContentBox.appendChild(closeSpan);
    modalContentBox.appendChild(backSpan);
    modalContentBox.appendChild(modalContent);

    // Append the modal content box to the main container
    this.modal.appendChild(modalContentBox);
  }

  initEventListeners() {
    const closeSpan = this.modal.querySelector('.close');
    const backSpan = this.modal.querySelector('.back');

    if (closeSpan) {
      closeSpan.addEventListener('click', () => {
        this.hide();
      });
    }

    if (backSpan) {
      backSpan.addEventListener('click', async() => {
        // find a way do check without calling loginCheck?
        if (await loginCheck()) {
          this.showForm('userForm');
        } else {
          this.hide();
        }
      });
    }

    window.onclick = event => {
      if (event.target === this.modal) {
        this.hide();
      }
    }
  }

  async show(contentForm) {
    this.form.innerHTML = '';
    this.form.appendChild(await contentForm.createDomElements());
    contentForm.afterRender();
    this.modal.style.display = "block";
  }

  async showForm(formName) {
    const form = this.formMap[formName];

    if (form) {
      console.log(`showing form: ${formName}`);
      this.show(form);
    } else {
      console.error(`form not found: ${formName}`);
    }
  }

  hide() {
    this.modal.style.display = "none";
  }

  full_render() {
    this.app.appendChild(this.modal);
  }
}
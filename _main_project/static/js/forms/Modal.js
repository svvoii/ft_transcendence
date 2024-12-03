// import all forms
import UserForm from './UserForm.js';
import RegisterForm from './RegisterForm.js';
import LoginForm from './LoginForm.js';
import UserViewForm from './UserViewForm.js';
import UserEditForm from './UserEditForm.js';
import UserChangePassForm from './UserChangePassForm.js';
import ForgotPassForm from './ForgotPassForm.js';
import UserSearchForm from './UserSearchForm.js';
import MessagesForm from './MessagesForm.js';
import FriendsListForm from './FriendsListForm.js';

export default class Modal {
  constructor(appId) {
    this.app = document.querySelector(`#${appId}`);

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
    this.forgotPassForm = new ForgotPassForm(this);
    this.userSearchForm = new UserSearchForm(this);
    this.messagesForm = new MessagesForm(this);
    this.friendsListForm = new FriendsListForm(this);

    // Most recent
    this.mostRecent = null;
    this.historyStack = [];

    // Create a map of all forms for selecting with showForm
    this.formMap = {
      'userForm': this.userForm,
      'registerForm': this.registerForm,
      'loginForm': this.loginForm,
      'userViewForm': this.userViewForm,
      'userEditForm': this.userEditForm,
      'userChangePassForm': this.userChangePassForm,
      'userSearchForm': this.userSearchForm,
      'forgotPassForm': this.forgotPassForm,
      'messagesForm': this.messagesForm,
      'friendsListForm': this.friendsListForm,
    }
  }

  createModalElements(data=null) {
    // Create the modal content box div
    const modalContentBox = document.createElement('div');
    modalContentBox.classList.add('modal-content-box');

    // Create the close span
    const closeSpan = document.createElement('span');
    closeSpan.classList.add('close');
    closeSpan.innerHTML = '&times;';
    closeSpan.title = "Close";

    // Create the back span
    const backSpan = document.createElement('span');
    backSpan.classList.add('back');
    backSpan.innerHTML = '&larrhk;';
    backSpan.title = "Back";

    // Create the refresh span
    const refreshSpan = document.createElement('span');
    refreshSpan.classList.add('refresh');
    refreshSpan.innerHTML = '&orarr;';
    refreshSpan.title = "Refresh";

    // Create the modal content div
    const modalContent = document.createElement('div');
    modalContent.id = 'modalContent';

    // Append the spans and modal content to the modal content box
    modalContentBox.appendChild(closeSpan);
    modalContentBox.appendChild(backSpan);
    modalContentBox.appendChild(refreshSpan);
    modalContentBox.appendChild(modalContent);

    // Append the modal content box to the main container
    this.modal.appendChild(modalContentBox);
  }

  initEventListeners() {
    const closeSpan = this.modal.querySelector('.close');
    const backSpan = this.modal.querySelector('.back');
    const refreshSpan = this.modal.querySelector('.refresh');

    closeSpan.addEventListener('click', () => {
      this.hide();
    });

    backSpan.addEventListener('click', async() => {
      this.historyStack.pop();
      const prevForm = this.historyStack.pop();

      if (prevForm) {
        await this.showForm(prevForm.formName, prevForm.data);
      } else {
        this.hide();
      }
    });

    refreshSpan.addEventListener('click', async() => {
      console.log("refreshSpan clicked");
    });

    window.onclick = event => {
      if (event.target === this.modal) {
        this.hide();
      }
    }
  }

  async show(contentForm, data=null) {
    this.form.innerHTML = '';
    this.form.appendChild(await contentForm.createDomElements(data));
    contentForm.afterRender();
    this.modal.style.display = "block";
  }

  async showForm(formName, data=null) {
    const form = this.formMap[formName];

    if (form) {
      this.historyStack.push( { formName, data } );
      this.show(form, data);
    } else {
      console.error(`form not found: ${formName}`);
    }
  }

  hide() {
    this.historyStack = [];
    this.modal.style.display = "none";
  }

  full_render() {
    this.app.appendChild(this.modal);
  }
}
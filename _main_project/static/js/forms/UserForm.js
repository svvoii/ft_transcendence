import AbstractModalView from "./AbstractModalView.js";

export default class extends AbstractModalView {
  constructor(modal) {
    super(modal);
    this.setTitle("User Form");
  }

  createDomElements() {
    // Create the container
    const container = document.createElement('div');

    // Create the title
    const title = document.createElement('h2');
    title.textContent = 'User Settings';
    title.classList.add('modal-title');
    container.appendChild(title);

    // Create the unordered list
    const ul = document.createElement('ul');

    // Create the view profile button
    const viewProfileButton = document.createElement('button');
    viewProfileButton.id = 'userBtnView';
    viewProfileButton.classList.add('select-button');
    viewProfileButton.textContent = 'View Profile';
    ul.appendChild(viewProfileButton);
    // ul.appendChild(document.createElement('br'));

    // Create the edit profile button
    const editProfileButton = document.createElement('button');
    editProfileButton.id = 'userBtnEdit';
    editProfileButton.classList.add('select-button');
    editProfileButton.textContent = 'Edit Profile';
    ul.appendChild(editProfileButton);
    // ul.appendChild(document.createElement('br'));

    // Create the change password button
    const changePasswordButton = document.createElement('button');
    changePasswordButton.id = 'userBtnChangePass';
    changePasswordButton.classList.add('select-button');
    changePasswordButton.textContent = 'Change Password';
    ul.appendChild(changePasswordButton);

    // Append the unordered list to the container
    container.appendChild(ul);

    return container;
  }

  async afterRender() {
    document.getElementById('userBtnView').addEventListener('click', async() => {
      this.modal.showForm('userViewForm');
    });

    document.getElementById('userBtnEdit').addEventListener('click', async() => {
      this.modal.showForm('userEditForm');
    });

    document.getElementById('userBtnChangePass').addEventListener('click', async() => {
      this.modal.showForm('userChangePassForm');
    });
  }
}
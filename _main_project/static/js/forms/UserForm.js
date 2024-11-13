import AbstractModalView from "./AbstractModalView.js";

export default class extends AbstractModalView {
  constructor(modal) {
    super(modal);
    this.setTitle("User Form");
  }

  async getHtml() {
    return `
      <p>User Settings</p>
      <ul>
        <button id="userBtnView">View Profile</button><br>
        <button id="userBtnEdit">Edit Profile</button><br>
        <button id="userBtnChangePass">Change Password</button>
      </ul>
    `;
  }

  createDomElements() {
    // Create the container
    const container = document.createElement('div');

    // Create the paragraph
    const paragraph = document.createElement('p');
    paragraph.textContent = 'User Settings';
    container.appendChild(paragraph);

    // Create the unordered list
    const ul = document.createElement('ul');

    // Create the view profile button
    const viewProfileButton = document.createElement('button');
    viewProfileButton.id = 'userBtnView';
    viewProfileButton.textContent = 'View Profile';
    ul.appendChild(viewProfileButton);
    ul.appendChild(document.createElement('br'));

    // Create the edit profile button
    const editProfileButton = document.createElement('button');
    editProfileButton.id = 'userBtnEdit';
    editProfileButton.textContent = 'Edit Profile';
    ul.appendChild(editProfileButton);
    ul.appendChild(document.createElement('br'));

    // Create the change password button
    const changePasswordButton = document.createElement('button');
    changePasswordButton.id = 'userBtnChangePass';
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
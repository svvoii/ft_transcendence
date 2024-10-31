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
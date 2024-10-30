import AbstractView from "../views/AbstractView.js";
import UserViewForm from "./UserViewForm.js";
import UserEditForm from "./UserEditForm.js";
import UserChangePassForm from "./UserChangePassForm.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
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
    const userViewForm = new UserViewForm();
    const userEditForm = new UserEditForm();
    const userChangePassForm = new UserChangePassForm();

    document.getElementById('userBtnView').addEventListener('click', async() => {
      document.getElementById('modalContent').innerHTML = await userViewForm.getHtml();
      userViewForm.afterRender();
    });

    document.getElementById('userBtnEdit').addEventListener('click', async() => {
      document.getElementById('modalContent').innerHTML = await userEditForm.getHtml();
      userEditForm.afterRender();
    });

    document.getElementById('userBtnChangePass').addEventListener('click', async() => {
      document.getElementById('modalContent').innerHTML = await userChangePassForm.getHtml();
      userChangePassForm.afterRender();
    });
  }
}
import AbstractView from "../views/AbstractView.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("User Form");
  }

  async getHtml() {
    return `
      <p>User Settings</p>
      <ul>
        <a href=".">View Profile</a><br>
        <a href=".">Edit Profile</a><br>
        <a href=".">Change Password</a>
      </ul>
    `;
  }
}
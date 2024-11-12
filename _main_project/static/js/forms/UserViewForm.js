import AbstractModalView from "./AbstractModalView.js";

export default class extends AbstractModalView {
  constructor(modal) {
    super(modal);
    this.setTitle("View User Form");
  }

  async getHtml() {
    try {
      const loginResponse = await fetch('/login_check/');
      const loginData = await loginResponse.json();
      const userResponse = await fetch(`http://localhost:8000/user/${loginData.id}/`);
      const userData = await userResponse.json();
      return `
        <img src="${userData.profile_image}" alt="user image" style="width: 100px; height: 100px;">
        <h3>Username: ${userData.username}</h3>
        <p>Email: ${userData.email}</p>
      `;
    } catch (error) {
      console.log(error);
      return "";
    }
  }
}
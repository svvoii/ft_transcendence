import AbstractModalView from "./AbstractModalView.js";

export default class extends AbstractModalView {
  constructor(modal) {
    super(modal);
    this.setTitle("User Edit Form");
  }

  async getHtml() {
    try {
      const csrfToken = this.getCookie('csrftoken');
      const loginResponse = await fetch('/login_check/');
      const loginData = await loginResponse.json();
      const userResponse = await fetch(`http://localhost:8000/user/${loginData.id}/`);
      const userData = await userResponse.json();
      return `
        <img src="${userData.profile_image}" alt="user image" style="width: 100px; height: 100px;"><br>
        <form id="editUserForm" onsubmit="event.preventDefault();">
          <input type="hidden" name="csrfmiddlewaretoken" value="${csrfToken}">
          <input type="file" name="profile_image"><br>
          <h6>Username</h6>
          <input type="text" name="username" placeholder="Username" required value="${userData.username}"><br>
          <h6>Email</h6>
          <input type="email" name="email" placeholder="Email address" required autofocus value="${userData.email}">
          <label>
            <input type="checkbox" name="hide_email" ${userData.hide_email ? 'checked' : ''}>Hide Email
          </label><br>
          <p><span id="message" style="color: red;"></span></p>
          <button type="submit">Save</button>
        </form>
      `;
    } catch (error) {
      console.log(error);
      return "";
    }
  }
}
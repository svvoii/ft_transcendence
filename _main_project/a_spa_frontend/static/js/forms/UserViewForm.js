import AbstractView from "../views/AbstractView.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("View User Form");
  }

  async getHtml() {
    try {
      const response = await fetch("http://localhost:8000/user/2/");
      const data = await response.json();
      // console.log(data);
      return `
        <img src="${data.profile_image}" alt="user image" style="width: 100px; height: 100px;">
        <h3>Username: ${data.username}</h3>
        <p>Email: ${data.email}</p>

      `;
    } catch (error) {
      console.error(error);
    }
  }
}
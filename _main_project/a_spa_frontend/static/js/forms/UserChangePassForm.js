import AbstractView from "../views/AbstractView.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("User Change Password Form");
  }

  async getHtml() {
    return `
      <p>
        Viewing Change User Pass Screen!
      </p>
    `;
  }
}
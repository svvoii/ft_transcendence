import AbstractView from "../views/AbstractView.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("User Edit Form");
  }

  async getHtml() {
    return `
      <p>
        Viewing Edit User Profile Screen!
      </p>
    `;
  }
}
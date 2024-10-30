import AbstractView from "../views/AbstractView.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("User Form");
  }

  async getHtml() {
    return `
      <p>This is the user settings!</p>
    `;
  }
}
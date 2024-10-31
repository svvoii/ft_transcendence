import AbstractModalView from "./AbstractModalView.js";

export default class extends AbstractModalView {
  constructor(modal) {
    super(modal);
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
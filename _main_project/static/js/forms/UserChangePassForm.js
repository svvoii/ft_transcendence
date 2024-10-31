import AbstractModalView from "./AbstractModalView.js";

export default class extends AbstractModalView {
  constructor(modal) {
    super(modal);
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
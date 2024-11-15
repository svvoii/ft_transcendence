import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Settings");
    this.name = "Settings";
  }

  async getHtml() {
    return `
      <p>
        You are viewing the settings!
      </p>
    `;
  }
}
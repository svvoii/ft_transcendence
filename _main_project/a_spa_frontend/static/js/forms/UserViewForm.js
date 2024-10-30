import AbstractView from "../views/AbstractView.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("View User Form");
  }

  async getHtml() {
    return `
      <p>
        Viewing User Profile!
      </p>
    `;
  }
}
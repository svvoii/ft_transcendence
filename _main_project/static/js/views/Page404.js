import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Page Not Found");
    this.name = "Page404";
  }

  async getHtml() {
    return `
      <p>
        404<br>
        The page you are looking for was not found!<br>
        Git outta here!
      </p>
    `;
  }
}
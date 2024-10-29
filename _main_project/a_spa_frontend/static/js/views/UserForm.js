import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("User Form");
  }

  async getHtml() {
    return `
     <div class="modal-content">
        <span class="close">&times;</span>
        <p>This is the user settings!</p>
      </div>
    `;
  }
}
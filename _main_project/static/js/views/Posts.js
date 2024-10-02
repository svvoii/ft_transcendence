import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Posts");
  }

  async getHtml() {
    return `
      <p>
        You are viewing the posts!
      </p>
      <p>
        <a href="/posts/1" data-link>View Post 1</a>.
      </p>
      <p>
        <a href="/posts/2" data-link>View Post 2</a>.
      </p>
      <p>
        <a href="/posts/3" data-link>View Post 3</a>.
      </p>
    `;
  }
}
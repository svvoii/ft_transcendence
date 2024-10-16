import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("API Testing");
  }

  async getHtml() {
    return `
      <p>API Testing Page!</p>

      <button id="test-http">Test HTTP</button>
      <pre class="responseBox" id="response-html"></pre>

      <button id="test-json">Test JSON</button>
      <pre class="responseBox" id="response-json"></pre>
    `;
  }

  async afterRender() {
    const testHttp = document.getElementById("test-http");
    const testJson = document.getElementById("test-json");

    testHttp.addEventListener('click', async () => {
      const response = await fetch('http://localhost:8000/api/api_http_test_func');
      const text = await response.text();

      const responseContainer = document.getElementById("response-html");
      responseContainer.innerHTML = text;
    });

    testJson.addEventListener('click', async () => {
      const response = await fetch('http://localhost:8000/api/api_json_test_func');
      const data = await response.json();

      const responseContainer = document.getElementById("response-json");
      responseContainer.innerHTML = JSON.stringify(data, null, 2);
    });
  }
}
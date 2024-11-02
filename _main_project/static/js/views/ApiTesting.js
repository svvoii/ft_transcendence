import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("API Testing");
  }

  async getHtml() {
    return `
      <p>API Testing Page!</p>

      <button id="testHttp">Test HTTP</button>
      <pre class="response-box" id="responseHtml"></pre>

      <button id="testJson">Test JSON</button>
      <pre class="response-box" id="responseJson"></pre>
    `;
  }

  async afterRender() {
    const testHttp = document.getElementById("testHttp");
    const testJson = document.getElementById("testJson");

    testHttp.addEventListener('click', async () => {
      const response = await fetch('http://localhost:8000/api/api_http_test_func/');
      // const response = await fetch('http://localhost:8000/register/');
      const text = await response.text();

      const responseContainer = document.getElementById("responseHtml");
      responseContainer.innerHTML = text;
    });

    testJson.addEventListener('click', async () => {
      const response = await fetch('http://localhost:8000/api/api_json_test_func/');
      const data = await response.json();

      const responseContainer = document.getElementById("responseJson");
      responseContainer.innerHTML = JSON.stringify(data, null, 2);
    });
  }
}
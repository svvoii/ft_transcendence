import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("New Post");
  }

  async getHtml() {
    let content = `
      <h3>Create a new post</h3>
      <label>Title: </label><br>
      <input type="text" id="userTitle" name="title"><br>
      <label>Content: </label><br>
      <textarea type="text" id="userContent" name="content"></textarea><br><br>
      <button id="submitPost">Submit</button>
    `;

    return content;
  }

  async afterRender() {
    let userTitle;
    let userContent;

    document.getElementById("submitPost").onclick = function() {
      userTitle = document.getElementById("userTitle").value;
      userContent = document.getElementById("userContent").value;

      // Send a POST request to the backend to save in the database
      fetch("http://localhost:8000/api/blogposts/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: userTitle,
          content: userContent
        })
      })
    };
  }
}
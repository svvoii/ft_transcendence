import AbstractView from "./AbstractView.js";
import { navigateTo } from "../index.js";

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

    document.getElementById("submitPost").onclick = async () => {
      userTitle = document.getElementById("userTitle").value;
      userContent = document.getElementById("userContent").value;

      // Send a POST request to the backend to save in the database
      const response = await fetch("http://localhost:8000/api/blogposts/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": this.getCookie("csrftoken")
        },
        body: JSON.stringify({
          title: userTitle,
          content: userContent
        })
      });

      if (response.ok) {
        navigateTo("/posts/");
      } else {
        alert("There was an error with your submission. Please try again.");
      }

    };
  }
}
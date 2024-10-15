import AbstractView from "./AbstractView.js";
import { navigateTo } from "../index.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Posts");
  }

  async getHtml() {

    const response = await fetch('http://localhost:5000/api/blogposts');
    const data = await response.json();

    let content = `
      <p>Posts</p> 
      <button id="createPost">New Post</button>
      <ul>
    `;

    data.forEach(item => {  
      content += `
        <p><a href="/posts/${item.id}" data-link>${item.title}</a></p>
      `;
    });

    content += `</ul>`;

    return content;
  }

  async afterRender() {
    const createPost = document.getElementById("createPost");

    createPost.addEventListener('click', () => {
      navigateTo('http://localhost:5000/posts/new_post');
      // console.log('create post');
    });
  }
}

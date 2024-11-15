import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Page Not Found");
    this.name = "Page404";
  }

  getDomElements() {
      // Create a container div
      const container = document.createElement('div');

      // Create the paragraph element
      const title = document.createElement('h1');
      title.textContent = '404';

      const paragraph = document.createElement('p');
      // Create the text nodes and line breaks
      const br1 = document.createElement('br');
      const text2 = document.createTextNode('The page you are looking for was not found!');
      const br2 = document.createElement('br');
      const text3 = document.createTextNode('Git outta here!');

      // Append the text nodes and line breaks to the paragraph
      paragraph.appendChild(br1);
      paragraph.appendChild(text2);
      paragraph.appendChild(br2);
      paragraph.appendChild(text3);

      // Append the paragraph to the container
      container.appendChild(title);
      container.appendChild(paragraph);

      return container;
  }
}
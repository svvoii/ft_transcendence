// An Abstract class for all views
export default class {
  constructor(params) {
    this.params = params;

    // console.log(params);
  }

  // Updated the title of the document when a new view is rendered
  setTitle(title) {
    document.title = title;
  }

  // Just returns some html, but this is an abstract class so it does nothing.
  async getHtml() {
    return "";
  }

}
import AbstractModalView from "./AbstractModalView.js";

export default class extends AbstractModalView {
  constructor(modal) {
    super(modal);
    this.setTitle("Search User Form");
    this.loginData = null;
  }

  // async createDomElements() {
  //   const container = document.createElement('div');

  //   const title = document.createElement('h2');
  //   title.textContent = 'Search User';
  //   title.classList.add('modal-title');
  //   container.appendChild(title);

  //   return container;
  // }
  async createDomElements() {
    const container = document.createElement('div');

    const title = document.createElement('h2');
    title.textContent = 'Search User';
    title.classList.add('modal-title');
    container.appendChild(title);

    // Create the search form
    const form = document.createElement('form');
    form.classList.add('search-form');

    // Create the search input
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Enter username...';
    searchInput.classList.add('search-input');
    form.appendChild(searchInput);

    // Create the search button
    const searchButton = document.createElement('button');
    searchButton.type = 'submit';
    searchButton.textContent = 'Search';
    searchButton.classList.add('search-button');
    form.appendChild(searchButton);

    // Append the form to the container
    container.appendChild(form);

    // Add event listener for form submission
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const query = searchInput.value;
      this.handleSearch(query);
    });

    return container;
  }

  async handleSearch(query) {
    console.log(`Searching for user: ${query}`);

    const response = fetch(`/search/?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 'X-CSRFToken': this.getCookie('csrftoken')
      },
      // body: JSON.stringify({query: query}),
    });

    if (response.ok) {
      const data = await response.json();
      this.displaySearchResults(data);
    } else {
      console.error('Search request failed');
    }
  }
}
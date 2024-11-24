import AbstractModalView from "./AbstractModalView.js";

export default class extends AbstractModalView {
  constructor(modal) {
    super(modal);
    this.setTitle("Search User Form");
    this.loginData = null;
  }

  async createDomElements(data=null) {
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

    // Add a container for the search results
    const searchResultsContainer = document.createElement('div');
    searchResultsContainer.classList.add('search-results-container');
    container.appendChild(searchResultsContainer);

    // Add event listener for form submission
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const query = searchInput.value;
      this.handleSearch(query);
    });

    return container;
  }

  async handleSearch(query) {
    // console.log(`Searching for user: ${query}`);

    if (!query) {
      // Return early if the query is empty
      return ;
    }

    const response = await fetch(`/search/?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      this.displaySearchResults(data);
    } else {
      console.error('Search request failed');
    }
  }

  displaySearchResults(data) {
    // console.log(data);
    const results = document.createElement('div');
    results.classList.add('search-results');

    const accounts = data.accounts || [];

    if (accounts.length === 0) {
      results.textContent = 'No results found';
    } else {
      accounts.forEach(([account, isFriend]) => {
        const resultElement = document.createElement('div');
        resultElement.classList.add('search-result');

        const profImgElement = document.createElement('img');
        profImgElement.classList.add('profile-image-search');
        profImgElement.src = account.profile_image;
        resultElement.appendChild(profImgElement);

        const usernameElement = document.createElement('span');
        usernameElement.classList.add('username-search');
        usernameElement.textContent = account.username;
        resultElement.appendChild(usernameElement);

        resultElement.addEventListener('click', async () => {
          this.modal.showForm('userViewForm', account);
        });

        // if (isFriend) {
        //   const friendBadge = document.createElement('span');
        //   friendBadge.textContent = ' (Friend)';
        //   friendBadge.classList.add('friend-badge');
        //   resultElement.appendChild(friendBadge);
        // }

        results.appendChild(resultElement);
      });
    }

    const container = document.querySelector('.search-results-container');
    container.innerHTML = '';
    container.appendChild(results);
  }
}
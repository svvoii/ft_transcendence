import AbstractModalView from "./AbstractModalView.js";
import { user } from "../index.js";

export default class extends AbstractModalView {
  constructor(modal) {
    super(modal);
    this.setTitle("User Form");
  }

  async createDomElements(data=null) {
    // Create the container
    const container = document.createElement('div');

    const title = document.createElement('h2');
    title.textContent = 'Friends List';
    title.classList.add('modal-title');
    container.appendChild(title);

    const response = await fetch(`/user/${user.getUserId()}/`);

    const userData = await response.json();

    // console.log(userData.friends);

    const friendsList = document.createElement('ul');
    friendsList.classList.add('search-results');

    if (userData.friends.length === 0) {
      const noFriends = document.createElement('p');
      noFriends.textContent = 'You have no friends, loser';
      container.appendChild(noFriends);
      
      const loserGifContainer = document.createElement('div');
      loserGifContainer.classList.add('loser-gif-container');
      const loserGif = document.createElement('div');
      loserGif.classList.add('loser-gif');
      loserGifContainer.appendChild(loserGif);
      container.appendChild(loserGifContainer);
    } else {
      for (const friend of userData.friends) {
        const friendItem = document.createElement('div');
        friendItem.classList.add('search-result');

        const profImgElement = document.createElement('img');
        profImgElement.classList.add('profile-image-search');
        profImgElement.src = friend.profile_image;
        friendItem.appendChild(profImgElement);

        const usernameElement = document.createElement('span');
        usernameElement.classList.add('username-search');
        usernameElement.textContent = friend.username;
        friendItem.appendChild(usernameElement);

        friendItem.addEventListener('click', async () => {
          this.modal.showForm('userViewForm', friend);
        });
        friendsList.appendChild(friendItem);
      }
      container.appendChild(friendsList);
    }

    return container;
  }
}
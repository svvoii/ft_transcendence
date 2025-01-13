import AbstractModalView from "./AbstractModalView.js";
import { user } from "../index.js";
import { getUserMatchHistory } from "../user/UserAPI.js";

export default class extends AbstractModalView {
  constructor(modal) {
    super(modal);
    this.setTitle("Match History Form");
  }

  async createDomElements(data=null) {
    // Create the container
    const container = document.createElement('div');

    const title = document.createElement('h2');
    title.textContent = 'Match History';
    title.classList.add('modal-title');
    container.appendChild(title);

    const matchData = await getUserMatchHistory(data);
    console.log(matchData);

    if (matchData.match_history.length === 0) {
      const noMatches = document.createElement('p');
      noMatches.textContent = 'No matches to show';
      container.appendChild(noMatches);
    } else {
      console.log('There are matches to show');
      for (const match of matchData.match_history) {
        if (match.winner !== null) {
          console.log("found a match: ", match);

          const matchItem = document.createElement('div');
          matchItem.classList.add('match-result');

          for (let i = 0; i < 112; i++) {
            const matchGameID = document.createElement('span');
            matchGameID.classList.add('match-game-id');
            matchGameID.textContent = `Game ID: ${match.game_id}`;
            matchItem.appendChild(matchGameID);
          }

          container.appendChild(matchItem);
        }


      //   const usernameElement = document.createElement('span');
      //   usernameElement.classList.add('username-search');
      //   usernameElement.textContent = friend.username;
      //   friendItem.appendChild(usernameElement);

      //   friendItem.addEventListener('click', async () => {
      //     this.modal.showForm('userViewForm', friend);
      //   });
      //   friendsList.appendChild(friendItem);
      }
    }

    return container;

    // const friendsList = document.createElement('ul');
    // friendsList.classList.add('search-results');

    // if (userData.friends.length === 0) {
    //   console.log('no matches to show');
    // } else {
    //   for (const friend of userData.friends) {
    //     const friendItem = document.createElement('div');
    //     friendItem.classList.add('search-result');

    //     const profImgElement = document.createElement('img');
    //     profImgElement.classList.add('profile-image-search');
    //     profImgElement.src = friend.profile_image;
    //     friendItem.appendChild(profImgElement);

    //     const usernameElement = document.createElement('span');
    //     usernameElement.classList.add('username-search');
    //     usernameElement.textContent = friend.username;
    //     friendItem.appendChild(usernameElement);

    //     friendItem.addEventListener('click', async () => {
    //       this.modal.showForm('userViewForm', friend);
    //     });
    //     friendsList.appendChild(friendItem);
    //   }
    //   container.appendChild(friendsList);
    // }

    // return container;
  }
}
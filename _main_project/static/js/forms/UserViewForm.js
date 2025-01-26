import AbstractModalView from "./AbstractModalView.js";
import { user, chat } from "../index.js";
import { getUserGameStats, getUserMatchHistory } from "../user/UserAPI.js";

export default class extends AbstractModalView {
  constructor(modal) {
    super(modal);
    this.setTitle("View User Form");
    this.loginData = null;
  }

  async createDomElements(data=null) {
    try {
      if (user.getLoginStatus() === false) {
        return ;
      }
      let userResponse = null;
      if (data) {
        userResponse = await fetch(`/user/${data.id}/`, {
			headers: {
				'X-Requested-With': 'XMLHttpRequest'
			}
		});
      } else {
        userResponse = await fetch(`/user/${user.getUserId()}/`, {
			headers: {
				'X-Requested-With': 'XMLHttpRequest'
			}
		});
      }
      const userData = await userResponse.json();

      // Create the container
      const container = document.createElement('div');
      container.classList.add('user-view-container');

      const leftContainer = document.createElement('div');
      leftContainer.classList.add('user-view-left');

      const rightContainer = document.createElement('div');
      rightContainer.classList.add('user-view-right');

      ///// leftContainer /////

      // Create the title
      const title = document.createElement('h2');
      title.textContent = 'View User Profile';
      title.classList.add('modal-title');
      leftContainer.appendChild(title);

      // Create the image element
      const img = document.createElement('img');
      img.src = userData.profile_image;
      img.alt = 'user image';
      img.classList.add('user-image');
      leftContainer.appendChild(img);

      // Create the username heading
      const usernameDiv = document.createElement('div');
      usernameDiv.classList.add('username-div');
      const usernameHeading = document.createElement('h3');
      usernameHeading.textContent = `Username: ${userData.username}`;
      usernameDiv.appendChild(usernameHeading);
      if (!userData.is_self && userData.is_friend) {
        const friendBadge = document.createElement('span');
        friendBadge.textContent = ' (Friend)';
        friendBadge.classList.add('friend-badge');
        usernameDiv.appendChild(friendBadge);
      }
      if (userData.online === true) {
        const onlineBadge = document.createElement('span');
        onlineBadge.textContent = ' (Online)';
        onlineBadge.classList.add('friend-badge');
        usernameDiv.appendChild(onlineBadge);
      }
      leftContainer.appendChild(usernameDiv);

      // Create the email paragraph
      if (userData.hide_email === false) {
        const emailParagraph = document.createElement('p');
        emailParagraph.textContent = `Email: ${userData.email}`;
        leftContainer.appendChild(emailParagraph);
      }

      // Checks if the user is viewing their own profile and renders appropriate buttons
      if (userData.is_self) {
        // Generate and render the list of friend requests
        this.friendsListButton(leftContainer);
        this.getFriendRequests(leftContainer, userData);
        this.matchHistoryButton(leftContainer, userData);
      } else {
        // Create the send a message button
        this.sendAMessageButton(leftContainer, userData);
        // Create the add friend button
        const friendButtonDiv = document.createElement('div');
        friendButtonDiv.id = 'friend-button-div';
        // request_sent value meanings
        // NO_REQUEST_SENT = 0
        // SENT_BY_YOU = 1
        // THEY_SENT_TO_YOU = 2
        if (userData.is_friend === false && userData.request_sent === 0) {
          this.addFriendButton(friendButtonDiv, userData);
        } else if (userData.is_friend === false && userData.request_sent === 1) {
          this.cancelRequestButton(friendButtonDiv, userData);
        } else if (userData.is_friend === false && userData.request_sent === 2) {
          this.acceptDenyFriendRequestButtonContainer(friendButtonDiv, userData);
        } else if (userData.is_friend === true) {
          this.unfriendButton(friendButtonDiv, userData);
        }
        leftContainer.appendChild(friendButtonDiv);
        // Create the block or unblock button
        this.blockUnblockButtons(leftContainer, userData);
        this.matchHistoryButton(leftContainer, userData);
      }

      ///// rightContainer /////

      const userStats = await getUserGameStats(userData.username);
      // console.log(userStats);

      const userStatsTitle = document.createElement('h3');
      userStatsTitle.textContent =`${userStats.stats_str}` ;
      userStatsTitle.style.color = 'var(--primary-color)';
      rightContainer.appendChild(userStatsTitle);

      const statsList = document.createElement('ul');
      statsList.classList.add('user-stats-list');

      const statTGP = document.createElement('li');
      statTGP.textContent = `${userStats.total_games_played} games played`;
      statsList.appendChild(statTGP);

      const statTW = document.createElement('li');
      statTW.textContent = `${userStats.total_wins} wins`;
      statsList.appendChild(statTW);

      const statTL = document.createElement('li');
      statTL.textContent = `${userStats.total_losses} losses`;
      statsList.appendChild(statTL);

      rightContainer.appendChild(statsList);

      ///// Append the containers to the main container /////

      container.appendChild(leftContainer);
      container.appendChild(rightContainer);

      return container;

    } catch (error) {
      console.log(error);
      return document.createElement('div'); // Return an empty div in case of error
    }
  }

  // container is the div that this function will append the created elements into
  async friendsListButton(container) {
    // Create the friends list button
    const friendsListBtn = document.createElement('button');
    friendsListBtn.id = 'friendsListBtn';
    friendsListBtn.classList.add('select-button');
    friendsListBtn.textContent = 'Friends List';
    friendsListBtn.addEventListener('click', async() => {
      this.modal.showForm('friendsListForm');
    });
    container.appendChild(friendsListBtn);
  }

  async matchHistoryButton(container, userData) {
    const matchHistoryButton = document.createElement('button');
    matchHistoryButton.id = 'matchHistoryButton';
    matchHistoryButton.classList.add('select-button');
    matchHistoryButton.textContent = 'Match History';
    matchHistoryButton.addEventListener('click', async() => {
      this.modal.showForm('matchHistoryForm', userData.username);
    });
    container.appendChild(matchHistoryButton);
  }

  async getFriendRequests(container, userData) {
    // Create a list like the search list for displaying friend requests
    // might also consider moving userData.is_self to a function
    // and moving !userData.is_self to a different function to make it more readable
    const friend_requests = userData.friend_request;

    if (friend_requests.length > 0) {
      const friendRequestsHeading = document.createElement('h2');
      friendRequestsHeading.textContent = 'Friend Requests';

      for (const request of friend_requests) {
        const response = await fetch(`/user/${request.sender}/`, {
			headers: {
				'X-Requested-With': 'XMLHttpRequest'
			}
		});

        const senderAccount = await response.json();

        // console.log(senderAccount);

        const requestElement = document.createElement('div');
        requestElement.classList.add('search-result');

        const profImgElement = document.createElement('img');
        profImgElement.classList.add('profile-image-search');
        profImgElement.src = senderAccount.profile_image;
        requestElement.appendChild(profImgElement);

        const usernameElement = document.createElement('span');
        usernameElement.classList.add('username-search');
        usernameElement.textContent = senderAccount.username;
        requestElement.appendChild(usernameElement);

        this.acceptDenyFriendRequestButtons(requestElement, request.id);

        friendRequestsHeading.appendChild(requestElement);
      }
      container.appendChild(friendRequestsHeading);
    }
  }

  async acceptDenyFriendRequestButtons(container, id, redirect_after_event=null) {
    const acceptButton = document.createElement('button');
    acceptButton.textContent = 'Accept';
    acceptButton.classList.add('accept-button');
    acceptButton.addEventListener('click', async() => {
      const formData = new FormData();
      formData.append('friend_request_id', id);

      const response = await fetch(`/friends/accept-friend-request/`, {
        method: 'POST',
        headers: {
          'x-csrftoken': this.getCookie('csrftoken'),
		  'X-Requested-With': 'XMLHttpRequest'
        },
        body: formData
      });
      if (response.status === 200) {
        // on success, this call forces a refresh of the user view form which will update the event listener
        this.modal.showForm('userViewForm', redirect_after_event);
      }
    });
    container.appendChild(acceptButton);

    const rejectButton = document.createElement('button');
    rejectButton.textContent = 'Reject';
    rejectButton.classList.add('reject-button');
    rejectButton.addEventListener('click', async() => {
      console.log('Reject button clicked');
      const formData = new FormData();
      formData.append('friend_request_id', id);

      const response = await fetch(`/friends/decline-friend-request/`, {
        method: 'POST',
        headers: {
          'x-csrftoken': this.getCookie('csrftoken'),
		  'X-Requested-With': 'XMLHttpRequest'
        },
        body: formData
      });
      if (response.status === 200) {
        // on success, this call forces a refresh of the user view form which will update the event listener
        this.modal.showForm('userViewForm', redirect_after_event);
      }
    });
    container.appendChild(rejectButton);
  }

  async sendAMessageButton(container, userData) {
    // Create the send a message button
    const sendAMessageBtn = document.createElement('button');
    sendAMessageBtn.id = 'sendAMessageBtn';
    sendAMessageBtn.classList.add('select-button');
    sendAMessageBtn.textContent = 'Send a Message';
    sendAMessageBtn.addEventListener('click', async() => {
      // Open the chat modal and start a chat with the user
      chat.openChat();
      await chat.startChat(userData.username);
    });
    container.appendChild(sendAMessageBtn);
  }

  async addFriendButton(container, userData) {
    const addFriendBtn = document.createElement('button');
    addFriendBtn.id = 'addFriendBtn';
    
    addFriendBtn.textContent = 'Add Friend';
    addFriendBtn.classList.add('select-button');
    addFriendBtn.addEventListener('click', async() => {
      // console.log('Add Friend button clicked');
      const formData = new FormData();
      formData.append('receiver_id', userData.id);

      const response = await fetch(`/friends/send-friend-request/${userData.username}/`, {
        method: 'POST',
        headers: {
          'x-csrftoken': this.getCookie('csrftoken'),
		  'X-Requested-With': 'XMLHttpRequest'
        },
        body: formData
        });
      const data = await response.json();
      // print the response to the console if there is an error
      if (response.status === 200) {
        this.modal.showForm('userViewForm', {id: userData.id});
      }
    });
    container.appendChild(addFriendBtn);
  }

  async cancelRequestButton(container, userData) {
    const cancelReqBtn = document.createElement('button');
    cancelReqBtn.id = 'cancelReqBtn';
    cancelReqBtn.textContent = 'Cancel Request';
    cancelReqBtn.classList.add('select-button');
    cancelReqBtn.addEventListener('click', async() => {
      // console.log('Cancel Request button clicked');
      const formData = new FormData();
      formData.append('friend_request_id', userData.id);

      const response = await fetch(`/friends/cancel-friend-request/`, {
        method: 'POST',
        headers: {
          'x-csrftoken': this.getCookie('csrftoken'),
		  'X-Requested-With': 'XMLHttpRequest'
        },
        body: formData
        });
      // print the response to the console if there is an error
      if (response.status === 200) {
        this.modal.showForm('userViewForm', {id: userData.id});
      }
    });
    container.appendChild(cancelReqBtn);
  }

  async acceptDenyFriendRequestButtonContainer(container, userData) {
    this.acceptDenyFriendRequestButtons(container, userData.pending_friend_request_id, {id: userData.id});
    const sendingUserMessage = document.createElement('h3');
    sendingUserMessage.classList.add('friend-request-sender');
    sendingUserMessage.textContent = `${userData.username} wants to be your friend`;
    container.classList.add('friend-request-container');
    container.appendChild(sendingUserMessage);
  }

  async unfriendButton(container, userData) {
    const unfriendBtn = document.createElement('button');
    unfriendBtn.id = 'unfriendBtn';
    unfriendBtn.textContent = 'Unfriend';
    unfriendBtn.classList.add('select-button');
    unfriendBtn.addEventListener('click', async() => {
      // console.log('Unfriend button clicked');
      const formData = new FormData();
      formData.append('friend_id', userData.id);

      const response = await fetch(`/friends/remove-friend/`, {
        method: 'POST',
        headers: {
          'x-csrftoken': this.getCookie('csrftoken'),
		  'X-Requested-With': 'XMLHttpRequest'
        },
        body: formData
      });
      if (response.status === 200) {
        // refresh the user view form
        this.modal.showForm('userViewForm', {id: userData.id});
      }
    });
    container.appendChild(unfriendBtn);
  }

  async blockUnblockButtons(container, userData) {
    // Create the block user button
    const blockUserBtn = document.createElement('button');
    blockUserBtn.id = 'blockUserBtn';
    blockUserBtn.classList.add('select-button');

    if (userData.is_blocked === false) {
      blockUserBtn.textContent = 'Block User';
      blockUserBtn.addEventListener('click', async() => {
        const response = await fetch(`/user/${userData.id}/block/`, {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
            'x-csrftoken': this.getCookie('csrftoken'),
			'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify({
            'blocked_user': userData.id
          })
        });
        if (response.status === 200) {
          blockUserBtn.textContent = 'Unblock User';
          // on success, this call forces a refresh of the user view form which will update the event listener
          this.modal.showForm('userViewForm', {id: userData.id});
        }
      });
    } else {
      blockUserBtn.textContent = 'Unblock User';
      blockUserBtn.addEventListener('click', async() => {
        const response = await fetch(`/user/${userData.id}/unblock/`, {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
            'x-csrftoken': this.getCookie('csrftoken'),
			'X-Requested-With': 'XMLHttpRequest'
          }
        });
        if (response.status === 200) {
          blockUserBtn.textContent = 'Block User';
          // on success, this call forces a refresh of the user view form which will update the event listener
          this.modal.showForm('userViewForm', {id: userData.id});
        }
      });
    }
    container.appendChild(blockUserBtn);
  }
}

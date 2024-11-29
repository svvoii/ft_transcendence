import AbstractModalView from "./AbstractModalView.js";
import { user, chat } from "../index.js";

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
        userResponse = await fetch(`http://localhost:8000/user/${data.id}/`);
      } else {
        userResponse = await fetch(`http://localhost:8000/user/${user.getUserId()}/`);
      }
      const userData = await userResponse.json();

      // Create the container
      const container = document.createElement('div');

      // Create the title
      const title = document.createElement('h2');
      title.textContent = 'View User Profile';
      title.classList.add('modal-title');
      container.appendChild(title);

      // Create the image element
      const img = document.createElement('img');
      img.src = userData.profile_image;
      img.alt = 'user image';
      img.classList.add('user-image');
      container.appendChild(img);

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

      container.appendChild(usernameDiv);

      // Create the email paragraph
      if (userData.hide_email === false) {
        const emailParagraph = document.createElement('p');
        emailParagraph.textContent = `Email: ${userData.email}`;
        container.appendChild(emailParagraph);
      }

      // Checks if the user is viewing their own profile
      if (userData.is_self === false) {

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

        // Create the add friend button
        const addFriendBtn = document.createElement('button');
        addFriendBtn.id = 'addFriendBtn';
        if (userData.is_friend === false && userData.request_sent === 0) {
          addFriendBtn.textContent = 'Add Friend';
          addFriendBtn.classList.add('select-button');
          addFriendBtn.addEventListener('click', async() => {
            console.log('Add Friend button clicked');

            const formData = new FormData();
            formData.append('receiver_id', userData.id);

            const response = await fetch(`/friends/send-friend-request/${userData.username}/`, {
              method: 'POST',
              headers: {
                'x-csrftoken': this.getCookie('csrftoken')
              },
              body: formData
              });
            const data = await response.json();
            // print the response to the console if there is an error
            if (response.status === 200) {
              addFriendBtn.textContent = 'Friend Request Sent';
              addFriendBtn.disabled = true;
            }
          });
        } else if (userData.is_friend === false && userData.request_sent > 0) {
          addFriendBtn.textContent = 'Friend Request Sent';
          addFriendBtn.disabled = true;
        } else if (userData.is_friend === true) {
          addFriendBtn.textContent = 'Unfriend';
          addFriendBtn.addEventListener('click', async() => {
            console.log('Unfriend button clicked');
          //   const response = await fetch(`http://localhost:8000/friend-request/${userData.id}/`, {
          //     method: 'DELETE',
          //     headers: {
          //       'Authorization': `Token ${user.getToken()}`
          //     }
          //   });
          //   if (response.status === 204) {
          //     addFriendBtn.textContent = 'Add Friend';
          //     addFriendBtn.disabled = false;
          //   }
          });
        }

        // Create the block user button
        const blockUserBtn = document.createElement('button');
        blockUserBtn.id = 'blockUserBtn';
        blockUserBtn.classList.add('select-button');
        if (userData.is_blocked === false) {
          blockUserBtn.textContent = 'Block User';
          blockUserBtn.addEventListener('click', async() => {
            const response = await fetch(`http://localhost:8000/user/${userData.id}/block/`, {
              method: 'POST',
              headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
                'x-csrftoken': this.getCookie('csrftoken')
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
            const response = await fetch(`http://localhost:8000/user/${userData.id}/unblock/`, {
              method: 'POST',
              headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
                'x-csrftoken': this.getCookie('csrftoken')
              }
            });
            if (response.status === 200) {
              blockUserBtn.textContent = 'Block User';
              // on success, this call forces a refresh of the user view form which will update the event listener
              this.modal.showForm('userViewForm', {id: userData.id});
            }
          });
        }

        container.appendChild(sendAMessageBtn);
        container.appendChild(addFriendBtn);
        container.appendChild(blockUserBtn);
      }

      if (userData.is_self) {
        const friendRequestsHeading = document.createElement('h2');
        friendRequestsHeading.textContent = 'Friend Requests';

        // Create the ul element
        const friendRequestsList = document.createElement('ul');

        // Create the p elements for each friend request
        const friend1 = document.createElement('p');
        friend1.textContent = 'friend1';
        const friend2 = document.createElement('p');
        friend2.textContent = 'friend2';

        // Append the p elements to the ul
        friendRequestsList.appendChild(friend1);
        friendRequestsList.appendChild(friend2);

        // Append the h2 and ul to the container
        container.appendChild(friendRequestsHeading);
        container.appendChild(friendRequestsList);
      }

      return container;
    } catch (error) {
      console.log(error);
      return document.createElement('div'); // Return an empty div in case of error
    }
  }

  afterRender() {

  }
}
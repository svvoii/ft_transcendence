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
      const usernameHeading = document.createElement('h3');
      usernameHeading.textContent = `Username: ${userData.username}`;
      container.appendChild(usernameHeading);

      // Create the email paragraph
      if (userData.hide_email === false) {
        const emailParagraph = document.createElement('p');
        emailParagraph.textContent = `Email: ${userData.email}`;
        container.appendChild(emailParagraph);
      }

      // Checks if the user is viewing their own profile
      // if (data !== null && user.getUserId() !== data.id) {
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
          //   const response = await fetch(`http://localhost:8000/friend-request/`, {
          //     method: 'POST',
          //     headers: {
          //       'Content-Type': 'application/json',
          //       'Authorization': `Token ${user.getToken()}`
          //     },
          //     body: JSON.stringify({
          //       'to_user': userData.id
          //     })
          //   });
          //   const responseData = await response.json();
          //   if (response.status === 201) {
          //     addFriendBtn.textContent = 'Friend Request Sent';
          //     addFriendBtn.disabled = true;
          //   }
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
            console.log('Block User button clicked');
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
              this.modal.showForm('userViewForm', {id: userData.id});
            }
          });
        } else {
          blockUserBtn.textContent = 'Unblock User';
          blockUserBtn.addEventListener('click', async() => {
            console.log('Unblock User button clicked');
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
              this.modal.showForm('userViewForm', {id: userData.id});
            }
          });
        }

        container.appendChild(sendAMessageBtn);
        container.appendChild(addFriendBtn);
        container.appendChild(blockUserBtn);
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
import { navigateTo } from "../helpers/helpers.js";
import { chat } from '../index.js';

export default class User {
  constructor() {
    this.userId = null;
    this.userName = '';
    this.userImg = '';
    this.loggedIn = false;
    this.isInTournament = false;
    this.tournamentSocket = null;
  }

  async userLoginCheck() {
    try {
      const response = await fetch('/login_check/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 204) {
        // user is not logged in, return
        // console.log('User is not logged in');
        return;
      }

      const data = await response.json();

      if (data.status === 'error') {
        console.error(data.message);
        return ;
      } else {
        this.userId = data.id;
        this.userName = data.username;
        this.userImg = data.profile_image_url;
        this.loggedIn = true;
        navigateTo('');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async userLogout() {
    try {
      chat.clearChat();
      await fetch('/logout/')
      this.userName = '';
      this.userImg = '';
      this.loggedIn = false;
      if (this.getIsInTournament()) {
        this.tournamentSocket.close();
        this.isInTournament = false;
      }

    } catch (error) {
        console.log(error);
    }
  }

  printUserInfo() {
    console.log(`User ID: ${this.userId}`);
    console.log(`User Name: ${this.userName}`);
    console.log(`User Image: ${this.userImg}`);
    console.log(`Logged In: ${this.loggedIn}`);
  }

  // Getters and Setters
  getUserId() {
    return this.userId;
  }

  getUserName() {
    return this.userName;
  }
  
  getProfileImageUrl() {
    return this.userImg;
  }

  getLoginStatus() {
    return this.loggedIn;
  }

  getIsInTournament() {
    return this.isInTournament;
  }

  getTournamentSocket() {
    return this.tournamentSocket;
  }

  setUserId(id) {
    this.userId = id;
  }

  setUserName(username) {
    this.userName = username;
  }

  setProfileImageUrl(profile_image_url) {
    this.userImg = profile_image_url;
  }

  setLoginStatus(status) {
    this.loggedIn = status;
  }

  setIsInTournament(status) {
    this.isInTournament = status;
  }

  setTournamentSocket(socket) {
    this.tournamentSocket = socket;
  }

}
export class User {
  constructor() {
    this.userInfo = null;
  }

  async fetchUserInfo() {
    try {
      const response = await fetch('');
      if (response.ok) {
        this.userInfo = await response.json();
      } else {
        this.userInfo = null;
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      this.userInfo = null;
    }
  }

  getUserInfo() {
    return this.userInfo;
  }

  isLoggedIn() {
    return this.userInfo !== null;
  }
}
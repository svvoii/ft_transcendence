export class User {
  constructor() {
    this.userName = '';
    this.userPic = '';
  }

  async fetchUserInfo() {
    try {
      const response = await fetch('/login_check/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.status === 'error') {
        console.error(data.message);
        return false;
      } else {
        if (return_data) {
          return data;
        } else {
          return true;
        }
      }
    } catch (error) {
      // console.error('Error:', error);
      return false;
    }
  }

  getUserInfo() {
    return this.userInfo;
  }

  isLoggedIn() {
    return this.userInfo !== null;
  }
}
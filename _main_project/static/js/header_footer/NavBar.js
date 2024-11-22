// import Modal from '../forms/Modal.js';
import { loginCheck, navigateTo } from '../helpers/helpers.js';

export default class NavBar {
  constructor(appId, modalObj) {
    this.app = document.querySelector(`#${appId}`);
    this.navbar = document.createElement('nav');
    this.navbar.classList.add('nav');
    this.modal = modalObj;
  }

  createNavLeft() {
    const navLeft = document.createElement('div');
    navLeft.classList.add('nav__left');

    // Create the dashboard element
    const dashboardLink = document.createElement('a');
    dashboardLink.href = '/';
    dashboardLink.classList.add('nav__link');
    dashboardLink.setAttribute('data-link', '');
    dashboardLink.textContent = 'FT_DANCE';

    // Create the Settings element
    const settingsLink = document.createElement('a');
    settingsLink.href = '/settings/';
    settingsLink.classList.add('nav__link');
    settingsLink.setAttribute('data-link', '');
    settingsLink.textContent = 'Game_Settings';

    navLeft.appendChild(dashboardLink);
    navLeft.appendChild(settingsLink);

    return navLeft;
  }

  createNavRight() {
    const navRight = document.createElement('div');
    navRight.classList.add('nav__right');

    const loginBtn = document.createElement('button');
    loginBtn.classList.add('nav__button');
    loginBtn.id = 'loginBtn';
    loginBtn.textContent = 'Login';

    const registerBtn = document.createElement('button');
    registerBtn.classList.add('nav__button');
    registerBtn.id = 'registerBtn';
    registerBtn.textContent = 'Register';

    const userBtn = document.createElement('button');
    userBtn.classList.add('nav__button');
    userBtn.id = 'userBtn';

    const userPic = document.createElement('img');
    userPic.id = 'userPic';
    userPic.classList.add('user-pic');
    userPic.src = '';
    userPic.alt = '';
    userPic.width = 32;
    userPic.height = 32;

    const userName = document.createElement('div');
    userName.id = 'userName';
    userName.classList.add('user-name');
    userName.textContent = 'User';

    userBtn.appendChild(userPic);
    userBtn.appendChild(userName);

    const logoutBtn = document.createElement('button');
    logoutBtn.classList.add('nav__button');
    logoutBtn.id = 'logoutBtn';
    logoutBtn.textContent = 'Logout';

    navRight.appendChild(loginBtn);
    navRight.appendChild(registerBtn);
    navRight.appendChild(userBtn);
    navRight.appendChild(logoutBtn);

    return navRight;
  }

  addEventListeners() {
    document.getElementById('registerBtn').addEventListener('click', () => {
      this.modal.showForm('registerForm');
    });

    document.getElementById('loginBtn').addEventListener('click', () => {
      this.modal.showForm('loginForm');
    });

    document.getElementById('userBtn').addEventListener('click', () => {
      this.modal.showForm('userForm');
    });

    document.getElementById('logoutBtn').addEventListener('click', async(event) => {
      await fetch('/logout/')
        .catch(error => {
          console.log(error);
        });
      navigateTo('/');
    });
  }

  async updateNavBar() {
    const login = document.getElementById("loginBtn");
    const register = document.getElementById("registerBtn");
    const logout = document.getElementById("logoutBtn");
    const user = document.getElementById("userBtn");

    const userInfo = await loginCheck(true);
    if (userInfo) {
      const userPic = document.getElementById('userPic');
      const userName = document.getElementById('userName');
      userPic.src = userInfo.profile_image_url;
      userName.textContent = userInfo.username;

      login.style.display = "none";
      register.style.display = "none";
      user.style.display = "flex";
      logout.style.display = "flex";
    } else {
      login.style.display = "flex";
      register.style.display = "flex";
      user.style.display = "none";
      logout.style.display = "none";
    }
  }

  full_render() {
    this.navbar.appendChild(this.createNavLeft());
    this.navbar.appendChild(this.createNavRight());
    this.app.appendChild(this.navbar);
    this.addEventListeners();
  }

  fast_render() {
    this.app.appendChild(this.navbar);
    this.updateNavBar();
  }
};

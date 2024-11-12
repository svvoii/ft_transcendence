import { Modal } from "../forms/Modal.js";
import { navigateTo } from "../index.js";
import { loginCheck } from "../helpers/helpers.js";

/* Changes the visibility of the navbar buttons based on the user's login status */
const updateNavBar = async() => {
  const login = document.getElementById("loginBtn");
  const register = document.getElementById("registerBtn");
  const logout = document.getElementById("logoutBtn");
  const user = document.getElementById("userBtn");

  const userInfo = await loginCheck(true);
  if (userInfo) {
    // if we get data back, we will update the user image and name
    if (userInfo) {
      const userPic = document.getElementById('userPic');
      const userName = document.getElementById('userName');
      userPic.src = userInfo.profile_image_url;
      userName.textContent = userInfo.username
    }
    // also make buttons visible
    login.style.display = "none";
    register.style.display = "none";
    user.style.display = "flex";
    logout.style.display = "flex";
  } else {
    // if we dont get data back, we will show the login and register buttons
    login.style.display = "flex";
    register.style.display = "flex";
    user.style.display = "none";
    logout.style.display = "none";
  }
}

/* Adds functionality to the buttons in the navbar */
/* Also gets the user image and name if the user is logged in */
const navbarButtonFunctions = async() => {
  // Buttons with Modal Forms
  const modal = new Modal('formModal', 'modalContent');

  // Register Button
  document.getElementById('registerBtn').addEventListener('click', () => {
    modal.showForm('registerForm');
  });

  // Login Button
  document.getElementById('loginBtn').addEventListener('click', () => {
    modal.showForm('loginForm');
  });

  // User Button
  document.getElementById('userBtn').addEventListener('click', () => {
    modal.showForm('userForm');
  });

  // Logout Button
  document.getElementById('logoutBtn').addEventListener('click', async(event) => {
    await fetch('/logout/')
      .catch(error => {
        console.log(error);
      });
    navigateTo('/');
  });
};

export const renderNavBar = async() => {
  const app = document.querySelector('#app');
  const navbar = document.createElement('nav');
  navbar.classList.add('nav');

  // Create the left div
  const navLeft = document.createElement('div');
  navLeft.classList.add('nav__left');

  const dashboardLink = document.createElement('a');
  dashboardLink.href = '/';
  dashboardLink.classList.add('nav__link');
  dashboardLink.setAttribute('data-link', '');
  dashboardLink.textContent = 'Dashboard';

  const settingsLink = document.createElement('a');
  settingsLink.href = '/settings/';
  settingsLink.classList.add('nav__link');
  settingsLink.setAttribute('data-link', '');
  settingsLink.textContent = 'Settings';

  navLeft.appendChild(dashboardLink);
  navLeft.appendChild(settingsLink);

  // Create the right div
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
  userPic.src = '';
  userPic.alt = '';
  userPic.width = 32;
  userPic.height = 32;

  const userName = document.createElement('div');
  userName.id = 'userName';
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

  // Append the divs to the nav
  navbar.appendChild(navLeft);
  navbar.appendChild(navRight);

  // Append the nav to the DOM
  app.appendChild(navbar);

  navbarButtonFunctions();

  updateNavBar();
};
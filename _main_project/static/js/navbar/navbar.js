import { Modal } from "../forms/Modal.js";
import { navigateTo } from "../index.js";
import { loginCheck } from "../helpers/helpers.js";

/* Changes the visibility of the navbar buttons based on the user's login status */
export const updateNavBar = async() => {
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
      console.log(userName);
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
export const navbarSetup = async() => {
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

import RegisterForm from "../forms/RegisterForm.js";
import LoginForm from "../forms/LoginForm.js";
import UserForm from "../forms/UserForm.js";
import { Modal } from "./Modal.js";
import { navigateTo } from "../index.js";
import { getProfileInfo } from "../helpers/helpers.js";

/* Changes the visibility of the navbar buttons based on the user's login status */
export const updateNavBar = function () {
  const login = document.getElementById("loginBtn");
  const register = document.getElementById("registerBtn");
  const logout = document.getElementById("logoutBtn");
  const user = document.getElementById("userBtn");

  if (localStorage.getItem('isLoggedIn') == 'true') {
    login.style.display = "none";
    register.style.display = "none";
    user.style.display = "flex";
    logout.style.display = "block";
    getProfileInfo();
  } else {
    login.style.display = "block";
    register.style.display = "block";
    user.style.display = "none";
    logout.style.display = "none";
  }
}

/* Adds functionality to the buttons in the navbar */
export const navBarButtons = function () {
  // Buttons with Modal Forms
  new Modal('registerBtn', new RegisterForm());
  new Modal('loginBtn', new LoginForm());
  new Modal('userBtn', new UserForm());

  // Logout Button
  document.getElementById('logoutBtn').addEventListener('click', async(event) => {
    await fetch('/logout/');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('profile_image_url');
    localStorage.removeItem('profile_username');
    navigateTo('/');
  });
};

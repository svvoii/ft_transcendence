import { Modal } from "../forms/Modal.js";
import { navigateTo } from "../index.js";
import { loginCheck } from "../helpers/helpers.js";

/* Changes the visibility of the navbar buttons based on the user's login status */
export const updateNavBar = async() => {
  const login = document.getElementById("loginBtn");
  const register = document.getElementById("registerBtn");
  const logout = document.getElementById("logoutBtn");
  const user = document.getElementById("userBtn");

  if (await loginCheck()) {
    login.style.display = "none";
    register.style.display = "none";
    user.style.display = "flex";
    logout.style.display = "block";
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

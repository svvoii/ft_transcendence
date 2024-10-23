import RegisterForm from "../views/RegisterForm.js";
import LoginForm from "../views/LoginForm.js";
import { navigateTo } from "../index.js";

export const updateNavBar = function () {
  const login = document.getElementById("loginBtn");
  const register = document.getElementById("registerBtn");
  const logout = document.getElementById("logoutBtn");
  const user = document.getElementById("userBtn");

  if (localStorage.getItem('isLoggedIn') == 'true') {
    // console.log('logged in');
    login.style.display = "none";
    register.style.display = "none";
    user.style.display = "block";
    logout.style.display = "block";
  } else {
    // console.log('not logged in');
    login.style.display = "block";
    register.style.display = "block";
    user.style.display = "none";
    logout.style.display = "none";
  }
}

export const navBarButtons = function () {
  const modal = document.getElementById("modalWindow");

  // Login Button
  document.getElementById('loginBtn').addEventListener('click', async(event) => {
    // console.log('loginForm');

    modal.style.display = "block";
    
    const loginForm = new LoginForm();
    document.querySelector('#modalWindow').innerHTML = await loginForm.getHtml();
    loginForm.afterRender();
    
    // Define the behavior of the close button after it is in the DOM.
    const span = document.getElementsByClassName("close")[0];
    span.addEventListener('click', () => {
      modal.style.display = "none";
    });

    window.onclick = event => {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    };
  });

  // Register Button
  document.getElementById('registerBtn').addEventListener('click', async(event) => {
    // console.log('registerForm');

    modal.style.display = "block";
    
    const registerForm = new RegisterForm();
    document.querySelector('#modalWindow').innerHTML = await registerForm.getHtml();
    registerForm.afterRender();
    
    // Define the behavior of the close button after it is in the DOM.
    const span = document.getElementsByClassName("close")[0];
    span.addEventListener('click', () => {
      modal.style.display = "none";
    });

    window.onclick = event => {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    };
  });

  // Logout Button
  document.getElementById('logoutBtn').addEventListener('click', async(event) => {
    // console.log('logout');

    await fetch('/logout/');
    localStorage.removeItem('isLoggedIn');
    navigateTo('/');
  });

  // User Button
  document.getElementById('userBtn').addEventListener('click', async(event) => {
    console.log('user');
  });
};
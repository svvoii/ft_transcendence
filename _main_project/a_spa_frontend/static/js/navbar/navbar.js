import RegisterForm from "../views/RegisterForm.js";
import LoginForm from "../views/LoginForm.js";
import { navigateTo } from "../index.js";

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
  const modal = document.getElementById("modalWindow");

  // Login Button
  document.getElementById('loginBtn').addEventListener('click', async(event) => {
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
    await fetch('/logout/');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('profile_image_url');
    localStorage.removeItem('profile_username');
    navigateTo('/');
  });

  // User Button
  document.getElementById('userBtn').addEventListener('click', async(event) => {
    const userBtn = document.getElementById('userName')

    console.log('user');
    userBtn.textContent = 'Clicked!';
    setTimeout(() => {
      userBtn.textContent = localStorage.getItem('profile_username');
    }, 2000);
  });
};

export const getProfileInfo = function () {
  const profileImage = localStorage.getItem('profile_image_url');
  const profileName = localStorage.getItem('profile_username');

  if (profileImage !== null) {
    const userPic = document.getElementById('userPic');
    userPic.src = profileImage;
  }  
  if (profileName !== null) {
    const userName = document.getElementById('userName');
    userName.innerHTML = profileName;
  }  
};
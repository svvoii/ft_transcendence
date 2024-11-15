import NavBar from "./header_footer/NavBar.js";
import Footer from "./header_footer/Footer.js";
import Modal from "./forms/Modal.js";
import { router } from "./helpers/router.js";
import { navigateTo } from "./helpers/helpers.js";

// Create the navbar instance and render it
export const modal = new Modal('app');
modal.full_render();
export const navBar = new NavBar('app', modal);
navBar.full_render();
export const footer = new Footer('app');
footer.full_render();


// This event listener listens for a popstate event and calls the router function
// This means when the back or forward buttons are clicked, the router function is called.
window.addEventListener('popstate', router);

document.addEventListener('DOMContentLoaded', () => {

  // Adding this event listener allows us to navigate to different routes by clicking on links. Does not require a page reload
  document.body.addEventListener('click', e => {
    if (e.target.matches('[data-link]')) {
      e.preventDefault();
      navigateTo(e.target.href);
    }
  });

  router();
});
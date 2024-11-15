import Dashboard from "../views/Dashboard.js";
import Game from "../views/Game.js";
import Settings from "../views/Settings.js";
import Page404 from "../views/Page404.js";
import { pathToRegex, getParams } from "./helpers.js";
import { navBar, footer, modal } from "../index.js";

// handles Routing for the application
export const router = async () => {
  // Listing the routes
  const routes = [
    { path: '/', view: Dashboard },
    { path: '/game/', view: Game },
    { path: '/settings/', view: Settings },
  ];

  // Uses the map method to create an array of objects that contain the route and whether or not it matches the current location
  const potentialMatches = routes.map(route => {
    return {
      route: route,
      result: location.pathname.match(pathToRegex(route.path))
    };
  });

  // creates a match object that contains the route and whether or not it is a match
  let match = potentialMatches.find(potentialMatch => potentialMatch.result !== null);

  // If no match is found, use the 404 page.
  if (!match) {
    match = {
      route: { path: '', view: Page404 },
      result: [location.pathname]
    };
  }

  // Creates a new instance of the view
  const view = new match.route.view(getParams(match));

  // Clear the app div
  const app = document.querySelector('#app');
  app.innerHTML = '';

  // Add the navbar to the DOM and update the user info
  navBar.fast_render();
  // Render the modal
  modal.full_render();
  // Render the footer
  footer.full_render();

  if (view.name === 'Dashboard') {
    app.classList.add('gif-container');
  } else {
    app.classList.remove('gif-container');
  }

  // Uses the view instance we just created to render the view
  const bodyContent = document.createElement('div');
  bodyContent.innerHTML = await view.getHtml();
  bodyContent.style.width = '90%';
  app.appendChild(bodyContent);

  await view.afterRender();
};
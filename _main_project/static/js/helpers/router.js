import Dashboard from "../views/Dashboard.js";
import Settings from "../views/Settings.js";
import TermsOfService from "../views/TermsOfService.js";
import PrivacyPolicy from "../views/PrivacyPolicy.js";
import Page404 from "../views/Page404.js";
import { pathToRegex, getParams } from "./helpers.js";
import { navBar, footer, modal, gameBoard } from "../index.js";

// handles Routing for the application
export const router = async () => {
  // Listing the routes
  const routes = [
    { path: '/', view: Dashboard },
    { path: '/settings/', view: Settings },
    { path: '/terms_of_service/', view: TermsOfService },
    { path: '/privacy_policy/', view: PrivacyPolicy },
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
  
  // Render the view
  await renderPage(view);

};

const renderPage = async(view) => {
  // Clear the app div
  const app = document.querySelector('#app');
  app.innerHTML = '';

  // Add the navbar to the DOM and update the user info
  navBar.fast_render();
  // Render the modal
  modal.full_render();
  // Render the footer
  footer.fast_render();
  // Render the gameboard
  gameBoard.fast_render();

  // If viewing the dashboard, add the gif-container class
  if (view.name === 'Dashboard') {
    app.classList.add('gif-container');
  } else {
    app.classList.remove('gif-container');
  }

  // Create the div that holds the view content and add content
  const viewContent = document.createElement('div');
  viewContent.appendChild(view.getDomElements());
  app.appendChild(viewContent);

  await view.afterRender();
};
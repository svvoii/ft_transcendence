import Dashboard from "../views/Dashboard.js";
import Settings from "../views/Settings.js";
import GameMenu from "../views/GameMenu.js";
import TermsOfService from "../views/TermsOfService.js";
import PrivacyPolicy from "../views/PrivacyPolicy.js";
import AboutUs from "../views/AboutUs.js";
import Page404 from "../views/Page404.js";
import TournamentSetupCreate from "../views/TournamentSetupCreate.js";
import TournamentLobby from "../views/TournamentLobby.js";
import TournamentSelect from "../views/TournamentSelect.js";
import MultiplayerSelect from "../views/MultiplayerSelect.js";
import LocalMatchSelect from "../views/LocalMatchSelect.js";
import { pathToRegex, getParams } from "./helpers.js";
import { navBar, footer, modal, gameBoard, crtEffect, chat, user } from "../index.js";

// handles Routing for the application
export const router = async () => {
  // if (user.getIsInTournament() === true) {
  //   console.log('user is in a tournament');
  // }

  // Listing the routes
  const routes = [
    { path: '/', view: Dashboard },
    { path: '/settings/', view: Settings },
    { path: '/game_menu/', view: GameMenu },
    { path: '/tournament_lobby/', view: TournamentLobby },
    { path: '/tournament_select/', view: TournamentSelect },
    { path: '/multiplayer_select/', view: MultiplayerSelect },
    { path: '/local_match_select/', view: LocalMatchSelect },
    { path: '/tournament_setup_create/', view: TournamentSetupCreate },
    { path: '/tournament_lobby/:tournament_name', view: TournamentLobby },
    { path: '/terms_of_service/', view: TermsOfService },
    { path: '/privacy_policy/', view: PrivacyPolicy },
    { path: '/about_us/', view: AboutUs },
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

  if (user.getIsInTournament() === true && view.name !== "TournamentLobby") {
    // // Remove the player from the tournament
    const tournamentURL = user.getTournamentURL();
    const response = await fetch(`/tournament/remove_player_from_tournament/${tournamentURL}/`, {
		headers: {
			'X-Requested-With': 'XMLHttpRequest',
		}
	  })

    const responseText = await response.text();
    const data = JSON.parse(responseText);
    
    // console.log('Data after leaving the tournament :', data);

    if (data.status === 'error') {
      console.error('Error while leaving tournament:', data.message);
    }

    user.setIsInTournament(false, '');
    user.getTournamentSocket().close();
    user.setTournamentSocket(null);
    document.getElementById('quitGameBtn').removeAttribute('style');
  }
  
  // Render the view
  await renderPage(view);

  // console.log(window.location.href);

};

const renderPage = async(view) => {
  // Clear the app div
  const app = document.querySelector('#app');
  app.innerHTML = '';

  // Render the functional parts of the page
  crtEffect.full_render();
  navBar.fast_render();
  modal.full_render();
  footer.fast_render();
  gameBoard.fast_render();
  chat.fast_render();

  // Create the div that holds the view content and add content
  const viewContent = document.createElement('div');
  viewContent.id = 'view-content';
  viewContent.appendChild(view.getDomElements());
  app.appendChild(viewContent);

  await view.afterRender();

  // user.printUserInfo();
};
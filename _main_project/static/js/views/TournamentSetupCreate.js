import AbstractView from "./AbstractView.js";
import { navigateTo } from "../helpers/helpers.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Tournament Setup");
    this.name = "TournamentSetup";
  }

  getDomElements() {
		// Check that the user is logged in
		const logCheck = this.checkUserLoggedIn();
		if (logCheck) return logCheck;

		// Continue creating the view if the user is logged in
    // Set the game modal to hidden
    document.getElementById("gameModal").style.display = "none";

    // Create a container div
    const container = document.createElement('div');
    container.classList.add('text-container', 'game-select-button-div');

    // Create the paragraph element
    const paragraph = document.createElement('p');
    paragraph.textContent = 'Click "Create tournament" to create a new tournament and invite your friends!';
    paragraph.style.textAlign = 'center';

    const breakElem = document.createElement('br');

    // Create the button
    const tournament_lobby_button = document.createElement('button');
    tournament_lobby_button.id = 'tournamentLobbyBtn';
    tournament_lobby_button.classList.add('game-select-button');
    tournament_lobby_button.type = 'select';
    tournament_lobby_button.textContent = 'Create tournament';


    // Append the paragraph to the container
    container.appendChild(paragraph);
    container.appendChild(breakElem);
    container.appendChild(tournament_lobby_button);

    return container;
  }

  async afterRender() {
    try {
      document.getElementById('tournamentLobbyBtn').addEventListener('click', async () => {
        console.log('Create Tournament Lobby Button Clicked');
        // navigateTo('/tournament_lobby/');

            try {
                  const csrftoken = getCookie('csrftoken'); // Function to get the CSRF token from cookies

                  const response = await fetch(`/tournament/create_tournament/`, {
                      method: 'POST',
                      headers: {
                          'Accept': 'application/json',
                          'Content-Type': 'application/json',
                          'X-CSRFToken': csrftoken,
                      },
                      body: JSON.stringify({ }),
                  });

                  const responseText = await response.text();
                  const data = JSON.parse(responseText);


                  if (data.status === 'success') {
                      console.log('Tournament created successfully:', data.url);
                      navigateTo(`/tournament_lobby/${data.url}/`);
                  } else {
                      alert(data.message);
                  }
                  
                
                } catch (error) {
                    console.error('Error:', error);
                }
        /////////////////////////////// DELETE TOURNAMENT //////////////////////////////////////

        //     const csrftoken = getCookie('csrftoken'); // Function to get the CSRF token from cookies

        //     const response = await fetch(`/tournament/delete_tournament/${tournamentName}/`, {
        //       method: 'DELETE',
        //       headers: {
        //           'Content-Type': 'application/json',
        //           'X-CSRFToken': csrftoken,
        //       },
        //       body: JSON.stringify({ name: tournamentName }), // Include any data you need to send with the request
        //     });

        //     console.log('Request [delete] sent, awaiting response...');

        //     const responseText = await response.text();
        //     const data = JSON.parse(responseText);


        //     if (data.status === 'success') {
        //         console.log(data.message, data.tournament_name);
        //     } else {
        //         alert(data.message);
        //     }
        // } catch (error) {
        //     console.error('Error:', error);
        // }

      });
    } catch (error) {
    }
  }
}

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          if (cookie.substring(0, name.length + 1) === (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
          }
      }
  }
  return cookieValue;
}
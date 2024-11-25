import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Dashboard");
    this.name = "Dashboard";
  }

  getDomElements() {
    // Set the game modal to hidden
    document.getElementById("gameModal").style.display = "none";

    // Create the main container div
    const container = document.createElement('div');
    container.classList.add('view-content');

    // Create the h1 element
    const heading = document.createElement('h1');
    heading.textContent = 'Welcome to our TranscenDANCE';

    // Create the first paragraph
    const paragraph1 = document.createElement('p');
    paragraph1.textContent = 'This is the dashboard. You can view the list of posts, your settings, or logout.';

    // Create the third paragraph with a link
    const paragraph3 = document.createElement('p');
    const link2 = document.createElement('a');
    link2.href = 'home/';
    link2.textContent = 'here';
    paragraph3.appendChild(document.createTextNode("If you'd like to look at the old version, click "));
    paragraph3.appendChild(link2);
    paragraph3.appendChild(document.createTextNode('.'));

    // Create the fourth paragraph
    const paragraph4 = document.createElement('p');
    paragraph4.textContent = 'Blah blah blah, some stuff about matchmaking? IDK....';

    // Create the button
    const button = document.createElement('button');
    button.id = 'playGameBtn';
    button.type = 'select';
    button.textContent = 'Play Game (Coming Soon)';



    // const chatSocket = new WebSocket('ws://localhost:8000/ws/game/');

    // chatSocket.onopen = function() {
    //   console.log('WebSocket connection established.');
    //   const message = {
    //     'message': 'Hello, world!'
    //   };
    //   chatSocket.send(JSON.stringify(message));
    // };
    // chatSocket.onmessage = function(event) {
    //   const message = JSON.parse(event.data);
    //   console.log('Received message:', message);
    // };




    // Append all elements to the container
    container.appendChild(heading);
    container.appendChild(paragraph1);
    container.appendChild(paragraph3);
    container.appendChild(paragraph4);
    container.appendChild(button);

    return container;
  }

  async afterRender() {
    const gameModal = document.getElementById("gameModal");

    document.getElementById('playGameBtn').addEventListener('click', () => {
      gameModal.style.display = "flex";
    });
  }
}
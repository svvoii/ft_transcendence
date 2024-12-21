import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("About Us");
    this.name = "AboutUs";
  }

  getDomElements() {
    document.getElementById("gameModal").style.display = "none";

    const container = document.createElement('div');

    ///// TEXT /////

    const text_container = document.createElement('div');
    text_container.classList.add('text-container');

    const elements = [
      { tag: 'h1', content: '<strong>ft_transcenDANCE_team</strong>' },
      { tag: 'br', content: '' },
      { tag: 'hr', content: '' },
      { tag: 'br', content: '' },
      { tag: 'p', content: 'We are a team of three students from 42 Paris and this is our ft_transcendence project. ft_transcendence is the final project of the common core.'},
      { tag: 'br', content: '' },
      { tag: 'p', content: 'We are passionate about coding and we are always looking for new challenges. We hope you enjoy our work!'},
      { tag: 'p', content: 'To view our source code for this project, please visit our repo here:'},
      { tag: 'a', content:  '<strong>ft_transcendence</strong>', href: 'https://github.com/svvoii/ft_transcendence'}
    ];

    elements.forEach(element => {
      const el = document.createElement(element.tag);
      el.innerHTML = element.content;
      el.style.textAlign = 'center';
      if (element.href) {
        el.style.display = 'flex';
        el.style.justifyContent = 'center';
        el.href = element.href;
      }
      text_container.appendChild(el);
    });

    ///// PHOTOS /////

    const photos_container = document.createElement('div');
    photos_container.classList.add('photos-container');

    // serge
    const serge_container = document.createElement('div');
    serge_container.classList.add('photo-container');

    const link_serge = document.createElement('a');
    link_serge.href = 'https://github.com/svvoii';

    const photo_serge = document.createElement('img');
    photo_serge.classList.add('profile-photo');
    photo_serge.src = '/static/images/about_us/Serge.jpg';

    const name_serge = document.createElement('a');
    name_serge.classList.add('name-container');
    name_serge.href = 'https://github.com/svvoii';
    name_serge.textContent = 'Serge';

    link_serge.appendChild(photo_serge);
    serge_container.appendChild(link_serge);
    serge_container.appendChild(name_serge);

    // roxane
    const roxane_container = document.createElement('div');
    roxane_container.classList.add('photo-container');

    const link_roxane = document.createElement('a');
    link_roxane.href = 'https://github.com/Roshanakk';

    const photo_roxane = document.createElement('img');
    photo_roxane.classList.add('profile-photo');
    photo_roxane.src = '/static/images/about_us/Roxane.jpg';

    const name_roxane = document.createElement('a');
    name_roxane.classList.add('name-container');
    name_roxane.href = 'https://github.com/Roshanakk';
    name_roxane.textContent = 'Roxane';

    link_roxane.appendChild(photo_roxane);
    roxane_container.appendChild(link_roxane);
    roxane_container.appendChild(name_roxane);

    // drew
    const drew_container = document.createElement('div');
    drew_container.classList.add('photo-container');

    const link_drew = document.createElement('a');
    link_drew.href = 'https://github.com/Drewski6';

    const photo_drew = document.createElement('img');
    photo_drew.classList.add('profile-photo');
    photo_drew.src = '/static/images/about_us/Drew.jpg';

    const name_drew = document.createElement('a');
    name_drew.classList.add('name-container');
    name_drew.href = 'https://github.com/Drewski6';
    name_drew.textContent = 'Drew';

    link_drew.appendChild(photo_drew);
    drew_container.appendChild(link_drew);
    drew_container.appendChild(name_drew);

    photos_container.appendChild(serge_container);
    photos_container.appendChild(roxane_container);
    photos_container.appendChild(drew_container);

    container.appendChild(text_container);
    container.appendChild(photos_container);

    return container;
  }
}
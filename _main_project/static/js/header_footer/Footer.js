export default class Footer {
  constructor(appId) {
    this.app = document.querySelector(`#${appId}`);
    this.footer = document.createElement('div');
  }

  full_render = async() => {
    this.footer.classList.add('footer');

    const footer_content = `ft_transcendence`;

    // Set the footer height to match the navbar height
    this.footer.style.height = 'var(--nav-height)';
    this.footer.style.backgroundColor = '#222222';
    this.footer.style.color = '#eeeeee';
    this.footer.style.display = 'flex';
    this.footer.style.justifyContent = 'center';
    this.footer.style.alignItems = 'center';
    this.footer.style.fontSize = '0.5rem';
    this.footer.textContent = footer_content;

    // Append the footer to the DOM
    app.appendChild(this.footer);
  }
}
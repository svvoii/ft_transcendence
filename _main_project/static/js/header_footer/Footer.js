export default class Footer {
  constructor(appId) {
    this.app = document.querySelector(`#${appId}`);
    this.footer = document.createElement('div');
  }

  full_render = async() => {
    this.footer.classList.add('footer');
    const footer_content = `ft_transcendence`;

    this.footer.textContent = footer_content;
    app.appendChild(this.footer);
  }
}
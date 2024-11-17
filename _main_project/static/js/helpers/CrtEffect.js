export default class CrtEffect {
  constructor(appId) {
    this.app = document.getElementById(`${appId}`);
    this.crtEffect = document.createElement('div');
    this.crtEffect.classList.add('old-crt-monitor');
  }

  full_render() {
    this.app.appendChild(this.crtEffect);
  }
};
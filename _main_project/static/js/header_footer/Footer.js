export default class Footer {
  constructor(appId) {
    this.app = document.querySelector(`#${appId}`);
    this.footer = document.createElement('div');
  }

  full_render = async() => {
    this.footer.classList.add('footer');

    this.privacy_policy = document.createElement('a');
    this.privacy_policy.setAttribute('data-link', '');
    this.privacy_policy.href = '/privacy_policy/';
    this.privacy_policy.textContent = 'Privacy Policy';
    this.privacy_policy.style.marginLeft = '1rem';

    this.footer_text = document.createElement('p');
    this.footer_text.textContent = 'ft_transcendence';
    this.footer_text.style.marginLeft = '1rem';

    this.terms_of_service = document.createElement('a');
    this.terms_of_service.setAttribute('data-link', '');
    this.terms_of_service.href = '/terms_of_service/';
    this.terms_of_service.textContent = 'Terms of Service';
    this.terms_of_service.style.marginLeft = '1rem';

    this.footer.appendChild(this.terms_of_service);
    this.footer.appendChild(this.footer_text);
    this.footer.appendChild(this.privacy_policy);

    this.app.appendChild(this.footer);
  }

  fast_render = async() => {
    this.app.appendChild(this.footer);
  }
}
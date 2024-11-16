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

    this.about_us = document.createElement('a');
    this.about_us.setAttribute('data-link', '');
    this.about_us.classList.add('about_us');
    this.about_us.href = '/about_us/';
    this.about_us.textContent = 'ft_transcendence_team';
    this.about_us.style.marginLeft = '1rem';

    this.terms_of_service = document.createElement('a');
    this.terms_of_service.setAttribute('data-link', '');
    this.terms_of_service.href = '/terms_of_service/';
    this.terms_of_service.textContent = 'Terms of Service';
    this.terms_of_service.style.marginLeft = '1rem';

    this.footer.appendChild(this.terms_of_service);
    this.footer.appendChild(this.about_us);
    this.footer.appendChild(this.privacy_policy);

    this.app.appendChild(this.footer);
  }

  fast_render = async() => {
    this.app.appendChild(this.footer);
  }
}
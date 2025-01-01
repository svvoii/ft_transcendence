import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Privacy Policy");
    this.name = "PrivacyPolicy";
  }

  getDomElements() {
    const container = document.createElement('div');
    container.classList.add('text-container');
    container.style.padding = '0 2rem';

    const elements = [
      { tag: 'h1', content: '<strong>Privacy Policy for ft_transcenDANCE</strong>' },
      { tag: 'p', content: '<strong>Effective Date</strong>: 5 Dec 2024' },
      { tag: 'h3', content: '<strong>1. Introduction</strong>' },
      { tag: 'p', content: 'Welcome to ft_transcenDANCE ("we", "us", "our"). This Privacy Policy explains how we collect, use, and protect your information when you play our online multiplayer Pong game ("Game").' },
      { tag: 'p', content: 'By using our Game, you agree to the collection and use of your information in accordance with this Privacy Policy.' },
      { tag: 'h3', content: '<strong>2. Information We Collect</strong>' },
      { tag: 'p', content: 'We collect the following types of information when you play our Game:' },
      { tag: 'ul', content: '<li><strong>Personal Information</strong>: We only collect personal information you give us such as your username and email address</li><li><strong>Game Data</strong>: We collect gameplay data such as your scores, rankings, and in-game actions to improve the gaming experience.</li><li><strong>Technical Data</strong>: We may collect information about the device you use to play the game, such as your IP address, browser type, operating system, and internet connection.</li>' },
      { tag: 'h3', content: '<strong>3. How We Use Your Information</strong>' },
      { tag: 'p', content: 'We use the collected information for the following purposes:' },
      { tag: 'ul', content: '<li>To operate and provide the Game\'s features.</li><li>To improve the Game and provide a better user experience.</li><li>To monitor and analyze gameplay to ensure fair play and detect cheating.</li><li>To communicate with you, if necessary, for updates or changes related to the Game.</li>' },
      { tag: 'h3', content: '<strong>4. Data Security</strong>' },
      { tag: 'p', content: 'We take reasonable measures to protect your information from unauthorized access or misuse. However, please be aware that no method of transmitting or storing data is completely secure, and we cannot guarantee absolute security.' },
      { tag: 'h3', content: '<strong>5. Third-Party Services</strong>' },
      { tag: 'p', content: 'Our Game may use third-party services, such as analytics tools, to improve performance and user experience. These services may collect data such as your device information and gameplay data. We are not responsible for the privacy practices of third-party services.' },
      { tag: 'h3', content: '<strong>6. Children’s Privacy</strong>' },
      { tag: 'p', content: 'Our Game is not intended for children under the age of 18. We do not knowingly collect personal information from children under 18. If we learn that we have collected personal information from a child under 18, we will take steps to delete that information.' },
      { tag: 'h3', content: '<strong>7. Changes to This Privacy Policy</strong>' },
      { tag: 'p', content: 'We may update this Privacy Policy from time to time. Any changes will be posted here, and the effective date will be updated accordingly. Please review this Privacy Policy periodically to stay informed about how we are protecting your information.' },
      { tag: 'h3', content: '<strong>8. Contact Us</strong>' },
      { tag: 'p', content: 'If you have any questions or concerns about this Privacy Policy, please contact us at ft_transcendance.contort733@passfwd.com.' },
      { tag: 'br', content: '' },
      { tag: 'hr', content: '' },
      { tag: 'br', content: '' },
      { tag: 'h3', content: 'Thank you for playing ft_transcenDANCE!' },
      { tag: 'br', content: '' },
    ];

    elements.forEach(element => {
      const el = document.createElement(element.tag);
      if (element.tag === 'h3' || element.tag === 'h1') {
        el.style.textAlign = 'center';
      }
      el.innerHTML = element.content;
      container.appendChild(el);
    });

    return container;
  }
}
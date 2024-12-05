import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Terms of Service");
    this.name = "TermsOfService";
  }

  getDomElements() {
    // Set the game modal to hidden
    document.getElementById("gameModal").style.display = "none";

    // Create a container div
    const container = document.createElement('div');
    container.classList.add('text-container');

    const elements = [
      { tag: 'h1', content: 'Terms of Service' },
      { tag: 'p', content: '<strong>Effective Date</strong>: 5 Dec 2024' },
      { tag: 'p', content: 'Welcome to ft_transcenDANCE ("the Game"), a Pong game created as a school project. By using or playing the Game, you agree to comply with the following terms and conditions.' },
      { tag: 'h3', content: '1. <strong>Acceptance of Terms</strong>' },
      { tag: 'p', content: 'By accessing or using the Game, you agree to be bound by these Terms of Service. If you do not agree with these terms, please do not use the Game.' },
      { tag: 'h3', content: '2. <strong>Game Usage</strong>' },
      { tag: 'ul', content: '<li>The Game is provided for personal, non-commercial use only.</li><li>You agree not to use the Game for any unlawful, harmful, or fraudulent activities.</li><li>You must be at least 18 to play the Game. If you are under 18, please have a parent or guardian review these terms with you before using the Game.</li>' },
      { tag: 'h3', content: '3. <strong>Account Creation</strong>' },
      { tag: 'ul', content: '<li>If the Game requires account creation, you agree to provide accurate and complete information during registration.</li><li>You are responsible for maintaining the confidentiality of your account information and for all activities under your account.</li>' },
      { tag: 'h3', content: '4. <strong>Game Content</strong>' },
      { tag: 'ul', content: '<li>The Game, including all its features, graphics, sounds, and other content, is owned by the ft_transcenDANCE unless otherwise stated. (excptions include GIFs used throughout the game)</li><li>You may not copy, reproduce, or distribute any part of the Game without permission.</li>' },
      { tag: 'h3', content: '5. <strong>User Conduct</strong>' },
      { tag: 'ul', content: '<li>You agree to play the Game in a fair and respectful manner.</li><li>You will not engage in any behavior that may negatively affect other users\' experience, including but not limited to cheating, spamming, or using offensive language.</li>' },
      { tag: 'h3', content: '6. <strong>Privacy</strong>' },
      { tag: 'ul', content: '<li>The Game may collect certain information to enhance your experience. Please refer to the Privacy Policy to understand what information is collected and how it is used.</li><li>We do not share or sell your personal information.</li>' },
      { tag: 'h3', content: '7. <strong>Disclaimer of Warranties</strong>' },
      { tag: 'ul', content: '<li>The Game is provided "as is," without any warranties of any kind, either express or implied, including but not limited to fitness for a particular purpose, accuracy, or availability.</li><li>We do not guarantee that the Game will always be available or error-free. We may make updates or changes at our discretion.</li>' },
      { tag: 'h3', content: '8. <strong>Limitation of Liability</strong>' },
      { tag: 'ul', content: '<li>ft_transcenDANCE is not responsible for any direct, indirect, incidental, or consequential damages resulting from your use or inability to use the Game, including any loss of data, device malfunctions, or interruptions.</li>' },
      { tag: 'h3', content: '9. <strong>Modifications to Terms</strong>' },
      { tag: 'ul', content: '<li>We may update or modify these Terms of Service at any time. Any changes will be effective once posted in the Game or on the website. It\'s your responsibility to review the Terms regularly for any updates.</li>' },
      { tag: 'h3', content: '10. <strong>Termination</strong>' },
      { tag: 'ul', content: '<li>We reserve the right to suspend or terminate your access to the Game at our discretion, including for violations of these Terms of Service.</li>' },
      { tag: 'h3', content: '11. <strong>Contact Information</strong>' },
      { tag: 'p', content: 'For any questions or concerns regarding these Terms of Service, you can contact us at: ft_transcendance.contort733@passfwd.com</li>' },
      { tag: 'p', content: 'Thank you for playing ft_transcenDANCE!' },
      { tag: 'p', content: 'Thank you for playing ft_transcenDANCE!' }
    ];

    elements.forEach(element => {
      const el = document.createElement(element.tag);
      el.innerHTML = element.content;
      container.appendChild(el);
    });

    return container;
  }
}
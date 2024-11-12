
// Render footer
export const renderFooter = async() => {
  const app = document.querySelector('#app');
  const footer = document.createElement('div');
  footer.classList.add('footer');

  // Set the footer height to match the navbar height
  footer.style.height = 'var(--nav-height)';
  footer.style.backgroundColor = '#222222';
  footer.style.color = '#eeeeee';
  footer.style.display = 'flex';
  footer.style.justifyContent = 'center';
  footer.style.alignItems = 'center';
  footer.style.fontSize = '0.5rem';
  footer.textContent = 'ft_transcendence';

  // Append the footer to the DOM
  app.appendChild(footer);
};
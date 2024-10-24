document.addEventListener('DOMContentLoaded', function() {
    // Add event listener to logout button
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', function(event) {
            event.preventDefault();
            handleLogout();
        });
    }
});

// Function to handle logout
async function handleLogout() {
    try {
        // Make a request to the server to log out
        const response = await fetch('/logout/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken') // Ensure you include the CSRF token
            }
        });

        if (response.ok) {
            // Clear authentication tokens or session data
            document.cookie = 'csrftoken=; Max-Age=0; path=/;'; // Clear CSRF token cookie
            localStorage.removeItem('authToken'); // Remove any auth token stored in localStorage
            sessionStorage.clear(); // Clear sessionStorage

            // Update the navbar to show "Register" and "Login" links
            updateNavbarForLoggedOutUser();

            // Show logout message
            showPopupMessage('You have been logged out.', 'success');
        } else {
            console.error('Logout failed:', response.statusText);
            showPopupMessage('Logout failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showPopupMessage('An error occurred. Please try again.', 'error');
    }
}

// Function to update the navbar for a logged-out user
function updateNavbarForLoggedOutUser() {
    // const navbar = document.querySelector('nav');
    const chatDropdown = document.getElementById('chatDropdown');
    const profileDropdown = document.getElementById('profileDropdown');
    const logoutButton = document.getElementById('logoutButton');
    const loginButton = document.getElementById('loginButton');
    const registerButton = document.getElementById('registerButton');

	if (chatDropdown) chatDropdown.style.display = 'none';
    if (profileDropdown) profileDropdown.style.display = 'none';
    if (logoutButton) logoutButton.style.display = 'none';
    if (loginButton) loginButton.style.display = 'inline';
    if (registerButton) registerButton.style.display = 'inline';
}

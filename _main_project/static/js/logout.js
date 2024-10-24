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

document.addEventListener('DOMContentLoaded', function() {
    // Function to get CSRF token from cookies
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    const csrftoken = getCookie('csrftoken');

    // Function to update the UI based on authentication status
    function updateUI(authenticated, userData = null) {
        const chatDropdown = document.getElementById('chatDropdown');
        const profileDropdown = document.getElementById('profileDropdown');
        const logoutButton = document.getElementById('logoutButton');
        const loginButton = document.getElementById('loginButton');
        const registerButton = document.getElementById('registerButton');
        const loginFormContainer = document.getElementById('loginFormContainer');
        const registerFormContainer = document.getElementById('registerFormContainer');

        if (authenticated) {
            if (chatDropdown) chatDropdown.style.display = 'block';
            if (profileDropdown) profileDropdown.style.display = 'block';
            if (logoutButton) logoutButton.style.display = 'block';
            if (loginButton) loginButton.style.display = 'none';
            if (registerButton) registerButton.style.display = 'none';
            if (loginFormContainer) loginFormContainer.style.display = 'none';
            if (registerFormContainer) registerFormContainer.style.display = 'none';

            // Update profile image and username if available
            if (userData) {
                const profileImage = document.getElementById('profileImage');
                const usernameDisplay = document.getElementById('usernameDisplay');
                if (profileImage) profileImage.src = userData.profile_image_url;
                if (usernameDisplay) usernameDisplay.textContent = userData.username;
            }
        } else {
            if (chatDropdown) chatDropdown.style.display = 'none';
            if (profileDropdown) profileDropdown.style.display = 'none';
            if (logoutButton) logoutButton.style.display = 'none';
            if (loginButton) loginButton.style.display = 'block';
            if (registerButton) registerButton.style.display = 'block';
        }
    }

	// Function to check authentication status
		// Function to check authentication status
	function checkAuthStatus() {
		fetch('/logged_in_user/')
			.then(response => {
				if (!response.ok) {
					// Log the response text for debugging
					return response.text().then(text => {
						console.error('Error response text:', text);
						throw new Error('Network response was not ok');
					});
				}
				return response.text().then(text => {
					try {
						return JSON.parse(text);
					} catch (error) {
						console.error('Error parsing JSON:', text);
						throw error;
					}
				});
			})
			.then(data => {
				if (data.username) {
					updateUI(true, data);
				} else {
					updateUI(false);
				}
			})
			.catch(error => {
				console.error('Error:', error);
				updateUI(false);
			});
	}

    // Function to check authentication status
    // function checkAuthStatus() {
    //     fetch('/logged_in_user/')
    //         .then(response => response.json())
    //         .then(data => {
    //             if (data.username) {
    //                 updateUI(true, data);
    //             } else {
    //                 updateUI(false);
    //             }
    //         })
    //         .catch(error => {
    //             console.error('Error:', error);
    //             updateUI(false);
    //         });
    // }


    // Event listener for login
    const loginButton = document.getElementById('loginButton');
    if (loginButton) {
        loginButton.addEventListener('click', function(event) {
            event.preventDefault();
            const loginFormContainer = document.getElementById('loginFormContainer');
            const registerFormContainer = document.getElementById('registerFormContainer');
            if (loginFormContainer) loginFormContainer.style.display = 'block';
            if (registerFormContainer) registerFormContainer.style.display = 'none';
        });
    }

	// Add the event listener for the login form submission
	const loginForm = document.getElementById('loginForm');
	if (loginForm) {
		loginForm.addEventListener('submit', handleLoginFormSubmission);
	}


    // Function to handle login form submission
    function handleLoginFormSubmission(event) {
        event.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        fetch('/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify({ email, password }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.username) {
                    updateUI(true, data);
                } else {
                    const loginErrorMessages = document.getElementById('loginErrorMessages');
                    loginErrorMessages.textContent = 'Login failed: ' + (data.errors || 'Unknown error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                const loginErrorMessages = document.getElementById('loginErrorMessages');
                loginErrorMessages.textContent = 'Login failed: ' + error.message;
            });
    }


    // Event listener for registration
    const registerButton = document.getElementById('registerButton');
    if (registerButton) {
        registerButton.addEventListener('click', function(event) {
            event.preventDefault();
            const loginFormContainer = document.getElementById('loginFormContainer');
            const registerFormContainer = document.getElementById('registerFormContainer');
            if (loginFormContainer) loginFormContainer.style.display = 'none';
            if (registerFormContainer) registerFormContainer.style.display = 'block';
        });
    }

    // Event listener for register form submission
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const username = document.getElementById('username').value;
            const password1 = document.getElementById('password1').value;
            const password2 = document.getElementById('password2').value;

            fetch('/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                },
                body: JSON.stringify({ email, username, password1, password2 }),
            })
                .then(response => response.json())
                .then(data => {
                    if (data.username) {
                        updateUI(true, data);
                    } else {
                        const errorMessages = document.getElementById('errorMessages');
                        errorMessages.textContent = 'Registration failed: ' + (data.error || 'Unknown error');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    const errorMessages = document.getElementById('errorMessages');
                    errorMessages.textContent = 'Registration failed: ' + error.message;
                });
        });
    }

    // Event listener for logout
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', function(event) {
            event.preventDefault();

            fetch('/logout/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrftoken,
                },
            })
                .then(response => {
                    if (response.status === 204) {
                        updateUI(false);
                    } else {
                        console.error('Logout failed');
                    }
                })
                .catch(error => console.error('Error:', error));
        });
    }

    // Initial check for authentication status
    checkAuthStatus();
});

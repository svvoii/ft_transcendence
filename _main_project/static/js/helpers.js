
document.addEventListener('DOMContentLoaded', function() {

    // Add event listener to login button
    const loginButton = document.getElementById('loginButton');
    const loginFormContainer = document.getElementById('loginFormContainer');
    if (loginButton) {
        loginButton.addEventListener('click', function(event) {
			event.preventDefault();
			showLoginForm();
		});
	} else {
        console.log('Login button not found');
    }

    // Add event listener to register button
    const registerButton = document.getElementById('registerButton');
    const registerFormContainer = document.getElementById('registerFormContainer');
    if (registerButton) {
        registerButton.addEventListener('click', renderRegisterForm);
    } else {
        console.log('Register button not found');
    }

    // Add event listener to logout button
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', function(event) {
            event.preventDefault();
            handleLogout();
        });
    } else {
		console.log('Logout button not found');
	}
});


// Function to update the navbar for a logged-in user
function updateNavbarForLoggedInUser(username, profileImageUrl) {

    const chatDropdown = document.getElementById('chatDropdown');
    const profileDropdown = document.getElementById('profileDropdown');
    const logoutButton = document.getElementById('logoutButton');
    const loginButton = document.getElementById('loginButton');
    const registerButton = document.getElementById('registerButton');

    if (chatDropdown) chatDropdown.style.display = 'block';
    if (profileDropdown) {
        profileDropdown.style.display = 'block';
        profileDropdown.querySelector('img').src = profileImageUrl;
        profileDropdown.querySelector('button').innerHTML = `(${username})`;
    }
    if (logoutButton) logoutButton.style.display = 'inline';
    if (loginButton) loginButton.style.display = 'none';
    if (registerButton) registerButton.style.display = 'none';
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

// Function to show a pop-up message
function showPopupMessage(message, type) {
	const popup = document.createElement('div');
	popup.className = `popup-message ${type}`;
	popup.innerHTML = `
		<div class="popup-content">
			<span class="close-popup">&times;</span>
			<p>${message}</p>
		</div>
	`;
	document.body.appendChild(popup);

	popup.querySelector('.close-popup').addEventListener('click', function() {
		popup.remove();
	});

	setTimeout(function() {
		popup.remove();
	}, 50000);
}

// CSS style for popup message
const style = document.createElement('style');
style.innerHTML = `
	.popup-message {
        position: fixed;
        top: 20%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: white;
        border: 1px solid #ccc;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        padding: 20px;
        border-radius: 5px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .popup-message.success {
        border-color: green;
        color: green;
    }
    .popup-message.error {
        border-color: red;
        color: red;
    }
    .popup-message.info {
        border-color: blue;
        color: blue;
    }
    .popup-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .close-popup {
        cursor: pointer;
        font-size: 20px;
        font-weight: bold;
    }
`;
document.head.appendChild(style);

// Helper function to get CSRF token
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

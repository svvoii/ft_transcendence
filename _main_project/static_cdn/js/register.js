document.addEventListener('DOMContentLoaded', function() {
    const registerButton = document.getElementById('registerButton');
    const registerFormContainer = document.getElementById('registerFormContainer');

    if (registerButton) {
        registerButton.addEventListener('click', function() {
            registerFormContainer.innerHTML = `
                <form id="registerForm">
                    <input type="email" id="email" placeholder="Email" required /><br>
                    <input type="text" id="username" placeholder="Username" required /><br>
                    <input type="password" id="password1" placeholder="Password" required /><br>
                    <input type="password" id="password2" placeholder="Confirm Password" required /><br>
                    <input type="hidden" name="csrfmiddlewaretoken" value="${getCookie('csrftoken')}" />
                    <button type="submit">Register</button>
                </form>
                <div id="errorMessages"></div>
            `;

            const registerForm = document.getElementById('registerForm');
            const errorMessages = document.getElementById('errorMessages');

            registerForm.addEventListener('submit', async (event) => {
                event.preventDefault();

                const email = document.getElementById('email').value;
                const username = document.getElementById('username').value;
                const password1 = document.getElementById('password1').value;
                const password2 = document.getElementById('password2').value;
                const csrfToken = document.querySelector('input[name="csrfmiddlewaretoken"]').value;

                try {
                    const response = await fetch('/api/register/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': csrfToken
                        },
                        body: JSON.stringify({ email, username, password1, password2 })
                    });

                    const data = await response.json();

                    if (response.ok) {
                        // window.location.href = data.redirect_url;
						window.history.pushState({}, '', data.redirect_url);

						// Hiding the form
						// registerForm.style.display = 'none';
						registerFormContainer.innerHTML = '';

						const successMessage = document.createElement('div');
						successMessage.innerHTML = '<p>Registration successful...</p>';
						registerFormContainer.appendChild(successMessage);

						// Updating with new content can be done here

						updateNavbar(username, data.profile_image);
                    } else {
                        errorMessages.innerHTML = JSON.stringify(data.error);
                    }
                } catch (error) {
                    console.error('Error:', error);
                    errorMessages.innerHTML = 'An error occurred. Please try again.';
                }
            });
        });
    } else {
        console.log('Register button not found');
    }
});

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

// Helper function to update the navbar
function updateNavbar(username, profileImageUrl) {
	
	const navbar = document.querySelector('nav');

	// Profile dropdown
	const profileDropdown = `
		<div x-data="{ dropdownOpen: false }" class="">
            <a href="#" @click="dropdownOpen = !dropdownOpen" @click.away="dropdownOpen = false" title="PROFILE">
                <img src="${profileImageUrl}" alt="LOGO" width="40" height="40">
                </br>(${username})
            </a>
            <div x-show="dropdownOpen" x-cloak class=""
                x-transition:enter="duration-300 ease-out"
                x-transition:enter-start="opacity-0 -translate-y-5 scale-90"
                x-transition:enter-end="opacity-100 translate-y-0 scale-100"
            >
                <ul class="">
                    <li><a href="/profile/${username}" title="PROFILE"> 
                        My profile (${username})
                    </a></li>
                    <li><a href="/edit-profile/${username}">Edit Profile</a></li>
                    <li><a href="/password_change/">Change password</a></li>
                </ul>
            </div>
        </div>
        <a href="/logout/" title="LOGOUT"> <span class="material-symbols-outlined">logout</span>Logout</a>
    `;

	const registerLink = document.getElementById('registerButton');
	const loginLink = document.querySelector('a[title="LOGIN"]');
	if (registerLink) registerLink.remove();
	if (loginLink) loginLink.remove();

	navbar.insertAdjacentHTML('beforeend', profileDropdown);
}

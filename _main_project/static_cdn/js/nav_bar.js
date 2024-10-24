document.addEventListener('DOMContentLoaded', function() {
    const registerButton = document.getElementById('registerButton');
    const registerFormContainer = document.getElementById('registerFormContainer');

    if (registerButton) {
        registerButton.addEventListener('click', renderRegisterForm);
    } else {
        console.log('Register button not found');
    }

    // Add event listener to logout link
    document.addEventListener('click', function(event) {
        if (event.target.matches('a[title="LOGOUT"]')) {
            event.preventDefault();
            handleLogout();
        }
    });
});

// Function to render the registration form
function renderRegisterForm() {
    const registerFormContainer = document.getElementById('registerFormContainer');
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
    registerForm.addEventListener('submit', handleFormSubmission);
}

// Function to handle form submission
async function handleFormSubmission(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const username = document.getElementById('username').value;
    const password1 = document.getElementById('password1').value;
    const password2 = document.getElementById('password2').value;
    const csrfToken = document.querySelector('input[name="csrfmiddlewaretoken"]').value;
    const errorMessages = document.getElementById('errorMessages');

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
            // Use pushState to change the URL without reloading the page
            window.history.pushState({}, '', data.redirect_url);

            // Hide or remove the registration form
            const registerFormContainer = document.getElementById('registerFormContainer');
            registerFormContainer.innerHTML = '';

            // Display a success message
            const successMessage = document.createElement('div');
            successMessage.innerHTML = '<p>Registration successful. You are now logged in.</p>';
            registerFormContainer.appendChild(successMessage);

            // Update the navbar
            updateNavbar(data.username, data.profile_image_url);
        } else {
            errorMessages.innerHTML = JSON.stringify(data.error);
        }
    } catch (error) {
        console.error('Error:', error);
        errorMessages.innerHTML = 'An error occurred. Please try again.';
    }
}

// Function to update the navbar
function updateNavbar(username, profileImageUrl) {
    const navbar = document.querySelector('nav'); // Adjust the selector to match your navbar
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

    // Remove the "Register" and "Login" links
    const registerLink = document.getElementById('registerButton');
    const loginLink = document.querySelector('a[title="LOGIN"]');
    if (registerLink) registerLink.remove();
    if (loginLink) loginLink.remove();

    // Insert the profile dropdown HTML into the navbar
    navbar.insertAdjacentHTML('beforeend', profileDropdown);
}

// Function to handle logout
async function handleLogout() {
    try {
        const csrfToken = getCookie('csrftoken');
        const response = await fetch('/logout/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            }
        });

        if (response.ok) {
            // Update the navbar to show "Register" and "Login" links
            const navbar = document.querySelector('nav');
            const profileDropdown = navbar.querySelector('div[x-data]');
            const logoutLink = navbar.querySelector('a[title="LOGOUT"]');
            if (profileDropdown) profileDropdown.remove();
            if (logoutLink) logoutLink.remove();

            // Add "Register" and "Login" links
            navbar.insertAdjacentHTML('beforeend', `
                <a href="{% url 'login' %}" title="LOGIN"> <span class="material-symbols-outlined">login</span>Login</a>
                <a href="" title="REGISTER" id="registerButton"> <span class="material-symbols-outlined">person_add</span>Register</a>
            `);

            // Re-attach the event listener to the new "Register" button
            const newRegisterButton = document.getElementById('registerButton');
            if (newRegisterButton) {
                newRegisterButton.addEventListener('click', renderRegisterForm);
            }
        } else {
            console.error('Logout failed');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

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

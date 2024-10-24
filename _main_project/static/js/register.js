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
        const response = await fetch('/register/', {
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
			showPopupMessage('Registration successful. You are now logged in.', 'success');

            // Update the navbar
			updateNavbarForLoggedInUser(data.username, data.profile_image_url);
        } else {
            errorMessages.innerHTML = JSON.stringify(data.error);
        }
    } catch (error) {
        console.error('Error:', error);
        errorMessages.innerHTML = 'An error occurred. Please try again.';
    }
}

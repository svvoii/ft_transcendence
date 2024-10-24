// Function to show login form
function showLoginForm() {
	const loginFormContainer = document.getElementById('loginFormContainer');
	loginFormContainer.innerHTML = `
		<form id="loginForm">
			<input type="email" id="loginEmail" placeholder="Email" required /><br>
			<input type="password" id="loginPassword" placeholder="Password" required /><br>
			<input type="hidden" name="csrfmiddlewaretoken" value="${getCookie('csrftoken')}" />
			<button type="submit">Login</button>
		</form>
		<div id="loginErrorMessages"></div>
	`;

    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', handleLoginFormSubmission);
}

// // Function to handle login form submission
// async function handleLoginFormSubmission(event) {
//     event.preventDefault();

//     const email = document.getElementById('loginEmail').value;
//     const password = document.getElementById('loginPassword').value;
//     const csrfToken = document.querySelector('input[name="csrfmiddlewaretoken"]').value;
//     const errorMessages = document.getElementById('loginErrorMessages');

//     try {
//         const response = await fetch('/login/', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'X-CSRFToken': csrfToken
//             },
//             body: JSON.stringify({ email, password })
//         });

//         const data = await response.json();

//         if (response.ok) {

//             window.history.pushState({}, '', data.redirect_url);

//             const loginFormContainer = document.getElementById('loginFormContainer');
//             loginFormContainer.innerHTML = '';

//             showPopupMessage('Login successful.', 'success');

//             updateNavbarForLoggedInUser(data.username, data.profile_image_url);
//         } else {
//             errorMessages.innerHTML = JSON.stringify(data.errors);
//         }
//     } catch (error) {
//         console.error('Error:', error);
//         errorMessages.innerHTML = 'An error occurred. Please try again.';
//     }
// }

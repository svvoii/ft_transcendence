console.log('register.js loaded');

document.addEventListener('DOMContentLoaded', function() {
    const registerButton = document.getElementById('registerButton');
    const registerFormContainer = document.getElementById('registerFormContainer');

    if (registerButton) {
        console.log('Register button found');
        registerButton.addEventListener('click', function() {
            console.log('Register button clicked');
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
                        window.location.href = data.redirect_url;
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
// console.log('register.js loaded');

// document.addEventListener('DOMContentLoaded', function() {
//     const registerButton = document.getElementById('registerButton');
//     const registerFormContainer = document.getElementById('registerFormContainer');

//     registerButton.addEventListener('click', function() {
//         registerFormContainer.innerHTML = `
//             <form id="registerForm">
//                 <input type="email" id="email" placeholder="Email" required />
//                 <input type="text" id="username" placeholder="Username" required />
//                 <input type="password" id="password1" placeholder="Password" required />
//                 <input type="password" id="password2" placeholder="Confirm Password" required />
//                 <input type="hidden" name="csrfmiddlewaretoken" value="${getCookie('csrftoken')}" />
//                 <button type="submit">Register</button>
//             </form>
//             <div id="errorMessages"></div>
//         `;

//         const registerForm = document.getElementById('registerForm');
//         const errorMessages = document.getElementById('errorMessages');

//         registerForm.addEventListener('submit', async (event) => {
//             event.preventDefault();

//             const email = document.getElementById('email').value;
//             const username = document.getElementById('username').value;
//             const password1 = document.getElementById('password1').value;
//             const password2 = document.getElementById('password2').value;
//             const csrfToken = document.querySelector('input[name="csrfmiddlewaretoken"]').value;

//             try {
//                 const response = await fetch('/api/register/', {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'X-CSRFToken': csrfToken
//                     },
//                     body: JSON.stringify({ email, username, password1, password2 })
//                 });

//                 const data = await response.json();

//                 if (response.ok) {
//                     window.location.href = data.redirect_url;
//                 } else {
//                     errorMessages.innerHTML = JSON.stringify(data.error);
//                 }
//             } catch (error) {
//                 console.error('Error:', error);
//                 errorMessages.innerHTML = 'An error occurred. Please try again.';
//             }
//         });
//     });
// });

// // Helper function to get CSRF token
// function getCookie(name) {
//     let cookieValue = null;
//     if (document.cookie && document.cookie !== '') {
//         const cookies = document.cookie.split(';');
//         for (let i = 0; cookies.length; i++) {
//             const cookie = cookies[i].trim();
//             if (cookie.substring(0, name.length + 1) === (name + '=')) {
//                 cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
//                 break;
//             }
//         }
//     }
//     return cookieValue;
// }

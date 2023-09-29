/* Landing Page JavaScript */

"use strict";


const loginForm = document.querySelector("#login");

loginForm.onsubmit = function (event) {
    // Prevent the form from refreshing the page,
    // as it will do by default when the Submit event is triggered:
    event.preventDefault();

    // We can use loginForm.username (for example) to access
    // the input element in the form which has the ID of "username".
    const loginData = {
        username: loginForm.username.value,
        password: loginForm.password.value,
    }

    // // Disables the button after the form has been submitted already:
    // loginForm.loginButton.disabled = true;

    // Time to actually process the login using the function from auth.js!
    login(loginData)
        .then(response => response.json())
        .then(data => {
            const accessToken = loginData.accessToken;
            const user = loginData.user;

            storeAccessToken(accessToken);
            storeUserData(user);

            console.log(data);
        });
};


//Canvas Code//
const canvas = document.getElementById('art-area');
const context = canvas.getContext('2d');

// Set canvas size to match its container
canvas.width = 560;
canvas.height = 300;

const colors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#8b00ff'];
let currentColorIndex = 0;

canvas.addEventListener('mousemove', drawRainbowLine);

// Add a variable to store the previous mouse position
let prevX;
let prevY;

function drawRainbowLine(event) {
    const x = event.clientX - canvas.getBoundingClientRect().left;
    const y = event.clientY - canvas.getBoundingClientRect().top;

    // Create a gradient for the stroke style
    const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#ff0000'); // Red
    gradient.addColorStop(0.17, '#ff7f00'); // Orange
    gradient.addColorStop(0.33, '#ffff00'); // Yellow
    gradient.addColorStop(0.5, '#00ff00'); // Green
    gradient.addColorStop(0.67, '#0000ff'); // Blue
    gradient.addColorStop(0.83, '#4b0082'); // Indigo
    gradient.addColorStop(1, '#8b00ff'); // Violet

    // Check if the target element of the mouse event is the canvas
    if (event.target === canvas) {
        context.beginPath();
        context.strokeStyle = gradient;
        context.lineWidth = 5;
        context.lineJoin = 'round';

        if (prevX !== undefined && prevY !== undefined) {
            // Draw a line from the previous position to the current position
            context.moveTo(prevX, prevY);
            context.lineTo(x, y);
        }

        context.stroke();
        context.closePath();

        // Update the previous position
        prevX = x;
        prevY = y;

        currentColorIndex = (currentColorIndex + 1) % colors.length;
    }
}

const refreshButton = document.getElementById('refresh');

refreshButton.addEventListener('click', function() {
    // Reload the current page
    location.reload();
});

// Front-end JavaScript

const CLIENT_ID = encodeURIComponent(process.env.CLIENT_ID);
const REDIRECT_URI = encodeURIComponent('http://localhost:3000/pocket-callback'); // Match this with your redirect_uri

const signInButton = document.getElementById('pocket-sign-in');

signInButton.addEventListener('click', () => {
  const authorizationUrl = `https://getpocket.com/v3/oauth/authorize?consumer_key=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=7&scope=simple`;
  window.location.href = authorizationUrl;
});

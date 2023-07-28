"use strict";

const logoutButton = document.querySelector("#logout");
const profileContainer = document.querySelector("#profileContainer");
const dataContainer = document.querySelector("#userDataContainer");
const bioDisplay = document.querySelector("#bioDisplay");
const saveBioButton = document.querySelector("#saveBio");
const bioTextarea = document.querySelector("#biotext");

logoutButton.onclick = logout;
saveBioButton.onclick = saveBio;

function convertDateTime(apiDateTime) {
  const date = new Date(apiDateTime);
  const formattedDateTime = date.toLocaleString();
  return formattedDateTime;
}

//Display Your Posts
function profileFetch() {
  const loginData = getLoginData();
  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${loginData.token}`,
    },
  };

  fetch(apiBaseURL + "/api/posts?username=" + loginData.username, options)
    .then((response) => response.json())
    .then((userProfiles) => {
      userProfiles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      let postHTML = "";

      userProfiles.forEach((userProfile) => {
        postHTML += `
        <div class="card text-center" id="cards" data-post-id="${userProfile._id}">
          <div class="card-header">
          <span class="deleteButton"><button class="btn btn-outline-danger" id="${userProfile._id}" onclick="deletePost('${userProfile._id}')">Χ</button></span>
              <b>@${userProfile.username}</b>
          </div>
          <div class="card-body">
              <p class="card-text">${userProfile.text}</p>
          </div><br>
          <div class="card-footer text-muted">
              ${convertDateTime(userProfile.createdAt)}
          </div>
        </div>`;
      });
    profileContainer.innerHTML = postHTML;
    })
      .catch((error) => {
        console.error(error);
      });
}


//Display User Info
function displayUserData() {

  const loginData = getLoginData();
  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${loginData.token}`,
    },
  };

  fetch(apiBaseURL + "/api/users/" + loginData.username, options)
    .then(response => response.json())
    .then(userData => {
        
        const data = `
        <h4> <b>${userData.fullName}</b></h4>
        <div class = "username">@${userData.username}</div>`;
        dataContainer.innerHTML = data;

        const bio = `${userData.bio}`;
        bioDisplay.textContent = bio || "No bio yet!";
      })
      .catch(error => {
        console.error(error);
      });
    }

//Update User Bio
function updateBio() {
  const loginData = getLoginData();
  const newBio = bioTextarea.value;
  const options = {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${loginData.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({bio: newBio}),
  };

  fetch(apiBaseURL + "/api/users/" + loginData.username, options)
    .then(response => {
      displayUserData();
    })
    .catch(error => {
      console.error(error);
    });
}

function saveBio() {
  if (!bioDisplay || !bioTextarea || !saveBioButton) {
    return; // Elements not found, exit the function
  }

  bioDisplay.textContent = bioTextarea.value;
  bioDisplay.style.display = "block";
  bioTextarea.style.display = "none";
  saveBioButton.style.display = "none";
  updateBio();
}


window.onload = main;

function main() {
  profileFetch();
  displayUserData();
}

//DELETE POSTS
function deletePost(postId) {
    const loginData = getLoginData();
    const options = {
      method: "DELETE",
      headers: {
      Authorization: `Bearer ${loginData.token}`,
      "Content-Type": "application/json",
    },
  };

    fetch(apiBaseURL + "/api/posts/" + postId, options)
    .then((response) => response.json())
    .then((data) => {
      window.location.reload()
    });
}

// SETTINGS modal
const openSettingsModalButton = document.getElementById('openSettingsModalButton');
const settingsModal = document.getElementById('settingsModal');
const closeModalButton = document.getElementsByClassName('close')[0];

// Function to open the modal
function openSettingsModal() {
  settingsModal.style.display = 'block';
}

// Function to close the modal
function closeModal() {
  settingsModal.style.display = 'none';
  skillsModal.style.display = 'none';
}

// Event listeners
openSettingsModalButton.addEventListener('click', openSettingsModal);
closeModalButton.addEventListener('click', closeModal);



// SKILLS modal
const openSkillsModalButton = document.getElementById('openSkillsModalButton');
const skillsModal = document.getElementById('skillsModal');
const closeSkillsModalButton = document.getElementsByClassName('close')[0];

// Function to open the modal
function openSkillsModal() {
  skillsModal.style.display = 'block';
}

// Function to close the modal
function closeSkillsModal() {
  skillsModal.style.display = 'none';
}

// Event listeners
openSkillsModalButton.addEventListener('click', openSkillsModal);
closeSkillsModalButton.addEventListener('click', closeSkillsModal);
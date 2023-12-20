"use strict";

const logoutButton = document.querySelector("#logout");

const userAvatarContainer = document.querySelector('#userAvatarContainer');
const userProfileImgContainer = document.querySelector('#userProfileImg');
const defaultAvatar = document.querySelector('#defaultAvatar');
const defaultProfileImg = document.querySelector('#defaultProfileImg');
const editAvatarBtnDiv = document.querySelector('#edit-avatar-buttons');
const saveAvatarBtnDiv = document.querySelector('#save-avatar-div');
const saveAvatarButton = document.querySelector('#saveUpdate');
const cancelNewAvatarButton = document.querySelector('#cancel');
const deleteAvatarButton = document.querySelector('#deleteAvatar');
const addAvatarButton = document.querySelector('#addAvatar');
const avatarSelector = document.querySelector('#avatarSelector');
const avatarUpload = document.querySelector('#avatarUpload');
const settingsBioContainer = document.querySelector('#settings-bio-container');


logoutButton.onclick = logout;

function convertDateTime(apiDateTime) {
  const date = new Date(apiDateTime);
  const formattedDateTime = date.toLocaleString();
  return formattedDateTime;
}

//Display Your Posts
const profileContainer = document.querySelector("#profileContainer");

function profileFetch() {
  const response = getresponse();
  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${response.token}`,
    },
  };

  fetch(apiBaseURL + `/api/posts/${response.user.username}`, options)
    .then((response) => response.json())
    .then((userProfiles) => {

      console.log(userProfiles);

      profileContainer.innerHTML = "";

      userProfiles.posts.forEach(profile => {
        const postHTML = `
        <div class="card text-center" id="cards" data-post-id="${profile.post_id}">
          <div class="card-header">
            <div class="left-header">
              <div class="user-thumbnail"><img src="${profile.avatar}"></div>
              <div class="username"><b>@${profile.username}</b></div>
            </div>  
            <span class="deleteButton"><button class="btn btn-outline-danger" id="${profile.post_id}" onclick="deletePost('${profile.post_id}')"><img src="../images/trash.jpg" class="nav-icons"></button></span>
          </div>
          <div class="card-body">
              <p class="card-text">${profile.content}</p>
          </div><br>
          <div class="card-footer text-muted">
              ${profile.created_at}
          </div>
        </div>`;

        profileContainer.innerHTML += postHTML;

      });
    })
      .catch((error) => {
        console.error(error);
      });
};

//Display Your Events
const eventsContainer = document.querySelector("#eventContainer");

function fetchEvents() {
  const response = getresponse();
  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${response.token}`,
    },
  };

  fetch(apiBaseURL + `/api/events/${response.user.username}`, options)
    .then((response) => response.json())
    .then((userProfiles) => {

      console.log(userProfiles);

      profileContainer.innerHTML = "";

      userProfiles.posts.forEach(profile => {
        const postHTML = `
        <div class="card text-center" id="cards" data-post-id="${profile.post_id}">
          <div class="card-header">
            <div class="left-header">
              <div class="user-thumbnail"><img src="${profile.avatar}"></div>
              <div class="username"><b>@${profile.username}</b></div>
            </div>  
            <span class="deleteButton"><button class="btn btn-outline-danger" id="${profile.post_id}" onclick="deletePost('${profile.post_id}')">Χ</button></span>
          </div>
          <div class="card-body">
              <p class="card-text">${profile.content}</p>
          </div><br>
          <div class="card-footer text-muted">
              ${profile.created_at}
          </div>
        </div>`;

        profileContainer.innerHTML += postHTML;

      });
    })
      .catch((error) => {
        console.error(error);
      });
};

//Display User Info
const dataContainer = document.querySelector("#userDataContainer");
const bioDisplay = document.querySelector("#bioDisplay");
const usernameContainer = document.querySelector("#username-container");
const emailContainer = document.querySelector("#email-container");
const passwordContainer = document.querySelector("#password-container");
const fullNameContainer = document.querySelector("#full-name-container");
const locationContainer = document.querySelector("#location-container");

function displayUserInfo() {

  const response = getresponse();

  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${response.token}`,
    },
  };

  const userData = response.user;

  fetch(apiBaseURL + `/api/users/${userData.user_id}`, options)
    .then(response => response.json())
    .then(response => {

      console.log(userData);
        
        const data = `
        <h4> <b>${userData.full_name}</b></h4>
        <div class = "username">@${userData.username}</div><br>
        <div class="location"><img class="nav-icons" src="../images/location-icon.png">${userData.city}, ${userData.state}</div>`;
        dataContainer.innerHTML = data;

        const bio = `${userData.bio}`;
        bioDisplay.textContent = bio || "No bio yet!";
        settingsBioContainer.textContent = bio || "No bio yet!"

        const fullName = `${userData.full_name}`;
        fullNameContainer.textContent = fullName || "Working on it.";

        const email = `${userData.email}`;
        emailContainer.textContent = email;

        const username = `${userData.username}`;
        usernameContainer.textContent = username;

        const location = `${userData.city}, ${userData.state}`;
        locationContainer.textContent = location;

        const avatar = `<img src = "${userData.avatar}">`;
        if (userData.avatar) {
          defaultAvatar.style.display = "none";
          defaultProfileImg.style.display = "none";

          userAvatarContainer.innerHTML = avatar;
          userProfileImgContainer.innerHTML = avatar;
  
        } else {
          defaultAvatar.style.display = "flex";
          defaultProfileImg.style.display = "flex";
          
          userAvatarContainer.style.display = "none";
          userProfileImgContainer.style.display = "none";
        }
      })
      .catch(error => {
        console.error("Error:", error);
      });
    };

//Toggle Avatar Edit Buttons
function openNewAvatarSelector() {
  userAvatarContainer.style.display = "none";
  defaultAvatar.style.display = "none";
  defaultProfileImg.style.display = "none";
  avatarSelector.style.display = "block";
  editAvatarBtnDiv.style.display = "none";
  saveAvatarBtnDiv.style.display = "flex";
}
addAvatarButton.addEventListener('click', openNewAvatarSelector);

function closeNewAvatarSelector() {
  userAvatarContainer.style.display = "flex";
  defaultAvatar.style.display = "flex";
  avatarSelector.style.display = "none";
  editAvatarBtnDiv.style.display = 'flex';
  saveAvatarBtnDiv.style.display = 'none';
}
cancelNewAvatarButton.addEventListener('click', closeNewAvatarSelector);

let deleteAvatarButtonClicked = false;

//Update User Info
function updateUserInfo() {
  const response = getresponse();
  const userId = response.user.idUsers;

console.log(response);

  const newUsername = usernameContainer.value;
  const newPassword = passwordContainer.value;
  const newEmail = emailContainer.value;
  const newBio = bioTextarea.value;
  const newAvatar =  avatarUpload || null;

  const updates = { username: newUsername, password: newPassword, email: newEmail, bio: newBio, avatar: newAvatar };
  
  const options = {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${response.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify( { userId, updates }),
  };

  if (deleteAvatarButtonClicked) {
    options.method = "DELETE";
  

  fetch(apiBaseURL + `/api/users/${userId}/avatar`, options)
    .then(response => response.json())
    .then(data => {
      displayresponse();
      console.log(data);
    })
    .catch(error => {
      console.error(error);
    });

deleteAvatarButtonClicked = false; // Reset the flag
  
} else {
    // If not deleting the avatar, send a PUT request
    fetch(apiBaseURL + `/api/users/${userId}/profile`, options)
      .then(response => response.json())
      .then(data => {
        displayresponse();
        console.log(data);
      })
      .catch(error => {
        console.error(error);
      });
  }
}

saveAvatarButton.addEventListener('click', function () {
  deleteAvatarButtonClicked = false;
  updateUserInfo();
})

deleteAvatarButton.addEventListener('click', function () {
  deleteAvatarButtonClicked = true;
  updateUserInfo();
});


window.onload = main;

function main() {
  profileFetch();
  displayUserInfo();
}

//DELETE POSTS
function deletePost(postId) {
    const response = getresponse();
    const options = {
      method: "DELETE",
      headers: {
      Authorization: `Bearer ${response.token}`,
      "Content-Type": "application/json",
    },
  };

    fetch(apiBaseURL + `/api/posts/${postId}`, options)
    .then((response) => response.json())
    .then((data) => {
      window.location.reload()
    });
}

//AVATAR MODAL
const openAvatarModalButton = document.getElementById('openAvatarModalButton');
const avatarModal = document.getElementById('avatarModal');
const closeAvatarModalButton = document.getElementById('close-avatar');

function openAvatarModal() {
  avatarModal.style.display = 'block';
}

function closeAvatarModal() {
  avatarModal.style.display = 'none';
}

openAvatarModalButton.addEventListener('click', openAvatarModal);
closeAvatarModalButton.addEventListener('click', closeAvatarModal);



// SETTINGS modal
const openSettingsModalButton = document.getElementById('openSettingsModalButton');
const settingsModal = document.getElementById('settingsModal');
const closeModalButton = document.getElementById('close-settings');

// Function to open the modal
function openSettingsModal() {
  settingsModal.style.display = 'block';
}

// Function to close the modal
function closeModal() {
  settingsModal.style.display = 'none';
}

// Event listeners
openSettingsModalButton.addEventListener('click', openSettingsModal);
closeModalButton.addEventListener('click', closeModal);



// SKILLS modal
const openSkillsModalButton = document.getElementById('openSkillsModalButton');
const skillsModal = document.getElementById('skillsModal');
const closeSkillsModalButton = document.getElementById('close-skills');

const searchModal = document.getElementById('searchModal');
const searchForm = document.querySelector("#searchForm");
const searchQueryInput = document.querySelector("#searchQuery");
const searchResultsContainer = document.querySelector("#searchResults");

const showAllSkillsButton = document.querySelector("#showAllSkills");
const skillDisplayContainer = document.querySelector("#skillsDisplay");

const requestForm = document.querySelector('#requestForm');
const skillRequestDiv = document.querySelector("#request-skill-div");
const skillRequestButton = document.querySelector("#requestSkill");
const receivedSubmission = document.querySelector("#received-submission");



// Function to open the modal
function openSkillsModal() {
  skillsModal.style.display = 'block';
}

// Function to close the modal
function closeSkillsModal() {
  skillsModal.style.display = 'none';
}

searchForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const searchQuery = searchQueryInput.value.trim();

  if (searchQuery !== "") {
    searchDatabase(searchQuery);
  }
});

//Search for Skills
function searchDatabase(query) {
  const response = getresponse();

  const options = {
      method: "GET",
      headers: {
          Authorization: `Bearer ${response.token}`,
      },
  };

  searchResultsContainer.innerHTML = "";

  fetch (`${apiBaseURL}/api/search/skills?q=${encodeURIComponent(query)}`, options)
    .then(response => response.json())
    .then(searchResults => {
      displaySearchResults(searchResults);
    })
    .catch(error => {
      console.error("Search error:", error);
    });
}

//Display Skill Results
function displaySearchResults(results) {
  let resultsHTML = "";

  // Display Skills
  if (results.skills) {
      results.skills.data.forEach(skills => {
          resultsHTML += `
          <div class="card">
            <div class="card-header">
            <img src = ${skills.image_path} class = "skill-images-profile">
            <div id = "skill-name"><b>${skills.skill_name}</b></div>
            <div class="addSkillButton"><button class="btn btn-outline-success">Add</button></div>
            </div>
            <div class="card-body">
                <p class="card-text">${skills.description}</p>
              </div>
          </div><br>`;
      });
  } else {
      resultsHTML += `
      <p>No skills found.</p>`;
      
      skillRequestDiv.style.display = "block";
  }

  // Set the HTML content of the searchResultsContainer
  searchResultsContainer.innerHTML = resultsHTML;
}


//SKILL REQUEST CODE

//Open Modal
const skillReqModal = document.querySelector('#request-modal');

function openRequestModal() {
  skillReqModal.style.display = "block";
}
skillRequestButton.addEventListener('click', openRequestModal);

//Close Modal
const closeRequestModalButton = document.querySelector('#close-request');

function closeRequestModal() {
  skillReqModal.style.display = "none";
}
closeRequestModalButton.addEventListener('click', closeRequestModal);

//Submit Request
function submitRequest() {
  const response = getresponse();

  const skill_name = document.getElementById('your-request').value;
  
  const options = {
      method: "POST",
      headers: {
          Authorization: `Bearer ${response.token}`,
          'Content-Type': 'application/json', //Specify that JSON data is being sent
      },
      body: JSON.stringify({ skill_name }),
  };

  fetch(apiBaseURL + "/api/request/skills", options)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      return response.json();
    })
    .then(skillRequest => {
      if (skillRequest.error && skillRequest.status === 400) {
        receivedSubmission.innerHTML = `<p>${skillRequest.error}</p>`;
      } else {
        receivedSubmission.innerHTML = `<p>${skillRequest.message}</p>`;
      }    
    })
    .catch(error => {
      console.error(error);
      receivedSubmission.innerHTML = "<p>Error submitting skill request</p>";
    });
}

requestForm.onsubmit = function (event) {
  event.preventDefault();
  submitRequest();
}

//Show All Skills
function showAllSkills() {
  let allSkills = "";

  const response = getresponse();

  const options = {
      method: "GET",
      headers: {
          Authorization: `Bearer ${response.token}`,
      },
  };

  fetch(apiBaseURL + "/api/skills", options)
      .then(response => response.json())
      .then(skills => {
          skills.forEach(skill => {
                  allSkills += `
                  <div class="card">
                  <div class="card-header">
                  <span class="addSkillButton"><button class="btn btn-outline-success add-profile-skill" data-skill-id = "${skill.id}">Add</button></span>
                  <img src = ${skill.image_path} class = "skill-images">
                  <b>${skill.skill_name}</b>
                  </div>
                  <div class="card-body">
                      <p class="card-text">${skill.description}</p>
                    </div>
                </div><br>`;          
      })
      searchResultsContainer.innerHTML =  allSkills;
    })
      .catch(error => {
          console.error(error);
      });
};



//Add Skill to Profile

const profileSkillsContainer = document.querySelector("#skillsDisplay");
const addSkillButton = document.querySelector("#add-profile-skill");

function addSkillToProfile(skillId) {
  const response = getresponse();

  const options = {
      method: "POST",
      headers: {
          Authorization: `Bearer ${response.token}`,
          'Content-Type': 'application/json', //Specify that JSON data is being sent
      },
      body: JSON.stringify({ skillId }),
  };

  let allUserSkills = '';
  fetch (apiBaseURL + `/api/users/${response.user.user_id}/skills`, options)
    .then(response => response.json())
    .then(user_skills => {
      user_skills.forEach(userSkill => {
        allUserSkills += `
          <img src=${userSkill.image_path} class = "skill-images">
        `;
      })
      profileSkillsContainer.innerHTML = allUserSkills;
    })
    .catch(error => {
      console.error(error);
    });
};


// Event listeners
profileSkillsContainer.addEventListener('click', function (event) {
  if (event.target.classList.contains('add-profile-skill')) {
    const skillId = event.target.getAttribute('data-skill-id');
    addSkillToProfile(skillId);
  }
})
openSkillsModalButton.addEventListener('click', openSkillsModal);
closeSkillsModalButton.addEventListener('click', closeSkillsModal);
showAllSkillsButton.addEventListener('click', showAllSkills);

"use strict";

const logoutButton = document.querySelector("#logout");
const profileContainer = document.querySelector("#profileContainer");
const dataContainer = document.querySelector("#userDataContainer");
const bioDisplay = document.querySelector("#bioDisplay");
const saveBioButton = document.querySelector("#saveBio");
const bioTextarea = document.querySelector("#biotext");
const usernameContainer = document.querySelector("#username-container");
const emailContainer = document.querySelector("#email-container");
const passwordContainer = document.querySelector("#password-container");
const fullNameContainer = document.querySelector("#full-name-container");
const userAvatarContainer = document.querySelector('#userAvatarContainer');
const userProfileImgContainer = document.querySelector('#userProfileImg');
const defaultAvatar = document.querySelector('#defaultAvatar');
const defaultProfileImg = document.querySelector('#defaultProfileImg');
const settingsBioContainer = document.querySelector('#settings-bio-container');


logoutButton.onclick = logout;
saveBioButton.onclick = saveBio;

function convertDateTime(apiDateTime) {
  const date = new Date(apiDateTime);
  const formattedDateTime = date.toLocaleString();
  return formattedDateTime;
}

//Display Your Posts
function profileFetch() {
  const response = getresponse();
  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${response.token}`,
    },
  };

  fetch(apiBaseURL + "/api/posts?username=" + response.username, options)
    .then((response) => response.json())
    .then((userProfiles) => {
      userProfiles.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      let postHTML = "";

      userProfiles.forEach((userProfile) => {
        postHTML += `
        <div class="card text-center" id="cards" data-post-id="${userProfile._id}">
          <div class="card-header">
          <span class="deleteButton"><button class="btn btn-outline-danger" id="${userProfile._id}" onclick="deletePost('${userProfile._id}')">Χ</button></span>
              <b>@${userProfile.username}</b>
          </div>
          <div class="card-body">
              <p class="card-text">${userProfile.content}</p>
          </div><br>
          <div class="card-footer text-muted">
              ${convertDateTime(userProfile.created_at)}
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
function displayresponse() {

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
        <div class = "username">@${userData.username}</div>`;
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

        const avatar = `<img src = "${userData.avatar}">`;
        if (userData.avatar) {
          defaultAvatar.style.display = "none";
          defaultProfileImg.style.display = "none";

          userAvatarContainer.innerHTML = avatar;
          userProfileImgContainer.innerHTML = avatar;
  
        } else {
          defaultAvatar.style.display = "block";
          defaultProfileImg.style.display = "block";
          
          userAvatarContainer.style.display = "none";
          userProfileImgContainer.style.display = "none";
        }
      })
      .catch(error => {
        console.error("Error:", error);
      });
    }

//Update User Info
function updateUserInfo() {
  const response = getresponse();
  const userId = response.user.idUsers;

  const newUsername = usernameContainer.value;
  const newPassword = passwordContainer.value;
  const newEmail = emailContainer.value;
  const newBio = bioTextarea.value;
  const newAvatar = userImg;

  const updates = { username: newUsername, password: newPassword, email: newEmail, bio: newBio, avatar: newAvatar };
  

  const options = {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${response.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify( { userId, updates }),
  };

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
  displayresponse();
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

//Search for skills
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

function displaySearchResults(results) {
  let resultsHTML = "";

  // Display Skills
  if (results.skills.count > 0) {
      results.skills.data.forEach(skills => {
          resultsHTML += `
          <div class="card">
          
            <div class="card-header">
            <span class="addSkillButton"><button class="btn btn-outline-success">Add</button></span>
            <img src = ${skills.image_path} class = "skill-images">
            <div id = "skill-name"><b>${skills.skill_name}</b></div>
            </div>
            <div class="card-body">
                <p class="card-text">${skills.description}</p>
              </div>
          </div><br>`;
      });
  } else {
      resultsHTML += "<p>No skills found.</p>";
  }

  // Set the HTML content of the searchResultsContainer
  searchResultsContainer.innerHTML = resultsHTML;
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
      method: "GET",
      headers: {
          Authorization: `Bearer ${response.token}`,
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

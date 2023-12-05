/* Posts Page JavaScript */

"use strict";

const logoutButton = document.querySelector("#logout");
const submitText = document.querySelector("#submitText");
const userPostForm = document.querySelector("#userPostForm");
const profileContainer = document.querySelector("#profileContainer");

// SELECT POST TYPE
const postOption = document.querySelector("#postTypeDropdown");
const pollPost = document.querySelector("#pollPost");
const mediaPost = document.querySelector("#mediaPost");
const eventPost = document.querySelector("#eventPost");


logoutButton.onclick = logout;


//NEW POSTS

//Form Submit

function formSubmit() {
  userPostForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const userPost = {
      post_type: postOption.value,
      title: document.querySelector("#postTitle").value,
      content: document.querySelector("#userPost").value,
      tags: [], //Empty array for selected tags
    };

    const selectedTags = document.querySelectorAll('input[name="selectedTags"]:checked');
    selectedTags.forEach((tag) => {
      userPost.tags.push(tag.value);
    });
    userPost.tags = selectedTags;

     sendData(userPost);
  })
};


//Send Data
function sendData(userPost) {
  const response = getresponse();
  console.log(response);
  
  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${response.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userPost),
  };

  fetch(apiBaseURL + "/api/posts", options)
    .then((response) => response.json())
    .then((data) => {
      postFetch();
      console.log(data);    
    })
.catch((error) => {
  console.error(error);
});
}

userPostForm.onsubmit = formSubmit;

function submitPollPost() {
  pollPost
}

function convertDateTime(apiDateTime) {
    const date = new Date(apiDateTime);
    const formattedDateTime = date.toLocaleString();
    return formattedDateTime;
}

//FETCH POSTS
const postContainer = document.querySelector('#postContainer');
const eventContainer = document.querySelector('#eventsContainer');
const mediaContainer = document.querySelector('#mediaContainer');
const pollContainer = document.querySelector('#pollsContainer');

//SELECT POST FILTER
const showAll = document.querySelector("#filter-all");
const eventsFilter = document.querySelector("#filter-events");
const mediaFilter = document.querySelector("#filter-media");
const pollsFilter = document.querySelector("#filter-polls");

//Show All Posts
function postFetch() {
  postContainer.innerHTML = "";
    const response = getresponse();
    const options = {
        method: "GET",
        headers: {
            Authorization: `Bearer ${response.token}`,
        },
    };

    fetch(apiBaseURL + "/api/posts", options)
        .then(response => response.json())
        .then(posts => {
            posts.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

            console.log(posts);

            posts.forEach(post => {
                if(window.localStorage.getItem(post.post_id) === null && post.media) {
                    const cardHTML = `
                    <div class="card text-center" id="cards" data-post-id="${post.title}" style="max-height: auto;">
                    <div class="card-header">
                    <button type="button" class="user-thumbnail"><img src="${post.avatar}"></button>
                    <button type="button" class="user-profile" data-username="${post.username}"> @${post.username} </button>
                    <button type="button" class="save-post"><img src="../images/saves.png"></button>
                    </div>
                    <div class="card-body">

                      <div class="postImage">
                        <img src="${post.media}" alt="${post.title}">
                      </div>
 
                    <p class="card-text"><b>${post.title}</b></p>

                    <p class="card-text">${post.content}</p>
                    </div><br>
                    <div class="card-footer text-muted">
                    ${convertDateTime(post.updated_at)}<br>
                    <button onmouseover="mouseOverEffect('${post.title}')" onmouseout="mouseOutEffect('${post.post_id}')" class="like-button" id="${post.post_id}" onclick="likedOrNah('${post.post_id}')">❤</button>
                    </div>
                </div>`;
                    postContainer.innerHTML += cardHTML;
                } else {
                    const cardHTML = `
                    <div class="card text-center" id="cards" data-post-id="${post.title}">
                    <div class="card-header">
                    <button type="button" class="user-thumbnail"><img src="${post.avatar}"></button>
                    <button type="button" class="user-profile" data-username="${post.username}"> @${post.username} </button>
                    <button type="button" class="save-post"><img src="../images/saves.png"></button>
                    </div>
                    <div class="card-body">
                    <p class="card-text" >${post.content}</p>
                    </div><br>
                    <div class="card-footer text-muted">
                    ${convertDateTime(post.updated_at)}<br>
                    <button onmouseover="mouseOverEffect('${post.title}')" onmouseout="mouseOutEffect('${post.post_id}')" class="like-button liked" id="${post._id}" onclick="likedOrNah('${post.post_id}')">❤</button>
                    </div>
                    </div>`;
                    postContainer.innerHTML += cardHTML;
                }
            });
            
        })
        .catch(error => {
            console.error(error);
        });
    }
    
    window.onload = postFetch;
    
    showAll.addEventListener('click', function() {
      location.reload();
    });
    

  
    //Get Event Posts
    function filterEvents() {
      eventContainer.innerHTML = "";

      const response = getresponse();
      const options = {
          method: "GET",
          headers: {
              Authorization: `Bearer ${response.token}`,
          },
      };
  
      fetch(apiBaseURL + "/api/events", options)
          .then(response => response.json())
          .then(events => {
              events.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
              console.log(events);
  
              events.forEach(event => {
                      const eventCardHTML = `
                      <div class="card text-center" id="cards" data-event-id="${event.event_name}">
                      <div class="card-header">
                      <button type="button" class="user-thumbnail"><img src="${event.avatar}"></button>
                      <button type="button" class="user-profile" data-username="${event.username}"> @${event.username} </button>
                      <button type="button" class="save-post"><img src="../images/saves.png"></button>
                      </div>
                      <div class="card-body">
                      <p class="card-text"><b>${event.event_name}</b></p>
  
                      <p class="card-text">${event.event_description}</p>
                      </div><br>
                      <div class="card-footer text-muted">
                        <p class="card-text">Location: ${event.location_text}</p>
                        <p class="card-text">Date: ${convertDateTime(event.event_date)}</p>

                      <button class="like-button">❤</button>
                      </div>
                  </div>`;
                      eventContainer.innerHTML += eventCardHTML;
                      postContainer.style.display = "none";
                      pollContainer.style.display = "none";
                      mediaContainer.style.display = "none";
              });
              
          })
          .catch(error => {
              console.error(error);
          });
      }
      eventsFilter.addEventListener('click', filterEvents);
  
      //Get Media Posts
      function showMediaPosts() {
        mediaContainer.innerHTML = "";
          const response = getresponse();
          const options = {
              method: "GET",
              headers: {
                  Authorization: `Bearer ${response.token}`,
              },
          };
      
          fetch(apiBaseURL + "/api/posts", options)
              .then(response => response.json())
              .then(posts => {
                  posts.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
      
                  console.log(posts);
      
                  posts.forEach(post => {
                      if(post.media != null) {
                          const cardHTML = `
                          <div class="card text-center" id="cards" data-post-id="${post.post_id}" style="max-height: auto;">
                          <div class="card-header">
                          <button type="button" class="user-thumbnail"><img src="${post.avatar}"></button>
                          <button type="button" class="user-profile" data-username="${post.username}"> @${post.username} </button>
                          <button type="button" class="save-post"><img src="../images/saves.png"></button>
                          </div>
                          <div class="card-body">
      
                            <div class="postImage">
                              <img src="${post.media}" alt="${post.title}">
                            </div>
       
                          <p class="card-text"><b>${post.title}</b></p>
      
                          <p class="card-text">${post.content}</p>
                          </div><br>
                          <div class="card-footer text-muted">
                          ${convertDateTime(post.updated_at)}<br>
                          <button class="like-button">❤</button>
                          </div>
                      </div>`;
                          mediaContainer.innerHTML += cardHTML;
                          postContainer.style.display = "none";
                      }
                  }); 
              })
              .catch(error => {
                  console.error(error);
              });
          }
          mediaFilter.addEventListener('click', showMediaPosts);
      

      //Get Poll Posts
      function filterPolls() {
        pollContainer.innerHTML = "";

      const response = getresponse();
      const options = {
          method: "GET",
          headers: {
              Authorization: `Bearer ${response.token}`,
          },
      };
  
      fetch(apiBaseURL + "/api/polls", options)
          .then(response => response.json())
          .then(polls => {
              polls.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
              console.log(polls);
  
              polls.forEach(poll => {
                const pollOptions = poll.poll_options.split(',');

                // Check if poll.id is present before assigning it
                const pollIdAttribute = poll.id ? `data-poll-id="${poll.id}"` : '';

                      const pollsCardHTML = `
                      <div class="card text-center" id="cards" ${pollIdAttribute}">
                        <div class="card-header">
                          <button type="button" class="user-thumbnail"><img src="${poll.avatar}"></button>
                          <button type="button" class="user-profile" data-username="${poll.username}"> @${poll.username} </button>
                          <button type="button" class="save-post"><img src="../images/saves.png"></button>
                        </div>
                        <div class="card-body">
                          <p class="card-text"><b>${poll.question}</b></p>
                          <div class="poll-options">
                            ${pollOptions.map(option => `
                            <button class="btn btn-warning poll-option" data-poll-id="${poll.poll_id}" data-option="${option}">
                            ${option}
                            </button>
                            `).join('')}
                          </div>
                          <br>
                          <div class="submit-response">
                            <p class="card-text"><button type="submit" class="btn btn-outline-dark" id="expandPollButton">Submit</button></p>
                          </div>
                        </div>
                        <div class="card-footer text-muted">
                          Created: ${convertDateTime(poll.updated_at)}<br>
                          <button class="like-button">❤</button>
                        </div>
                      </div>`;
                      pollContainer.innerHTML += pollsCardHTML;
                      postContainer.style.display = "none";
                      eventContainer.style.display = "none";
                      mediaContainer.style.display = "none";
              });
              
          })
          .catch(error => {
              console.error(error);
          });
        }
      pollsFilter.addEventListener('click', filterPolls);


      //Open Poll Modal
      const pollModal = document.querySelector("#pollModal")
      const pollModalContainer = document.querySelector("#poll-details-content");
      const closeButton = document.querySelector("#close-poll-details");

      function openPollModal(pollId) {
        pollModal.style.display = "block";
        pollModalContainer.innerHTML = "";
        openModalButton.style.display = "none"; 

        const response = getresponse();
        const options = {
            method: "GET",
            headers: {
                Authorization: `Bearer ${response.token}`,
            },
        };
    
        fetch(apiBaseURL + `/api/polls/${pollId}/results`, options)
            .then(response => response.json())
            .then(pollData => {
    
                console.log(pollData);
    
                        const pollDataHTML = `
                        <h2 id="pollQuestion">${pollData.resultsWithPercentages[0].question}</h2><hr>
                        <ul id="pollOptions">
                          ${pollData.resultsWithPercentages.map((result) => {

                             // If result is found, display votes and percentage; otherwise, display 0 votes and 0%
                            const votes = result ? result.votes : 0;
                            const percentage = result ? result.percentage : 0;

                            return `<li>${result.option_name}: ${votes} (${percentage}%)</li>`
                          }).join("")}
                        </ul>`;                        
                        
                        pollModalContainer.innerHTML += pollDataHTML;
                        postContainer.style.display = "none";
                        eventContainer.style.display = "none";
                        mediaContainer.style.display = "none";
                      
                      })
                
            .catch(error => {
                console.error(error);
            });
          }
          pollContainer.addEventListener('click', function (event) {
            const expandButton = event.target.closest('.card-body').querySelector('#expandPollButton');
            
            if (expandButton) {
                const pollId = event.target.closest('[data-poll-id]').dataset.pollId;
                openPollModal(pollId);
            }
        });
        
          function closePollModal() {
            pollModal.style.display = "none";
          }

          closeButton.addEventListener("click", closePollModal);



//New Post Modal
// Get references to the button and modal
const openModalButton = document.getElementById('openModalButton');
const postModal = document.getElementById('postModal');
const closeModalButton = document.getElementsByClassName('close')[0];

// Function to open the modal
function openModal() {
  postModal.style.display = 'block';
}

// Function to close the modal
function closeModal() {
  postModal.style.display = 'none';
}

// Event listeners
openModalButton.addEventListener('click', openModal);
closeModalButton.addEventListener('click', closeModal);


function postType() {
  const selectedType = postOption.value;

  // Hide all form sections
  pollPost.style.display = "none";
  mediaPost.style.display = "none";
  eventPost.style.display = "none";

  // Show the selected form section based on the dropdown value
  if (selectedType === "Text") {
    userPostForm.style.display = "block";
  } else if (selectedType === "Poll") {
    pollPost.style.display = "block";
    userPostForm.style.display = "none";
  } else if (selectedType === "Media") {
    mediaPost.style.display = "block";
    userPostForm.style.display = "none";
  } else if (selectedType === "Event") {
    eventPost.style.display = "block";
    userPostForm.style.display = "none";
  }
}
//Add Poll Option
function addOption() {
  var pollOptionsDiv = document.getElementById("pollOptions");
  var optionNumber = pollOptionsDiv.getElementsByTagName("div").length + 1;

  var newOptionDiv = document.createElement("div");
  var newOptionInput = document.createElement("input");
  newOptionInput.type = "text";
  newOptionInput.name = "option" + optionNumber;
  newOptionInput.required = true;
  newOptionInput.classList = "pollInput";

  newOptionDiv.appendChild(newOptionInput);
  pollOptionsDiv.appendChild(newOptionDiv);
}

//Add Tags to Post
document.addEventListener("DOMContentLoaded", function () { //When the HTML doc fully loads,
  const forms = document.querySelectorAll(".new-posts"); //Select all elements with .new-posts class

  forms.forEach(form => { //Loop through each form to add event listener for search separately
    const searchQueryInput = form.querySelector(".searchQuery");
    const tagSearchContainer = form.querySelector(".tagSearchContainer");
    const searchTagButton = form.querySelector(".searchButton");

    searchTagButton.addEventListener("click", function(event) {
      event.preventDefault();
      tagSearchContainer.style.display = "flex"; 

      const searchQuery = searchQueryInput.value.trim();

      if (searchQuery !== "") {
        searchDatabase(searchQuery, tagSearchContainer);
      }
    });
  });
});

function searchDatabase(query, tagSearchContainer) {
  const response = getresponse();

  const options = {
      method: "GET",
      headers: {
          Authorization: `Bearer ${response.token}`,
      },
  };

  tagSearchContainer.innerHTML = "";

  fetch (`${apiBaseURL}/api/search/tags?q=${encodeURIComponent(query)}`, options)
    .then(response => response.json())
    .then(searchResults => {
      displaySearchResults(searchResults, tagSearchContainer);

    })
    .catch(error => {
      console.error("Search error:", error);
    });
}

function displaySearchResults(results, tagSearchContainer) {
  let resultsHTML = "";

  // Display Tags
  if (results.tags.count > 0) {
      results.tags.data.forEach(tags => {
          resultsHTML += `
          <div class="checkbox">
          <label>
            <input type="checkbox" value="${tags.tag_name}">
            ${tags.tag_name}
          </label>
        </div><br>`;      
      });
  } else {
      resultsHTML += "<p>No tags found.</p>";
  }

  // Set the HTML content of the tagSearchContainer
  tagSearchContainer.innerHTML = resultsHTML;
}

//User Profile Modals
const userProfileModal = document.querySelector("#user-profile-modal")
const userProfileContainer = document.querySelector("#user-profile-content");
const closeProfileButton = document.querySelector("#close-user-profile");

const bioDisplay = document.querySelector("#bioDisplay");
const bioTextarea = document.querySelector("#biotext");
const usernameContainer = document.querySelector("#username-container");
const emailContainer = document.querySelector("#email-container");
const passwordContainer = document.querySelector("#password-container");
const fullNameContainer = document.querySelector("#full-name-container");
const locationContainer = document.querySelector("#location-container");

const userAvatarContainer = document.querySelector('#userAvatarContainer');
const userProfileImgContainer = document.querySelector('#userProfileImg');
const defaultAvatar = document.querySelector('#defaultAvatar');
const defaultProfileImg = document.querySelector('#defaultProfileImg');

//Open Modal
function openModal(username) {
userProfileModal.style.display = "block";
openModalButton.style.display = "none";

const response = getresponse();
const options = {
  method: "GET",
  headers: {
    Authorization: `Bearer ${response.token}`,
  },
};      

fetch(apiBaseURL + `/api/users/${username}`, options)
    .then(response => response.json())
    .then(userInfo => {

        console.log(userInfo);
              
              const data = `
              <h4> <b>${userInfo.full_name}</b></h4>
              <div class = "username">@${userInfo.username}</div>`;
              dataContainer.innerHTML = data;
      
              const bio = `${userInfo.bio}`;
              bioDisplay.textContent = bio || "No bio yet!";
              settingsBioContainer.textContent = bio || "No bio yet!"
      
              const fullName = `${userInfo.full_name}`;
              fullNameContainer.textContent = fullName || "Working on it.";
      
              const email = `${userInfo.email}`;
              emailContainer.textContent = email;
      
              const username = `${userInfo.username}`;
              usernameContainer.textContent = username;

              const location = `${userInfo.city}, ${userInfo.state}`;
              locationContainer.textContent = location;
      
              const avatar = `<img src = "${userInfo.avatar}">`;
              if (userInfo.avatar) {
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
      
// Event delegation on the parent element
postContainer.addEventListener('click', function(event) {
  const target = event.target;

  // Check if the clicked element is a button with the class 'user-profile'
  if (target.classList.contains('user-profile')) {
    // Access the data-username attribute to get the username
    const username = target.getAttribute('data-username');
    console.log(`View profile clicked for user: ${username}`);

    openModal(username);
  }
});

// Close Modal
function closeModal() {
  userProfileModal.style.display = 'none';
  openModalButton.style.display = "block";
}

// Event listeners
closeProfileButton.addEventListener('click', closeModal);


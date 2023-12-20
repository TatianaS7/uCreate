/* Posts Page JavaScript */

"use strict";

const logoutButton = document.querySelector("#logout");

logoutButton.onclick = logout;


//NOTIFICATIONS MODAL
const openNotificationsButton = document.querySelector("#notifications");
const notificationsModal = document.querySelector("#notis-modal");
const closeNotificationsButton = document.querySelector("#close-noti-modal");

// Open Modal
function openNotiModal() {
  notificationsModal.style.display = "block";
  openModalButton.style.display = "none";
}

//Close Modal
function closeNotiModal() {
  notificationsModal.style.display = "none";
  openModalButton.style.display = "block";
}

//Event Listeners
openNotificationsButton.addEventListener('click', openNotiModal);
closeNotificationsButton.addEventListener('click', closeNotiModal);



//NEW POSTS MODAL
const openModalButton = document.getElementById('openModalButton');
const postModal = document.querySelector('#postModal');
const closeModalButton = document.getElementById('close-posts-modal');

// Open Modal
function openNewPostModal() {
  postModal.style.display = 'block';
}

// Close Modal
function closeNewPostModal() {
  postModal.style.display = 'none';
}

// Event listeners
openModalButton.addEventListener('click', openNewPostModal);
closeModalButton.addEventListener('click', closeNewPostModal);


// Select Post Type
const postOption = document.querySelector("#postTypeDropdown");
const pollPost = document.querySelector("#pollPost");
const mediaPost = document.querySelector("#mediaPost");
const eventPost = document.querySelector("#eventPost");

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

//Search Tags
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

//Display Tags
function displaySearchResults(results, tagSearchContainer) {
  let resultsHTML = "";

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

  tagSearchContainer.innerHTML = resultsHTML;
}

//SUBMIT POSTS
document.addEventListener('DOMContentLoaded', function() {
  const userPostForm = document.querySelector("#userPostForm");
  const postTitle = document.querySelector("#postTitle");
  const postContent = document.querySelector("#userPost");

  // Form Submit
  function formSubmit() {
    userPostForm.addEventListener('submit', function(event) {
      event.preventDefault();

      const storedUserData = window.localStorage.getItem('login-data');
      const userId = JSON.parse(storedUserData.user_id);
      console.log(userId)

      const userPost = {
        user_id: userId,
        post_type: postOption.value,
        title: postTitle.value,
        content: postContent.value,
        tags: [], //Empty array for selected tags
      };

      const selectedTags = document.querySelectorAll('input[name="selectedTags"]:checked');
      selectedTags.forEach((tag) => {
        userPost.tags.push(tag.value);
      });
      userPost.tags = selectedTags;

      sendData(userPost);
    });
  }

  // Send Data
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
        console.log(data);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  formSubmit();
});



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
                        <div class="left-header">
                          <div class="user-thumbnail"><img src="${post.avatar}"></div>
                          <button type="button" class="user-profile" data-username="${post.username}"> @${post.username} </button>
                        </div>  
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
                        <div class="left-header">
                          <div class="user-thumbnail"><img src="${post.avatar}"></div>
                          <button type="button" class="user-profile" data-username="${post.username}"> @${post.username} </button>
                        </div>  
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

                            return `<li class="poll-result-style" style="background: plum" >${result.option_name}: ${votes} (${percentage}%)</li>`
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







//User Profile Modals
const userProfileModal = document.querySelector("#user-profile-modal")
const userProfileContainer = document.querySelector("#user-profile-content");
const closeProfileButton = document.querySelector("#close-user-profile");

const bioDisplay = document.querySelector("#bioDisplay");
const usernameContainer = document.querySelector("#username-container");
const fullNameContainer = document.querySelector("#full-name-container");
const locationContainer = document.querySelector("#location-container");
const locationIconContainer = document.querySelector('#lo-img-container');
const userSkillContainer = document.querySelector("#user-skills");
const userPostContainer = document.querySelector("#posts-container");

const userImgContainer = document.querySelector('#user-image-container');
const defaultProfileImg = document.querySelector('#default-user-img');

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

fetch(apiBaseURL + `/api/user/${username}`, options)
    .then(response => response.json())
    .then(userInfo => {

        console.log(userInfo);

        const data = userInfo.userProfile[0];
                   
              const bio = data.bio || "No bio yet!";
              bioDisplay.textContent = bio;
      
              const fullName = data.full_name || "Working on it.";
              fullNameContainer.textContent = fullName;
      
      
              const user = '@' + username;
              usernameContainer.textContent = user;

              if (data.city && data.state) {
                const location = data.city + `, ` + data.state;
                locationContainer.textContent = location;
              } else {
                locationIconContainer.style.display = "none";
              }

              const skills = data.skills || "No skills added yet!";
              userSkillContainer.textContent = skills;

      
              const avatar = `<img src = "${data.avatar}">`;
              if (data.avatar) {
                defaultProfileImg.style.display = "none";
      
                userImgContainer.innerHTML = avatar;
        
              } else {
                defaultProfileImg.style.display = "flex";
                
                userImgContainer.style.display = "none";
              }
            })
            .catch(error => {
              console.error("Error:", error);
            });

            fetch(apiBaseURL + `/api/posts/${username}`, options)
            .then(response => response.json())
            .then(userPosts => {

              console.log(userPosts);

               userPostContainer.innerHTML = "";

              userPosts.posts.forEach(info => {
              const posts = `                     
              <div class="card text-center" id="cards" data-post-id="${info.title}">
                      <div class="card-header">
                      <div class="left-header">
                        <div class="user-thumbnail"><img src="${info.avatar}"></div>
                        <button type="button" class="user-profile" data-username="${info.username}"> @${info.username} </button>
                      </div>  
                      <button type="button" class="save-post"><img src="../images/saves.png"></button>
                    </div>
                  <div class="card-body">
                    <p class="card-text" >${info.content}</p>
                  </div><br>
                  <div class="card-footer text-muted">
                  ${convertDateTime(info.updated_at)}<br>
                  <button onmouseover="mouseOverEffect('${info.title}')" onmouseout="mouseOutEffect('${info.post_id}')" class="like-button liked" id="${info.post_id}" onclick="likedOrNah('${info.post_id}')">❤</button>
                  </div>
                  </div>`;

                  userPostContainer.innerHTML += posts;
;
            });
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

  location.reload();
}

// Event listeners
closeProfileButton.addEventListener('click', closeModal);


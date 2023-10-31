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

//Form Submit

function formSubmit() {
  submitText.addEventListener('click', function(event) {
    event.preventDefault();

    const userPost = {
      post_type: postOption.value,
      title: document.querySelector("#postTitle").value,
      content: document.querySelector("#userPost").value,
      tags: document.querySelector("#searchQuery"), //Connect to outputted tags after search
    };
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

userPostForm.onsubmit = sendData;

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
                if(window.localStorage.getItem(post.post_id) === null) {
                    const cardHTML = `
                    <div class="card text-center" id="cards" data-post-id="${post.title}">
                    <div class="card-header">
                    @${post.username}
                    </div>
                    <div class="card-body">
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
                    @${post.username}
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
                      @${event.created_by}
                      </div>
                      <div class="card-body">
                      <p class="card-text"><b>${event.event_name}</b></p>
  
                      <p class="card-text">${event.event_description}</p>
                      </div><br>
                      <div class="card-footer text-muted">
                        <p class="card-text">Location: ${event.location_text}</p>
                        <p class="card-text">Date: ${convertDateTime(event.event_date)}</p>

                      <button onmouseover="mouseOverEffect('${event.event_name}')" onmouseout="mouseOutEffect('${event.event_id}')" class="like-button" id="${event.event_id}" onclick="likedOrNah('${event.event_id}')">❤</button>
                      </div>
                  </div>`;
                      eventContainer.innerHTML += eventCardHTML;
                      postContainer.style.display = "none";
                      pollContainer.style.display = "none";
              });
              
          })
          .catch(error => {
              console.error(error);
          });
      }
      eventsFilter.addEventListener('click', filterEvents);
  
      //Get Media Posts

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
                      const pollsCardHTML = `
                      <div class="card text-center" id="cards" data-poll-id="${poll.question}">
                      <div class="card-header">
                      @${poll.user_id}
                      </div>
                      <div class="card-body">
                      <p class="card-text"><b>${poll.question}</b></p>
  
                      <p class="card-text"><button class="btn btn-outline-info">See Responses</button></p>
                      </div><br>
                      <div class="card-footer text-muted">
                      Created: ${convertDateTime(poll.updated_at)}<br>
                      <button onmouseover="mouseOverEffect('${poll.question}')" onmouseout="mouseOutEffect('${poll.id}')" class="like-button" id="${poll.id}" onclick="likedOrNah('${poll.id}')">❤</button>
                      </div>
                  </div>`;
                      pollContainer.innerHTML += pollsCardHTML;
                      postContainer.style.display = "none";
                      eventContainer.style.display = "none";
              });
              
          })
          .catch(error => {
              console.error(error);
          });
        }
      pollsFilter.addEventListener('click', filterPolls);


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
const searchForm = document.querySelector("#searchForm");
const searchQueryInput = document.querySelector("#searchQuery");
const tagSearchContainer = document.querySelector("#tagSearchContainer");
const searchTagButton = document.querySelector("#searchButton");

searchTagButton.addEventListener("click", function(event) {
  event.preventDefault();
  tagSearchContainer.style.display = "flex"; 

  const searchQuery = searchQueryInput.value.trim();

  if (searchQuery !== "") {
    searchDatabase(searchQuery);
  }
});


function searchDatabase(query) {
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
      displaySearchResults(searchResults);

    })
    .catch(error => {
      console.error("Search error:", error);
    });
}

function displaySearchResults(results) {
  let resultsHTML = "";

  // Display Tags
  if (results.tags.count > 0) {
      results.tags.data.forEach(tags => {
          resultsHTML += `
          <div class="checkbox">
          <label>
            <input type="checkbox" name="selectedTags" value="${tags.tag_name}">
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


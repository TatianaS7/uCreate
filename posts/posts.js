/* Posts Page JavaScript */

"use strict";

const logoutButton = document.querySelector("#logout");
const postContainer = document.querySelector('#postContainer');
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
userPostForm.addEventListener("submit", function(event) {
  event.preventDefault();
  // profileContainer.replaceChildren();

  const userPost = {
    postType: postOption.value,
    title: document.getElementById("postTitle"),
    content: document.getElementById("userPost"),
    tags: document.getElementById("tags")
  };

  sendData(userPost);
})
};

//Send Data
function sendData() {
  const response = getresponse();
  console.log(response);
  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${response.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ 
      post_type: userPost.postType,
      title: userPost.title,
      content: userPost.content,
      tags: userPost.tags 
    }),
  };

  fetch(apiBaseURL + "/api/posts", options)
    .then((response) => response.json())
    .then((data) => {
      postFetch();
      console.log(data);
    });

};

userPostForm.onsubmit = formSubmit;


function convertDateTime(apiDateTime) {
    const date = new Date(apiDateTime);
    const formattedDateTime = date.toLocaleString();
    return formattedDateTime;
}


function postFetch() {
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
            posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            console.log(posts);

            posts.forEach(post => {
                if(window.localStorage.getItem(post.post_id) === null) {
                    const cardHTML = `
                    <div class="card text-center" id="cards" data-post-id="${post.title}">
                    <div class="card-header">
                    <b>@${post.username}</b>
                    </div>
                    <div class="card-body">
                    <p class="card-text"><i>${post.title}</i></p>

                    <p class="card-text">${post.content}</p>
                    </div><br>
                    <div class="card-footer text-muted">
                    ${convertDateTime(post.created_at)}<br>
                    <button onmouseover="mouseOverEffect('${post.title}')" onmouseout="mouseOutEffect('${post._id}')" class="like-button" id="${post._id}" onclick="likedOrNah('${post._id}')">❤</button>
                    </div>
                </div>`;
                    postContainer.innerHTML += cardHTML;
                } else {
                    const cardHTML = `
                    <div class="card text-center" id="cards" data-post-id="${post.title}">
                    <div class="card-header">
                    <b>@${post.username}</b>
                    </div>
                    <div class="card-body">
                    <p class="card-text" >${post.content}</p>
                    </div><br>
                    <div class="card-footer text-muted">
                    ${convertDateTime(post.created_at)}<br>
                    <button onmouseover="mouseOverEffect('${post.title}')" onmouseout="mouseOutEffect('${post._id}')" class="like-button liked" id="${post._id}" onclick="likedOrNah('${post._id}')">❤</button>
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
    

//New Post

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

const searchForm = document.querySelector("#searchForm");
const searchQueryInput = document.querySelector("#searchQuery");
const tagSearchContainer = document.querySelector("#tagSearchContainer");
const searchTagButton = document.querySelector("#searchButton");

searchTagButton.addEventListener("submit", function(event) {
  event.preventDefault();

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

  searchResultsContainer.innerHTML = "";

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
          <div class="card">
            <div class="card-header"></div>
            <div class="card-body">
                <p class="card-text">${tags.tag_name}</p>
              </div>
          </div><br>`;
      });
  } else {
      resultsHTML += "<p>No tags found.</p>";
  }

  // Set the HTML content of the tagSearchContainer
  tagSearchContainer.innerHTML = resultsHTML;
}


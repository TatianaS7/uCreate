/* Posts Page JavaScript */

"use strict";

const logoutButton = document.querySelector("#logout");
const postContainer = document.querySelector('#postContainer');
const userPost = document.querySelector("#userPost");

logoutButton.onclick = logout;

function convertDateTime(apiDateTime) {
    const date = new Date(apiDateTime);
    const formattedDateTime = date.toLocaleString();
    return formattedDateTime;
}

//LIKES FEATURE
function countLikes(likes) {
    return likes.length;
}

function postFetch() {
    const loginData = getLoginData();

    const options = {
        method: "GET",
        headers: {
            Authorization: `Bearer ${loginData.token}`,
        },
    };

    fetch(apiBaseURL + "/api/posts", options)
        .then(response => response.json())
        .then(posts => {
            posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            posts.forEach(post => {
                if(window.localStorage.getItem(post._id) === null) {
                    const cardHTML = `
                    <div class="card text-center" id="cards" data-post-id="${post._id}">
                    <div class="card-header">
                    <b>@${post.username}</b>
                    </div>
                    <div class="card-body">
                    <p class="card-text">${post.text}</p>
                    </div><br>
                    <div class="card-footer text-muted">
                    ${convertDateTime(post.createdAt)}<br>
                    <span class="likes-count">${countLikes(post.likes)} Likes</span>
                    <button onmouseover="mouseOverEffect('${post._id}','${post.likes}')" onmouseout="mouseOutEffect('${post._id}')" class="like-button" id="${post._id}" onclick="likedOrNah('${post._id}')">❤</button>
                    </div>
                </div>`;
                    postContainer.innerHTML += cardHTML;
                } else {
                    const cardHTML = `
                    <div class="card text-center" id="cards" data-post-id="${post._id}">
                    <div class="card-header">
                    <b>@${post.username}</b>
                    </div>
                    <div class="card-body">
                    <p class="card-text" >${post.text}</p>
                    </div><br>
                    <div class="card-footer text-muted">
                    ${convertDateTime(post.createdAt)}<br>
                    <span class="likes-count">${countLikes(post.likes)} Likes</span>
                    <button onmouseover="mouseOverEffect('${post._id}','${post.likes}')" onmouseout="mouseOutEffect('${post._id}')" class="like-button liked" id="${post._id}" onclick="likedOrNah('${post._id}')">❤</button>
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
    
    function likedOrNah(postId) {
        if (window.localStorage.getItem(postId) === null) {
            toggleLike(postId)
        } else {
            untoggleLike(postId)
        }
    }
    
    function toggleLike(postId) {
        const loginData = getLoginData();
        const likeButton = document.querySelector(`button[id='${postId}']`)
        likeButton.classList.toggle('liked')
        const options = {
            method: "POST",
            headers: {
                Authorization: `Bearer ${loginData.token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ postId: postId }),
        };
        
        fetch(apiBaseURL + "/api/likes", options)
        .then((response) => response.json())
    .then((data) => {
        window.localStorage.setItem(data.postId,data._id)
        window.location.reload()
    });
    
}

function untoggleLike(postId) {
    const loginData = getLoginData();
    const likeButton = document.querySelector(`button[id='${postId}']`)
    likeButton.classList.toggle('liked')
    const endpoint = window.localStorage.getItem(postId)
    const options = {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${loginData.token}`,
            "Content-Type": "application/json",
        },
    };
    fetch(apiBaseURL + "/api/likes/" + endpoint, options)
    .then((response) => response.json())
    .then((data) => {
        window.localStorage.removeItem(postId)
        window.location.reload()
    });
}


function mouseOverEffect(postId,postLikes) {
    console.log(postId)
    console.log(postLikes)
    // postLikes.forEach(a=>console.log(a.username))
    // postLikes.forEach(a=>console.log(a.username))
    const likeButton = document.querySelector(`button[id='${postId}']`)
    likeButton.classList.add('mousedOver')
}

function mouseOutEffect(postId) {
    const likeButton = document.querySelector(`button[id='${postId}']`)
    likeButton.classList.remove('mousedOver')
}


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

// SELECT POST TYPE
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
    userPost.style.display = "block";
  } else if (selectedType === "Poll") {
    pollPost.style.display = "block";
    userPost.style.display = "none";
  } else if (selectedType === "Media") {
    mediaPost.style.display = "block";
    userPost.style.display = "none";
  } else if (selectedType === "Event") {
    eventPost.style.display = "block";
    userPost.style.display = "none";
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

userPost.onsubmit = formSubmit;

//EVENT GEOCODING
// const address = '1600 Amphitheatre Parkway, Mountain View, CA'; // Replace this with the user-selected address
// const apiKey = 'YOUR_GOOGLE_MAPS_API_KEY'; // Replace this with your actual API key

// const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

// fetch(geocodingUrl)
//   .then(response => response.json())
//   .then(data => {
//     if (data.results && data.results.length > 0) {
//       const location = data.results[0].geometry.location;
//       const latitude = location.lat;
//       const longitude = location.lng;

//       // Now you can use the latitude and longitude values as needed.
//     } else {
//       console.error('Geocoding failed or returned no results.');
//     }
//   })
//   .catch(error => {
//     console.error('Error while geocoding:', error);
//   });


//Form Submit
function formSubmit(event) {
    event.preventDefault();
    profileContainer.replaceChildren();
    sendData(userPost.userPostArea.value);
  }
  
  //Send Data
  function sendData(postContent) {
    const loginData = getLoginData();
    console.log(loginData);
    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${loginData.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: postContent }),
    };
  
    fetch(apiBaseURL + "/api/posts", options)
      .then((response) => response.json())
      .then((data) => {
        profileFetch();
        console.log(data);
      });
  }
  
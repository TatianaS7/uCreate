// Get references to the button and modal
const openModalButton = document.getElementById('openModalButton');
const searchModal = document.getElementById('searchModal');
const closeModalButton = document.getElementsByClassName('close')[0];
const searchForm = document.querySelector("#searchForm");
const searchQueryInput = document.querySelector("#searchQuery");
const searchResultsContainer = document.querySelector("#searchResults");

// Function to open the modal
function openModal() {
  searchModal.style.display = 'block';
}

// Function to close the modal
function closeModal() {
  searchModal.style.display = 'none';
}

// Event listeners
openModalButton.addEventListener('click', openModal);
closeModalButton.addEventListener('click', closeModal);

searchForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const searchQuery = searchQueryInput.value.trim();

  if (searchQuery !== "") {
    searchDatabase(searchQuery);
  }
});


function searchDatabase(query) {
  const loginData = getLoginData();

  const options = {
      method: "GET",
      headers: {
          Authorization: `Bearer ${loginData.token}`,
      },
  };

  searchResultsContainer.innerHTML = "";

  fetch (`${apiBaseURL}/api/search?q=${encodeURIComponent(query)}`, options)
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

  // Display users
  resultsHTML += "<h5>Users</h5>";
  if (results.users.count > 0) {
      results.users.data.forEach(user => {
          resultsHTML += `
          <div class="card">
            <div class="card-header"><b>@${user.username}</b></div>
            <div class="card-body">
              <p class="card-text">${user.full_name}</p>
                <p class="card-text">${user.bio}</p>
            </div>
          </div><br>`;
      });
  } else {
      resultsHTML += "<p>No users found.</p>";
  }

  // Display posts
  resultsHTML += "<h5>Posts</h5>";
  if (results.posts.count > 0) {
      results.posts.data.forEach(post => {
          resultsHTML += `
          <div class="card">
            <div class="card-header"><b>${post.title}</b></div>
            <div class="card-body">
                <p class="card-text">${post.content}</p>
            </div>
          </div><br>`;
      });
  } else {
      resultsHTML += "<p>No posts found.</p>";
  }

  // Display events
  resultsHTML += "<h5>Events</h5>";
  if (results.events.count > 0) {
      results.events.data.forEach(event => {
          resultsHTML += `
          <div class="card">
            <div class="card-header"><b>${event.event_name} | ${event.event_date}</b></div>
            <div class="card-body">
                <p class="card-text">@${event.created_by}</p>
                <p class="card-text">${event.event_description}</p>
              </div>
            <div class="card-footer text-muted">${event.location_text} | Tags:</div>
          </div><br>`;
      });
  } else {
      resultsHTML += "<p>No events found.</p>";
  }

// Display Polls
resultsHTML += "<h5>Polls</h5>";
if (results.polls.count > 0) {
    results.polls.data.forEach(poll => {
        resultsHTML += `
        <div class="card">
          <div class="card-header">${poll.question}</div>
          <div class="card-body">
              <p class="card-text">Created by: ${poll.user_id}</p></div>
              <div class="card-footer text-muted">Tags:</div>
            </div>
        </div><br>`;

    //     const pollOptions = results.poll_options.data.filter(
    //       option => option.poll_id === poll.id
    //   );

    //       if (pollOptions.length > 0) {
    //         for (const option of pollOptions) {
  
    //         resultsHTML +=  `        
    //       <div class="card-body">
    //         <p class="card-text">${option.poll_option}</p>
    //       </div>
    //     </div><br>`;
    //     }
    // };
  })
} else {
    resultsHTML += "<p>No polls found.</p>";
};

  // Display Skills
  resultsHTML += "<h5>Skills</h5>";
  if (results.skills.count > 0) {
      results.skills.data.forEach(skills => {
          resultsHTML += `
          <div class="card">
            <div class="card-header">${skills.skill_name}</div>
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


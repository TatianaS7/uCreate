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


//LIKES

//LIKES FEATURE
// function countLikes(likes) {
//     return likes.length;
// }


//     function likedOrNah(postId) {
//         if (window.localStorage.getItem(postId) === null) {
//             toggleLike(postId)
//         } else {
//             untoggleLike(postId)
//         }
//     }
    
//     function toggleLike(postId) {
//         const loginData = getLoginData();
//         const likeButton = document.querySelector(`button[id='${postId}']`)
//         likeButton.classList.toggle('liked')
//         const options = {
//             method: "POST",
//             headers: {
//                 Authorization: `Bearer ${loginData.token}`,
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify({ postId: postId }),
//         };
        
//         fetch(apiBaseURL + "/api/likes", options)
//         .then((response) => response.json())
//     .then((data) => {
//         window.localStorage.setItem(data.postId,data._id)
//         window.location.reload()
//     });
    
// }

// function untoggleLike(postId) {
//     const loginData = getLoginData();
//     const likeButton = document.querySelector(`button[id='${postId}']`)
//     likeButton.classList.toggle('liked')
//     const endpoint = window.localStorage.getItem(postId)
//     const options = {
//         method: "DELETE",
//         headers: {
//             Authorization: `Bearer ${loginData.token}`,
//             "Content-Type": "application/json",
//         },
//     };
//     fetch(apiBaseURL + "/api/likes/" + endpoint, options)
//     .then((response) => response.json())
//     .then((data) => {
//         window.localStorage.removeItem(postId)
//         window.location.reload()
//     });
// }


// function mouseOverEffect(postId,postLikes) {
//     console.log(postId)
//     console.log(postLikes)
//     // postLikes.forEach(a=>console.log(a.username))
//     // postLikes.forEach(a=>console.log(a.username))
//     const likeButton = document.querySelector(`button[id='${postId}']`)
//     likeButton.classList.add('mousedOver')
// }

// function mouseOutEffect(postId) {
//     const likeButton = document.querySelector(`button[id='${postId}']`)
//     likeButton.classList.remove('mousedOver')
// }

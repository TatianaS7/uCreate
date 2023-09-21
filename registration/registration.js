"use strict"

const registrationForm = document.querySelector("#registrationForm")


function formSubmit(event) {
    event.preventDefault()
    const userInfoCont = {
        full_name:registrationForm.full_nameInput.value,
        username:registrationForm.usernameInput.value,
        password:registrationForm.passwordInput.value,
        email:registrationForm.emailInput.value
    }
    userInfoFetch(userInfoCont)
}

function userInfoFetch (userInfo) {
        const options = { 
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(userInfo),
    };

    return fetch(apiBaseURL + "/api/register", options)
        .then(response => response.json())
        .then(loginData => {
            window.location.assign("../")   
        })
    }

registrationForm.onsubmit = formSubmit
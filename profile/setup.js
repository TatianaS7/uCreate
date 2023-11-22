//USER SETTINGS

//Delete User
const deleteAccountButton = document.querySelector("#delete-account");
const confirmDeleteModal = document.querySelector("#delete-account-modal");
const closeDeleteModalButton = document.querySelector("#cancel-delete");
const permanentDelete = document.querySelector("#really-delete");

function deleteUserAccount() {

}
permanentDelete.addEventListener('click', deleteUserAccount);

function openDeleteModal() {
    confirmDeleteModal.style.display = 'block';
}
deleteAccountButton.addEventListener('click', openDeleteModal);

function closeDeleteModal() {
    confirmDeleteModal.style.display = 'none';
}
closeDeleteModalButton.addEventListener('click', closeDeleteModal);

//Edit User Data
const toggleEditsButton = document.querySelector('#edit-data-button');
const editFields = document.querySelectorAll('.edit-user-data');
const userInfoContainers = document.querySelectorAll('.user-info-containers');

function toggleEditFields() {
    editFields.forEach(field => { //Loops through elements in collections
        field.style.display = 'block';
    });
    userInfoContainers.forEach(container => {
        container.style.display = 'none';
    });
}
toggleEditsButton.addEventListener('click', toggleEditFields);


//Send Updated Data
const saveChangesButton = document.querySelector("#save-changes");

function sendNewData() {


    editFields.forEach(field => { //Loops through elements in collections
        field.style.display = 'none';
    });
    userInfoContainers.forEach(container => {
        container.style.display = 'block';
    });

}
saveChangesButton.addEventListener('click', sendNewData);


//Delete Avatar
const deleteImgButton = document.querySelector("#deleteAvatar");

function deleteAvatar() {

}
deleteImgButton.addEventListener('click', deleteAvatar);
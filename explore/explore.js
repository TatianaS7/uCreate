// Get references to the button and modal
const openModalButton = document.getElementById('openModalButton');
const searchModal = document.getElementById('searchModal');
const closeModalButton = document.getElementsByClassName('close')[0];

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

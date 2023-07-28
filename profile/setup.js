// PROFILE SETUP

// Skills
const skillIconMap = {
    Procreate: 'procreate-icon.png',
    Photoshop: 'photoshop-icon.png',
    Illustrator: 'illustrator-icon.png',
    Blender: 'blender-icon.png',
    Premiere Pro: 'premiere-icon.png',
    // Add more skills and their corresponding icon filenames as needed
  };

  
function skillIconMatch() {
    //Reference dataset where the users skills are stored
    const selectedOption = userSkills.value;
    const iconFilename = skillIconMap[selectedOption];

    if (iconFilename) {
        // Create an <img> element for the icon
        const iconElement = document.createElement('img');
        iconElement.src = iconFilename;
        iconElement.alt = selectedOption; // You can use the skill name as the alt text for accessibility
    
        // Append the icon to the user's profile container (replace 'userProfile' with the actual container ID/class)
        const userProfile = document.getElementById('userProfile');
        userProfile.appendChild(iconElement);
      }
    }

userSkills.addEventListener('change', skillIconMatch);

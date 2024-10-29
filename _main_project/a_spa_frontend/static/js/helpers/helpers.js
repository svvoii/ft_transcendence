export const getProfileInfo = function () {
  const profileImage = localStorage.getItem('profile_image_url');
  const profileName = localStorage.getItem('profile_username');

  if (profileImage !== null) {
    const userPic = document.getElementById('userPic');
    userPic.src = profileImage;
  }  
  if (profileName !== null) {
    const userName = document.getElementById('userName');
    userName.innerHTML = profileName;
  }  
};
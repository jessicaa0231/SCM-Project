const usernameInput = document.getElementById('usernameInput');
const emailInput = document.getElementById('emailInput');
const saveBtn = document.getElementById('saveBtn');
const logoutBtn = document.getElementById('logoutBtn');

// Load data from localStorage
const username = localStorage.getItem('username') || 'User';
const email = localStorage.getItem('email') || 'user@example.com';

usernameInput.value = username;
emailInput.value = email;
document.getElementById('top-username').textContent = `👤 ${username}`;

// Save changes
saveBtn.addEventListener('click', () => {
  const updatedUsername = usernameInput.value.trim();
  if (updatedUsername) {
    localStorage.setItem('username', updatedUsername);
    document.getElementById('top-username').textContent = `👤 ${updatedUsername}`;
    alert('Profile updated successfully!');
  }
});

// Logout button
logoutBtn.addEventListener('click', () => {
  localStorage.clear();
  alert('You have been logged out.');
  window.location.href = 'index.html'; // Redirect to homepage/login
});

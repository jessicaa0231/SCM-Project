if (!localStorage.getItem('username')) {
    localStorage.setItem('username', 'Alice');
  }
  const username = localStorage.getItem('username') || 'User';
  document.getElementById('username').textContent = username;
  document.getElementById('top-username').textContent = 👤 ${username};
  // Get capsules from localStorage
  const capsules = JSON.parse(localStorage.getItem('capsules')) || [];
  // Total Capsules
  document.getElementById('totalCapsules').textContent = capsules.length;
  // Upcoming Unlocks and Next Unlock Calculation
  const now = new Date();
  const futureCapsules = capsules.filter(capsule => new Date(capsule.unlockDate) > now);
  document.getElementById('upcomingUnlocks').textContent = futureCapsules.length;
  if (futureCapsules.length > 0) {
    const nextUnlockDate = futureCapsules
      .map(c => new Date(c.unlockDate))
      .sort((a, b) => a - b)[0];
    const daysLeft = Math.ceil((nextUnlockDate - now) / (1000 * 60 * 60 * 24));
    document.getElementById('nextUnlock').textContent = ${daysLeft} Days;
  } else {
    document.getElementById('nextUnlock').textContent = 'N/A';
  }

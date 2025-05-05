
const username = localStorage.getItem('username');
document.getElementById('top-username').textContent = `👤 ${username || 'User'}`;


const capsuleList = document.getElementById('capsuleList');
let capsules = JSON.parse(localStorage.getItem('capsules')) || [];

function renderCapsules() {
  capsuleList.innerHTML = "";

  if (capsules.length === 0) {
    capsuleList.innerHTML = `<div class="no-capsules">No capsules found. Create one!</div>`;
    return;
  }

  const currentDate = new Date();

  capsules.forEach((capsule, index) => {
    const card = document.createElement('div');
    card.className = 'capsule-card';

    const unlockDate = new Date(capsule.unlockDate);
    const isUnlocked = currentDate >= unlockDate;

    if (isUnlocked) {
      card.innerHTML = `
        <h3>${capsule.title} <span class="unlocked-badge">✅ Unlocked</span></h3>
        <p><strong>Description:</strong> ${capsule.description || 'N/A'}</p>
        <p><strong>Message:</strong> ${capsule.message}</p>
        <p><strong>Category:</strong> ${capsule.category}</p>
        <p><strong>Folder:</strong> ${capsule.folder || 'None'}</p>
        <p><strong>Unlock Date:</strong> ${unlockDate.toLocaleString()}</p>
        <p><strong>Created At:</strong> ${new Date(capsule.createdAt).toLocaleString()}</p>
        ${capsule.imageData ? `<img src="${capsule.imageData}" alt="Capsule Image">` : ''}
        <button class="delete-btn" data-index="${index}">🗑 Delete</button>
      `;
    } else {
      card.innerHTML = `
        <h3>${capsule.title} <span class="locked-badge">🔒 Locked</span></h3>
        <p><em>Unlocks on ${unlockDate.toLocaleString()}</em></p>
      `;
    }

    capsuleList.appendChild(card);
  });

  document.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const index = e.target.getAttribute('data-index');
      if (confirm('Are you sure you want to delete this capsule?')) {
        capsules.splice(index, 1);
        localStorage.setItem('capsules', JSON.stringify(capsules));
        renderCapsules();
      }
    });
  });
}

renderCapsules();

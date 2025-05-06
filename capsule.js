document.getElementById('customCapsuleForm').onsubmit = function(e) {
  e.preventDefault();
  // ... gather form data ...
  const capsules = JSON.parse(localStorage.getItem('capsules') || '[]');
  capsules.push({ /* capsule data */ });
  localStorage.setItem('capsules', JSON.stringify(capsules));
  // Optionally redirect:
  window.location.href = 'mycapsule.html';
};

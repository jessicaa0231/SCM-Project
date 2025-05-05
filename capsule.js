document.querySelector(".capsule-form").addEventListener("submit", function (e) {
    e.preventDefault();
  
    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const message = document.getElementById("message").value.trim();
    const category = document.getElementById("category").value;
    const unlockDate = document.getElementById("unlock-date").value;
    const folder = document.getElementById("folder").value.trim();
    const imageInput = document.getElementById("image");
    const imageFile = imageInput.files[0];
  
    const saveCapsule = (imageData) => {
      const newCapsule = {
        title,
        description,
        message,
        category,
        unlockDate,
        folder,
        imageData: imageData || null,
        createdAt: new Date().toISOString(),
      };
  
      // Get existing capsules or start new array
      const existingCapsules = JSON.parse(localStorage.getItem("capsules")) || [];
      existingCapsules.push(newCapsule);
      localStorage.setItem("capsules", JSON.stringify(existingCapsules));
  
      // ✅ Redirect AFTER saving
      window.location.href = "mycapsule.html";
    };
  
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = () => saveCapsule(reader.result);
      reader.readAsDataURL(imageFile);
    } else {
      saveCapsule(null);
    }
  });
  
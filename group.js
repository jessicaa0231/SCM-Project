document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const tabBtns = document.querySelectorAll(".tab-btn")
  const tabContents = document.querySelectorAll(".tab-content")
  const memoryForm = document.getElementById("group-memory-form")
  const memoryImageInput = document.getElementById("group-memory-image")
  const imagePreviewContainer = document.getElementById("image-preview-container")
  const imagePreview = document.getElementById("image-preview")
  const removeImageBtn = document.getElementById("remove-image")
  const memoriesContainer = document.getElementById("group-memories-container")
  const noMemoriesEl = document.getElementById("no-group-memories")
  const searchInput = document.getElementById("search-group-memories")
  const chronologicalViewBtn = document.getElementById("chronological-view")
  const galleryViewBtn = document.getElementById("gallery-view")
  const welcomeModal = document.getElementById("welcome-modal")
  const memoryDetailModal = document.getElementById("memory-detail-modal")
  const closeModalBtns = document.querySelectorAll(".close-modal")
  const getStartedBtn = document.getElementById("get-started")
  const currentYearEl = document.getElementById("current-year")

  // Set current year
  currentYearEl.textContent = new Date().getFullYear()

  // Initialize group memories array
  let groupMemories = JSON.parse(localStorage.getItem("groupMemories")) || []

  // Show welcome modal on first visit
  if (!localStorage.getItem("groupWelcomeShown")) {
    welcomeModal.style.display = "block"
    localStorage.setItem("groupWelcomeShown", "true")
  }

  // Tab Navigation
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tabId = btn.getAttribute("data-tab")
      tabBtns.forEach((b) => b.classList.remove("active"))
      btn.classList.add("active")
      tabContents.forEach((content) => {
        content.classList.remove("active")
        if (content.id === tabId) {
          content.classList.add("active")
          if (tabId === "view-memories") {
            displayGroupMemories()
          }
        }
      })
    })
  })

  // Image Preview
  memoryImageInput.addEventListener("change", (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        imagePreview.src = event.target.result
        imagePreviewContainer.classList.remove("hidden")
      }
      reader.readAsDataURL(file)
    }
  })

  // Remove Image
  removeImageBtn.addEventListener("click", () => {
    imagePreview.src = ""
    imagePreviewContainer.classList.add("hidden")
    memoryImageInput.value = ""
  })

  // Add/Edit Memory
  memoryForm.addEventListener("submit", (e) => {
    e.preventDefault()
    const title = document.getElementById("group-memory-title").value
    const date = document.getElementById("group-memory-date").value
    const members = document.getElementById("group-memory-members").value
    const text = document.getElementById("group-memory-text").value
    let imageData = null

    if (memoryImageInput.files.length > 0) {
      const reader = new FileReader()
      reader.onload = (event) => {
        imageData = event.target.result
        saveGroupMemory(title, date, members, text, imageData)
      }
      reader.readAsDataURL(memoryImageInput.files[0])
    } else {
      saveGroupMemory(title, date, members, text, imageData)
    }
  })

  function saveGroupMemory(title, date, members, text, imageData, id = null) {
    const memory = {
      id: id || Date.now().toString(),
      title,
      date,
      members,
      text,
      imageData,
      createdAt: id
        ? groupMemories.find((m) => m.id === id)?.createdAt || new Date().toISOString()
        : new Date().toISOString(),
    }

    if (id) {
      const index = groupMemories.findIndex((m) => m.id === id)
      if (index !== -1) {
        groupMemories[index] = memory
      }
    } else {
      groupMemories.push(memory)
    }

    localStorage.setItem("groupMemories", JSON.stringify(groupMemories))

    memoryForm.reset()
    imagePreview.src = ""
    imagePreviewContainer.classList.add("hidden")

    alert(id ? "Group memory updated successfully!" : "Group memory saved successfully!")
    document.querySelector('[data-tab="view-memories"]').click()
  }

  function displayGroupMemories(searchTerm = "") {
    let filteredMemories = groupMemories
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filteredMemories = groupMemories.filter(
        (memory) =>
          memory.title.toLowerCase().includes(term) ||
          memory.text.toLowerCase().includes(term) ||
          memory.members.toLowerCase().includes(term) ||
          new Date(memory.date).toLocaleDateString().includes(term),
      )
    }

    filteredMemories.sort((a, b) => new Date(b.date) - new Date(a.date))

    memoriesContainer.innerHTML = ""

    if (filteredMemories.length === 0) {
      memoriesContainer.appendChild(noMemoriesEl)
      return
    }

    filteredMemories.forEach((memory) => {
      const memoryCard = document.createElement("div")
      memoryCard.className = "memory-card"

      const formattedDate = new Date(memory.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })

      memoryCard.innerHTML = `
        ${memory.imageData ? `<img src="${memory.imageData}" alt="${memory.title}" class="memory-image">` : ""}
        <div class="memory-content">
          <div class="memory-header">
            <h3 class="memory-title">${memory.title}</h3>
            <span class="memory-date">${formattedDate}</span>
          </div>
          <div class="memory-members"><i class="fas fa-user-friends"></i> ${memory.members}</div>
          <p class="memory-text">${memory.text}</p>
          <div class="memory-actions">
            <button class="btn-action btn-view" data-id="${memory.id}"><i class="fas fa-eye"></i> View</button>
            <button class="btn-action btn-edit" data-id="${memory.id}"><i class="fas fa-edit"></i> Edit</button>
            <button class="btn-action btn-delete" data-id="${memory.id}"><i class="fas fa-trash"></i> Delete</button>
          </div>
        </div>
      `
      memoriesContainer.appendChild(memoryCard)
    })

    addMemoryActionListeners()
  }

  function addMemoryActionListeners() {
    document.querySelectorAll(".btn-view").forEach((btn) => {
      btn.addEventListener("click", () => viewGroupMemory(btn.dataset.id))
    })
    document.querySelectorAll(".btn-edit").forEach((btn) => {
      btn.addEventListener("click", () => editGroupMemory(btn.dataset.id))
    })
    document.querySelectorAll(".btn-delete").forEach((btn) => {
      btn.addEventListener("click", () => deleteGroupMemory(btn.dataset.id))
    })
  }

  function viewGroupMemory(id) {
    const memory = groupMemories.find((m) => m.id === id)
    if (!memory) return

    const formattedDate = new Date(memory.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const detailContent = document.getElementById("memory-detail-content")
    detailContent.innerHTML = `
      ${memory.imageData ? `<img src="${memory.imageData}" alt="${memory.title}" class="detail-image">` : ""}
      <div class="detail-header">
        <h2 class="detail-title">${memory.title}</h2>
        <span class="detail-date">${formattedDate}</span>
      </div>
      <div class="detail-members"><i class="fas fa-user-friends"></i> ${memory.members}</div>
      <p class="detail-text">${memory.text}</p>
      <div class="detail-actions">
        <button class="btn-action btn-edit" data-id="${memory.id}"><i class="fas fa-edit"></i> Edit</button>
        <button class="btn-action btn-delete" data-id="${memory.id}"><i class="fas fa-trash"></i> Delete</button>
      </div>
    `

    memoryDetailModal.style.display = "block"

    detailContent.querySelector(".btn-edit").addEventListener("click", () => {
      memoryDetailModal.style.display = "none"
      editGroupMemory(id)
    })

    detailContent.querySelector(".btn-delete").addEventListener("click", () => {
      memoryDetailModal.style.display = "none"
      deleteGroupMemory(id)
    })
  }

  function editGroupMemory(id) {
    const memory = groupMemories.find((m) => m.id === id)
    if (!memory) return

    document.getElementById("group-memory-title").value = memory.title
    document.getElementById("group-memory-date").value = memory.date
    document.getElementById("group-memory-members").value = memory.members
    document.getElementById("group-memory-text").value = memory.text

    if (memory.imageData) {
      imagePreview.src = memory.imageData
      imagePreviewContainer.classList.remove("hidden")
    } else {
      imagePreviewContainer.classList.add("hidden")
    }

    document.querySelector('[data-tab="add-memory"]').click()

    const originalSubmit = memoryForm.onsubmit
    memoryForm.onsubmit = (e) => {
      e.preventDefault()

      const title = document.getElementById("group-memory-title").value
      const date = document.getElementById("group-memory-date").value
      const members = document.getElementById("group-memory-members").value
      const text = document.getElementById("group-memory-text").value

      if (memoryImageInput.files.length > 0) {
        const reader = new FileReader()
        reader.onload = (event) => {
          saveGroupMemory(title, date, members, text, event.target.result, id)
        }
        reader.readAsDataURL(memoryImageInput.files[0])
      } else {
        const imageData = imagePreviewContainer.classList.contains("hidden") ? null : memory.imageData
        saveGroupMemory(title, date, members, text, imageData, id)
      }

      memoryForm.onsubmit = originalSubmit
    }
  }

  function deleteGroupMemory(id) {
    if (confirm("Are you sure you want to delete this group memory?")) {
      groupMemories = groupMemories.filter((memory) => memory.id !== id)
      localStorage.setItem("groupMemories", JSON.stringify(groupMemories))
      displayGroupMemories()
    }
  }

  searchInput.addEventListener("input", function () {
    displayGroupMemories(this.value)
  })

  chronologicalViewBtn.addEventListener("click", () => {
    memoriesContainer.className = "chronological"
    chronologicalViewBtn.classList.add("active")
    galleryViewBtn.classList.remove("active")
  })

  galleryViewBtn.addEventListener("click", () => {
    memoriesContainer.className = "gallery"
    galleryViewBtn.classList.add("active")
    chronologicalViewBtn.classList.remove("active")
  })

  closeModalBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      welcomeModal.style.display = "none"
      memoryDetailModal.style.display = "none"
    })
  })

  window.addEventListener("click", (e) => {
    if (e.target === welcomeModal) {
      welcomeModal.style.display = "none"
    }
    if (e.target === memoryDetailModal) {
      memoryDetailModal.style.display = "none"
    }
  })

  getStartedBtn.addEventListener("click", () => {
    welcomeModal.style.display = "none"
  })

  // Load memories initially
  displayGroupMemories()
})
:root {
  --primary-color: #4f8cff;         /* Vibrant blue */
  --secondary-color: #ffb84f;       /* Warm orange */
  --accent-color: #ffe066;          /* Soft yellow */
  --dark-color: #22223b;
  --light-color: #f8f9fa;
  --shadow: 0 4px 12px rgba(0, 0, 0, 0.09);
  --border-radius: 12px;
  --transition: all 0.3s cubic-bezier(.4,0,.2,1);
}

body {
  font-family: "Poppins", sans-serif;
  background: linear-gradient(120deg, #f8f9fa 0%, #e0e7ff 100%);
  color: var(--dark-color);
  line-height: 1.6;
}

header {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  padding: 32px;
  text-align: center;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  margin-bottom: 24px;
}

header h1 {
  font-size: 2.5rem;
  margin-bottom: 8px;
  letter-spacing: 1px;
}

.tagline {
  font-size: 1.2rem;
  font-style: italic;
  opacity: 0.95;
}

.tabs {
  display: flex;
  justify-content: center;
  margin: 20px 0 10px 0;
  gap: 12px;
}

.tab-btn {
  background: white;
  color: var(--primary-color);
  border: 2px solid var(--primary-color);
  font-family: "Poppins", sans-serif;
  padding: 10px 28px;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 1.1rem;
  transition: var(--transition);
}

.tab-btn.active {
  background: var(--primary-color);
  color: white;
  font-weight: 600;
}

.tab-content {
  display: none;
  margin-top: 20px;
}
.tab-content.active {
  display: block;
}

.form-container {
  background: white;
  padding: 32px;
  border: 2px dashed var(--accent-color);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  max-width: 520px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 20px;
}

input[type="text"],
input[type="date"],
textarea {
  width: 100%;
  padding: 10px;
  border: 1.5px solid #b5d0ff;
  border-radius: var(--border-radius);
  font-size: 1rem;
  font-family: "Poppins", sans-serif;
  transition: var(--transition);
}

input:focus,
textarea:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 6px var(--primary-color);
  outline: none;
}

input[type="file"] {
  font-size: 1rem;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  padding: 12px 32px;
  font-size: 1.1rem;
  cursor: pointer;
  font-family: "Poppins", sans-serif;
  transition: var(--transition);
}

.btn-primary:hover {
  background: var(--secondary-color);
  color: var(--dark-color);
}

.btn-remove {
  background: none;
  border: none;
  color: #ff6f61;
  font-size: 1.2rem;
  cursor: pointer;
  margin-left: 10px;
}

#image-preview-container {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

#image-preview-container.hidden {
  display: none;
}

#image-preview {
  max-width: 80px;
  max-height: 80px;
  border-radius: var(--border-radius);
  border: 1px solid #b5d0ff;
}

.memories-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-container input {
  padding: 8px 12px;
  border-radius: var(--border-radius);
  border: 1.5px solid #b5d0ff;
  font-size: 1rem;
  font-family: "Poppins", sans-serif;
}

.view-options {
  display: flex;
  gap: 10px;
}

.view-btn {
  background: white;
  border: 1.5px solid var(--primary-color);
  color: var(--primary-color);
  padding: 7px 18px;
  border-radius: var(--border-radius);
  font-size: 1rem;
  cursor: pointer;
  transition: var(--transition);
}

.view-btn.active {
  background: var(--primary-color);
  color: white;
}

#group-memories-container.chronological .memory-card {
  margin-bottom: 20px;
}

#group-memories-container.gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
}

#group-memories-container.gallery .memory-card {
  width: calc(33% - 12px);
  margin-bottom: 0;
}

.memory-card {
  border: 1.5px solid #b5d0ff;
  background: #f0f4ff;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  padding: 18px;
  display: flex;
  gap: 18px;
  align-items: flex-start;
  transition: var(--transition);
}

.memory-card:hover {
  box-shadow: 0 6px 24px rgba(79,140,255,0.15);
}

.memory-image {
  max-width: 90px;
  max-height: 90px;
  border-radius: var(--border-radius);
  object-fit: cover;
  border: 1px solid var(--primary-color);
}

.memory-content {
  flex: 1;
}

.memory-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.memory-title {
  font-family: "Poppins", sans-serif;
  font-weight: bold;
  font-size: 1.1rem;
  margin: 0;
}

.memory-date {
  color: #6c757d;
  font-size: 0.95rem;
}

.memory-members {
  color: var(--secondary-color);
  font-size: 0.97rem;
  margin-bottom: 6px;
}

.memory-text {
  font-style: italic;
  color: #495057;
  margin: 10px 0;
}

.memory-actions {
  display: flex;
  gap: 8px;
}

.btn-action {
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 1rem;
  cursor: pointer;
  transition: color 0.2s;
  padding: 0 6px;
}

.btn-action:hover {
  color: var(--secondary-color);
}

.empty-state {
  text-align: center;
  color: #bbb;
  margin-top: 40px;
}

.modal {
  display: none;
  position: fixed;
  z-index: 999;
  left: 0; top: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.18);
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: #f8f9fa;
  border: 2px solid var(--primary-color);
  border-radius: var(--border-radius);
  padding: 34px 36px;
  max-width: 420px;
  margin: auto;
  position: relative;
  box-shadow: var(--shadow);
}

.close-modal {
  position: absolute;
  top: 14px;
  right: 16px;
  font-size: 1.5rem;
  color: #ff6f61;
  cursor: pointer;
}

#memory-detail-content img.detail-image {
  max-width: 100%;
  border-radius: var(--border-radius);
  margin-bottom: 18px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-title {
  font-size: 1.3rem;
  font-family: "Poppins", sans-serif;
  font-weight: bold;
}

.detail-date {
  color: #6c757d;
  font-size: 1rem;
}

.detail-members {
  color: var(--secondary-color);
  font-size: 0.98rem;
  margin-bottom: 8px;
}

.detail-text {
  margin: 12px 0;
  font-style: italic;
}

.detail-actions {
  display: flex;
  gap: 10px;
}

footer {
  text-align: center;
  padding: 18px 0;
  font-style: italic;
  color: #bbb;
  margin-top: 40px;
}


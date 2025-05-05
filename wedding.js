document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const tabBtns = document.querySelectorAll(".tab-btn")
    const tabContents = document.querySelectorAll(".tab-content")
    const memoryForm = document.getElementById("wedding-memory-form")
    const memoryImageInput = document.getElementById("wedding-memory-image")
    const imagePreviewContainer = document.getElementById("image-preview-container")
    const imagePreview = document.getElementById("image-preview")
    const removeImageBtn = document.getElementById("remove-image")
    const memoriesContainer = document.getElementById("wedding-memories-container")
    const noMemoriesEl = document.getElementById("no-wedding-memories")
    const searchInput = document.getElementById("search-wedding-memories")
    const chronologicalViewBtn = document.getElementById("chronological-view")
    const galleryViewBtn = document.getElementById("gallery-view")
    const welcomeModal = document.getElementById("welcome-modal")
    const memoryDetailModal = document.getElementById("memory-detail-modal")
    const closeModalBtns = document.querySelectorAll(".close-modal")
    const getStartedBtn = document.getElementById("get-started")
    const currentYearEl = document.getElementById("current-year")
  
    // Set current year
    currentYearEl.textContent = new Date().getFullYear()
  
    // Initialize wedding memories array
    let weddingMemories = JSON.parse(localStorage.getItem("weddingMemories")) || []
  
    // Show welcome modal on first visit
    if (!localStorage.getItem("weddingWelcomeShown")) {
      welcomeModal.style.display = "block"
      localStorage.setItem("weddingWelcomeShown", "true")
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
              displayWeddingMemories()
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
      const title = document.getElementById("wedding-memory-title").value
      const date = document.getElementById("wedding-memory-date").value
      const text = document.getElementById("wedding-memory-text").value
      let imageData = null
  
      if (memoryImageInput.files.length > 0) {
        const reader = new FileReader()
        reader.onload = (event) => {
          imageData = event.target.result
          saveWeddingMemory(title, date, text, imageData)
        }
        reader.readAsDataURL(memoryImageInput.files[0])
      } else {
        saveWeddingMemory(title, date, text, imageData)
      }
    })
  
    function saveWeddingMemory(title, date, text, imageData, id = null) {
      const memory = {
        id: id || Date.now().toString(),
        title,
        date,
        text,
        imageData,
        createdAt: id
          ? weddingMemories.find((m) => m.id === id)?.createdAt || new Date().toISOString()
          : new Date().toISOString(),
      }
  
      if (id) {
        const index = weddingMemories.findIndex((m) => m.id === id)
        if (index !== -1) {
          weddingMemories[index] = memory
        }
      } else {
        weddingMemories.push(memory)
      }
  
      localStorage.setItem("weddingMemories", JSON.stringify(weddingMemories))
  
      memoryForm.reset()
      imagePreview.src = ""
      imagePreviewContainer.classList.add("hidden")
  
      alert(id ? "Memory updated successfully!" : "Wedding memory saved successfully!")
      document.querySelector('[data-tab="view-memories"]').click()
    }
  
    function displayWeddingMemories(searchTerm = "") {
      let filteredMemories = weddingMemories
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        filteredMemories = weddingMemories.filter(
          (memory) =>
            memory.title.toLowerCase().includes(term) ||
            memory.text.toLowerCase().includes(term) ||
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
          ${memory.imageData ? <img src="${memory.imageData}" alt="${memory.title}" class="memory-image"> : ""}
          <div class="memory-content">
            <div class="memory-header">
              <h3 class="memory-title">${memory.title}</h3>
              <span class="memory-date">${formattedDate}</span>
            </div>
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
        btn.addEventListener("click", () => viewWeddingMemory(btn.dataset.id))
      })
      document.querySelectorAll(".btn-edit").forEach((btn) => {
        btn.addEventListener("click", () => editWeddingMemory(btn.dataset.id))
      })
      document.querySelectorAll(".btn-delete").forEach((btn) => {
        btn.addEventListener("click", () => deleteWeddingMemory(btn.dataset.id))
      })
    }
  
    function viewWeddingMemory(id) {
      const memory = weddingMemories.find((m) => m.id === id)
      if (!memory) return
  
      const formattedDate = new Date(memory.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
  
      const detailContent = document.getElementById("memory-detail-content")
      detailContent.innerHTML = `
        ${memory.imageData ? <img src="${memory.imageData}" alt="${memory.title}" class="detail-image"> : ""}
        <div class="detail-header">
          <h2 class="detail-title">${memory.title}</h2>
          <span class="detail-date">${formattedDate}</span>
        </div>
        <p class="detail-text">${memory.text}</p>
        <div class="detail-actions">
          <button class="btn-action btn-edit" data-id="${memory.id}"><i class="fas fa-edit"></i> Edit</button>
          <button class="btn-action btn-delete" data-id="${memory.id}"><i class="fas fa-trash"></i> Delete</button>
        </div>
      `
  
      memoryDetailModal.style.display = "block"
  
      detailContent.querySelector(".btn-edit").addEventListener("click", () => {
        memoryDetailModal.style.display = "none"
        editWeddingMemory(id)
      })
  
      detailContent.querySelector(".btn-delete").addEventListener("click", () => {
        memoryDetailModal.style.display = "none"
        deleteWeddingMemory(id)
      })
    }
  
    function editWeddingMemory(id) {
      const memory = weddingMemories.find((m) => m.id === id)
      if (!memory) return
  
      document.getElementById("wedding-memory-title").value = memory.title
      document.getElementById("wedding-memory-date").value = memory.date
      document.getElementById("wedding-memory-text").value = memory.text
  
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
  
        const title = document.getElementById("wedding-memory-title").value
        const date = document.getElementById("wedding-memory-date").value
        const text = document.getElementById("wedding-memory-text").value
  
        if (memoryImageInput.files.length > 0) {
          const reader = new FileReader()
          reader.onload = (event) => {
            saveWeddingMemory(title, date, text, event.target.result, id)
          }
          reader.readAsDataURL(memoryImageInput.files[0])
        } else {
          const imageData = imagePreviewContainer.classList.contains("hidden") ? null : memory.imageData
          saveWeddingMemory(title, date, text, imageData, id)
        }
  
        memoryForm.onsubmit = originalSubmit
      }
    }
  
    function deleteWeddingMemory(id) {
      if (confirm("Are you sure you want to delete this special moment?")) {
        weddingMemories = weddingMemories.filter((memory) => memory.id !== id)
        localStorage.setItem("weddingMemories", JSON.stringify(weddingMemories))
        displayWeddingMemories()
      }
    }
  
    searchInput.addEventListener("input", function () {
      displayWeddingMemories(this.value)
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
    displayWeddingMemories()
  })
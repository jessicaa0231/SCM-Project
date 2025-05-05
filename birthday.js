document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const tabBtns = document.querySelectorAll(".tab-btn")
    const tabContents = document.querySelectorAll(".tab-content")
    const memoryForm = document.getElementById("memory-form")
    const memoryImageInput = document.getElementById("memory-image")
    const imagePreviewContainer = document.getElementById("image-preview-container")
    const imagePreview = document.getElementById("image-preview")
    const removeImageBtn = document.getElementById("remove-image")
    const memoriesContainer = document.getElementById("memories-container")
    const noMemoriesEl = document.getElementById("no-memories")
    const searchInput = document.getElementById("search-memories")
    const chronologicalViewBtn = document.getElementById("chronological-view")
    const galleryViewBtn = document.getElementById("gallery-view")
    const welcomeModal = document.getElementById("welcome-modal")
    const memoryDetailModal = document.getElementById("memory-detail-modal")
    const closeModalBtns = document.querySelectorAll(".close-modal")
    const getStartedBtn = document.getElementById("get-started")
    const currentYearEl = document.getElementById("current-year")
  
    // Set current year in footer
    currentYearEl.textContent = new Date().getFullYear()
  
    // Initialize memories array from localStorage
    let memories = JSON.parse(localStorage.getItem("birthdayMemories")) || []
  
    // Show welcome modal if first visit
    if (!localStorage.getItem("welcomeShown")) {
      welcomeModal.style.display = "block"
      localStorage.setItem("welcomeShown", "true")
    }
  
    // Tab Navigation
    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const tabId = btn.getAttribute("data-tab")
  
        // Update active tab button
        tabBtns.forEach((b) => b.classList.remove("active"))
        btn.classList.add("active")
  
        // Show selected tab content
        tabContents.forEach((content) => {
          content.classList.remove("active")
          if (content.id === tabId) {
            content.classList.add("active")
  
            // If switching to view memories tab, refresh the memories display
            if (tabId === "view-memories") {
              displayMemories()
            }
          }
        })
      })
    })
  
    // Image Preview Functionality
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
  
    // Remove Image Preview
    removeImageBtn.addEventListener("click", () => {
      imagePreview.src = ""
      imagePreviewContainer.classList.add("hidden")
      memoryImageInput.value = ""
    })
  
    // Memory Form Submission
    memoryForm.addEventListener("submit", (e) => {
      e.preventDefault()
  
      const title = document.getElementById("memory-title").value
      const date = document.getElementById("memory-date").value
      const text = document.getElementById("memory-text").value
      let imageData = null
  
      if (memoryImageInput.files.length > 0) {
        const reader = new FileReader()
        reader.onload = (event) => {
          imageData = event.target.result
          saveMemory(title, date, text, imageData)
        }
        reader.readAsDataURL(memoryImageInput.files[0])
      } else {
        saveMemory(title, date, text, imageData)
      }
    })
  
    // Save Memory Function
    function saveMemory(title, date, text, imageData, id = null) {
      const memory = {
        id: id || Date.now().toString(),
        title,
        date,
        text,
        imageData,
        createdAt: id
          ? memories.find((m) => m.id === id)?.createdAt || new Date().toISOString()
          : new Date().toISOString(),
      }
  
      if (id) {
        // Update existing memory
        const index = memories.findIndex((m) => m.id === id)
        if (index !== -1) {
          memories[index] = memory
        }
      } else {
        // Add new memory
        memories.push(memory)
      }
  
      // Save to localStorage
      localStorage.setItem("birthdayMemories", JSON.stringify(memories))
  
      // Reset form
      memoryForm.reset()
      imagePreview.src = ""
      imagePreviewContainer.classList.add("hidden")
  
      // Show success message
      alert(id ? "Memory updated successfully!" : "Memory saved successfully!")
  
      // Switch to view memories tab
      document.querySelector('[data-tab="view-memories"]').click()
    }
  
    // Display Memories
    function displayMemories(searchTerm = "") {
      // Filter memories based on search term if provided
      let filteredMemories = memories
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        filteredMemories = memories.filter(
          (memory) =>
            memory.title.toLowerCase().includes(term) ||
            memory.text.toLowerCase().includes(term) ||
            new Date(memory.date).toLocaleDateString().includes(term),
        )
      }
  
      // Sort memories by date (newest first)
      filteredMemories.sort((a, b) => new Date(b.date) - new Date(a.date))
  
      // Clear current memories display
      memoriesContainer.innerHTML = ""
  
      // Show empty state if no memories
      if (filteredMemories.length === 0) {
        memoriesContainer.appendChild(noMemoriesEl)
        return
      }
  
      // Create memory cards
      filteredMemories.forEach((memory) => {
        const memoryCard = document.createElement("div")
        memoryCard.className = "memory-card"
  
        // Format date
        const formattedDate = new Date(memory.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
  
        // Create memory card HTML
        memoryCard.innerHTML = `
                  ${memory.imageData ? `<img src="${memory.imageData}" alt="${memory.title}" class="memory-image">` : ""}
                  <div class="memory-content">
                      <div class="memory-header">
                          <h3 class="memory-title">${memory.title}</h3>
                          <span class="memory-date">${formattedDate}</span>
                      </div>
                      <p class="memory-text">${memory.text}</p>
                      <div class="memory-actions">
                          <button class="btn-action btn-view" data-id="${memory.id}">
                              <i class="fas fa-eye"></i> View
                          </button>
                          <button class="btn-action btn-edit" data-id="${memory.id}">
                              <i class="fas fa-edit"></i> Edit
                          </button>
                          <button class="btn-action btn-delete" data-id="${memory.id}">
                              <i class="fas fa-trash"></i> Delete
                          </button>
                      </div>
                  </div>
              `
  
        memoriesContainer.appendChild(memoryCard)
      })
  
      // Add event listeners to memory action buttons
      addMemoryActionListeners()
    }
  
    // Add event listeners to memory action buttons
    function addMemoryActionListeners() {
      // View memory
      document.querySelectorAll(".btn-view").forEach((btn) => {
        btn.addEventListener("click", function () {
          const memoryId = this.getAttribute("data-id")
          viewMemory(memoryId)
        })
      })
  
      // Edit memory
      document.querySelectorAll(".btn-edit").forEach((btn) => {
        btn.addEventListener("click", function () {
          const memoryId = this.getAttribute("data-id")
          editMemory(memoryId)
        })
      })
  
      // Delete memory
      document.querySelectorAll(".btn-delete").forEach((btn) => {
        btn.addEventListener("click", function () {
          const memoryId = this.getAttribute("data-id")
          deleteMemory(memoryId)
        })
      })
    }
  
    // View Memory
    function viewMemory(id) {
      const memory = memories.find((m) => m.id === id)
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
              <p class="detail-text">${memory.text}</p>
              <div class="detail-actions">
                  <button class="btn-action btn-edit" data-id="${memory.id}">
                      <i class="fas fa-edit"></i> Edit
                  </button>
                  <button class="btn-action btn-delete" data-id="${memory.id}">
                      <i class="fas fa-trash"></i> Delete
                  </button>
              </div>
          `
  
      // Show modal
      memoryDetailModal.style.display = "block"
  
      // Add event listeners to action buttons in modal
      detailContent.querySelector(".btn-edit").addEventListener("click", () => {
        memoryDetailModal.style.display = "none"
        editMemory(id)
      })
  
      detailContent.querySelector(".btn-delete").addEventListener("click", () => {
        memoryDetailModal.style.display = "none"
        deleteMemory(id)
      })
    }
  
    // Edit Memory
    function editMemory(id) {
      const memory = memories.find((m) => m.id === id)
      if (!memory) return
  
      // Fill form with memory data
      document.getElementById("memory-title").value = memory.title
      document.getElementById("memory-date").value = memory.date
      document.getElementById("memory-text").value = memory.text
  
      // Show image preview if available
      if (memory.imageData) {
        imagePreview.src = memory.imageData
        imagePreviewContainer.classList.remove("hidden")
      } else {
        imagePreviewContainer.classList.add("hidden")
      }
  
      // Switch to add memory tab
      document.querySelector('[data-tab="add-memory"]').click()
  
      // Update form submission handler
      const originalSubmitHandler = memoryForm.onsubmit
      memoryForm.onsubmit = (e) => {
        e.preventDefault()
  
        const title = document.getElementById("memory-title").value
        const date = document.getElementById("memory-date").value
        const text = document.getElementById("memory-text").value
  
        // If image was changed
        if (memoryImageInput.files.length > 0) {
          const reader = new FileReader()
          reader.onload = (event) => {
            saveMemory(title, date, text, event.target.result, id)
          }
          reader.readAsDataURL(memoryImageInput.files[0])
        } else {
          // Use existing image or null if removed
          const imageData = imagePreviewContainer.classList.contains("hidden") ? null : memory.imageData
          saveMemory(title, date, text, imageData, id)
        }
  
        // Restore original submit handler
        memoryForm.onsubmit = originalSubmitHandler
      }
    }
  
    // Delete Memory
    function deleteMemory(id) {
      if (confirm("Are you sure you want to delete this memory?")) {
        memories = memories.filter((memory) => memory.id !== id)
        localStorage.setItem("birthdayMemories", JSON.stringify(memories))
        displayMemories()
      }
    }
  
    // Search Functionality
    searchInput.addEventListener("input", function () {
      displayMemories(this.value)
    })
  
    // View Toggle (Chronological/Gallery)
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
  
    // Close Modals
    closeModalBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        welcomeModal.style.display = "none"
        memoryDetailModal.style.display = "none"
      })
    })
  
    // Close modal when clicking outside
    window.addEventListener("click", (e) => {
      if (e.target === welcomeModal) {
        welcomeModal.style.display = "none"
      }
      if (e.target === memoryDetailModal) {
        memoryDetailModal.style.display = "none"
      }
    })
  
    // Get Started button
    getStartedBtn.addEventListener("click", () => {
      welcomeModal.style.display = "none"
    })
  
    // Initial display of memories
    displayMemories()
  })

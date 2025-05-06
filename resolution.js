document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const tabBtns = document.querySelectorAll(".tab-btn")
  const tabContents = document.querySelectorAll(".tab-content")
  const resolutionForm = document.getElementById("resolution-form")
  const resolutionImageInput = document.getElementById("resolution-image")
  const imagePreviewContainer = document.getElementById("image-preview-container")
  const imagePreview = document.getElementById("image-preview")
  const removeImageBtn = document.getElementById("remove-image")
  const resolutionsContainer = document.getElementById("resolutions-container")
  const noResolutionsEl = document.getElementById("no-resolutions")
  const searchInput = document.getElementById("search-resolutions")
  const chronologicalViewBtn = document.getElementById("chronological-view")
  const galleryViewBtn = document.getElementById("gallery-view")
  const welcomeModal = document.getElementById("welcome-modal")
  const resolutionDetailModal = document.getElementById("resolution-detail-modal")
  const closeModalBtns = document.querySelectorAll(".close-modal")
  const getStartedBtn = document.getElementById("get-started")
  const currentYearEl = document.getElementById("current-year")

  // Set current year
  currentYearEl.textContent = new Date().getFullYear()

  // Initialize resolutions array
  let resolutions = JSON.parse(localStorage.getItem("resolutions")) || []

  // Show welcome modal on first visit
  if (!localStorage.getItem("resolutionsWelcomeShown")) {
    welcomeModal.style.display = "block"
    localStorage.setItem("resolutionsWelcomeShown", "true")
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
          if (tabId === "view-resolutions") {
            displayResolutions()
          }
        }
      })
    })
  })

  // Image Preview
  resolutionImageInput.addEventListener("change", (e) => {
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
    resolutionImageInput.value = ""
  })

  // Add/Edit Resolution
  resolutionForm.addEventListener("submit", (e) => {
    e.preventDefault()
    const title = document.getElementById("resolution-title").value
    const date = document.getElementById("resolution-date").value
    const text = document.getElementById("resolution-text").value
    let imageData = null

    if (resolutionImageInput.files.length > 0) {
      const reader = new FileReader()
      reader.onload = (event) => {
        imageData = event.target.result
        saveResolution(title, date, text, imageData)
      }
      reader.readAsDataURL(resolutionImageInput.files[0])
    } else {
      saveResolution(title, date, text, imageData)
    }
  })

  function saveResolution(title, date, text, imageData, id = null) {
    const resolution = {
      id: id || Date.now().toString(),
      title,
      date,
      text,
      imageData,
      createdAt: id
        ? resolutions.find((m) => m.id === id)?.createdAt || new Date().toISOString()
        : new Date().toISOString(),
    }

    if (id) {
      const index = resolutions.findIndex((m) => m.id === id)
      if (index !== -1) {
        resolutions[index] = resolution
      }
    } else {
      resolutions.push(resolution)
    }

    localStorage.setItem("resolutions", JSON.stringify(resolutions))

    resolutionForm.reset()
    imagePreview.src = ""
    imagePreviewContainer.classList.add("hidden")

    alert(id ? "Resolution updated successfully!" : "Resolution saved successfully!")
    document.querySelector('[data-tab="view-resolutions"]').click()
  }

  function displayResolutions(searchTerm = "") {
    let filtered = resolutions
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = resolutions.filter(
        (r) =>
          r.title.toLowerCase().includes(term) ||
          r.text.toLowerCase().includes(term) ||
          new Date(r.date).toLocaleDateString().includes(term),
      )
    }

    filtered.sort((a, b) => new Date(b.date) - new Date(a.date))

    resolutionsContainer.innerHTML = ""

    if (filtered.length === 0) {
      resolutionsContainer.appendChild(noResolutionsEl)
      return
    }

    filtered.forEach((r) => {
      const card = document.createElement("div")
      card.className = "memory-card"

      const formattedDate = new Date(r.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })

      card.innerHTML = `
        ${r.imageData ? `<img src="${r.imageData}" alt="${r.title}" class="memory-image">` : ""}
        <div class="memory-content">
          <div class="memory-header">
            <h3 class="memory-title">${r.title}</h3>
            <span class="memory-date">${formattedDate}</span>
          </div>
          <p class="memory-text">${r.text}</p>
          <div class="memory-actions">
            <button class="btn-action btn-view" data-id="${r.id}"><i class="fas fa-eye"></i> View</button>
            <button class="btn-action btn-edit" data-id="${r.id}"><i class="fas fa-edit"></i> Edit</button>
            <button class="btn-action btn-delete" data-id="${r.id}"><i class="fas fa-trash"></i> Delete</button>
          </div>
        </div>
      `
      resolutionsContainer.appendChild(card)
    })

    addResolutionActionListeners()
  }

  function addResolutionActionListeners() {
    document.querySelectorAll(".btn-view").forEach((btn) => {
      btn.addEventListener("click", () => viewResolution(btn.dataset.id))
    })
    document.querySelectorAll(".btn-edit").forEach((btn) => {
      btn.addEventListener("click", () => editResolution(btn.dataset.id))
    })
    document.querySelectorAll(".btn-delete").forEach((btn) => {
      btn.addEventListener("click", () => deleteResolution(btn.dataset.id))
    })
  }

  function viewResolution(id) {
    const r = resolutions.find((m) => m.id === id)
    if (!r) return

    const formattedDate = new Date(r.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const detailContent = document.getElementById("resolution-detail-content")
    detailContent.innerHTML = `
      ${r.imageData ? `<img src="${r.imageData}" alt="${r.title}" class="detail-image">` : ""}
      <div class="detail-header">
        <h2 class="detail-title">${r.title}</h2>
        <span class="detail-date">${formattedDate}</span>
      </div>
      <p class="detail-text">${r.text}</p>
      <div class="detail-actions">
        <button class="btn-action btn-edit" data-id="${r.id}"><i class="fas fa-edit"></i> Edit</button>
        <button class="btn-action btn-delete" data-id="${r.id}"><i class="fas fa-trash"></i> Delete</button>
      </div>
    `

    resolutionDetailModal.style.display = "block"

    detailContent.querySelector(".btn-edit").addEventListener("click", () => {
      resolutionDetailModal.style.display = "none"
      editResolution(id)
    })

    detailContent.querySelector(".btn-delete").addEventListener("click", () => {
      resolutionDetailModal.style.display = "none"
      deleteResolution(id)
    })
  }

  function editResolution(id) {
    const r = resolutions.find((m) => m.id === id)
    if (!r) return

    document.getElementById("resolution-title").value = r.title
    document.getElementById("resolution-date").value = r.date
    document.getElementById("resolution-text").value = r.text

    if (r.imageData) {
      imagePreview.src = r.imageData
      imagePreviewContainer.classList.remove("hidden")
    } else {
      imagePreviewContainer.classList.add("hidden")
    }

    document.querySelector('[data-tab="add-resolution"]').click()

    const originalSubmit = resolutionForm.onsubmit
    resolutionForm.onsubmit = (e) => {
      e.preventDefault()

      const title = document.getElementById("resolution-title").value
      const date = document.getElementById("resolution-date").value
      const text = document.getElementById("resolution-text").value

      if (resolutionImageInput.files.length > 0) {
        const reader = new FileReader()
        reader.onload = (event) => {
          saveResolution(title, date, text, event.target.result, id)
        }
        reader.readAsDataURL(resolutionImageInput.files[0])
      } else {
        const imageData = imagePreviewContainer.classList.contains("hidden") ? null : r.imageData
        saveResolution(title, date, text, imageData, id)
      }

      resolutionForm.onsubmit = originalSubmit
    }
  }

  function deleteResolution(id) {
    if (confirm("Are you sure you want to delete this resolution?")) {
      resolutions = resolutions.filter((r) => r.id !== id)
      localStorage.setItem("resolutions", JSON.stringify(resolutions))
      displayResolutions()
    }
  }

  searchInput.addEventListener("input", function () {
    displayResolutions(this.value)
  })

  chronologicalViewBtn.addEventListener("click", () => {
    resolutionsContainer.className = "chronological"
    chronologicalViewBtn.classList.add("active")
    galleryViewBtn.classList.remove("active")
  })

  galleryViewBtn.addEventListener("click", () => {
    resolutionsContainer.className = "gallery"
    galleryViewBtn.classList.add("active")
    chronologicalViewBtn.classList.remove("active")
  })

  closeModalBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      welcomeModal.style.display = "none"
      resolutionDetailModal.style.display = "none"
    })
  })

  window.addEventListener("click", (e) => {
    if (e.target === welcomeModal) {
      welcomeModal.style.display = "none"
    }
    if (e.target === resolutionDetailModal) {
      resolutionDetailModal.style.display = "none"
    }
  })

  getStartedBtn.addEventListener("click", () => {
    welcomeModal.style.display = "none"
  })

  // Load resolutions initially
  displayResolutions()
})

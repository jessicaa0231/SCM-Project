        document.addEventListener("DOMContentLoaded", () => {
            // DOM Elements
            const tabBtns = document.querySelectorAll(".tab-btn")
            const tabContents = document.querySelectorAll(".tab-content")
            const letterForm = document.getElementById("letter-form")
            const letterContent = document.getElementById("letter-content")
            const letterContentHidden = document.getElementById("letter-content-hidden")
            const editorButtons = document.querySelectorAll(".editor-toolbar button")
            const lettersContainer = document.getElementById("letters-container")
            const noLettersEl = document.getElementById("no-letters")
            const searchInputLetters = document.getElementById("search-letters")
            const filterSelect = document.getElementById("filter-letters")
            const welcomeModal = document.getElementById("welcome-modal")
            const letterDetailModal = document.getElementById("letter-detail-modal")
            const closeModalBtns = document.querySelectorAll(".close-modal")
            const getStartedBtn = document.getElementById("get-started")
            const currentYearEl = document.getElementById("current-year")
          
            // Stats elements
            const statPlaces = document.getElementById("stat-places")
            const statCountries = document.getElementById("stat-countries")
            const statMemories = document.getElementById("stat-memories")
            const statPhotos = document.getElementById("stat-photos")
            const categoryChart = document.getElementById("category-chart")
            const destinationsList = document.getElementById("destinations-list")
          
            // Memory elements
            const memoryForm = document.getElementById("memory-form")
            const memoryImagesInput = document.getElementById("memory-images")
            const imagePreviewContainer = document.getElementById("image-preview-container")
            const memoriesContainer = document.getElementById("memories-container")
            const noMemoriesEl = document.getElementById("no-memories")
            const searchInput = document.getElementById("search-memories")
            const filterCategory = document.getElementById("filter-category")
            const filterYear = document.getElementById("filter-year")
            const gridViewBtn = document.getElementById("grid-view")
            const listViewBtn = document.getElementById("list-view")
            const memoryDetailModal = document.getElementById("memory-detail-modal")
          
            // Set current year in footer
            currentYearEl.textContent = new Date().getFullYear()
          
            // Set minimum date for delivery to tomorrow
            const tomorrow = new Date()
            tomorrow.setDate(tomorrow.getDate() + 1)
            document.getElementById("delivery-date").min = tomorrow.toISOString().split("T")[0]
          
            // Initialize letters array from localStorage
            let letters = JSON.parse(localStorage.getItem("futureLetters")) || []
          
            // Initialize memories array from localStorage
            let memories = JSON.parse(localStorage.getItem("travelMemories")) || []
          
            // Image data array for the current form
            let currentImages = []
          
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
          
                    // If switching to view letters tab, refresh the letters display
                    if (tabId === "view-letters") {
                      displayLetters()
                    } else if (tabId === "view-memories") {
                      displayMemories()
                    } else if (tabId === "stats") {
                      updateStats()
                    }
                  }
                })
              })
            })
          
            // Rich Text Editor
            editorButtons.forEach((button) => {
              button.addEventListener("click", () => {
                const command = button.getAttribute("data-command")
          
                if (command === "createLink") {
                  const url = prompt("Enter the link URL:")
                  if (url) document.execCommand(command, false, url)
                } else {
                  document.execCommand(command, false, null)
                }
          
                // Focus back on the editor
                letterContent.focus()
              })
            })
          
            // Letter Form Submission
            letterForm.addEventListener("submit", (e) => {
              e.preventDefault()
          
              // Get form values
              const title = document.getElementById("letter-title").value
              const recipient = document.getElementById("recipient").value
              const deliveryDate = document.getElementById("delivery-date").value
              const emailNotification = document.getElementById("email-notification").value
          
              // Get content from the rich text editor
              letterContentHidden.value = letterContent.innerHTML
          
              // Create letter object
              const letter = {
                id: Date.now().toString(),
                title,
                recipient,
                content: letterContent.innerHTML,
                createdAt: new Date().toISOString(),
                deliveryDate,
                emailNotification,
                isOpened: false,
              }
          
              // Add to letters array
              letters.push(letter)
          
              // Save to localStorage
              localStorage.setItem("futureLetters", JSON.stringify(letters))
          
              // Reset form
              letterForm.reset()
              letterContent.innerHTML = ""
          
              // Show success message
              alert("Your letter has been sent to your future self!")
          
              // Switch to view letters tab
              document.querySelector('[data-tab="view-letters"]').click()
            })
          
            // Image Upload Preview
            memoryImagesInput.addEventListener("change", (e) => {
              const files = Array.from(e.target.files)
          
              files.forEach((file) => {
                if (file.type.match("image.*")) {
                  const reader = new FileReader()
          
                  reader.onload = (event) => {
                    const imageData = event.target.result
                    addImagePreview(imageData)
                    currentImages.push(imageData)
                  }
          
                  reader.readAsDataURL(file)
                }
              })
            })
          
            // Add Image Preview
            function addImagePreview(imageData) {
              const previewDiv = document.createElement("div")
              previewDiv.className = "image-preview"
          
              const img = document.createElement("img")
              img.src = imageData
              img.alt = "Preview"
          
              const removeBtn = document.createElement("button")
              removeBtn.className = "remove-image"
              removeBtn.innerHTML = '<i class="fas fa-times"></i>'
              removeBtn.addEventListener("click", () => {
                const index = currentImages.indexOf(imageData)
                if (index > -1) {
                  currentImages.splice(index, 1)
                }
                previewDiv.remove()
              })
          
              previewDiv.appendChild(img)
              previewDiv.appendChild(removeBtn)
              imagePreviewContainer.appendChild(previewDiv)
            }
          
            // Memory Form Submission
            memoryForm.addEventListener("submit", (e) => {
              e.preventDefault()
          
              // Get form values
              const title = document.getElementById("memory-title").value
              const location = document.getElementById("memory-location").value
              const date = document.getElementById("memory-date").value
              const category = document.getElementById("memory-category").value
              const text = document.getElementById("memory-text").value
              const companions = document.getElementById("memory-companions").value
          
              // Get rating
              const ratingInput = document.querySelector('input[name="rating"]:checked')
              const rating = ratingInput ? Number.parseInt(ratingInput.value) : 0
          
              // Create memory object
              const memory = {
                id: Date.now().toString(),
                title,
                location,
                date,
                category,
                text,
                companions,
                rating,
                images: currentImages,
                createdAt: new Date().toISOString(),
              }
          
              // Add to memories array
              memories.push(memory)
          
              // Save to localStorage
              localStorage.setItem("travelMemories", JSON.stringify(memories))
          
              // Reset form and image previews
              memoryForm.reset()
              imagePreviewContainer.innerHTML = ""
              currentImages = []
          
              // Show success message
              alert("Memory saved successfully!")
          
              // Switch to view memories tab
              document.querySelector('[data-tab="view-memories"]').click()
            })
          
            // Display Letters
            function displayLetters(searchTerm = "", filterValue = "all") {
              // Filter letters based on search term and filter value
              let filteredLetters = letters
          
              if (searchTerm) {
                const term = searchTerm.toLowerCase()
                filteredLetters = filteredLetters.filter(
                  (letter) =>
                    letter.title.toLowerCase().includes(term) ||
                    letter.recipient.toLowerCase().includes(term) ||
                    letter.content.toLowerCase().includes(term),
                )
              }
          
              if (filterValue !== "all") {
                const today = new Date()
                today.setHours(0, 0, 0, 0)
          
                filteredLetters = filteredLetters.filter((letter) => {
                  const deliveryDate = new Date(letter.deliveryDate)
                  deliveryDate.setHours(0, 0, 0, 0)
          
                  if (filterValue === "pending") {
                    return deliveryDate > today && !letter.isOpened
                  } else if (filterValue === "ready") {
                    return deliveryDate <= today && !letter.isOpened
                  } else if (filterValue === "opened") {
                    return letter.isOpened
                  }
                  return true
                })
              }
          
              // Sort letters by delivery date (soonest first)
              filteredLetters.sort((a, b) => new Date(a.deliveryDate) - new Date(b.deliveryDate))
          
              // Clear current letters display
              lettersContainer.innerHTML = ""
          
              // Show empty state if no letters
              if (filteredLetters.length === 0) {
                lettersContainer.appendChild(noLettersEl)
                return
              }
          
              // Create letter cards
              filteredLetters.forEach((letter) => {
                const letterCard = document.createElement("div")
                letterCard.className = "letter-card"
          
                // Format dates
                const createdDate = new Date(letter.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
          
                const deliveryDate = new Date(letter.deliveryDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
          
                // Check if letter is ready to open
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                const letterDeliveryDate = new Date(letter.deliveryDate)
                letterDeliveryDate.setHours(0, 0, 0, 0)
                const isReady = letterDeliveryDate <= today
                const isOpened = letter.isOpened
          
                // Determine letter status
                let statusClass = "status-pending"
                let statusText = "Pending"
          
                if (isOpened) {
                  statusClass = "status-opened"
                  statusText = "Opened"
                } else if (isReady) {
                  statusClass = "status-ready"
                  statusText = "Ready to Open"
                }
          
                // Calculate countdown
                let countdownText = ""
                if (!isOpened && !isReady) {
                  const diffTime = Math.abs(letterDeliveryDate - today)
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                  countdownText = `${diffDays} day${diffDays !== 1 ? "s" : ""} until delivery`
                }
          
                // Create a preview of the content (strip HTML tags)
                const tempDiv = document.createElement("div")
                tempDiv.innerHTML = letter.content
                const contentPreview = tempDiv.textContent || tempDiv.innerText
          
                // Create letter card HTML
                letterCard.innerHTML = `
                          <span class="letter-status ${statusClass}">${statusText}</span>
                          <div class="letter-content">
                              <div class="letter-header">
                                  <h3 class="letter-title">${letter.title}</h3>
                                  <p class="letter-recipient">${letter.recipient}</p>
                              </div>
                              <div class="letter-dates">
                                  <span>Written: ${createdDate}</span>
                                  <span>Delivery: ${deliveryDate}</span>
                              </div>
                              <p class="letter-preview">${contentPreview}</p>
                              <div class="letter-actions">
                                  ${countdownText ? `<span class="delivery-countdown">${countdownText}</span>` : `<span></span>`}
                                  <div>
                                      <button class="btn-action btn-open" data-id="${
                                        letter.id
                                      }" ${!isReady && !isOpened ? "disabled" : ""}>
                                          ${isOpened ? '<i class="fas fa-envelope-open"></i> Read Again' : '<i class="fas fa-envelope-open-text"></i> Open'}
                                      </button>
                                      <button class="btn-action btn-delete" data-id="${letter.id}">
                                          <i class="fas fa-trash"></i>
                                      </button>
                                  </div>
                              </div>
                          </div>
                      `
          
                lettersContainer.appendChild(letterCard)
              })
          
              // Add event listeners to letter action buttons
              addLetterActionListeners()
            }
          
            // Display Memories
            function displayMemories(searchTerm = "", categoryFilter = "all", yearFilter = "all") {
              // Filter memories based on search term and filters
              let filteredMemories = memories
          
              if (searchTerm) {
                const term = searchTerm.toLowerCase()
                filteredMemories = filteredMemories.filter(
                  (memory) =>
                    memory.title.toLowerCase().includes(term) ||
                    memory.location.toLowerCase().includes(term) ||
                    memory.text.toLowerCase().includes(term),
                )
              }
          
              if (categoryFilter !== "all") {
                filteredMemories = filteredMemories.filter((memory) => memory.category === categoryFilter)
              }
          
              if (yearFilter !== "all") {
                filteredMemories = filteredMemories.filter((memory) => {
                  const memoryYear = new Date(memory.date).getFullYear().toString()
                  return memoryYear === yearFilter
                })
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
                memoryCard.setAttribute("data-id", memory.id)
          
                // Format date
                const formattedDate = new Date(memory.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
          
                // Get category display name
                const categoryDisplayNames = {
                  sightseeing: "Sightseeing",
                  food: "Food & Dining",
                  adventure: "Adventure",
                  culture: "Cultural Experience",
                  nature: "Nature & Landscapes",
                  relaxation: "Relaxation",
                  other: "Other",
                }
          
                // Create rating stars
                let ratingStars = ""
                for (let i = 1; i <= 5; i++) {
                  if (i <= memory.rating) {
                    ratingStars += '<i class="fas fa-star"></i>'
                  } else {
                    ratingStars += '<i class="far fa-star"></i>'
                  }
                }
          
                // Create memory card HTML
                memoryCard.innerHTML = `
                  <span class="memory-category category-${memory.category}">${categoryDisplayNames[memory.category]}</span>
                  <div class="memory-image-container">
                    ${
                      memory.images.length > 0
                        ? `<img src="${memory.images[0]}" alt="${memory.title}" class="memory-image">
                      ${memory.images.length > 1 ? `<span class="memory-image-count">+${memory.images.length - 1}</span>` : ""}`
                        : `<img src="https://source.unsplash.com/300x200/?${encodeURIComponent(memory.category)},travel" alt="${memory.title}" class="memory-image">`
                    }
                  </div>
                  <div class="memory-content">
                    <div class="memory-header">
                      <div class="memory-title-location">
                        <h3 class="memory-title">${memory.title}</h3>
                        <p class="memory-location"><i class="fas fa-map-marker-alt"></i> ${memory.location}</p>
                      </div>
                      <span class="memory-date">${formattedDate}</span>
                    </div>
                    <div class="memory-rating">${ratingStars}</div>
                    <p class="memory-text">${memory.text}</p>
                    ${memory.companions ? `<p class="memory-companions"><i class="fas fa-users"></i> With: ${memory.companions}</p>` : ""}
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
          
            // Add event listeners to letter action buttons
            function addLetterActionListeners() {
              // Open letter
              document.querySelectorAll(".btn-open").forEach((btn) => {
                btn.addEventListener("click", function () {
                  const letterId = this.getAttribute("data-id")
                  openLetter(letterId)
                })
              })
          
              // Delete letter
              document.querySelectorAll(".btn-delete").forEach((btn) => {
                btn.addEventListener("click", function () {
                  const letterId = this.getAttribute("data-id")
                  deleteLetter(letterId)
                })
              })
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
          
            // Open Letter
            function openLetter(id) {
              const letter = letters.find((l) => l.id === id)
              if (!letter) return
          
              // Mark as opened if not already
              if (!letter.isOpened) {
                letter.isOpened = true
                letter.openedAt = new Date().toISOString()
                localStorage.setItem("futureLetters", JSON.stringify(letters))
              }
          
              // Format dates
              const createdDate = new Date(letter.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
          
              const deliveryDate = new Date(letter.deliveryDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
          
              const openedDate = letter.openedAt
                ? new Date(letter.openedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : null
          
              // Populate letter detail modal
              const detailContent = document.getElementById("letter-detail-content")
              detailContent.innerHTML = `
                      <div class="letter-detail-header">
                          <h2 class="letter-detail-title">${letter.title}</h2>
                          <div class="letter-detail-dates">
                              <span>Written: ${createdDate}</span>
                              <span>Delivery: ${deliveryDate}</span>
                              ${openedDate ? `<span>First opened: ${openedDate}</span>` : ""}
                          </div>
                      </div>
                      <p class="letter-detail-recipient">${letter.recipient}</p>
                      <div class="letter-detail-content">
                          ${letter.content}
                      </div>
                      <p class="letter-detail-footer">From your past self</p>
                  `
          
              // Show modal
              letterDetailModal.style.display = "block"
          
              // Refresh the letters display to update status
              displayLetters(searchInputLetters.value, filterSelect.value)
            }
          
            // View Memory
            function viewMemory(id) {
              const memory = memories.find((m) => m.id === id)
              if (!memory) return
          
              // Format date
              const formattedDate = new Date(memory.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
          
              // Get category display name
              const categoryDisplayNames = {
                sightseeing: "Sightseeing",
                food: "Food & Dining",
                adventure: "Adventure",
                culture: "Cultural Experience",
                nature: "Nature & Landscapes",
                relaxation: "Relaxation",
                other: "Other",
              }
          
              // Create rating stars
              let ratingStars = ""
              for (let i = 1; i <= 5; i++) {
                if (i <= memory.rating) {
                  ratingStars += '<i class="fas fa-star"></i>'
                } else {
                  ratingStars += '<i class="far fa-star"></i>'
                }
              }
          
              // Create gallery HTML
              let galleryHTML = ""
              if (memory.images.length > 0) {
                galleryHTML = `
                  <h3>Photos</h3>
                  <div class="memory-detail-gallery">
                    ${memory.images.map((img) => `<img src="${img}" alt="Travel photo" class="gallery-image">`).join("")}
                  </div>
                `
              }
          
              // Populate memory detail modal
              const detailContent = document.getElementById("memory-detail-content")
              detailContent.innerHTML = `
                <div class="memory-detail-header">
                  <h2 class="memory-detail-title">${memory.title}</h2>
                  <div class="memory-detail-meta">
                    <span class="memory-detail-meta-item"><i class="fas fa-map-marker-alt"></i> ${memory.location}</span>
                    <span class="memory-detail-meta-item"><i class="fas fa-calendar-alt"></i> ${formattedDate}</span>
                    <span class="memory-detail-meta-item"><i class="fas fa-tag"></i> ${categoryDisplayNames[memory.category]}</span>
                    ${memory.companions ? `<span class="memory-detail-meta-item"><i class="fas fa-users"></i> With: ${memory.companions}</span>` : ""}
                  </div>
                  <div class="memory-detail-rating">${ratingStars}</div>
                </div>
                <div class="memory-detail-content">
                  <p>${memory.text}</p>
                </div>
                ${galleryHTML}
              `
          
              // Show modal
              memoryDetailModal.style.display = "block"
            }
          
            // Edit Memory
            function editMemory(id) {
              const memory = memories.find((m) => m.id === id)
              if (!memory) return
          
              // Switch to add memory tab
              document.querySelector('[data-tab="add-memory"]').click()
          
              // Fill form with memory data
              document.getElementById("memory-title").value = memory.title
              document.getElementById("memory-location").value = memory.location
              document.getElementById("memory-date").value = memory.date
              document.getElementById("memory-category").value = memory.category
              document.getElementById("memory-text").value = memory.text
              document.getElementById("memory-companions").value = memory.companions || ""
          
              // Set rating
              if (memory.rating > 0) {
                document.getElementById(`star${memory.rating}`).checked = true
              }
          
              // Show image previews
              imagePreviewContainer.innerHTML = ""
              currentImages = [...memory.images]
              memory.images.forEach((imageData) => {
                addImagePreview(imageData)
              })
          
              // Update form submission handler
              const originalSubmitHandler = memoryForm.onsubmit
              memoryForm.onsubmit = (e) => {
                e.preventDefault()
          
                // Get form values
                const title = document.getElementById("memory-title").value
                const location = document.getElementById("memory-location").value
                const date = document.getElementById("memory-date").value
                const category = document.getElementById("memory-category").value
                const text = document.getElementById("memory-text").value
                const companions = document.getElementById("memory-companions").value
          
                // Get rating
                const ratingInput = document.querySelector('input[name="rating"]:checked')
                const rating = ratingInput ? Number.parseInt(ratingInput.value) : 0
          
                // Update memory object
                const updatedMemory = {
                  ...memory,
                  title,
                  location,
                  date,
                  category,
                  text,
                  companions,
                  rating,
                  images: currentImages,
                  updatedAt: new Date().toISOString(),
                }
          
                // Update in memories array
                const index = memories.findIndex((m) => m.id === id)
                if (index !== -1) {
                  memories[index] = updatedMemory
                }
          
                // Save to localStorage
                localStorage.setItem("travelMemories", JSON.stringify(memories))
          
                // Reset form and image previews
                memoryForm.reset()
                imagePreviewContainer.innerHTML = ""
                currentImages = []
          
                // Show success message
                alert("Memory updated successfully!")
          
                // Switch to view memories tab
                document.querySelector('[data-tab="view-memories"]').click()
          
                // Restore original submit handler
                memoryForm.onsubmit = originalSubmitHandler
              }
            }
          
            // Delete Letter
            function deleteLetter(id) {
              if (confirm("Are you sure you want to delete this letter?")) {
                letters = letters.filter((letter) => letter.id !== id)
                localStorage.setItem("futureLetters", JSON.stringify(letters))
                displayLetters(searchInputLetters.value, filterSelect.value)
              }
            }
          
            // Delete Memory
            function deleteMemory(id) {
              if (confirm("Are you sure you want to delete this memory?")) {
                memories = memories.filter((memory) => memory.id !== id)
                localStorage.setItem("travelMemories", JSON.stringify(memories))
                displayMemories(searchInput.value, filterCategory.value, filterYear.value)
              }
            }
          
            // Search Functionality
            searchInputLetters.addEventListener("input", function () {
              displayLetters(this.value, filterSelect.value)
            })
          
            // Search Functionality
            searchInput.addEventListener("input", function () {
              displayMemories(this.value, filterCategory.value, filterYear.value)
            })
          
            // Filter Functionality
            filterSelect.addEventListener("change", function () {
              displayLetters(searchInputLetters.value, this.value)
            })
          
            // Filter by Category
            filterCategory.addEventListener("change", function () {
              displayMemories(searchInput.value, this.value, filterYear.value)
            })
          
            // Filter by Year
            filterYear.addEventListener("change", function () {
              displayMemories(searchInput.value, filterCategory.value, this.value)
            })
          
            // View Toggle (Grid/List)
            gridViewBtn.addEventListener("click", () => {
              memoriesContainer.className = "grid-view"
              gridViewBtn.classList.add("active")
              listViewBtn.classList.remove("active")
            })
          
            listViewBtn.addEventListener("click", () => {
              memoriesContainer.className = "list-view"
              listViewBtn.classList.add("active")
              gridViewBtn.classList.remove("active")
            })
          
            // Update Year Filter Options
            function updateYearFilterOptions() {
              // Get unique years from memories
              const years = [...new Set(memories.map((memory) => new Date(memory.date).getFullYear()))]
              years.sort((a, b) => b - a) // Sort descending
          
              // Clear current options except "All Years"
              while (filterYear.options.length > 1) {
                filterYear.remove(1)
              }
          
              // Add year options
              years.forEach((year) => {
                const option = document.createElement("option")
                option.value = year.toString()
                option.textContent = year.toString()
                filterYear.appendChild(option)
              })
            }
          
            // Update Stats
            function updateStats() {
              if (memories.length === 0) {
                statPlaces.textContent = "0"
                statCountries.textContent = "0"
                statMemories.textContent = "0"
                statPhotos.textContent = "0"
                return
              }
          
              // Count unique locations
              const uniqueLocations = new Set(memories.map((memory) => memory.location))
              statPlaces.textContent = uniqueLocations.size
          
              // Count unique countries (assuming format "City, Country")
              const countries = memories.map((memory) => {
                const parts = memory.location.split(",")
                return parts.length > 1 ? parts[parts.length - 1].trim() : memory.location
              })
              const uniqueCountries = new Set(countries)
              statCountries.textContent = uniqueCountries.size
          
              // Count memories
              statMemories.textContent = memories.length
          
              // Count photos
              const totalPhotos = memories.reduce((sum, memory) => sum + memory.images.length, 0)
              statPhotos.textContent = totalPhotos
          
              // Update category chart
              updateCategoryChart()
          
              // Update top destinations
              updateTopDestinations()
            }
          
            // Update Category Chart
            function updateCategoryChart() {
              // Count memories by category
              const categoryCounts = {}
              memories.forEach((memory) => {
                categoryCounts[memory.category] = (categoryCounts[memory.category] || 0) + 1
              })
          
              // Get category display names and colors
              const categoryInfo = {
                sightseeing: { name: "Sightseeing", color: "#4361ee" },
                food: { name: "Food & Dining", color: "#f72585" },
                adventure: { name: "Adventure", color: "#ff9e00" },
                culture: { name: "Cultural Experience", color: "#7209b7" },
                nature: { name: "Nature & Landscapes", color: "#38b000" },
                relaxation: { name: "Relaxation", color: "#4cc9f0" },
                other: { name: "Other", color: "#6c757d" },
              }
          
              // Create chart legend
              const chartLegend = document.querySelector(".chart-legend")
              chartLegend.innerHTML = ""
          
              Object.keys(categoryCounts).forEach((category) => {
                const legendItem = document.createElement("div")
                legendItem.className = "legend-item"
          
                const legendColor = document.createElement("div")
                legendColor.className = "legend-color"
                legendColor.style.backgroundColor = categoryInfo[category].color
          
                const legendText = document.createElement("span")
                legendText.textContent = `${categoryInfo[category].name} (${categoryCounts[category]})`
          
                legendItem.appendChild(legendColor)
                legendItem.appendChild(legendText)
                chartLegend.appendChild(legendItem)
              })
            }
          
            // Update Top Destinations
            function updateTopDestinations() {
              // Count memories by location
              const locationCounts = {}
              memories.forEach((memory) => {
                locationCounts[memory.location] = (locationCounts[memory.location] || 0) + 1
              })
          
              // Sort locations by count
              const sortedLocations = Object.keys(locationCounts).sort((a, b) => locationCounts[b] - locationCounts[a])
          
              // Display top 5 destinations
              destinationsList.innerHTML = ""
          
              if (sortedLocations.length === 0) {
                const noData = document.createElement("p")
                noData.className = "no-data"
                noData.textContent = "Add more memories to see your top destinations"
                destinationsList.appendChild(noData)
                return
              }
          
              const topLocations = sortedLocations.slice(0, 5)
              topLocations.forEach((location) => {
                const item = document.createElement("div")
                item.className = "destination-item"
          
                item.innerHTML = `
                  <div class="destination-name">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${location}</span>
                  </div>
                  <span class="destination-count">${locationCounts[location]}</span>
                `
          
                destinationsList.appendChild(item)
              })
            }
          
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
          
            // Initialize
            updateYearFilterOptions()
            displayMemories()
            updateStats()
          })

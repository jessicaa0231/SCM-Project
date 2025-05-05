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
    const searchInput = document.getElementById("search-letters")
    const filterSelect = document.getElementById("filter-letters")
    const welcomeModal = document.getElementById("welcome-modal")
    const letterDetailModal = document.getElementById("letter-detail-modal")
    const closeModalBtns = document.querySelectorAll(".close-modal")
    const getStartedBtn = document.getElementById("get-started")
    const currentYearEl = document.getElementById("current-year")
  
    // Set current year in footer
    currentYearEl.textContent = new Date().getFullYear()
  
    // Set minimum date for delivery to tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    document.getElementById("delivery-date").min = tomorrow.toISOString().split("T")[0]
  
    // Initialize letters array from localStorage
    let letters = JSON.parse(localStorage.getItem("futureLetters")) || []
  
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
      displayLetters(searchInput.value, filterSelect.value)
    }
  
    // Delete Letter
    function deleteLetter(id) {
      if (confirm("Are you sure you want to delete this letter?")) {
        letters = letters.filter((letter) => letter.id !== id)
        localStorage.setItem("futureLetters", JSON.stringify(letters))
        displayLetters(searchInput.value, filterSelect.value)
      }
    }
  
    // Search Functionality
    searchInput.addEventListener("input", function () {
      displayLetters(this.value, filterSelect.value)
    })
  
    // Filter Functionality
    filterSelect.addEventListener("change", function () {
      displayLetters(searchInput.value, this.value)
    })
  
    // Close Modals
    closeModalBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        welcomeModal.style.display = "none"
        letterDetailModal.style.display = "none"
      })
    })
  
    // Close modal when clicking outside
    window.addEventListener("click", (e) => {
      if (e.target === welcomeModal) {
        welcomeModal.style.display = "none"
      }
      if (e.target === letterDetailModal) {
        letterDetailModal.style.display = "none"
      }
    })
  
    // Get Started button
    getStartedBtn.addEventListener("click", () => {
      welcomeModal.style.display = "none"
    })
  
    // Check for letters that are ready to open
    function checkLettersStatus() {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
  
      let hasReadyLetters = false
  
      letters.forEach((letter) => {
        const deliveryDate = new Date(letter.deliveryDate)
        deliveryDate.setHours(0, 0, 0, 0)
  
        if (deliveryDate <= today && !letter.isOpened) {
          hasReadyLetters = true
        }
      })
  
      // Notify user if there are letters ready to open
      if (hasReadyLetters) {
        const notification = document.createElement("div")
        notification.className = "notification"
        notification.innerHTML = `
                  <p>You have letters ready to open! <a href="#" id="view-ready-letters">View them now</a></p>
                  <button class="close-notification">&times;</button>
              `
        document.body.appendChild(notification)
  
        // Add event listeners
        document.getElementById("view-ready-letters").addEventListener("click", (e) => {
          e.preventDefault()
          document.querySelector('[data-tab="view-letters"]').click()
          filterSelect.value = "ready"
          displayLetters("", "ready")
          notification.remove()
        })
  
        document.querySelector(".close-notification").addEventListener("click", () => {
          notification.remove()
        })
      }
    }
  
    // Initial display of letters
    displayLetters()
  
    // Check for ready letters
    checkLettersStatus()
  })
  
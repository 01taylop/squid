// Extention Elements
let inkContentButton = document.getElementById("inkContent");

// Global Vars
let isInking = false

// Global Functions
const setIsInking = inkingState => {
  chrome.storage.local.set({ isInking: inkingState }, () => {
    isInking = inkingState
    if (inkingState === true) {
      inkContentButton.innerHTML = "Inking"
      inkContentButton.classList.add('active')
    } else {
      inkContentButton.innerHTML = "Ink Content"
      inkContentButton.classList.remove('active')
    }
  })
}

// Init
chrome.storage.local.get('isInking', ({ isInking }) => {
  setIsInking(!!isInking)
})

// Functions
inkContentButton.addEventListener('click', async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (isInking) {
    setIsInking(false)
    // TODO: remove event listeners here
    return
  }

  setIsInking(true)
  chrome.scripting.executeScript({
    target: {
      tabId: tab.id,
    },
    function: initInking,
  })
  window.close()
})

function initInking() {
  const trackCursor = e => {
    let element = document.elementFromPoint(e.clientX, e.clientY)
    console.log(element)
  }

  window.focus()
  document.addEventListener('mousemove', trackCursor)
  document.addEventListener('keydown', function(e) {
    if (e.key === "Escape") {
      document.removeEventListener('mousemove', trackCursor)
      // TODO setIsInking(false)
    }
  })
}

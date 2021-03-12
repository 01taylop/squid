// Extention Elements
const inkContentButton = document.getElementById('inkContent')

// Global Vars
let isInking = false

// Global Functions
const setIsInking = inkingState => {
  chrome.storage.local.set({ isInking: inkingState }, () => {
    isInking = inkingState
    if (inkingState === true) {
      inkContentButton.innerHTML = 'Inking'
      inkContentButton.classList.add('active')
    } else {
      inkContentButton.innerHTML = 'Ink Content'
      inkContentButton.classList.remove('active')
    }
  })
}

// Init
chrome.storage.local.get('isInking', ({ isInking }) => {
  setIsInking(!!isInking)
})

// Extention Event Listeners
inkContentButton.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

  if (isInking) {
    setIsInking(false)
    chrome.tabs.sendMessage(tab.id, { id: 'END_INKING' })
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

// Content Script Functions
const initInking = () => {
  const handleMouseMove = e => {
    const element = document.elementFromPoint(e.clientX, e.clientY)
    console.log(element)
  }

  const handleKeydown = e => {
    if (e.key === 'Escape') {
      removeEventListeners()
      chrome.storage.local.set({ isInking: false })
    }
  }

  const removeEventListeners = () => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('keydown', handleKeydown)
  }

  window.focus()
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('keydown', handleKeydown)

  chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
    if (request.id == 'END_INKING') {
      removeEventListeners()
    }
  })
}

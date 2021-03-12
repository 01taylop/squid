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

const getTabId = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  return tab.id
}

// Init
document.addEventListener('DOMContentLoaded', async () => {
  const tabId = await getTabId()

  chrome.storage.local.get('isInking', ({ isInking }) => {
    setIsInking(!!isInking)
  })

  chrome.scripting.executeScript({
    target: {
      tabId,
    },
    function: initSquid,
  })
}, false)

// Extention Event Listeners
inkContentButton.addEventListener('click', async () => {
  const tabId = await getTabId()

  if (isInking) {
    setIsInking(false)
    chrome.tabs.sendMessage(tabId, { id: 'DISABLE_INKING' })
    return
  }

  setIsInking(true)
  chrome.tabs.sendMessage(tabId, { id: 'ENABLE_INKING' })
  window.close()
})

// Content Script Functions
const initSquid = () => {
  if (!window.SQUID) {
    window.SQUID = {}

    window.SQUID.handleMouseMove = e => {
      const element = document.elementFromPoint(e.clientX, e.clientY)
      console.log(element)
    }

    window.SQUID.handleKeydown = e => {
      if (e.key === 'Escape') {
        window.SQUID.disableInking()
        chrome.storage.local.set({ isInking: false })
      }
    }

    window.SQUID.enableInking = () => {
      window.focus()
      document.addEventListener('mousemove', window.SQUID.handleMouseMove)
      document.addEventListener('keydown', window.SQUID.handleKeydown)
    }

    window.SQUID.disableInking = () => {
      document.removeEventListener('mousemove', window.SQUID.handleMouseMove)
      document.removeEventListener('keydown', window.SQUID.handleKeydown)
    }

    chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
      if (request.id == 'ENABLE_INKING') {
        window.SQUID.enableInking()
      } else if (request.id == 'DISABLE_INKING') {
        window.SQUID.disableInking()
      }
    })
  }
}

// Extention Elements
const inkContentButton = document.getElementById('inkContent')

// Global Vars
let isInking = false

// Global Functions
const getTabId = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  return tab.id
}

const enableInking = tabId => {
  chrome.storage.local.set({
    INKING_TAB_DATE: new Date(),
    INKING_TAB_ID: tabId,
  }, () => {
    isInking = true
    inkContentButton.innerHTML = 'Inking'
    inkContentButton.classList.add('active')
    chrome.action.setIcon({
      path: 'images/icon-inking96.png',
      tabId,
    })
    chrome.tabs.sendMessage(tabId, { id: 'ENABLE_INKING' })
  })
}

const disableInking = tabId => {
  chrome.storage.local.remove(['INKING_TAB_DATE', 'INKING_TAB_ID'], () => {
    isInking = false
    inkContentButton.innerHTML = 'Ink Content'
    inkContentButton.classList.remove('active')
    chrome.action.setIcon({
      path: 'images/icon96.png',
      tabId,
    })
    chrome.tabs.sendMessage(tabId, { id: 'DISABLE_INKING' })
  })
}

const setInkingState = (nextInkingState, tabId) => {
  if (nextInkingState === true) {
    enableInking(tabId)
  } else {
    disableInking(tabId)
  }
}

// Init
document.addEventListener('DOMContentLoaded', async () => {
  const tabId = await getTabId()

  chrome.scripting.executeScript({
    target: {
      tabId,
    },
    function: initSquid,
  }, () => {
    chrome.storage.local.get(['INKING_TAB_DATE', 'INKING_TAB_ID'], ({ INKING_TAB_DATE, INKING_TAB_ID }) => {
      if (INKING_TAB_ID === tabId) {
        enableInking(tabId)
      } else {
        disableInking(tabId)
      }
    })
  })
}, false)

// Extention Event Listeners
inkContentButton.addEventListener('click', async () => {
  const tabId = await getTabId()

  const nextInkingState = !isInking
  setInkingState(nextInkingState, tabId)
  if (nextInkingState === true) {
    setTimeout(() => {
      window.close()
    }, 400)
  }
})

// Content Script Functions
const initSquid = () => {
  if (!window.SQUID) {
    window.SQUID = {}

    window.SQUID.getElementToInk = (element, nodes) => {
      console.log(element, nodes)
      return null
    }

    window.SQUID.handleMouseMove = e => {
      const elementAtPoint = document.elementFromPoint(e.clientX, e.clientY)

      const nodes = []
      let element = elementAtPoint
      nodes.push(element)
      while (element.parentNode) {
        nodes.unshift(element.parentNode)
        element = element.parentNode
      }

      let elementToInk = window.SQUID.getElementToInk(elementAtPoint, nodes)
      if (elementToInk) {
        console.log(elementToInk)
        // getBoundingClientRect()
      }
    }

    window.SQUID.handleKeydown = e => {
      if (e.key === 'Escape') {
        window.SQUID.disableInking()
        chrome.storage.local.remove(['INKING_TAB_DATE', 'INKING_TAB_ID'])
        // TODOD Update parent
      }
    }

    window.SQUID.enableInking = () => {
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

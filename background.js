chrome.runtime.onInstalled.addListener(() => {
  console.log('Squid Initiated');
})

chrome.runtime.onSuspend.addListener(() => {
  console.log('Squid Suspended');
})

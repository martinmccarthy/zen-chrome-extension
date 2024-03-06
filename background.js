console.log("Content");

chrome.runtime.onInstalled.addListener(function() {
    console.log("Extension installed or updated!");
});
  
chrome.tabs.onActivated.addListener(function(activeInfo) {
  chrome.tabs.get(activeInfo.tabId, function(tab){
      console.log(tab.url);
      chrome.scripting.executeScript({
        target: { tabId: activeInfo.tabId },
        files: ['contentScript.js']
      }, () => {
        console.log("Content script injected successfully!");
      });
  });
}); 

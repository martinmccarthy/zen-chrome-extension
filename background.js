let contentScriptInjected = {};

chrome.runtime.onInstalled.addListener(function() {
    console.log("Extension installed or updated!");
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.contentScriptInjected && sender.tab) {
        contentScriptInjected[sender.tab.id] = true;
    }
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && !tab.url.startsWith("chrome://")) {
        if (contentScriptInjected[tabId]) {
            contentScriptInjected[tabId] = false;
        }
        if (!contentScriptInjected[tabId]) {
            chrome.tabs.executeScript(tabId, {file: 'contentScript.js'}, function() {
                if (!chrome.runtime.lastError) {
                    contentScriptInjected[tabId] = true;
                    chrome.storage.local.get(['demonstrateCheckboxState'], function(result) {
                        if (result.demonstrateCheckboxState) {
                            chrome.tabs.sendMessage(tabId, {action: 'loadZenzio'});
                        }
                    });
                } else {
                    console.error("Injection failed: ", chrome.runtime.lastError.message);
                }
            });
        }
    }
});

chrome.tabs.onRemoved.addListener(function(tabId) {
    delete contentScriptInjected[tabId];
});

chrome.webNavigation.onCommitted.addListener(function(details) {
    if (details.frameId === 0) {
        contentScriptInjected[details.tabId] = false;
    }
});

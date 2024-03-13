document.addEventListener('DOMContentLoaded', function() {
    requestCurrentState();

    var checkbox = document.querySelector('.demonstrateCheckbox');
    var resetButton = document.querySelector('.resetChatButton');
    var vinInsertButton = document.querySelector('.vinInsertButton');

    chrome.storage.local.get(['demonstrateCheckboxState'], function (result){
        checkbox.checked = result.demonstrateCheckboxState || false;
        if(checkbox.checked) {
            sendMessageToContentScript();
        }
    })

    checkbox.addEventListener('change', function() {
        console.log('Checkbox state changed');
        var isChecked = this.checked;
    
        chrome.storage.local.set({'demonstrateCheckboxState': isChecked}, function() {
            console.log('Checkbox state is saved');
        });
    
        if (isChecked) {
            sendMessageToContentScript(true); // Pass true for initial load
            setTimeout(function() {
                checkbox.checked = false;
                chrome.storage.local.set({'demonstrateCheckboxState': false}, function() {
                    console.log('Checkbox state is reset and saved');
                });
            }, 60 * 60 * 1000); // 60 minutes
        }
    });

    resetButton.addEventListener('click', function() {
        console.log("Resetting chat");
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: 'resetChat'});
        });
    })

    vinInsertButton.addEventListener('click', function() {
        console.log("Inserting VIN");
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: 'insertVin'});
        });
    });

    function sendMessageToContentScript(initialLoad = false) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: 'loadZenzio'});
        });
    }    

    function requestCurrentState() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.runtime.sendMessage({action: 'requestState', tabId: tabs[0].id}, function(response) {
                if(response && response.hasOwnProperty('demonstrateCheckboxState')) {
                    checkbox.checked = response.demonstrateCheckboxState;
                }
            });
        });
    }
});


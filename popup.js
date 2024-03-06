document.addEventListener('DOMContentLoaded', function() {
    var checkbox = document.querySelector('.demonstrateCheckbox');
    var resetButton = document.querySelector('.resetChatButton');

    checkbox.addEventListener('change', function() {
        if (this.checked) {
            console.log('Checkbox is checked');
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {action: 'loadZenzio'});
            });

            setTimeout(function() {
                checkbox.checked = false;
            }, 60 * 60 * 1000) // 60 minutes
        } else {
            console.log('Checkbox is unchecked');
        }
    });

    resetButton.addEventListener('click', function() {
        console.log("Resetting chat");
    })
});
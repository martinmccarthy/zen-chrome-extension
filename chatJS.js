//******************************************** */
//Copyright Zenzio Solutions, Inc. 2023
//All Rights Reserved
//Do not copy or distribute without permission
//******************************************** */

//** Namespace */

/*Version 3.2.3 */
var Zenzio = (function () {

    var self = {};

    //##Current_UTCTime##
    var ZenzioActiveChat = false;
    var ZenzioActiveInput = false;
    const ZenzioDoDebug = false;
    var LastmessageTime;

    var channelid = '21111111-1111-1111-1111-111111111111';
    var locationid = '11111111-1111-1111-1111-111111111111';
    var chatid;
    var vinid;
    var uniqueVins = new Set();

    var urlValues;

    //Instantiate variables for later use
    var ChatBugImageContainer;
    var ChatBugImage;
    var ChatContainer;
    var ChatTextCue;
    var ChatHeaderContainer;
    var ChatBox;
    var ChatWindow;
    var ChatInputContainer;
    var Chatinput;
    var ChatSendButton;

    var ChatBugImageId;
    var ChatBugImageContainerId;
    var ChatInputContainerId;
    var ChatTextCueId;
    var ChatTextCueInner;

    var TypeWriterText = "##TypeWriterEnabled##";
    var TypeWrtierActive = false;

    var AblyEnabled = false;
    var ably;
    var WelcomeMessage = '';
    var baseExpirationDate;
    const baseCookieName = "zenzio_chat_";

    var currUserIp = "";
    var clicksCount;
    var userMobile = false;

    /* Called once we load the script onto the page */
    self.doFirstLoad = function () {
        WelcomeMessage = 'Hello! How can I help you today?';
        ChatBugImageId = 'ZenzioChatBugIcon';
        ChatInputContainerId = 'ZenzioChatInputContainer';
        ChatBugImageContainerId = 'ZenzioChatBugIconContainer';
        ChatTextCueId = 'ZenzioChatTextCue';

        baseExpirationDate = new Date();
        baseExpirationDate.setUTCFullYear(baseExpirationDate.getUTCFullYear() + 1);
        userMobile = getClientDevice();
        urlValues = parseApiValuesFromUrl();

        writeOrUpdateCookie(baseCookieName + locationid + "_marker", locationid, baseExpirationDate);

        let clicksCookie = getCookie("clicksCount");
        clicksCount = clicksCookie ? parseInt(clicksCookie.split('=')[1]) : 0;
        if (isNaN(clicksCount)) {
            clicksCount = 0;
        }
        if (clicksCount >= 3) {
            clicksCount++;
        }
        try {
            WelcomeMessage = "##GREETING_MESSAGE##";

            if (WelcomeMessage == '') {
                WelcomeMessage = 'Hello! How can I help you today?';
            }
        } catch {
            WelcomeMessage = 'Hello! How can I help you today?';
        }

        try {
            if (TypeWriterText.toLowerCase() == 'true') {
                TypeWrtierActive = true;
            }
        }
        catch
        {
            TypeWrtierActive = false;
        }

        setTimeout(function () {
            setTimeout(function () {
                ZenzioAddBugImage();

                ZenzioBuildControls();

                ChatBugImage.addEventListener('click', function () { OpenChat(); });
                ChatBugImage.style.display = "block;"
                Chatinput.style.display = 'block';
                ChatTextCue.style.display = 'block';
                ChatTextCue.style.opacity = 0;
                ChatTextCue.style.transition = "opacity 1s ease-in-out";
                if (clicksCount >= 3) {
                    ChatTextCue.style.display = 'none';
                }

                ChatBugImageContainer.appendChild(ChatBugImage);
                ChatContainer.appendChild(ChatBugImageContainer);
                ChatContainer.appendChild(ChatTextCue);
                setBugLocation();
                GetVinData();
                displayTextCue();

            }, 700);
        }, 300);
    }

    function displayTextCue() {
        setTimeout(function () {
            ChatTextCue.style.opacity = 1;
            setTimeout(function () {
                if (ChatTextCue.style.display != 'none') {
                    ChatTextCue.style.opacity = 0;
                    setTimeout(function () {
                        ChatTextCue.style.display = 'none';
                    }, 1000);
                    ChatTextCue.pointerEvents = 'none';
                }
            }, 9000);
        }, 1000);
    }
    function reloadStylesheets() {
        var queryString = '?reload=' + new Date().getTime();
        $('link[rel="stylesheet"]').each(function () {
            this.href = this.href.replace(/\?.*|$/, queryString);
        });
    }

    function setBugLocation() {
        var selectedBugLocation = '##BUG_LOCATION##'
        var chatBug = document.getElementById('ZenzioChatBugIconContainer');
        var textCue = document.querySelector('.zenzioTextCue');
        var innerCue = document.querySelector('.zenzioTextCueInner');

        switch (selectedBugLocation) {
            case "bottomleft":
                chatBug.style.bottom = "10px";
                chatBug.style.left = "10px";
                textCue.style.bottom = "80px";
                textCue.style.left = "10px";
                break;
            case "bottomright":
                chatBug.style.bottom = "10px";
                chatBug.style.right = "10px";
                textCue.style.bottom = "80px";
                textCue.style.right = "10px";
                break;
            case "bottommiddle":
                chatBug.style.bottom = "10px";
                chatBug.style.left = "50%";
                chatBug.style.transform = "translateX(-50%)";
                textCue.style.bottom = "80px";
                textCue.style.left = "50%";
                textCue.style.transform = "translateX(-50%)";
                break;
            case "middleright":
                chatBug.style.top = "50%";
                chatBug.style.right = "10px";
                chatBug.style.transform = "translateY(-50%)";
                textCue.style.top = "50%";
                textCue.style.right = "80px";
                textCue.style.transform = "translateY(-50%)";
                break;
            case "middleleft":
                chatBug.style.top = "50%";
                chatBug.style.left = "10px";
                chatBug.style.transform = "translateY(-50%)";
                textCue.style.top = "50%";
                textCue.style.left = "80px";
                textCue.style.transform = "translateY(-50%)";
                break;
            default:
                chatBug.style.bottom = "10px";
                chatBug.style.right = "10px";
                textCue.style.bottom = "80px";
                textCue.style.right = "10px";
                break;
        }

        var contentHeight = parseInt(innerCue.height) + 20;
        textCue.style.height = contentHeight + 'px';
        textCue.style.display = 'block';
    }


    function ZenzioAddMessageBubble(message, source, messageid, CreatedUtc, isHidden = false, url = '', urltext = '', urlimage = '', setAsFirstChild = false) {
        text = getTimestampText(CreatedUtc)
        //console.log(text);
        ZenzioActiveInput = false;
        try {
            //find the whole chat container
            chatBox = document.getElementById('zenzioChatBox');
            //look for ChatMessage by id first, if null then create it
            var ChatMessage = document.getElementById(messageid);

            if (ChatMessage == null) {
                ChatMessage = document.createElement('div');

                if (urlimage != '') {
                    //add the image
                    var image = '<img src="' + urlimage + '" style="width:100%;height:120px;box-shadow: 0px 5px 15px -2px rgba(0,0,0,0.46);" alt="picture of inventory">';
                    message = message + '<br>' + image;
                }

                if (url != '') {
                    //add a link to the message
                    var linktoadd = '<br><a href="' + url + '" target="_blank">' + urltext + '</a>';
                }

                ChatMessage.appendChild(document.createTextNode(message)); // add the message
                if (url != '') ChatMessage.appendChild(linktoadd); // add the link if it exists


                ChatMessage.innerHTML = message;
                ChatMessage.id = messageid;

                if (ChatMessage.innerHTML == '##Thinking##') {
                    ChatMessage.innerHTML = "";
                    TypingDiv = document.createElement('div');
                    TypingDiv.className = 'zenzioTyping'
                    DotDiv1 = document.createElement('div');
                    DotDiv1.className = 'zenzioDot'
                    DotDiv2 = document.createElement('div');
                    DotDiv2.className = 'zenzioDot'
                    DotDiv3 = document.createElement('div');
                    DotDiv3.className = 'zenzioDot'
                    TypingDiv.appendChild(DotDiv1);
                    TypingDiv.appendChild(DotDiv2);
                    TypingDiv.appendChild(DotDiv3);

                    ChatMessage.appendChild(TypingDiv);

                }
                //if a message is from the AI, use left side bubble
                ChatMessage.classList.add(source == "u" ? 'zenzioMessage-user-bubble' : 'zenzioMessage-chat-bubble');


                if (setAsFirstChild && chatBox.firstChild) {
                    // Insert the new div before the first child
                    chatBox.insertBefore(ChatMessage, chatBox.firstChild);
                } else {
                    // Append the new div as the only child
                    if (isHidden == false) {
                        chatBox.appendChild(ChatMessage);
                    }
                }

                ScrollToBottom('zenzioChatBox');


            }
            else {
                if (urlimage != '') {
                    var image = '<img src="' + urlimage + '" style="width:100%;height:120px;" alt="picture of inventory">';
                    message = message + '<br><br>' + image;
                }

                if (url != '') {
                    var linktoadd = '<br><a href="' + url + '" target="_blank">' + urltext + '</a>';

                    //message = message + '<br>' + linktoadd;
                }

                if (TypeWrtierActive === true) {
                    ZenzioActiveInput = true;
                    ChatMessage.innerHTML = "";
                    processHTML(message, ChatMessage, ChatMessage, null, 0, 0);
                }
                else if (TypeWrtierActive === false) {
                    //message exists so update it
                    ChatMessage.innerHTML = message;
                }
            }


            let datetimeDiv = document.createElement('div');
            datetimeDiv.className = 'zenzioDate';
            datetimeDiv.innerText = text;
            let chatMessageWidth = ChatMessage.offsetWidth;
            datetimeDiv.setAttribute('data-createdUtc', CreatedUtc);

            if (chatMessageWidth > 100) {
                ChatMessage.appendChild(datetimeDiv);
            }


        } catch (e) {
            //problem
            console.log(e);
        }
    }

    function getTimestampText() {
        let currentTime = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate(), new Date().getUTCHours(), new Date().getUTCMinutes(), new Date().getUTCSeconds()));
        const chatMessages = document.querySelectorAll('.zenzioDate');  // Assuming every chat message has a 'zenzioDate' class for its timestamp.
        let textDate = "just now";
        chatMessages.forEach((timestampElem) => {
            const createdUtc = timestampElem.getAttribute('data-createdUtc');  // We'll store the createdUtc as an attribute to each timestamp div.
            // If no timestamp data, skip this iteration.
            ZenzioLogConsole("messagetimes", createdUtc)
            const createdDate = new Date(createdUtc);
            const differenceInMilliseconds = currentTime - createdDate;
            const differenceInMinutes = Math.floor(differenceInMilliseconds / (1000 * 60));

            if (differenceInMinutes < 2) {
                textDate = "just now";
            } else if (differenceInMinutes < 60) {
                textDate = differenceInMinutes + (differenceInMinutes > 1 ? " minutes ago" : " minute ago");
            } else {
                const differenceInHours = Math.floor(differenceInMilliseconds / (1000 * 60 * 60));
                if (differenceInHours < 24) {
                    textDate = differenceInHours + (differenceInHours >= 1 ? " hours ago" : " hour ago");
                }
                else if (differenceInHours > 24) {
                    textDate = "Previously";
                }
                else {
                    textDate = "";
                }
            }

            timestampElem.innerText = textDate;

        });
        return "";
    }

    function typeOutText(text, container, callback, typeSpeed = 10) {
        let charIndex = 0;
        let textNode = document.createTextNode("");
        container.appendChild(textNode);

        function typeChar() {
            if (charIndex < text.length) {
                textNode.data += text[charIndex++];
                setTimeout(typeChar, typeSpeed);
            } else if (callback) {
                callback();
            }
        }

        typeChar();
        ScrollToBottom('zenzioChatBox');
    }

    /*  Process HTML takes a string of html (ex: <p>Hello <strong>World!</strong></p>) and recursively parses it to type out each of the tags
        with the typeOutText function. */
    function processHTML(html, displayDiv, parentElement = displayDiv, callback, index = 0, level = 0) {
        if (index >= html.length) {
            if (callback) callback();
            return;
        }

        let startTagIndex = html.indexOf('<', index);
        if (startTagIndex !== -1 && startTagIndex > index) {
            let textContent = html.substring(index, startTagIndex);
            typeOutText(textContent, parentElement, () => {
                processTag(html, displayDiv, parentElement, callback, startTagIndex, level);
            });
        } else if (startTagIndex !== -1) {
            processTag(html, displayDiv, parentElement, callback, startTagIndex, level);
        } else {
            let textContent = html.substring(index);
            typeOutText(textContent, parentElement, callback);
        }
    }

    function processTag(html, displayDiv, parentElement, callback, startTagIndex, level) {
        let endTagIndex = html.indexOf('>', startTagIndex);
        if (endTagIndex === -1) {
            if (callback) callback();
            return;
        }

        let fullTag = html.substring(startTagIndex + 1, endTagIndex).trim();
        let isClosingTag = fullTag.startsWith('/');
        if (isClosingTag) {
            if (callback) callback();
            return;
        }

        let firstSpaceIndex = fullTag.indexOf(' ');
        let tagName = firstSpaceIndex !== -1 ? fullTag.substring(0, firstSpaceIndex) : fullTag;
        let element = document.createElement(tagName);
        if (tagName.toLowerCase() === 'a') {
            element.setAttribute('target', '_blank');
        }
        parentElement.appendChild(element);

        if (firstSpaceIndex !== -1) {
            let attributesString = fullTag.substring(firstSpaceIndex + 1);
            let attributePattern = /(\w+)(="[^"]*"|='[^']*'|=[^\s>]*)(?=\s|$)/g;
            let match;
            while ((match = attributePattern.exec(attributesString)) !== null) {
                let attrName = match[1];
                let attrValue = match[2].substring(2, match[2].length - 1);
                element.setAttribute(attrName, attrValue);
            }
        }

        let closingTag = `</${tagName}>`;
        let closingTagIndex = html.indexOf(closingTag, endTagIndex);
        if (closingTagIndex !== -1) {
            processHTML(html, displayDiv, element, () => {
                processHTML(html, displayDiv, parentElement, callback, closingTagIndex + closingTag.length, level);
            }, endTagIndex + 1, level + 1);
        } else {
            processHTML(html, displayDiv, parentElement, callback, endTagIndex + 1, level);
        }
    }

    function setupAbly() {
        if (!document.querySelector('script[src="https://cdn.ably.io/lib/ably.min-1.js"]')) {
            var script = document.createElement("script");
            script.src = "https://cdn.ably.io/lib/ably.min-1.js";
            script.onload = () => {
                ably = new Ably.Realtime('m3VFYA.rk_mwQ:3Hkaacg0-RVGQI5u-mPgGHUzBJll7dHaip2sbsLf0u8');

                var channel = ably.channels.get(channelid);
                channel.subscribe(function (message) {
                    // Handle received message
                    if (message.name === "chat_change") {
                        const chatChangePayload = JSON.parse(message.data);
                        if (chatChangePayload.ChatId == chatid) {
                            ZenzioAddMessageBubble(chatChangePayload.Message, chatChangePayload.Source.toLowerCase().trim(), chatChangePayload.MessageId, chatChangePayload.Created, chatChangePayload.hide, chatChangePayload.Url, chatChangePayload.UrlText, chatChangePayload.UrlImage);
                        }
                    }
                });
            };
            document.querySelector("body").appendChild(script);
        }
    }


    function ZenzioLogConsole(src, msg) {
        if (ZenzioDoDebug) {
            console.log(src + ': ' + msg);
        }
    }

    /*  ZenzioAddBugImage generates the icon that you click on to open the chat, inside of here is also the generation of the text box that hovers above it, and the image
        that we store inside the icon. This also generates the chat box, TODO: Update naming of this function to better fit what it actually does */
    function ZenzioAddBugImage() {
        ChatBugImageContainer = document.createElement("div");
        ChatBugImageContainer.className = "zenzioChatButton";
        ChatBugImageContainer.id = 'ZenzioChatBugIconContainer';
        ChatTextCue = document.createElement("div");
        ChatTextCue.className = "zenzioTextCue";
        ChatTextCue.id = "ZenzioChatTextCue";
        ChatTextCueInner = document.createElement("div");
        ChatTextCueInner.className = "zenzioTextCueInner";
        ChatTextCueInner.innerText = "Hi there, I am your AI Sales Associate! I am here to help you on your car buying journey";
        ChatTextCueInner.addEventListener('click', function () {
            ChatTextCue.style.display = "none";
            OpenChat();
        });
        ChatTextCue.appendChild(ChatTextCueInner);
        let textCueClose = document.createElement("div");
        textCueClose.innerText = "X";
        textCueClose.className = "zenzioCloseDark";
        textCueClose.addEventListener('click', function () {
            ChatTextCue.style.display = "none";
            clicksCount++;
            writeOrUpdateCookie("clicksCount", clicksCount, baseExpirationDate);
        });
        ChatTextCue.appendChild(textCueClose);

        ChatBugImage = document.createElement('img');
        ChatContainer = document.getElementById('ZenzioChatContainer') || ZenzioCreateImportDiv();
        ChatHeaderContainer = document.createElement('div');
        ShowHeader = document.createElement('div');
        ShowNameai = document.createElement('div');
        CloseIcon = document.createElement('div');
        CloseIcon.innerText = "X";

        ShowHeader.className = "zenzioRightAlignedDiv zenzioChatCloseLabel";
        ShowHeader.appendChild(ShowNameai);
        ShowNameai.innerHTML = "<strong>AISA Chat</strong>"
        CloseIcon.className = "zenzioClose";

        ChatBox = document.createElement('div');
        ChatWindow = document.createElement('div');
        ChatInputContainer = document.createElement('div');
        ChatInputContainer.id = ChatInputContainerId;
        ChatInputContainer.className = 'zenzioChatInputContainer';
        Chatinput = document.createElement('input');

        //create the send button
        ChatSendButton = document.createElement('img');
        ChatSendButton.style.top = "60%";
        ChatSendButton.style.transform = "translateY(-50%)";
        ChatSendButton.id = 'zenzioChatSendButton';
        ChatSendButton.className = 'zenzioChatSendButton';
        ChatSendButton.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA5UlEQVR4nO3WMUpDQRSF4Q/UQhsRbKzdQMAFaCtqmTalYh9wATZuwMIt2FoGRJusIK0QSF4jdnaCXBGmsBFM4purkAN//V+GmTOXZRJzhCmecIGNWuIJ4gsNzrDWtji+YYxTrNQWR2GEboY4CkPsZ4ijMEAnQxx4xy12a4uj8IYb7MwjbhaUf/KKS2zOIj4uBRK/wAv6WJ9lgC3soYcr3JU2m2eAaemAVQtkGwc4xzXu8fzDAR6zxA9/8qhPsi5Xk/WcIqtA4r9U5qD2JzGs/S2Oai8C47ZXn0nWsndY5NXX22W0kQ875CXXn83dMgAAAABJRU5ErkJggg==';
        //ChatSendButton.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADcAAAA3CAMAAACfBSJ0AAAAw1BMVEW6FBr////y09THQEXGPkPinJ/ENzzjoaPciYzxztD23+D89vbCMDbbhonQXWLOVlrIREi8GyH68fHFOj/AJyzwzM3vyMrps7TPW1/MUlbENDnAKi/uxMXLUFS+ISfXd3q7Fhz++/vWcnbUbnLTa2/+/f3nrrDmqavdjI/ZfYHSZmrRYmb78/P45ufsv8HrvL7ekJPagITLTVHCLTP67u7quLrlpafjn6LglJfJSU324uP13d702tvhmZvTaGzz1tf9+Ph7jKWBAAACq0lEQVRIx83U2ZKaUBAG4G5EZDwgIjAiyCKI+75FHXXy/k+V0zLOxFSoAW6S/6L7r9KvDp6ygNKZ1Gq167GWNyMaW+6qTBCsrpA3S0G4oEhOgIIRS7rK3R0tPg4vj2hg0WrD8uUzDeg+6pjOYwafqy4fZqOHked1rhiDskKMXdgJtqfiu9dRkwCYpXmeFydoA4CxM76e84xNWu8RgIMz3mYaQANfebPG0DsBzx73j+f8dPXUjaYACrZ4W7gPp07Crs+3jczJchRylNR9Rq+jDCWcjG96Cecw1OBvrsfzM9vtsQ1Q/DwbmVLc0aWoUMKN+KWUcA5LNNre259ujpuHM5CFaZuikJblx6WsL89OqyJasQGU/gJx2KBD4ndMVtQ0xJrMU2XCs4tlSnrivQa8NJ9amujJFUhuFwzN/C5cLB51jtP8TkP0Puqou83vBgIeSvw+n2k/Wzo1c7PZ+LldVIclTqhtLMRObmfJcMNl2l/zOyOR+KP2XKC087vVK10Njgu68HywbfuIQkGnsS5lhmIxNxjcVxWPhZzP7Ps+4Tws4oJET8sOtft7zM7j/GiHV40+VRO89JsqQyH2v3emzBPz0qGiajLFzHDf5j9zphKGtGk8J3R0PdMNq33B4/tW50MUWjaAOWDrwDJOVn+1yHJN9MGo8HJA0j9IQx9dcMT9FWCS5ZTewKRtRufDk5OgRmdnOYjYbKQDxNtRS/9yqtoG10KrmelAGSZVgOFExsnv5934nsxnToZzfYDBG7hj03xZpG67JRdWOJHwluHsoQ7tKowMgHHPgOEZ9LYf4RZUrXsCcaY8OXn5cM40WAV6Rx6b/lpen1Q1Gq/NtRoEsjudqkcRPmLMpX/xP7uIFdGo5A3/5jR1iMh2mDdzGuRcSZIcR8obhYYOZfMLAeJC4TT9NA8AAAAASUVORK5CYII=';


        //call InputCheck onclick
        ChatSendButton.addEventListener('click', async () => {
            await InputCheck();
            if (window.innerWidth <= thresholdWidth) {
                ChatSendButton.style.display = "none"; // Hide the button
            } else {
                ChatSendButton.style.display = "block"; // Show the button
            }
        });

        ChatWindow.classList.add('zenzioChatWindow');
        ChatWindow.classList.add('zenzioChatWindowHidden');

        //create the header
        ChatHeaderContainer.id = 'zenzioChatHeaderContainer';
        ChatHeaderContainer.className = 'zenzioChatHeaderContainerClass';
        ChatHeaderContainer.appendChild(ShowHeader);
        ChatHeaderContainer.appendChild(CloseIcon);
        CloseIcon.addEventListener('click', async () => {
            try {
                await OpenChat();
                writeOrUpdateCookie(baseCookieName + locationid + "_manualclose", "oktest", baseExpirationDate);
            } catch (error) {
                console.error('Error opening chat:', error);
            }
        });

        ChatBugImage.id = ChatBugImageId;
        ChatBugImage.className = 'zenzioChatIconClass';

        ChatBugImage.src = '##ChatBug_Base64##';

        ChatBugImage.alt = "Chat Icon";
        ChatBugImage.style.display = "none;"
    }

    function parseApiValuesFromUrl() {
        const url = new URL(window.location.href);
        const queryParams = new URLSearchParams(url.search);
        var apiValues = {};
        queryParams.forEach((value, key) => {
            apiValues[key] = value;
        });

        return apiValues;
    }

    //********************************** */
    //get the data
    //********************************** */
    function ZenzioBuildControls() {
        //ChatContainer = document.getElementById('Import') || ZenzioCreateImportDiv();
        ChatContainer.id = "ZenzioChatContainer";

        //add the header
        ChatWindow.appendChild(ChatHeaderContainer);

        let Chatinput = document.createElement('textarea'); // Create a textarea 
        Chatinput.id = 'zenzioChatInput';

        Chatinput.placeholder = 'Start Chat';
        Chatinput.style.height = '40px';

        var lastKeyPressed = "";

        Chatinput.addEventListener('keydown', async function (event) {
            if (event.key == "Enter") {
                await InputCheck();
            }
        });

        Chatinput.addEventListener('input', function () {
            this.style.height = (this.scrollHeight) + 'px';

            if (this.scrollHeight > 75) { // Example condition, adjust as needed
                this.style.borderRadius = '20px';
                ChatSendButton.style.top = "calc(100% - 35px)";
                ChatSendButton.style.transform = "none";

            } else {
                this.style.borderRadius = '50px';

                ChatSendButton.style.top = "60%";
                ChatSendButton.style.transform = "translateY(-50%)";
                //Set back to Original
            }

            if (this.value.trim() !== "" && lastKeyPressed != "Enter") { // Checks if the input is not empty (ignores spaces)
                ChatSendButton.style.filter = 'invert(35%) sepia(100%) saturate(3443%) hue-rotate(157deg) brightness(103%) contrast(104%)';
                Chatinput.style.boxShadow = '0 0 5px #019E87, 0 0 5px #019E87'; // Adds the glow

            } else if (lastKeyPressed != "Enter") {
                ChatSendButton.style.filter = '';
                ChatSendButton.style.top = "60%";
                ChatSendButton.style.transform = "translateY(-50%)";
                this.style.boxShadow = '';
                this.style.height = '40px';// Removes the filter, reverting to original state
            }

        });

        //chatbox
        ChatBox.id = 'zenzioChatBox';
        ChatWindow.id = 'zenzioChatWindow';

        bottomTextContainer = document.createElement('div');
        bottomTextContainer.className = 'zenzioBottomContainer';
        bottomText = document.createElement('div');
        bottomText.className = 'zenzioBottomText';
        bottomText.innerHTML = "<span>Before proceeding, please take a moment to carefully read and understand our </span><a href='https://ai.zenzio.com/policy/terms.htm' target='_blank'><b>User Terms of Service</b></a><span> and </span><a href='https://ai.zenzio.com/policy/privacy.htm' target='_blank'><b>User Privacy Agreement</b></a><span>, as they contain important information about your rights and responsibilities, as well as how we handle your personal data.</span>";
        bottomTextContainer.appendChild(bottomText);

        ChatExpandercontainer = document.createElement('div');
        ChatExpandercontainer.className = 'zenzioWindowExpanderContainer';
        ChatExpander = document.createElement('div');
        ChatExpander.className = 'zenzioWindowExpander';

        ChatContainer.appendChild(ChatWindow);
        ChatWindow.appendChild(ChatBox);

        Chatinput.placeholder = 'Start Chat';
        ChatInputContainer.appendChild(Chatinput);
        ChatInputContainer.appendChild(ChatSendButton);
        ChatWindow.appendChild(ChatInputContainer);
        ChatExpandercontainer.appendChild(ChatExpander);
        ChatWindow.appendChild(bottomTextContainer);
        ChatWindow.appendChild(ChatExpandercontainer);
    }

    /* Create elements to show chat */
    function ZenzioCreateImportDiv() {
        const importDiv = document.createElement('div');
        importDiv.id = 'ZenzioChatContainer';
        document.body.insertBefore(importDiv, document.body.firstChild);
        return importDiv;
    }

    // Sets the text box innerHTML to a welcome message based on the VIN on the page if available.
    function GetVinData() {
        const vinRegex = new RegExp("\\b[A-Za-z0-9IOQioq_]{12}\\d{5}\\b");
        const elements = document.body.querySelectorAll('*');
        const nonScriptElements = Array.from(elements).filter(element => element.tagName !== 'SCRIPT');
        for (const element of nonScriptElements) {
            if (element.innerText != undefined) {
                const text = element.innerText;
                const found = text.match(vinRegex);
                if (found) {
                    if (!uniqueVins.has(found[0])) {
                        uniqueVins.add(found[0]);
                        foundVin = found[0];
                    }
                }
            }
        }
        if (uniqueVins.size > 0) {
            sendUserInformation();
        }

        if (uniqueVins.size == 1) {
            checkInventory().then(data => {
                if (data.length > 0) {
                    ChatTextCueInner.innerHTML = buildWelcomeString(data[0]);
                    vinFound = true;
                    vinid = foundVin;
                    WelcomeMessage = buildWelcomeString(data[0]);
                }
                else {
                    ChatTextCueInner.innerHTML = "Hi there, I am your AI Sales Associate! I am here to help you on your car buying journey";
                }
            }).catch((error) => {
                console.log(error.message);
                ChatTextCueInner.innerHTML = "Hi there, I am your AI Sales Associate! I am here to help you on your car buying journey";
            });
        }
        else if (uniqueVins.size > 1) {
            checkInventory().then(data => {
                // console.log(data);
            }).catch((error) => {
                console.log(error.message);
                ChatTextCueInner.innerHTML = "Hi there, I am your AI Sales Associate! I am here to help you on your car buying journey";
            })
        }
        else {
            ChatTextCueInner.innerHTML = "Hi there, I am your AI Sales Associate! I am here to help you on your car buying journey";
        }
    }

    async function sendUserInformation() {
        var vinQueryString = `vinNumbers=${encodeURIComponent(Array.from(uniqueVins).join(','))}`;

        chatid = await localStorage.getItem('ChatID');
        const url = `https://localhost:7077/api/VinInteraction?locationid=${locationid}&chatid=${chatid}&${vinQueryString}`;
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Api-Key': "##API_KEY##",
                    'X-Zenzio-Current-URL': window.location.href,
                    'X-Zenzio-Current-IP': await getClientIP()
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return;

        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);

        }
    }
    function buildWelcomeString(carInfo) {
        var string = 'Hi there, I am your AI Sales Associate! Are you interested in this ';
        string += carInfo.year + ' ' + carInfo.make + ' ' + carInfo.model + '? ';
        string += 'I am here to discuss more about this vehicle and answer any questions you may have.';

        return string;
    }

    //********************************** */
    // Checkes the inventory based on the vin number scraped from the page.
    //********************************** */
    async function checkInventory() {
        var vinQueryString = `vinNumbers=${encodeURIComponent(Array.from(uniqueVins).join(','))}`;
        const url = `https://localhost:7077/api/inventory?locationId=${locationid}&${vinQueryString}`;
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Api-Key': "##API_KEY##"
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;

        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);

        }
    }

    //********************************** */
    //open the chat
    //********************************** */
    self.TriggerOpenChat = async function () {
        OpenChat();
    }

    async function OpenChat() {
        if (AblyEnabled == false) {
            setupAbly();
        }
        ZenzioNewChat = await CheckStorage();
        const IconElement = document.getElementById(ChatBugImageId);
        const chatBox = document.getElementById('zenzioChatWindow');
        const Chatinput = document.getElementById('zenzioChatInput');

        if (ZenzioActiveChat) {
            IconElement.classList.remove('zenzioFadeIcon-in-animation');
            chatBox.classList.remove('zenzioFadeBox-in-animation');
            chatBox.classList.add('zenzioChatWindowHidden');
            Chatinput.classList.remove('zenzioFadeBox-in-animation');
            IconElement.classList.add('zenzioFadeIcon-out-animation');
            chatBox.classList.add('zenzioFadeBox-out-animation');
            Chatinput.classList.add('zenzioFadeBox-out-animation');
            ZenzioLogConsole('OpenChat', "chat is closed");
            ZenzioActiveChat = false;
            ZenzioActiveInput = false;
            document.getElementById(ChatBugImageId).style.display = 'block';
            document.getElementById(ChatBugImageContainerId).style.display = 'flex';
        }
        else {
            IconElement.classList.remove('zenzioFadeIcon-out-animation');
            chatBox.classList.remove('zenzioFadeBox-out-animation');
            Chatinput.classList.remove('zenzioFadeBox-out-animation');
            IconElement.classList.add('zenzioFadeIcon-in-animation');
            chatBox.classList.remove('zenzioChatWindowHidden');
            chatBox.classList.add('zenzioFadeBox-in-animation');
            Chatinput.classList.add('zenzioFadeBox-in-animation');
            ZenzioActiveChat = true;
            StartChat();
            ZenzioLogConsole('OpenChat', "chat is open");
            document.getElementById(ChatBugImageContainerId).style.display = 'none';
            document.getElementById(ChatBugImageId).style.display = 'none';
            document.getElementById(ChatTextCueId).style.display = 'none'; // Do not make this reappear, if the chat has been opened it fulfilled it's purpose.

        }


        try {
            currUserIp = await getClientIP();
        } catch (e) {
            currUserIp = "";
        }
    }

    //********************************** */
    //** Start the chat */
    //********************************** */
    async function StartChat() {

        const Chatinput = document.getElementById('zenzioChatInput');

        await loadChat();

        /*        if (openedChatFirstTime == true && vinid != undefined) {
                    var message = "I am looking at the car with VIN number " + vinid;
                    SendMessage(message, true);
                    openedChatFirstTime = false;
                }*/

        Chatinput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.keyCode === 13) {
                ZenzioLogConsole('StartChat', 'Enter key was pressed.');

                if (ZenzioActiveInput) {
                    ZenzioActiveInput = false;
                    InputCheck(event);
                }
            }
        });
    }

    //********************************** */
    //********************************** */
    async function InputCheck(event) {
        const chatBox = document.getElementById('zenzioChatBox');
        const Chatinput = document.getElementById('zenzioChatInput');
        if (event && event.keyCode === 13) { // 13 is the keyCode for the "Enter" key
            event.preventDefault();
            Chatinput.style.height = '40px';
            Chatinput.style.borderRadius = '50px';
            Chatinput.style.boxShadow = '';
            ChatSendButton.style.filter = '';
            ChatSendButton.style.top = "60%";
            ChatSendButton.style.transform = "translateY(-50%)";
        }


        if (Chatinput.value != "") {

            if (Chatinput.value.includes('--reset--')) {
                //do a full reset
                await ResetStorage();
                await CheckStorage();
                await loadChat();

                //delete the cookie
                deleteCookie(baseCookieName + locationid + "_marker");
                deleteCookie(baseCookieName + locationid + "_manualclose");

                //clear it
                Chatinput.value = "";
                Chatinput.innerHTML = "";
            }
            else if (Chatinput.value.includes('--closechat--')) {
                //clear it
                Chatinput.value = "";
                Chatinput.innerHTML = "";
                ZenzioActiveChat = true;
                OpenChat();
            }
            else if (Chatinput.value.includes('--showapi--')) {
                var str = "";
                for (const key in urlValues) {
                    str += `${key}: ${urlValues[key]}\n`;
                }
                const messageid = await generateGUID();
                ZenzioAddMessageBubble(str, 'a', messageid, false, '', '', '', false);
            }
            else {
                var newmessage = Chatinput.value
                Chatinput.value = "";
                Chatinput.innerHTML = "";
                await SendMessage(newmessage);
            }
        }
        else {
            ZenzioActiveInput = true;
            Chatinput.value = "";
            Chatinput.innerHTML = "";
        }
    }

    async function SendMessage(Message) {
        chatid = localStorage.getItem('ChatID');
        messageid = await generateGUID();

        LastmessageTime = new Date().toUTCString();
        //console.log('RequestMessage')
        clicksCount = 0;
        writeCookie("clicksCount", clicksCount, baseExpirationDate);
        await UserRequest(chatid, locationid, messageid, Message, LastmessageTime);

    }


    async function UserRequest(chatid, locationid, messageid, Message, LastmessageTime) {
        while (true) {
            try {
                var url = `https://localhost:7077/OutBound/UserRequest?chatid=${chatid}&locationid=${locationid}&messageid=${messageid}&'&message=${encodeURIComponent(Message)}&messagetime=${LastmessageTime}`
                if (uniqueVins.size > 0) url += `&vinNumbers=${encodeURIComponent(Array.from(uniqueVins).join(','))}`

                const headers = new Headers();
                headers.append('X-Zenzio-Current-URL', window.location.href);
                headers.append('X-Zenzio-Current-IP', currUserIp);

                const response = await fetch(url, {
                    method: 'GET',
                    headers: headers,
                });

                break;
            } catch (error) {
                console.error(error);
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }
    }

    async function CheckStorage() {
        chatid = await localStorage.getItem('ChatID');

        if (chatid == null) {
            await localStorage.removeItem('ChatID');
            var newGUID = await generateGUID();
            await localStorage.setItem('ChatID', newGUID);
            chatid = await localStorage.getItem('ChatID');
            createdUtc = await localStorage.getItem('createdUtc');
            ZenzioNewChat = true;
            ZenzioLogConsole('CheckStorage', 'Storage Created: New ChatId: ' + chatid);
            return true;
        }
        else {
            ZenzioLogConsole('CheckStorage', 'Loaded Storage ChatID: ' + chatid);
            return false;
        }

        var msgId = await generateGUID();
        ZenzioAddMessageBubble(chatid, 'a', msgId, createdUtc);
    }

    async function ResetStorage() {
        localStorage.removeItem('ChatID');

        const chatBox = document.getElementById('zenzioChatBox');
        while (chatBox.firstChild) {
            chatBox.removeChild(chatBox.firstChild);
        }
        ZenzioNewChat = CheckStorage(null);
    }

    async function loadChat() {
        try {
            const ChatID = await localStorage.getItem('ChatID');

            url = 'https://localhost:7077/OutBound/LoadChat?chatid=' + ChatID + '&locationid=' + locationid;
            const headers = new Headers();
            headers.append('X-Zenzio-Current-URL', window.location.href);
            headers.append('X-Zenzio-Current-IP', currUserIp);

            /*const response = await fetch(url);*/

            response = await fetch(url, {
                method: 'GET',
                headers: headers,
            });

            let chatBox = document.getElementById('zenzioChatBox');

            if (!response.ok) throw new Error('Error fetching data: ${response.statusText}');
            const ZenChatList = await response.json();
            //console.log('Number of Loaded Messages: ' + ZenChatList.messages.length);
            ZenzioActiveInput = false;
            chatBox.innerHTML = '';

            CheckWelcome();

            ZenChatList.messages.forEach((item) => {
                // console.log(item);
                ZenzioAddMessageBubble(item.msg, item.source, item.messageId, item.createdUtc, item.hide);
                if (item.source === 'a') ZenzioActiveInput = true;
            });
            if (ZenChatList.messages.length > 0) {
                openedChatFirstTime = false;
                ZenzioActiveInput = true;
            }

            setInterval(getTimestampText, 60 * 1000);
        } catch (error) {
            console.error(error);
            // Handle the error here
        }
    }

    function CheckWelcome() {
        try {
            var chatBox = document.getElementById("zenzioChatBox");

            // Check if any child of chatBox contains the WelcomeMessage
            var containsWelcome = [...chatBox.children].some(child => child.innerHTML === WelcomeMessage);

            if (!containsWelcome) {
                const messageid = generateGUID();
                let CreatedTime = new Date(Date.UTC(new Date().getUTCFullYear()));
                ZenzioAddMessageBubble(WelcomeMessage, 'a', messageid, CreatedTime, false, '', '', '', true);
            }
        } catch {
            // handle any error here
        }
    }


    window.scrollToBottom = (elementId) => {
        const checkElement = () => {
            const element = document.getElementById(elementId);
            if (element) {
                element.scrollTop = element.scrollHeight - element.clientHeight;
            } else {
                requestAnimationFrame(checkElement);
            }
        };
        requestAnimationFrame(checkElement);
    };

    async function generateGUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    function ScrollToBottom(elementName) {
        try {
            setTimeout(() => {
                const checkElement = () => {
                    const element = document.getElementById(elementName);
                    if (element) {
                        element.scrollTop = element.scrollHeight - element.clientHeight;
                    } else {
                        requestAnimationFrame(checkElement);
                    }
                };
                requestAnimationFrame(checkElement);
            }, 100);
        } catch
        {

        }

    };
    function writeOrUpdateCookie(name, value, expirationDate) {
        try {
            const existingCookie = getCookie(name);

            if (existingCookie) {
                updateCookie(name, value, expirationDate);
            } else {
                writeCookie(name, value, expirationDate);
            }
        } catch (error) {
            console.error("Error writing/updating cookie:", error);
        }
    }

    function getCookie(name) {
        try {
            const cookies = document.cookie.split("; ");
            for (const cookie of cookies) {
                const [cookieName, _] = cookie.split("=");
                if (cookieName === name) {
                    return cookie;
                }
            }
            return null;
        } catch (error) {
            console.error("Error getting cookie:", error);
            return null;
        }
    }

    function writeCookie(name, value, expirationDate) {
        try {
            const expires = expirationDate ? "; expires=" + expirationDate.toUTCString() : "";
            document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/`;
        } catch (error) {
            console.error("Error writing cookie:", error);
        }
    }

    function updateCookie(name, value, expirationDate) {
        try {
            deleteCookie(name);
            writeCookie(name, value, expirationDate);
        } catch (error) {
            console.error("Error updating cookie:", error);
        }
    }

    function deleteCookie(name) {
        try {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        } catch (error) {
            console.error("Error deleting cookie:", error);
        }
    }

    async function getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            return null;
        }
    }

    function getClientDevice() {
        if (navigator.userAgent.match(/Android/i)
            || navigator.userAgent.match(/webOS/i)
            || navigator.userAgent.match(/iPhone/i)
            || navigator.userAgent.match(/iPad/i)
            || navigator.userAgent.match(/iPod/i)
            || navigator.userAgent.match(/BlackBerry/i)
            || navigator.userAgent.match(/Windows Phone/i)) {
            return true;
        }
        return false;
    }

    return self;
})();

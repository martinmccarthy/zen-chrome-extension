if (!window.myExtensionContentScriptInjected) {
    window.myExtensionContentScriptInjected = true;
  
    console.log("Content script injected and running");
  
    chrome.runtime.sendMessage({contentScriptInjected: true});
  
    chrome.runtime.sendMessage({contentScriptInjected: true});

    var hasInjected = false;


    if (window.DDC === undefined) {
        const APILoader = class APILoader {
            static async create() {
                const apiLoader = new APILoader();
                return new window.DDC.API();
            }
        };

        const API = class API {
            loadJS(href) {
                return new Promise((resolve, reject) => {
                    console.log('API.loadJS', href);
                    const script = document.createElement('script');
                    script.src = href;
                    script.onload = resolve; 
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
            };
        
            loadCSS(href) {
                console.log('API.loadCSS', href);
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = href;
                document.head.appendChild(link);
            }
        };

        window.DDC = {};
        window.DDC.APILoader = APILoader;
        window.DDC.API = API;
    }

    function callZenzioScript() {
        const script = document.createElement('script');
        script.textContent = `if (window.Zenzio) { Zenzio.doFirstLoad(); }`;
        (document.head || document.documentElement).appendChild(script);
        script.remove();
    }

    function resetChat() {
        console.log('Resetting chat');
        const script = document.createElement('script');
        script.textContent = `if (window.Zenzio) { Zenzio.resetChat(); }`;
        (document.head || document.documentElement).appendChild(script);
        script.remove();
    }

    function insertVin() {
        console.log('Inserting VIN');
        const script = document.createElement('script');
        script.textContent = `if (window.Zenzio) { Zenzio.insertVin(); }`;
        (document.head || document.documentElement).appendChild(script);
        script.remove();
    }

    async function loadZenzio() {
        console.log('Loading Zenzio AI...')
        const API = await window.DDC.APILoader.create();
        await API.loadCSS('https://ai.zenzio.com/api/ZenAsset/dlrcom/css');
        await API.loadJS('https://ai.zenzio.com/api/ZenAsset/dlrcom/js').then(() => {
            callZenzioScript();
            hasInjected = true;
            console.log('Zenzio AI Loaded...');
        }).catch(error => {
            console.error('Failed to load Zenzio JS:', error);
        });
    }

    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        if (message.action === 'loadZenzio') {
            if(!hasInjected) loadZenzio();
        }
        else if (message.action === 'resetChat') {
            resetChat();
        }
        else if (message.action === 'insertVin') {
            insertVin();
        }
    });

}


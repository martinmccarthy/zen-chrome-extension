console.log("Hello from injected script");

if (window.DDC === undefined) {
    console.log('Loading Zenzio AI...');

    const APILoader = class APILoader {
        static async create() {
            const apiLoader = new APILoader();
            return new window.DDC.API();
        }
    };

    const API = class API {
        loadJS(href) {
            console.log('API.loadJS', href);
            const script = document.createElement('script');
            script.src = href;
            document.head.appendChild(script);
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

async function loadZenzio() {
    const API = await window.DDC.APILoader.create();
    await API.loadCSS('https://ai.zenzio.com/api/ZenAsset/dlrcom/css');
    await API.loadJS('https://ai.zenzio.com/api/ZenAsset/dlrcom/js');
    Zenzio.doFirstLoad(); // Assuming this function exists in the Zenzio API
    console.log('Zenzio AI Loaded...');
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === 'loadZenzio') {
        loadZenzio();
    }
});

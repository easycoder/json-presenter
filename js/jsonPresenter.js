// JSON::Presenter

window.onload = () => {
    const createCORSRequest = (url) => {
        var xhr = new XMLHttpRequest();
        if (`withCredentials` in xhr) {
    
            // Check if the XMLHttpRequest object has a "withCredentials" property.
            // "withCredentials" only exists on XMLHTTPRequest2 objects.
            xhr.open(`GET`, url, true);
    
        } else if (typeof XDomainRequest != `undefined`) {
    
            // Otherwise, check if XDomainRequest.
            // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
            xhr = new XDomainRequest();
            xhr.open(`GET`, url);
    
        } else {
    
            // Otherwise, CORS is not supported by the browser.
            xhr = null;
    
        }
        return xhr;
    };	
    
    const container = document.getElementById(`jp-container`);

    const scriptElement = document.getElementById(`jp-script`);
    const request = createCORSRequest(scriptElement.innerText);
    if (!request) {
        throw Error(`Unable to access the JSON script`);
    }

    request.onload = () => {
        if (200 <= request.status && request.status < 400) {
            JSON_Presenter.present(container, request.responseText);
        } else {
            throw Error(`Unable to access the JSON script`);
        }
    };

    request.onerror = () => {
        throw Error(`Unable to access the JSON script`);
    };

    request.send();
};

const JSON_Presenter = {

    present: (container, text) => {
        containerStyles = [
            `border`,
            `background`,
            `font-face`,
            `font-size`
        ];

        JSON_Presenter.container = container;
        const script = JSON.parse(text);
        const height = Math.round(parseFloat(container.offsetWidth) * script.aspectH / script.aspectW);
        container.style[`height`] = `${Math.round(height)}px`;
        for (const item of containerStyles) {
            JSON_Presenter.doStyle(container, script.default, item);
        } 
        container.style[`background-size`] = `cover`;
        JSON_Presenter.doBlocks(script.blocks);
        JSON_Presenter.doStep(script, 0);
    },

    doStyle: (element, spec, property) => {
        if (typeof spec[property] !== 'undefined') {
            element.style[property] = spec[property];
        }
    },

    doBlocks: blocks => {
        const container = JSON_Presenter.container;
        for (const block of blocks) {

        }
    },

    doStep: (script, stepno) => {
        const step = script.steps[stepno];
        console.log(step);
    }
};

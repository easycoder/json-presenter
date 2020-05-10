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
        const containerStyles = [
            `border`,
            `background`
        ];
        const defaults = [
            `fontFace`,
            `fontWeight`,
            `fontStyle`,
            `textAlign`,
            `fontColor`,
            `blockLeft`,
            `blockTop`,
            `blockWidth`,
            `blockHeight`,
            `blockBackground`,
            `blockPadding`
        ];

        const script = JSON.parse(text);
        const height = Math.round(parseFloat(container.offsetWidth) * script.aspectH / script.aspectW);
        container.style[`height`] = `${Math.round(height)}px`;
        container.style[`position`] = `relative`;
        for (const item of containerStyles) {
            JSON_Presenter.doStyle(container, script.container, item);
        } 
        container.style[`background-size`] = `cover`;
        JSON_Presenter.doBlocks(container, script.blocks, script.defaults);
        JSON_Presenter.doStep(script, 0);
    },

    // Process a style property
    doStyle: (element, spec, property) => {
        if (typeof spec[property] !== 'undefined') {
            element.style[property] = spec[property];
        }
    },

    // Create all the blocks
    doBlocks: (container, blocks, defaults) => {
        for (const name in blocks) {
            const block = blocks[name];
            const properties = {};
            // Set up the default properties
            for (const name in defaults) {
                properties[name] = defaults[name];
            }
            // Override with local values
            for (const name in block.spec) {
                properties[name] = block.spec[name];
            }
            block.properties = properties;
            // Create the block
            w = Math.round(container.getBoundingClientRect().width);
            h = Math.round(container.getBoundingClientRect().height);
            const element = document.createElement(`div`);
            block.element = element;
            element.style[`position`] = `absolute`;
            element.style[`display`] = `none`;
            element.style[`left`] = properties.blockLeft * w / 1000;
            element.style[`top`] = properties.blockTop * h / 1000;
            element.style[`width`] = `${properties.blockWidth * w / 1000}px`;
            element.style[`height`] = `${properties.blockHeight * h / 1000}px`;
            element.style[`background`] = properties.blockBackground;
            element.style[`border`] = properties.blockBorder;
            container.appendChild(element);
            const padding = properties.blockPadding;
            const inner = document.createElement(`div`);
            inner.style[`position`] = `absolute`;
            inner.style[`left`] = padding;
            inner.style[`top`] = padding;
            inner.style[`width`] = `calc(100% - ${padding} - ${padding})`;
            element.appendChild(inner);
            element.inner = inner;
            const text = document.createElement(`div`);
            text.style[`font-face`] = properties.fontFace;
            text.style[`font-size`] = `${properties.fontSize * h / 1000}px`;
            text.style[`font-weight`] = properties.fontWeight;
            text.style[`font-style`] = properties.fontStyle;
            text.style[`color`] = properties.fontColor;
            text.style[`text-align`] = properties.textAlign;
            inner.appendChild(text);
            inner.text = text;
        }
    },

    doStep: (script, stepno) => {
        const goto = (script, stepno) => {
            JSON_Presenter.doStep(script, stepno);
        };
        const step = script.steps[stepno];
        switch (step.action) {
            case `show`:
                for (const item of step.items) {
                    const block = script.blocks[item.block];
                    switch (block.type) {
                        case `text`:
                            let content = script.content[item.content];
                            if (content[0] === `[`) {
                                content = JSON.parse(content).join(`<br><br>`);
                            }
                            block.element.inner.text.innerHTML = content.split(`\n`).join(`<br>`);
                        break;
                        case `image`:
                            break;
                    }
                    block.element.style[`display`] = `block`;
                }
                goto(script, stepno + 1);
                break;
            case `hide`:
                for (const item of step.items) {
                    const block = script.blocks[item.block];
                     block.element.style[`display`] = `none`;
                }
                goto(script, stepno + 1);
                break;
            case `hold`:
                const duration = step.duration * 1000;
                setTimeout(function () {
                    goto(script, stepno + 1);
                }, duration);
                break;
        }
    }
};

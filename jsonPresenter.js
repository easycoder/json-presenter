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
        document.title = script.title;
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
            block.container = container;
        }
    },

    // Run a step
    doStep: (script, stepno) => {
        const goto = (script, stepno) => {
            if (stepno < script.steps.length) {
                JSON_Presenter.doStep(script, stepno);
            }
        };

        // Create an element.
        const createElement = (block) => {
            const container = block.container;
            w = Math.round(container.getBoundingClientRect().width);
            h = Math.round(container.getBoundingClientRect().height);
            const properties = block.properties;
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
            const paddingTop = properties.blockPaddingTop;
            const paddingLeft = properties.blockPaddingLeft;
            const inner = document.createElement(`div`);
            inner.style[`position`] = `absolute`;
            inner.style[`left`] = paddingLeft;
            inner.style[`top`] = paddingTop;
            inner.style[`width`] = `calc(100% - ${paddingLeft} - ${paddingLeft})`;
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
        };

        // Set the content of blocks
        const doSetContent = (script, step) => {
            for (const item of step.blocks) {
                const block = script.blocks[item.block];
                switch (block.type) {
                    case `text`:
                        let content = script.content[item.content];
                        if (Array.isArray(content)) {
                            content = content.join(`<br><br>`);
                        }
                        content = content.split(`\n`).join(`<br>`);
                        block.element.inner.text.innerHTML = content.split(`\n`).join(`<br>`);
                    break;
                    case `image`:
                        break;
                }
            }
        };
        
        // Create an element
        const doCreate = (script, step) => {
            if (Array.isArray(step.blocks)) {
                for (const block of step.blocks)
                {
                    createElement(script.blocks[block]);
                }
            } else {
                createElement(script.blocks[step.blocks]);
            }
        };

        // Process a single fade step
        const doFadeStep = (element, steps, n, upDown, onFinish) => {
            if (upDown) {
                element.style[`opacity`] = parseFloat(n) / steps;
            } else {
                element.style[`opacity`] = 1.0 - parseFloat(n) / steps;
            }
            if (n < steps) {
                setTimeout(function () {
                    doFadeStep(element, steps, n + 1, upDown, onFinish);
                }, 40);
            } else {
                element.style[`opacity`] = upDown ? 1.0 : 0.0;
                if (!upDown) {
                    element.style[`display`] = `none`;
                }
                onFinish();
            }
        };

        // Handle a fade up or down
        const doFade = (script, step, stepno, upDown) => {
            const steps = Math.round(parseFloat(step.duration) * 25);
            if (Array.isArray(step.blocks)) {
                let blocks = step.blocks.length;
                for (const block of step.blocks)
                {
                    const element = script.blocks[block].element;
                    element.style[`opacity`] = upDown ? 0.0 : 1.0;
                    if (upDown) {
                        element.style[`display`] = `block`;
                    }
                    doFadeStep(element, steps, 0, upDown, function () {
                        blocks--;
                        if (blocks === 0 && step.wait) {
                            goto(script, stepno + 1);
                        }
                    });
                }
            } else {
                const element = script.blocks[step.blocks].element;
                element.style[`opacity`] = upDown ? 0.0 : 1.0;
                if (upDown) {
                    element.style[`display`] = `block`;
                }
                doFadeStep(element, steps, 0, upDown, function () {
                    if (step.wait) {
                        goto(script, stepno + 1);
                    }
                });
            }
            if (!step.wait) {
                goto(script, stepno + 1);
            }
        };

        // Show or hide an element
        const doShowHide = (script, step, showHide) => {
            if (Array.isArray(step.blocks)) {
                for (const block of step.blocks)
                {
                    script.blocks[block].element.style[`display`] = showHide ? `block` : `none`;
                }
            } else {
                script.blocks[step.blocks].element.style[`display`] = showHide ? `block` : `none`;
            }
        };

        // Process a single step
        const step = script.steps[stepno];
        switch (step.action) {
            case `set content`:
                doSetContent(script, step);
                goto(script, stepno + 1);
                break;
            case `create`:
                doCreate(script, step);
                goto(script, stepno + 1);
                break;
            case `show`:
                doShowHide(script, step, true);
                goto(script, stepno + 1);
                break;
            case `hide`:
                doShowHide(script, step, false);
                goto(script, stepno + 1);
                break;
            case `hold`:
                setTimeout(function () {
                    goto(script, stepno + 1);
                }, step.duration * 1000);
                break;
            case `fade up`:
                doFade(script, step, stepno, true);
                break;
            case `fade down`:
                doFade(script, step, stepno, false);
                break;
        }
    }
};

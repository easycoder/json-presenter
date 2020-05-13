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

    stepno: 0,

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
        script.element = container;
        for (const item of containerStyles) {
            JSON_Presenter.doStyle(container, script.container, item);
        } 
        container.style[`background-size`] = `cover`;
        JSON_Presenter.doBlocks(container, script.blocks, script.defaults);
        JSON_Presenter.doStep(script);
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
            for (const name in block) {
                properties[name] = block[name];
            }
            block.properties = properties;
            block.container = container;
        }
    },

    // Handle a step
    doStep: (script) => {

        // Create an element.
        const createElement = (block) => {
            const container = block.container;
            w = Math.round(container.getBoundingClientRect().width);
            h = Math.round(container.getBoundingClientRect().height);
            const properties = block.properties;
            const element = document.createElement(`div`);
            block.element = element;
            element.style[`position`] = `absolute`;
            element.style[`opacity`] = `0.0`;
            element.style[`left`] = properties.blockLeft * w / 1000;
            element.style[`top`] = properties.blockTop * h / 1000;
            element.style[`width`] = `${properties.blockWidth * w / 1000}px`;
            element.style[`height`] = `${properties.blockHeight * h / 1000}px`;
            element.style[`background`] = properties.blockBackground;
            element.style[`border`] = properties.blockBorder;
            container.appendChild(element);
            const paddingLeft = `${properties.blockPaddingLeft * w / 1000}px`;
            const paddingTop = `${properties.blockPaddingTop * h / 1000}px`;
            const inner = document.createElement(`div`);
            inner.style[`position`] = `absolute`;
            inner.style[`left`] = paddingLeft;
            inner.style[`top`] = paddingTop;
            inner.style[`width`] = `calc(100% - ${paddingLeft} - ${paddingLeft})`;
            element.appendChild(inner);
            element.inner = inner;
            const text = document.createElement(`div`);
            text.style[`font-family`] = properties.fontFamily;
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
                const spec = script.content[item.content];
                switch (spec.type) {
                    case `text`:
                        let content = spec.content;
                        if (Array.isArray(content)) {
                            content = content.join(`<br><br>`);
                        }
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

        // Show or hide an element
        const doShowHide = (script, step, showHide) => {
            if (Array.isArray(step.blocks)) {
                for (const block of step.blocks)
                {
                    script.blocks[block].element.style[`opacity`] = showHide ? `1.0` : `0.0`;
                }
            } else {
                script.blocks[step.blocks].element.style[`opacity`] = showHide ? `1.0` : `0.0`;
            }
        };

        // Fade up or down
        const doFade = (script, step, upDown) => {
            const animSteps = Math.round(step.duration * 25);
            var animStep = 0;
            const interval = setInterval(() => {
                if (animStep < animSteps) {
                    const ratio =  0.5 - Math.cos(Math.PI * animStep / animSteps) / 2;
                    if (Array.isArray(step.blocks)) {
                        let blocks = step.blocks.length;
                        for (const block of step.blocks)
                        {
                            const element = script.blocks[block].element;
                            element.style[`opacity`] = upDown ? ratio : 1.0 - ratio;
                        }
                    } else {
                        const element = script.blocks[step.blocks].element;
                        element.style[`opacity`] = upDown ? ratio : 1.0 - ratio;
                    }
                    animStep++;
                } else {
                    clearInterval(interval);
                    if (!step.continue) {
                        JSON_Presenter.doStep(script);
                    }
                }
             }, 40);
             if (step.continue) {
                 JSON_Presenter.doStep(script);
             }
        };

        // Handle a crossfade
        const doCrossfade = (script, step) => {
            const block = script.blocks[step.block];
            const properties = block.properties;
            const target = {};
            const content = script.content[step.target];
            let newText = content.content;
            if (Array.isArray(newText)) {
                newText = newText.join(`<br><br>`);
            }
            newText = newText.split(`\n`).join(`<br>`);
            switch (content.type) {
                case `text`:
                    const element = document.createElement(`div`);
                    element.style[`position`] = `absolute`;
                    element.style[`opacity`] = `0.0`;
                    element.style[`left`] = properties.blockLeft * w / 1000;
                    element.style[`top`] = properties.blockTop * h / 1000;
                    element.style[`width`] = `${properties.blockWidth * w / 1000}px`;
                    element.style[`height`] = `${properties.blockHeight * h / 1000}px`;
                    element.style[`background`] = properties.blockBackground;
                    element.style[`border`] = properties.blockBorder;
                    block.container.appendChild(element);
                    target.element = element;
                    const paddingLeft = `${properties.blockPaddingLeft * w / 1000}px`;
                    const paddingTop = `${properties.blockPaddingTop * h / 1000}px`;
                    const inner = document.createElement(`div`);
                    inner.style[`position`] = `absolute`;
                    inner.style[`left`] = paddingLeft;
                    inner.style[`top`] = paddingTop;
                    inner.style[`width`] = `calc(100% - ${paddingLeft} - ${paddingLeft})`;
                    element.appendChild(inner);
                    const text = document.createElement(`div`);
                    text.style[`font-family`] = properties.fontFamily;
                    text.style[`font-size`] = `${properties.fontSize * h / 1000}px`;
                    text.style[`font-weight`] = properties.fontWeight;
                    text.style[`font-style`] = properties.fontStyle;
                    text.style[`color`] = properties.fontColor;
                    text.style[`text-align`] = properties.textAlign;
                    inner.appendChild(text);
                    text.innerHTML = newText;
                    break;
                default:
                    throw Error(`Unknown content type: '${content.type}'`);
            }

            const animSteps = Math.round(step.duration * 25);
            var animStep = 0;
            const interval = setInterval(() => {
                if (animStep < animSteps) {
                    const ratio =  0.5 - Math.cos(Math.PI * animStep / animSteps) / 2;
                    block.element.style[`opacity`] = 1.0 - ratio;
                    target.element.style[`opacity`] = ratio;
                    animStep++;
                } else {
                    clearInterval(interval);
                    switch (content.type) {
                        case `text`:
                            block.element.inner.text.innerHTML = newText;
                            block.element.style[`opacity`] = 1.0 ;
                            block.container.removeChild(target.element);
                            break;
                    }
                    if (!step.continue) {
                        JSON_Presenter.doStep(script);
                    }
                }
             }, 40);
             if (step.continue) {
                 JSON_Presenter.doStep(script);
             }
        };

        // Compute a block size
        const setComputedBlockSize = (block, target, ratio) => {
            const boundingRect = block.container.getBoundingClientRect();
            w = Math.round(boundingRect.width);
            h = Math.round(boundingRect.height);
            const width = block.properties.blockWidth * w / 1000;
            const height = block.properties.blockHeight * h / 1000;
            const endWidth = target.properties.blockWidth * w / 1000;
            const endHeight = target.properties.blockHeight * h / 1000;
            block.element.style[`width`] = 
                `${width + (endWidth - width) * ratio}px`;
            block.element.style[`height`] = 
                `${height + (endHeight - height) * ratio}px`;
        };

        // Compute a block position
        const setComputedBlockPosition = (block, target, ratio) => {
            const boundingRect = block.container.getBoundingClientRect();
            w = Math.round(boundingRect.width);
            h = Math.round(boundingRect.height);
            const left = block.properties.blockLeft * w / 1000;
            const top = block.properties.blockTop * h / 1000;
            const endLeft = target.properties.blockLeft * w / 1000;
            const endTop = target.properties.blockTop * h / 1000;
            block.element.style[`left`] = 
                left + (endLeft - left) * ratio;
            block.element.style[`top`] = 
                top + (endTop - top) * ratio;
        };

        // Compute a font size
        const setComputedFontSize = (block, target, ratio) => {
            h = Math.round(block.container.getBoundingClientRect().height);
            const size = block.properties.fontSize * h / 1000;
            const endSize = target.properties.fontSize * h / 1000;
            block.element.inner.text.style[`font-size`] = 
                `${size + Math.round((endSize - size) * ratio)}px`;
        };

        // Compute a font color
        const setComputedFontColor = (block, target, ratio) => {
            const color = block.fontColor;
            const endColor = target.fontColor;
            const rStart = parseInt(color.slice(1, 3), 16);
            const gStart = parseInt(color.slice(3, 5), 16);
            const bStart = parseInt(color.slice(5, 7), 16);
            const rFinish = parseInt(endColor.slice(1, 3), 16);
            const gFinish = parseInt(endColor.slice(3, 5), 16);
            const bFinish = parseInt(endColor.slice(5, 7), 16);
            const red = rStart + Math.round((rFinish - rStart) * ratio);
            const green = gStart + Math.round((gFinish - gStart) * ratio);
            const blue = bStart + Math.round((bFinish - bStart) * ratio);
            const r = ("0" + red.toString(16)).slice(-2);
            const g = ("0" + green.toString(16)).slice(-2);
            const b = ("0" + blue.toString(16)).slice(-2);
            block.element.inner.text.style[`color`] = `#${r}${g}${b}`;
        };

        // Handle a single step of a transition
        const doTransitionStep = (type, block, target, ratio) => {
            switch (type) {
                case `block size`:
                    setComputedBlockSize(block, target, ratio);
                    break;
                case `block position`:
                    setComputedBlockPosition(block, target, ratio);
                    break;
                case `font size`:
                    setComputedFontSize(block, target, ratio);
                    break;
                case `font color`:
                    setComputedFontColor(block, target, ratio);
                    break;
                default:
                    throw Error(`Unknown transition type: '${type}'`);
            }
        };

        // Handle a transition
        const doTransition = (script, step) => {
            const animSteps = Math.round(step.duration * 25);
            var animStep = 0;
            const interval = setInterval(() => {
                if (animStep < animSteps) {
                    const ratio =  0.5 - Math.cos(Math.PI * animStep / animSteps) / 2;
                    const block = script.blocks[step.block];
                    const target = script.blocks[step.target];
                    if (Array.isArray(step.type)) {
                        for (const type of step.type) {
                            doTransitionStep(type, block, target, ratio);
                        }
                    } else {
                        doTransitionStep(type, block, target, ratio);
                    }
                    animStep++;
                } else {
                    clearInterval(interval);
                    if (!step.continue) {
                        JSON_Presenter.doStep(script);
                    }
                }
             }, 40);
             if (step.continue) {
                JSON_Presenter.doStep(script);
             }
        };

        // Process a single step
        while (JSON_Presenter.stepno < script.steps.length) {
            const step = script.steps[JSON_Presenter.stepno++];
            console.log(`Step ${JSON_Presenter.stepno}: ${step.action}`);
            switch (step.action) {
                case `set content`:
                    doSetContent(script, step);
                    break;
                case `create`:
                    doCreate(script, step);
                    break;
                case `show`:
                    doShowHide(script, step, true);
                    break;
                case `hide`:
                    doShowHide(script, step, false);
                    break;
                case `hold`:
                    setTimeout(() => {
                        JSON_Presenter.doStep(script);
                    }, step.duration * 1000);
                    return;
                case `fade up`:
                    doFade(script, step, true);
                    return;
                case `fade down`:
                    doFade(script, step, false);
                    return;
                case `crossfade`:
                    doCrossfade(script, step);
                    return;
                case`transition`:
                    doTransition(script, step);
                    return;
                default:
                    throw Error(`Unknown action: '${step.action}'`);
            }
        }
        console.log(`finished`);
    }
};

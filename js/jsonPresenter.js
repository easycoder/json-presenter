const JSON_Presenter = {

    styles: [
        `border`,
        `background`
    ],

    present: (containerId, text) => {
        console.log(`This is the presenter, using ${containerId}`);

        JSON_Presenter.container = document.getElementById(containerId);

        const script = JSON.parse(text);

        JSON_Presenter.doGlobal(script.global);

        let step = 0;
        JSON_Presenter.doStep(script, step);
    },

    doStyle: (element, spec, property) => {
        if (typeof spec[property] !== 'undefined') {
            element.style[property] = spec[property];
        }
    },

    doGlobal: global => {
        const container = JSON_Presenter.container;
        const height = Math.round(parseFloat(container.offsetWidth) * global.aspectH / global.aspectW);
        container.style[`height`] = `${Math.round(height)}px`;
        for (const item of JSON_Presenter.styles) {
            JSON_Presenter.doStyle(container, global.init, item);
        } 
        container.style[`background-size`] = `cover`;
    },

    doStep: (script, stepno) => {
        console.log(script);
        const step = script.steps[stepno];
        console.log(step);
        const theme = script.global.themes[step.theme];
        console.log(theme);
    }
};

window.onload = function () {
    JSON_Presenter.present(script);
}
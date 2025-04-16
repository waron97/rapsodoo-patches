(function () {
    window.styleInjectorSetupDone = false;

    function runBuilderStyleInjector() {
        const editorNode = document.querySelector('.B2wCpqEditProcessRoot');

        if (editorNode) {
            const b2wMain = document.querySelector('.b2w-root-main');
            const h = b2wMain?.clientHeight
                ? `${b2wMain.clientHeight - 230}px`
                : '85vh';
            document.body.style.setProperty('--corrected-min-height', h);
        }
    }

    const styleInjectObserver = new MutationObserver(() => {
        runBuilderStyleInjector();
    });

    if (window.styleInjectorSetupDone) {
        return;
    }

    window.styleInjectorSetupDone = true;

    runBuilderStyleInjector();

    styleInjectObserver.observe(document.body, {
        subtree: true,
        childList: true,
    });
})();

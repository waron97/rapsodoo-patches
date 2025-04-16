(function () {
    function runPbSave() {
        const node = document
            .querySelector("b2w-button[text='Save Process']")
            ?.shadowRoot?.querySelector('button');

        if (!node) {
            window.saveShortcutAlreadySetUp = false;
            return;
        }

        if (window.saveShortcutAlreadySetUp) {
            return;
        }

        window.addEventListener('keydown', (evt) => {
            if (evt.ctrlKey && evt.key === 's') {
                evt.preventDefault();
                node.click();
            }
        });
    }

    if (window.pbSaveShortcutObserverSetupDone) {
        return;
    }

    window.saveShortcutAlreadySetUp = true;

    const saveShortcutObserver = new MutationObserver(() => runPbSave());

    runPbSave();
    saveShortcutObserver.observe(document.body, {
        childList: true,
        subtree: true,
    });

    window.pbSaveShortcutObserverSetupDone = true;
})();

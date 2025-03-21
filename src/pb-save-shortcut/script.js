let saveShortcutAlreadySetUp = false;

function runPbSave() {
    const node = document
        .querySelector("b2w-button[text='Save Process']")
        ?.shadowRoot?.querySelector('button');

    if (!node) {
        saveShortcutAlreadySetUp = false;
        return;
    }

    if (saveShortcutAlreadySetUp) {
        return;
    }

    window.addEventListener('keydown', (evt) => {
        if (evt.ctrlKey && evt.key === 's') {
            evt.preventDefault();
            node.click();
        }
    });
}

const saveShortcutObserver = new MutationObserver(() => runPbSave());

runPbSave();
saveShortcutObserver.observe(document.body, { childList: true, subtree: true });

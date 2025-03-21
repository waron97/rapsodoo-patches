let setupDone = false;

async function runSearchHistory() {
    const inputNode = document
        .querySelector('b2w-input-search')
        ?.shadowRoot?.querySelector('.b2w-input-search');

    const searchButton = document
        .querySelector('b2w-input-search')
        ?.shadowRoot?.querySelector('.b2w-search-button');

    const processesLoaded = document
        .querySelector('b2w-accordion-container')
        ?.querySelector('.processCard');

    if (!inputNode || !searchButton || !processesLoaded) {
        setupDone = false;
        return;
    }

    if (setupDone) {
        return;
    }

    const prevValue = sessionStorage.getItem('b2w-search-value');

    if (prevValue) {
        inputNode.value = prevValue || '';

        const evtChange = new Event('change');
        const evtInput = new Event('input');

        inputNode.dispatchEvent(evtChange);
        inputNode.dispatchEvent(evtInput);

        searchButton.click();
    }

    inputNode.addEventListener('input', () => {
        sessionStorage.setItem('b2w-search-value', inputNode.value);
    });

    setupDone = true;
}

const searchObserver = new MutationObserver(() => {
    runSearchHistory();
});

runSearchHistory();
searchObserver.observe(document.body, { subtree: true, childList: true });

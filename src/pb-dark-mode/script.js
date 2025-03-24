(function () {
    function run() {
        const isEditorPage = !!document.querySelector('.B2wCpqEditProcessRoot');

        if (isEditorPage) {
            const wc = document.querySelector('b2w-toolbar');

            if (wc) {
                const toolbar =
                    wc.shadowRoot.querySelector('.toolbar-container');

                const icons = wc.shadowRoot.querySelectorAll('.toolbar-option');

                if (toolbar) {
                    toolbar.style.setProperty('background', 'var(--dark-bg)');
                    toolbar.style.setProperty('box-shadow', 'none');
                }

                icons.forEach((option) => {
                    const button = option.querySelector('.toolbar-button');
                    const text = option.querySelector('.toolbar-text');
                    button.style.setProperty('color', 'var(--light)');
                    text.style.setProperty('color', 'var(--light)');
                });
            }

            const buttons = document.querySelectorAll('b2w-button');

            buttons.forEach((button) => {
                const inner = button.shadowRoot.querySelector('button');

                if (!inner || button.matches('b2w-modal *')) {
                    // if button missing or in modal, do nothing
                    return;
                }

                if (!inner.classList.contains('primary')) {
                    inner.style.border = '2px solid var(--light)';
                    inner.style.color = 'var(--light)';
                } else {
                    inner.style.backgroundColor = 'var(--light)';
                    inner.style.color = 'var(--dark-pop)';
                }
            });

            const arrowCandidates = document.querySelectorAll('path');
            arrowCandidates.forEach((candidate) => {
                if (
                    candidate.style.markerEnd?.includes?.(
                        'sequenceflow-end-white-black',
                    )
                ) {
                    candidate.style.stroke = 'var(--light)';
                }
            });

            const arrowMarkerCandidates = document.querySelectorAll('marker');
            arrowMarkerCandidates.forEach((candidate) => {
                if (candidate.id?.includes?.('sequenceflow-end-white-black')) {
                    candidate.childNodes.forEach((child) => {
                        child.style.stroke = 'var(--light)';
                        child.style.fill = 'var(--light)';
                    });
                }

                if (
                    candidate.id?.includes?.(
                        'conditional-default-flow-marker-white-black',
                    )
                ) {
                    candidate.childNodes.forEach((child) => {
                        child.style.stroke = 'var(--light)';
                        child.style.fill = 'var(--light)';
                    });
                }
            });
        }
    }
    const observer = new MutationObserver(() => {
        run();
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();

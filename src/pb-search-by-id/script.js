(function () {
    const storageKey = 'pb-direct-search-history';

    function interceptFetchResponse() {
        const { fetch: originalFetch } = window;
        const processUrlPattern = /\/v1\/builder\/process$/gim;

        window.fetch = (...args) => {
            return originalFetch(...args)
                .then(async (response) => {
                    if (
                        typeof args[0] === 'string' ||
                        (typeof args[0] === 'object' && args[0]?.url)
                    ) {
                        const url =
                            typeof args[0] === 'string' ? args[0] : args[0].url;

                        if (processUrlPattern.test(url)) {
                            try {
                                // Clone the response to avoid consuming the original
                                const responseClone = response.clone();
                                const result = await responseClone.json();

                                var mod = [...result];

                                for (let i = 0; i < result.length; i++) {
                                    if (
                                        Object.prototype.hasOwnProperty.call(
                                            result,
                                            i,
                                        )
                                    ) {
                                        mod[i] = {
                                            ...mod[i],
                                            pages: [],
                                            process_structure: {},
                                            built_page: '',
                                        };
                                    }
                                }

                                localStorage.setItem(
                                    'pb-processes',
                                    JSON.stringify(mod),
                                );

                                // Create a new response with the original JSON
                                const modifiedResponse = new Response(
                                    JSON.stringify(result),
                                    {
                                        status: response.status,
                                        statusText: response.statusText,
                                        headers: response.headers,
                                    },
                                );

                                return modifiedResponse;
                            } catch (error) {
                                console.error('Error processing JSON:', error);
                                // If there's an error, return the original response
                                return response;
                            }
                        }
                    }
                    return response;
                })
                .catch((error) => {
                    console.error('Fetch error:', error);
                    throw error; // Re-throw the error to propagate it to the original caller
                });
        };
    }

    function updateHistory(search) {
        const prev = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const history = [search, ...prev].slice(0, 30);
        localStorage.setItem(storageKey, JSON.stringify(history));
    }

    function openModalWithInput(processes) {
        return new Promise((resolve, reject) => {
            let searchIndex = null;
            const searchHistory = JSON.parse(
                localStorage.getItem(storageKey) || '[]',
            );

            // Create the modal container
            const modalContainer = document.createElement('div');
            modalContainer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            `;

            // Create the modal content
            const modalContent = document.createElement('form');
            modalContent.style.cssText = `
                background-color: white;
                padding: 20px;
                border-radius: 5px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
                width: 300px;
            `;

            // Add event listener to close modal on Escape key
            document.addEventListener('keydown', function escapeHandler(e) {
                if (e.key === 'Escape') {
                    document.body.removeChild(modalContainer);
                    document.removeEventListener('keydown', escapeHandler);
                    reject('Modal dismissed');
                }
            });

            // Create the title
            const title = document.createElement('h2');
            title.textContent = 'Input process key';
            modalContent.appendChild(title);

            // Create the input field
            const inputField = document.createElement('input');
            inputField.type = 'text';
            inputField.style.width = '100%';

            // Add event listeners for up/down arrow keys to navigate search history
            inputField.addEventListener('keydown', (e) => {
                // Only handle up/down keys and prevent default behavior
                if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
                e.preventDefault();

                // If no history, do nothing
                if (!searchHistory.length) return;

                if (e.key === 'ArrowUp') {
                    // If not navigating yet or at beginning, start from most recent
                    if (searchIndex === null) {
                        searchIndex = 0;
                    } else if (searchIndex < searchHistory.length - 1) {
                        // Move to older entry if not at oldest entry
                        searchIndex++;
                    } else {
                        // Already at oldest entry, do nothing
                        return;
                    }

                    // Set input value to history item
                    inputField.value = searchHistory[searchIndex];
                } else if (e.key === 'ArrowDown') {
                    // If not navigating or already at most recent, set empty and reset
                    if (searchIndex === null || searchIndex === 0) {
                        inputField.value = '';
                        searchIndex = null;
                    } else {
                        // Move to more recent entry
                        searchIndex--;
                        inputField.value = searchHistory[searchIndex];
                    }
                }
            });

            modalContent.appendChild(inputField);

            // Create the button
            const button = document.createElement('button');
            button.textContent = 'Open key';
            button.style.marginTop = '10px';
            modalContent.appendChild(button);

            // create suggestions area
            const suggestionsArea = document.createElement('div');
            suggestionsArea.style.cssText = `
                margin-top: 10px;
                max-height: 200px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 5px;
                border-top: 1px solid #ddd;
                padding-top: 10px;
            `;
            modalContent.appendChild(suggestionsArea);

            // add suggestions listener
            inputField.addEventListener('input', (evt) => {
                // Clear existing suggestions
                suggestionsArea.innerHTML = '';

                const searchValue = evt.target.value.trim();
                if (!searchValue) return;

                // Find matching processes
                const matchingProcesses = processes.filter((process) =>
                    getIsMatch(searchValue, process),
                );

                // Limit to max 5 suggestions for better UX
                const maxSuggestions = 5;
                const processesToShow = matchingProcesses.slice(
                    0,
                    maxSuggestions,
                );

                // Create suggestion buttons
                processesToShow.forEach((process) => {
                    const suggestionBtn = document.createElement('button');
                    suggestionBtn.type = 'button'; // Prevent form submission
                    suggestionBtn.style.cssText = `
                        text-align: left;
                        padding: 8px 5px;
                        margin: 0;
                        background: none;
                        border: none;
                        border-radius: 3px;
                        cursor: pointer;
                        width: 100%;
                        display: flex;
                        flex-direction: column;
                    `;
                    suggestionBtn.onmouseover = () => {
                        suggestionBtn.style.backgroundColor = '#f0f0f0';
                    };
                    suggestionBtn.onmouseout = () => {
                        suggestionBtn.style.backgroundColor = 'transparent';
                    };

                    // Clear the button text content first
                    suggestionBtn.textContent = '';

                    // Add Process ID line (smaller grey font)
                    if (process.document_id) {
                        const idElement = document.createElement('div');
                        idElement.textContent = process.document_id;
                        idElement.style.cssText = `
                            font-size: 11px;
                            color: #777;
                            margin-bottom: 2px;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                        `;
                        suggestionBtn.appendChild(idElement);
                    }

                    // Add Process Name line (normal font)
                    if (process.process_name) {
                        const nameElement = document.createElement('div');
                        nameElement.textContent = process.process_name;
                        nameElement.style.cssText = `
                            font-size: 14px;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                        `;
                        suggestionBtn.appendChild(nameElement);
                    }

                    // On click, fill the input with this value and submit
                    suggestionBtn.addEventListener('click', () => {
                        if (process.document_id) {
                            inputField.value = process.document_id;
                        } else if (process.process_name) {
                            inputField.value = process.process_name;
                        }
                        // Submit the form
                        button.click();
                    });

                    suggestionsArea.appendChild(suggestionBtn);
                });

                // Show a message if no matches found
                if (processesToShow.length === 0) {
                    const noMatchesMsg = document.createElement('div');
                    noMatchesMsg.textContent = 'No matching processes found';
                    noMatchesMsg.style.cssText = `
                        padding: 5px;
                        color: #777;
                        font-style: italic;
                    `;
                    suggestionsArea.appendChild(noMatchesMsg);
                }

                // Show count if there are more matches than we're showing
                if (matchingProcesses.length > maxSuggestions) {
                    const countMsg = document.createElement('div');
                    countMsg.textContent = `...and ${matchingProcesses.length - maxSuggestions} more matches`;
                    countMsg.style.cssText = `
                        padding: 5px;
                        color: #777;
                        font-style: italic;
                        text-align: center;
                    `;
                    suggestionsArea.appendChild(countMsg);
                }
            });

            // Append the content to the container
            modalContainer.appendChild(modalContent);

            // Append the container to the body
            document.body.appendChild(modalContainer);

            setTimeout(() => {
                inputField.focus();
            }, 100);

            // Button click handler
            modalContent.addEventListener('submit', () => {
                const inputValue = inputField.value;
                resolve(inputValue);
                document.body.removeChild(modalContainer); // Remove the modal
            });

            // Optional: Close the modal if the user clicks outside the modal content
            modalContainer.addEventListener('click', (event) => {
                if (event.target === modalContainer) {
                    reject('Modal dismissed'); // Or resolve with a default value
                    document.body.removeChild(modalContainer);
                }
            });
        });
    }

    function handleKeydown(event) {
        if (event.ctrlKey && event.altKey && event.key === 'f') {
            event.preventDefault(); // Prevent default browser behavior
            const processes = JSON.parse(
                localStorage.getItem('pb-processes') || '[]',
            );
            openModalWithInput(processes)
                .then((key) => {
                    // Find process using advanced matching strategy
                    const process = findBestMatchingProcess(processes, key);

                    if (process) {
                        // pb-restore-search rule will set search to this value
                        // automatically if set
                        sessionStorage.setItem(
                            'b2w-search-value',
                            process.process_name,
                        );

                        updateHistory(key);
                        document.removeEventListener('keydown', handleKeydown);
                        window.location.href = `/process-builder/${process.guid}`;
                    } else {
                        alert('Process not found');
                    }
                })
                .catch(() => {
                    // Modal dismissed
                });
        }
    }

    function getIsMatch(key, process) {
        // Skip empty searches
        if (!key.trim()) return false;

        // 1. Try exact match on document_id (highest priority)
        if (
            process.document_id &&
            process.document_id.toLowerCase() === key.toLowerCase()
        ) {
            return true;
        }

        // 2. Try exact match on process_name
        if (
            process.process_name &&
            process.process_name.toLowerCase() === key.toLowerCase()
        ) {
            return true;
        }

        // 3. Try regex match on document_id
        const pat = new RegExp(key, 'igm');
        if (process.document_id && pat.test(process.document_id)) {
            return true;
        }

        // 4. Try regex match on process_name
        if (process.process_name && pat.test(process.process_name)) {
            return true;
        }

        // 5. Try word-by-word matching (allows for words in between)
        const searchWords = key
            .toLowerCase()
            .split(/\s+/)
            .filter((w) => w.length > 0);

        if (searchWords.length > 0 && process.process_name) {
            const processNameLower = process.process_name.toLowerCase();

            // Create a regex pattern with .* between words: "word1 word2" -> "word1.*word2.*"
            const pattern = new RegExp(searchWords.join('.*'), 'i');

            if (pattern.test(process.document_id)) {
                return true;
            }

            return pattern.test(processNameLower);
        }

        return false;
    }

    // Advanced process matching with priority levels
    function findBestMatchingProcess(processes, searchKey) {
        // Skip empty searches
        if (!searchKey.trim()) return null;

        // 1. Try exact match on document_id (highest priority)
        const exactDocMatch = processes.find(
            (p) =>
                p.document_id &&
                p.document_id.toLowerCase() === searchKey.toLowerCase(),
        );
        if (exactDocMatch) return exactDocMatch;

        // 2. Try exact match on process_name
        const exactNameMatch = processes.find(
            (p) =>
                p.process_name &&
                p.process_name.toLowerCase() === searchKey.toLowerCase(),
        );
        if (exactNameMatch) return exactNameMatch;

        // 3. Try regex match on document_id
        const pat = new RegExp(searchKey, 'igm');
        const regexDocMatch = processes.find((p) => pat.test(p.document_id));
        if (regexDocMatch) return regexDocMatch;

        // 4. Try regex match on process_name
        const regexNameMatch = processes.find((p) => pat.test(p.process_name));
        if (regexNameMatch) return regexNameMatch;

        // 5. Try word-by-word matching (allows for words in between)
        const searchWords = searchKey
            .toLowerCase()
            .split(/\s+/)
            .filter((w) => w.length > 0);

        if (searchWords.length > 0) {
            // Create a regex pattern with .* between words: "word1 word2" -> "word1.*word2.*"
            const pattern = new RegExp(searchWords.join('.*'), 'i');

            // First check document_id with pattern
            const docIdMatch = processes.find(
                (p) =>
                    p.document_id && pattern.test(p.document_id.toLowerCase()),
            );
            if (docIdMatch) return docIdMatch;

            // Then check process_name with pattern
            return processes.find(
                (p) =>
                    p.process_name &&
                    pattern.test(p.process_name.toLowerCase()),
            );
        }

        return null;
    }

    window.pbFinderSetupDone = false;

    if (window.pbFinderSetupDone) {
        return;
    }

    window.pbFinderSetupDone = true;

    interceptFetchResponse();

    document.addEventListener('keydown', handleKeydown);
})();

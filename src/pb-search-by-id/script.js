let pbFinderSetupDone = false;

(function () {
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

    function openModalWithInput() {
        return new Promise((resolve, reject) => {
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

            // Create the title
            const title = document.createElement('h2');
            title.textContent = 'Input process key';
            modalContent.appendChild(title);

            // Create the input field
            const inputField = document.createElement('input');
            inputField.type = 'text';
            inputField.style.width = '100%';
            modalContent.appendChild(inputField);

            // Create the button
            const button = document.createElement('button');
            button.textContent = 'Open key';
            button.style.marginTop = '10px';
            modalContent.appendChild(button);

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

    if (pbFinderSetupDone) {
        return;
    }

    pbFinderSetupDone = true;

    interceptFetchResponse();

    document.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.altKey && event.key === 'f') {
            event.preventDefault(); // Prevent default browser behavior

            openModalWithInput()
                .then((key) => {
                    const processes = JSON.parse(
                        localStorage.getItem('pb-processes') || '[]',
                    );
                    const pat = new RegExp(key, 'igm');
                    let process = processes.find((p) =>
                        pat.test(p.document_id),
                    );

                    if (!process) {
                        process = processes.find((p) =>
                            pat.test(p.process_name),
                        );
                    }

                    if (process) {
                        window.location.href = `/process-builder/${process.guid}`;
                    } else {
                        alert('Process not found');
                    }
                })
                .catch(() => {
                    // Modal dismissed
                });
        }
    });
})();

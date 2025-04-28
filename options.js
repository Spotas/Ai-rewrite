const apiKeyInput = document.getElementById('apiKey');
const saveButton = document.getElementById('save');
const statusDiv = document.getElementById('status');

// Load the saved API key when the options page opens
function loadOptions() {
    chrome.storage.sync.get(['geminiApiKey'], (result) => {
        if (result.geminiApiKey) {
            apiKeyInput.value = result.geminiApiKey;
            console.log("API Key loaded.");
        } else {
             console.log("No API Key found in storage.");
        }
    });
}

// Save the API key
function saveOptions() {
    const apiKey = apiKeyInput.value.trim();
    statusDiv.textContent = ''; // Clear previous status
    statusDiv.className = ''; // Clear previous classes

    if (!apiKey) {
        statusDiv.textContent = 'Error: API Key cannot be empty.';
        statusDiv.className = 'error'; // Use class for styling
        return;
    }

    chrome.storage.sync.set({ geminiApiKey: apiKey }, () => {
        // Check for runtime error (e.g., storage quota exceeded)
        if (chrome.runtime.lastError) {
             statusDiv.textContent = 'Error saving key: ' + chrome.runtime.lastError.message;
             statusDiv.className = 'error';
             console.error("Error saving API Key:", chrome.runtime.lastError);
             return; // Stop here if saving failed
        }

        // Update status message on success
        statusDiv.textContent = 'API Key saved successfully!';
        statusDiv.className = 'success'; // Use class for styling
        console.log("API Key saved.");

        // Clear status message after a few seconds
        setTimeout(() => {
             // Only clear if it's still the success message
             if (statusDiv.className === 'success') {
                 statusDiv.textContent = '';
                 statusDiv.className = '';
             }
        }, 3000);
    });
}

// Add event listeners
document.addEventListener('DOMContentLoaded', loadOptions);
saveButton.addEventListener('click', saveOptions);

// Optional: Allow saving by pressing Enter in the input field
apiKeyInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        saveOptions();
        event.preventDefault(); // Prevent potential form submission if wrapped in form
    }
});

// Clear error/success message if user starts typing again
apiKeyInput.addEventListener('input', () => {
    if (statusDiv.textContent !== '') {
        statusDiv.textContent = '';
        statusDiv.className = '';
    }
});
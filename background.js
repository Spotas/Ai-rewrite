// Gemini API Endpoint (using v1beta, gemini-2.0-flash-lite model)
const GEMINI_API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent";

// --- Context Menu Setup ---

const CONTEXT_MENU_ID = "GEMINI_REWRITE";
// Updated Modes including Composer
const MODES = {
    humanize: "Humanize (Make Natural)",
    grammar: "Correct Grammar Only",
    professional: "Professional Tone",
    polite: "Polite Tone",
    cheeky: "Cheeky (with Mistake)",
    newby: "Newby Tone",
    composer: "Compose (from instruction)" // New Composer Mode
};

chrome.runtime.onInstalled.addListener(() => {
    console.log("AI Rewriter Extension Installed/Updated");

    // Remove existing menus before creating new ones to avoid duplicates on update
    chrome.contextMenus.removeAll(() => {
        console.log("Removed old context menus.");
        // Create parent context menu item
        chrome.contextMenus.create({
            id: CONTEXT_MENU_ID,
            title: "Rewrite with AI",
            contexts: ["editable"] // Only show when right-clicking editable fields
        });

        // Create sub-menu items for each mode
        for (const [key, title] of Object.entries(MODES)) {
            chrome.contextMenus.create({
                id: `${CONTEXT_MENU_ID}_${key}`,
                parentId: CONTEXT_MENU_ID,
                title: title,
                contexts: ["editable"]
            });
        }
         console.log("Context menus created.");
    }); // End removeAll callback


     // Check for API key on install/update and prompt if missing
     chrome.storage.sync.get(['geminiApiKey'], (result) => {
        if (!result.geminiApiKey) {
            console.log("Gemini API Key not found. Opening options page.");
            // Optionally open options page automatically if key is missing
            // chrome.runtime.openOptionsPage();
        } else {
            console.log("Gemini API Key found.");
        }
    });
});

// --- Context Menu Click Handler ---

chrome.contextMenus.onClicked.addListener((info, tab) => {
    // Ensure the click is one of our sub-menus
    if (!info.parentMenuItemId || info.parentMenuItemId !== CONTEXT_MENU_ID) {
        return; // Not our menu item
    }

    // --- CHECK for restricted URLs ---
    if (!tab || !tab.url || !tab.url.match(/^https?:\/\//)) {
         if (tab && tab.url) {
            console.warn(`AI Rewriter cannot run on this URL: ${tab.url}. Script injection is not allowed or applicable.`);
         } else {
             console.warn("AI Rewriter cannot determine the tab URL or tab is invalid.");
         }
        return;
    }
    // --- END CHECK ---

    const modeKey = info.menuItemId.replace(`${CONTEXT_MENU_ID}_`, ''); // e.g., "humanize"

    // Ensure we have selected text (even for composer, it's the instruction)
    if (!info.selectionText || info.selectionText.trim() === "") {
         const message = modeKey === 'composer'
             ? "Please select a brief instruction first (e.g., 'write email asking for update')."
             : "No text selected for rewrite.";
         console.warn(message);
         notifyUser(tab.id, `Error: ${message}`, true); // Notify user about missing selection/instruction
         return;
    }

    const selectedText = info.selectionText; // This is the instruction for 'composer' mode

    console.log(`Action requested: Mode='${modeKey}', Selection='${selectedText.substring(0, 50)}...' on URL: ${tab.url}`);

    // Get API Key and call Gemini
    chrome.storage.sync.get(['geminiApiKey'], async (result) => {
        const apiKey = result.geminiApiKey;
        if (!apiKey) {
            console.error("Gemini API Key is missing.");
            notifyUser(tab.id, "Error: Gemini API Key not set. Please set it in the extension options.", true);
            return;
        }

        try {
            // Add a visual indicator that something is happening
            const progressMessage = modeKey === 'composer'
                ? `Composing based on instruction...`
                : `Rewriting text (${MODES[modeKey]})...`;
            notifyUser(tab.id, progressMessage, false, 1500); // Short-lived info message

            const resultText = await callGeminiApi(apiKey, selectedText, modeKey);
            if (resultText) {
                 console.log(`Result text received: '${resultText.substring(0, 50)}...'`);
                 // Inject the result back into the page
                injectTextIntoPage(tab.id, info.frameId, resultText); // Use 'resultText' which covers rewrite/compose
            } else {
                console.error("Received empty response from Gemini API.");
                 notifyUser(tab.id, "Error: Received no text from AI. Check API key or try again.", true);
            }
        } catch (error) {
            console.error(`Error calling Gemini API for mode ${modeKey}:`, error);
             notifyUser(tab.id, `Error: API call failed. ${error.message}. Check console & API Key.`, true);
        }
    });
});

// --- Gemini API Call ---

async function callGeminiApi(apiKey, text, mode) {
    let prompt;
    // Refined prompts to *strongly* discourage markdown/options and add composer
    const baseInstruction = "Provide *only* the final text, nothing else. No preamble, no explanation, no formatting like lists or markdown (no asterisks for emphasis). Just the resulting text.";

    switch (mode) {
        case 'humanize':
            prompt = `Rewrite the following text to sound more natural and human-like, suitable for casual conversation. Avoid jargon and overly formal structures. Use the simplest English possible ${baseInstruction}\n\nOriginal text:\n"${text}"\n\nRewritten text:`;
            break;
        case 'grammar':
            prompt = `Correct only the grammar and spelling mistakes in the following text. Keep the original meaning and tone as closely as possible. ${baseInstruction}\n\nOriginal text:\n"${text}"\n\nCorrected text:`;
            break;
        case 'professional':
            prompt = `Rewrite the following text in a formal and professional tone suitable for business communication. Ensure clarity and conciseness. Do not format it as an email or add any greetings/closings unless the original text implies it. ${baseInstruction}\n\nOriginal text:\n"${text}"\n\nRewritten text:`;
            break;
        case 'polite':
            prompt = `Rewrite the following text in a polite and courteous tone. Soften any direct or potentially harsh language. ${baseInstruction}\n\nOriginal text:\n"${text}"\n\nRewritten text:`;
            break;
        case 'cheeky':
            prompt = `Rewrite the following text in a cheeky sarcastic tone. Include some common grammatical mistakes or typos (like your/you're, its/it's, there/their/they're). ${baseInstruction}\n\nOriginal text:\n"${text}"\n\nRewritten text:`;
            break;
        case 'newby':
             prompt = `Rewrite the following text as if someone new to the subject wrote it. Make it sound a bit simplistic, slightly awkward, or perhaps overly enthusiastic, like a beginner trying to explain something. Make a lot of grammatical mistakes. ${baseInstruction}\n\nOriginal text:\n"${text}"\n\nRewritten text:`;
            break;
        // --- NEW COMPOSER MODE ---
        case 'composer':
            prompt = `Generate content based on the following instruction. Examples: If the instruction is 'write email asking for update', write a short polite email. If it's 'reply politely to this email:', generate a polite reply body. If it's 'ideas for blog post about AI', list a few ideas. ${baseInstruction}\n\nInstruction:\n"${text}"\n\nGenerated Content:`;
            break;
        default:
            console.error("Unknown rewrite mode:", mode);
            throw new Error("Invalid rewrite mode selected.");
    }

    const requestBody = {
        contents: [{
            parts: [{
                text: prompt
            }]
        }],
        generationConfig: {
           maxOutputTokens: 4096, // Allow slightly longer output for composer maybe
           // temperature: 0.7, // Default is usually fine
           // Consider stop sequences if multi-paragraph output is undesirable for certain modes
        }
         // Safety settings remain default unless specific issues arise
    };

    console.log("Sending request to Gemini...");

    try {
        const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        console.log("Received response from Gemini. Status:", response.status);

        if (!response.ok) {
            let errorBody = "Could not read error body.";
            try { errorBody = await response.text(); } catch (e) { /* ignore */ }
            console.error("API Error Response Body:", errorBody);
            throw new Error(`API request failed with status ${response.status}: ${response.statusText}. ${errorBody}`);
        }

        const data = await response.json();
        // console.log("Gemini Response Data:", JSON.stringify(data)); // Uncomment for deep debug

        if (data.candidates && data.candidates.length > 0 &&
            data.candidates[0].content && data.candidates[0].content.parts &&
            data.candidates[0].content.parts.length > 0 &&
            data.candidates[0].content.parts[0].text) {

            let resultText = data.candidates[0].content.parts[0].text.trim();

            // --- Post-processing Clean-up ---
            // 1. Remove potential leading/trailing quotes sometimes added by the model
            if (resultText.startsWith('"') && resultText.endsWith('"')) {
                resultText = resultText.substring(1, resultText.length - 1).trim();
            }
            // 2. Remove potential markdown list formatting
            resultText = resultText.replace(/^[\*\-\+] +/,'');
            // 3. Remove common preamble phrases if the prompt instructions weren't perfectly followed
            const preambles = [
                /^Rewritten text: ?/i,
                /^Corrected text: ?/i,
                /^Generated Content: ?/i,
                /^Okay, here'?s the rewrite: ?/i,
                /^Here'?s the corrected version: ?/i,
                /^Here'?s the composed text: ?/i,
                /^Here'?s a version written by a newbie: ?/i, // Add others as needed
            ];
            for (const preamble of preambles) {
                resultText = resultText.replace(preamble, '');
            }
            // 4. **** Remove asterisks used for emphasis ****
            resultText = resultText.replace(/\*([^*]+)\*/g, '$1'); // Remove asterisks surrounding text

            return resultText.trim(); // Final trim

        } else if (data.promptFeedback && data.promptFeedback.blockReason) {
             console.error("Content blocked by Gemini:", data.promptFeedback.blockReason, "Safety Ratings:", data.promptFeedback.safetyRatings);
             throw new Error(`Content blocked by API: ${data.promptFeedback.blockReason}. Check instruction/text or safety settings.`);
        }
        else {
            console.error("Unexpected response structure or empty text:", data);
            throw new Error("Could not parse valid text from API response.");
        }
    } catch (error) {
        console.error("Fetch or parsing error:", error);
        throw error;
    }
}


// --- Inject Result into Page ---

function injectTextIntoPage(tabId, frameId, textToInject) {
    console.log("Injecting text into tab:", tabId, "Frame:", frameId);
    chrome.scripting.executeScript({
        target: { tabId: tabId, frameIds: frameId ? [frameId] : undefined },
        func: replaceSelectedText,
        args: [textToInject],
    }, (injectionResults) => {
         if (chrome.runtime.lastError) {
            console.error("Script injection failed:", chrome.runtime.lastError.message);
             notifyUser(tabId, "Error: Could not modify the text field. " + chrome.runtime.lastError.message, true);
         } else if (injectionResults && injectionResults[0] && injectionResults[0].result === false) {
             console.warn("Script executed, but reported no text was replaced (maybe focus lost or element changed?).");
             notifyUser(tabId, "Warning: Couldn't replace text. Was the input field still focused?", false);
         } else if (injectionResults && injectionResults[0] && injectionResults[0].result === true){
            console.log("Script executed successfully, text replaced.");
         } else {
             console.log("Script injection completed, but replacement status unknown.");
         }
    });
}

// This function runs IN THE CONTEXT OF THE WEB PAGE
function replaceSelectedText(replacementText) {
    const activeElement = document.activeElement;
    let success = false;

    if (activeElement && (activeElement.tagName === 'TEXTAREA' || (activeElement.tagName === 'INPUT' && /^(text|search|email|url|password|tel)$/i.test(activeElement.type)) || activeElement.isContentEditable)) {
        try {
            const start = activeElement.selectionStart;
            const end = activeElement.selectionEnd;
             if (typeof start === 'number' && typeof end === 'number' && start <= end) {
                 const currentValue = activeElement.value !== undefined ? activeElement.value : activeElement.textContent;
                 const newValue = currentValue.slice(0, start) + replacementText + currentValue.slice(end);
                 const event = new Event('input', { bubbles: true, cancelable: true });

                 if (activeElement.isContentEditable) {
                    // Using execCommand is often more reliable for contentEditable
                    document.execCommand('insertText', false, replacementText);
                    success = true; // Assume success unless execCommand specifically fails (though it rarely throws errors)
                 } else {
                    activeElement.value = newValue;
                    success = true;
                 }

                 activeElement.focus();
                 // Adjust cursor position *after* potentially complex contentEditable update or value set
                 activeElement.selectionStart = activeElement.selectionEnd = start + replacementText.length;

                 activeElement.dispatchEvent(event);
                 console.log("Replaced text using direct value/selection manipulation or execCommand.");

             } else {
                 console.log("Selection properties not available or invalid, trying execCommand as fallback.");
                 if (document.execCommand('insertText', false, replacementText)) {
                     console.log("Replaced text using execCommand('insertText').");
                     success = true;
                 } else {
                     console.error("Direct replacement failed and execCommand('insertText') also failed.");
                 }
             }

        } catch (e) {
             console.error("Error during text replacement:", e);
             // Final attempt with execCommand if an error occurred
             try {
                if (document.execCommand('insertText', false, replacementText)) {
                    console.log("Replaced text using execCommand('insertText') after catching error.");
                    success = true;
                 }
             } catch (e2) {
                  console.error("execCommand failed again after catching error:", e2);
             }
        }
    } else {
         console.warn("No active editable element found or element type is not supported.");
    }
    return success;
}


// --- Helper to Notify User ---
function notifyUser(tabId, message, isError = false, duration = 4000) {
    console.log(`Notifying user in tab ${tabId}: ${message}`);
     chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: (msg, errorFlag, durationMs) => {
            let notifyDiv = document.getElementById('--ai-rewriter-notifier');
            if (!notifyDiv) {
                notifyDiv = document.createElement('div');
                notifyDiv.id = '--ai-rewriter-notifier';
                Object.assign(notifyDiv.style, {
                    position: 'fixed', top: '10px', right: '10px', padding: '10px 15px',
                    borderRadius: '5px', color: 'white',
                    backgroundColor: errorFlag ? 'rgba(211, 47, 47, 0.9)' : 'rgba(46, 125, 50, 0.9)',
                    zIndex: '2147483647', fontSize: '14px', fontFamily: 'sans-serif',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)', opacity: '0',
                    transition: 'opacity 0.3s ease-in-out'
                });
                document.body.appendChild(notifyDiv);
                 setTimeout(() => notifyDiv.style.opacity = '1', 10);
            } else {
                 notifyDiv.style.backgroundColor = errorFlag ? 'rgba(211, 47, 47, 0.9)' : 'rgba(46, 125, 50, 0.9)';
                 notifyDiv.style.opacity = '1';
                 if (notifyDiv.dataset.timeoutId) {
                     clearTimeout(parseInt(notifyDiv.dataset.timeoutId));
                 }
            }
            notifyDiv.textContent = msg;
            const timeoutId = setTimeout(() => {
                notifyDiv.style.opacity = '0';
                 setTimeout(() => { if (document.getElementById('--ai-rewriter-notifier') === notifyDiv) { notifyDiv.remove(); } }, 300);
            }, durationMs);
             notifyDiv.dataset.timeoutId = timeoutId.toString();
        },
        args: [message, isError, duration],
    }).catch(err => { console.error("Failed to inject notification script:", err) });
}
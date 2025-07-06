// === ENHANCED CONFIGURATION ===
const CONFIG = {
    API_ENDPOINTS: {
        'gemini-2.5-flash': "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        'gemini-2.5-flash-lite-preview': "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite-preview-06-17:generateContent",
        'gemini-2.0-flash': "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
        'gemini-2.0-flash-lite': "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent"
    },
    DEFAULT_MODEL: 'gemini-2.5-flash',
    MAX_TEXT_LENGTH: 8000,
    MIN_TEXT_LENGTH: 3,
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
    REQUEST_TIMEOUT: 30000,
    RATE_LIMIT: {
        requests: 60,
        windowMs: 60000, // 1 minute
        burstLimit: 5,   // Max 5 requests in 10 seconds
        burstWindow: 10000
    },
    CACHE: {
        enabled: true,
        maxSize: 100,
        ttl: 300000 // 5 minutes
    },
    RESTRICTED_URLS: [
        'chrome://',
        'chrome-extension://',
        'moz-extension://',
        'edge://',
        'opera://',
        'about:',
        'file://',
        'data:',
        'javascript:'
    ],
    SUPPORTED_ELEMENTS: {
        tags: ['TEXTAREA', 'INPUT'],
        inputTypes: ['text', 'search', 'email', 'url', 'password', 'tel'],
        contentEditable: true
    }
};

// === CONTEXT MENU SETUP ===
const CONTEXT_MENU_ID = "GEMINI_REWRITE";

// Built-in modes with enhanced prompts and metadata
const BUILT_IN_MODES = {
    humanize: {
        name: "Humanize (Make Natural)",
        description: "Make text sound more natural and conversational",
        icon: "🧑",
        category: "style"
    },
    grammar: {
        name: "Fix Grammar & Spelling", 
        description: "Correct grammatical errors and typos",
        icon: "✏️",
        category: "correction"
    },
    professional: {
        name: "Professional Tone",
        description: "Formal business communication style",
        icon: "💼",
        category: "tone"
    },
    polite: {
        name: "Polite & Courteous",
        description: "Soften language with respectful phrasing",
        icon: "🙏",
        category: "tone"
    },
    casual: {
        name: "Casual & Friendly", 
        description: "Informal, conversational style",
        icon: "😊",
        category: "tone"
    },
    confident: {
        name: "Confident & Assertive",
        description: "Strong, decisive language",
        icon: "💪",
        category: "tone"
    },
    empathetic: {
        name: "Empathetic & Understanding",
        description: "Caring and emotionally aware tone",
        icon: "❤️",
        category: "tone"
    },
    persuasive: {
        name: "Persuasive & Compelling",
        description: "Convincing and motivating language",
        icon: "🎯",
        category: "style"
    },
    concise: {
        name: "Concise & Clear",
        description: "Remove fluff, get to the point",
        icon: "⚡",
        category: "structure"
    },
    detailed: {
        name: "Detailed & Comprehensive",
        description: "Add depth and explanations",
        icon: "📚",
        category: "structure"
    },
    creative: {
        name: "Creative & Engaging",
        description: "Vivid, imaginative language",
        icon: "🎨",
        category: "style"
    },
    technical: {
        name: "Technical & Precise",
        description: "Accurate technical terminology",
        icon: "⚙️",
        category: "specialized"
    },
    academic: {
        name: "Academic & Scholarly",
        description: "Formal academic writing style",
        icon: "🎓",
        category: "specialized"
    },
    marketing: {
        name: "Marketing & Sales",
        description: "Promotional and engaging copy",
        icon: "📢",
        category: "specialized"
    },
    cheeky: {
        name: "Cheeky & Playful",
        description: "Witty and slightly sarcastic",
        icon: "😏",
        category: "fun"
    },
    newby: {
        name: "Beginner-Friendly",
        description: "Simple language for newcomers",
        icon: "🌱",
        category: "fun"
    },
    composer: {
        name: "Compose from Instruction",
        description: "Generate new content from prompts",
        icon: "✨",
        category: "generation"
    },
    translate: {
        name: "Translate to English",
        description: "Convert text to clear English",
        icon: "🌍",
        category: "utility"
    },
    summarize: {
        name: "Summarize Key Points",
        description: "Extract main ideas concisely",
        icon: "📝",
        category: "utility"
    },
    expand: {
        name: "Expand & Elaborate",
        description: "Add more detail and context",
        icon: "🔍",
        category: "structure"
    },
    simplify: {
        name: "Simplify & Clarify",
        description: "Make complex text easier to understand",
        icon: "🔧",
        category: "utility"
    }
};

// === ENHANCED STATE MANAGEMENT ===
let rewriteHistory = [];
let requestCount = 0;
let lastRequestTime = 0;
let burstRequestCount = 0;
let lastBurstTime = 0;
let responseCache = new Map();
let activeRequests = new Set();

// Performance monitoring
let performanceMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    cacheHits: 0
};

// === INSTALLATION & SETUP ===
chrome.runtime.onInstalled.addListener(async () => {
    console.log("AI Rewriter Extension Installed/Updated");
    
    // Initialize default settings
    await initializeDefaultSettings();
    
    // Setup context menus
    await setupContextMenus();
    
    // Check API key and notify if needed
    await checkApiKeyStatus();
});

async function initializeDefaultSettings() {
    return new Promise((resolve) => {
        chrome.storage.sync.get([
            'geminiApiKey', 
            'selectedModel', 
            'customModes', 
            'enabledModes',
            'maxTextLength',
            'enableUndo',
            'enableUsageTracking',
            'enableKeyboardShortcuts',
            'darkMode'
        ], (result) => {
            const defaults = {
                selectedModel: result.selectedModel || CONFIG.DEFAULT_MODEL,
                customModes: result.customModes || {},
                enabledModes: result.enabledModes || Object.keys(BUILT_IN_MODES),
                maxTextLength: result.maxTextLength || CONFIG.MAX_TEXT_LENGTH,
                enableUndo: result.enableUndo !== false,
                enableUsageTracking: result.enableUsageTracking !== false,
                enableKeyboardShortcuts: result.enableKeyboardShortcuts !== false,
                darkMode: result.darkMode || false
            };
            
            chrome.storage.sync.set(defaults, () => {
                console.log("Default settings initialized");
                resolve();
            });
        });
    });
}

async function setupContextMenus() {
    return new Promise((resolve) => {
        // Remove existing menus
        chrome.contextMenus.removeAll(() => {
            console.log("Removed old context menus.");
            
            // Get current settings
            chrome.storage.sync.get(['enabledModes', 'customModes'], (result) => {
                const enabledModes = result.enabledModes || Object.keys(BUILT_IN_MODES);
                const customModes = result.customModes || {};
                
                // Create parent menu
                chrome.contextMenus.create({
                    id: CONTEXT_MENU_ID,
                    title: "✨ Rewrite with AI",
                    contexts: ["editable"]
                });
                
                // Add built-in modes
                enabledModes.forEach(modeKey => {
                    if (BUILT_IN_MODES[modeKey]) {
                        chrome.contextMenus.create({
                            id: `${CONTEXT_MENU_ID}_${modeKey}`,
                            parentId: CONTEXT_MENU_ID,
                            title: `📝 ${BUILT_IN_MODES[modeKey]}`,
                            contexts: ["editable"]
                        });
                    }
                });
                
                // Add custom modes
                Object.entries(customModes).forEach(([key, mode]) => {
                    chrome.contextMenus.create({
                        id: `${CONTEXT_MENU_ID}_custom_${key}`,
                        parentId: CONTEXT_MENU_ID,
                        title: `🎨 ${mode.name}`,
                        contexts: ["editable"]
                    });
                });
                
                // Add separator and utility options
                chrome.contextMenus.create({
                    id: "separator1",
                    parentId: CONTEXT_MENU_ID,
                    type: "separator",
                    contexts: ["editable"]
                });
                
                chrome.contextMenus.create({
                    id: `${CONTEXT_MENU_ID}_undo`,
                    parentId: CONTEXT_MENU_ID,
                    title: "↶ Undo Last Rewrite",
                    contexts: ["editable"]
                });
                
                chrome.contextMenus.create({
                    id: `${CONTEXT_MENU_ID}_settings`,
                    parentId: CONTEXT_MENU_ID,
                    title: "⚙️ Settings",
                    contexts: ["editable"]
                });
                
                console.log("Context menus created.");
                resolve();
            });
        });
    });
}

async function checkApiKeyStatus() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['geminiApiKey'], (result) => {
            if (!result.geminiApiKey) {
                console.log("Gemini API Key not found. User needs to configure.");
            } else {
                console.log("Gemini API Key found.");
            }
            resolve();
        });
    });
}

// === ENHANCED CONTEXT MENU HANDLER ===
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    // Handle special actions
    if (info.menuItemId === `${CONTEXT_MENU_ID}_undo`) {
        await handleUndo(tab.id, info.frameId);
        return;
    }
    
    if (info.menuItemId === `${CONTEXT_MENU_ID}_settings`) {
        chrome.runtime.openOptionsPage();
        return;
    }
    
    // Ensure the click is one of our rewrite menus
    if (!info.parentMenuItemId || info.parentMenuItemId !== CONTEXT_MENU_ID) {
        return;
    }

    // Validate tab and URL
    if (!isValidTab(tab)) {
        console.warn(`AI Rewriter cannot run on this URL: ${tab?.url || 'unknown'}`);
        notifyUser(tab.id, "❌ Cannot rewrite text on this page (restricted URL)", true);
        return;
    }

    // Validate text selection
    if (!info.selectionText || info.selectionText.trim() === "") {
        const isComposer = info.menuItemId.includes('composer');
        const message = isComposer 
            ? "Please select an instruction first (e.g., 'write email asking for update')"
            : "Please select text to rewrite";
        notifyUser(tab.id, `⚠️ ${message}`, true);
        return;
    }

    // Check text length
    const settings = await getSettings();
    if (info.selectionText.length > settings.maxTextLength) {
        notifyUser(tab.id, `⚠️ Text too long (max ${settings.maxTextLength} characters)`, true);
        return;
    }

    // Parse mode
    const modeInfo = parseModeFromMenuId(info.menuItemId);
    if (!modeInfo) {
        notifyUser(tab.id, "❌ Unknown rewrite mode", true);
        return;
    }

    console.log(`Rewrite requested: Mode='${modeInfo.key}', Text length=${info.selectionText.length}, URL: ${tab.url}`);

    // Check rate limiting
    if (!checkRateLimit()) {
        notifyUser(tab.id, "⏳ Too many requests. Please wait a moment.", true);
        return;
    }

    // Perform rewrite
    await performRewrite(tab, info, modeInfo, settings);
});

// === ENHANCED API FUNCTIONS ===

async function callGeminiApiWithRetry(apiKey, text, modeInfo, settings) {
    let lastError;
    
    for (let attempt = 1; attempt <= CONFIG.MAX_RETRIES; attempt++) {
        try {
            console.log(`API call attempt ${attempt}/${CONFIG.MAX_RETRIES}`);
            
            const result = await callGeminiApiEnhanced(apiKey, text, modeInfo, settings);
            if (result && result.trim()) {
                return result;
            }
            throw new Error("Empty response from API");
            
        } catch (error) {
            lastError = error;
            console.warn(`API call attempt ${attempt} failed:`, error.message);
            
            // Don't retry on certain errors
            if (error.message.includes('401') || error.message.includes('403') || 
                error.message.includes('API key') || attempt === CONFIG.MAX_RETRIES) {
                throw error;
            }
            
            // Wait before retry
            if (attempt < CONFIG.MAX_RETRIES) {
                await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY * attempt));
            }
        }
    }
    
    throw lastError;
}

async function callGeminiApiEnhanced(apiKey, text, modeInfo, settings) {
    const model = settings.selectedModel || CONFIG.DEFAULT_MODEL;
    const endpoint = CONFIG.API_ENDPOINTS[model];
    
    if (!endpoint) {
        throw new Error(`Unsupported model: ${model}`);
    }

    const prompt = await generatePrompt(text, modeInfo, settings);
    
    const requestBody = {
        contents: [{
            parts: [{ text: prompt }]
        }],
        generationConfig: {
            maxOutputTokens: 4096,
            temperature: getTemperatureForMode(modeInfo.key),
            topP: 0.8,
            topK: 40
        },
        safetySettings: [
            {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                category: "HARM_CATEGORY_HATE_SPEECH", 
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
        ]
    };

    console.log(`Sending request to Gemini (${model})...`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT);

    try {
        const response = await fetch(`${endpoint}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (!response.ok) {
            let errorBody = "Could not read error response";
            try {
                const errorData = await response.json();
                errorBody = errorData.error?.message || JSON.stringify(errorData);
            } catch (e) {
                errorBody = await response.text();
            }
            throw new Error(`API request failed (${response.status}): ${errorBody}`);
        }

        const data = await response.json();
        
        if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
            let resultText = data.candidates[0].content.parts[0].text.trim();
            return postProcessResult(resultText, modeInfo.key);
        } else {
            throw new Error("Invalid API response structure");
        }
        
    } catch (error) {
        clearTimeout(timeout);
        if (error.name === 'AbortError') {
            throw new Error("Request timeout - please try again");
        }
        throw error;
    }
}

// === ENHANCED PROMPT GENERATION ===

async function generatePrompt(text, modeInfo, settings) {
    const baseInstruction = `IMPORTANT: Respond with ONLY the final text result. No explanations, no markdown formatting, no bullet points, no preambles, no quotes around the result. Just the direct text output.`;

    if (modeInfo.type === 'custom') {
        const customMode = settings.customModes[modeInfo.key];
        return `${customMode.prompt}\n\n${baseInstruction}\n\nInput text:\n"${text}"\n\nOutput:`;
    }

    // Enhanced built-in prompts with better context awareness
    const prompts = {
        humanize: `Rewrite this text to sound more natural and human-like. Use conversational language, vary sentence structures, and make it feel like a real person wrote it. Avoid overly formal or robotic phrasing. Add natural flow and personality while preserving the core message.`,
        
        grammar: `Fix only the grammar, spelling, and punctuation errors in this text. Keep the original meaning, tone, and style exactly the same. Make minimal changes - only correct actual errors without changing the author's voice or intent.`,
        
        professional: `Rewrite this text in a professional business tone. Use formal language, clear structure, and maintain credibility. Be concise and respectful while ensuring the message is authoritative and appropriate for a business context.`,
        
        polite: `Rewrite this text to be more polite and courteous. Soften any direct language, add respectful phrasing like "please" and "thank you" where appropriate, and ensure a warm, considerate tone throughout.`,
        
        casual: `Rewrite this text in a casual, friendly tone. Use informal language, contractions, and make it sound like a conversation between friends. Keep it relaxed and approachable while maintaining clarity.`,
        
        confident: `Rewrite this text to sound more confident and assertive. Use strong, decisive language while maintaining professionalism. Eliminate uncertainty and make statements clear and authoritative.`,
        
        empathetic: `Rewrite this text with an empathetic and understanding tone. Show care, consideration, and emotional awareness. Use language that demonstrates you understand and relate to the reader's situation.`,
        
        persuasive: `Rewrite this text to be more persuasive and compelling. Use convincing language, logical flow, and motivating phrases. Structure arguments effectively and include compelling reasons to strengthen the message.`,
        
        concise: `Rewrite this text to be more concise and clear. Remove unnecessary words, eliminate redundancy, simplify complex sentences, and get straight to the point while preserving all essential information.`,
        
        detailed: `Rewrite this text to be more detailed and comprehensive. Add relevant information, examples, explanations, and context to make it more complete and informative without losing focus.`,
        
        creative: `Rewrite this text to be more creative and engaging. Use vivid language, interesting metaphors, varied sentence structures, and captivating phrasing while keeping the core message intact.`,
        
        technical: `Rewrite this text in a technical and precise manner. Use accurate terminology, clear specifications, proper technical language, and maintain professional technical standards appropriate for the subject matter.`,
        
        academic: `Rewrite this text in an academic and scholarly style. Use formal academic language, proper citation style markers where appropriate, objective tone, and structured argumentation suitable for academic writing.`,
        
        marketing: `Rewrite this text as engaging marketing copy. Use persuasive language, highlight benefits, create urgency or excitement, and make it compelling for the target audience while maintaining authenticity.`,
        
        cheeky: `Rewrite this text with a playful, cheeky, and slightly sarcastic tone. Add wit and humor while keeping it appropriately irreverent. Make it entertaining while preserving the essential message.`,
        
        newby: `Rewrite this text as if written by someone new to the topic. Use simpler language, show enthusiasm and curiosity, and include the perspective of someone learning about the subject for the first time.`,
        
        composer: `Generate new content based on this instruction. Create original text that fulfills the request clearly and completely. If it's a request like "write email about...", create the full email content. If it's "ideas for...", provide a well-structured list.`,
        
        translate: `Translate this text to clear, natural English. If it's already in English, improve the clarity, natural flow, and readability while preserving the original meaning and intent.`,
        
        summarize: `Create a concise summary of this text. Extract the key points, main ideas, and essential information, presenting them clearly and briefly while maintaining the logical structure.`,
        
        expand: `Expand and elaborate on this text. Add more detail, context, examples, and explanations to make it more comprehensive and thorough while maintaining the original focus and direction.`,
        
        simplify: `Simplify this text to make it easier to understand. Use plain language, shorter sentences, common words, and clear explanations while preserving all the important information and meaning.`
    };

    const modePrompt = prompts[modeInfo.key] || prompts.humanize;
    return `${modePrompt}\n\n${baseInstruction}\n\nInput text:\n"${text}"\n\nOutput:`;
}

function getTemperatureForMode(mode) {
    const temperatures = {
        grammar: 0.1,
        professional: 0.2,
        technical: 0.2,
        academic: 0.2,
        polite: 0.3,
        translate: 0.3,
        summarize: 0.3,
        simplify: 0.3,
        humanize: 0.4,
        casual: 0.4,
        confident: 0.4,
        empathetic: 0.4,
        persuasive: 0.5,
        concise: 0.4,
        detailed: 0.4,
        expand: 0.5,
        marketing: 0.6,
        composer: 0.6,
        creative: 0.8,
        cheeky: 0.7,
        newby: 0.6
    };
    return temperatures[mode] || 0.4;
}

function postProcessResult(text, mode) {
    // Remove potential wrapping quotes
    if ((text.startsWith('"') && text.endsWith('"')) || 
        (text.startsWith("'") && text.endsWith("'"))) {
        text = text.slice(1, -1);
    }
    
    // Remove markdown formatting
    text = text.replace(/\*\*(.*?)\*\*/g, '$1'); // Bold
    text = text.replace(/\*(.*?)\*/g, '$1');     // Italic
    text = text.replace(/`(.*?)`/g, '$1');       // Code
    text = text.replace(/_{2,}(.*?)_{2,}/g, '$1'); // Underline
    
    // Remove list formatting for non-list modes
    if (!['composer', 'summarize', 'detailed'].includes(mode)) {
        text = text.replace(/^[\*\-\+]\s+/gm, '');
        text = text.replace(/^\d+\.\s+/gm, '');
    }
    
    // Remove common preambles
    const preambles = [
        /^Here's the rewritten text:?\s*/i,
        /^Rewritten text:?\s*/i,
        /^Result:?\s*/i,
        /^Output:?\s*/i,
        /^The rewritten version:?\s*/i,
        /^Here's the .*?:?\s*/i,
        /^This .*? version:?\s*/i
    ];
    
    for (const pattern of preambles) {
        text = text.replace(pattern, '');
    }
    
    // Clean up extra whitespace
    text = text.replace(/\n{3,}/g, '\n\n');
    text = text.replace(/\s{2,}/g, ' ');
    
    return text.trim();
}

// === MESSAGE HANDLING ===
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === 'updateContextMenus') {
        await setupContextMenus();
        sendResponse({ success: true });
    }
    
    if (message.action === 'getPerformanceMetrics') {
        sendResponse({ metrics: performanceMetrics });
    }
    
    if (message.action === 'clearCache') {
        responseCache.clear();
        sendResponse({ success: true });
    }
});

// === ENHANCED CONTENT SCRIPT FUNCTIONS ===
async function injectTextIntoPage(tabId, frameId, textToInject) {
    console.log("Injecting text into tab:", tabId, "Frame:", frameId);
    
    try {
        const results = await chrome.scripting.executeScript({
            target: { tabId: tabId, frameIds: frameId ? [frameId] : undefined },
            func: replaceSelectedTextEnhanced,
            args: [textToInject],
        });

        if (results[0]?.result?.success) {
            console.log("Text injection successful");
        } else {
            console.warn("Text injection failed or no result");
            throw new Error(results[0]?.result?.reason || "Unknown injection error");
        }
    } catch (error) {
        console.error("Failed to inject script:", error);
        notifyUser(tabId, "❌ Failed to replace text. Try clicking in the text field first.", true);
    }
}

// Enhanced text replacement function that runs in the page context
function replaceSelectedTextEnhanced(replacementText) {
    const activeElement = document.activeElement;
    let success = false;
    let reason = "Unknown error";

    if (!activeElement) {
        return { success: false, reason: "No active element found" };
    }

    try {
        // Handle textarea and input elements
        if (activeElement.tagName === 'TEXTAREA' || 
            (activeElement.tagName === 'INPUT' && /^(text|search|email|url|password|tel)$/i.test(activeElement.type))) {
            
            const start = activeElement.selectionStart;
            const end = activeElement.selectionEnd;
            
            if (start !== end) {
                // Replace selected text
                const beforeText = activeElement.value.substring(0, start);
                const afterText = activeElement.value.substring(end);
                activeElement.value = beforeText + replacementText + afterText;
                
                // Set cursor position at end of replaced text
                const newPosition = start + replacementText.length;
                activeElement.setSelectionRange(newPosition, newPosition);
                
                // Trigger events
                activeElement.dispatchEvent(new Event('input', { bubbles: true }));
                activeElement.dispatchEvent(new Event('change', { bubbles: true }));
                
                success = true;
                reason = "Text replaced in input/textarea";
            } else {
                reason = "No text selected in input/textarea";
            }
        }
        // Handle contentEditable elements
        else if (activeElement.isContentEditable) {
            const selection = window.getSelection();
            
            if (selection.rangeCount > 0 && !selection.isCollapsed) {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                
                const textNode = document.createTextNode(replacementText);
                range.insertNode(textNode);
                
                // Move cursor to end of inserted text
                range.setStartAfter(textNode);
                range.setEndAfter(textNode);
                selection.removeAllRanges();
                selection.addRange(range);
                
                // Trigger events
                activeElement.dispatchEvent(new Event('input', { bubbles: true }));
                activeElement.dispatchEvent(new Event('change', { bubbles: true }));
                
                success = true;
                reason = "Text replaced in contentEditable";
            } else {
                reason = "No text selected in contentEditable element";
            }
        } else {
            reason = "Element is not editable";
        }
        
        if (success) {
            // Focus the element to ensure cursor is visible
            activeElement.focus();
        }
        
    } catch (error) {
        console.error("Error replacing text:", error);
        reason = error.message;
    }

    return { success, reason };
}

// === ENHANCED NOTIFICATION SYSTEM ===
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
                    position: 'fixed', 
                    top: '10px', 
                    right: '10px', 
                    padding: '12px 16px',
                    borderRadius: '8px', 
                    color: 'white',
                    backgroundColor: errorFlag ? 'rgba(211, 47, 47, 0.95)' : 'rgba(46, 125, 50, 0.95)',
                    zIndex: '2147483647', 
                    fontSize: '14px', 
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontWeight: '500',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    border: errorFlag ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.2)',
                    opacity: '0',
                    transform: 'translateX(100%)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    maxWidth: '350px',
                    wordWrap: 'break-word'
                });
                document.body.appendChild(notifyDiv);
                
                // Trigger animation
                setTimeout(() => {
                    notifyDiv.style.opacity = '1';
                    notifyDiv.style.transform = 'translateX(0)';
                }, 10);
            } else {
                notifyDiv.style.backgroundColor = errorFlag ? 'rgba(211, 47, 47, 0.95)' : 'rgba(46, 125, 50, 0.95)';
                notifyDiv.style.border = errorFlag ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.2)';
                notifyDiv.style.opacity = '1';
                notifyDiv.style.transform = 'translateX(0)';
                
                if (notifyDiv.dataset.timeoutId) {
                    clearTimeout(parseInt(notifyDiv.dataset.timeoutId));
                }
            }
            
            notifyDiv.textContent = msg;
            
            const timeoutId = setTimeout(() => {
                notifyDiv.style.opacity = '0';
                notifyDiv.style.transform = 'translateX(100%)';
                setTimeout(() => { 
                    if (document.getElementById('--ai-rewriter-notifier') === notifyDiv) { 
                        notifyDiv.remove(); 
                    } 
                }, 300);
            }, durationMs);
            
            notifyDiv.dataset.timeoutId = timeoutId.toString();
        },
        args: [message, isError, duration],
    }).catch(err => { 
        console.error("Failed to inject notification script:", err);
    });
}

// === KEYBOARD SHORTCUTS ===
chrome.commands.onCommand.addListener(async (command) => {
    const settings = await getSettings();
    
    if (!settings.enableKeyboardShortcuts) {
        return;
    }

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!isValidTab(tab)) {
        return;
    }

    switch (command) {
        case 'rewrite-humanize':
            await executeShortcutRewrite(tab, 'humanize');
            break;
        case 'rewrite-professional':
            await executeShortcutRewrite(tab, 'professional');
            break;
        case 'rewrite-grammar':
            await executeShortcutRewrite(tab, 'grammar');
            break;
        case 'undo-rewrite':
            await handleUndo(tab.id);
            break;
    }
});

async function executeShortcutRewrite(tab, mode) {
    try {
        // Get selected text from page
        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                const selection = window.getSelection();
                const selectedText = selection.toString().trim();
                const activeElement = document.activeElement;
                
                // Check if we're in an editable element
                const isEditable = activeElement && (
                    activeElement.tagName === 'TEXTAREA' ||
                    (activeElement.tagName === 'INPUT' && /^(text|search|email|url|password|tel)$/i.test(activeElement.type)) ||
                    activeElement.isContentEditable
                );
                
                return {
                    selectedText,
                    isEditable,
                    hasSelection: selectedText.length > 0
                };
            }
        });

        const result = results[0]?.result;
        
        if (!result?.hasSelection) {
            notifyUser(tab.id, "⚠️ Please select text first", true);
            return;
        }
        
        if (!result.isEditable) {
            notifyUser(tab.id, "⚠️ Please select text in an editable field", true);
            return;
        }

        const settings = await getSettings();
        
        if (result.selectedText.length > settings.maxTextLength) {
            notifyUser(tab.id, `⚠️ Text too long (max ${settings.maxTextLength} characters)`, true);
            return;
        }

        // Check rate limiting
        if (!checkRateLimit()) {
            notifyUser(tab.id, "⏳ Too many requests. Please wait a moment.", true);
            return;
        }

        const modeInfo = { type: 'builtin', key: mode };
        
        // Show progress
        const modeName = BUILT_IN_MODES[mode]?.name || mode;
        notifyUser(tab.id, `🤖 Rewriting (${modeName})...`, false, 2000);

        // Store original text for undo
        if (settings.enableUndo) {
            storeForUndo(tab.id, 0, result.selectedText);
        }

        // Call API
        const resultText = await callGeminiApiWithRetry(
            settings.geminiApiKey,
            result.selectedText,
            modeInfo,
            settings
        );

        if (resultText && resultText.trim()) {
            await injectTextIntoPage(tab.id, 0, resultText);
            
            if (settings.enableUsageTracking) {
                await trackUsage(mode, result.selectedText.length, resultText.length);
            }
            
            notifyUser(tab.id, "✅ Text rewritten successfully!", false, 2000);
        } else {
            throw new Error("Empty response from AI");
        }

    } catch (error) {
        console.error(`Keyboard shortcut rewrite failed:`, error);
        const errorMsg = getUserFriendlyError(error);
        notifyUser(tab.id, `❌ ${errorMsg}`, true);
    }
}
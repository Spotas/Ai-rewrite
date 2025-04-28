# ✨ AI Text Rewriter (Your Gemini-Powered Word Wizard) ✨

**(Because sometimes your own words just... suck. 🤷‍♀️)**

[![Version](https://img.shields.io/badge/Version-1.0ish-blue)](https://img.shields.io/badge/Version-1.0ish-blue) [![License](https://img.shields.io/badge/License-MIT-green)](https://img.shields.io/badge/License-MIT-green) [![Coffee](https://img.shields.io/badge/Made%20with%2054%20cup%20of-%20Chai%20☕-orange)](https://img.shields.io/badge/Buy%20Me%20A-Coffee-orange) <!-- Totally fake links, obvs -->

Ever stared at a sentence you wrote and thought, "Wow, I sound like a bored robot trying to order pizza"? 🤖🍕 Yeah, us too.

This Chrome extension is your secret weapon! It uses the mighty **Google Gemini AI** (the `gemini-2.0-flash-lite` model, specifically, 'cause we're fancy AND fast ⚡) to magically rewrite your text directly in input fields and text areas across the web.

Select some text, right-click, pick a vibe, and BAM! 💥 New words. Hopefully better words. Sometimes... *interesting* words. It's AI, folks, it's a wild ride! 🎢

---

## 🚀 Features (The Shiny Bits!) 🚀

*   **🪄 Magic Wand Right-Click Action:** Select text in almost any editable field, right-click, and BOOM - rewrite options appear!
*   **🎭 Tons of Tones (Because One Size Fits NONE):**
    *   Make it sound more human (less robo-cop).
    *   Just fix the darn typos and grammar blunders.
    *   Sound like you actually own a suit (Professional).
    *   Be super nice, even when you're seething (Polite).
    *   Get a little sassy, maybe even *intentionally* mess up (Cheeky!).
    *   Sound like you *just* learned what a keyboard is (Newby).
    *   Tell the AI what to write from scratch (Composer)!
*   **🧠 Powered by Google's Brainiac Gemini:** Leverages the `gemini-2.0-flash-lite` model via the Google AI API. It's smart... usually.
*   **🔑 Secure-ish API Key Storage:** Uses `chrome.storage.sync` to save your precious Gemini API key (so you don't have to paste it every five seconds). Syncs across your Chrome browsers if you're logged in!
*   **🎨 Snazzy Options Page:** A surprisingly modern-looking page to paste that API key you definitely didn't just Google how to get.
*   **📢 Helpful (Annoying?) Popups:** Little notifications slide in to tell you what's happening, or more likely, what went wrong. They fade away... eventually.

---

## 🛠️ Installation (Let's Get This Party Started!) 🛠️

Alright, since this isn't (yet?) on the Chrome Web Store (because who has time for reviews? 🙄), you gotta load it manually like a true tech wizard (or someone who can follow instructions).

1.  **Grab the Goods 🛍️:** Download the extension files. Either clone the repository or download the ZIP and unzip it somewhere you won't accidentally delete it later. Let's call this magical place the `ai-rewriter-extension` folder.
2.  **Open Chrome's Secret Lair 🚪:** Open Google Chrome, type `chrome://extensions` in your address bar, and hit Enter. Spooooky!
3.  **Flip the Super Secret Developer Switch 🕵️‍♀️:** Look for a toggle labeled "Developer mode" (usually in the top right corner). Click it. If it's on, you're basically a hacker now. Congrats.
4.  **Shove the Folder at Chrome 욱:** Click the "Load unpacked" button that magically appeared. A file browser window will pop up.
5.  **Point and Shoot 👉:** Navigate to and select that `ai-rewriter-extension` folder (the one *containing* the `manifest.json` file, not the zip file!). Click "Select Folder" or "Open".
6.  **Bask in the Glory (or fix errors) 🙏:** If all went well, you should see the "AI Text Rewriter (Gemini)" extension card appear on the page! If you see angry red errors, you probably messed up step 5. Go back and try again, champ. 💪

🎉 **Ta-da!** The extension icon (whatever placeholder icon we used) should appear in your Chrome toolbar (maybe hidden behind the puzzle piece icon 🧩).

---

## ⚙️ Configuration: The Golden Ticket 🔑

Okay, here's the *slightly* annoying part. This extension needs **YOUR** Google Gemini API Key to actually talk to the AI. Think of it like needing a password to get into the cool AI club.

**Why?** Because accessing powerful AI models costs money (or at least has usage limits), and Google needs to know who's asking! This extension makes requests directly from *your* browser using *your* key.

**Where to Snag This Magical Key? 🤔**

1.  Go to the **[Google AI Studio](https://aistudio.google.com/app/apikey)**. You'll likely need a Google account.
2.  Click the button that says something like "Create API key".
3.  It might ask you to create a project first. Just follow the prompts, nod wisely, and click "Agree" to things you probably won't read.
4.  Eventually, it will reveal your **SECRET API KEY**. It's a long string of random letters and numbers.
5.  **COPY THIS KEY!** 📋 Treat it like a password. Don't share it publicly!

**Plugging in the Power Cord 🔌**

1.  Click the **AI Text Rewriter extension icon** 🧩 in your Chrome toolbar. This should open the fancy Options page we made.
    *   *Alternatively:* Go back to `chrome://extensions`, find the AI Text Rewriter card, click "Details", then "Extension options". So many clicks!
2.  You'll see a field labeled "**Gemini API Key**". It's a password field, so you won't see the key as you paste (oooooh, security! ✨).
3.  **PASTE** your copied API key into this box.
4.  Click the glorious "**Save Key**" button. 💾
5.  You *should* see a happy green message saying "API Key saved successfully!". ✅ If you see an angry red message, well... Houston, we have a problem. Houston, we have a problem. 🚀 (Did you paste the *whole* key?).

**❗ IMPORTANT NOTE ABOUT YOUR KEY ❗**

*   **Keep it Secret, Keep it Safe!** 🔒 Don't commit it to public code, don't paste it in random chat rooms. It's linked to *your* Google account.
*   **Usage Might Cost $$$!** Google often has a free tier for their APIs, but heavy usage *could* potentially incur costs. Check their pricing! You are responsible for the usage associated with your key. Don't blame us if you rewrite War and Peace and get a bill. 💸

---

## ✨ How to Use (The Fun Part!) ✨

Okay, installed? ✅ API key saved? ✅ Ready to rock? ✅ Let's rewrite!

1.  **Find a Victim... I Mean, a Text Box 🎯:** Go to any website with a text input field (`<textarea>`, some `<input>` fields). Think email drafts, comment boxes, social media posts, online notepads... you get the idea.
    *   **Heads Up:** This probably *won't* work on super fancy custom editors like Google Docs or Notion directly, as they do weird things. It *definitely* won't work on `chrome://` pages (like the extensions page itself) for security reasons! Stick to normal web pages (http/https).
2.  **Type Your Soon-to-be-Glorious Words ⌨️:** Write something. Anything! Pour your heart out, or just type "the quick brown fox jumps over the lazy dog".
3.  **Highlight the Chosen Ones ✨:** Select the text you want to transform using your mouse or keyboard.
4.  **Invoke the Menu! Right-Click Pow! 🖱️💥:** Right-click directly *on the selected text*.
5.  **Behold! The Menu! 🤩:** Hover over the "**Rewrite with AI**" option in the context menu that pops up.
6.  **Pick Your Poison... Uh, Personality 🎭:** Choose one of the available modes from the sub-menu (Humanize, Professional, Cheeky, Composer, etc.).
7.  **Patience, Grasshopper... 🌱:** A little notification might pop up saying it's working. The extension sends your text and the chosen mode off to the Gemini AI via the interwebs. This might take a second or two depending on the AI, the complexity, and whether your internet connection is powered by hamsters. 🐹
8.  **Witness the Transformation! 🪄:** If the AI gods smile upon you, the selected text will be **replaced** with the rewritten version! 🎉

---

## 🎭 Modes Explained (Choose Your Weapon Wisely) 🎭

*   **`Humanize (Make Natural)`:** Sound Less Like a Robot 🤖➡️🧑‍🎨
    *   *Use when:* Your writing is stiff, overly formal, or just plain boring. Aims for a conversational, natural flow.
*   **`Correct Grammar Only`:** Your Personal Grammar Nazi (but nicer?) 🧐
    *   *Use when:* You just want spelling and grammar fixed without changing the meaning or tone much. It *tries* to only fix errors.
*   **`Professional Tone`:** Put on Your Business Pants 👔
    *   *Use when:* You need to sound formal, respectable, and like you know buzzwords. Good for work emails, reports (maybe?). *Tries* not to write the whole email for you unless the original text implied it.
*   **`Polite Tone`:** For When You Need to Grovel (Nicely) 🙏
    *   *Use when:* Your text sounds a bit harsh or demanding. This softens the language and adds courteous phrasing. Good for customer service replies or asking for favors.
*   **`Cheeky (with Mistake)`:** Sassy Mode: ENGAGE! 😏 (Now with *Intentional* Oopsies!)
    *   *Use when:* You want a playful, slightly sarcastic, or witty tone. As a bonus (?) it *tries* to sneak in **one** common grammatical error (your/you're, its/it's etc.) for extra authenticity? Or just chaos? 🤪
*   **`Newby Tone`:** Sound Adorably Clueless 🥰
    *   *Use when:* You want to sound like a beginner – maybe a bit simplistic, overly enthusiastic, or slightly awkward. Good for... roleplaying? Making complex topics sound simple? You tell me.
*   **`Compose (from instruction)`:** Your Ghostwriter Genie 🧞
    *   *Use when:* You don't want to *rewrite* existing text, but generate *new* text based on a short instruction.
    *   *How:* Type your instruction (e.g., `write short email asking for project update`, `brainstorm blog post titles about cats`, `reply politely to this complaint`) into the text box, **select the instruction text**, right-click, and choose "Compose". The instruction will be replaced by the AI's generated content.

---

## 🤔 Troubleshooting (When Things Go Sideways) 🤔

Yeah, sometimes technology just says "NOPE". 🙅‍♂️ Here's a quick guide:

*   **😭 It's Not Working AT ALL!**
    *   **API Key:** Did you *actually* save your API key correctly in the options? Is it the *right* key? Double-check!
    *   **Reload Extension:** Go to `chrome://extensions` and click the little refresh icon 🔄 on the AI Rewriter card. Sometimes extensions get sleepy.
    *   **Reload Page:** Try refreshing the webpage (F5) you're trying to use it on.
    *   **Check Console (Background):** Go to `chrome://extensions`, find the AI Rewriter card, and click the "**Service worker**" link. Look for **RED ERROR MESSAGES** in the console window that pops up *after* you try to use the extension. Copy/paste these if you need help!
    *   **Check Console (Page):** On the webpage where it's failing, right-click anywhere, select "Inspect", and go to the "Console" tab. Try using the extension again. Any **RED ERRORS** there?

*   **🚫 Error: `Cannot access chrome:// URL`**
    *   You're trying to use the extension on a Chrome settings page (like `chrome://extensions`). For security reasons, Chrome blocks extensions from messing with these pages. Use it on a regular `http://` or `https://` website.

*   **✨ Weird Output (Options, Asterisks `*`, Emails when you didn't ask?)**
    *   The AI can be a bit... creative. We've tried to tell it *very sternly* in the prompts to JUST give the rewritten text and nothing else (no markdown like `*emphasis*`, no "Option 1:", etc.).
    *   If you still get weird formatting or unexpected content (like a full email for "Professional Tone"), the AI might be ignoring instructions. We added some cleanup code, but it's not perfect. Prompt engineering is hard! 🤷‍♂️

*   **🚦 Error: `Content blocked by API...`**
    *   The AI's safety filters might have flagged your original text or the requested rewrite (especially possible with "Cheeky"). Try rephrasing your original text or using a different mode.

*   **📉 API Errors (4xx/5xx Status)**
    *   `400 Bad Request`: Often means the model name (`gemini-2.0-flash-lite`) is wrong or the request format is broken. (Shouldn't happen with this code, but maybe Google changed something?).
    *   `401 Unauthorized` / `403 Forbidden`: Almost always an **API Key problem**. Is it correct? Is it enabled? Does your Google Cloud project have the API enabled?
    *   `404 Not Found`: The API endpoint URL might be wrong.
    *   `429 Too Many Requests`: You might be hitting rate limits on the free tier. Slow down!
    *   `500 Internal Server Error`: Google's servers are having a hiccup. Try again later. ☕

---

## 💡 Contributing (Got Ideas? Found Bugs?) 💡🐛

Hey, if you have ideas to make this less buggy or more awesome, or if you found a hilarious bug (like it rewriting everything into pirate speak 🏴‍☠️ - which would be kinda cool, actually), feel free to:

*   Open an issue on the GitHub repository (if this *is* on GitHub... otherwise, uh... tell the developer?).
*   Fork it, fix it, and submit a pull request (again, GitHub stuff).

We appreciate the help making this thing slightly less likely to explode. 🔥

---

## 📜 License (The Legal Mumbo Jumbo) 📜

This extension is licensed under the **MIT License**.

Basically, this means you can do almost whatever you want with this code (use it, copy it, modify it, sell it - though good luck with that!), as long as you include the original copyright and license notice.

**BUT, there's NO WARRANTY.** If this extension accidentally deletes your masterpiece novel, formats your hard drive, or makes your coffee cold... tough luck. Use at your own risk! 😉

---

## 📝 Acknowledgments

- Special thanks to the Google Gemini team for their amazing AI technology!
- Thanks to the Chrome extension development community for all the resources and inspiration! 🙌
- And a big shoutout to you, the user! Thanks for trying out this extension and making the internet a slightly more interesting place! 🌍✨

--- 
If you like this extension, consider buying me a coffee! ☕ (Just kidding, I don't drink coffee. But I appreciate the thought!)

**Happy Rewriting! May your words be ever in your favor!** ✨
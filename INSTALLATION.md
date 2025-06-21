# Installation Guide

## Quick Setup

### 1. Build the Extension
```bash
npm install
npm run build-extension
```

### 2. Load in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist` folder from this project

### 3. Get OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/account/api-keys)
2. Create a new API key
3. Copy the key (starts with `sk-`)

### 4. Configure Extension
1. Click the extension icon in your Chrome toolbar
2. Enter your OpenAI API key
3. Click "Save & Continue"

### 5. Start Using
1. Go to any Leetcode problem page
2. Look for the 🤖 icon in the bottom-right corner
3. Click it to open the AI chat interface
4. Ask questions about your code!

## Development

### Watch Mode (Auto-rebuild)
```bash
npm run dev-extension
```
This will automatically rebuild the extension when you make changes to the source files.

### Manual Build
```bash
npm run build-extension
```

## Troubleshooting

### Extension Not Loading
- Make sure you selected the `dist` folder (not the root project folder)
- Check that all files are present in the `dist` folder
- Verify the manifest.json is valid

### Chat Icon Not Appearing
- Ensure you're on a Leetcode problem page (URL contains `/problems/`)
- Try refreshing the page
- Check the browser console for any errors

### API Errors
- Verify your OpenAI API key is correct
- Check that you have sufficient API credits
- Ensure the key starts with `sk-`

### Content Script Issues
- Reload the extension in Chrome
- Check that the content script is being injected (look in browser console)
- Try visiting a different Leetcode problem page

## File Structure After Build

```
dist/
├── index.html              # Extension popup
├── background.js           # Background service worker
├── contentScript.js        # Content script for Leetcode pages
├── manifest.json           # Extension configuration
├── vite.svg               # Extension icon
└── assets/                # Built React app assets
    ├── main-*.js          # Main application bundle
    ├── main-*.css         # Styles
    └── react-*.svg        # React logo
```

## Permissions Explained

- **activeTab**: Allows the extension to interact with the current tab
- **scripting**: Enables injection of content scripts
- **storage**: Stores your API key securely
- **tabs**: Detects when you're on Leetcode pages

## Host Permissions

- **https://leetcode.com/\***: Required to work on Leetcode problem pages
- **https://api.openai.com/\***: Required to send requests to OpenAI's API

## Privacy

- Your API key is stored locally in Chrome's storage
- Code analysis is sent to OpenAI's API for processing
- No data is stored on external servers
- The extension only works on Leetcode problem pages 
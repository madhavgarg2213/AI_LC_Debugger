# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# AI Leetcode Debugger Chrome Extension

A Chrome extension that provides AI-powered debugging assistance for Leetcode problems. The extension adds a floating chat icon on Leetcode problem pages that allows you to ask questions about your code and get AI-powered suggestions for improvements.

## Features

- 🤖 **AI-Powered Assistance**: Get help debugging and optimizing your Leetcode solutions
- 💬 **Floating Chat Interface**: Click the robot icon on any Leetcode problem page to open a chat
- 🔑 **Secure API Key Storage**: Your Google Gemini API key is stored securely in Chrome's local storage
- 🎯 **Context-Aware**: The AI understands the current problem and your code
- 🚀 **Easy Setup**: Simple one-time setup with your OpenAI API key

## Setup

1. **Get an OpenAI API Key**
   - Visit [Google Gemini Platform]([https://platform.openai.com/account/api-keys](https://aistudio.google.com/app/apikey)
   - Create a new API key
   - Copy the key (starts with `al-`)

2. **Build the Extension**
   ```bash
   npm install
   npm run build-extension
   ```

3. **Load the Extension in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist` folder from this project

4. **Configure the Extension**
   - Click the extension icon in your Chrome toolbar
   - Enter your Google Gemini API key
   - Click "Save & Continue"

## Usage

1. **Visit a Leetcode Problem**
   - Go to any Leetcode problem page (e.g., https://leetcode.com/problems/two-sum/)

2. **Open the Chat**
   - Look for the floating robot icon (🤖) in the bottom-right corner
   - Click it to open the AI chat interface

3. **Ask Questions**
   - Type your questions about the problem or your code
   - The AI will analyze your current code and provide helpful suggestions
   - Examples:
     - "Why is my solution getting a time limit exceeded error?"
     - "How can I optimize this algorithm?"
     - "What's wrong with my logic here?"

## How It Works

- **Content Script**: Injects the floating chat icon and handles the chat interface
- **Background Script**: Manages communication between the popup and content script
- **Popup**: Handles API key setup and validation
- **Storage**: Securely stores your OpenAI API key using Chrome's local storage

## File Structure

```
extension/
├── src/
│   ├── App.jsx              # Main popup interface
│   ├── background.js        # Background service worker
│   └── contentScript.js     # Content script for Leetcode pages
├── public/
│   ├── manifest.json        # Extension manifest
│   └── vite.svg            # Extension icon
├── dist/                   # Built extension files
├── build-extension.js      # Build script
└── package.json
```

## Development

- **Development Mode**: `npm run dev`
- **Build Extension**: `npm run build-extension`
- **Lint Code**: `npm run lint`

## Permissions

The extension requires the following permissions:
- `activeTab`: To interact with the current tab
- `scripting`: To inject content scripts
- `storage`: To store your API key securely
- `tabs`: To detect when you're on Leetcode pages

## Host Permissions

- `https://leetcode.com/*`: To work on Leetcode problem pages
- `https://api.openai.com/*`: To send requests to OpenAI's API

## Troubleshooting

- **Chat icon not appearing**: Make sure you're on a Leetcode problem page (URL contains `/problems/` or `/problem/`)
- **API errors**: Verify your OpenAI API key is correct and has sufficient credits
- **Extension not loading**: Check that all files are in the `dist` folder and the manifest.json is valid

## Privacy

- Your API key is stored locally in Chrome's storage
- Code analysis is sent to OpenAI's API for processing
- No data is stored on external servers

## Contributing

Feel free to submit issues and enhancement requests!

// Background script for the AI Leetcode Debugger extension

const LEETCODE_PROBLEM_URL_PATTERN = /https:\/\/leetcode\.com\/(problems|problem)\/.*/;

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('AI Leetcode Debugger extension installed');
});

// Listen for messages from popup or content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleChat') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab && activeTab.url && LEETCODE_PROBLEM_URL_PATTERN.test(activeTab.url)) {
        //send a message to the content script to toggle the chat
        chrome.tabs.sendMessage(activeTab.id, { action: 'toggleChat' }, (response) => {
          if (chrome.runtime.lastError) {
            console.log('Content script not ready, injecting...');
            injectContentScript(activeTab.id).then(() => {
              setTimeout(() => {
                chrome.tabs.sendMessage(activeTab.id, { action: 'toggleChat' }, (res) => sendResponse(res));
              }, 500);
            });
          } else {
            sendResponse(response);
          }
        });
      }
    });
    return true; // Keep the message channel open for async response
  }
});

// Inject script when a tab is updated to a LeetCode problem page
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && LEETCODE_PROBLEM_URL_PATTERN.test(tab.url)) {
    injectContentScript(tabId);
  }
});

// Handle extension icon click to open chat if on a valid page
chrome.action.onClicked.addListener((tab) => {
  if (tab.url && LEETCODE_PROBLEM_URL_PATTERN.test(tab.url)) {
    chrome.tabs.sendMessage(tab.id, { action: 'toggleChat' }, (response) => {
      if (chrome.runtime.lastError) {
        console.log('Content script not ready, injecting...');
        injectContentScript(tab.id).then(() => {
          setTimeout(() => {
            chrome.tabs.sendMessage(tab.id, { action: 'toggleChat' });
          }, 500);
        });
      }
    });
  }
});

// Helper function to inject content script
async function injectContentScript(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['contentScript.js']
    });
  } catch (err) {
    if (!err.message.includes('Cannot create duplicate script')) {
      console.error('Failed to inject content script:', err);
    }
  }
} 
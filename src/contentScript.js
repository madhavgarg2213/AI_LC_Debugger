// Content script that runs on Leetcode pages
let chatIcon = null;
let chatWindow = null;
let isChatOpen = false;

// Create and inject the floating chat icon
function createChatIcon() {
  // Remove existing icon if it exists
  if (chatIcon) {
    chatIcon.remove();
  }

  chatIcon = document.createElement('div');
  chatIcon.id = 'ai-leetcode-debugger-icon';
  chatIcon.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      transition: all 0.3s ease;
      font-size: 24px;
      color: white;
      user-select: none;
    " title="AI Leetcode Debugger - Click to chat">
      🤖
    </div>
  `;

  // Add hover effects
  const iconElement = chatIcon.querySelector('div');
  iconElement.addEventListener('mouseenter', () => {
    iconElement.style.transform = 'scale(1.1)';
    iconElement.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
  });
  
  iconElement.addEventListener('mouseleave', () => {
    iconElement.style.transform = 'scale(1)';
    iconElement.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
  });

  // Add click handler
  iconElement.addEventListener('click', toggleChat);

  document.body.appendChild(chatIcon);
}

// Create the chat window
function createChatWindow() {
  if (chatWindow) {
    chatWindow.remove();
  }

  chatWindow = document.createElement('div');
  chatWindow.id = 'ai-leetcode-debugger-chat';
  chatWindow.innerHTML = `
    <div style="
      position: fixed;
      bottom: 100px;
      right: 20px;
      width: 380px;
      height: 500px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12);
      z-index: 10001;
      display: flex;
      flex-direction: column;
      border: 1px solid #e5e7eb;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      animation: slideIn 0.3s ease-out;
    ">
      <!-- Header -->
      <div style="
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 16px;
        border-radius: 12px 12px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <h3 style="margin: 0; font-size: 16px; font-weight: 600;">AI Leetcode Debugger</h3>
        <button id="close-chat" style="
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 18px;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: background-color 0.2s;
        " title="Close chat">×</button>
      </div>
      
      <!-- Chat Messages -->
      <div id="chat-messages" style="
        flex: 1;
        padding: 16px;
        overflow-y: auto;
        background: #f9fafb;
        scrollbar-width: thin;
        scrollbar-color: #cbd5e0 #f1f5f9;
      ">
        <div style="
          background: #e3f2fd;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 12px;
          font-size: 14px;
          color: #1976d2;
          border-left: 4px solid #2196f3;
        ">
          👋 Hi! I'm your AI coding assistant. I can help you debug and optimize your Leetcode solutions. What would you like help with?
        </div>
      </div>
      
      <!-- Input Area -->
      <div style="
        padding: 16px;
        border-top: 1px solid #e5e7eb;
        background: white;
        border-radius: 0 0 12px 12px;
      ">
        <div style="display: flex; gap: 8px;">
          <input id="chat-input" type="text" placeholder="Ask me anything about your code..." style="
            flex: 1;
            padding: 10px 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s;
          " />
          <button id="send-message" style="
            background: #667eea;
            color: white;
            border: none;
            padding: 10px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: background-color 0.2s;
          ">Send</button>
        </div>
      </div>
    </div>
  `;

  // Add CSS animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    #chat-messages::-webkit-scrollbar {
      width: 6px;
    }
    
    #chat-messages::-webkit-scrollbar-track {
      background: #f1f5f9;
    }
    
    #chat-messages::-webkit-scrollbar-thumb {
      background: #cbd5e0;
      border-radius: 3px;
    }
    
    #chat-messages::-webkit-scrollbar-thumb:hover {
      background: #a0aec0;
    }
  `;
  document.head.appendChild(style);

  // Add event listeners
  const closeBtn = chatWindow.querySelector('#close-chat');
  const sendBtn = chatWindow.querySelector('#send-message');
  const input = chatWindow.querySelector('#chat-input');

  closeBtn.addEventListener('click', toggleChat);
  closeBtn.addEventListener('mouseenter', () => {
    closeBtn.style.backgroundColor = 'rgba(255,255,255,0.1)';
  });
  closeBtn.addEventListener('mouseleave', () => {
    closeBtn.style.backgroundColor = 'transparent';
  });

  sendBtn.addEventListener('click', sendMessage);
  sendBtn.addEventListener('mouseenter', () => {
    sendBtn.style.backgroundColor = '#5a67d8';
  });
  sendBtn.addEventListener('mouseleave', () => {
    sendBtn.style.backgroundColor = '#667eea';
  });

  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  input.addEventListener('focus', () => {
    input.style.borderColor = '#667eea';
  });

  input.addEventListener('blur', () => {
    input.style.borderColor = '#d1d5db';
  });

  document.body.appendChild(chatWindow);
  
  // Focus the input
  setTimeout(() => {
    input.focus();
  }, 100);
}

// Toggle chat window
function toggleChat() {
  if (!isChatOpen) {
    createChatWindow();
    isChatOpen = true;
    // Hide the icon when chat is open
    if (chatIcon) {
      chatIcon.style.display = 'none';
    }
  } else {
    if (chatWindow) {
      chatWindow.remove();
      chatWindow = null;
    }
    isChatOpen = false;
    // Show the icon when chat is closed
    if (chatIcon) {
      chatIcon.style.display = 'block';
    }
  }
}

// Get current code from the page
function getCurrentCode() {
  // Try multiple selectors to find the code editor
  const selectors = [
    '.monaco-editor textarea',
    '.monaco-editor .view-lines',
    'textarea[data-cy="code-editor"]',
    '.CodeMirror textarea',
    'pre code',
    'textarea',
    '.ace_editor'
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      if (element.tagName === 'TEXTAREA') {
        return element.value;
      } else if (element.textContent) {
        return element.textContent;
      }
    }
  }

  // Fallback: try to get code from any pre/code blocks
  const codeBlocks = document.querySelectorAll('pre code, .code-block');
  if (codeBlocks.length > 0) {
    return Array.from(codeBlocks).map(block => block.textContent).join('\n\n');
  }

  return 'No code detected on the page.';
}

// Get problem information
function getProblemInfo() {
  const title = document.querySelector('h1')?.textContent || 
                document.querySelector('[data-cy="question-title"]')?.textContent ||
                'Leetcode Problem';
  
  const difficulty = document.querySelector('[data-cy="question-difficulty"]')?.textContent ||
                    document.querySelector('.difficulty-label')?.textContent ||
                    '';
  
  return { title, difficulty };
}

// Send message function
async function sendMessage() {
  const input = document.querySelector('#chat-input');
  const messagesContainer = document.querySelector('#chat-messages');
  const message = input.value.trim();
  
  if (!message) return;

  // Add user message
  const userMessageDiv = document.createElement('div');
  userMessageDiv.style.cssText = `
    background: #667eea;
    color: white;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 12px;
    font-size: 14px;
    align-self: flex-end;
    max-width: 80%;
    margin-left: auto;
    word-wrap: break-word;
  `;
  userMessageDiv.textContent = message;
  messagesContainer.appendChild(userMessageDiv);

  // Clear input
  input.value = '';

  // Add loading indicator
  const loadingDiv = document.createElement('div');
  loadingDiv.style.cssText = `
    background: #f3f4f6;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 12px;
    font-size: 14px;
    color: #6b7280;
    display: flex;
    align-items: center;
    gap: 8px;
  `;
  loadingDiv.innerHTML = '<div style="width: 16px; height: 16px; border: 2px solid #e5e7eb; border-top: 2px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite;"></div>🤔 Thinking...';
  messagesContainer.appendChild(loadingDiv);

  // Add spinning animation
  const spinStyle = document.createElement('style');
  spinStyle.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
  document.head.appendChild(spinStyle);

  // Scroll to bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  try {
    // Get API key from storage
    const result = await chrome.storage.local.get(['openai_api_key']);
    const apiKey = result.openai_api_key;

    if (!apiKey) {
      throw new Error('API key not found. Please set up your API key in the extension popup.');
    }

    // Get current problem context
    const { title, difficulty } = getProblemInfo();
    const currentCode = getCurrentCode();

    // Prepare the prompt
    const prompt = `You are an AI coding assistant helping with a Leetcode problem: "${title}"${difficulty ? ` (${difficulty})` : ''}.

Current code:
\`\`\`
${currentCode}
\`\`\`

User question: ${message}

Please provide a helpful response that includes:
1. Analysis of the current code (if any)
2. Suggestions for improvement
3. Specific debugging tips if needed
4. Code examples if relevant

Keep your response concise, actionable, and focused on helping the user solve the problem.`;

    // Send to OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API request failed: ${response.status} ${errorData.error?.message || ''}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Remove loading indicator
    loadingDiv.remove();

    // Add AI response
    const aiMessageDiv = document.createElement('div');
    aiMessageDiv.style.cssText = `
      background: #f3f4f6;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 12px;
      font-size: 14px;
      color: #374151;
      white-space: pre-wrap;
      word-wrap: break-word;
      border-left: 4px solid #10b981;
    `;
    aiMessageDiv.textContent = aiResponse;
    messagesContainer.appendChild(aiMessageDiv);

  } catch (error) {
    console.error('Error sending message:', error);
    
    // Remove loading indicator
    loadingDiv.remove();

    // Add error message
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      background: #fef2f2;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 12px;
      font-size: 14px;
      color: #dc2626;
      border-left: 4px solid #ef4444;
    `;
    errorDiv.textContent = `❌ Error: ${error.message}`;
    messagesContainer.appendChild(errorDiv);
  }

  // Scroll to bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Initialize when the page loads
function init() {
  // Check if we're on a Leetcode problem page
  const isLeetcodeProblem = window.location.hostname.includes('leetcode.com') && 
                           (window.location.pathname.includes('/problems/') || 
                            window.location.pathname.includes('/problem/'));
  
  if (isLeetcodeProblem) {
    // Wait for page to fully load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', createChatIcon);
    } else {
      // Add a small delay to ensure the page is fully rendered
      setTimeout(createChatIcon, 1000);
    }
  }
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleChat') {
    toggleChat();
    sendResponse({ success: true });
  }
});

// Initialize
init(); 
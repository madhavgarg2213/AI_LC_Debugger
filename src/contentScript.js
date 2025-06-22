(() => {
  // Guard against multiple injections
  if (window.hasRun) {
    return;
  }
  window.hasRun = true;

  let lastApiCall = 0;
const API_CALL_DELAY = 60000; // 60 seconds between API calls
let apiCallQueue = [];
let isProcessingQueue = false;
let geminiModelName = null; // Cache the detected model name for the session

  // Content script that runs on Leetcode pages
  let chatIcon = null;
  let chatWindow = null;
  let isChatOpen = false;
  let userCode = ''; // Store user's pasted code
  let eventListenersAttached = false; // Flag to prevent multiple event listeners
  let isAnalyzing = false; // Flag to prevent multiple API calls

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
        ��
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
          <div id="welcome-message" style="
            background: #e3f2fd;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 12px;
            font-size: 14px;
            color: #1976d2;
            border-left: 4px solid #2196f3;
          ">
            👋 Hi! Nice to see you solving "<span id="problem-title"></span>"! Please paste your code first, then I can help you debug and optimize your solution!
          </div>
        </div>
        
        <!-- Code Input Area -->
        <div id="code-input-section" style="
          padding: 16px;
          border-top: 1px solid #e5e7eb;
          background: #f9fafb;
          display: block;
        ">
          <textarea id="code-input" placeholder="Paste your code here..." style="
            width: 100%;
            height: 80px;
            padding: 10px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 12px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            resize: vertical;
            outline: none;
            transition: border-color 0.2s;
            box-sizing: border-box;
          "></textarea>
          <button id="submit-code" style="
            background: #10b981;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 500;
            margin-top: 8px;
            transition: background-color 0.2s;
          ">Submit Code</button>
        </div>
        
        <!-- Chat Input Area -->
        <div id="chat-input-section" style="
          padding: 16px;
          border-top: 1px solid #e5e7eb;
          background: white;
          border-radius: 0 0 12px 12px;
          display: none;
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
          <button id="change-code" style="
            background: #6b7280;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            margin-top: 8px;
            transition: background-color 0.2s;
          ">Change Code</button>
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
    setupEventListeners();

    document.body.appendChild(chatWindow);
    
    // Set the problem title in the welcome message
    const problemTitle = getTitleFromCurrentPage();
    const titleElement = chatWindow.querySelector('#problem-title');
    if (titleElement) {
      titleElement.textContent = problemTitle;
    }
    
    // Focus the code input initially
    setTimeout(() => {
      const codeInput = document.querySelector('#code-input');
      if (codeInput) {
        codeInput.focus();
      }
    }, 100);
  }

  // Setup all event listeners
  function setupEventListeners() {
    // Prevent multiple event listener attachments
    if (eventListenersAttached) {
      console.log('Event listeners already attached, skipping...');
      return;
    }
    
    console.log('Setting up event listeners...');
    const closeBtn = chatWindow.querySelector('#close-chat');
    const submitCodeBtn = chatWindow.querySelector('#submit-code');
    const sendBtn = chatWindow.querySelector('#send-message');
    const changeCodeBtn = chatWindow.querySelector('#change-code');
    const chatInput = chatWindow.querySelector('#chat-input');
    const codeInput = chatWindow.querySelector('#code-input');

    // Close button
    closeBtn.addEventListener('click', toggleChat);
    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.backgroundColor = 'rgba(255,255,255,0.1)';
    });
    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.backgroundColor = 'transparent';
    });

    // Submit code button
    submitCodeBtn.addEventListener('click', submitCode);
    submitCodeBtn.addEventListener('mouseenter', () => {
      submitCodeBtn.style.backgroundColor = '#059669';
    });
    submitCodeBtn.addEventListener('mouseleave', () => {
      submitCodeBtn.style.backgroundColor = '#10b981';
    });

    // Send message button
    if (sendBtn) {
      sendBtn.addEventListener('click', sendMessage);
      sendBtn.addEventListener('mouseenter', () => {
        sendBtn.style.backgroundColor = '#5a67d8';
      });
      sendBtn.addEventListener('mouseleave', () => {
        sendBtn.style.backgroundColor = '#667eea';
      });
    }

    // Change code button
    if (changeCodeBtn) {
      changeCodeBtn.addEventListener('click', showCodeInput);
      changeCodeBtn.addEventListener('mouseenter', () => {
        changeCodeBtn.style.backgroundColor = '#4b5563';
      });
      changeCodeBtn.addEventListener('mouseleave', () => {
        changeCodeBtn.style.backgroundColor = '#6b7280';
      });
    }

    // Chat input enter key
    if (chatInput) {
      chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          sendMessage();
        }
      });

      chatInput.addEventListener('focus', () => {
        chatInput.style.borderColor = '#667eea';
      });

      chatInput.addEventListener('blur', () => {
        chatInput.style.borderColor = '#d1d5db';
      });
    }

    // Code input focus effects
    if (codeInput) {
      codeInput.addEventListener('focus', () => {
        codeInput.style.borderColor = '#10b981';
      });

      codeInput.addEventListener('blur', () => {
        codeInput.style.borderColor = '#d1d5db';
      });
    }
    
    eventListenersAttached = true;
    console.log('Event listeners attached successfully');
  }

  // Helper to enable/disable chat input and send button
  function setChatInputEnabled(enabled) {
    const chatInput = document.querySelector('#chat-input');
    const sendBtn = document.querySelector('#send-message');
    if (chatInput) {
      chatInput.disabled = !enabled;
      chatInput.style.opacity = enabled ? '1' : '0.5';
      chatInput.style.cursor = enabled ? 'text' : 'not-allowed';
    }
    if (sendBtn) {
      sendBtn.disabled = !enabled;
      sendBtn.style.opacity = enabled ? '1' : '0.5';
      sendBtn.style.cursor = enabled ? 'pointer' : 'not-allowed';
    }
  }

  // Submit code function
  async function submitCode() {
    console.log('submitCode function called');
    
    // Prevent multiple simultaneous calls
    if (isAnalyzing) {
      console.log('Analysis already in progress, ignoring this call');
      return;
    }
    
    const codeInput = document.querySelector('#code-input');
    const messagesContainer = document.querySelector('#chat-messages');
    const code = codeInput.value.trim();
    
    if (!code) {
      alert('Please paste your code first!');
      return;
    }

    // Store the user's code
    userCode = code;
    console.log('Code stored, length:', code.length);

    // Add code submission message
    const codeMessageDiv = document.createElement('div');
    codeMessageDiv.style.cssText = `
      background: #f0fdf4;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 12px;
      font-size: 14px;
      color: #166534;
      border-left: 4px solid #10b981;
    `;
    codeMessageDiv.innerHTML = `
      ✅ <strong>Code submitted successfully!</strong><br>
      <div style="margin-top: 8px; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; background: white; padding: 8px; border-radius: 4px; font-size: 12px; max-height: 100px; overflow-y: auto; border: 1px solid #d1fae5;">
        ${code.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}
      </div>
      Analyzing your code automatically...
    `;
    messagesContainer.appendChild(codeMessageDiv);

    // Switch to chat mode
    showChatInput();
    // Disable chat input while analyzing
    setChatInputEnabled(false);
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    console.log('About to call autoAnalyzeCode in 1 second...');
    // Add a small delay to prevent rapid API calls
    setTimeout(async () => {
      console.log('Calling autoAnalyzeCode now...');
      await autoAnalyzeCode();
    }, 1000);
  }

  // Auto-analyze code function
  async function autoAnalyzeCode() {
    console.log('autoAnalyzeCode function called');
    
    // Prevent multiple simultaneous API calls
    if (isAnalyzing) {
      console.log('Analysis already in progress, skipping...');
      return;
    }
    
    isAnalyzing = true;
    console.log('Setting isAnalyzing to true');
    
    const messagesContainer = document.querySelector('#chat-messages');
    
    // Add loading indicator for auto-analysis
    const loadingDiv = document.createElement('div');
    loadingDiv.style.cssText = `
      background: #f3f4f6;
      padding: 12px;
      border-radius: 8px 8px 8px 4px;
      margin-bottom: 12px;
      font-size: 14px;
      color: #6b7280;
      display: flex;
      align-items: center;
      gap: 8px;
    `;
    
    // Check if we can make an API call
    if (!canMakeApiCall()) {
      const waitTime = API_CALL_DELAY - (Date.now() - lastApiCall);
      loadingDiv.innerHTML = `⏳ Rate limit active. Next API call available in ${Math.ceil(waitTime/1000)} seconds...`;
      messagesContainer.appendChild(loadingDiv);
      
      // Update countdown
      const countdown = setInterval(() => {
        const remainingTime = API_CALL_DELAY - (Date.now() - lastApiCall);
        if (remainingTime <= 0) {
          clearInterval(countdown);
          loadingDiv.innerHTML = '<div style="width: 16px; height: 16px; border: 2px solid #e5e7eb; border-top: 2px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite;"></div>🔍 Analyzing your code...';
        } else {
          loadingDiv.innerHTML = `⏳ Rate limit active. Next API call available in ${Math.ceil(remainingTime/1000)} seconds...`;
        }
      }, 1000);
      
      // Wait for rate limit to clear
      await new Promise(resolve => setTimeout(resolve, waitTime));
      clearInterval(countdown);
    }
    
    loadingDiv.innerHTML = '<div style="width: 16px; height: 16px; border: 2px solid #e5e7eb; border-top: 2px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite;"></div>🔍 Analyzing your code...';
    if (!messagesContainer.contains(loadingDiv)) {
      messagesContainer.appendChild(loadingDiv);
    }
  
    // Add spinning animation if not exists
    if (!document.querySelector('#spin-animation')) {
      const spinStyle = document.createElement('style');
      spinStyle.id = 'spin-animation';
      spinStyle.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
      document.head.appendChild(spinStyle);
    }
  
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
    try {
      // Queue the API call to respect rate limits
      const result = await queueApiCall(async () => {
        const apiKey = await checkApiKey();
        if (!apiKey) {
          throw new Error('Gemini API key not found. Please set up your Gemini API key in the extension popup first.');
        }
        const model = await getGeminiModel(apiKey);
        const title = getTitleFromCurrentPage();
        const prompt = `Analyze this Leetcode solution for "${title}":\n\n\
${userCode}\n\nProvide brief feedback on:\n1. Correctness - is the logic correct or am i thinking the wrong way\n2. Issues/bugs if the logic is right\n3. Suggestions - how can we rectify the same code\n4. Complexity\n\n give a good response.`;
        // Gemini API call
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              { role: 'user', parts: [{ text: prompt }] }
            ]
          })
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          let errorMessage = `API request failed (${response.status})`;
          if (response.status === 401) {
            errorMessage = 'Invalid Gemini API key. Please check your Gemini API key.';
          } else if (response.status === 429) {
            errorMessage = 'Rate limit exceeded. Please wait and try again, or check your Gemini usage limits.';
          } else if (errorData.error?.message) {
            errorMessage += `: ${errorData.error.message}`;
          }
          throw new Error(errorMessage);
        }
        const data = await response.json();
        // Gemini response: candidates[0].content.parts[0].text
        return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not analyze your code automatically.';
      });
  
      // Remove loading indicator
      loadingDiv.remove();
  
      // Add AI analysis response
      const analysisDiv = document.createElement('div');
      analysisDiv.style.cssText = `
        background: #f0f9ff;
        padding: 14px;
        border-radius: 8px 8px 8px 4px;
        margin-bottom: 12px;
        font-size: 14px;
        color: #0c4a6e;
        white-space: pre-wrap;
        word-wrap: break-word;
        border-left: 4px solid #0ea5e9;
        line-height: 1.5;
      `;
      analysisDiv.innerHTML = `🤖 <strong>Code Analysis:</strong><br><br>${result}`;
      messagesContainer.appendChild(analysisDiv);
  
      // Add follow-up message
      const followUpDiv = document.createElement('div');
      followUpDiv.style.cssText = `
        background: #fefce8;
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 12px;
        font-size: 14px;
        color: #854d0e;
        border-left: 4px solid #eab308;
      `;
      followUpDiv.textContent = '💡 Feel free to ask follow-up questions (note: rate limits apply - 1 question per minute).';
      messagesContainer.appendChild(followUpDiv);
  
    } catch (error) {
      console.error('Error in auto-analysis:', error);
      
      // Remove loading indicator
      loadingDiv.remove();
  
      // Add error message with more specific guidance
      const errorDiv = document.createElement('div');
      errorDiv.style.cssText = `
        background: #fef2f2;
        padding: 12px;
        border-radius: 8px 8px 8px 4px;
        margin-bottom: 12px;
        font-size: 14px;
        color: #dc2626;
        border-left: 4px solid #ef4444;
        line-height: 1.5;
      `;
      
      let errorMessage = error.message;
      if (error.message.includes('Rate limit')) {
        errorMessage += '<br><br><strong>💡 Tips:</strong><br>• Free tier: 3 requests/minute<br>• Wait 2-3 minutes between requests<br>• Consider upgrading to paid plan for higher limits';
      }
      
      errorDiv.innerHTML = `❌ <strong>Analysis failed:</strong> ${errorMessage}`;
      messagesContainer.appendChild(errorDiv);
    } finally {
      // Always reset the flag
      isAnalyzing = false;
      setChatInputEnabled(true); // Re-enable chat input after analysis
      console.log('Setting isAnalyzing to false');
    }
  
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Show chat input from the code input system
  function showChatInput() {
    const codeSection = document.querySelector('#code-input-section');
    const chatSection = document.querySelector('#chat-input-section');
    
    if (codeSection) codeSection.style.display = 'none';
    if (chatSection) chatSection.style.display = 'block';
    
    // Focus chat input
    setTimeout(() => {
      const chatInput = document.querySelector('#chat-input');
      if (chatInput) {
        chatInput.focus();
      }
    }, 100);
  }

  // Show code input (hide chat input)
  function showCodeInput() {
    const codeSection = document.querySelector('#code-input-section');
    const chatSection = document.querySelector('#chat-input-section');
    
    if (codeSection) codeSection.style.display = 'block';
    if (chatSection) chatSection.style.display = 'none';
    
    // Clear previous code
    const codeInput = document.querySelector('#code-input');
    if (codeInput) {
      codeInput.value = userCode; // Pre-fill with current code
      codeInput.focus();
    }
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
      eventListenersAttached = false; // Reset flag when chat is closed
      // Show the icon when chat is closed
      if (chatIcon) {
        chatIcon.style.display = 'block';
      }
    }
  }

  // Get problem title from URL
  function getTitleFromCurrentPage() {
    const match = window.location.pathname.match(/\/problems\/([\w-]+)\//);
    if (!match) return 'Leetcode Problem';

    const slug = match[1];
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Check API key availability
  async function checkApiKey() {
    try {
      const result = await chrome.storage.local.get(['gemini_api_key']);
      const apiKey = result.gemini_api_key || null;
      return apiKey;
    } catch (error) {
      console.error('Error checking Gemini API key:', error);
      return null;
    }
  }
  function canMakeApiCall() {
    const now = Date.now();
    const timeSinceLastCall = now - lastApiCall;
    return timeSinceLastCall >= API_CALL_DELAY;
  }
  function queueApiCall(callFunction) {
    return new Promise((resolve, reject) => {
      apiCallQueue.push({ callFunction, resolve, reject });
      processApiQueue();
    });
  }

  async function processApiQueue() {
    if (isProcessingQueue || apiCallQueue.length === 0) {
      return;
    }
    
    isProcessingQueue = true;
    
    while (apiCallQueue.length > 0) {
      if (!canMakeApiCall()) {
        const waitTime = API_CALL_DELAY - (Date.now() - lastApiCall);
        console.log(`Rate limit: waiting ${Math.ceil(waitTime/1000)} seconds before next API call`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      
      const { callFunction, resolve, reject } = apiCallQueue.shift();
      
      try {
        lastApiCall = Date.now();
        const result = await callFunction();
        resolve(result);
      } catch (error) {
        reject(error);
      }
      
      // Add a small buffer between calls
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    isProcessingQueue = false;
  }

  // Helper to get the best available Gemini model for generateContent
  async function getGeminiModel(apiKey) {
    if (geminiModelName) return geminiModelName;
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
      if (!res.ok) throw new Error('Failed to list Gemini models.');
      const data = await res.json();
      // Exclude deprecated/vision/1.0 models
      const candidates = (data.models || []).filter(m =>
        !/vision|1\.0/i.test(m.name)
        && m.supportedGenerationMethods?.includes('generateContent')
      );
      // Prefer 1.5-flash, then 1.5-pro, then any other
      let best = candidates.find(m => m.name.endsWith('/gemini-1.5-flash'))
        || candidates.find(m => m.name.endsWith('/gemini-1.5-pro'))
        || candidates[0];
      if (!best) throw new Error('No supported Gemini model found for your API key.');
      geminiModelName = best.name.split('/').pop();
      return geminiModelName;
    } catch (err) {
      throw new Error('Could not detect a supported Gemini model for your API key. Please check your key or try again later.');
    }
  }

  // Send message function
  async function sendMessage() {
    const input = document.querySelector('#chat-input');
    const messagesContainer = document.querySelector('#chat-messages');
    const message = input.value.trim();
    
    if (!message) return;

    // Check if user has submitted code
    if (!userCode) {
      const warningDiv = document.createElement('div');
      warningDiv.style.cssText = `
        background: #fef3c7;
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 12px;
        font-size: 14px;
        color: #92400e;
        border-left: 4px solid #f59e0b;
      `;
      warningDiv.textContent = '⚠️ Please submit your code first before asking questions!';
      messagesContainer.appendChild(warningDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      return;
    }

    // Add user message
    const userMessageDiv = document.createElement('div');
    userMessageDiv.style.cssText = `
      background: #667eea;
      color: white;
      padding: 12px;
      border-radius: 8px 8px 4px 8px;
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
      border-radius: 8px 8px 8px 4px;
      margin-bottom: 12px;
      font-size: 14px;
      color: #6b7280;
      display: flex;
      align-items: center;
      gap: 8px;
    `;
    loadingDiv.innerHTML = '<div style="width: 16px; height: 16px; border: 2px solid #e5e7eb; border-top: 2px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite;"></div>🤔 Analyzing your code...';
    messagesContainer.appendChild(loadingDiv);

    // Add spinning animation if not exists
    if (!document.querySelector('#spin-animation')) {
      const spinStyle = document.createElement('style');
      spinStyle.id = 'spin-animation';
      spinStyle.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
      document.head.appendChild(spinStyle);
    }

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
      const apiKey = await checkApiKey();
      if (!apiKey) {
        throw new Error('Gemini API key not found. Please set up your Gemini API key in the extension popup first.');
      }
      const model = await getGeminiModel(apiKey);
      const title = getTitleFromCurrentPage();
      const prompt = `You are an AI coding assistant helping with a Leetcode problem: "${title}".\n\nUser's code:\n\
${userCode}\n\nUser question: ${message}\n\nPlease provide a helpful response that includes:\n1. Analyze if the logic of the code is correct\n2. If correct, identify what issues might exist (syntax, edge cases, efficiency, etc.)\n3. If incorrect, provide specific corrections to the existing code (don't rewrite everything from scratch)\n4. If the approach is completely wrong, suggest trying a different approach\n\nKeep your response concise, actionable, and focused on helping the user solve the problem step by step.`;
      // Gemini API call
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: prompt }] }
          ]
        })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMessage = `API request failed (${response.status})`;
        if (response.status === 401) {
          errorMessage = 'Invalid Gemini API key. Please check your Gemini API key.';
        } else if (response.status === 429) {
          errorMessage = 'Rate limit exceeded. Please wait and try again, or check your Gemini usage limits.';
        } else if (errorData.error?.message) {
          errorMessage += `: ${errorData.error.message}`;
        }
        throw new Error(errorMessage);
      }
      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';

      // Remove loading indicator
      loadingDiv.remove();

      // Add AI response
      const aiMessageDiv = document.createElement('div');
      aiMessageDiv.style.cssText = `
        background: #f3f4f6;
        padding: 12px;
        border-radius: 8px 8px 8px 4px;
        margin-bottom: 12px;
        font-size: 14px;
        color: #374151;
        white-space: pre-wrap;
        word-wrap: break-word;
        border-left: 4px solid #10b981;
        line-height: 1.5;
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
        border-radius: 8px 8px 8px 4px;
        margin-bottom: 12px;
        font-size: 14px;
        color: #dc2626;
        border-left: 4px solid #ef4444;
        line-height: 1.5;
      `;
      errorDiv.innerHTML = `❌ <strong>Error:</strong> ${error.message}`;
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
})();
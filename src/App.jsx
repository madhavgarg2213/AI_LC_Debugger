import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Key, CheckCircle, MessageCircle, Info } from 'lucide-react'
import './App.css'

import { useState, useEffect } from 'react'


function App() {
  const [apiKey, setApiKey] = useState('')
  const [inputKey, setInputKey] = useState('')
  const [isSetup, setIsSetup] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [onLeetCodePage, setOnLeetCodePage] = useState(false);

  // Helper to validate API key
  const validateKey = async (key) => {
    try {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${key}`,
        },
      })
      if (res.status === 401) return false
      return true
    } catch {
      return false
    }
  }

  useEffect(() => {
    // Check if on a LeetCode problem page
    if (window.chrome && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        if (currentTab && currentTab.url) {
          const isProblemPage = /https:\/\/leetcode\.com\/(problems|problem)\/.*/.test(currentTab.url);
          setOnLeetCodePage(isProblemPage);
        }
      });
    }

    // On mount, get key from chrome.storage.local
    if (window.chrome && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['openai_api_key'], async (result) => {
        const savedKey = result.openai_api_key || ''
        if (savedKey) {
          setLoading(true)
          const valid = await validateKey(savedKey)
          setLoading(false)
          if (valid) {
            setApiKey(savedKey)
            setInputKey(savedKey)
            setIsSetup(true)
          } else {
            setError('Invalid API key. Please enter a valid key.')
            setApiKey('')
            setIsSetup(false)
          }
        }
      })
    }
  }, [])

  const handleSaveKey = async () => {
    setError('')
    if (inputKey.trim()) {
      setLoading(true)
      const valid = await validateKey(inputKey.trim())
      setLoading(false)
      if (!valid) {
        setError('Invalid API key. Please enter a valid key.')
        return
      }
      if (window.chrome && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ openai_api_key: inputKey.trim() }, function() {
          if (chrome.runtime.lastError) {
            console.error('Storage error:', chrome.runtime.lastError);
          } else {
            console.log('Key saved successfully');
            setApiKey(inputKey.trim());
            setIsSetup(true);
          }
        })
      }
    }
  }

  const handleOpenApiKeyLink = (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: "https://platform.openai.com/account/api-keys" });
  };

  const handleOpenChat = () => {
    // Send message to background script to toggle chat
    if (onLeetCodePage) {
      chrome.runtime.sendMessage({ action: 'toggleChat' });
    }
  }

  if (isSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md w-full">
          <div className="bg-green-100 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-3">Setup Complete!</h1>
          
          {onLeetCodePage ? (
            <>
              <p className="text-gray-600 mb-6">
                You are on a LeetCode problem page. The AI debugger is ready to help!
              </p>
              <button
                onClick={handleOpenChat}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors mb-4 flex items-center justify-center gap-2"
              >
                🚀 Open Chat
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-600 mb-6">
                Navigate to a LeetCode problem page to activate the AI chat.
              </p>
              <div className="bg-yellow-50 p-4 rounded-lg mb-6 text-yellow-800 flex items-center gap-3">
                <Info className="w-6 h-6 flex-shrink-0" />
                <p className="text-sm text-left">
                  The AI chat feature is only available on LeetCode problem pages.
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">How to use:</h3>
                <ol className="text-sm text-gray-600 space-y-1 text-left">
                  <li>1. Go to any Leetcode problem page</li>
                  <li>2. Look for the 🤖 icon in the bottom-right corner</li>
                  <li>3. Click it to open the AI chat interface</li>
                  <li>4. Ask questions about your code!</li>
                </ol>
              </div>
            </>
          )}
          
          
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="bg-blue-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Key className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">AI Leetcode Debugger</h1>
          <p className="text-gray-600">Enter your OpenAI API key to get started</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OpenAI API Key
            </label>
            <input
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="sk-..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleSaveKey()}
              disabled={loading}
            />
            {error && (
              <p className="text-xs text-red-500 mt-2">{error}</p>
            )}
          </div>
          
          <button
            onClick={handleSaveKey}
            disabled={!inputKey.trim() || loading}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
          >
            {loading ? 'Validating...' : 'Save & Continue'}
          </button>
          
        </div>
        <a 
          href="https://platform.openai.com/account/api-keys" 
          onClick={handleOpenApiKeyLink}
          className='text-sm text-blue-500 hover:underline'
        >
          Get API key
        </a>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>How it works:</strong> After setup, visit any Leetcode problem and the AI debugger will help you optimize and debug your solutions automatically.
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
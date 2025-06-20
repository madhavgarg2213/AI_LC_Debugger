import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Key, CheckCircle } from 'lucide-react'
import './App.css'

import { useState, useEffect } from 'react'

function App() {
  const [apiKey, setApiKey] = useState('')
  const [inputKey, setInputKey] = useState('')
  const [isSetup, setIsSetup] = useState(false)

  useEffect(() => {
    const savedKey = sessionStorage.getItem('openai_api_key') || ''
    if (savedKey) {
      setApiKey(savedKey)
      setIsSetup(true)
    }
  }, [])

  const handleSaveKey = () => {
    if (inputKey.trim()) {
      // In real extension, use localStorage
      sessionStorage.setItem('openai_api_key', inputKey.trim())
      setApiKey(inputKey.trim())
      setIsSetup(true)
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
          <p className="text-gray-600 mb-6">
            Thank you for configuring your API key. Your AI Leetcode Debugger is now ready to use.
          </p>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-blue-800">
              <strong>Next:</strong> Visit any Leetcode problem page and the debugger will automatically assist you with your solutions.
            </p>
          </div>
          
          <p className="text-gray-500 text-sm">
            You can now close this tab. Happy coding! 🚀
          </p>
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
            />
            {/* <p className="text-xs text-gray-500 mt-2">
              Your API key is stored locally and never shared with third parties
            </p> */}
          </div>
          
          <button
            onClick={handleSaveKey}
            disabled={!inputKey.trim()}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
          >
            Save & Continue
          </button>
        </div>
        
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
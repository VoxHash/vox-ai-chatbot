import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { io } from 'socket.io-client'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export default function App() {
  const [email, setEmail] = useState('test@example.com')
  const [password, setPassword] = useState('Passw0rd!')
  const [token, setToken] = useState('')
  const [userId, setUserId] = useState(null)
  const [message, setMessage] = useState('Hello!')
  const [conversationId, setConversationId] = useState(null)
  const [log, setLog] = useState([])
  const [typing, setTyping] = useState(false)

  const socket = useMemo(() => io(API_URL, { transports: ['websocket'] }), [])

  useEffect(() => {
    socket.on('connect', () => console.log('socket connected'))
    socket.on('chat:message', (msg) => setLog((l) => [...l, msg]))
    socket.on('chat:typing', (s) => setTyping(!!s.typing))
    return () => { socket.close() }
  }, [socket])

  async function login() {
    try {
      const r = await axios.post(`${API_URL}/api/auth/login`, { email, password })
      setToken(r.data.tokens.access)
      setUserId(r.data.user.id)
      console.log('Login successful:', r.data.user)
    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message)
      alert('Login failed: ' + (error.response?.data?.error || error.message))
    }
  }

  async function send() {
    if (!token) { alert('login first'); return }
    if (!userId) { alert('user not found'); return }
    socket.emit('chat:send', { conversationId, message, userId }, (resp) => {
      if (resp?.error) return alert(resp.error)
      setConversationId(resp.conversationId)
      setLog((l) => [...l, { conversationId: resp.conversationId, sender: 'user', content: message }])
      setLog((l) => [...l, { conversationId: resp.conversationId, sender: 'assistant', content: resp.reply }])
      setMessage('')
    })
  }

  return (
    <div className="min-h-screen flex flex-col cyber-grid relative">
      {/* Scan line effect */}
      <div className="scan-line"></div>
      
      {/* Header */}
      <header className="p-6 border-b-2 border-cyan-400 cyber-border-glow flex items-center justify-between bg-black/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
          <h1 className="cyber-title text-2xl">HashBot</h1>
          <div className="text-xs text-cyan-400 font-mono">
            {userId ? `USER_ID: ${userId}` : 'OFFLINE'}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-2">
            <input 
              className="cyber-input px-3 py-2 rounded text-sm w-48" 
              value={email} 
              onChange={e=>setEmail(e.target.value)}
              placeholder="EMAIL_ADDRESS"
            />
            <input 
              className="cyber-input px-3 py-2 rounded text-sm w-48" 
              type="password" 
              value={password} 
              onChange={e=>setPassword(e.target.value)}
              placeholder="PASSWORD"
            />
          </div>
          <button 
            className="cyber-button px-4 py-2 rounded text-sm"
            onClick={login}
          >
            {token ? 'LOGGED_IN' : 'LOGIN'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 grid md:grid-cols-4 relative">
        {/* Sidebar */}
        <aside className="border-r-2 border-cyan-400 p-6 md:col-span-1 bg-black/30 backdrop-blur-sm">
          <div className="space-y-4">
            <div className="cyber-border-glow p-3 rounded">
              <div className="text-xs text-cyan-400 font-mono mb-2">SESSION_INFO</div>
              <div className="text-sm text-green-400 font-mono">
                CONV_ID: {conversationId || 'NULL'}
              </div>
            </div>
            
            <div className="cyber-border-glow p-3 rounded">
              <div className="text-xs text-cyan-400 font-mono mb-2">STATUS</div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${token ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                <span className="text-xs text-green-400 font-mono">
                  {token ? 'AUTHENTICATED' : 'UNAUTHENTICATED'}
                </span>
              </div>
            </div>

            <div className="cyber-border-glow p-3 rounded">
              <div className="text-xs text-cyan-400 font-mono mb-2">SYSTEM</div>
              <div className="text-xs text-purple-400 font-mono">
                AI_ASSISTANT: VOX
              </div>
              <div className="text-xs text-purple-400 font-mono">
                MODEL: VOX 0.0.1
              </div>
              <div className="text-xs text-purple-400 font-mono">
                STATUS: ONLINE
              </div>
              <div className="text-xs text-green-400 font-mono">
                PRIVACY: 100% LOCAL
              </div>
            </div>
          </div>
        </aside>

        {/* Chat Area */}
        <section className="p-6 md:col-span-3 flex flex-col bg-black/20 backdrop-blur-sm">
          {/* Messages */}
          <div className="flex-1 overflow-auto space-y-4 mb-6 scrollbar-thin scrollbar-thumb-cyan-400 scrollbar-track-gray-800 hover:scrollbar-thumb-cyan-300">
            {log.map((m,i)=>(
              <div 
                key={i} 
                className={`max-w-2xl px-4 py-3 rounded cyber-message ${
                  m.sender==='user' ? 'user ml-auto' : 'assistant'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${
                    m.sender==='user' ? 'bg-green-400' : 'bg-purple-400'
                  }`}></div>
                  <div className="text-xs font-mono text-cyan-400">
                    {m.sender==='user' ? 'USER' : 'VOX'}
                  </div>
                  <div className="text-xs font-mono text-gray-500">
                    {new Date().toLocaleTimeString()}
                  </div>
                </div>
                <div className="text-cyan-100 font-mono text-sm leading-relaxed">
                  {m.content}
                </div>
              </div>
            ))}
            
            {typing && (
              <div className="cyber-message assistant max-w-2xl px-4 py-3 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
                  <div className="text-xs font-mono text-cyan-400">VOX</div>
                </div>
                <div className="typing-indicator text-sm font-mono">
                  PROCESSING_NEURAL_RESPONSE...
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="cyber-border-glow p-4 rounded bg-black/50 backdrop-blur-sm">
            <div className="flex gap-3">
              <input 
                className="cyber-input flex-1 px-4 py-3 rounded font-mono text-sm" 
                value={message} 
                onChange={e=>setMessage(e.target.value)} 
                placeholder="ENTER_NEURAL_QUERY..."
                onKeyPress={(e) => e.key === 'Enter' && send()}
              />
              <button 
                className="cyber-button px-6 py-3 rounded font-mono text-sm"
                onClick={send}
                disabled={!token || !message.trim()}
              >
                TRANSMIT
              </button>
            </div>
            <div className="text-xs text-gray-500 font-mono mt-2">
              PRESS_ENTER_TO_SEND | STATUS: {token ? 'READY' : 'AUTH_REQUIRED'}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

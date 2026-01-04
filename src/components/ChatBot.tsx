'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'

interface Message {
    id: number
    text: string
    sender: 'user' | 'bot'
}

export default function ChatBot() {
    const pathname = usePathname()
    // Don't show on login page or landing page (optional, but good for UX)
    // Actually user might want it everywhere. Let's keep it everywhere except maybe login.

    // Hidden on login page
    if (pathname === '/login') return null

    const [isOpen, setIsOpen] = useState(false)
    const [input, setInput] = useState('')
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: 'Hi! I can help you find student details. Try typing "Search [Name]" or "Roll 12".', sender: 'bot' }
    ])
    const [loading, setLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        if (isOpen) scrollToBottom()
    }, [messages, isOpen])

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim()) return

        const userMsg: Message = { id: Date.now(), text: input, sender: 'user' }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setLoading(true)

        try {
            const res = await fetch('/api/bot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: userMsg.text })
            })
            const data = await res.json()

            const botMsg: Message = { id: Date.now() + 1, text: data.text, sender: 'bot' }
            setMessages(prev => [...prev, botMsg])
        } catch (error) {
            setMessages(prev => [...prev, { id: Date.now() + 1, text: "Sorry, I'm having trouble connecting.", sender: 'bot' }])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            zIndex: 1000,
            fontFamily: 'sans-serif'
        }}>
            {/* Chat Window */}
            {isOpen && (
                <div style={{
                    width: '350px',
                    height: '500px',
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 5px 20px rgba(0,0,0,0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    marginBottom: '1rem',
                    overflow: 'hidden',
                    border: '1px solid #e0e0e0'
                }}>
                    {/* Header */}
                    <div style={{
                        background: '#2d3436',
                        color: 'white',
                        padding: '1rem',
                        borderBottom: '1px solid #eee',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <h3 style={{ margin: 0, fontSize: '1rem' }}>Student Assistant</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}
                        >
                            ×
                        </button>
                    </div>

                    {/* Messages */}
                    <div style={{
                        flex: 1,
                        padding: '1rem',
                        overflowY: 'auto',
                        background: '#f5f6fa',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.8rem'
                    }}>
                        {messages.map(msg => (
                            <div key={msg.id} style={{
                                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '85%',
                                background: msg.sender === 'user' ? '#0984e3' : 'white',
                                color: msg.sender === 'user' ? 'white' : '#2d3436',
                                padding: '0.8rem 1rem',
                                borderRadius: '12px',
                                borderBottomRightRadius: msg.sender === 'user' ? '2px' : '12px',
                                borderTopLeftRadius: msg.sender === 'bot' ? '2px' : '12px',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                fontSize: '0.9rem',
                                whiteSpace: 'pre-wrap',
                                lineHeight: '1.4'
                            }}>
                                {msg.text}
                            </div>
                        ))}
                        {loading && (
                            <div style={{ alignSelf: 'flex-start', color: '#636e72', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                                Typing...
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} style={{
                        padding: '0.8rem',
                        background: 'white',
                        borderTop: '1px solid #eee',
                        display: 'flex',
                        gap: '0.5rem'
                    }}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about a student..."
                            style={{
                                flex: 1,
                                padding: '0.6rem 1rem',
                                borderRadius: '20px',
                                border: '1px solid #dfe6e9',
                                outline: 'none',
                                fontSize: '0.9rem'
                            }}
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            style={{
                                background: '#0984e3',
                                color: 'white',
                                border: 'none',
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.2rem'
                            }}
                        >
                            ➤
                        </button>
                    </form>
                </div>
            )}

            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: '#0984e3',
                        color: 'white',
                        border: 'none',
                        boxShadow: '0 4px 15px rgba(9, 132, 227, 0.4)',
                        cursor: 'pointer',
                        fontSize: '1.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    💬
                </button>
            )}
        </div>
    )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const router = useRouter()
    const [credentials, setCredentials] = useState({ username: '', password: '' })
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            })

            if (res.ok) {
                router.push('/dashboard')
                router.refresh()
            } else {
                setError('Invalid username or password')
            }
        } catch (err) {
            setError('Login failed')
        }
    }

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: '#ecf0f1'
        }}>
            <div style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                width: '100%',
                maxWidth: '400px'
            }}>
                <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#2c3e50' }}>System Login</h1>

                {error && <div style={{
                    color: 'white',
                    background: '#e74c3c',
                    padding: '0.75rem',
                    borderRadius: '4px',
                    marginBottom: '1rem',
                    textAlign: 'center'
                }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#34495e' }}>Username</label>
                        <input
                            type="text"
                            required
                            value={credentials.username}
                            onChange={e => setCredentials({ ...credentials, username: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #bdc3c7',
                                borderRadius: '4px'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#34495e' }}>Password</label>
                        <input
                            type="password"
                            required
                            value={credentials.password}
                            onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #bdc3c7',
                                borderRadius: '4px'
                            }}
                        />
                    </div>

                    <button type="submit" style={{
                        background: '#3498db',
                        color: 'white',
                        padding: '0.75rem',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        marginTop: '1rem',
                        fontWeight: 'bold'
                    }}>
                        Login
                    </button>

                    <a href="/" style={{ textAlign: 'center', color: '#7f8c8d', textDecoration: 'none', fontSize: '0.9rem' }}>
                        &larr; Back to Home
                    </a>
                </form>
            </div>
        </div>
    )
}

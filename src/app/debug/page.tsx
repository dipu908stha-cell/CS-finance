'use client'

import { useState, useEffect } from 'react'

export default function DebugPage() {
    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/debug')
            .then(res => res.json())
            .then(data => {
                setResult(data)
                setLoading(false)
            })
            .catch(err => {
                setResult({ status: 'Fetch Error', message: err.message })
                setLoading(false)
            })
    }, [])

    return (
        <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
            <h1>Database Connection Test</h1>
            {loading && <p>Testing connection...</p>}
            {result && (
                <div style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    background: result.status === 'Success' ? '#d4edda' : '#f8d7da',
                    color: result.status === 'Success' ? '#155724' : '#721c24'
                }}>
                    <h2>Status: {result.status}</h2>
                    <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(result, null, 2)}</pre>
                </div>
            )}
        </div>
    )
}

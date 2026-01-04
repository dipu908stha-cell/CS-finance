'use client'

import Link from 'next/link'

export default function LandingPage() {
    return (
        <div style={{ fontFamily: 'sans-serif' }}>
            {/* Navbar */}
            <nav style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 2rem',
                background: '#2c3e50',
                color: 'white'
            }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>CS School and College</div>
                <div>
                    <Link href="/login" style={{
                        color: 'white',
                        textDecoration: 'none',
                        background: '#e74c3c',
                        padding: '0.5rem 1.5rem',
                        borderRadius: '4px'
                    }}>
                        Login to System
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <header style={{
                textAlign: 'center',
                padding: '5rem 2rem',
                background: '#ecf0f1'
            }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#2c3e50' }}>Welcome to CS School and College</h1>
                <p style={{ fontSize: '1.2rem', color: '#7f8c8d' }}>Empowering Minds, Shaping Futures.</p>
            </header>

            {/* Programs Section */}
            <section style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
                <h2 style={{ textAlign: 'center', width: '100%', marginBottom: '3rem', color: '#2c3e50' }}>Our Academic Programs</h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '2rem'
                }}>
                    {/* Hotel Management */}
                    <div style={{ padding: '2rem', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' }}>
                        <h3 style={{ color: '#e67e22', marginBottom: '1rem' }}>Hotel Management</h3>
                        <p>Specialized program focusing purely on Hotel Management. No Account or Economics required.</p>
                    </div>

                    {/* Computer Science */}
                    <div style={{ padding: '2rem', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' }}>
                        <h3 style={{ color: '#2980b9', marginBottom: '1rem' }}>Computer Science</h3>
                        <p>Comprehensive curriculum covering programming, algorithms, and modern technologies.</p>
                    </div>

                    {/* Business Studies */}
                    <div style={{ padding: '2rem', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' }}>
                        <h3 style={{ color: '#27ae60', marginBottom: '1rem' }}>Business Studies</h3>
                        <p>Prepare for the corporate world with our advanced business and management courses.</p>
                    </div>

                    {/* Humanities */}
                    <div style={{ padding: '2rem', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' }}>
                        <h3 style={{ color: '#8e44ad', marginBottom: '1rem' }}>Humanities</h3>
                        <p>Explore arts, social sciences, and critical thinking in our diverse humanities stream.</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{
                padding: '2rem',
                textAlign: 'center',
                background: '#2c3e50',
                color: 'white',
                marginTop: 'auto'
            }}>
                <p>&copy; 2026 CS School and College. All rights reserved.</p>
            </footer>
        </div>
    )
}

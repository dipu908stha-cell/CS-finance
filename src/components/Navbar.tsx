'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

export default function Navbar() {
    const router = useRouter()
    const pathname = usePathname()

    // Don't show navbar on public landing page or login page
    if (pathname === '/' || pathname === '/login') return null

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        router.push('/login')
        router.refresh()
    }

    return (
        <nav className="navbar" style={{
            background: 'white',
            borderBottom: '1px solid #eaeaea',
            padding: '1rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            <style jsx global>{`
                @media print {
                    nav {
                        display: none !important;
                    }
                }
            `}</style>
            <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#333' }}>
                BillingSystem
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <NavLink href="/dashboard">Dashboard</NavLink>
                <NavLink href="/students">Students</NavLink>
                <NavLink href="/fees">Packages</NavLink>
                <NavLink href="/assignments">Assignments</NavLink>
                <NavLink href="/payments">Payments</NavLink>
                <NavLink href="/exams">Exams</NavLink>
                <button
                    onClick={handleLogout}
                    style={{
                        background: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    Logout
                </button>
            </div>
        </nav>
    )
}

function NavLink({ href, children }: { href: string, children: React.ReactNode }) {
    return (
        <Link href={href} style={{
            textDecoration: 'none',
            color: '#555',
            fontWeight: 500,
            transition: 'color 0.2s'
        }}>
            {children}
        </Link>
    )
}

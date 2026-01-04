import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'Billing System',
    description: 'Advanced Billing System for Grade 11 & 12',
}

import Navbar from '@/components/Navbar'
import ChatBot from '@/components/ChatBot'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>
                {/* <Navbar /> */}
                {children}
                {/* <ChatBot /> */}
            </body>
        </html>
    )
}

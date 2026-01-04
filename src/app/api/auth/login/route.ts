import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { username, password } = body

        // Hardcoded single credential as requested
        if (username === 'admin' && password === 'admin123') {
            const response = NextResponse.json({ success: true })

            // Set simple auth cookie
            response.cookies.set('auth_token', 'valid_session', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 // 1 day
            })

            return response
        }

        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname

    // Define protected routes
    const protectedRoutes = [
        '/dashboard',
        '/students',
        '/fees',
        '/exams',
        '/payments',
        '/reports',
        '/assignments',
        '/receipts'
    ]

    const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
    const authToken = request.cookies.get('auth_token')

    if (isProtectedRoute && !authToken) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Redirect to dashboard if logged in and accessing login page
    if (path === '/login' && authToken) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}

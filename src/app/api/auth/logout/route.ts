import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST() {
    const response = NextResponse.json({ success: true })
    response.cookies.delete('auth_token')
    return response
}

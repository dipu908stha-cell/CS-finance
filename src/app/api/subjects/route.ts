import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const subjects = await prisma.subject.findMany()
        return NextResponse.json(subjects)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const subject = await prisma.subject.create({
            data: {
                name: body.name,
                code: body.code,
                stream: body.stream || null
            }
        })
        return NextResponse.json(subject)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to create subject' }, { status: 500 })
    }
}

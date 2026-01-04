import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const packages = await prisma.feePackage.findMany({
            orderBy: { id: 'desc' }
        })
        return NextResponse.json(packages)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch fee packages' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const pkg = await prisma.feePackage.create({
            data: {
                name: body.name,
                grade: body.grade, // '11' or '12'
                totalAmount: parseFloat(body.totalAmount),
                breakdown: body.breakdown
            }
        })
        return NextResponse.json(pkg)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to create fee package' }, { status: 500 })
    }
}

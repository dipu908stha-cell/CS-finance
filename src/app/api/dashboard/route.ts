import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const assignments = await prisma.studentFeeMap.findMany()
        const payments = await prisma.payment.findMany()

        const totalRevenue = assignments.reduce((sum, a) => sum + a.finalAmount, 0)
        const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0)
        const totalOutstanding = totalRevenue - totalCollected

        const today = new Date().toISOString().split('T')[0]
        const todayCollection = payments
            .filter(p => p.date.toISOString().split('T')[0] === today)
            .reduce((sum, p) => sum + p.amount, 0)

        return NextResponse.json({
            totalRevenue,
            totalCollected,
            totalOutstanding,
            todayCollection
        })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
    }
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const assignments = await prisma.studentFeeMap.findMany({
            include: {
                student: true,
                feePackage: true
            },
            orderBy: { id: 'desc' }
        })
        return NextResponse.json(assignments)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()

        // Fetch package to get total amount
        const feePackage = await prisma.feePackage.findUnique({
            where: { id: parseInt(body.packageId) }
        })

        if (!feePackage) {
            return NextResponse.json({ error: 'Package not found' }, { status: 404 })
        }

        const discount = parseFloat(body.discount || '0')
        const finalAmount = feePackage.totalAmount - discount

        const assignment = await prisma.studentFeeMap.create({
            data: {
                studentId: parseInt(body.studentId),
                packageId: parseInt(body.packageId),
                totalFee: feePackage.totalAmount,
                discount: discount,
                finalAmount: finalAmount,
                paymentMode: body.paymentMode
            }
        })

        return NextResponse.json(assignment)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to assign fee' }, { status: 500 })
    }
}

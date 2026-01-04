import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')

    try {
        const where = studentId ? { studentId: parseInt(studentId) } : {}
        const payments = await prisma.payment.findMany({
            where,
            include: {
                student: true,
                installment: true
            },
            orderBy: { id: 'desc' }
        })
        return NextResponse.json(payments)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()

        // Create Payment
        const payment = await prisma.payment.create({
            data: {
                studentId: parseInt(body.studentId),
                installmentId: body.installmentId ? parseInt(body.installmentId) : null,
                amount: parseFloat(body.amount),
                method: body.method,
                receivedBy: body.receivedBy,
                remarks: body.remarks,
                date: body.paymentDate ? new Date(body.paymentDate) : new Date()
            }
        })

        // Update Installment Status if applicable
        if (body.installmentId) {
            const installment = await prisma.installment.findUnique({
                where: { id: parseInt(body.installmentId) },
                include: { payments: true } // Fetch all payments for this installment to calc total valid paid
            })

            if (installment) {
                // Calculate total paid for this installment
                const totalPaidForInstallment = installment.payments.reduce((sum, p) => sum + p.amount, 0) + parseFloat(body.amount)
                // Wait, the new payment is already created, so if I include payments: true, does it include the new one?
                // Yes, if I fetch it *after* creation.

                // Actually, let's fetch again
                const freshInstallment = await prisma.installment.findUnique({
                    where: { id: parseInt(body.installmentId) },
                    include: { payments: true }
                })

                if (freshInstallment) {
                    const totalPaid = freshInstallment.payments.reduce((sum, p) => sum + p.amount, 0)
                    let newStatus = 'Partial'
                    if (totalPaid >= freshInstallment.amount) {
                        newStatus = 'Paid'
                    }

                    await prisma.installment.update({
                        where: { id: freshInstallment.id },
                        data: { status: newStatus }
                    })
                }
            }
        }

        return NextResponse.json(payment)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 })
    }
}

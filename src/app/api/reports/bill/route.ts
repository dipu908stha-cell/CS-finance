import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')

    if (!studentId) return NextResponse.json({ error: 'Missing studentId' }, { status: 400 })

    try {
        const student = await prisma.student.findUnique({
            where: { id: parseInt(studentId) },
            include: { feeAssignments: { include: { feePackage: true } }, payments: true }
        })

        if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

        // Calculate Financials
        const totalFee = student.feeAssignments.reduce((sum, assign) => sum + assign.totalFee, 0)
        const discount = student.feeAssignments.reduce((sum, assign) => sum + assign.discount, 0)
        const paid = student.payments.reduce((sum, p) => sum + p.amount, 0)
        const due = (totalFee - discount) - paid

        const packages = student.feeAssignments.map(assign => ({
            id: assign.id,
            name: assign.feePackage.name,
            breakdown: assign.feePackage.breakdown, // Include description/breakdown
            totalFee: assign.totalFee,
            discount: assign.discount,
            netAmount: assign.finalAmount
        }))

        return NextResponse.json({
            student: {
                id: student.id,
                fullName: student.fullName,
                grade: student.grade,
                stream: student.stream,
                registrationNo: (student as any).registrationNo,
                rollNo: student.rollNo,
                section: student.section
            },
            packages, // Return list of packages
            summary: {
                totalFee,
                discount,
                paid,
                due
            }
        })

    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to fetch bill' }, { status: 500 })
    }
}

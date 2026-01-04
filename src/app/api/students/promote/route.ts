import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { studentIds, newGrade, newAcademicYear } = body

        if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
            return NextResponse.json({ error: 'No students selected' }, { status: 400 })
        }

        if (!newGrade || !newAcademicYear) {
            return NextResponse.json({ error: 'New grade and academic year are required' }, { status: 400 })
        }

        // Bulk update
        const result = await prisma.student.updateMany({
            where: {
                id: { in: studentIds }
            },
            data: {
                grade: newGrade,
                academicYear: newAcademicYear
            }
        })

        return NextResponse.json({
            success: true,
            count: result.count,
            message: `Successfully promoted ${result.count} students to Grade ${newGrade}`
        })

    } catch (error) {
        console.error('Promotion Error:', error)
        return NextResponse.json({ error: 'Failed to promote students' }, { status: 500 })
    }
}

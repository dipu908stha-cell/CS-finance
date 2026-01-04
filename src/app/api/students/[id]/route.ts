import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params
        const id = parseInt(idStr)
        await prisma.student.delete({
            where: { id }
        })
        return NextResponse.json({ message: 'Deleted successfully' })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 })
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params
        const id = parseInt(idStr)
        const body = await request.json()
        const student = await prisma.student.update({
            where: { id },
            data: {
                fullName: body.fullName,
                grade: body.grade,
                stream: body.stream,
                section: body.section,
                rollNo: body.rollNo,
                academicYear: body.academicYear,
                parentName: body.parentName,
                parentContact: body.parentContact,
                address: body.address,
                dob: body.dob ? new Date(body.dob) : null,
                status: body.status
            }
        })
        return NextResponse.json(student)
    } catch (error: any) {
        console.error('Error updating student:', error)
        return NextResponse.json({ error: 'Failed to update student', details: error.message }, { status: 500 })
    }
}

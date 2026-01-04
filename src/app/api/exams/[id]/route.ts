import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params
        const id = parseInt(idStr)
        await prisma.exam.delete({
            where: { id }
        })
        return NextResponse.json({ message: 'Deleted successfully' })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to delete exam' }, { status: 500 })
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params
        const id = parseInt(idStr)
        const body = await request.json()
        const exam = await prisma.exam.update({
            where: { id },
            data: {
                name: body.name,
                startDate: new Date(body.startDate)
            }
        })
        return NextResponse.json(exam)
    } catch (error) {
        console.error('Error updating exam:', error)
        return NextResponse.json({ error: 'Failed to update exam' }, { status: 500 })
    }
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params
        const id = parseInt(idStr)
        await prisma.feePackage.delete({
            where: { id }
        })
        return NextResponse.json({ message: 'Deleted successfully' })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to delete fee package' }, { status: 500 })
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params
        const id = parseInt(idStr)
        const body = await request.json()
        const pkg = await prisma.feePackage.update({
            where: { id },
            data: {
                name: body.name,
                grade: body.grade,
                totalAmount: parseFloat(body.totalAmount),
                breakdown: body.breakdown
            }
        })
        return NextResponse.json(pkg)
    } catch (error) {
        console.error('Error updating fee package:', error)
        return NextResponse.json({ error: 'Failed to update fee package' }, { status: 500 })
    }
}

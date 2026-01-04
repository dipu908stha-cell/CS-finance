import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params
        const id = parseInt(idStr)
        await prisma.studentFeeMap.delete({
            where: { id }
        })
        return NextResponse.json({ message: 'Deleted successfully' })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to delete assignment' }, { status: 500 })
    }
}

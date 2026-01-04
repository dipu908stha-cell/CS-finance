import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export async function GET() {
    try {
        await prisma.$connect()
        // Try a simple query
        const studentCount = await prisma.student.count()
        return NextResponse.json({
            status: 'Success',
            message: 'Connected to Database!',
            studentCount
        })
    } catch (error: any) {
        return NextResponse.json({
            status: 'Error',
            message: error.message,
            code: error.code,
            meta: error.meta
        }, { status: 500 })
    } finally {
        await prisma.$disconnect()
    }
}

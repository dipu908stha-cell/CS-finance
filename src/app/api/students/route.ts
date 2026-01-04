import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const students = await prisma.student.findMany({
            orderBy: { id: 'desc' }
        })
        return NextResponse.json(students)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        // Generate 6-digit Registration No (YY + 4 random digits for simplicity)
        const yearPrefix = new Date().getFullYear().toString().slice(-2)
        const randomSuffix = Math.floor(1000 + Math.random() * 9000)
        const regNo = `${yearPrefix}${randomSuffix}`

        const student = await prisma.student.create({
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
                registrationNo: regNo,
                admissionDate: body.admissionDate ? new Date(body.admissionDate) : new Date(),
                status: body.status || "Active"
            }
        })
        return NextResponse.json(student)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to create student' }, { status: 500 })
    }
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const exams = await prisma.exam.findMany({
            include: {
                subjects: {
                    include: {
                        subject: true
                    }
                }
            },
            orderBy: { id: 'desc' }
        })
        return NextResponse.json(exams)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch exams' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        // Body: { name, startDate, subjects: [{ subjectId, fullMarks, passMarks }] }

        // Transaction to create Exam and link Subjects
        const exam = await prisma.$transaction(async (tx) => {
            const newExam = await tx.exam.create({
                data: {
                    name: body.name,
                    startDate: new Date(body.startDate),
                    endDate: body.endDate ? new Date(body.endDate) : null
                }
            })

            // Link subjects
            if (body.subjects && body.subjects.length > 0) {
                await tx.examSubject.createMany({
                    data: body.subjects.map((sub: any) => ({
                        examId: newExam.id,
                        subjectId: parseInt(sub.subjectId),
                        fullMarks: parseFloat(sub.fullMarks),
                        passMarks: parseFloat(sub.passMarks)
                    }))
                })
            }
            return newExam
        })

        return NextResponse.json(exam)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to create exam' }, { status: 500 })
    }
}

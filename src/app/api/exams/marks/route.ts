import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const examId = searchParams.get('examId')
    const subjectId = searchParams.get('subjectId')

    if (!examId || !subjectId) {
        return NextResponse.json([])
    }

    try {
        // Find ExamSubject ID
        const examSubject = await prisma.examSubject.findFirst({
            where: {
                examId: parseInt(examId),
                subjectId: parseInt(subjectId)
            }
        })

        if (!examSubject) return NextResponse.json([])

        const marks = await prisma.studentMark.findMany({
            where: { examSubjectId: examSubject.id },
            include: { student: true }
        })
        return NextResponse.json(marks)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch marks' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        // Body: { examId, subjectId, marks: [{ studentId, obtained, remarks }] }

        const examSubject = await prisma.examSubject.findFirst({
            where: {
                examId: parseInt(body.examId),
                subjectId: parseInt(body.subjectId)
            }
        })

        if (!examSubject) return NextResponse.json({ error: 'Subject not in Exam' }, { status: 400 })

        // Upsert marks
        const ops = body.marks.map((m: any) => {
            return prisma.studentMark.upsert({
                where: {
                    // We need a unique constraint really, but StudentMark doesn't have one defined in schema yet on (studentId, examSubjectId)
                    // We will rely on finding first for now or just createMany if we wipe? 
                    // Properly we should have @@unique([studentId, examSubjectId])
                    // Since we don't, we'll delete existing for this student+examSubject and create new specific
                    id: m.id || -1
                },
                update: {
                    obtainedMarks: parseFloat(m.obtained),
                    remarks: m.remarks
                },
                create: {
                    studentId: parseInt(m.studentId),
                    examSubjectId: examSubject.id,
                    obtainedMarks: parseFloat(m.obtained),
                    remarks: m.remarks
                }
            })
        })

        // Wait, upsert requires a unique field. We only have ID.
        // Let's change strategy: Delete all previous for these students in this examSubject to be safe, then Create.
        // Or better: Use user logic to handle updates.

        // Simplest robust way without unique constraint:
        // Process one by one. Check if exists.

        for (const m of body.marks) {
            const existing = await prisma.studentMark.findFirst({
                where: {
                    studentId: parseInt(m.studentId),
                    examSubjectId: examSubject.id
                }
            })

            if (existing) {
                await prisma.studentMark.update({
                    where: { id: existing.id },
                    data: { obtainedMarks: parseFloat(m.obtained), remarks: m.remarks }
                })
            } else {
                await prisma.studentMark.create({
                    data: {
                        studentId: parseInt(m.studentId),
                        examSubjectId: examSubject.id,
                        obtainedMarks: parseFloat(m.obtained),
                        remarks: m.remarks
                    }
                })
            }
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to save marks' }, { status: 500 })
    }
}

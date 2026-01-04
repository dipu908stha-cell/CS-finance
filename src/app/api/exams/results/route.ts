import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const examId = searchParams.get('examId')

    if (!examId) return NextResponse.json([])

    try {
        // 1. Fetch Exam with all Subjects
        const exam = await prisma.exam.findUnique({
            where: { id: parseInt(examId) },
            include: { subjects: { include: { subject: true } } }
        })

        if (!exam) return NextResponse.json([])

        // 2. Fetch all marks for this exam's subjects
        const subjectIds = exam.subjects.map(s => s.id)
        const marks = await prisma.studentMark.findMany({
            where: { examSubjectId: { in: subjectIds } },
            include: { student: true, examSubject: true }
        })

        // 3. Group by Student
        const studentResults: any = {}

        marks.forEach(mark => {
            if (!studentResults[mark.studentId]) {
                studentResults[mark.studentId] = {
                    student: mark.student,
                    results: []
                }
            }
            studentResults[mark.studentId].results.push(mark)
        })

        // 4. Return formatted response
        const formatted = Object.values(studentResults).map((item: any) => {
            return {
                student: item.student,
                marks: item.results
            }
        })

        return NextResponse.json(formatted)

    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 })
    }
}

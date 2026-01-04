import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
    try {
        const { query } = await request.json()
        const lowerQuery = query.toLowerCase()

        let responseText = "I couldn't find anyone matching that."
        let students: any[] = []

        // Logic 1: Search by Roll Number (e.g., "roll 12", "roll no 12")
        const rollMatch = lowerQuery.match(/roll\s*(?:no\.?|number)?\s*(\d+)/)
        if (rollMatch) {
            const rollNo = rollMatch[1]
            const student = await prisma.student.findFirst({
                where: { rollNo: rollNo },
                include: { feeAssignments: { include: { feePackage: true } }, payments: true }
            })
            if (student) students = [student]
        }
        // Logic 2: Search by Name (Default fallback if not a command)
        else {
            // Remove common filler words
            const cleanName = lowerQuery.replace(/search|find|details|of|student|about/g, '').trim()
            if (cleanName.length > 0) {
                students = await prisma.student.findMany({
                    where: {
                        fullName: { contains: cleanName } // Case insensitive is default in some DBs, but Prisma depends on provider. sqlite is case-insensitive usually.
                    },
                    include: { feeAssignments: { include: { feePackage: true } }, payments: true },
                    take: 5
                })
            }
        }

        if (students.length > 0) {
            if (students.length === 1) {
                const s = students[0]
                const totalFee = s.feeAssignments.reduce((sum: number, a: any) => sum + a.finalAmount, 0)
                const totalPaid = s.payments.reduce((sum: number, p: any) => sum + p.amount, 0)
                const due = totalFee - totalPaid

                responseText = `Found Student:\n**${s.fullName}**\nClass: ${s.grade} (${s.stream})\nRoll No: ${s.rollNo}\nReg No: ${s.registrationNo || 'N/A'}\n\n**Financials:**\nTotal Fee: Rs ${totalFee}\nPaid: Rs ${totalPaid}\nDue: Rs ${due}`
            } else {
                responseText = `I found ${students.length} students matching that name:\n` + students.map(s => `- ${s.fullName} (Class ${s.grade})`).join('\n') + `\n\nPlease be more specific (e.g., "details of ${students[0].fullName}").`
            }
        }

        return NextResponse.json({ text: responseText })

    } catch (error) {
        console.error('Bot Error:', error)
        return NextResponse.json({ text: "Sorry, I encountered an error searching for that." })
    }
}

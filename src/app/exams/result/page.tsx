'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import styles from '../exams.module.css'
import { calculateGrade, calculateOverallGPA } from '@/lib/grading'

function ResultPage() {
    const searchParams = useSearchParams()
    const examId = searchParams.get('examId')

    const [exam, setExam] = useState<any>(null)
    const [results, setResults] = useState<any[]>([])

    useEffect(() => {
        if (examId) {
            // Fetch Exam Meta
            fetch('/api/exams').then(res => res.json()).then(data => {
                const found = data.find((e: any) => e.id === parseInt(examId))
                setExam(found)
            })
            // Fetch Results
            fetch(`/api/exams/results?examId=${examId}`).then(res => res.json()).then(setResults)
        }
    }, [examId])

    if (!exam) return <div>Loading...</div>

    return (
        <div className={styles.container}>
            <div className={styles.header} style={{ printColorAdjust: 'exact', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Results: {exam.name}</h1>
                <button
                    className={styles.button}
                    onClick={() => window.print()}
                    style={{ '@media print': { display: 'none' } } as any}
                >
                    Print All
                </button>
                <style jsx>{`
                    @media print {
                        .${styles.header} { display: none !important; }
                        .${styles.container} { padding: 0 !important; max-width: none !important; }
                    }
                `}</style>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '4rem' }}>
                {results.map((r: any) => {
                    const student = r.student
                    const marks = r.marks

                    const filteredSubjects = exam.subjects.filter((sub: any) => {
                        return !sub.subject.stream || sub.subject.stream === student.stream
                    })

                    // Calculate GPA for this student
                    // We assume each subject is 4 credit hours for now as user didn't specify credit hours in schema
                    const subjectsForGPA = filteredSubjects.map((sub: any) => {
                        const markEntry = marks.find((m: any) => m.examSubjectId === sub.id)
                        const obtained = markEntry ? markEntry.obtainedMarks : 0
                        const { gpa } = calculateGrade(obtained, sub.fullMarks)
                        return { creditHour: 4, gradePoint: gpa } // Assuming equal credit hours
                    })

                    const finalGPA = calculateOverallGPA(subjectsForGPA)

                    return (
                        <div key={student.id} className="result-sheet" style={{
                            width: '297mm', // Width for A3
                            height: '420mm', // Height for A3
                            padding: '15mm',
                            margin: '0 auto',
                            background: 'white',
                            display: 'flex',
                            flexDirection: 'column',
                            boxSizing: 'border-box',
                            pageBreakAfter: 'always',
                            position: 'relative'
                        }
                        }>
                            <style jsx global>{`
                                @page {
                                    size: A3;
                                    margin: 0;
                                }
                                @media print {
                                    body {
                                        background: white;
                                        -webkit-print-color-adjust: exact;
                                    }
                                    .result-sheet {
                                        margin: 0;
                                        border: none !important;
                                        height: 297mm;
                                    }
                                }
                            `}</style>

                            {/* Header */}
                            < div style={{ textAlign: 'center', borderBottom: '2px solid #333', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
                                    <img src="/logo.png" alt="Logo" style={{ height: '90px', marginRight: '1.5rem' }} />
                                    <div>
                                        <h2 style={{ margin: 0, fontSize: '2rem', textTransform: 'uppercase', color: '#d63031', fontFamily: 'Times New Roman, serif', whiteSpace: 'nowrap', lineHeight: '1.1' }}>Centennial School and College</h2>
                                        <p style={{ margin: '0.3rem 0', fontSize: '1.1rem' }}>Gokarneshwor-5, Jorpati</p>
                                    </div>
                                </div>
                                <h3 style={{ textTransform: 'uppercase', fontSize: '1.4rem', margin: '0.8rem 0' }}>Grade Sheet</h3>
                                <p style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{exam.name}</p>
                            </div>

                            {/* Student Info */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                                <div style={{ lineHeight: '1.6' }}>
                                    <div><strong>Name:</strong> {student.fullName}</div>
                                    <div><strong>Date of Birth:</strong> {student.dob ? new Date(student.dob).toLocaleDateString() : '-'}</div>
                                    <div><strong>Registration No:</strong> {student.registrationNo || '-'}</div>
                                </div>
                                <div style={{ textAlign: 'right', lineHeight: '1.6' }}>
                                    <div><strong>Roll No:</strong> {student.rollNo}</div>
                                    <div><strong>Grade:</strong> {student.grade}</div>
                                    <div><strong>Stream:</strong> {student.stream}</div>
                                </div>
                            </div>

                            {/* Marks Table - Flex grow to take available space if needed, or just flow */}
                            <div style={{ flex: 1 }}>
                                <table className={styles.table} style={{ border: '1px solid #333', fontSize: '0.95rem', width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: '#eee', textAlign: 'center' }}>
                                            <th style={{ border: '1px solid #000', padding: '0.6rem' }}>Subject Code</th>
                                            <th style={{ border: '1px solid #000', textAlign: 'left', padding: '0.6rem' }}>Subject Name</th>
                                            <th style={{ border: '1px solid #000', padding: '0.6rem' }}>Credit Hour</th>
                                            <th style={{ border: '1px solid #000', padding: '0.6rem' }}>Grade Point</th>
                                            <th style={{ border: '1px solid #000', padding: '0.6rem' }}>Grade</th>
                                            <th style={{ border: '1px solid #000', padding: '0.6rem' }}>Final Grade</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredSubjects.map((sub: any) => {
                                            const markEntry = marks.find((m: any) => m.examSubjectId === sub.id)
                                            const obtained = markEntry ? markEntry.obtainedMarks : 0
                                            const { grade, gpa } = calculateGrade(obtained, sub.fullMarks)

                                            return (
                                                <tr key={sub.id} style={{ textAlign: 'center' }}>
                                                    <td style={{ border: '1px solid #000', padding: '0.5rem' }}>{sub.subject.code}</td>
                                                    <td style={{ border: '1px solid #000', textAlign: 'left', padding: '0.5rem' }}>{sub.subject.name}</td>
                                                    <td style={{ border: '1px solid #000', padding: '0.5rem' }}>4.0</td>
                                                    <td style={{ border: '1px solid #000', padding: '0.5rem' }}>{gpa.toFixed(2)}</td>
                                                    <td style={{ border: '1px solid #000', padding: '0.5rem' }}>{grade}</td>
                                                    <td style={{ border: '1px solid #000', padding: '0.5rem' }}>{grade}</td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                    <tfoot>
                                        <tr style={{ background: '#f9f9f9', fontWeight: 'bold', textAlign: 'center' }}>
                                            <td colSpan={3} style={{ border: '1px solid #000', textAlign: 'right', padding: '0.8rem' }}>GRADE POINT AVERAGE (GPA):</td>
                                            <td colSpan={3} style={{ border: '1px solid #000', padding: '0.8rem' }}>{finalGPA}</td>
                                        </tr>
                                    </tfoot>
                                </table>

                                {/* Grading System Legend */}
                                <div style={{ marginTop: '2rem', fontSize: '0.85rem', color: '#666' }}>
                                    <p style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '0.5rem' }}>Grading System:</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                                        <span>A+ : 90-100 (4.0)</span>
                                        <span>A : 80-90 (3.6)</span>
                                        <span>B+ : 70-80 (3.2)</span>
                                        <span>B : 60-70 (2.8)</span>
                                        <span>C+ : 50-60 (2.4)</span>
                                        <span>C : 40-50 (2.0)</span>
                                        <span>D : 35-40 (1.6)</span>
                                        <span>NG : Below 35</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Signatures - Pushed to bottom */}
                            <div style={{ marginTop: 'auto', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ borderTop: '1px solid #333', width: '150px', paddingTop: '0.5rem' }}>Prepared By</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ borderTop: '1px solid #333', width: '150px', paddingTop: '0.5rem' }}>Checked By</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ borderTop: '1px solid #333', width: '150px', paddingTop: '0.5rem' }}>Principal</div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div >
        </div >
    )
}

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResultPage />
        </Suspense>
    )
}

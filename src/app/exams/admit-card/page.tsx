'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import styles from '../exams.module.css'

function AdmitCardPage() {
    const searchParams = useSearchParams()
    const examId = searchParams.get('examId')

    const [exam, setExam] = useState<any>(null)
    const [students, setStudents] = useState<any[]>([])

    useEffect(() => {
        if (examId) {
            fetch('/api/exams').then(res => res.json()).then(data => {
                const found = data.find((e: any) => e.id === parseInt(examId))
                setExam(found)
            })
            fetch('/api/students').then(res => res.json()).then(setStudents)
        }
    }, [examId])

    if (!exam) return <div>Loading...</div>

    return (
        <div className={styles.container}>
            <div className={styles.header} style={{ printColorAdjust: 'exact' }}>
                <h1>Generate Admit Cards: {exam.name}</h1>
                <button className={styles.button} onClick={() => window.print()}>Print All</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                {students.map(student => (
                    <div key={student.id} style={{
                        border: '2px solid #333',
                        padding: '2rem',
                        pageBreakInside: 'avoid',
                        position: 'relative'
                    }}>
                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', borderBottom: '2px solid #333', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                            <img src="/logo.png" alt="Logo" style={{ height: '80px', marginRight: '1.5rem' }} />
                            <div style={{ flex: 1, textAlign: 'center' }}>
                                <h2 style={{ margin: 0, fontSize: '1.8rem', textTransform: 'uppercase', color: '#d63031' }}>Centennial School and College</h2>
                                <p style={{ margin: '0.5rem 0', fontWeight: 'bold' }}>ADMIT CARD</p>
                                <p style={{ margin: 0 }}>{exam.name}</p>
                            </div>
                        </div>

                        {/* Student Details */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div><strong>Student Name:</strong> {student.fullName}</div>
                            <div><strong>Roll No:</strong> {student.rollNo}</div>
                            <div><strong>Class:</strong> {student.grade}</div>
                            <div><strong>Section:</strong> {student.section}</div>
                        </div>

                        {/* Subjects */}
                        <table className={styles.table} style={{ border: '1px solid #333' }}>
                            <thead>
                                <tr style={{ background: '#eee' }}>
                                    <th>SN</th>
                                    <th>Subject Name</th>
                                    <th>Code</th>
                                    <th>Exam Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {exam.subjects.filter((sub: any) => {
                                    // Show if subject has NO stream (Common) OR matches student stream
                                    return !sub.subject.stream || sub.subject.stream === student.stream
                                }).map((sub: any, index: number) => (
                                    <tr key={sub.id}>
                                        <td>{index + 1}</td>
                                        <td>{sub.subject.name}</td>
                                        <td>{sub.subject.code}</td>
                                        <td>{new Date(exam.startDate).toLocaleDateString()}</td> {/* Ideally examSubject has specific date */}
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Footer */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem', paddingTop: '1rem' }}>
                            <div style={{ textAlign: 'center', width: '150px' }}>
                                <div style={{ borderTop: '1px solid #333', paddingTop: '0.5rem' }}>Class Teacher</div>
                            </div>
                            <div style={{ textAlign: 'center', width: '150px' }}>
                                <div style={{ borderTop: '1px solid #333', paddingTop: '0.5rem' }}>Principal</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AdmitCardPage />
        </Suspense>
    )
}

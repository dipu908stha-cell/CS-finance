'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import styles from '../exams.module.css'

function MarksEntry() {
    const searchParams = useSearchParams()
    const examId = searchParams.get('examId')

    const [exam, setExam] = useState<any>(null)
    const [selectedSubjectId, setSelectedSubjectId] = useState('')
    const [students, setStudents] = useState<any[]>([])
    const [marks, setMarks] = useState<any>({})

    useEffect(() => {
        if (examId) {
            // Fetch exam details to get subjects
            fetch('/api/exams').then(res => res.json()).then(data => {
                const found = data.find((e: any) => e.id === parseInt(examId))
                setExam(found)
            })
            // Fetch students
            fetch('/api/students').then(res => res.json()).then(setStudents)
        }
    }, [examId])

    useEffect(() => {
        if (examId && selectedSubjectId) {
            // Fetch existing marks
            fetch(`/api/exams/marks?examId=${examId}&subjectId=${selectedSubjectId}`)
                .then(res => res.json())
                .then(data => {
                    const markMap: any = {}
                    data.forEach((m: any) => {
                        markMap[m.studentId] = { obtained: m.obtainedMarks, remarks: m.remarks }
                    })
                    setMarks(markMap)
                })
        }
    }, [examId, selectedSubjectId])

    function handleMarkChange(studentId: number, field: string, value: string) {
        setMarks({
            ...marks,
            [studentId]: {
                ...marks[studentId],
                [field]: value
            }
        })
    }

    async function saveMarks() {
        if (!selectedSubjectId) {
            alert('Select a subject first')
            return
        }

        const marksPayload = Object.keys(marks).map(studentId => ({
            studentId,
            obtained: marks[studentId].obtained,
            remarks: marks[studentId].remarks
        }))

        const res = await fetch('/api/exams/marks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                examId,
                subjectId: selectedSubjectId,
                marks: marksPayload
            })
        })

        if (res.ok) alert('Marks Saved Successfully')
        else alert('Failed to save marks')
    }

    if (!exam) return <div className={styles.container}>Loading Exam...</div>

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Marks Entry: {exam.name}</h1>
            </header>

            <div className={styles.card}>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Select Subject</label>
                    <select className={styles.select} value={selectedSubjectId} onChange={e => setSelectedSubjectId(e.target.value)}>
                        <option value="">-- Select Subject --</option>
                        {exam.subjects.map((s: any) => (
                            <option key={s.subject.id} value={s.subject.id}>
                                {s.subject.name} (Full: {s.fullMarks})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {selectedSubjectId && (
                <div className={styles.card}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Roll No</th>
                                <th>Student Name</th>
                                <th>Obtained Marks</th>
                                <th>Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student: any) => (
                                <tr key={student.id}>
                                    <td>{student.rollNo}</td>
                                    <td>{student.fullName}</td>
                                    <td>
                                        <input
                                            type="number"
                                            className={styles.input}
                                            style={{ width: '100px' }}
                                            value={marks[student.id]?.obtained || ''}
                                            onChange={(e) => handleMarkChange(student.id, 'obtained', e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            className={styles.input}
                                            value={marks[student.id]?.remarks || ''}
                                            onChange={(e) => handleMarkChange(student.id, 'remarks', e.target.value)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                        <button className={styles.button} onClick={saveMarks}>Save Marks</button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <MarksEntry />
        </Suspense>
    )
}

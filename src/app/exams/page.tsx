'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './exams.module.css'

export default function ExamsPage() {
    const [activeTab, setActiveTab] = useState('exams')
    const [exams, setExams] = useState([])
    const [subjects, setSubjects] = useState([])

    // Forms
    const [examForm, setExamForm] = useState({ name: '', startDate: '' })
    const [editingExamId, setEditingExamId] = useState<number | null>(null)
    const [subjectForm, setSubjectForm] = useState({ name: '', code: '', stream: '' })

    // Exam Subject Linking
    const [selectedSubjects, setSelectedSubjects] = useState<any[]>([])

    useEffect(() => {
        fetch('/api/exams').then(res => res.json()).then(setExams)
        fetch('/api/subjects').then(res => res.json()).then(setSubjects)
    }, [])

    async function createSubject(e: React.FormEvent) {
        e.preventDefault()
        await fetch('/api/subjects', {
            method: 'POST',
            body: JSON.stringify(subjectForm)
        })
        alert('Subject Created')
        fetch('/api/subjects').then(res => res.json()).then(setSubjects)
    }

    async function createExam(e: React.FormEvent) {
        e.preventDefault()
        const payload = {
            ...examForm,
            subjects: selectedSubjects
        }

        const url = editingExamId ? `/api/exams/${editingExamId}` : '/api/exams'
        const method = editingExamId ? 'PUT' : 'POST'

        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })

        if (res.ok) {
            alert(editingExamId ? 'Exam Updated' : 'Exam Created')
            fetch('/api/exams').then(res => res.json()).then(setExams)
            setEditingExamId(null)
            setExamForm({ name: '', startDate: '' })
            setSelectedSubjects([])
        } else {
            alert('Failed to save exam')
        }
    }

    const editExam = (exam: any) => {
        setEditingExamId(exam.id)
        setExamForm({
            name: exam.name,
            startDate: new Date(exam.startDate).toISOString().split('T')[0]
        })
        // Initially we don't load subjects for edit in this simple version, as complexity increases.
        // But the user can update Name and Date.
        setSelectedSubjects([])
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    function toggleSubject(subjectId: string, checked: boolean) {
        if (checked) {
            setSelectedSubjects([...selectedSubjects, { subjectId, fullMarks: 100, passMarks: 40 }])
        } else {
            setSelectedSubjects(selectedSubjects.filter(s => s.subjectId !== subjectId))
        }
    }

    function updateSubjectMarks(subjectId: string, field: string, value: string) {
        setSelectedSubjects(selectedSubjects.map(s =>
            s.subjectId === subjectId ? { ...s, [field]: value } : s
        ))
    }

    async function deleteSubject(id: number) {
        if (!confirm('Delete this subject?')) return
        await fetch(`/api/subjects/${id}`, { method: 'DELETE' })
        fetch('/api/subjects').then(res => res.json()).then(setSubjects)
    }

    async function deleteExam(id: number) {
        if (!confirm('Delete this exam?')) return
        await fetch(`/api/exams/${id}`, { method: 'DELETE' })
        fetch('/api/exams').then(res => res.json()).then(setExams)
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Examination Module</h1>
            </header>

            <div className={styles.tabs}>
                <div className={`${styles.tab} ${activeTab === 'exams' ? styles.activeTab : ''}`} onClick={() => setActiveTab('exams')}>Exams</div>
                <div className={`${styles.tab} ${activeTab === 'subjects' ? styles.activeTab : ''}`} onClick={() => setActiveTab('subjects')}>Subjects</div>
            </div>

            {activeTab === 'subjects' && (
                <div className={styles.card}>
                    <h2>Create New Subject</h2>
                    <form onSubmit={createSubject} className={styles.formGrid}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Subject Name</label>
                            <input className={styles.input} value={subjectForm.name} onChange={e => setSubjectForm({ ...subjectForm, name: e.target.value })} required />
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Subject Code</label>
                            <input className={styles.input} value={subjectForm.code} onChange={e => setSubjectForm({ ...subjectForm, code: e.target.value })} required />
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Stream (Optional)</label>
                            <select className={styles.select} value={subjectForm.stream} onChange={e => setSubjectForm({ ...subjectForm, stream: e.target.value })}>
                                <option value="">-- Common / All --</option>
                                <option value="Computer Science">Computer Science</option>
                                <option value="Business Studies">Business Studies</option>
                                <option value="Hotel Management">Hotel Management</option>
                                <option value="Humanities">Humanities</option>
                            </select>
                        </div>
                        <div style={{ marginTop: '1.5rem' }}>
                            <button className={styles.button}>Add Subject</button>
                        </div>
                    </form>

                    <h3 style={{ marginTop: '2rem' }}>All Subjects</h3>
                    <table className={styles.table}>
                        <thead><tr><th>Code</th><th>Name</th><th>Stream</th><th>Actions</th></tr></thead>
                        <tbody>
                            {subjects.map((s: any) => (
                                <tr key={s.id}>
                                    <td>{s.code}</td>
                                    <td>{s.name}</td>
                                    <td>{s.stream || 'Common'}</td>
                                    <td>
                                        <button
                                            onClick={() => deleteSubject(s.id)}
                                            style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'exams' && (
                <>
                    <div className={styles.card}>
                        <h2>{editingExamId ? 'Edit Exam' : 'Configure Exam'}</h2>
                        <form onSubmit={createExam}>
                            <div className={styles.formGrid}>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Exam Name</label>
                                    <input className={styles.input} value={examForm.name} onChange={e => setExamForm({ ...examForm, name: e.target.value })} placeholder="e.g. First Term 2081" required />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Start Date</label>
                                    <input type="date" className={styles.input} value={examForm.startDate} onChange={e => setExamForm({ ...examForm, startDate: e.target.value })} required />
                                </div>
                            </div>

                            <div style={{ marginTop: '2rem' }}>
                                <h4>Select Subjects & Weightage</h4>
                                <table className={styles.table}>
                                    <thead><tr><th>Select</th><th>Subject</th><th>Full Marks</th><th>Pass Marks</th></tr></thead>
                                    <tbody>
                                        {subjects.map((s: any) => {
                                            const isSelected = selectedSubjects.find(ss => ss.subjectId === s.id.toString())
                                            return (
                                                <tr key={s.id}>
                                                    <td>
                                                        <input type="checkbox" onChange={(e) => toggleSubject(s.id.toString(), e.target.checked)} />
                                                    </td>
                                                    <td>{s.name} ({s.code})</td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            className={styles.input}
                                                            style={{ width: '80px' }}
                                                            disabled={!isSelected}
                                                            value={isSelected?.fullMarks || 100}
                                                            onChange={(e) => updateSubjectMarks(s.id.toString(), 'fullMarks', e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            className={styles.input}
                                                            style={{ width: '80px' }}
                                                            disabled={!isSelected}
                                                            value={isSelected?.passMarks || 40}
                                                            onChange={(e) => updateSubjectMarks(s.id.toString(), 'passMarks', e.target.value)}
                                                        />
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                                <button className={styles.button}>{editingExamId ? 'Update Exam' : 'Create Exam'}</button>
                                {editingExamId && (
                                    <button type="button" className={styles.button} style={{ background: '#95a5a6' }} onClick={() => {
                                        setEditingExamId(null)
                                        setExamForm({ name: '', startDate: '' })
                                    }}>Cancel Edit</button>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className={styles.card}>
                        <h2>Existing Exams</h2>
                        <table className={styles.table}>
                            <thead><tr><th>Name</th><th>Start Date</th><th>Subjects</th><th>Actions</th></tr></thead>
                            <tbody>
                                {Array.isArray(exams) && exams.map((e: any) => (
                                    <tr key={e.id}>
                                        <td>{e.name}</td>
                                        <td>{new Date(e.startDate).toLocaleDateString()}</td>
                                        <td>{e.subjects?.length || 0}</td>
                                        <td>
                                            <Link href={`/exams/marks?examId=${e.id}`} className={styles.actionBtn}>Enter Marks</Link>
                                            <Link href={`/exams/admit-card?examId=${e.id}`} className={styles.actionBtn}>Admit Card</Link>

                                            <Link href={`/exams/result?examId=${e.id}`} className={styles.actionBtn}>Result</Link>
                                            <button
                                                onClick={() => editExam(e)}
                                                className={styles.actionBtn}
                                                style={{ background: '#f1c40f', color: 'white', border: 'none', cursor: 'pointer' }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => deleteExam(e.id)}
                                                className={styles.actionBtn}
                                                style={{ background: '#e74c3c', color: 'white', border: 'none', cursor: 'pointer' }}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    )
}

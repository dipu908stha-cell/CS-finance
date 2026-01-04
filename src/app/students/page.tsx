'use client'

import { useState, useEffect, FormEvent } from 'react'
import styles from './students.module.css'

interface Student {
    id: number
    fullName: string
    grade: string
    stream: string
    section: string
    rollNo: string
    status: string
}

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<number | null>(null)

    // Filter State
    const [filterGrade, setFilterGrade] = useState('All')

    // Selection State
    const [selectedIds, setSelectedIds] = useState<number[]>([])

    // Promotion State
    const [promoteGrade, setPromoteGrade] = useState('12')
    const [promoteYear, setPromoteYear] = useState('2082/83')

    // Form State
    const [formData, setFormData] = useState({
        fullName: '',
        dob: '',
        grade: '11',
        stream: 'Science',
        section: '',
        rollNo: '',
        academicYear: '2081/82',
        parentName: '',
        parentContact: '',
        address: ''
    })

    useEffect(() => {
        fetchStudents()
    }, [])

    async function fetchStudents() {
        try {
            const res = await fetch('/api/students')
            if (!res.ok) throw new Error('Failed to fetch students')

            const data = await res.json()
            setStudents(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('Failed to fetch students', error)
            alert("Error loading students. Database connection might be failing.")
            setStudents([])
        } finally {
            setLoading(false)
        }
    }

    // Toggle Selection
    const toggleSelect = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(sid => sid !== id))
        } else {
            setSelectedIds([...selectedIds, id])
        }
    }

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredStudents.length) {
            setSelectedIds([])
        } else {
            setSelectedIds(filteredStudents.map(s => s.id))
        }
    }

    // Filter Logic
    const filteredStudents = students.filter(s => {
        if (filterGrade === 'All') return true
        return s.grade === filterGrade
    })

    // Promotion Logic
    async function handlePromote() {
        if (selectedIds.length === 0) return
        if (!confirm(`Are you sure you want to promote ${selectedIds.length} students to Grade ${promoteGrade}?`)) return

        try {
            const res = await fetch('/api/students/promote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentIds: selectedIds,
                    newGrade: promoteGrade,
                    newAcademicYear: promoteYear
                })
            })
            const data = await res.json()
            if (res.ok) {
                alert(data.message)
                setSelectedIds([]) // Clear selection
                fetchStudents() // Refresh data
            } else {
                alert(data.error)
            }
        } catch (error) {
            console.error(error)
            alert('Failed to promote students')
        }
    }

    async function deleteStudent(id: number) {
        if (!confirm('Are you sure you want to delete this student? This will delete all related records.')) return
        try {
            const res = await fetch(`/api/students/${id}`, { method: 'DELETE' })
            if (res.ok) {
                alert('Student Deleted')
                fetchStudents()
            } else {
                alert('Failed to delete student')
            }
        } catch (error) {
            console.error(error)
            alert('Error deleting student')
        }
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        try {
            const url = editingId ? `/api/students/${editingId}` : '/api/students'
            const method = editingId ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            if (res.ok) {
                alert(editingId ? 'Student Updated Successfully' : 'Student Added Successfully')
                fetchStudents() // Refresh list
                setEditingId(null)
                // Reset form
                setFormData({
                    fullName: '', dob: '', grade: '11', stream: 'Science', section: '',
                    rollNo: '', academicYear: '2081/82', parentName: '', parentContact: '', address: ''
                })
            } else {
                alert('Failed to save student')
            }
        } catch (error) {
            console.error(error)
            alert('Error submitting form')
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const editStudent = (student: any) => {
        setEditingId(student.id)
        setFormData({
            fullName: student.fullName,
            dob: student.dob ? new Date(student.dob).toISOString().split('T')[0] : '',
            grade: student.grade,
            stream: student.stream,
            section: student.section,
            rollNo: student.rollNo,
            academicYear: student.academicYear,
            parentName: student.parentName,
            parentContact: student.parentContact,
            address: student.address
        })
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Student Master</h1>
            </header>

            <div className={styles.card}>
                <h2 style={{ marginBottom: '1rem' }}>{editingId ? 'Edit Student' : 'Add New Student'}</h2>
                <form onSubmit={handleSubmit} className={styles.formGrid}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Full Name</label>
                        <input name="fullName" className={styles.input} value={formData.fullName} onChange={handleChange} required />
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Date of Birth</label>
                        <input type="date" className={styles.input} name="dob" value={formData.dob} onChange={handleChange} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Grade</label>
                        <select name="grade" className={styles.select} value={formData.grade} onChange={handleChange}>
                            <option value="11">Grade 11</option>
                            <option value="12">Grade 12</option>
                        </select>
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Stream</label>
                        <select name="stream" className={styles.select} value={formData.stream} onChange={handleChange}>
                            <option value="Computer Science">Computer Science</option>
                            <option value="Business Studies">Business Studies</option>
                            <option value="Hotel Management">Hotel Management</option>
                            <option value="Humanities">Humanities</option>
                        </select>
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Section</label>
                        <input name="section" className={styles.input} value={formData.section} onChange={handleChange} required />
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Roll No</label>
                        <input name="rollNo" className={styles.input} value={formData.rollNo} onChange={handleChange} required />
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Academic Year</label>
                        <input name="academicYear" className={styles.input} value={formData.academicYear} onChange={handleChange} required />
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Parent Name</label>
                        <input name="parentName" className={styles.input} value={formData.parentName} onChange={handleChange} required />
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Contact Number</label>
                        <input name="parentContact" className={styles.input} value={formData.parentContact} onChange={handleChange} required />
                    </div>
                    <div className={styles.inputGroup} style={{ gridColumn: 'span 2' }}>
                        <label className={styles.label}>Address</label>
                        <textarea name="address" className={styles.textarea} value={formData.address} onChange={handleChange} required />
                    </div>
                    <div style={{ gridColumn: '1 / -1', marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                        <button type="submit" className={styles.button}>{editingId ? 'Update Student' : 'Register Student'}</button>
                        {editingId && (
                            <button type="button" className={styles.button} style={{ background: '#95a5a6' }} onClick={() => {
                                setEditingId(null)
                                setFormData({
                                    fullName: '', dob: '', grade: '11', stream: 'Science', section: '',
                                    rollNo: '', academicYear: '2081/82', parentName: '', parentContact: '', address: ''
                                })
                            }}>Cancel Edit</button>
                        )}
                    </div>
                </form>
            </div>

            <div className={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h2 style={{ margin: 0 }}>Student List</h2>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <select
                            className={styles.select}
                            value={filterGrade}
                            onChange={(e) => setFilterGrade(e.target.value)}
                            style={{ width: '150px' }}
                        >
                            <option value="All">All Grades</option>
                            <option value="11">Grade 11</option>
                            <option value="12">Grade 12</option>
                        </select>
                    </div>
                </div>

                {/* Bulk Actions Bar */}
                {selectedIds.length > 0 && (
                    <div style={{
                        background: '#e3f2fd',
                        padding: '1rem',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        border: '1px solid #90caf9',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    }}>
                        <strong style={{ color: '#1976d2' }}>{selectedIds.length} Selected</strong>
                        <div style={{ height: '20px', width: '1px', background: '#ccc' }}></div>
                        <span style={{ fontSize: '0.9rem' }}>Promote To:</span>
                        <select
                            className={styles.select}
                            style={{ width: '120px', padding: '0.4rem' }}
                            value={promoteGrade}
                            onChange={(e) => setPromoteGrade(e.target.value)}
                        >
                            <option value="12">Grade 12</option>
                            <option value="11">Grade 11</option>
                        </select>
                        <input
                            className={styles.input}
                            style={{ width: '100px', padding: '0.4rem' }}
                            value={promoteYear}
                            onChange={(e) => setPromoteYear(e.target.value)}
                            placeholder="Year"
                        />
                        <button
                            onClick={handlePromote}
                            className={styles.button}
                            style={{ padding: '0.4rem 1rem', background: '#27ae60' }}
                        >
                            Promote
                        </button>
                    </div>
                )}

                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th style={{ width: '40px' }}>
                                    <input
                                        type="checkbox"
                                        onChange={toggleSelectAll}
                                        checked={selectedIds.length === filteredStudents.length && filteredStudents.length > 0}
                                    />
                                </th>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Grade</th>
                                <th>Stream</th>
                                <th>Section</th>
                                <th>Roll No</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={9}>Loading...</td></tr>
                            ) : filteredStudents.length === 0 ? (
                                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '1rem' }}>No students found in this grade</td></tr>
                            ) : filteredStudents.map((student) => (
                                <tr key={student.id} style={{ background: selectedIds.includes(student.id) ? '#f0f9ff' : 'transparent' }}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(student.id)}
                                            onChange={() => toggleSelect(student.id)}
                                        />
                                    </td>
                                    <td>{student.id}</td>
                                    <td>{student.fullName}</td>
                                    <td>{student.grade}</td>
                                    <td>{student.stream}</td>
                                    <td>{student.section}</td>
                                    <td>{student.rollNo}</td>
                                    <td>
                                        <span className={`${styles.badge} ${student.status === 'Active' ? styles.active : styles.left}`}>
                                            {student.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => editStudent(student)}
                                            style={{ background: '#f1c40f', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => deleteStudent(student.id)}
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
            </div>
        </div>
    )
}

'use client'

import { useState, useEffect, FormEvent } from 'react'
import styles from './assignments.module.css'

interface Student {
    id: number
    fullName: string
    rollNo: string
}

interface FeePackage {
    id: number
    name: string
    totalAmount: number
}

interface Assignment {
    id: number
    student: Student
    feePackage: FeePackage
    finalAmount: number
    paymentMode: string
}

export default function AssignmentsPage() {
    const [students, setStudents] = useState<Student[]>([])
    const [packages, setPackages] = useState<FeePackage[]>([])
    const [assignments, setAssignments] = useState<Assignment[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    const [formData, setFormData] = useState({
        studentId: '',
        packageId: '',
        discount: '0',
        paymentMode: 'Installment'
    })

    // Computed state for preview
    const selectedPackage = packages.find(p => p.id === parseInt(formData.packageId))
    const finalAmount = selectedPackage ? selectedPackage.totalAmount - parseFloat(formData.discount || '0') : 0

    useEffect(() => {
        Promise.all([
            fetch('/api/students').then(res => res.json()),
            fetch('/api/fees').then(res => res.json()),
            fetch('/api/assignments').then(res => res.json())
        ]).then(([studentsData, packagesData, assignmentsData]) => {
            setStudents(studentsData)
            setPackages(packagesData)
            setAssignments(assignmentsData)
            setLoading(false)
        }).catch(err => console.error(err))
    }, [])

    async function fetchAssignments() {
        const res = await fetch('/api/assignments')
        const data = await res.json()
        setAssignments(data)
    }

    async function deleteAssignment(id: number) {
        if (!confirm('Are you sure you want to delete this assignment?')) return
        try {
            const res = await fetch(`/api/assignments/${id}`, { method: 'DELETE' })
            if (res.ok) {
                alert('Assignment Deleted')
                fetchAssignments()
            } else {
                alert('Failed to delete')
            }
        } catch (error) {
            console.error(error)
            alert('Error deleting assignment')
        }
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        try {
            const res = await fetch('/api/assignments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            if (res.ok) {
                alert('Fee Assigned Successfully')
                fetchAssignments()
                setFormData({ studentId: '', packageId: '', discount: '0', paymentMode: 'Installment' })
            } else {
                alert('Failed to assign fee')
            }
        } catch (error) {
            console.error(error)
            alert('Error submitting form')
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Fee Assignments</h1>
            </header>

            <div className={styles.card}>
                <h2 style={{ marginBottom: '1rem' }}>Assign Package to Student</h2>
                <form onSubmit={handleSubmit} className={styles.formGrid}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Select Student</label>
                        <select name="studentId" className={styles.select} value={formData.studentId} onChange={handleChange} required>
                            <option value="">-- Select Student --</option>
                            {students.map(s => (
                                <option key={s.id} value={s.id}>{s.fullName} ({s.rollNo})</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Select Package</label>
                        <select name="packageId" className={styles.select} value={formData.packageId} onChange={handleChange} required>
                            <option value="">-- Select Package --</option>
                            {packages.map(p => (
                                <option key={p.id} value={p.id}>{p.name} (NPR {p.totalAmount})</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Discount (NPR)</label>
                        <input
                            name="discount"
                            type="number"
                            className={styles.input}
                            value={formData.discount}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Payment Mode</label>
                        <select name="paymentMode" className={styles.select} value={formData.paymentMode} onChange={handleChange}>
                            <option value="Installment">Installment</option>
                            <option value="One-time">One-time Full Payment</option>
                        </select>
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Final Payable Amount</label>
                        <div style={{ padding: '0.8rem', background: '#ecf0f1', borderRadius: '8px', fontWeight: 'bold' }}>
                            NPR {finalAmount.toLocaleString()}
                        </div>
                    </div>

                    <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                        <button type="submit" className={styles.button}>Confirm Assignment</button>
                    </div>
                </form>
            </div>

            <div className={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ margin: 0 }}>Active Assignments</h2>
                    <input
                        type="text"
                        placeholder="Search by Student Name..."
                        className={styles.input}
                        style={{ width: '300px' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Student</th>
                                <th>Package</th>
                                <th>Original Fee</th>
                                <th>Discount</th>
                                <th>Final Amount</th>
                                <th>Mode</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7}>Loading...</td></tr>
                            ) : assignments.filter(a => a.student.fullName.toLowerCase().includes(searchTerm.toLowerCase())).map((a) => (
                                <tr key={a.id}>
                                    <td>{a.id}</td>
                                    <td>{a.student.fullName}</td>
                                    <td>{a.feePackage.name}</td>
                                    <td>{a.feePackage.totalAmount}</td>
                                    <td>{a.feePackage.totalAmount - a.finalAmount}</td>
                                    <td className={styles.finalAmount}>NPR {a.finalAmount.toLocaleString()}</td>
                                    <td>{a.paymentMode}</td>
                                    <td>
                                        <button
                                            onClick={() => deleteAssignment(a.id)}
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

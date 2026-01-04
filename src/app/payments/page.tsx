'use client'

import { useState, useEffect, FormEvent } from 'react'
import styles from './payments.module.css'

interface Student {
    id: number
    fullName: string
    rollNo: string
}

interface Payment {
    id: number
    amount: number
    date: string
    method: string
    student: Student
    remarks: string | null
}

export default function PaymentsPage() {
    const [students, setStudents] = useState<Student[]>([])
    const [payments, setPayments] = useState<Payment[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    // Selected Student Data
    const [selectedStudentId, setSelectedStudentId] = useState('')
    const [studentSummary, setStudentSummary] = useState({ totalFee: 0, totalPaid: 0, due: 0 })

    const [formData, setFormData] = useState({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        method: 'Cash',
        remarks: '',
        receivedBy: 'Admin'
    })

    useEffect(() => {
        fetchInitialData()
    }, [])

    // When student changes, calculating balance
    useEffect(() => {
        if (selectedStudentId) {
            calculateBalance(selectedStudentId)
        } else {
            setStudentSummary({ totalFee: 0, totalPaid: 0, due: 0 })
        }
    }, [selectedStudentId])

    async function fetchInitialData() {
        try {
            const [studentsRes, paymentsRes] = await Promise.all([
                fetch('/api/students'),
                fetch('/api/payments')
            ])
            setStudents(await studentsRes.json())
            setPayments(await paymentsRes.json())
            setLoading(false)
        } catch (error) {
            console.error(error)
        }
    }

    async function calculateBalance(studentId: string) {
        try {
            const [assignRes, payRes] = await Promise.all([
                fetch('/api/assignments'),
                fetch(`/api/payments?studentId=${studentId}`)
            ])

            const allAssignments = await assignRes.json()
            const studentPayments = await payRes.json()

            const studentAssignments = allAssignments.filter((a: any) => a.studentId === parseInt(studentId))

            const totalFee = studentAssignments.reduce((sum: number, a: any) => sum + a.finalAmount, 0)
            const totalPaid = studentPayments.reduce((sum: number, p: any) => sum + p.amount, 0)

            setStudentSummary({
                totalFee,
                totalPaid,
                due: totalFee - totalPaid
            })
        } catch (error) {
            console.error("Error calculating balance", error)
        }
    }

    async function deletePayment(id: number) {
        if (!confirm('Are you sure you want to delete this payment?')) return
        try {
            const res = await fetch(`/api/payments/${id}`, { method: 'DELETE' })
            if (res.ok) {
                alert('Payment Deleted')
                fetchInitialData() // Refresh list
                if (selectedStudentId) calculateBalance(selectedStudentId) // Refresh balance if student selected
            } else {
                alert('Failed to delete payment')
            }
        } catch (error) {
            console.error(error)
            alert('Error deleting payment')
        }
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        if (!selectedStudentId) {
            alert('Please select a student')
            return
        }

        try {
            const res = await fetch('/api/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: selectedStudentId,
                    amount: formData.amount,
                    method: formData.method,
                    remarks: formData.remarks,
                    paymentDate: formData.date,
                    receivedBy: formData.receivedBy
                })
            })

            if (res.ok) {
                alert('Payment Recorded Successfully')
                fetchInitialData() // Refresh list
                calculateBalance(selectedStudentId) // Refresh balance
                setFormData({ ...formData, amount: '', remarks: '' })
            } else {
                alert('Failed to record payment')
            }
        } catch (error) {
            console.error(error)
            alert('Error recording payment')
        }
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Payment Entry</h1>
            </header>

            <div className={styles.card}>
                <h2 style={{ marginBottom: '1rem' }}>Record New Payment</h2>

                <div className={styles.formGrid} style={{ marginBottom: '1.5rem' }}>
                    <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                        <label className={styles.label}>Search / Select Student</label>
                        <select
                            className={styles.select}
                            value={selectedStudentId}
                            onChange={(e) => setSelectedStudentId(e.target.value)}
                        >
                            <option value="">-- Select Student --</option>
                            {students.map(s => (
                                <option key={s.id} value={s.id}>{s.fullName} ({s.rollNo})</option>
                            ))}
                        </select>
                    </div>
                </div>

                {selectedStudentId && (
                    <div className={styles.summaryBox}>
                        <div className={styles.summaryItem}>
                            <h4>Total Payable</h4>
                            <p>NPR {studentSummary.totalFee.toLocaleString()}</p>
                        </div>
                        <div className={styles.summaryItem}>
                            <h4>Total Paid</h4>
                            <p className={styles.paid}>NPR {studentSummary.totalPaid.toLocaleString()}</p>
                        </div>
                        <div className={styles.summaryItem}>
                            <h4>Due Amount</h4>
                            <p className={styles.due}>NPR {studentSummary.due.toLocaleString()}</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.formGrid}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Payment Date</label>
                        <input
                            type="date"
                            className={styles.input}
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Amount (NPR)</label>
                        <input
                            type="number"
                            className={styles.input}
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Payment Method</label>
                        <select
                            className={styles.select}
                            value={formData.method}
                            onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                        >
                            <option value="Cash">Cash</option>
                            <option value="Bank">Bank Deposit</option>
                            <option value="eSewa">eSewa</option>
                            <option value="Khalti">Khalti</option>
                        </select>
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Remarks</label>
                        <input
                            className={styles.input}
                            value={formData.remarks}
                            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                            placeholder="e.g. 1st Installment"
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Received By</label>
                        <input
                            className={styles.input}
                            value={formData.receivedBy}
                            onChange={(e) => setFormData({ ...formData, receivedBy: e.target.value })}
                            placeholder="Name of receiver"
                            required
                        />
                    </div>

                    <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                        <button type="submit" className={styles.button}>Record Payment</button>
                        <button
                            type="button"
                            className={styles.button}
                            style={{
                                background: selectedStudentId ? '#636e72' : '#b2bec3',
                                cursor: selectedStudentId ? 'pointer' : 'not-allowed'
                            }}
                            onClick={() => {
                                if (selectedStudentId) {
                                    window.open(`/reports/bill/${selectedStudentId}`, '_blank')
                                } else {
                                    alert('Please select a student to generate a bill')
                                }
                            }}
                        >
                            Generate Bill
                        </button>
                    </div>
                </form>
            </div>

            <div className={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ margin: 0 }}>Recent Payments</h2>
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
                                <th>Date</th>
                                <th>Method</th>
                                <th>Amount</th>
                                <th>Remarks</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6}>Loading...</td></tr>
                            ) : payments.filter(p => p.student.fullName.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => (
                                <tr key={p.id}>
                                    <td>{p.id}</td>
                                    <td>{p.student.fullName}</td>
                                    <td>{new Date(p.date).toLocaleDateString()}</td>
                                    <td>{p.method}</td>
                                    <td className={styles.paid}>NPR {p.amount.toLocaleString()}</td>
                                    <td>{p.remarks || '-'}</td>
                                    <td>
                                        <button
                                            onClick={() => deletePayment(p.id)}
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

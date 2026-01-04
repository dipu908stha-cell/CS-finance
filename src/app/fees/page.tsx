'use client'

import { useState, useEffect, FormEvent } from 'react'
import styles from './fees.module.css'

interface FeePackage {
    id: number
    name: string
    grade: string
    totalAmount: number
    breakdown: string | null
}

export default function FeesPage() {
    const [packages, setPackages] = useState<FeePackage[]>([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<number | null>(null)

    const [formData, setFormData] = useState({
        name: '',
        grade: '11',
        totalAmount: '',
        breakdown: ''
    })

    useEffect(() => {
        fetchPackages()
    }, [])

    async function fetchPackages() {
        try {
            const res = await fetch('/api/fees')
            const data = await res.json()
            setPackages(data)
        } catch (error) {
            console.error('Failed to fetch packages', error)
        } finally {
            setLoading(false)
        }
    }

    async function deletePackage(id: number) {
        if (!confirm('Are you sure you want to delete this package?')) return
        try {
            const res = await fetch(`/api/fees/${id}`, { method: 'DELETE' })
            if (res.ok) {
                alert('Package Deleted')
                fetchPackages()
            } else {
                alert('Failed to delete package')
            }
        } catch (error) {
            console.error(error)
            alert('Error deleting package')
        }
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        try {
            const url = editingId ? `/api/fees/${editingId}` : '/api/fees'
            const method = editingId ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            if (res.ok) {
                alert(editingId ? 'Package Updated Successfully' : 'Package Added Successfully')
                fetchPackages()
                setEditingId(null)
                setFormData({ name: '', grade: '11', totalAmount: '', breakdown: '' })
            } else {
                alert('Failed to save package')
            }
        } catch (error) {
            console.error(error)
            alert('Error submitting form')
        }
    }

    const editPackage = (pkg: FeePackage) => {
        setEditingId(pkg.id)
        setFormData({
            name: pkg.name,
            grade: pkg.grade,
            totalAmount: pkg.totalAmount.toString(),
            breakdown: pkg.breakdown || ''
        })
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Fee Packages</h1>
            </header>

            <div className={styles.card}>
                <h2 style={{ marginBottom: '1rem' }}>{editingId ? 'Edit Fee Package' : 'Create Fee Package'}</h2>
                <form onSubmit={handleSubmit} className={styles.formGrid}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Package Name</label>
                        <input
                            name="name"
                            className={styles.input}
                            placeholder="e.g. Class 11 Science - Full"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Grade</label>
                        <select name="grade" className={styles.select} value={formData.grade} onChange={handleChange}>
                            <option value="11">Grade 11</option>
                            <option value="12">Grade 12</option>
                        </select>
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Total Amount (NPR)</label>
                        <input
                            name="totalAmount"
                            type="number"
                            className={styles.input}
                            value={formData.totalAmount}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                        <label className={styles.label}>Fee Breakdown (Optional)</label>
                        <textarea
                            name="breakdown"
                            className={styles.textarea}
                            placeholder="Admission: 10000, Tuition: 5000/mo..."
                            rows={3}
                            value={formData.breakdown}
                            onChange={handleChange}
                        />
                    </div>

                    <div style={{ gridColumn: '1 / -1', marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                        <button type="submit" className={styles.button}>{editingId ? 'Update Package' : 'Save Package'}</button>
                        {editingId && (
                            <button type="button" className={styles.button} style={{ background: '#95a5a6' }} onClick={() => {
                                setEditingId(null)
                                setFormData({ name: '', grade: '11', totalAmount: '', breakdown: '' })
                            }}>Cancel Edit</button>
                        )}
                    </div>
                </form>
            </div>

            <div className={styles.card}>
                <h2 style={{ marginBottom: '1rem' }}>Existing Packages</h2>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Package Name</th>
                                <th>Grade</th>
                                <th>Total Fee</th>
                                <th>Breakdown</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5}>Loading...</td></tr>
                            ) : packages.map((pkg) => (
                                <tr key={pkg.id}>
                                    <td>{pkg.id}</td>
                                    <td>{pkg.name}</td>
                                    <td>{pkg.grade}</td>
                                    <td className={styles.amount}>NPR {pkg.totalAmount.toLocaleString()}</td>
                                    <td>{pkg.breakdown || '-'}</td>
                                    <td>
                                        <button
                                            onClick={() => editPackage(pkg)}
                                            style={{ background: '#f1c40f', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => deletePackage(pkg.id)}
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

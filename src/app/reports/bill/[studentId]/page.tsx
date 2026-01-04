'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams } from 'next/navigation'
import styles from '../../../exams/exams.module.css' // Reusing exam styles for print layout

function BillPage({ studentId }: { studentId: string }) {
    const [student, setStudent] = useState<any>(null)
    const [balance, setBalance] = useState({ totalFee: 0, paid: 0, due: 0, discount: 0 })

    useEffect(() => {
        fetch(`/api/students`).then(res => res.json()).then(data => {
            const found = data.find((s: any) => s.id === parseInt(studentId))
            setStudent(found)
        })

        // Calculate Balance Logic (Reused from Payments Page roughly)
        // Ideally this logic should be in an API
        async function fetchBalance() {
            const res = await fetch(`/api/payments?studentId=${studentId}`)
            // Note: The payment API currently returns list of payments. 
            // We need fee assignments too.
            // For now, let's fetch fee assignments if possible or infer.
            // Let's create a dedicated API for "Student Financial Summary" later.
            // For this task, I'll fetch payments and do a basic check if I can get assignments.

            // Actually, let's fetch assignments via a new route or existing
            const assignRes = await fetch(`/api/fees/assign?studentId=${studentId}`)
            // Wait, I haven't made a GET /api/fees/assign for specific student yet.
            // I will make a quick "Summary" API now.
        }
        fetchBalance()
    }, [studentId])

    // Temporarily showing Loading until I create the API
    return <div>Loading Bill...</div>
}

export default async function Page({ params }: { params: Promise<{ studentId: string }> }) {
    const { studentId } = await params
    return (
        <BillingContent studentId={studentId} />
    )
}

function BillingContent({ studentId }: { studentId: string }) {
    const [data, setData] = useState<any>(null)

    useEffect(() => {
        fetch(`/api/reports/bill?studentId=${studentId}`).then(res => res.json()).then(setData)
    }, [studentId])

    if (!data) return <div className={styles.container}>Loading Bill details...</div>

    return (
        <div className={styles.container}>
            <div className={styles.header} style={{ printColorAdjust: 'exact', borderBottom: '2px solid #333', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                    <img src="/logo.png" alt="Logo" style={{ height: '80px', marginRight: '1rem' }} />
                    <div>
                        <h1 style={{ margin: 0, fontSize: '2rem', color: '#d63031' }}>Centennial School and College</h1>
                        <p style={{ margin: 0, fontSize: '1.2rem' }}>BILL / INVOICE</p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2rem 0', fontSize: '1.1rem' }}>
                <div>
                    <p><strong>Bill To:</strong> {data.student.fullName}</p>
                    <p><strong>Reg No:</strong> {data.student.registrationNo || '-'}</p>
                    <p><strong>Class:</strong> {data.student.grade} ({data.student.stream})</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                    <p><strong>Invoice #:</strong> {`INV-${data.student.id}-${new Date().getTime().toString().slice(-4)}`}</p>
                </div>
            </div>

            <table className={styles.table} style={{ border: '1px solid #333' }}>
                <thead>
                    <tr style={{ background: '#eee' }}>
                        <th>Description</th>
                        <th style={{ textAlign: 'right' }}>Amount (Rs)</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Dynamic Packages List */}
                    {data.packages && data.packages.map((pkg: any) => (
                        <tr key={pkg.id}>
                            <td>
                                <div><strong>{pkg.name}</strong></div>
                                {pkg.breakdown && <div style={{ fontSize: '0.85rem', color: '#636e72', whiteSpace: 'pre-wrap', marginTop: '0.2rem' }}>{pkg.breakdown}</div>}
                                {pkg.discount > 0 && <div style={{ fontSize: '0.9rem', color: '#636e72' }}>Less: Discount</div>}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                                <div>{pkg.totalFee.toLocaleString()}</div>
                                {pkg.discount > 0 && <div style={{ fontSize: '0.9rem', color: '#636e72' }}>- {pkg.discount.toLocaleString()}</div>}
                            </td>
                        </tr>
                    ))}

                    {/* Totals Section */}
                    <tr style={{ borderTop: '2px solid #333' }}>
                        <td><strong>Net Payable Total</strong></td>
                        <td style={{ textAlign: 'right' }}><strong>{(data.summary.totalFee - data.summary.discount).toLocaleString()}</strong></td>
                    </tr>
                    <tr>
                        <td>Less: Paid Amount</td>
                        <td style={{ textAlign: 'right' }}>- {data.summary.paid.toLocaleString()}</td>
                    </tr>
                    <tr style={{ fontSize: '1.2rem', background: '#f0f0f0' }}>
                        <td><strong>BALANCE DUE</strong></td>
                        <td style={{ textAlign: 'right', color: 'red' }}><strong>{data.summary.due.toLocaleString()}</strong></td>
                    </tr>
                </tbody>
            </table>

            <div style={{ marginTop: '3rem', textAlign: 'center', fontSize: '0.9rem' }}>
                <p>Thank you for your timely payment.</p>
                <button className={styles.button} onClick={() => window.print()}>Print Bill</button>
            </div>
        </div>
    )
}

'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import styles from '../receipt.module.css'

interface PaymentDetail {
    id: number
    amount: number
    date: string
    method: string
    remarks: string
    student: {
        fullName: string
        rollNo: string
        grade: string
        section: string
    }
}

export default function ReceiptPage() {
    const params = useParams()
    const [payment, setPayment] = useState<PaymentDetail | null>(null)

    useEffect(() => {
        fetch('/api/payments') // Ideally fetch specific payment
            .then(res => res.json())
            .then((data: PaymentDetail[]) => {
                const p = data.find(d => d.id === parseInt(params.id as string))
                if (p) setPayment(p)
            })
    }, [params.id])

    if (!payment) return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading receipt...</div>

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.collegeName}>XYZ Higher Secondary School</h1>
                <p className={styles.subHeader}>Kathmandu, Nepal | Estd. 2000</p>
                <p className={styles.subHeader}>Tel: 01-4444444 | Email: info@xyzcollege.edu.np</p>
            </header>

            <div className={styles.receiptTitle}>Cash Receipt</div>

            <div className={styles.grid}>
                <div>
                    <div className={styles.row}>
                        <span className={styles.label}>Receipt No:</span>
                        <span className={styles.value}>{payment.id.toString().padStart(6, '0')}</span>
                    </div>
                    <div className={styles.row}>
                        <span className={styles.label}>Student Name:</span>
                        <span className={styles.value}>{payment.student.fullName}</span>
                    </div>
                    <div className={styles.row}>
                        <span className={styles.label}>Class / Sec:</span>
                        <span className={styles.value}>{payment.student.grade} / {payment.student.section}</span>
                    </div>
                </div>
                <div>
                    <div className={styles.row}>
                        <span className={styles.label}>Date:</span>
                        <span className={styles.value}>{new Date(payment.date).toLocaleDateString()}</span>
                    </div>
                    <div className={styles.row}>
                        <span className={styles.label}>Roll No:</span>
                        <span className={styles.value}>{payment.student.rollNo}</span>
                    </div>
                    <div className={styles.row}>
                        <span className={styles.label}>Pay Mode:</span>
                        <span className={styles.value}>{payment.method}</span>
                    </div>
                </div>
            </div>

            <div className={styles.amountBox}>
                Amount Paid: NPR {payment.amount.toLocaleString()}
            </div>

            {payment.remarks && (
                <div style={{ marginTop: '1rem' }}>
                    <strong>Remarks:</strong> {payment.remarks}
                </div>
            )}

            <footer className={styles.footer}>
                <div className={styles.signature}>
                    Prepared By
                </div>
                <div className={styles.signature}>
                    Authorized Signature
                </div>
            </footer>

            <div className={styles.actions}>
                <button className={styles.printBtn} onClick={() => window.print()}>Print Receipt</button>
            </div>
        </div>
    )
}

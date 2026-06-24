import { useState } from 'react';
import { motion } from 'framer-motion';
import styles from './TransactionModal.module.css';

export default function TransactionModal({ title, initial, onSubmit, onClose }) {
  const [form, setForm] = useState({
    from_account: initial?.from_account || '',
    to_account:   initial?.to_account   || '',
    amount:       initial?.amount       || '',
    category:     initial?.category     || 'other',
    status:       initial?.status       || 'completed',
    note:         initial?.note         || '',
  });
  const [loading, setLoading] = useState(false);

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await onSubmit(form); }
    finally { setLoading(false); }
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div
        className={styles.modal}
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.18 }}
      >
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>From</label>
              <input className={styles.input} name="from_account" placeholder="Sender" value={form.from_account} onChange={set} required autoFocus />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>To</label>
              <input className={styles.input} name="to_account" placeholder="Recipient" value={form.to_account} onChange={set} required />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Amount ($)</label>
              <input className={styles.input} name="amount" type="number" placeholder="0.00" min="0.01" step="0.01" value={form.amount} onChange={set} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Category</label>
              <select className={styles.input} name="category" value={form.category} onChange={set}>
                <option value="salary">💼 Salary</option>
                <option value="expense">🛒 Expense</option>
                <option value="transfer">↔️ Transfer</option>
                <option value="other">📌 Other</option>
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Status</label>
            <select className={styles.input} name="status" value={form.status} onChange={set}>
              <option value="completed">✅ Completed</option>
              <option value="pending">⏳ Pending</option>
              <option value="cancelled">❌ Cancelled</option>
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Note (optional)</label>
            <textarea className={`${styles.input} ${styles.textarea}`} name="note" placeholder="Add a note…" value={form.note} onChange={set} rows={2} />
          </div>

          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? <span className={styles.spinner} /> : (initial ? 'Save Changes' : 'Add Transaction')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

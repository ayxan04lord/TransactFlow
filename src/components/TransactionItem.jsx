import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './TransactionItem.module.css';

const CATEGORY_EMOJI = { salary: '💼', expense: '🛒', transfer: '↔️', other: '📌' };
const STATUS_COLOR   = { completed: 'green', pending: 'yellow', cancelled: 'red' };
const STATUS_LABEL   = { completed: '✅ Completed', pending: '⏳ Pending', cancelled: '❌ Cancelled' };

export default function TransactionItem({ transaction: tx, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  const date    = new Date(tx.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
  const updated = new Date(tx.updated_at).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className={styles.wrap}>
      {/* Main row */}
      <div className={`${styles.card} ${expanded ? styles.cardOpen : ''}`} onClick={() => setExpanded(v => !v)}>
        <div className={styles.left}>
          <div className={styles.arrow}>
            <span className={styles.fromLabel}>{tx.from_account}</span>
            <span className={styles.arrowIcon}>→</span>
            <span className={styles.toLabel}>{tx.to_account}</span>
          </div>
          <div className={styles.meta}>
            <span className={`${styles.badge} ${styles[tx.category]}`}>
              {CATEGORY_EMOJI[tx.category] || '📌'} {tx.category}
            </span>
            <span className={`${styles.statusDot} ${styles[STATUS_COLOR[tx.status]]}`} title={tx.status} />
            <span className={styles.date}>{date}</span>
            {tx.note && <span className={styles.noteIcon} title={tx.note}>💬</span>}
          </div>
        </div>
        <div className={styles.right}>
          <span className={styles.amount}>${parseFloat(tx.amount).toLocaleString('en', { minimumFractionDigits: 2 })}</span>
          <div className={styles.actions} onClick={e => e.stopPropagation()}>
            <button className={styles.editBtn}   onClick={onEdit}   title="Edit (E)">✏️</button>
            <button className={styles.deleteBtn} onClick={onDelete} title="Delete">🗑️</button>
          </div>
          <span className={styles.chevron}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            className={styles.detail}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Status</span>
                <span className={styles.detailValue}>{STATUS_LABEL[tx.status]}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Category</span>
                <span className={styles.detailValue}>{CATEGORY_EMOJI[tx.category]} {tx.category}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Created</span>
                <span className={styles.detailValue}>{date}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Updated</span>
                <span className={styles.detailValue}>{updated}</span>
              </div>
              {tx.note && (
                <div className={styles.detailItem} style={{ gridColumn: '1 / -1' }}>
                  <span className={styles.detailLabel}>Note</span>
                  <span className={styles.detailValue}>{tx.note}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

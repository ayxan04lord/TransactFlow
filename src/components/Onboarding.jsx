import { motion } from 'framer-motion';
import styles from './Onboarding.module.css';

const STEPS = [
  { icon: '➕', title: 'Add your first transaction', desc: 'Click the "+ New" button or press N to create a transaction.' },
  { icon: '🔍', title: 'Filter & search', desc: 'Use the filter bar to search by name, category, status or date range.' },
  { icon: '📊', title: 'View analytics', desc: 'Toggle "Show Charts" to see monthly volume, category breakdown and status.' },
  { icon: '↓', title: 'Export CSV', desc: 'Download all transactions as a CSV file anytime.' },
];

export default function Onboarding({ onDismiss }) {
  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onDismiss()}>
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1,    y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        <div className={styles.header}>
          <span className={styles.logo}>💸</span>
          <h2 className={styles.title}>Welcome to TransactFlow!</h2>
          <p className={styles.sub}>Here's a quick guide to get you started.</p>
        </div>

        <div className={styles.steps}>
          {STEPS.map((s, i) => (
            <motion.div
              key={i}
              className={styles.step}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
            >
              <span className={styles.stepIcon}>{s.icon}</span>
              <div>
                <p className={styles.stepTitle}>{s.title}</p>
                <p className={styles.stepDesc}>{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <button className={styles.btn} onClick={onDismiss}>Get started →</button>
      </motion.div>
    </div>
  );
}

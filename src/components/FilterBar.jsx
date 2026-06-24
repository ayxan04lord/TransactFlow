import styles from './FilterBar.module.css';

const CATEGORIES = ['', 'salary', 'expense', 'transfer', 'other'];
const STATUSES   = ['', 'pending', 'completed', 'cancelled'];
const SORTS = [
  { value: '-created_at', label: '↓ Newest' },
  { value:  'created_at', label: '↑ Oldest' },
  { value: '-amount',     label: '↓ Amount' },
  { value:  'amount',     label: '↑ Amount' },
];

const active = (f) =>
  f.search || f.category || f.status || f.date_from || f.date_to;

export default function FilterBar({ filters, onChange }) {
  const set   = (key, val) => onChange({ ...filters, [key]: val });
  const clear = () => onChange({ search: '', category: '', status: '', date_from: '', date_to: '', sort: '-created_at' });

  return (
    <div className={styles.wrap}>
      <div className={styles.bar}>
        <input
          className={styles.search}
          type="text"
          placeholder="Search…"
          value={filters.search}
          onChange={e => set('search', e.target.value)}
        />

        <select className={styles.select} value={filters.category} onChange={e => set('category', e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.filter(Boolean).map(c => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>

        <select className={styles.select} value={filters.status} onChange={e => set('status', e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.filter(Boolean).map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>

        <select className={styles.select} value={filters.sort || '-created_at'} onChange={e => set('sort', e.target.value)}>
          {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <div className={styles.dateRow}>
        <div className={styles.dateGroup}>
          <span className={styles.dateLabel}>From</span>
          <input className={styles.date} type="date" value={filters.date_from} onChange={e => set('date_from', e.target.value)} />
        </div>
        <span className={styles.dateSep}>—</span>
        <div className={styles.dateGroup}>
          <span className={styles.dateLabel}>To</span>
          <input className={styles.date} type="date" value={filters.date_to} onChange={e => set('date_to', e.target.value)} />
        </div>
        {active(filters) && (
          <button className={styles.clearBtn} onClick={clear}>✕ Clear filters</button>
        )}
        <span className={styles.hint}>Press <kbd>N</kbd> for new · <kbd>Esc</kbd> to close</span>
      </div>
    </div>
  );
}

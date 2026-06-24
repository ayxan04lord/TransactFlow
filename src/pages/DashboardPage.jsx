import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  fetchTransactions, fetchStats, addTransaction,
  editTransaction, deleteTransaction, logoutUser,
  setFilters, toggleTheme,
} from '../redux/actions';
import TransactionModal from '../components/TransactionModal';
import TransactionItem  from '../components/TransactionItem';
import StatsCharts      from '../components/StatsCharts';
import FilterBar        from '../components/FilterBar';
import Skeleton         from '../components/Skeleton';
import MobileNav        from '../components/MobileNav';
import Onboarding       from '../components/Onboarding';
import styles from './DashboardPage.module.css';

const API   = import.meta.env.VITE_API_URL   || 'http://127.0.0.1:8000/api';
const MEDIA = import.meta.env.VITE_MEDIA_URL || 'http://127.0.0.1:8000';
const ONBOARDING_KEY = 'tf_onboarded';

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { list, loading, stats, filters } = useSelector((s) => s.transactions);
  const user  = useSelector((s) => s.auth.user);
  const token = useSelector((s) => s.auth.token);
  const theme = useSelector((s) => s.ui.theme);

  const [showModal,    setShowModal]    = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);
  const [showCharts,   setShowCharts]   = useState(false);
  const [showOnboard,  setShowOnboard]  = useState(!localStorage.getItem(ONBOARDING_KEY));

  const dismissOnboard = () => {
    localStorage.setItem(ONBOARDING_KEY, '1');
    setShowOnboard(false);
  };

  useEffect(() => {
    dispatch(fetchTransactions(filters));
    dispatch(fetchStats());
  }, [dispatch, filters]);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'n' || e.key === 'N') { e.preventDefault(); setShowModal(true); }
      if (e.key === 'Escape') { setShowModal(false); setEditTarget(null); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAdd = async (formData) => {
    try {
      await dispatch(addTransaction(formData));
      dispatch(fetchStats());
      toast.success('Transaction added!');
      setShowModal(false);
    } catch { toast.error('Failed to add transaction.'); }
  };

  const handleEdit = async (formData) => {
    try {
      await dispatch(editTransaction(editTarget.id, formData));
      dispatch(fetchStats());
      toast.success('Transaction updated!');
      setEditTarget(null);
    } catch { toast.error('Failed to update.'); }
  };

  const handleDelete = (id) => {
    toast((t) => (
      <span style={{ display:'flex', gap:8, alignItems:'center' }}>
        Delete this transaction?
        <button
          style={{ background:'#ef4444', color:'#fff', border:'none', borderRadius:6, padding:'4px 10px', cursor:'pointer' }}
          onClick={() => { dispatch(deleteTransaction(id)); dispatch(fetchStats()); toast.dismiss(t.id); toast.success('Deleted.'); }}
        >Yes</button>
        <button
          style={{ background:'transparent', border:'1px solid #475569', color:'#94a3b8', borderRadius:6, padding:'4px 10px', cursor:'pointer' }}
          onClick={() => toast.dismiss(t.id)}
        >No</button>
      </span>
    ), { duration: 5000 });
  };

  const handleExport = () => {
    fetch(`${API}/transactions/export/`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'transactions.csv'; a.click();
        URL.revokeObjectURL(url);
        toast.success('CSV exported!');
      })
      .catch(() => toast.error('Export failed.'));
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const avatarUrl = user?.profile?.avatar ? `${MEDIA}${user.profile.avatar}` : null;

  const netBalance = stats?.net_balance ?? null;
  const statsCards = [
    { label: 'Transactions',  value: stats?.total_count   ?? '—',                                          icon: '📋' },
    { label: 'Total Volume',  value: stats ? `$${stats.total_volume.toLocaleString('en', { minimumFractionDigits:2 })}` : '—', icon: '💰' },
    { label: 'Net Balance',   value: netBalance !== null ? `$${Math.abs(netBalance).toLocaleString('en', { minimumFractionDigits:2 })}` : '—',
      icon: netBalance >= 0 ? '📈' : '📉',
      sub: netBalance !== null ? (netBalance >= 0 ? 'surplus' : 'deficit') : null,
      color: netBalance >= 0 ? 'var(--green)' : 'var(--red)',
    },
  ];

  return (
    <div className={styles.page}>
      {/* Onboarding */}
      <AnimatePresence>
        {showOnboard && <Onboarding onDismiss={dismissOnboard} />}
      </AnimatePresence>

      {/* Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.navBrand}>
          <span className={styles.navIcon}>💸</span>
          <span className={styles.navTitle}>TransactFlow</span>
        </div>
        <div className={styles.navRight}>
          <button className={styles.iconBtn} onClick={() => dispatch(toggleTheme())} title="Toggle theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <Link to="/profile" className={styles.avatarBtn}>
            {avatarUrl
              ? <img src={avatarUrl} alt="avatar" className={styles.avatarImg} />
              : <span className={styles.avatarFallback}>{user?.username?.[0]?.toUpperCase()}</span>
            }
          </Link>
          <button className={styles.logoutBtn} onClick={() => dispatch(logoutUser())}>Sign Out</button>
        </div>
      </nav>

      <main className={styles.main}>
        {/* Stats */}
        <div className={styles.statsRow}>
          {statsCards.map((s, i) => (
            <motion.div
              key={i}
              className={styles.statCard}
              initial={{ opacity:0, y:12 }}
              animate={{ opacity:1, y:0 }}
              transition={{ delay: i * 0.07 }}
            >
              <div className={styles.statTop}>
                <span className={styles.statLabel}>{s.label}</span>
                <span className={styles.statIcon}>{s.icon}</span>
              </div>
              <span className={styles.statValue} style={s.color ? { color: s.color } : {}}>
                {s.value}
              </span>
              {s.sub && <span className={styles.statSub} style={{ color: s.color }}>{s.sub}</span>}
            </motion.div>
          ))}
        </div>

        {/* Charts toggle */}
        <button className={styles.chartsToggle} onClick={() => setShowCharts(v => !v)}>
          {showCharts ? '▲ Hide Charts' : '▼ Show Charts'}
        </button>
        <AnimatePresence>
          {showCharts && stats && (
            <motion.div
              initial={{ opacity:0, height:0 }}
              animate={{ opacity:1, height:'auto' }}
              exit={{ opacity:0, height:0 }}
              style={{ overflow:'hidden' }}
            >
              <StatsCharts stats={stats} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter bar */}
        <FilterBar filters={filters} onChange={(f) => dispatch(setFilters(f))} />

        {/* Toolbar */}
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            Transactions
            {list.length > 0 && <span className={styles.countBadge}>{list.length}</span>}
          </h2>
          <div className={styles.toolbarRight}>
            <button className={styles.exportBtn} onClick={handleExport} title="Export CSV">↓ CSV</button>
            <button className={styles.addBtn} onClick={() => setShowModal(true)} title="New transaction (N)">+ New</button>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className={styles.list}>
            {[...Array(4)].map((_, i) => <Skeleton key={i} />)}
          </div>
        ) : list.length === 0 ? (
          <motion.div className={styles.empty} initial={{ opacity:0 }} animate={{ opacity:1 }}>
            <span className={styles.emptyIcon}>📭</span>
            <p>No transactions found.</p>
            <button className={styles.emptyBtn} onClick={() => setShowModal(true)}>Add your first one →</button>
          </motion.div>
        ) : (
          <motion.div className={styles.list} layout>
            <AnimatePresence mode="popLayout">
              {list.map((tx) => (
                <motion.div
                  key={tx.id}
                  layout
                  initial={{ opacity:0, y:8 }}
                  animate={{ opacity:1, y:0 }}
                  exit={{ opacity:0, x:-20, scale:0.97 }}
                  transition={{ duration:0.18 }}
                >
                  <TransactionItem
                    transaction={tx}
                    onEdit={() => setEditTarget(tx)}
                    onDelete={() => handleDelete(tx.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      {/* Mobile bottom nav */}
      <MobileNav onNewTx={() => setShowModal(true)} />

      {/* Modals */}
      <AnimatePresence>
        {showModal && (
          <TransactionModal title="New Transaction" onSubmit={handleAdd} onClose={() => setShowModal(false)} />
        )}
        {editTarget && (
          <TransactionModal title="Edit Transaction" initial={editTarget} onSubmit={handleEdit} onClose={() => setEditTarget(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

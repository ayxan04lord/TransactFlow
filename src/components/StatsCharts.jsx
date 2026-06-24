import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip, PieChart, Pie, Cell, Legend, BarChart, Bar, CartesianGrid
} from 'recharts';
import styles from './StatsCharts.module.css';

const COLORS = ['#38bdf8', '#4ade80', '#a78bfa', '#fbbf24', '#f87171'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:10, padding:'10px 14px', fontSize:13 }}>
      <p style={{ color:'var(--text2)', marginBottom:4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || 'var(--accent)', fontWeight:600 }}>
          {typeof p.value === 'number' && p.name === 'total' ? `$${p.value.toFixed(2)}` : p.value}
        </p>
      ))}
    </div>
  );
};

export default function StatsCharts({ stats }) {
  return (
    <div className={styles.grid}>
      {/* Monthly volume */}
      <div className={styles.card}>
        <h4 className={styles.title}>Monthly Volume</h4>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={stats.monthly}>
            <defs>
              <linearGradient id="blue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#38bdf8" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" tick={{ fill:'var(--text3)', fontSize:11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill:'var(--text3)', fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="total" stroke="#38bdf8" strokeWidth={2} fill="url(#blue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* By category pie */}
      <div className={styles.card}>
        <h4 className={styles.title}>By Category</h4>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={stats.by_category.filter(c => c.total > 0)} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
              {stats.by_category.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* By status bar */}
      <div className={styles.card}>
        <h4 className={styles.title}>By Status</h4>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={stats.by_status} barSize={32}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="status" tick={{ fill:'var(--text3)', fontSize:11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill:'var(--text3)', fontSize:11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" fill="#a78bfa" radius={[6,6,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

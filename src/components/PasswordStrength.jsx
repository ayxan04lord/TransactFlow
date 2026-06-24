import styles from './PasswordStrength.module.css';

function getStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 6)  score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { score, label: 'Weak',   color: '#ef4444' };
  if (score <= 2) return { score, label: 'Fair',   color: '#f97316' };
  if (score <= 3) return { score, label: 'Good',   color: '#fbbf24' };
  if (score <= 4) return { score, label: 'Strong', color: '#4ade80' };
  return            { score, label: 'Very strong', color: '#22c55e' };
}

export default function PasswordStrength({ password }) {
  const { score, label, color } = getStrength(password);
  if (!password) return null;

  return (
    <div className={styles.wrap}>
      <div className={styles.bars}>
        {[1,2,3,4,5].map(i => (
          <div
            key={i}
            className={styles.bar}
            style={{ background: i <= score ? color : 'var(--border)' }}
          />
        ))}
      </div>
      <span className={styles.label} style={{ color }}>{label}</span>
    </div>
  );
}

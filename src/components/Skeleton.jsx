import styles from './Skeleton.module.css';

export default function Skeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.left}>
        <div className={styles.line} style={{ width: '120px' }} />
        <div className={styles.line} style={{ width: '80px', height: '10px', marginTop: '8px' }} />
      </div>
      <div className={styles.right}>
        <div className={styles.line} style={{ width: '70px' }} />
        <div className={styles.circle} />
        <div className={styles.circle} />
      </div>
    </div>
  );
}

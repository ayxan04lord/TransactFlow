import { Link, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../redux/actions';
import styles from './MobileNav.module.css';

export default function MobileNav({ onNewTx }) {
  const location = useLocation();
  const dispatch = useDispatch();
  const at = (p) => location.pathname === p;

  return (
    <nav className={styles.nav}>
      <Link className={`${styles.item} ${at('/') ? styles.active : ''}`} to="/">
        <span className={styles.icon}>🏠</span>
        <span className={styles.label}>Home</span>
      </Link>
      <button className={styles.fab} onClick={onNewTx}>
        <span>+</span>
      </button>
      <Link className={`${styles.item} ${at('/profile') ? styles.active : ''}`} to="/profile">
        <span className={styles.icon}>👤</span>
        <span className={styles.label}>Profile</span>
      </Link>
    </nav>
  );
}

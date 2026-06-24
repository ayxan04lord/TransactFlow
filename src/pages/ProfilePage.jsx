import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { updateProfile, changePassword, uploadAvatar } from '../redux/actions';
import PasswordStrength from '../components/PasswordStrength';
import styles from './ProfilePage.module.css';

const MEDIA = import.meta.env.VITE_MEDIA_URL || 'http://127.0.0.1:8000';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const user     = useSelector((s) => s.auth.user);
  const fileRef  = useRef();

  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name || '',
    last_name:  user?.last_name  || '',
    email:      user?.email      || '',
    bio:        user?.profile?.bio || '',
  });
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw,      setSavingPw]      = useState(false);

  const avatarUrl = user?.profile?.avatar ? `${MEDIA}${user.profile.avatar}` : null;

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await dispatch(updateProfile(profileForm));
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePwSave = async (e) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm) {
      toast.error('Passwords do not match.');
      return;
    }
    setSavingPw(true);
    try {
      await dispatch(changePassword({ old_password: pwForm.old_password, new_password: pwForm.new_password }));
      toast.success('Password changed!');
      setPwForm({ old_password: '', new_password: '', confirm: '' });
    } catch {
      toast.error('Incorrect old password.');
    } finally {
      setSavingPw(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await dispatch(uploadAvatar(file));
      toast.success('Avatar updated!');
    } catch {
      toast.error('Failed to upload avatar.');
    }
  };

  return (
    <div className={styles.page}>
      <nav className={styles.navbar}>
        <Link to="/" className={styles.back}>
          ← Dashboard
        </Link>
        <div className={styles.navCenter}>
          <span className={styles.navIcon}>⚙️</span>
          <span className={styles.navTitle}>Profile Settings</span>
        </div>
        <div style={{ width: 120 }} />
      </nav>

      <main className={styles.main}>
        {/* Avatar */}
        <div className={styles.avatarSection}>
          <div className={styles.avatarWrap} onClick={() => fileRef.current.click()}>
            {avatarUrl
              ? <img src={avatarUrl} alt="avatar" className={styles.avatarImg} />
              : <span className={styles.avatarFallback}>{user?.username?.[0]?.toUpperCase()}</span>
            }
            <div className={styles.avatarOverlay}>📷</div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
          <div>
            <p className={styles.avatarUsername}>{user?.username}</p>
            <p className={styles.avatarHint}>Click avatar to change</p>
          </div>
        </div>

        {/* Profile form */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Personal Info</h3>
          <form onSubmit={handleProfileSave} className={styles.form}>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>First Name</label>
                <input className={styles.input} value={profileForm.first_name}
                  onChange={e => setProfileForm({ ...profileForm, first_name: e.target.value })} placeholder="First name" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Last Name</label>
                <input className={styles.input} value={profileForm.last_name}
                  onChange={e => setProfileForm({ ...profileForm, last_name: e.target.value })} placeholder="Last name" />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input className={styles.input} type="email" value={profileForm.email}
                onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} placeholder="Email" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Bio</label>
              <textarea className={`${styles.input} ${styles.textarea}`} value={profileForm.bio}
                onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                placeholder="Tell us a bit about yourself…" rows={2} />
            </div>
            <button className={styles.btn} type="submit" disabled={savingProfile}>
              {savingProfile ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Password */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Change Password</h3>
          <form onSubmit={handlePwSave} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Current Password</label>
              <input className={styles.input} type="password" value={pwForm.old_password}
                onChange={e => setPwForm({ ...pwForm, old_password: e.target.value })} placeholder="••••••" required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>New Password</label>
              <input className={styles.input} type="password" value={pwForm.new_password}
                onChange={e => setPwForm({ ...pwForm, new_password: e.target.value })} placeholder="Min. 6 characters" required />
              <PasswordStrength password={pwForm.new_password} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Confirm New Password</label>
              <input className={styles.input} type="password" value={pwForm.confirm}
                onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} placeholder="Repeat" required />
            </div>
            <button className={styles.btn} type="submit" disabled={savingPw}>
              {savingPw ? 'Saving…' : 'Update Password'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

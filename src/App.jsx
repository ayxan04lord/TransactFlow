import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import LoginPage    from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage  from './pages/ProfilePage';

const PrivateRoute = ({ children }) => {
  const token = useSelector((s) => s.auth.token);
  return token ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const token = useSelector((s) => s.auth.token);
  return token ? <Navigate to="/" replace /> : children;
};

export default function App() {
  const theme = useSelector((s) => s.ui.theme);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: 'var(--bg2)', color: 'var(--text)', border: '1px solid var(--border)' },
          success: { iconTheme: { primary: '#4ade80', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
      <Routes>
        <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/"         element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/profile"  element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="*"         element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

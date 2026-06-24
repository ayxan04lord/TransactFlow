import axios from 'axios';

const API      = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
const MEDIA    = import.meta.env.VITE_MEDIA_URL || 'http://127.0.0.1:8000';

const authHeaders = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

// ─── TOKEN REFRESH ────────────────────────────────────────────────────────────
let refreshing = null;
axios.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('refresh');
      if (refresh) {
        if (!refreshing) {
          refreshing = axios.post(`${API}/auth/refresh/`, { refresh })
            .then(r => { localStorage.setItem('token', r.data.access); return r.data.access; })
            .catch(() => { localStorage.clear(); window.location.href = '/login'; })
            .finally(() => { refreshing = null; });
        }
        const newToken = await refreshing;
        if (newToken) {
          original.headers.Authorization = `Bearer ${newToken}`;
          return axios(original);
        }
      }
    }
    return Promise.reject(err);
  }
);

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const loginUser = (credentials) => async (dispatch) => {
  dispatch({ type: 'AUTH_LOADING' });
  try {
    const { data } = await axios.post(`${API}/auth/login/`, credentials);
    localStorage.setItem('token',   data.access);
    localStorage.setItem('refresh', data.refresh);
    const { data: user } = await axios.get(`${API}/auth/me/`, authHeaders(data.access));
    localStorage.setItem('user', JSON.stringify(user));
    dispatch({ type: 'AUTH_SUCCESS', payload: { token: data.access, user } });
  } catch (err) {
    dispatch({ type: 'AUTH_ERROR', payload: err.response?.data?.detail || 'Invalid credentials.' });
  }
};

export const registerUser = (formData) => async (dispatch) => {
  dispatch({ type: 'AUTH_LOADING' });
  try {
    await axios.post(`${API}/auth/register/`, formData);
    dispatch(loginUser({ username: formData.username, password: formData.password }));
  } catch (err) {
    const errors = err.response?.data;
    const msg    = errors ? Object.values(errors).flat().join(' ') : 'Registration failed.';
    dispatch({ type: 'AUTH_ERROR', payload: msg });
  }
};

export const logoutUser = () => (dispatch) => {
  localStorage.clear();
  dispatch({ type: 'LOGOUT' });
};

export const updateProfile = (data) => async (dispatch, getState) => {
  const { token } = getState().auth;
  const { data: user } = await axios.patch(`${API}/auth/me/`, data, authHeaders(token));
  localStorage.setItem('user', JSON.stringify(user));
  dispatch({ type: 'AUTH_UPDATE', payload: user });
};

export const changePassword = (data) => async (_, getState) => {
  const { token } = getState().auth;
  await axios.post(`${API}/auth/change-password/`, data, authHeaders(token));
};

export const uploadAvatar = (file) => async (dispatch, getState) => {
  const { token } = getState().auth;
  const form = new FormData();
  form.append('avatar', file);
  const { data: user } = await axios.post(
    `${API}/auth/avatar/`, form,
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
  );
  localStorage.setItem('user', JSON.stringify(user));
  dispatch({ type: 'AUTH_UPDATE', payload: user });
};

// ─── TRANSACTIONS ─────────────────────────────────────────────────────────────
export const fetchTransactions = (filters = {}) => async (dispatch, getState) => {
  dispatch({ type: 'TX_LOADING' });
  try {
    const { token } = getState().auth;
    const params    = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
    const { data } = await axios.get(`${API}/transactions/?${params}`, authHeaders(token));
    dispatch({ type: 'TX_SUCCESS', payload: data });
  } catch {
    dispatch({ type: 'TX_ERROR', payload: 'Failed to load transactions.' });
  }
};

export const fetchStats = () => async (dispatch, getState) => {
  const { token } = getState().auth;
  const { data }  = await axios.get(`${API}/transactions/stats/`, authHeaders(token));
  dispatch({ type: 'TX_STATS', payload: data });
};

export const addTransaction = (tx) => async (dispatch, getState) => {
  const { token } = getState().auth;
  const { data }  = await axios.post(`${API}/transactions/`, tx, authHeaders(token));
  dispatch({ type: 'TX_ADD', payload: data });
};

export const editTransaction = (id, tx) => async (dispatch, getState) => {
  const { token } = getState().auth;
  const { data }  = await axios.put(`${API}/transactions/${id}/`, tx, authHeaders(token));
  dispatch({ type: 'TX_UPDATE', payload: data });
};

export const deleteTransaction = (id) => async (dispatch, getState) => {
  const { token } = getState().auth;
  await axios.delete(`${API}/transactions/${id}/`, authHeaders(token));
  dispatch({ type: 'TX_DELETE', payload: id });
};

export const setFilters = (filters) => ({ type: 'TX_FILTERS', payload: filters });
export const toggleTheme = () => ({ type: 'TOGGLE_THEME' });

export { MEDIA };

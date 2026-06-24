import { combineReducers } from 'redux';

// ─── AUTH ─────────────────────────────────────────────────────────────────
const authInitial = {
  user:    JSON.parse(localStorage.getItem('user')) || null,
  token:   localStorage.getItem('token') || null,
  loading: false,
  error:   null,
};

const authReducer = (state = authInitial, action) => {
  switch (action.type) {
    case 'AUTH_LOADING': return { ...state, loading: true,  error: null };
    case 'AUTH_SUCCESS': return { ...state, loading: false, user: action.payload.user, token: action.payload.token, error: null };
    case 'AUTH_ERROR':   return { ...state, loading: false, error: action.payload };
    case 'AUTH_UPDATE':  return { ...state, user: action.payload };
    case 'LOGOUT':       return { user: null, token: null, loading: false, error: null };
    default:             return state;
  }
};

// ─── TRANSACTIONS ─────────────────────────────────────────────────────────
const txInitial = {
  list:    [],
  stats:   null,
  loading: false,
  error:   null,
  filters: { search: '', category: '', status: '', date_from: '', date_to: '', sort: '-created_at' },
};

const transactionsReducer = (state = txInitial, action) => {
  switch (action.type) {
    case 'TX_LOADING':  return { ...state, loading: true,  error: null };
    case 'TX_SUCCESS':  return { ...state, loading: false, list: action.payload };
    case 'TX_ERROR':    return { ...state, loading: false, error: action.payload };
    case 'TX_STATS':    return { ...state, stats: action.payload };
    case 'TX_ADD':      return { ...state, list: [action.payload, ...state.list] };
    case 'TX_UPDATE':   return { ...state, list: state.list.map(t => t.id === action.payload.id ? action.payload : t) };
    case 'TX_DELETE':   return { ...state, list: state.list.filter(t => t.id !== action.payload) };
    case 'TX_FILTERS':  return { ...state, filters: { ...state.filters, ...action.payload } };
    default:            return state;
  }
};

// ─── UI ───────────────────────────────────────────────────────────────────
const uiInitial = { theme: localStorage.getItem('theme') || 'dark' };

const uiReducer = (state = uiInitial, action) => {
  switch (action.type) {
    case 'TOGGLE_THEME': {
      const next = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', next);
      return { ...state, theme: next };
    }
    default: return state;
  }
};

export default combineReducers({
  auth:         authReducer,
  transactions: transactionsReducer,
  ui:           uiReducer,
});

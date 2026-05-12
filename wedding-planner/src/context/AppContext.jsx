import { createContext, useContext, useReducer, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const AppContext = createContext();
const API = '/api';

function emptyWeddingData() {
  return {
    project: { coupleName: '', projectName: '', eventDate: '', phrase: '', photo: null, bridePhoto: null, groomPhoto: null },
    guests: [], checklist: [], budget: [], vendors: [], gifts: [], houseItems: [],
    weddingPlanner: {
      ceremony: { church: '', time: '', priest: '', notes: '' },
      party: { venue: '', time: '', guests: '', theme: '' },
      decoration: { colors: '', style: '', flowers: '' },
      music: { band: '', dj: '', songs: '' },
      food: { starter: '', main: '', dessert: '', cake: '' },
    },
  };
}

const initialState = {
  weddings: [],
  activeWeddingId: null,
  project: { coupleName: '', projectName: '', eventDate: '', phrase: '', photo: null, bridePhoto: null, groomPhoto: null },
  guests: [], checklist: [], budget: [], vendors: [], gifts: [], houseItems: [],
  weddingPlanner: {
    ceremony: { church: '', time: '', priest: '', notes: '' },
    party: { venue: '', time: '', guests: '', theme: '' },
    decoration: { colors: '', style: '', flowers: '' },
    music: { band: '', dj: '', songs: '' },
    food: { starter: '', main: '', dessert: '', cake: '' },
  },
  loading: true,
  onlineUsers: [],
  saving: false,
  lastSaved: null,
};

function appReducer(state, action) {
  switch (action.type) {

    case 'LOAD_INITIAL_DATA':
      return { ...state, ...action.payload, loading: false };

    case 'SOCKET_UPDATE':
      return { ...state, ...action.payload.data };

    case 'SET_ONLINE_USERS':
      return { ...state, onlineUsers: action.payload };

    case 'ADD_ONLINE_USER':
      if (state.onlineUsers.find(u => u.userId === action.payload.userId)) return state;
      return { ...state, onlineUsers: [...state.onlineUsers, action.payload] };

    case 'REMOVE_ONLINE_USER':
      return { ...state, onlineUsers: state.onlineUsers.filter(u => u.userId !== action.payload.userId) };

    case 'SET_SAVING':
      return { ...state, saving: action.payload };

    case 'SET_LAST_SAVED':
      return { ...state, lastSaved: action.payload };

    case 'UPDATE_PROJECT':
      return { ...state, project: { ...state.project, ...action.payload } };

    case 'ADD_GUEST':
      return { ...state, guests: [...state.guests, { id: Date.now(), ...action.payload }] };
    case 'UPDATE_GUEST':
      return { ...state, guests: state.guests.map(g => g.id === action.payload.id ? { ...g, ...action.payload } : g) };
    case 'DELETE_GUEST':
      return { ...state, guests: state.guests.filter(g => g.id !== action.payload) };

    case 'ADD_CHECKLIST':
      return { ...state, checklist: [...state.checklist, { id: Date.now(), ...action.payload }] };
    case 'TOGGLE_CHECKLIST':
      return { ...state, checklist: state.checklist.map(c => c.id === action.payload ? { ...c, done: !c.done } : c) };
    case 'UPDATE_CHECKLIST':
      return { ...state, checklist: state.checklist.map(c => c.id === action.payload.id ? { ...c, ...action.payload } : c) };
    case 'DELETE_CHECKLIST':
      return { ...state, checklist: state.checklist.filter(c => c.id !== action.payload) };

    case 'ADD_BUDGET':
      return { ...state, budget: [...state.budget, { id: Date.now(), ...action.payload }] };
    case 'UPDATE_BUDGET':
      return { ...state, budget: state.budget.map(b => b.id === action.payload.id ? { ...b, ...action.payload } : b) };
    case 'DELETE_BUDGET':
      return { ...state, budget: state.budget.filter(b => b.id !== action.payload) };

    case 'ADD_VENDOR':
      return { ...state, vendors: [...state.vendors, { id: Date.now(), ...action.payload }] };
    case 'UPDATE_VENDOR':
      return { ...state, vendors: state.vendors.map(v => v.id === action.payload.id ? { ...v, ...action.payload } : v) };
    case 'DELETE_VENDOR':
      return { ...state, vendors: state.vendors.filter(v => v.id !== action.payload) };

    case 'ADD_GIFT':
      return { ...state, gifts: [...state.gifts, { id: Date.now(), ...action.payload }] };
    case 'UPDATE_GIFT':
      return { ...state, gifts: state.gifts.map(g => g.id === action.payload.id ? { ...g, ...action.payload } : g) };
    case 'DELETE_GIFT':
      return { ...state, gifts: state.gifts.filter(g => g.id !== action.payload) };

    case 'ADD_HOUSE_ITEM':
      return { ...state, houseItems: [...state.houseItems, { id: Date.now(), ...action.payload }] };
    case 'UPDATE_HOUSE_ITEM':
      return { ...state, houseItems: state.houseItems.map(h => h.id === action.payload.id ? { ...h, ...action.payload } : h) };
    case 'DELETE_HOUSE_ITEM':
      return { ...state, houseItems: state.houseItems.filter(h => h.id !== action.payload) };

    case 'UPDATE_WEDDING_PLANNER':
      return { ...state, weddingPlanner: { ...state.weddingPlanner, ...action.payload } };

    case 'CREATE_WEDDING':
      return { ...state, weddings: [...state.weddings, action.payload] };

    case 'DELETE_WEDDING': {
      const newWeddings = state.weddings.filter(w => w.id !== action.payload);
      const newActive = newWeddings.length > 0
        ? (state.activeWeddingId === action.payload ? newWeddings[0].id : state.activeWeddingId)
        : null;
      if (newActive !== state.activeWeddingId) {
        return { ...state, weddings: newWeddings, activeWeddingId: newActive, ...emptyWeddingData() };
      }
      return { ...state, weddings: newWeddings };
    }

    case 'SET_ACTIVE_WEDDING': {
      const wedding = state.weddings.find(w => w.id === action.payload);
      const empty = emptyWeddingData();
      if (wedding) {
        empty.project = {
          ...empty.project,
          coupleName: wedding.coupleName || '',
          projectName: wedding.projectName || '',
          eventDate: wedding.eventDate || '',
          phrase: wedding.phrase || '',
        };
      }
      return { ...state, activeWeddingId: action.payload, ...empty };
    }

    case 'UPDATE_WEDDING_META':
      return {
        ...state,
        weddings: state.weddings.map(w => w.id === action.payload.id ? { ...w, ...action.payload.data } : w),
        project: { ...state.project, ...action.payload.data },
      };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [initialized, setInitialized] = useState(false);
  const socketRef = useRef(null);
  const socketUpdateRef = useRef(false);
  const saveTimeoutRef = useRef(null);
  const { user, loading: authLoading, authFetch, token } = useAuth();

  // Socket connection (with auth token)
  useEffect(() => {
    if (!token) return;
    const socket = io({ auth: { token } });
    socketRef.current = socket;

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    return () => socket.disconnect();
  }, [token]);

  // Join/leave project room + listen for events
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !state.activeWeddingId) return;

    socket.emit('join:project', state.activeWeddingId);

    const handleDataUpdated = (payload) => {
      socketUpdateRef.current = true;
      dispatch({ type: 'SOCKET_UPDATE', payload });
    };
    const handleUserJoined = (u) => dispatch({ type: 'ADD_ONLINE_USER', payload: u });
    const handleUserLeft = (u) => dispatch({ type: 'REMOVE_ONLINE_USER', payload: u });

    socket.on('data:updated', handleDataUpdated);
    socket.on('user:joined', handleUserJoined);
    socket.on('user:left', handleUserLeft);

    return () => {
      socket.emit('leave:project', state.activeWeddingId);
      socket.off('data:updated', handleDataUpdated);
      socket.off('user:joined', handleUserJoined);
      socket.off('user:left', handleUserLeft);
      dispatch({ type: 'SET_ONLINE_USERS', payload: [] });
    };
  }, [state.activeWeddingId]);

  // Load initial data (only when auth is ready)
  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;

    async function init() {
      let weddings = [];
      let activeId = null;
      let weddingData = null;
      let loadedFromServer = false;
      let loadedFromLocalStorage = false;

      // Step 1: Try fetching from server (requires auth)
      try {
        const r = await authFetch(`${API}/weddings`);
        if (r.ok) weddings = await r.json();
      } catch {}

      if (weddings.length > 0) {
        activeId = weddings[0].id;
        try {
          const r = await authFetch(`${API}/wedding-data/${activeId}`);
          if (r.ok) weddingData = await r.json();
        } catch {}
        // Only consider data valid if we also got wedding data
        if (weddingData && Object.keys(weddingData).length > 0) {
          loadedFromServer = true;
        }
      }

      // Step 2: If server had only partial data (weddings list but empty detail),
      // try migrating from localStorage
      if (!loadedFromServer && weddings.length > 0) {
        try {
          const saved = localStorage.getItem(`wedding-data-${activeId}`);
          if (saved) weddingData = JSON.parse(saved);
        } catch {}
        if (weddingData && Object.keys(weddingData).length > 0) {
          loadedFromLocalStorage = true;
          // Migrate to server
          try {
            await authFetch(`${API}/wedding-data/${activeId}`, {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(weddingData),
            });
          } catch {}
        }
      }

      // Step 3: If server had no weddings at all, try localStorage
      if (weddings.length === 0) {
        try {
          const saved = localStorage.getItem('wedding-planner-weddings');
          if (saved) weddings = JSON.parse(saved);
        } catch {}
        if (weddings.length > 0) {
          activeId = weddings[0].id;
          try {
            const saved = localStorage.getItem(`wedding-data-${activeId}`);
            if (saved) weddingData = JSON.parse(saved);
          } catch {}
          loadedFromLocalStorage = true;
          // Migrate entire dataset to server
          try {
            await authFetch(`${API}/weddings`, {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(weddings),
            });
            if (weddingData) {
              await authFetch(`${API}/wedding-data/${activeId}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(weddingData),
              });
            }
          } catch {}
        }
      }

      // Step 4: No demo data — user starts from scratch
      if (weddings.length === 0) {
        weddingData = emptyWeddingData();
      }

      // Merge wedding metadata into project when detail data lacks project fields
      if (weddings.length > 0 && (!weddingData || !weddingData.project?.coupleName)) {
        const meta = weddings.find(w => w.id === activeId);
        if (meta) {
          weddingData = weddingData || {};
          weddingData.project = {
            ...(weddingData.project || {}),
            coupleName: meta.coupleName || weddingData.project?.coupleName || '',
            projectName: meta.projectName || weddingData.project?.projectName || '',
            eventDate: meta.eventDate || weddingData.project?.eventDate || '',
            phrase: meta.phrase || weddingData.project?.phrase || '',
          };
        }
      }

      if (cancelled) return;
      dispatch({
        type: 'LOAD_INITIAL_DATA',
        payload: {
          weddings,
          activeWeddingId: activeId,
          ...(weddingData || emptyWeddingData()),
          loading: false,
        },
      });
      setInitialized(true);
    }
    init();
    return () => { cancelled = true; };
  }, [authLoading, user?.id]);

  // Save to server on state change (debounced 500ms, skip socket-originated)
  useEffect(() => {
    if (!initialized || state.loading) return;

    if (socketUpdateRef.current) {
      socketUpdateRef.current = false;
      return;
    }

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      const detailFields = ['project', 'guests', 'checklist', 'budget', 'vendors', 'gifts', 'houseItems', 'weddingPlanner'];
      const data = {};
      detailFields.forEach(f => { data[f] = state[f]; });

      const id = state.activeWeddingId;
      if (!id) return;

      dispatch({ type: 'SET_SAVING', payload: true });

      try {
        await authFetch(`${API}/wedding-data/${id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        await authFetch(`${API}/weddings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(state.weddings),
        });
        dispatch({ type: 'SET_LAST_SAVED', payload: Date.now() });
      } catch (err) {
        console.error('Save failed:', err);
      } finally {
        dispatch({ type: 'SET_SAVING', payload: false });
      }
    }, 500);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [state, initialized, user?.id]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}

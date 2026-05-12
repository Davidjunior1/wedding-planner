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

function demoWeddingData() {
  return {
    project: {
      coupleName: 'Ana & Pedro', projectName: 'Nosso Casamento dos Sonhos',
      eventDate: '2026-12-12', phrase: 'O amor nunca falha.',
      photo: null, bridePhoto: null, groomPhoto: null,
    },
    guests: [
      { id: 1, name: 'Maria Silva', category: 'Família', status: 'confirmed', phone: '(11) 99999-0001' },
      { id: 2, name: 'João Santos', category: 'Família', status: 'pending', phone: '(11) 99999-0002' },
      { id: 3, name: 'Carla Oliveira', category: 'Amigos', status: 'confirmed', phone: '(11) 99999-0003' },
      { id: 4, name: 'Roberto Lima', category: 'Amigos', status: 'declined', phone: '(11) 99999-0004' },
      { id: 5, name: 'Lucia Mendes', category: 'Família', status: 'confirmed', phone: '(11) 99999-0005' },
      { id: 6, name: 'Fernando Costa', category: 'Trabalho', status: 'pending', phone: '(11) 99999-0006' },
      { id: 7, name: 'Patrícia Rocha', category: 'Amigos', status: 'confirmed', phone: '(11) 99999-0007' },
      { id: 8, name: 'Carlos Eduardo', category: 'Família', status: 'pending', phone: '(11) 99999-0008' },
    ],
    checklist: [
      { id: 1, task: 'Reservar igreja', category: 'Cerimônia', priority: 'high', done: true },
      { id: 2, task: 'Contratar buffet', category: 'Festa', priority: 'high', done: true },
      { id: 3, task: 'Escolher vestido de noiva', category: 'Noiva', priority: 'high', done: false },
      { id: 4, task: 'Reservar lua de mel', category: 'Viagem', priority: 'medium', done: false },
      { id: 5, task: 'Enviar convites', category: 'Convidados', priority: 'high', done: false },
      { id: 6, task: 'Contratar fotógrafo', category: 'Festa', priority: 'high', done: true },
      { id: 7, task: 'Escolher alianças', category: 'Cerimônia', priority: 'medium', done: false },
      { id: 8, task: 'Definir lista de músicas', category: 'Festa', priority: 'low', done: false },
      { id: 9, task: 'Contratar DJ', category: 'Festa', priority: 'high', done: false },
      { id: 10, task: 'Provar terno do noivo', category: 'Noivo', priority: 'medium', done: false },
    ],
    budget: [
      { id: 1, category: 'Buffet', estimated: 15000, spent: 14000 },
      { id: 2, category: 'Igreja', estimated: 3000, spent: 3000 },
      { id: 3, category: 'Fotografia', estimated: 5000, spent: 5000 },
      { id: 4, category: 'Vestido', estimated: 8000, spent: 0 },
      { id: 5, category: 'Música/DJ', estimated: 4000, spent: 0 },
      { id: 6, category: 'Decoração', estimated: 7000, spent: 2000 },
      { id: 7, category: 'Convidados', estimated: 2000, spent: 500 },
      { id: 8, category: 'Lua de Mel', estimated: 12000, spent: 0 },
    ],
    vendors: [
      { id: 1, name: 'Buffet Delícias', service: 'Buffet', contact: 'Maria - (11) 98888-0001', budget: 15000, hired: true },
      { id: 2, name: 'Foto Arte', service: 'Fotografia', contact: 'Carlos - (11) 98888-0002', budget: 5000, hired: true },
      { id: 3, name: 'DJ Pablo', service: 'Música', contact: '(11) 98888-0003', budget: 4000, hired: false },
      { id: 4, name: 'Flores & Cia', service: 'Decoração', contact: 'Ana - (11) 98888-0004', budget: 7000, hired: false },
      { id: 5, name: 'Igreja São José', service: 'Cerimônia', contact: 'Pe. Antônio - (11) 98888-0005', budget: 3000, hired: true },
    ],
    gifts: [
      { id: 1, item: 'Jogo de Panelas', store: 'Magazine Luiza', price: 450, status: 'pending' },
      { id: 2, item: 'Liquidificador', store: 'Amazon', price: 200, status: 'bought' },
      { id: 3, item: 'Jogo de Cama', store: 'Riachuelo', price: 350, status: 'pending' },
      { id: 4, item: 'Micro-ondas', store: 'Casas Bahia', price: 600, status: 'pending' },
      { id: 5, item: 'Batedeira', store: 'Magazine Luiza', price: 300, status: 'bought' },
    ],
    houseItems: [
      { id: 1, item: 'Sofá', category: 'Sala', status: 'pending', priority: 'high' },
      { id: 2, item: 'Mesa de Jantar', category: 'Sala de Jantar', status: 'bought', priority: 'high' },
      { id: 3, item: 'Cama de Casal', category: 'Quarto', status: 'bought', priority: 'high' },
      { id: 4, item: 'Geladeira', category: 'Cozinha', status: 'pending', priority: 'high' },
      { id: 5, item: 'Fogão', category: 'Cozinha', status: 'bought', priority: 'high' },
      { id: 6, item: 'TV 50"', category: 'Sala', status: 'pending', priority: 'medium' },
      { id: 7, item: 'Tapete', category: 'Sala', status: 'pending', priority: 'low' },
    ],
    weddingPlanner: {
      ceremony: { church: 'Igreja São José', time: '16:00', priest: 'Pe. Antônio', notes: '' },
      party: { venue: 'Espaço Villa Floresta', time: '19:00', guests: 150, theme: 'Romântico Clássico' },
      decoration: { colors: ['Blush', 'Dourado', 'Verde Sálvia'], style: 'Clássico', flowers: 'Rosas e Lírios' },
      music: { band: '', dj: 'DJ Pablo', songs: ['Marcha Nupcial', 'Perfect - Ed Sheeran'] },
      food: { starter: 'Canapés', main: 'Filé Mignon', dessert: 'Bolo de Casamento', cake: 'Chocolate com Framboesa' },
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
};

function appReducer(state, action) {
  switch (action.type) {

    case 'LOAD_INITIAL_DATA':
      return { ...state, ...action.payload, loading: false };

    case 'SOCKET_UPDATE':
      return { ...state, ...action.payload };

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
      if (newWeddings.length === 0) return state;
      const newActive = state.activeWeddingId === action.payload ? newWeddings[0].id : state.activeWeddingId;
      if (newActive !== state.activeWeddingId) {
        return { ...state, weddings: newWeddings, activeWeddingId: newActive, ...emptyWeddingData() };
      }
      return { ...state, weddings: newWeddings, activeWeddingId: newActive };
    }

    case 'SET_ACTIVE_WEDDING':
      return { ...state, activeWeddingId: action.payload, ...emptyWeddingData() };

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
  const { user, loading: authLoading, authFetch } = useAuth();

  // Socket connection
  useEffect(() => {
    const socket = io();
    socketRef.current = socket;
    return () => socket.disconnect();
  }, []);

  // Join/leave project room when active wedding changes
  useEffect(() => {
    if (!socketRef.current || !state.activeWeddingId) return;
    socketRef.current.emit('join:project', state.activeWeddingId);
    return () => {
      socketRef.current?.emit('leave:project', state.activeWeddingId);
    };
  }, [state.activeWeddingId]);

  // Listen for real-time updates from other clients
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    const handler = (data) => {
      socketUpdateRef.current = true;
      dispatch({ type: 'SOCKET_UPDATE', payload: data });
    };
    socket.on('data:updated', handler);
    return () => socket.off('data:updated', handler);
  }, []);

  // Load initial data once auth is ready
  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;

    async function init() {
      let weddings = [];
      let activeId = null;
      let weddingData = null;

      // Try API if user is authenticated
      if (user) {
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
        }
      }

      // Fallback to localStorage (when API fails or new user with no data yet)
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
        }
      }

      // First time ever: create demo data
      if (weddings.length === 0) {
        const id = Date.now().toString();
        weddings = [{ id, name: 'Ana & Pedro', coupleName: 'Ana & Pedro', projectName: 'Nosso Casamento dos Sonhos', eventDate: '2026-12-12', phrase: 'O amor nunca falha.' }];
        weddingData = demoWeddingData();
        activeId = id;
        if (user) {
          try {
            await authFetch(`${API}/weddings`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(weddings) });
            await authFetch(`${API}/wedding-data/${id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(weddingData) });
          } catch {}
        }
        try { localStorage.setItem('wedding-planner-weddings', JSON.stringify(weddings)); } catch {}
        try { localStorage.setItem(`wedding-data-${id}`, JSON.stringify(weddingData)); } catch {}
      }

      if (cancelled) return;
      dispatch({
        type: 'LOAD_INITIAL_DATA',
        payload: {
          weddings,
          activeWeddingId: activeId,
          ...(weddingData || emptyWeddingData()),
        },
      });
      setInitialized(true);
    }
    init();
    return () => { cancelled = true; };
  }, [authLoading, user, authFetch]);

  // Persist on every state change (skip socket-originated updates to avoid loops)
  useEffect(() => {
    if (!initialized || state.loading) return;

    if (socketUpdateRef.current) {
      socketUpdateRef.current = false;
      return;
    }

    const detailFields = ['project', 'guests', 'checklist', 'budget', 'vendors', 'gifts', 'houseItems', 'weddingPlanner'];
    const data = {};
    detailFields.forEach(f => { data[f] = state[f]; });

    const id = state.activeWeddingId;
    if (!id) return;

    if (user) {
      authFetch(`${API}/wedding-data/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).catch(() => {});

      authFetch(`${API}/weddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.weddings),
      });
    }

    // Always save to localStorage as fallback
    try {
      const meta = state.weddings.map(w => {
        if (w.id === id) return { ...w, ...state.project };
        return w;
      });
      localStorage.setItem('wedding-planner-weddings', JSON.stringify(meta));
      localStorage.setItem(`wedding-data-${id}`, JSON.stringify(data));
    } catch {}
  }, [state, initialized, user, authFetch]);

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

const API = '/api';

export async function fetchWeddings() {
  try {
    const r = await fetch(`${API}/weddings`);
    if (!r.ok) throw new Error('Network error');
    return await r.json();
  } catch { return null; }
}

export async function saveWeddings(weddings) {
  try {
    await fetch(`${API}/weddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(weddings),
    });
  } catch { /* silent */ }
}

export async function fetchWeddingData(id) {
  try {
    const r = await fetch(`${API}/wedding-data/${id}`);
    if (!r.ok) throw new Error('Network error');
    return await r.json();
  } catch { return null; }
}

export async function saveWeddingData(id, data) {
  try {
    await fetch(`${API}/wedding-data/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch { /* silent */ }
}

import { useState, useRef, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Printer, Download, Share2, Eye, Palette } from 'lucide-react';

function buildHTML(state, config) {
  const { project, guests, checklist, budget, vendors, gifts, houseItems, weddingPlanner } = state;
  const theme = themes[config.theme];
  const isBW = config.colorMode === 'bw';
  const isLandscape = config.orientation === 'landscape';

  const c = (light) => isBW ? '#000' : light;
  const border = isBW ? '#ccc' : '#e0d5d0';
  const headColor = isBW ? '#000' : theme.primary;

  function header() {
    const hasBride = project.bridePhoto;
    const hasGroom = project.groomPhoto;
    const photoSize = project.bridePhoto || project.groomPhoto ? 70 : 0;
    const photos = (hasBride || hasGroom) ? `
      <div style="display:flex;justify-content:center;align-items:center;gap:24px;margin-bottom:16px;">
        ${hasBride ? `<div style="width:${photoSize}px;height:${photoSize}px;border-radius:50%;overflow:hidden;border:3px solid ${c('#DBA5A5')};box-shadow:0 2px 8px rgba(0,0,0,0.1);">
          <img src="${esc(project.bridePhoto)}" style="width:100%;height:100%;object-fit:cover;display:block;" />
        </div>` : ''}
        <div style="font-family:'Playfair Display',Georgia,serif;font-size:32px;color:${c(theme.accent)};">&amp;</div>
        ${hasGroom ? `<div style="width:${photoSize}px;height:${photoSize}px;border-radius:50%;overflow:hidden;border:3px solid ${c('#C2A050')};box-shadow:0 2px 8px rgba(0,0,0,0.1);">
          <img src="${esc(project.groomPhoto)}" style="width:100%;height:100%;object-fit:cover;display:block;" />
        </div>` : ''}
      </div>` : '';
    return `<div style="text-align:center;padding:40px 0 30px;border-bottom:2px solid ${border};margin-bottom:30px;">
      ${photos}
      <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:28px;color:${headColor};margin:0 0 8px;letter-spacing:2px;">${esc(project.projectName)}</h1>
      <p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:22px;color:${c(theme.accent)};margin:0 0 12px;font-style:italic;">${esc(project.coupleName)}</p>
      <p style="font-size:14px;color:${c('#666')};margin:0;">📅 ${project.eventDate ? new Date(project.eventDate).toLocaleDateString('pt-BR', {day:'numeric',month:'long',year:'numeric'}) : 'Data não definida'}</p>
      ${project.phrase ? `<p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:18px;color:${c(theme.accent)};margin:12px 0 0;font-style:italic;">"${esc(project.phrase)}"</p>` : ''}
    </div>`;
  }

  function sectionTitle(title) {
    return `<h2 style="font-family:'Playfair Display',Georgia,serif;font-size:18px;color:${headColor};margin:30px 0 15px;padding-bottom:8px;border-bottom:2px solid ${border};letter-spacing:1px;">${title}</h2>`;
  }

  function pageNum(n) {
    return `<div style="text-align:center;font-size:10px;color:#999;margin-top:20px;padding-top:10px;border-top:1px solid ${border};">— ${n} —</div>`;
  }

  const pages = [];
  let n = 0;

  function addPage(content) {
    n++;
    pages.push(`<div class="print-page" style="padding:15mm 20mm;background:white;font-family:'Inter',sans-serif;font-size:12px;color:${c('#2D2D2D')};">${content}${pageNum(n)}</div>`);
  }

  // Cover / Project
  if (config.sections.project) {
    addPage(header());
  }

  // Wedding Planner
  if (config.sections.wedding && weddingPlanner) {
    let content = header() + sectionTitle('💒 Planejamento do Casamento');
    for (const [key, val] of Object.entries(weddingPlanner)) {
      content += `<div style="margin-bottom:16px;"><h3 style="font-size:14px;color:${headColor};margin:0 0 8px;">${key.charAt(0).toUpperCase() + key.slice(1)}</h3>`;
      content += `<table style="width:100%;border-collapse:collapse;font-size:12px;">`;
      for (const [k, v] of Object.entries(val)) {
        const display = Array.isArray(v) ? v.join(', ') : String(v || '—');
        content += `<tr><td style="padding:6px 10px;border-bottom:1px solid ${border};color:#666;width:120px;font-weight:500;">${k}</td><td style="padding:6px 10px;border-bottom:1px solid ${border};">${esc(display)}</td></tr>`;
      }
      content += `</table></div>`;
    }
    addPage(content);
  }

  // Guests
  if (config.sections.guests && guests.length > 0) {
    const cats = [...new Set(guests.map(g => g.category))];
    let content = header() + sectionTitle('👥 Convidados');
    content += `<table style="width:100%;border-collapse:collapse;font-size:12px;">
      <thead><tr style="background:${c('#F5E6D3')};">
        <th style="padding:8px 12px;text-align:left;border-bottom:2px solid ${border};">Nome</th>
        <th style="padding:8px 12px;text-align:left;border-bottom:2px solid ${border};">Categoria</th>
        <th style="padding:8px 12px;text-align:left;border-bottom:2px solid ${border};">Status</th>
        <th style="padding:8px 12px;text-align:left;border-bottom:2px solid ${border};">Telefone</th>
      </tr></thead><tbody>`;
    for (const cat of cats) {
      const items = guests.filter(g => g.category === cat);
      content += `<tr style="background:${c('#FFF8F5')};"><td colspan="4" style="padding:6px 12px;font-weight:600;color:${headColor};font-size:13px;">${esc(cat)} (${items.length})</td></tr>`;
      for (const g of items) {
        const statusIcon = g.status === 'confirmed' ? '✓' : g.status === 'declined' ? '✗' : '○';
        const statusColor = g.status === 'confirmed' ? '#4A8A4A' : g.status === 'declined' ? '#C44A4A' : '#B8960F';
        content += `<tr><td style="padding:6px 12px;border-bottom:1px solid ${border};">${esc(g.name)}</td>
          <td style="padding:6px 12px;border-bottom:1px solid ${border};color:#666;">${esc(g.category)}</td>
          <td style="padding:6px 12px;border-bottom:1px solid ${border};color:${statusColor};">${statusIcon} ${g.status === 'confirmed' ? 'Confirmado' : g.status === 'declined' ? 'Recusado' : 'Pendente'}</td>
          <td style="padding:6px 12px;border-bottom:1px solid ${border};color:#666;">${esc(g.phone || '—')}</td></tr>`;
      }
    }
    content += `</tbody></table>`;
    content += `<p style="margin-top:12px;font-size:11px;color:#666;">Total: ${guests.length} · Confirmados: ${guests.filter(g=>g.status==='confirmed').length} · Pendentes: ${guests.filter(g=>g.status==='pending').length} · Recusados: ${guests.filter(g=>g.status==='declined').length}</p>`;
    addPage(content);
  }

  // Checklist
  if (config.sections.checklist && checklist.length > 0) {
    const cats = [...new Set(checklist.map(c => c.category))];
    let content = header() + sectionTitle('✅ Checklist');
    const done = checklist.filter(c => c.done).length;
    content += `<p style="font-size:12px;color:#666;margin-bottom:12px;">${done} de ${checklist.length} tarefas concluídas</p>`;
    for (const cat of cats) {
      const items = checklist.filter(c => c.category === cat);
      content += `<div style="margin-bottom:16px;"><h3 style="font-size:14px;color:${headColor};margin:0 0 8px;">${esc(cat)} (${items.filter(c=>c.done).length}/${items.length})</h3>`;
      for (const c of items) {
        const checked = c.done ? '✓' : ' ';
        const bgColor = c.done ? '#4A8A4A' : 'transparent';
        const bdColor = c.done ? '#4A8A4A' : '#ccc';
        const deco = c.done ? 'text-decoration:line-through;color:#999;' : '';
        const priorColor = c.priority === 'high' ? '#C44A4A' : c.priority === 'medium' ? '#B8960F' : '#6B8F67';
        const priorLabel = c.priority === 'high' ? 'Alta' : c.priority === 'medium' ? 'Média' : 'Baixa';
        content += `<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid ${border};font-size:12px;">
          <span style="display:inline-flex;width:16px;height:16px;border-radius:3px;border:1.5px solid ${bdColor};background:${bgColor};align-items:center;justify-content:center;color:white;font-size:10px;flex-shrink:0;">${checked}</span>
          <span style="flex:1;${deco}">${esc(c.task)}</span>
          <span style="font-size:10px;color:${priorColor};">${priorLabel}</span>
        </div>`;
      }
      content += `</div>`;
    }
    addPage(content);
  }

  // Budget
  if (config.sections.budget && budget.length > 0) {
    const totalEst = budget.reduce((a, b) => a + b.estimated, 0);
    const totalSpent = budget.reduce((a, b) => a + b.spent, 0);
    let content = header() + sectionTitle('💰 Orçamento');
    content += `<div style="display:flex;gap:16px;margin-bottom:16px;font-size:13px;">
      <div style="flex:1;padding:10px;background:${c('#F5E6D3')};border-radius:8px;text-align:center;"><strong>Estimado:</strong> R$ ${totalEst.toLocaleString('pt-BR')}</div>
      <div style="flex:1;padding:10px;background:${c('#F5E6D3')};border-radius:8px;text-align:center;"><strong>Gasto:</strong> R$ ${totalSpent.toLocaleString('pt-BR')}</div>
      <div style="flex:1;padding:10px;background:${c('#F5E6D3')};border-radius:8px;text-align:center;"><strong>Restante:</strong> R$ ${(totalEst - totalSpent).toLocaleString('pt-BR')}</div>
    </div>`;
    content += `<table style="width:100%;border-collapse:collapse;font-size:12px;">
      <thead><tr style="background:${c('#F5E6D3')};">
        <th style="padding:8px 12px;text-align:left;border-bottom:2px solid ${border};">Categoria</th>
        <th style="padding:8px 12px;text-align:right;border-bottom:2px solid ${border};">Estimado</th>
        <th style="padding:8px 12px;text-align:right;border-bottom:2px solid ${border};">Gasto</th>
        <th style="padding:8px 12px;text-align:right;border-bottom:2px solid ${border};">Restante</th>
      </tr></thead><tbody>`;
    for (const b of budget) {
      const rem = b.estimated - b.spent;
      const remColor = rem < 0 ? '#C44A4A' : '#4A8A4A';
      content += `<tr><td style="padding:6px 12px;border-bottom:1px solid ${border};font-weight:500;">${esc(b.category)}</td>
        <td style="padding:6px 12px;border-bottom:1px solid ${border};text-align:right;">R$ ${b.estimated.toLocaleString('pt-BR')}</td>
        <td style="padding:6px 12px;border-bottom:1px solid ${border};text-align:right;">R$ ${b.spent.toLocaleString('pt-BR')}</td>
        <td style="padding:6px 12px;border-bottom:1px solid ${border};text-align:right;color:${remColor};">R$ ${rem.toLocaleString('pt-BR')}</td></tr>`;
    }
    content += `</tbody></table>`;
    addPage(content);
  }

  // Vendors
  if (config.sections.vendors && vendors.length > 0) {
    let content = header() + sectionTitle('📋 Fornecedores');
    content += `<table style="width:100%;border-collapse:collapse;font-size:12px;">
      <thead><tr style="background:${c('#F5E6D3')};">
        <th style="padding:8px 12px;text-align:left;border-bottom:2px solid ${border};">Fornecedor</th>
        <th style="padding:8px 12px;text-align:left;border-bottom:2px solid ${border};">Serviço</th>
        <th style="padding:8px 12px;text-align:left;border-bottom:2px solid ${border};">Contato</th>
        <th style="padding:8px 12px;text-align:right;border-bottom:2px solid ${border};">Orçamento</th>
        <th style="padding:8px 12px;text-align:center;border-bottom:2px solid ${border};">Status</th>
      </tr></thead><tbody>`;
    for (const v of vendors) {
      const statusIcon = v.hired ? '✓' : '○';
      const statusColor = v.hired ? '#4A8A4A' : '#B8960F';
      content += `<tr><td style="padding:6px 12px;border-bottom:1px solid ${border};font-weight:500;">${esc(v.name)}</td>
        <td style="padding:6px 12px;border-bottom:1px solid ${border};color:#666;">${esc(v.service)}</td>
        <td style="padding:6px 12px;border-bottom:1px solid ${border};color:#666;">${esc(v.contact)}</td>
        <td style="padding:6px 12px;border-bottom:1px solid ${border};text-align:right;">R$ ${v.budget.toLocaleString('pt-BR')}</td>
        <td style="padding:6px 12px;border-bottom:1px solid ${border};text-align:center;color:${statusColor};">${statusIcon} ${v.hired ? 'Contratado' : 'Pendente'}</td></tr>`;
    }
    content += `</tbody></table>`;
    addPage(content);
  }

  // Gifts
  if (config.sections.gifts && gifts.length > 0) {
    const totalPrice = gifts.reduce((a, b) => a + b.price, 0);
    let content = header() + sectionTitle('🎁 Presentes');
    content += `<table style="width:100%;border-collapse:collapse;font-size:12px;">
      <thead><tr style="background:${c('#F5E6D3')};">
        <th style="padding:8px 12px;text-align:left;border-bottom:2px solid ${border};">Item</th>
        <th style="padding:8px 12px;text-align:left;border-bottom:2px solid ${border};">Loja</th>
        <th style="padding:8px 12px;text-align:right;border-bottom:2px solid ${border};">Preço</th>
        <th style="padding:8px 12px;text-align:center;border-bottom:2px solid ${border};">Status</th>
      </tr></thead><tbody>`;
    for (const g of gifts) {
      const statusIcon = g.status === 'bought' ? '✓' : '○';
      const statusColor = g.status === 'bought' ? '#4A8A4A' : '#B8960F';
      content += `<tr><td style="padding:6px 12px;border-bottom:1px solid ${border};font-weight:500;">${esc(g.item)}</td>
        <td style="padding:6px 12px;border-bottom:1px solid ${border};color:#666;">${esc(g.store || '—')}</td>
        <td style="padding:6px 12px;border-bottom:1px solid ${border};text-align:right;">R$ ${g.price.toLocaleString('pt-BR')}</td>
        <td style="padding:6px 12px;border-bottom:1px solid ${border};text-align:center;color:${statusColor};">${statusIcon} ${g.status === 'bought' ? 'Comprado' : 'Pendente'}</td></tr>`;
    }
    content += `</tbody></table>`;
    content += `<p style="margin-top:8px;font-size:11px;color:#666;">Total em presentes: R$ ${totalPrice.toLocaleString('pt-BR')}</p>`;
    addPage(content);
  }

  // House Items
  if (config.sections.house && houseItems.length > 0) {
    const cats = [...new Set(houseItems.map(h => h.category))];
    let content = header() + sectionTitle('🏠 Itens para Casa');
    for (const cat of cats) {
      const items = houseItems.filter(h => h.category === cat);
      const bought = items.filter(h => h.status === 'bought').length;
      content += `<div style="margin-bottom:16px;"><h3 style="font-size:14px;color:${headColor};margin:0 0 8px;">${esc(cat)} (${bought}/${items.length})</h3>`;
      for (const h of items) {
        const checked = h.status === 'bought' ? '✓' : ' ';
        const bgColor = h.status === 'bought' ? '#4A8A4A' : 'transparent';
        const bdColor = h.status === 'bought' ? '#4A8A4A' : '#ccc';
        const deco = h.status === 'bought' ? 'text-decoration:line-through;color:#999;' : '';
        const priorColor = h.priority === 'high' ? '#C44A4A' : h.priority === 'medium' ? '#B8960F' : '#6B8F67';
        content += `<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid ${border};font-size:12px;">
          <span style="display:inline-flex;width:16px;height:16px;border-radius:3px;border:1.5px solid ${bdColor};background:${bgColor};align-items:center;justify-content:center;color:white;font-size:10px;flex-shrink:0;">${checked}</span>
          <span style="flex:1;${deco}">${esc(h.item)}</span>
          <span style="font-size:10px;color:${priorColor};">${h.priority === 'high' ? 'Alta' : h.priority === 'medium' ? 'Média' : 'Baixa'}</span>
        </div>`;
      }
      content += `</div>`;
    }
    addPage(content);
  }

  // Notes page
  n++;
  pages.push(`<div class="print-page" style="padding:15mm 20mm;background:white;font-family:'Inter',sans-serif;">
    ${header()}
    <h2 style="font-family:'Playfair Display',Georgia,serif;font-size:18px;color:${headColor};margin:30px 0 15px;padding-bottom:8px;border-bottom:2px solid ${border};">📝 Anotações</h2>
    <div style="min-height:400px;border:1px dashed ${border};border-radius:8px;padding:20px;">
      ${Array.from({length:8}, (_, i) => `<div style="border-bottom:1px solid ${border};height:36px;margin-bottom:6px;"></div>`).join('')}
    </div>
    ${pageNum(n)}
  </div>`);

  return pages.join('');
}

function esc(s) {
  if (typeof s !== 'string') return String(s || '');
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

const themes = {
  elegant: { name: 'Elegante', primary: '#D4A5A5', secondary: '#F5E6D3', accent: '#C9A96E', text: '#2D2D2D', bg: '#FFFFFF' },
  modern: { name: 'Moderno', primary: '#2D2D2D', secondary: '#F5F3F0', accent: '#B5C4B1', text: '#1A1A1A', bg: '#FFFFFF' },
  classic: { name: 'Clássico', primary: '#8B7420', secondary: '#FFF8DC', accent: '#C9A96E', text: '#2D2D2D', bg: '#FFF8F5' },
  minimal: { name: 'Minimalista', primary: '#4A4A4A', secondary: '#F8F8F8', accent: '#B5C4B1', text: '#2D2D2D', bg: '#FFFFFF' },
};

export default function Impressao() {
  const { state } = useApp();
  const printRef = useRef(null);

  const [config, setConfig] = useState({
    sections: { project: true, guests: true, checklist: true, budget: true, vendors: true, gifts: true, house: true, wedding: true },
    orientation: 'portrait',
    pageSize: 'A4',
    theme: 'elegant',
    colorMode: 'color',
  });

  const [generating, setGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const activeSections = Object.entries(config.sections).filter(([, v]) => v).length;

  const printHTML = useMemo(() => buildHTML(state, config), [state, config]);

  function toggleSection(key) {
    setConfig(prev => ({ ...prev, sections: { ...prev.sections, [key]: !prev.sections[key] } }));
  }

  async function handlePDF() {
    if (activeSections === 0) { alert('Selecione ao menos uma seção para imprimir.'); return; }
    setGenerating(true);
    try {
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;

      const isLandscape = config.orientation === 'landscape';
      const pdf = new jsPDF({ orientation: isLandscape ? 'l' : 'p', unit: 'mm', format: config.pageSize });
      const container = printRef.current;
      if (!container) return;

      const pages = container.querySelectorAll('.print-page');
      for (let i = 0; i < pages.length; i++) {
        const canvas = await html2canvas(pages[i], { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pw = pdf.internal.pageSize.getWidth();
        const ph = (canvas.height * pw) / canvas.width;
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, 0, pw, ph);
      }

      const filename = `planejamento-casamento-${state.project.coupleName.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      pdf.save(filename);

      const blob = pdf.output('blob');
      setPreviewUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error('PDF error:', err);
      alert('Erro ao gerar PDF: ' + err.message);
    }
    setGenerating(false);
  }

  async function handlePrint() {
    if (activeSections === 0) { alert('Selecione ao menos uma seção para imprimir.'); return; }
    const pw = window.open('', '_blank');
    if (!pw) { alert('Permita pop-ups para visualizar a impressão.'); return; }
    const isLandscape = config.orientation === 'landscape';
    pw.document.write(`
      <html><head>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&display=swap" rel="stylesheet">
        <style>
          *{margin:0;padding:0;box-sizing:border-box;}
          body{font-family:'Inter',sans-serif;background:#fff;color:#2D2D2D;}
          @page{margin:0;size:${config.pageSize} ${isLandscape ? 'landscape' : 'portrait'};}
          .print-page{page-break-after:always;padding:15mm 20mm;}
          @media print{.print-page{page-break-after:always;}}
        </style>
      </head><body>${printHTML}</body></html>
    `);
    pw.document.close();
    setTimeout(() => pw.print(), 800);
  }

  async function handleShare() {
    if (activeSections === 0) { alert('Selecione ao menos uma seção para imprimir.'); return; }
    if (!previewUrl && !generating) { await handlePDF(); return; }
    if (navigator.share && previewUrl) {
      try {
        const r = await fetch(previewUrl);
        const blob = await r.blob();
        await navigator.share({ title: 'Planejamento do Casamento', files: [new File([blob], 'casamento.pdf', { type: 'application/pdf' })] });
      } catch {}
    } else if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  }

  const sectionList = [
    { key: 'project', label: 'Projeto', icon: '💍' },
    { key: 'wedding', label: 'Casamento', icon: '💒' },
    { key: 'guests', label: 'Convidados', icon: '👥' },
    { key: 'checklist', label: 'Checklist', icon: '✅' },
    { key: 'budget', label: 'Orçamento', icon: '💰' },
    { key: 'vendors', label: 'Fornecedores', icon: '📋' },
    { key: 'gifts', label: 'Presentes', icon: '🎁' },
    { key: 'house', label: 'Casa', icon: '🏠' },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1><Printer size={24} style={{ color: 'var(--rose)', verticalAlign: 'middle', marginRight: 8 }} /> Impressão Profissional</h1>
        <p>Exporte seu planejamento em PDF ou imprima com visual profissional</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 24, alignItems: 'start' }}>
        <div className="card" style={{ position: 'sticky', top: 24 }}>
          <h3 style={{ marginBottom: 16, fontSize: 18, color: 'var(--rose-dark)' }}>
            <Palette size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} /> Opções
          </h3>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 6, display: 'block', fontWeight: 500 }}>Seções</label>
            {sectionList.map(s => (
              <label key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', borderRadius: 6, cursor: 'pointer', background: config.sections[s.key] ? 'var(--blush)' : 'transparent' }}>
                <input type="checkbox" checked={config.sections[s.key]} onChange={() => toggleSection(s.key)} style={{ accentColor: 'var(--rose)' }} />
                <span>{s.icon}</span>
                <span style={{ fontSize: 13 }}>{s.label}</span>
              </label>
            ))}
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 4, display: 'block', fontWeight: 500 }}>Orientação</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {['portrait', 'landscape'].map(opt => (
                <button key={opt}
                  className={`btn ${config.orientation === opt ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '6px', fontSize: 12 }}
                  onClick={() => setConfig({...config, orientation: opt})}
                >{opt === 'portrait' ? 'Retrato' : 'Paisagem'}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 4, display: 'block', fontWeight: 500 }}>Folha</label>
            <select className="input" value={config.pageSize} onChange={e => setConfig({...config, pageSize: e.target.value})}>
              <option value="A4">A4</option>
              <option value="letter">Carta</option>
            </select>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 4, display: 'block', fontWeight: 500 }}>Tema</label>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {Object.entries(themes).map(([key, t]) => (
                <button key={key}
                  className={`btn ${config.theme === key ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '4px 10px', fontSize: 11 }}
                  onClick={() => setConfig({...config, theme: key})}
                >{t.name}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 4, display: 'block', fontWeight: 500 }}>Cor</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {['color', 'bw'].map(opt => (
                <button key={opt}
                  className={`btn ${config.colorMode === opt ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '6px', fontSize: 12 }}
                  onClick={() => setConfig({...config, colorMode: opt})}
                >{opt === 'color' ? 'Colorido' : 'Preto & Branco'}</button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button className="btn btn-primary" style={{ justifyContent: 'center', padding: '12px', fontSize: 14 }} onClick={handlePDF} disabled={generating}>
              {generating ? 'Gerando...' : <><Download size={16} /> Exportar PDF</>}
            </button>
            <button className="btn btn-secondary" style={{ justifyContent: 'center', padding: '10px', fontSize: 13 }} onClick={handlePrint}>
              <Printer size={16} /> Imprimir
            </button>
            <button className="btn btn-outline" style={{ justifyContent: 'center', padding: '10px', fontSize: 13 }} onClick={handleShare}>
              <Share2 size={16} /> Compartilhar
            </button>
          </div>

          {activeSections === 0 && (
            <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 10, textAlign: 'center' }}>Selecione ao menos uma seção</p>
          )}
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--gray-bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 15 }}><Eye size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Pré-visualização</h3>
            <span style={{ fontSize: 12, color: 'var(--gray)' }}>{activeSections} seção(ões)</span>
          </div>
          <div ref={printRef} style={{ padding: 20, background: '#f0f0f0', minHeight: 400 }}>
            <div
              style={{
                maxWidth: config.pageSize === 'A4' ? (config.orientation === 'landscape' ? 600 : 420) : (config.orientation === 'landscape' ? 560 : 430),
                margin: '0 auto',
                boxShadow: '0 2px 20px rgba(0,0,0,0.15)',
                overflow: 'hidden',
              }}
              dangerouslySetInnerHTML={{ __html: printHTML }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

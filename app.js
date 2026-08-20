(function(){
  const hasSupabase = window.SUPABASE_URL && window.SUPABASE_ANON_KEY;
  const configBox = document.getElementById('configBox');
  if(!hasSupabase){ configBox.classList.remove('hidden'); }

  let sb = null;
  if(hasSupabase && window.supabase){
    sb = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  }

  const LOCAL_KEY = 'rnc_cmi_lite_registros';

  function loadLocal(){
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
  }
  function saveLocal(list){
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
  }

  async function addRegistro(reg){
    if(sb){
      const {error} = await sb.from('rnc').insert([reg]);
      if(error){ alert('Erro ao salvar no banco: ' + error.message); }
    } else {
      const list = loadLocal();
      reg.id = Date.now();
      reg.status = 'Aberta';
      list.unshift(reg);
      saveLocal(list);
    }
  }

  async function getRegistros(){
    if(sb){
      const {data, error} = await sb.from('rnc').select('*').order('data', {ascending:false});
      if(error){ alert('Erro ao carregar dados: ' + error.message); return []; }
      return data || [];
    }
    return loadLocal();
  }

  async function updateStatus(id, status){
    if(sb){
      await sb.from('rnc').update({status}).eq('id', id);
    } else {
      const list = loadLocal();
      const item = list.find(r => r.id === id);
      if(item){ item.status = status; saveLocal(list); }
    }
    renderLista();
  }

  // Navegacao
  const navAbrir = document.getElementById('navAbrir');
  const navLista = document.getElementById('navLista');
  const viewAbrir = document.getElementById('viewAbrir');
  const viewLista = document.getElementById('viewLista');

  navAbrir.onclick = () => {
    navAbrir.classList.add('active'); navLista.classList.remove('active');
    viewAbrir.classList.remove('hidden'); viewLista.classList.add('hidden');
  };
  navLista.onclick = () => {
    navLista.classList.add('active'); navAbrir.classList.remove('active');
    viewLista.classList.remove('hidden'); viewAbrir.classList.add('hidden');
    renderLista();
  };

  document.getElementById('formRnc').addEventListener('submit', async (e) => {
    e.preventDefault();
    const reg = {
      setor: document.getElementById('setor').value,
      data: document.getElementById('data').value,
      descricao: document.getElementById('descricao').value,
      gravidade: document.getElementById('gravidade').value,
      nome: document.getElementById('nome').value || 'Anonimo',
      status: 'Aberta'
    };
    await addRegistro(reg);
    e.target.reset();
    alert('RNC registrada com sucesso!');
  });

  function badge(status){
    const cls = status === 'Aberta' ? 'b-aberta' : status === 'Em andamento' ? 'b-andamento' : 'b-fechada';
    return `<span class="badge ${cls}">${status}</span>`;
  }

  async function renderLista(){
    const registros = await getRegistros();
    const kpis = document.getElementById('kpis');
    const abertas = registros.filter(r => r.status === 'Aberta').length;
    const andamento = registros.filter(r => r.status === 'Em andamento').length;
    const fechadas = registros.filter(r => r.status === 'Fechada').length;
    kpis.innerHTML = `
      <div class="kpi"><h2>${registros.length}</h2><p>Total de RNCs</p></div>
      <div class="kpi"><h2>${abertas}</h2><p>Abertas</p></div>
      <div class="kpi"><h2>${andamento}</h2><p>Em andamento</p></div>
      <div class="kpi"><h2>${fechadas}</h2><p>Fechadas</p></div>
    `;
    const tbody = document.getElementById('tbody');
    tbody.innerHTML = registros.map(r => `
      <tr>
        <td>${r.data || ''}</td>
        <td>${r.setor || ''}</td>
        <td>${r.gravidade || ''}</td>
        <td>${badge(r.status)}</td>
        <td>${(r.descricao || '').slice(0,60)}</td>
        <td>
          <select onchange="window.__updateStatus(${r.id}, this.value)">
            <option ${r.status==='Aberta'?'selected':''}>Aberta</option>
            <option ${r.status==='Em andamento'?'selected':''}>Em andamento</option>
            <option ${r.status==='Fechada'?'selected':''}>Fechada</option>
          </select>
        </td>
      </tr>
    `).join('');
  }
  window.__updateStatus = updateStatus;

  document.getElementById('btnExportar').addEventListener('click', async () => {
    const registros = await getRegistros();
    const header = 'Data,Setor,Gravidade,Status,Nome,Descricao\n';
    const rows = registros.map(r => `${r.data},${r.setor},${r.gravidade},${r.status},${r.nome},"${(r.descricao||'').replace(/"/g,'')}"`).join('\n');
    const blob = new Blob([header + rows], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'rnc_cmi.csv'; a.click();
  });

  document.getElementById('data').valueAsDate = new Date();
})();

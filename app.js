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
    renderPainel();
  }

  // ===== Autenticacao (Supabase Auth) =====
  async function getSessaoAtual(){
    if(!sb) return null;
    const { data } = await sb.auth.getSession();
    return data.session;
  }

  async function fazerLogin(email, senha){
    if(!sb){
      alert('Configure o config.js com Supabase para habilitar login.');
      return false;
    }
    const { data, error } = await sb.auth.signInWithPassword({ email, password: senha });
    if(error){
      const erroEl = document.getElementById('loginErro');
      erroEl.textContent = 'E-mail ou senha invalidos.';
      erroEl.classList.remove('hidden');
      return false;
    }
    return true;
  }

  async function criarConta(nome, email, senha){
    if(!sb){
      alert('Configure o config.js com Supabase para habilitar cadastro.');
      return false;
    }
    const { data, error } = await sb.auth.signUp({
      email,
      password: senha,
      options: { data: { nome: nome } }
    });
    const msgEl = document.getElementById('cadastroMsg');
    if(error){
      msgEl.textContent = 'Erro ao criar conta: ' + error.message;
      msgEl.classList.remove('hidden');
      return false;
    }
    msgEl.textContent = 'Conta criada! Verifique seu e-mail para confirmar, depois faca login.';
    msgEl.classList.remove('hidden');
    return true;
  }

  async function fazerLogout(){
    if(sb){ await sb.auth.signOut(); }
    showScreen('home');
  }

  // ===== Navegacao entre telas =====
  const screens = {
    home: document.getElementById('home'),
    abrir: document.getElementById('viewAbrir'),
    login: document.getElementById('viewLogin'),
    painel: document.getElementById('viewPainel')
  };

  function showScreen(name){
    Object.values(screens).forEach(el => el.classList.add('hidden'));
    screens[name].classList.remove('hidden');
    if(name === 'painel'){ renderPainel(); }
  }

  document.getElementById('goAbrir').onclick = () => showScreen('abrir');

  document.getElementById('goLogin').onclick = async () => {
    const sessao = await getSessaoAtual();
    if(sessao){
      showScreen('painel');
    } else {
      showScreen('login');
    }
  };

  document.querySelectorAll('.back-btn').forEach(btn => {
    btn.onclick = () => showScreen(btn.dataset.back);
  });

  document.getElementById('btnLogout').addEventListener('click', fazerLogout);

  document.getElementById('formLogin').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const senha = document.getElementById('loginSenha').value;
    const ok = await fazerLogin(email, senha);
    if(ok){ showScreen('painel'); }
  });

  document.getElementById('formCadastro').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = document.getElementById('cadNome').value;
    const email = document.getElementById('cadEmail').value;
    const senha = document.getElementById('cadSenha').value;
    await criarConta(nome, email, senha);
  });

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
    document.getElementById('data').valueAsDate = new Date();
    alert('RNC registrada com sucesso!');
    showScreen('home');
  });

  function badge(status){
    const cls = status === 'Aberta' ? 'b-aberta' : status === 'Em andamento' ? 'b-andamento' : 'b-fechada';
    return '<span class="badge ' + cls + '">' + status + '</span>';
  }

  async function renderPainel(){
    const sessao = await getSessaoAtual();
    const usuarioEl = document.getElementById('usuarioLogado');
    if(sessao){
      const nome = (sessao.user.user_metadata && sessao.user.user_metadata.nome) || sessao.user.email;
      usuarioEl.textContent = 'Logado como: ' + nome;
    } else if(usuarioEl){
      usuarioEl.textContent = 'Modo offline (sem login)';
    }

    const registros = await getRegistros();
    const kpis = document.getElementById('kpis');
    const abertas = registros.filter(r => r.status === 'Aberta').length;
    const andamento = registros.filter(r => r.status === 'Em andamento').length;
    const fechadas = registros.filter(r => r.status === 'Fechada').length;

    kpis.innerHTML =
      '<div class="kpi-card"><span class="kpi-num">' + registros.length + '</span><span class="kpi-label">Total de RNCs</span></div>' +
      '<div class="kpi-card"><span class="kpi-num">' + abertas + '</span><span class="kpi-label">Abertas</span></div>' +
      '<div class="kpi-card"><span class="kpi-num">' + andamento + '</span><span class="kpi-label">Em andamento</span></div>' +
      '<div class="kpi-card"><span class="kpi-num">' + fechadas + '</span><span class="kpi-label">Fechadas</span></div>';

    const tbody = document.getElementById('tbody');
    tbody.innerHTML = registros.map(r => {
      return '<tr>' +
        '<td>' + (r.data || '') + '</td>' +
        '<td>' + (r.setor || '') + '</td>' +
        '<td>' + (r.gravidade || '') + '</td>' +
        '<td>' + badge(r.status) + '</td>' +
        '<td>' + (r.descricao || '').slice(0,60) + '</td>' +
        '<td><select onchange="window.__updateStatus(' + r.id + ', this.value)">' +
          '<option ' + (r.status === 'Aberta' ? 'selected' : '') + '>Aberta</option>' +
          '<option ' + (r.status === 'Em andamento' ? 'selected' : '') + '>Em andamento</option>' +
          '<option ' + (r.status === 'Fechada' ? 'selected' : '') + '>Fechada</option>' +
        '</select></td>' +
      '</tr>';
    }).join('');
  }

  window.__updateStatus = updateStatus;

  document.getElementById('btnExportar').addEventListener('click', async () => {
    const registros = await getRegistros();
    const header = 'Data,Setor,Gravidade,Status,Nome,Descricao\n';
    const rows = registros.map(r => `${r.data},${r.setor},${r.gravidade},${r.status},${r.nome},"${(r.descricao||'').replace(/"/g,'')}"`).join('\n');
    const blob = new Blob([header + rows], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rnc_cmi.csv';
    a.click();
  });

  document.getElementById('data').valueAsDate = new Date();
  showScreen('home');
})();

/* =========================================
   LOCALIZA AÊ — script.js
   Achou, Registrou, Localizou!
   ========================================= */

/* ===== DATA ===== */
let ITEMS = [
  { id:1, type:'Perdido',    name:'Carteira com documentos',     cat:'Carteiras',    emoji:'👛', color:'#3B5BDB', location:'Aeroporto de Congonhas, SP', date:'15/03/2025', tags:['RG','CNH','Preta'], user:'Carlos M.', resolved:false },
  { id:2, type:'Encontrado', name:'iPhone 13 tela trincada',     cat:'Eletrônicos',  emoji:'📱', color:'#7C3AED', location:'Metrô Paulista, SP',          date:'16/03/2025', tags:['Apple','Preto','Desbloqueado'], user:'Ana P.', resolved:false },
  { id:3, type:'Perdido',    name:'Chave Honda Civic 2022',      cat:'Chaves',       emoji:'🔑', color:'#3B5BDB', location:'Shopping Recife, PE',          date:'14/03/2025', tags:['Honda','Civic','Chaveiro azul'], user:'Pedro L.', resolved:false },
  { id:4, type:'Encontrado', name:'Mochila Nike preta',          cat:'Bolsas',       emoji:'🎒', color:'#7C3AED', location:'Parque Ibirapuera, SP',        date:'17/03/2025', tags:['Nike','Preta','Cadernos'], user:'Marina S.', resolved:false },
  { id:5, type:'Perdido',    name:'Cachorro Pug chamado Toby',   cat:'Animais',      emoji:'🐶', color:'#EF4444', location:'Jardim Botânico, RJ',          date:'17/03/2025', tags:['Pug','Coleira vermelha','Dócil'], user:'Julia R.', resolved:false },
  { id:6, type:'Encontrado', name:'Óculos de grau armação azul', cat:'Outros',       emoji:'👓', color:'#7C3AED', location:'UFBA, Salvador - BA',          date:'13/03/2025', tags:['Óculos','Azul','Grau'], user:'Lucas T.', resolved:true },
  { id:7, type:'Perdido',    name:'Notebook Dell Inspiron',      cat:'Eletrônicos',  emoji:'💻', color:'#3B5BDB', location:'Biblioteca Parque, Niterói',   date:'12/03/2025', tags:['Dell','Cinza','Adesivos'], user:'Bruna F.', resolved:false },
  { id:8, type:'Encontrado', name:'Passaporte Brasileiro',       cat:'Documentos',   emoji:'📘', color:'#10B981', location:'Aeroporto Galeão, RJ',         date:'16/03/2025', tags:['Passaporte','Verde','Válido'], user:'Roberto M.', resolved:false },
  { id:9, type:'Perdido',    name:'Brinco de ouro com diamante', cat:'Outros',       emoji:'💍', color:'#F59E0B', location:'Restaurante Figueira Rubaiyat', date:'15/03/2025', tags:['Ouro','Diamante','Par'], user:'Isabela C.', resolved:false },
];

let favorites        = JSON.parse(localStorage.getItem('lz_ae_favs') || '[]');
let currentUser      = null;
let currentResults   = [...ITEMS];
let activeTypeFilter = '';

/* ===== RENDER CARD ===== */
function renderCard(item, container) {
  const isFav  = favorites.includes(item.id);
  const isLost = item.type === 'Perdido';
  const card   = document.createElement('div');
  card.className = 'item-card';
  card.innerHTML = `
    <div class="item-thumb" style="background:linear-gradient(135deg,${item.color}15,${item.color}28)">
      <div class="item-thumb-bg" style="background:${item.color};opacity:.06"></div>
      <span style="position:relative;z-index:1;font-size:2.8rem">${item.emoji}</span>
      <div class="item-type-badge ${isLost ? 'badge-lost' : 'badge-found'}">${isLost ? '😢 Perdido' : '😊 Encontrado'}</div>
      <div class="item-date">${item.date}</div>
    </div>
    <div class="item-body">
      <h3>${item.name}</h3>
      <div class="item-meta">
        <span>📂 ${item.cat}</span>
        <span>📍 ${item.location.split(',')[0]}</span>
        ${item.resolved ? '<span style="color:var(--success);font-weight:600">✅ Resolvido</span>' : ''}
      </div>
      <div class="item-tags">${item.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
    </div>
    <div class="item-footer">
      <div class="item-user">
        <div class="avatar-sm">${item.user.split(' ').map(n => n[0]).join('').substring(0, 2)}</div>
        ${item.user}
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <button class="fav-btn ${isFav ? 'active' : ''}" onclick="toggleFav(${item.id},this)">${isFav ? '💜' : '🤍'}</button>
        <button class="contact-btn" onclick="contactItem(${item.id})">Contato</button>
      </div>
    </div>`;
  container.appendChild(card);
}

function renderFeatured() {
  const grid = document.getElementById('featured-grid');
  grid.innerHTML = '';
  ITEMS.slice(0, 6).forEach(i => renderCard(i, grid));
}

/* ===== SEARCH ===== */
function performSearch() {
  const q   = document.getElementById('search-input').value.toLowerCase().trim();
  const cat = document.getElementById('search-cat').value;
  showPage('results');
  renderResults(q, cat, '');
}

function searchBy(cat, type) {
  document.getElementById('search-cat').value = cat;
  showPage('results');
  renderResults('', cat, type);
}

function renderResults(query = '', cat = '', type = '') {
  activeTypeFilter = type;

  const results = ITEMS.filter(i => {
    const mQ = !query || i.name.toLowerCase().includes(query) || i.cat.toLowerCase().includes(query) || i.tags.some(t => t.toLowerCase().includes(query));
    const mC = !cat  || i.cat  === cat;
    const mT = !type || i.type === type;
    return mQ && mC && mT;
  });

  currentResults = results;

  const grid = document.getElementById('results-grid');
  grid.innerHTML = '';
  results.forEach(i => renderCard(i, grid));

  document.getElementById('results-count').textContent    = `${results.length} resultado${results.length !== 1 ? 's' : ''}`;
  document.getElementById('results-title').textContent    = query ? `"${query}"` : type ? (type === 'Perdido' ? '😢 Objetos Perdidos' : '😊 Objetos Encontrados') : cat || 'Todos os registros';
  document.getElementById('results-subtitle').textContent = `${results.length} registro${results.length !== 1 ? 's' : ''} encontrado${results.length !== 1 ? 's' : ''}`;

  // Rebuild category filter chips
  const cats = [...new Set(ITEMS.map(i => i.cat))];
  const fc   = document.getElementById('filter-cats');
  fc.innerHTML = '<div class="chip active" onclick="filterCat(\'\',this)">Todas</div>';
  cats.forEach(c => {
    const d   = document.createElement('div');
    d.className = 'chip';
    d.textContent = c;
    d.onclick = () => filterCat(c, d);
    fc.appendChild(d);
  });
}

function setFilterType(type, el) {
  document.querySelectorAll('.filter-group:first-child .chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  const q   = document.getElementById('search-input').value.toLowerCase();
  const cat = document.querySelector('#filter-cats .chip.active')?.textContent || '';
  renderResults(q, cat === 'Todas' ? '' : cat, type);
}

function filterCat(cat, el) {
  document.querySelectorAll('#filter-cats .chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  renderResults(document.getElementById('search-input').value.toLowerCase(), cat, activeTypeFilter);
}

function sortResults(by) {
  const grid   = document.getElementById('results-grid');
  const sorted = [...currentResults];
  if (by === 'az') sorted.sort((a, b) => a.name.localeCompare(b.name));
  grid.innerHTML = '';
  sorted.forEach(i => renderCard(i, grid));
}

function toggleChip(el) {
  el.classList.toggle('active');
}

/* ===== ACTIONS ===== */
function contactItem(id) {
  if (!currentUser) {
    showToast('⚠️ Entre na sua conta para contatar');
    openModal('login');
    return;
  }
  showToast('📩 Mensagem enviada ao responsável!');
}

function submitItem(type) {
  if (!currentUser) {
    showToast('⚠️ Faça login para publicar');
    switchModal('login');
    return;
  }

  const p        = type === 'Perdido' ? 'ni' : 'nf';
  const name     = document.getElementById(`${p}-name`).value.trim();
  const location = document.getElementById(`${p}-location`).value.trim();

  if (!name || !location) {
    showToast('⚠️ Preencha nome e local');
    return;
  }

  const cat    = document.getElementById(`${p}-cat`).value;
  const emojis = { Documentos:'🪪', Eletrônicos:'📱', Chaves:'🔑', Carteiras:'👛', Roupas:'👕', Animais:'🐾', Bolsas:'👜', Outros:'📦' };
  const today  = new Date();
  const dateStr= `${String(today.getDate()).padStart(2,'0')}/${String(today.getMonth()+1).padStart(2,'0')}/${today.getFullYear()}`;

  ITEMS.unshift({
    id: Date.now(), type, name, cat,
    emoji: emojis[cat] || '📦',
    color: type === 'Perdido' ? '#3B5BDB' : '#10B981',
    location, date: dateStr, tags: [cat],
    user: currentUser.name, resolved: false
  });

  closeModal();
  showToast(type === 'Perdido' ? '😢 Registro publicado!' : '😊 Registro publicado!');
  renderFeatured();
}

/* ===== FAVORITES ===== */
function toggleFav(id, btn) {
  if (!currentUser) {
    showToast('⚠️ Entre na sua conta para salvar');
    openModal('login');
    return;
  }

  if (favorites.includes(id)) {
    favorites = favorites.filter(f => f !== id);
    btn.innerHTML = '🤍';
    btn.classList.remove('active');
    showToast('Removido dos favoritos');
  } else {
    favorites.push(id);
    btn.innerHTML = '💜';
    btn.classList.add('active');
    showToast('💜 Salvo nos favoritos!');
  }
  localStorage.setItem('lz_ae_favs', JSON.stringify(favorites));
}

function renderFavoritesPage() {
  const grid     = document.getElementById('favorites-grid');
  grid.innerHTML = '';
  const favItems = ITEMS.filter(i => favorites.includes(i.id));

  if (!favItems.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="big-emoji">💜</div>
        <h3>Nenhum favorito ainda</h3>
        <p>Salve registros para acompanhá-los aqui.</p>
        <button class="btn btn-primary" onclick="performSearch()">Explorar registros</button>
      </div>`;
  } else {
    favItems.forEach(i => renderCard(i, grid));
  }
}

/* ===== PAGE ROUTER ===== */
function showPage(page) {
  ['home-page', 'results-page', 'favorites-page'].forEach(id => {
    document.getElementById(id).style.display = 'none';
  });

  const footer = document.getElementById('main-footer');

  if (page === 'home') {
    document.getElementById('home-page').style.display = 'block';
    footer.style.display = 'block';
  } else if (page === 'results') {
    document.getElementById('results-page').style.display = 'block';
    footer.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (page === 'favorites') {
    document.getElementById('favorites-page').style.display = 'block';
    footer.style.display = 'block';
    renderFavoritesPage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

/* ===== AUTH ===== */
function doLogin() {
  const email = document.getElementById('login-email').value;
  const pass  = document.getElementById('login-pass').value;
  if (!email || !pass) { showToast('⚠️ Preencha todos os campos'); return; }
  loginUser({ name: email.split('@')[0], email });
  closeModal();
  showToast('✅ Bem-vindo de volta!');
}

function doSignup() {
  const name  = document.getElementById('signup-name').value;
  const email = document.getElementById('signup-email').value;
  const pass  = document.getElementById('signup-pass').value;
  if (!name || !email || !pass) { showToast('⚠️ Preencha todos os campos'); return; }
  if (pass.length < 6) { showToast('⚠️ Senha muito curta'); return; }
  loginUser({ name, email });
  closeModal();
  showToast('🎉 Conta criada!');
}

function doGoogleLogin() {
  loginUser({ name: 'Usuário Google', email: 'usuario@gmail.com' });
  closeModal();
  showToast('✅ Login realizado!');
}

function loginUser(user) {
  currentUser = user;
  const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  document.getElementById('nav-actions').innerHTML = `
    <button class="btn btn-success" onclick="openModal('newitem-found')" style="padding:9px 18px;font-size:.85rem">+ Registrar</button>
    <div class="user-menu-wrap">
      <button class="user-avatar" onclick="toggleDropdown()">${initials}</button>
      <div class="user-dropdown" id="user-dropdown">
        <a href="#">👤 ${user.name}</a>
        <a href="#" onclick="showPage('favorites')">💜 Favoritos</a>
        <a href="#" onclick="openModal('newitem-lost')">😢 Perdi algo</a>
        <a href="#" onclick="openModal('newitem-found')">😊 Achei algo</a>
        <div class="dd-divider"></div>
        <a class="dd-logout" href="#" onclick="doLogout()">🚪 Sair</a>
      </div>
    </div>`;

  document.getElementById('fav-nav-link').style.display = 'inline';
  document.getElementById('mob-fav-link').style.display = 'inline';
}

function toggleDropdown() {
  document.getElementById('user-dropdown')?.classList.toggle('open');
}

function doLogout() {
  currentUser = null;
  document.getElementById('nav-actions').innerHTML = `
    <button class="btn btn-ghost" onclick="openModal('login')">Entrar</button>
    <button class="btn btn-primary" onclick="openModal('signup')">Criar conta</button>`;
  document.getElementById('fav-nav-link').style.display = 'none';
  document.getElementById('mob-fav-link').style.display = 'none';
  showToast('👋 Até logo!');
}

/* ===== MODAL ===== */
function openModal(type) {
  document.getElementById('modal-overlay').classList.add('open');
  ['login', 'signup', 'newitem-lost', 'newitem-found'].forEach(id => {
    const el = document.getElementById('modal-' + id);
    if (el) el.style.display = id === type ? 'block' : 'none';
  });
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}

function closeModalOutside(e) {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
}

function switchModal(type) {
  openModal(type);
}

/* ===== TOAST ===== */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

/* ===== MISC ===== */
function toggleMobileNav() {
  document.getElementById('mobile-nav').classList.toggle('open');
}

/* ===== EVENT LISTENERS ===== */
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 20);
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.user-menu-wrap')) {
    document.getElementById('user-dropdown')?.classList.remove('open');
  }
});

document.addEventListener('DOMContentLoaded', () => {
  // Render initial featured items
  renderFeatured();

  // Enter key triggers search
  document.getElementById('search-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') performSearch();
  });

  // Set today's date on new item forms
  const today = new Date().toISOString().split('T')[0];
  ['ni-date', 'nf-date'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = today;
  });

  // Scroll reveal animation
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('visible');
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
});

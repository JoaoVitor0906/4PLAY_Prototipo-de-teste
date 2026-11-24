/* 4PLAY – lógica do protótipo (HTML + CSS + JavaScript puros) */
(function () {
  // ---------- Dados fictícios ----------
  var EV = [
    { id: 1, game: 'Valorant', cat: 'Profissional', st: 'Ao vivo', title: 'Nova Esports × Crimson Five', tour: 'Regional · Final', plat: 'Twitch', info: '12,4 mil assistindo', bg: '#8C0F18' },
    { id: 2, game: 'League of Legends', cat: 'Profissional', st: 'Ao vivo', title: 'Aurora Gaming × Pixel Wolves', tour: 'Liga Nacional · Semifinal', plat: 'YouTube', info: '8,1 mil assistindo', bg: '#5A0B10' },
    { id: 3, game: 'CS2', cat: 'Amador', st: 'Ao vivo', title: 'Vortex Five × Black Orbit', tour: 'Copa Comunitária · Grupo B', plat: 'Twitch', info: '5,6 mil assistindo', bg: '#A3141D' },
    { id: 4, game: 'Valorant', cat: 'Amador', st: 'Ao vivo', title: 'Lunar Squad × Rift Hunters', tour: 'Torneio Amador · Oitavas', plat: 'YouTube', info: '3,2 mil assistindo', bg: '#6E0D14' },
    { id: 5, game: 'Dota 2', cat: 'Profissional', st: 'Ao vivo', title: 'Iron Tide × Neon Raiders', tour: 'Liga Regional · Rodada 4', plat: 'Twitch', info: '1,9 mil assistindo', bg: '#7A1017' },
    { id: 6, game: 'League of Legends', cat: 'Profissional', st: 'Em breve', title: 'Aurora Gaming × Vortex Five', tour: 'Liga Nacional · Final', plat: 'Twitch', info: 'Em 02:14:35', bg: '#4A0A0F' },
    { id: 7, game: 'Valorant', cat: 'Amador', st: 'Em breve', title: 'Lunar Squad × Alpha Cell', tour: 'Torneio Amador · Quartas', plat: 'YouTube', info: 'Em 05:40:12', bg: '#6E0D14' },
    { id: 8, game: 'CS2', cat: 'Profissional', st: 'Em breve', title: 'Dust Kings × Alpha Cell', tour: 'Qualificatória · Rodada 2', plat: 'YouTube', info: 'Amanhã, 19:00', bg: '#8C0F18' },
    { id: 9, game: 'Dota 2', cat: 'Profissional', st: 'Concluído', title: 'Pixel Wolves × Iron Tide', tour: 'Liga Regional · Rodada 3', plat: 'Twitch', info: 'Placar 2 a 1', bg: '#262626' },
    { id: 10, game: 'CS2', cat: 'Amador', st: 'Concluído', title: 'Black Orbit × Vortex Five', tour: 'Copa Comunitária · Grupo A', plat: 'YouTube', info: 'Placar 2 a 0', bg: '#262626' }
  ];
  var GAMES = ['League of Legends', 'CS2', 'Valorant', 'Dota 2'];
  var OPTS = {
    game: ['Todos'].concat(GAMES),
    cat: ['Todos', 'Profissional', 'Amador'],
    st: ['Todos', 'Ao vivo', 'Em breve', 'Concluído']
  };
  var LEAD = { '15': '15 minutos', '30': '30 minutos', '60': '1 hora' };
  var TEAMS = [];
  var preferencesVersion = 0;
  EV.forEach(function (e) {
    e.title.split(' × ').forEach(function (t) { if (TEAMS.indexOf(t) < 0) TEAMS.push(t); });
  });

  // ---------- Estado ----------
  var S = { q: '', game: 'Todos', cat: 'Todos', st: 'Todos' }; // busca e filtros
  var P = load(); // preferências do usuário (salvas no navegador)

  function normalizeSaved(saved) {
    return (Array.isArray(saved) ? saved : []).map(Number).filter(function (id) { return Number.isInteger(id); });
  }

  function load() {
    try {
      var d = JSON.parse(localStorage.getItem('4play'));
      if (d && d.saved) {
        d.user = d.user || null;
        d.token = d.token || null;
        d.games = d.games || [];
        d.teams = d.teams || [];
        d.saved = normalizeSaved(d.saved);
        d.lead = d.lead || '15';
        return d;
      }
    } catch (e) {}
    return { games: [], teams: [], saved: [], lead: '15', user: null, token: null };
  }
  function save() {
    preferencesVersion++;
    try {
      localStorage.setItem('4play', JSON.stringify(P));
      syncPreferences();
      return true;
    } catch (e) {
      toast('Não foi possível salvar sua preferência neste navegador.');
      return false;
    }
  }
  function api(path, options) {
    options = options || {};
    options.headers = options.headers || {};
    if (P.token) options.headers.Authorization = 'Bearer ' + P.token;
    if (options.body) options.headers['Content-Type'] = 'application/json';
    return fetch(path, options).then(function (response) {
      return response.json().catch(function () { return {}; }).then(function (data) {
        if (!response.ok) throw new Error(data.error || 'Não foi possível concluir a operação.');
        return data;
      });
    });
  }
  function applyPreferences(preferences) {
    P.games = preferences.games || [];
    P.teams = preferences.teams || [];
    P.saved = normalizeSaved(preferences.saved || []);
    P.lead = preferences.lead || '15';
  }
  function syncPreferences() {
    if (!P.token) return;
    api('/api/preferences', {
      method: 'PUT',
      body: JSON.stringify({ games: P.games, teams: P.teams, saved: P.saved, lead: P.lead })
    }).catch(function (error) { toast(error.message); });
  }
  function restoreSession() {
    if (!P.token) {
      renderUserState();
      return;
    }
    var version = preferencesVersion;
    api('/api/me').then(function (data) {
      P.user = data.user;
      if (version === preferencesVersion) applyPreferences(data.preferences);
      localStorage.setItem('4play', JSON.stringify(P));
      renderUserState();
      if (location.hash === '#painel') renderPainel();
    }).catch(function () {
      P.token = null;
      P.user = null;
      localStorage.setItem('4play', JSON.stringify(P));
      renderUserState();
      if (location.hash === '#painel') renderPainel();
    });
  }

  // ---------- Utilitários ----------
  var $ = function (id) { return document.getElementById(id); };
  var has = function (a, v) { return a.indexOf(v) > -1; };
  function tog(a, v) { var i = a.indexOf(v); if (i > -1) a.splice(i, 1); else a.push(v); }
  function ev(id) { return EV.filter(function (e) { return e.id === +id; })[0]; }
  function norm(s) { return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  var tt;
  function toast(m) {
    var t = $('toast'); t.textContent = m; t.classList.add('on');
    clearTimeout(tt); tt = setTimeout(function () { t.classList.remove('on'); }, 2800);
  }

  // ---------- Componentes ----------
  function badge(e) {
    if (e.st === 'Ao vivo') return '<span class="live"><i class="dot"></i>AO VIVO</span>';
    if (e.st === 'Em breve') return '<span class="soon">EM BREVE</span>';
    return '<span class="done">CONCLUÍDO</span>';
  }
  function remindBtn(e) {
    var on = has(P.saved, e.id);
    if (!P.user) {
      return '<button class="btn s" data-login-required="remind" aria-label="Entre para lembrar desta partida">Entrar para lembrar-me</button>';
    }
    return '<button class="btn s' + (on ? ' on' : '') + '" data-remind="' + e.id + '" aria-pressed="' + on + '">' + (on ? 'Alerta ativo ✓' : 'Lembrar-me') + '</button>';
  }
  function action(e) {
    if (e.st === 'Ao vivo') return '<button class="btn" data-go="partida-' + e.id + '">Assistir</button>';
    if (e.st === 'Em breve') return remindBtn(e);
    return '<button class="btn s" data-go="partida-' + e.id + '">Ver resumo</button>';
  }
  function card(e) {
    return '<div class="card"><div class="th" style="background:linear-gradient(135deg,' + e.bg + ',#0A0A0A)">' + badge(e) + '<span class="vw">' + e.info + '</span></div>' +
      '<div class="bd"><div class="mt"><span class="tg">' + e.game + '</span><span>' + e.cat + ' · ' + e.plat + '</span></div>' +
      '<h3><a href="#partida-' + e.id + '">' + e.title + '</a></h3><p>' + e.tour + '</p>' + action(e) + '</div></div>';
  }

  // ---------- Tela 1: Início ----------
  function renderHome() {
    $('home-live').innerHTML = EV.filter(function (e) { return e.st === 'Ao vivo'; }).map(card).join('');
    $('home-soon').innerHTML = EV.filter(function (e) {
      return e.id === 6 || e.id === 7 || e.id === 9;
    }).map(function (e) {
      return '<div class="agenda-card"><div><strong>' + e.title + '</strong><small>' + e.game + ' · ' + e.plat + '</small></div><b>' +
        (e.st === 'Em breve' ? e.info.replace('Em ', '') : '') + '</b>' +
        (e.st === 'Concluído' ? '<button class="btn s" data-go="partida-' + e.id + '">Ver resumo</button>' : '') + '</div>';
    }).join('');
  }

  // ---------- Tela 3: Explorar (busca com filtros) ----------
  function chips() {
    ['game', 'cat', 'st'].forEach(function (k) {
      $('g-' + k).innerHTML = OPTS[k].map(function (v) {
        return '<button class="chip" data-k="' + k + '" data-v="' + v + '" aria-pressed="' + (S[k] === v) + '">' + v + '</button>';
      }).join('');
    });
  }
  function results() {
    var t = norm(S.q.trim());
    var r = EV.filter(function (e) {
      return (S.game === 'Todos' || e.game === S.game) && (S.cat === 'Todos' || e.cat === S.cat) &&
        (S.st === 'Todos' || e.st === S.st) && (!t || norm(e.title + ' ' + e.tour + ' ' + e.game).indexOf(t) > -1);
    });
    $('results').innerHTML = r.map(card).join('');
    $('empty').hidden = r.length > 0;
    $('count').textContent = r.length === 0 ? 'Sem resultados' : r.length + (r.length === 1 ? ' evento encontrado' : ' eventos encontrados');
    $('reset').hidden = !(t || S.game !== 'Todos' || S.cat !== 'Todos' || S.st !== 'Todos');
  }
  function reset() {
    S = { q: '', game: 'Todos', cat: 'Todos', st: 'Todos' };
    $('q').value = '';
    $('nav-q').value = '';
    chips();
    results();
  }

  // ---------- Tela 2: Detalhes da partida ----------
  function detail(id) {
    var e = ev(id);
    if (!e) { location.hash = 'inicio'; return; }
    var tm = e.title.split(' × ');
    var wa = 10 + (e.id * 3) % 7, la = 3 + (e.id * 5) % 4, wb = 9 + (e.id * 2) % 6, lb = 4 + (e.id * 7) % 4;
    var pct = function (w, l) { return Math.round(w / (w + l) * 100) + '%'; };
    var player;
    if (e.st === 'Ao vivo') {
      player = '<div class="player" style="background:linear-gradient(135deg,' + e.bg + ',#0A0A0A)">' + badge(e) +
        '<svg width="56" height="56" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>' +
        '<p>Transmissão ao vivo na ' + e.plat + '</p><small>' + e.info + ' · o player da ' + e.plat + ' é incorporado aqui</small></div>';
    } else if (e.st === 'Em breve') {
      player = '<div class="player" style="background:linear-gradient(135deg,' + e.bg + ',#0A0A0A)">' + badge(e) +
        '<p>Esta partida começa ' + e.info.toLowerCase() + '</p>' + remindBtn(e) + '</div>';
    } else {
      player = '<div class="player" style="background:#161616">' + badge(e) + '<p>Partida encerrada · ' + e.info + '</p><small>Resumo e estatísticas abaixo</small></div>';
    }
    var sc = e.st === 'Ao vivo' ? ['Encerrado', 'Em andamento', 'Em breve'] : e.st === 'Em breve' ? ['Em breve', 'Em breve', 'Em breve'] : ['Encerrado', 'Encerrado', 'Encerrado'];
    var sched = sc.map(function (s, i) { return '<tr><td>Jogo ' + (i + 1) + '</td><td>' + (19 + i) + ':00</td><td>' + s + '</td></tr>'; }).join('');
    $('v-partida').innerHTML =
      '<div class="title-row"><div><button class="lnk" data-back>← Voltar</button><h1>' + e.title + '</h1><span class="mt">' + e.game + ' · ' + e.tour + ' · ' + e.cat + '</span></div>' + (e.st === 'Ao vivo' ? remindBtn(e).replace('Lembrar-me', 'Avisar-me nas próximas') : '') + '</div>' +
      '<div class="two"><div>' + player + '</div><aside>' +
      '<section class="panel"><h2>Tabela de horários</h2><table class="tbl"><tr><th>Jogo</th><th>Horário</th><th>Estado</th></tr>' + sched + '</table></section>' +
      '<section class="panel"><h2>Estatísticas das equipes</h2><table class="tbl"><tr><th></th><th>' + tm[0] + '</th><th>' + tm[1] + '</th></tr>' +
      '<tr><td>Vitórias</td><td>' + wa + '</td><td>' + wb + '</td></tr><tr><td>Derrotas</td><td>' + la + '</td><td>' + lb + '</td></tr>' +
      '<tr><td>Aproveitamento</td><td>' + pct(wa, la) + '</td><td>' + pct(wb, lb) + '</td></tr></table></section>' +
      '<section class="panel"><h2>Links oficiais</h2><div class="links">' +
      '<button class="btn s" data-toast="Link de exemplo: não abre neste protótipo.">Página oficial do campeonato</button>' +
      '<button class="btn s" data-toast="Link de exemplo: não abre neste protótipo.">Canal na ' + e.plat + '</button></div></section>' +
      '</aside></div>';
  }

  // ---------- Tela 4: Painel do usuário ----------
  function renderPainel() {
    if (!P.user) {
      $('v-painel').innerHTML =
        '<div class="login-shell"><section class="login-card" aria-labelledby="login-title">' +
        '<h1 id="login-title">Entrar no 4PLAY</h1><p class="sub">Acesse seu painel para acompanhar suas equipes e alertas.</p>' +
        '<form class="login-form" id="login-form">' +
        '<div class="auth-tabs" role="group" aria-label="Modo de acesso">' +
        '<button class="chip" type="button" data-auth-mode="login" aria-pressed="true">Entrar</button>' +
        '<button class="chip" type="button" data-auth-mode="register" aria-pressed="false">Criar conta</button></div>' +
        '<div class="field" id="name-field" hidden><label for="login-name">Nome</label><input id="login-name" name="name" type="text" autocomplete="name" placeholder="Como você quer ser chamado"></div>' +
        '<div class="field"><label for="login-email">E-mail</label><input id="login-email" name="email" type="email" autocomplete="email" placeholder="voce@exemplo.com" required></div>' +
        '<div class="field"><label for="login-password">Senha</label><input id="login-password" name="password" type="password" autocomplete="current-password" minlength="6" placeholder="Mínimo de 6 caracteres" required></div>' +
        '<button class="lnk forgot-link" id="forgot-password-trigger" type="button">Esqueci minha senha</button>' +
        '<div class="login-actions"><button class="btn" type="submit" id="auth-submit">Entrar no painel</button></div>' +
        '</form>' +
        '<form class="recovery-form" id="forgot-form" aria-labelledby="forgot-title" hidden>' +
        '<h2 id="forgot-title">Recuperar senha</h2>' +
        '<p class="sub">Informe seu e-mail para recuperar o acesso à sua conta.</p>' +
        '<div class="field"><label for="forgot-email">E-mail</label><input id="forgot-email" name="email" type="email" autocomplete="email" placeholder="voce@exemplo.com" required></div>' +
        '<p class="auth-notice" id="forgot-notice" role="status" aria-live="polite" hidden>A recuperação ainda não está ativada neste protótipo. Nenhum e-mail foi enviado.</p>' +
        '<div class="login-actions"><button class="lnk" id="back-to-login" type="button">Voltar para o login</button><button class="btn" type="submit">Solicitar recuperação</button></div>' +
        '</form></section></div>';
      var authMode = 'login';
      $('forgot-password-trigger').addEventListener('click', function () {
        $('forgot-email').value = $('login-email').value;
        $('forgot-notice').hidden = true;
        $('login-form').hidden = true;
        $('forgot-form').hidden = false;
        $('forgot-email').focus();
      });
      $('back-to-login').addEventListener('click', function () {
        $('forgot-form').hidden = true;
        $('login-form').hidden = false;
        $('login-email').focus();
      });
      $('forgot-form').addEventListener('submit', function (event) {
        event.preventDefault();
        $('forgot-notice').hidden = false;
      });
      document.querySelectorAll('[data-auth-mode]').forEach(function (button) {
        button.addEventListener('click', function () {
          authMode = button.dataset.authMode;
          document.querySelectorAll('[data-auth-mode]').forEach(function (item) {
            item.setAttribute('aria-pressed', item === button ? 'true' : 'false');
          });
          $('name-field').hidden = authMode !== 'register';
          $('login-password').autocomplete = authMode === 'register' ? 'new-password' : 'current-password';
          $('auth-submit').textContent = authMode === 'register' ? 'Criar conta' : 'Entrar no painel';
          $('forgot-password-trigger').hidden = authMode !== 'login';
        });
      });
      $('login-form').addEventListener('submit', function (event) {
        event.preventDefault();
        var name = $('login-name').value.trim();
        var email = $('login-email').value.trim();
        var password = $('login-password').value;
        if (authMode === 'register' && name.length < 2) {
          toast('Informe seu nome.');
          return;
        }
        var endpoint = authMode === 'register' ? '/api/auth/register' : '/api/auth/login';
        var body = authMode === 'register'
          ? { name: name, email: email, password: password }
          : { email: email, password: password };
        api(endpoint, { method: 'POST', body: JSON.stringify(body) }).then(function (data) {
          P.token = data.token;
          P.user = data.user;
          applyPreferences(data.preferences);
          localStorage.setItem('4play', JSON.stringify(P));
          renderUserState();
          renderPainel();
          toast(authMode === 'register' ? 'Conta criada com sucesso.' : 'Login realizado com sucesso.');
        }).catch(function (error) { toast(error.message); });
      });
      return;
    }

    var saved = EV.filter(function (e) { return has(P.saved, e.id); });
    var agenda = saved.length
      ? saved.map(function (e) {
        return '<div class="row"><div><strong>' + e.title + '</strong><small>' + e.game + ' · ' + e.info + '</small></div><div class="btns"><button class="btn s" data-go="partida-' + e.id + '">Ver</button><button class="btn s" data-remind="' + e.id + '">Remover</button></div></div>';
      }).join('')
      : '<div class="empty"><h3>Você ainda não salvou nenhum evento</h3><p>Use “Lembrar-me” nas partidas que vão começar para vê-las aqui.</p><button class="btn" data-go="explorar">Explorar eventos</button></div>';
    $('v-painel').innerHTML =
      '<div class="account-bar"><div><strong>Meu painel</strong><small>' + P.user.name + ' · ' + P.user.email + '</small></div><button class="btn s" id="logout">Sair</button></div>' +
      '<p class="sub">Escolha seus jogos e equipes e defina quando quer ser avisado.</p>' +
      '<section class="panel"><h2>Jogos favoritos</h2><div class="chips">' + GAMES.map(function (g) {
        return '<button class="chip" data-pg="' + g + '" aria-pressed="' + has(P.games, g) + '">' + g + '</button>';
      }).join('') + '</div></section>' +
      '<section class="panel"><h2>Equipes</h2>' + TEAMS.map(function (t) {
        var on = has(P.teams, t);
        return '<div class="row"><span>' + t + '</span><button class="btn s' + (on ? ' on' : '') + '" data-team="' + t + '" aria-pressed="' + on + '">' + (on ? 'Seguindo ✓' : 'Seguir') + '</button></div>';
      }).join('') + '</section>' +
      '<section class="panel"><h2>Alertas</h2><div class="row"><label for="lead">Avisar com antecedência de</label><select id="lead">' +
      Object.keys(LEAD).map(function (k) { return '<option value="' + k + '"' + (P.lead === k ? ' selected' : '') + '>' + LEAD[k] + '</option>'; }).join('') + '</select></div></section>' +
      '<section class="panel"><h2>Minha agenda</h2>' + agenda + '</section>';
    $('logout').addEventListener('click', function () {
      var currentToken = P.token;
      if (currentToken) {
        api('/api/auth/logout', { method: 'POST' }).catch(function () {});
      }
      P.token = null;
      P.user = null;
      save();
      renderUserState();
      renderPainel();
      toast('Você saiu da sua conta.');
    });
  }

  function renderUserState() {
    var avatar = $('user-avatar');
    if (P.user) {
      avatar.textContent = P.user.name.split(/\s+/).map(function (part) { return part.charAt(0); }).slice(0, 2).join('').toUpperCase();
      avatar.setAttribute('aria-label', 'Abrir painel de ' + P.user.name);
    } else {
      avatar.textContent = 'JV';
      avatar.setAttribute('aria-label', 'Entrar no meu painel');
    }
  }

  // ---------- Rotas ----------
  function route() {
    var h = location.hash.slice(1) || 'inicio';
    var m = h.match(/^partida-(\d+)$/);
    var v = m ? 'partida' : (['inicio', 'explorar', 'painel'].indexOf(h) > -1 ? h : 'inicio');
    ['inicio', 'partida', 'explorar', 'painel'].forEach(function (n) { $('v-' + n).hidden = n !== v; });
    ['inicio', 'explorar', 'painel'].forEach(function (n) { $('n-' + n).className = 'l' + (n === v ? ' on' : ''); });
    if (m) detail(m[1]);
    if (v === 'painel') renderPainel();
    window.scrollTo(0, 0);
  }
  function refresh() {
    renderHome(); results();
    var m = location.hash.match(/^#partida-(\d+)$/);
    if (m) detail(m[1]);
    if (location.hash === '#painel') renderPainel();
  }

  // ---------- Eventos ----------
  document.addEventListener('click', function (x) {
    var el = x.target.closest('[data-k],[data-go],[data-remind],[data-pg],[data-team],[data-toast],[data-back],[data-login-required]');
    if (!el) return;
    var d = el.dataset;
    if (d.k) { S[d.k] = d.v; chips(); results(); }
    else if (d.go) { location.hash = d.go; }
    else if (d.loginRequired) {
      location.hash = 'painel';
      toast('Entre ou crie uma conta para adicionar lembretes.');
    }
    else if (d.back !== undefined) { if (history.length > 1) history.back(); else location.hash = 'inicio'; }
    else if (d.remind) {
      if (!P.user) {
        location.hash = 'painel';
        toast('Entre ou crie uma conta para adicionar lembretes.');
        return;
      }
      tog(P.saved, +d.remind); save();
      toast(has(P.saved, +d.remind) ? 'Alerta criado: você será avisado ' + LEAD[P.lead] + ' antes.' : 'Alerta removido.');
      refresh();
    }
    else if (d.pg) { tog(P.games, d.pg); save(); toast(has(P.games, d.pg) ? d.pg + ' adicionado aos favoritos.' : d.pg + ' removido dos favoritos.'); renderPainel(); }
    else if (d.team) { tog(P.teams, d.team); save(); toast(has(P.teams, d.team) ? 'Você segue ' + d.team + '.' : 'Você deixou de seguir ' + d.team + '.'); renderPainel(); }
    else if (d.toast) { toast(d.toast); }
  });
  document.addEventListener('change', function (x) {
    if (x.target.id === 'lead') { P.lead = x.target.value; save(); toast('Preferência salva: aviso ' + LEAD[P.lead] + ' antes.'); }
  });
  $('q').addEventListener('input', function (x) {
    S.q = x.target.value;
    $('nav-q').value = S.q;
    results();
  });
  $('nav-q').addEventListener('input', function (x) {
    if (x.target.value && location.hash !== '#explorar') location.hash = 'explorar';
    S.q = x.target.value; $('q').value = S.q; results();
  });
  $('reset').addEventListener('click', reset);
  $('reset2').addEventListener('click', reset);
  window.addEventListener('hashchange', route);

  // ---------- Início ----------
  renderHome(); chips(); results(); restoreSession(); route();
})();

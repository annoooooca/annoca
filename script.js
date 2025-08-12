// Navegação entre seções
document.querySelectorAll('nav a').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      document.querySelectorAll('nav a').forEach(x => x.classList.remove('active'));
      a.classList.add('active');
      const sec = a.getAttribute('data-sec');
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.getElementById(sec).classList.add('active');
    });
  });
  
  // Fórum (chat)
  let nomeUsuario = localStorage.getItem('nomeUsuario') || '';
  if (!nomeUsuario) {
    nomeUsuario = prompt("Digite seu nome para participar do fórum:") || "Anônimo";
    localStorage.setItem('nomeUsuario', nomeUsuario);
  }
  
  const localKey = 'forumMensagens';
  let mensagens = JSON.parse(localStorage.getItem(localKey)) || [];
  const chatBox = document.getElementById('chatBox');
  
  function mostrarMensagens() {
    chatBox.innerHTML = '';
    mensagens.forEach(msg => {
      const div = document.createElement('div');
      div.className = 'message' + (msg.de === nomeUsuario ? ' self' : '');
      div.innerHTML = `<strong>${msg.de}</strong> <span class="meta">${msg.hora}</span><br>${msg.texto}`;
      chatBox.appendChild(div);
    });
    chatBox.scrollTop = chatBox.scrollHeight;
  }
  
  function enviarMensagem() {
    const input = document.getElementById('mensagemInput');
    const texto = input.value.trim();
    if (!texto) return;
    const agora = new Date();
    const hora = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const novaMensagem = { de: nomeUsuario, texto, hora };
    mensagens.push(novaMensagem);
    localStorage.setItem(localKey, JSON.stringify(mensagens));
    mostrarMensagens();
    input.value = '';
  }
  
  mostrarMensagens();
  
  // Calendário
  const mesAnoEl = document.getElementById('mesAno');
  const corpoCalendarioEl = document.getElementById('corpoCalendario');
  const prevMonthBtn = document.getElementById('prevMonth');
  const nextMonthBtn = document.getElementById('nextMonth');
  const modalEvento = document.getElementById('modalEvento');
  const formAddEvento = document.getElementById('formAddEvento');
  const tituloEventoModal = document.getElementById('tituloEventoModal');
  const horaEventoModal = document.getElementById('horaEventoModal');
  
  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  let dataAtual = new Date();
  let diaSelecionado = null;
  const eventos = JSON.parse(localStorage.getItem('eventosCalendario')) || {};
  
  function renderizarCalendario() {
    const ano = dataAtual.getFullYear();
    const mes = dataAtual.getMonth();
    mesAnoEl.textContent = `${meses[mes]} ${ano}`;
  
    corpoCalendarioEl.innerHTML = '';
    const primeiroDiaDoMes = new Date(ano, mes, 1).getDay();
    const ultimoDiaDoMes = new Date(ano, mes + 1, 0).getDate();
  
    let data = 1;
    for (let i = 0; i < 6; i++) {
      const linha = document.createElement('tr');
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < primeiroDiaDoMes) {
          const celula = document.createElement('td');
          celula.classList.add('disabled');
          linha.appendChild(celula);
        } else if (data > ultimoDiaDoMes) {
          const celula = document.createElement('td');
          celula.classList.add('disabled');
          linha.appendChild(celula);
        } else {
          const celula = document.createElement('td');
          celula.innerHTML = `<div class="day-number">${data}</div>`;
          celula.dataset.dia = `${ano}-${mes + 1}-${data}`;
  
          const eventosDoDia = eventos[celula.dataset.dia];
          if (eventosDoDia) {
            eventosDoDia.forEach(evento => {
              const eventoEl = document.createElement('div');
              eventoEl.className = 'evento';
              eventoEl.textContent = `${evento.hora} ${evento.titulo}`;
              celula.appendChild(eventoEl);
            });
          }
  
          celula.addEventListener('click', () => {
            diaSelecionado = celula.dataset.dia;
            abrirModal();
          });
          linha.appendChild(celula);
          data++;
        }
      }
      corpoCalendarioEl.appendChild(linha);
    }
  }
  
  function abrirModal() {
    formAddEvento.reset();
    modalEvento.style.display = 'flex';
  }
  
  function fecharModal() {
    modalEvento.style.display = 'none';
  }
  
  formAddEvento.addEventListener('submit', e => {
    e.preventDefault();
    if (!diaSelecionado) return;
  
    const titulo = tituloEventoModal.value;
    const hora = horaEventoModal.value;
    
    if (!eventos[diaSelecionado]) {
      eventos[diaSelecionado] = [];
    }
    
    eventos[diaSelecionado].push({ titulo, hora });
    localStorage.setItem('eventosCalendario', JSON.stringify(eventos));
    renderizarCalendario();
    fecharModal();
  });
  
  prevMonthBtn.addEventListener('click', () => {
    dataAtual.setMonth(dataAtual.getMonth() - 1);
    renderizarCalendario();
  });
  
  nextMonthBtn.addEventListener('click', () => {
    dataAtual.setMonth(dataAtual.getMonth() + 1);
    renderizarCalendario();
  });
  
  document.querySelector('#modalEvento .cancel').addEventListener('click', fecharModal);
  
  renderizarCalendario();
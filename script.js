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
  const horaStr = agora.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  mensagens.push({de: nomeUsuario, texto, hora: horaStr});
  localStorage.setItem(localKey, JSON.stringify(mensagens));
  mostrarMensagens();
  input.value = '';
}

mostrarMensagens();

// --- Calendário ---

const mesAno = document.getElementById('mesAno');
const corpoCalendario = document.getElementById('corpoCalendario');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');

// Elementos do Modal
const modal = document.getElementById('modalEvento');
const formAddEvento = document.getElementById('formAddEvento');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const tituloEventoModal = document.getElementById('tituloEventoModal');
const tipoEventoModal = document.getElementById('tipoEventoModal');
const horaEventoModal = document.getElementById('horaEventoModal');
const btnSalvar = document.getElementById('btnSalvar');
const btnExcluir = document.getElementById('btnExcluir');
const closeModal = document.querySelector('.close-modal');

let dataAtual = new Date();
let eventos = JSON.parse(localStorage.getItem('eventosCalendario') || '{}');
let dataSelecionada = null;
let indiceEventoSelecionado = null;

function salvarEventos() {
  localStorage.setItem('eventosCalendario', JSON.stringify(eventos));
}

function carregarCalendario() {
  const ano = dataAtual.getFullYear();
  const mes = dataAtual.getMonth();

  const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  mesAno.textContent = `${nomesMeses[mes]} de ${ano}`;

  corpoCalendario.innerHTML = '';

  const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
  const totalDiasMes = new Date(ano, mes + 1, 0).getDate();

  let diaContador = 1;
  for (let linha = 0; linha < 6; linha++) {
    const tr = document.createElement('tr');

    for (let diaSemana = 0; diaSemana < 7; diaSemana++) {
      const td = document.createElement('td');

      if ((linha === 0 && diaSemana < primeiroDiaSemana) || diaContador > totalDiasMes) {
        td.classList.add('disabled');
      } else {
        td.classList.add('day-cell');
        td.innerHTML = `<div class="day-number">${diaContador}</div>`;

        const keyData = `${ano}-${String(mes+1).padStart(2,'0')}-${String(diaContador).padStart(2,'0')}`;

        if (eventos[keyData]) {
          eventos[keyData].forEach((ev, index) => {
            const divEv = document.createElement('div');
            divEv.className = `evento ${ev.tipo}`;
            divEv.textContent = `${ev.hora} - ${ev.titulo}`;
            
            divEv.addEventListener('click', (e) => {
              e.stopPropagation();
              abrirModalEdicao(keyData, index);
            });
            
            td.appendChild(divEv);
          });
        }
        
        td.addEventListener('click', () => abrirModalEvento(keyData));
        diaContador++;
      }
      tr.appendChild(td);
    }
    corpoCalendario.appendChild(tr);
  }
}

prevMonthBtn.addEventListener('click', () => {
  dataAtual.setMonth(dataAtual.getMonth() - 1);
  carregarCalendario();
});

nextMonthBtn.addEventListener('click', () => {
  dataAtual.setMonth(dataAtual.getMonth() + 1);
  carregarCalendario();
});

function abrirModalEvento(data) {
  resetarModal();
  dataSelecionada = data;
  modalTitle.textContent = 'Adicionar Evento';
  modalDate.textContent = `para ${formatarData(data)}`;
  btnSalvar.textContent = 'Salvar';
  btnExcluir.style.display = 'none';
  modal.classList.add('show');
}

function abrirModalEdicao(data, index) {
  resetarModal();
  dataSelecionada = data;
  indiceEventoSelecionado = index;
  const evento = eventos[data][index];
  
  modalTitle.textContent = 'Editar Evento';
  modalDate.textContent = `para ${formatarData(data)}`;
  tituloEventoModal.value = evento.titulo;
  tipoEventoModal.value = evento.tipo;
  horaEventoModal.value = evento.hora;
  btnSalvar.textContent = 'Atualizar';
  btnExcluir.style.display = 'block';
  modal.classList.add('show');
}

function fecharModal() {
  modal.classList.remove('show');
  setTimeout(resetarModal, 300);
}

function resetarModal() {
  dataSelecionada = null;
  indiceEventoSelecionado = null;
  formAddEvento.reset();
  btnExcluir.style.display = 'none';
  modalTitle.textContent = 'Adicionar Evento';
  modalDate.textContent = '';
  btnSalvar.textContent = 'Salvar';
}

function formatarData(dataStr) {
  const partes = dataStr.split('-');
  const data = new Date(partes[0], partes[1] - 1, partes[2]);
  const opcoes = { year: 'numeric', month: 'long', day: 'numeric' };
  return data.toLocaleDateString('pt-BR', opcoes);
}

formAddEvento.addEventListener('submit', e => {
  e.preventDefault();

  if (!tituloEventoModal.value || !horaEventoModal.value || !tipoEventoModal.value) return;

  const novoEvento = {
    titulo: tituloEventoModal.value,
    tipo: tipoEventoModal.value,
    hora: horaEventoModal.value
  };

  if (indiceEventoSelecionado !== null) {
    eventos[dataSelecionada][indiceEventoSelecionado] = novoEvento;
  } else {
    if (!eventos[dataSelecionada]) eventos[dataSelecionada] = [];
    eventos[dataSelecionada].push(novoEvento);
  }

  salvarEventos();
  carregarCalendario();
  fecharModal();
});

btnExcluir.addEventListener('click', () => {
  if (dataSelecionada && indiceEventoSelecionado !== null) {
    eventos[dataSelecionada].splice(indiceEventoSelecionado, 1);
    if (eventos[dataSelecionada].length === 0) {
      delete eventos[dataSelecionada];
    }
    salvarEventos();
    carregarCalendario();
    fecharModal();
  }
});

closeModal.addEventListener('click', fecharModal);
modal.querySelector('.cancel').addEventListener('click', fecharModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    fecharModal();
  }
});

carregarCalendario();
document.addEventListener('DOMContentLoaded', () => {
  const usuarioLogado = verificarAutenticacao();
  const painelLider = document.getElementById('painelLider');
  const formCriarTarefa = document.getElementById('formCriarTarefa');
  const listaPendencias = document.getElementById('listaPendencias');

  // Exibe o painel de criação apenas para o Aluno Líder
  if (usuarioLogado && usuarioLogado.eLider) {
    if (painelLider) painelLider.style.display = 'block';
  }

  // Criar nova tarefa
  if (formCriarTarefa) {
    formCriarTarefa.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const usuarios = getUsuarios();
      const buscaResponsavel = document.getElementById('tarefaRaResponsavel').value.trim().toLowerCase();
      
      // Busca o aluno permitindo digitação com ou sem sufixo sp, ou por e-mail
      const responsavel = usuarios.find(u => {
        const raLimpo = u.ra.toLowerCase();
        const emailLimpo = u.email.toLowerCase();
        return raLimpo === buscaResponsavel || 
               raLimpo.replace('sp', '') === buscaResponsavel.replace('sp', '') ||
               emailLimpo === buscaResponsavel;
      });

      if (!responsavel) {
        alert('Aluno não encontrado! Verifique se digitou o RA ou E-mail correto.');
        return;
      }

      const novasPendencias = getPendencias();
      novasPendencias.push({
        id: Date.now().toString(),
        titulo: document.getElementById('tarefaTitulo').value,
        descricao: document.getElementById('tarefaDescricao').value,
        raResponsavel: responsavel.ra,
        nomeResponsavel: responsavel.nome,
        prazo: new Date(document.getElementById('tarefaPrazo').value).toISOString(),
        status: 'pendente',
        linkEntrega: '',
        dataEntrega: null
      });

      salvarPendencias(novasPendencias);
      alert(`Tarefa atribuída com sucesso para ${responsavel.nome}!`);
      formCriarTarefa.reset();
      renderizarPendencias();
    });
  }

  // Renderizar a lista de tarefas pendentes
  function renderizarPendencias() {
    const pendencias = getPendencias().filter(p => p.status === 'pendente');
    
    if (!listaPendencias) return;

    if (pendencias.length === 0) {
      listaPendencias.innerHTML = '<p>Nenhuma pendência ativa no momento.</p>';
      return;
    }

    listaPendencias.innerHTML = pendencias.map(p => {
      const eOResponsavel = usuarioLogado && (
        usuarioLogado.ra === p.raResponsavel || 
        usuarioLogado.email === p.email
      );

      return `
        <div class="card tarefa-card">
          <h4>${p.titulo}</h4>
          <p><strong>Descrição:</strong> ${p.descricao}</p>
          <p><strong>Responsável:</strong> ${p.nomeResponsavel} (RA: ${p.raResponsavel})</p>
          <p><strong>Prazo Final:</strong> ${new Date(p.prazo).toLocaleString('pt-BR')}</p>
          <div class="timer-box">
            ⏱️ Tempo restante: <span class="timer timer-count" data-prazo="${p.prazo}">Calculando...</span>
          </div>
          <br>
          ${eOResponsavel ? `
            <div class="form-group entrega-form">
              <label><strong>Sua Entrega:</strong></label>
              <input type="text" id="link-${p.id}" placeholder="Cole o link do seu arquivo ou descreva a entrega aqui">
              <button class="btn" style="margin-top: 8px;" onclick="entregarTarefa('${p.id}')">Publicar e Entregar</button>
            </div>
          ` : '<p style="margin-top: 10px;"><em>Apenas o aluno responsável pode realizar a entrega desta pendência.</em></p>'}
        </div>
      `;
    }).join('');

    iniciarTimers();
  }

  // Timer em tempo real
  function iniciarTimers() {
    const elementosTimer = document.querySelectorAll('.timer');
    
    setInterval(() => {
      elementosTimer.forEach(el => {
        const prazo = new Date(el.getAttribute('data-prazo')).getTime();
        const agora = new Date().getTime();
        const diferenca = prazo - agora;

        if (diferenca <= 0) {
          el.innerText = 'Prazo encerrado!';
          el.style.color = 'var(--danger-color)';
        } else {
          const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
          const horas = Math.floor((diferenca % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
          const segundos = Math.floor((diferenca % (1000 * 60)) / 1000);
          el.innerText = `${dias}d ${horas}h ${minutos}m ${segundos}s`;
        }
      });
    }, 1000);
  }

  // Concluir tarefa
  window.entregarTarefa = function(id) {
    const input = document.getElementById(`link-${id}`);
    if (!input.value.trim()) {
      alert('Por favor, informe o link ou conteúdo da sua entrega!');
      return;
    }

    const pendencias = getPendencias();
    const index = pendencias.findIndex(p => p.id === id);
    if (index !== -1) {
      pendencias[index].status = 'entregue';
      pendencias[index].linkEntrega = input.value;
      pendencias[index].dataEntrega = new Date().toISOString();
      salvarPendencias(pendencias);
      alert('Atividade entregue com sucesso!');
      renderizarPendencias();
    }
  };

  renderizarPendencias();
});
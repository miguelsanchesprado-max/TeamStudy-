document.addEventListener('DOMContentLoaded', () => {
  const usuario = verificarAutenticacao();

  if (usuario) {
    document.getElementById('boasVindas').innerText = `Olá, ${usuario.nome}! 👋`;
    document.getElementById('subtituloCargo').innerText = usuario.eLider 
      ? '👑 Você é o Aluno Líder deste projeto.' 
      : '👤 Você é um integrante do grupo.';
  }

  const pendencias = getPendencias();
  const pendentes = pendencias.filter(p => p.status === 'pendente');
  const entregues = pendencias.filter(p => p.status === 'entregue');

  document.getElementById('totalPendentes').innerText = pendentes.length;
  document.getElementById('totalEntregues').innerText = entregues.length;

  const resumoTarefas = document.getElementById('resumoTarefas');

  if (pendentes.length === 0) {
    resumoTarefas.innerHTML = '<p>Nenhuma entrega pendente para os próximos dias!</p>';
    return;
  }

  resumoTarefas.innerHTML = pendentes.slice(0, 3).map(p => `
    <div style="border-bottom: 1px solid var(--border-color); padding: 10px 0;">
      <strong>${p.titulo}</strong> - Responsável: ${p.nomeResponsavel}<br>
      <small>Prazo: ${new Date(p.prazo).toLocaleString('pt-BR')}</small>
    </div>
  `).join('');
});
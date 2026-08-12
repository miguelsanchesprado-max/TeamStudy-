document.addEventListener('DOMContentLoaded', () => {
  verificarAutenticacao();
  const listaEntregas = document.getElementById('listaEntregas');

  const entregas = getPendencias().filter(p => p.status === 'entregue');

  if (entregas.length === 0) {
    listaEntregas.innerHTML = '<p>Nenhuma atividade foi entregue ainda.</p>';
    return;
  }

  listaEntregas.innerHTML = entregas.map(e => `
    <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 15px; margin-bottom: 15px;">
      <h4>✅ ${e.titulo}</h4>
      <p><strong>Enviado por:</strong> ${e.nomeResponsavel} (RA: ${e.raResponsavel})</p>
      <p><strong>Data da Entrega:</strong> ${new Date(e.dataEntrega).toLocaleString('pt-BR')}</p>
      <p><strong>Conteúdo/Link enviado:</strong> <a href="${e.linkEntrega}" target="_blank">${e.linkEntrega}</a></p>
    </div>
  `).join('');
});
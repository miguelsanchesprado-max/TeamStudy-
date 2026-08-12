document.addEventListener('DOMContentLoaded', () => {
  const usuarioLogado = verificarAutenticacao();
  const painelAddMembro = document.getElementById('painelAddMembro');
  const formAddMembro = document.getElementById('formAddMembro');
  const listaMembros = document.getElementById('listaMembros');

  if (usuarioLogado && usuarioLogado.eLider) {
    painelAddMembro.style.display = 'block';
  }

  if (formAddMembro) {
    formAddMembro.addEventListener('submit', (e) => {
      e.preventDefault();
      const usuarios = getUsuarios();
      
      const novoUsuario = {
        id: Date.now().toString(),
        ra: document.getElementById('novoRa').value.trim(),
        nome: document.getElementById('novoNome').value.trim(),
        email: document.getElementById('novoEmail').value.trim(),
        senha: '123', // Senha padrão inicial
        eLider: false
      };

      usuarios.push(novoUsuario);
      localStorage.setItem('TS_usuarios', JSON.stringify(usuarios));
      alert('Membro adicionado com sucesso!');
      formAddMembro.reset();
      renderizarMembros();
    });
  }

  function renderizarMembros() {
    const usuarios = getUsuarios();
    listaMembros.innerHTML = usuarios.map(u => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border-color);">
        <div>
          <strong>${u.nome}</strong> ${u.eLider ? '👑 (Líder)' : ''}<br>
          <small>RA: ${u.ra} | E-mail: ${u.email}</small>
        </div>
        ${(usuarioLogado.eLider && !u.eLider) ? `
          <button class="btn btn-danger" onclick="removerMembro('${u.id}')">Remover</button>
        ` : ''}
      </div>
    `).join('');
  }

  window.removerMembro = function(id) {
    if (confirm('Tem certeza que deseja remover este integrante?')) {
      let usuarios = getUsuarios();
      usuarios = usuarios.filter(u => u.id !== id);
      localStorage.setItem('TS_usuarios', JSON.stringify(usuarios));
      renderizarMembros();
    }
  };

  renderizarMembros();
});
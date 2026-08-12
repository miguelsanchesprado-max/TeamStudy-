document.addEventListener('DOMContentLoaded', () => {
  const usuario = verificarAutenticacao();

  if (usuario) {
    document.getElementById('perfilNome').innerText = usuario.nome;
    document.getElementById('perfilEmail').innerText = usuario.email;
    document.getElementById('perfilRa').innerText = usuario.ra;
    document.getElementById('perfilCargo').innerText = usuario.eLider ? '👑 Aluno Líder' : '👤 Aluno Integrante';
  }
});
document.addEventListener('DOMContentLoaded', () => {
  verificarAutenticacao();

  const btnAlternarTema = document.getElementById('btnAlternarTema');
  const btnSair = document.getElementById('btnSair');

  btnAlternarTema.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const eDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('TS_tema', eDark ? 'dark' : 'light');
  });

  btnSair.addEventListener('click', () => {
    localStorage.removeItem('TS_usuarioLogado');
    window.location.href = 'index.html';
  });
});
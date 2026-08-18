document.addEventListener('DOMContentLoaded', () => {

  // Verifica se existe usuário logado
  const usuario = verificarAutenticacao();

  // Se não estiver autenticado, o storage.js
  // já fará o redirecionamento para o login.
  if (!usuario) {
    return;
  }


  // ==========================================
  // BOTÃO DE TEMA
  // ==========================================

  const btnAlternarTema = document.getElementById('btnAlternarTema');

  if (btnAlternarTema) {

    btnAlternarTema.addEventListener('click', () => {

      document.body.classList.toggle('dark-mode');

      const temaEscuro =
        document.body.classList.contains('dark-mode');

      localStorage.setItem(
        'TS_tema',
        temaEscuro ? 'dark' : 'light'
      );

    });

  }


  // ==========================================
  // BOTÃO SAIR
  // ==========================================

  const btnSair = document.getElementById('btnSair');

  if (btnSair) {

    btnSair.addEventListener('click', () => {

      const confirmar = confirm(
        'Tem certeza que deseja sair da sua conta?'
      );

      if (!confirmar) {
        return;
      }

      localStorage.removeItem('TS_usuarioLogado');

      window.location.href = 'index.html';

    });

  }

});
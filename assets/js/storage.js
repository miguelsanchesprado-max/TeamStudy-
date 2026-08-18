(function () {

  // ==========================================================
  // TEAMSTUDY
  // STORAGE / TEMA / USUÁRIO
  // ==========================================================


  // ==========================================================
  // APLICAR TEMA
  // ==========================================================

  function aplicarTema() {

    const tema =
      localStorage.getItem('TS_tema');


    if (tema === 'dark') {

      document.body.classList.add(
        'dark-mode'
      );

    } else {

      document.body.classList.remove(
        'dark-mode'
      );

    }

  }


  // ==========================================================
  // OBTER USUÁRIO LOGADO
  // ==========================================================

  function getUsuarioLogado() {

    try {

      const usuario =
        localStorage.getItem(
          'TS_usuarioLogado'
        );


      if (!usuario) {
        return null;
      }


      return JSON.parse(usuario);


    } catch (error) {

      console.error(
        '[TeamStudy Storage] Erro ao obter usuário:',
        error
      );


      return null;

    }

  }


  // ==========================================================
  // SALVAR USUÁRIO LOGADO
  // ==========================================================

  function salvarUsuarioLogado(usuario) {

    try {

      if (!usuario) {

        localStorage.removeItem(
          'TS_usuarioLogado'
        );

        return;

      }


      localStorage.setItem(
        'TS_usuarioLogado',
        JSON.stringify(usuario)
      );


    } catch (error) {

      console.error(
        '[TeamStudy Storage] Erro ao salvar usuário:',
        error
      );

    }

  }


  // ==========================================================
  // REMOVER USUÁRIO LOGADO
  // ==========================================================

  function removerUsuarioLogado() {

    try {

      localStorage.removeItem(
        'TS_usuarioLogado'
      );


    } catch (error) {

      console.error(
        '[TeamStudy Storage] Erro ao remover usuário:',
        error
      );

    }

  }


  // ==========================================================
  // OBTER TEMA
  // ==========================================================

  function getTema() {

    return (
      localStorage.getItem('TS_tema') ||
      'light'
    );

  }


  // ==========================================================
  // SALVAR TEMA
  // ==========================================================

  function salvarTema(tema) {

    if (
      tema !== 'dark' &&
      tema !== 'light'
    ) {

      console.warn(
        '[TeamStudy Storage] Tema inválido:',
        tema
      );

      return;

    }


    localStorage.setItem(
      'TS_tema',
      tema
    );


    aplicarTema();

  }


  // ==========================================================
  // APLICAR TEMA ASSIM QUE A PÁGINA CARREGAR
  // ==========================================================

  if (
    document.readyState === 'loading'
  ) {

    document.addEventListener(
      'DOMContentLoaded',
      aplicarTema
    );

  } else {

    aplicarTema();

  }


  // ==========================================================
  // DISPONIBILIZAR GLOBALMENTE
  // ==========================================================

  window.aplicarTema =
    aplicarTema;


  window.getUsuarioLogado =
    getUsuarioLogado;


  window.salvarUsuarioLogado =
    salvarUsuarioLogado;


  window.removerUsuarioLogado =
    removerUsuarioLogado;


  window.getTema =
    getTema;


  window.salvarTema =
    salvarTema;


  // ==========================================================
  // LOG
  // ==========================================================

  console.log(
    '[TeamStudy Storage] Storage carregado com sucesso.'
  );

})();
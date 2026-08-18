(function () {

  // ==========================================================
  // TEAMSTUDY V2
  // SISTEMA GLOBAL DE TEMA
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

})();
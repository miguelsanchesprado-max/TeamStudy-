document.addEventListener(
  'DOMContentLoaded',
  async () => {

    // ==========================================================
    // ELEMENTOS
    // ==========================================================

    const btnAlternarTema =
      document.getElementById(
        'btnAlternarTema'
      );


    const textoTema =
      document.getElementById(
        'textoTema'
      );


    const btnSair =
      document.getElementById(
        'btnSair'
      );


    // ==========================================================
    // INICIALIZAR TEMA
    // ==========================================================

    const temaSalvo =
      localStorage.getItem(
        'TS_tema'
      );


    /*
     * Se não existir nenhuma preferência,
     * o TeamStudy começa no tema escuro.
     */

    if (
      temaSalvo === 'light'
    ) {

      document.body.classList.remove(
        'dark-mode'
      );

    } else {

      document.body.classList.add(
        'dark-mode'
      );

    }


    atualizarTextoTema();


    // ==========================================================
    // BOTÃO DE TEMA
    // ==========================================================

    if (btnAlternarTema) {

      btnAlternarTema.addEventListener(
        'click',
        () => {

          document.body.classList.toggle(
            'dark-mode'
          );


          const temaEscuro =
            document.body.classList.contains(
              'dark-mode'
            );


          localStorage.setItem(
            'TS_tema',
            temaEscuro
              ? 'dark'
              : 'light'
          );


          atualizarTextoTema();

        }
      );

    }


    // ==========================================================
    // ATUALIZAR TEXTO DO BOTÃO
    // ==========================================================

    function atualizarTextoTema() {

      if (!textoTema) {
        return;
      }


      const temaEscuro =
        document.body.classList.contains(
          'dark-mode'
        );


      textoTema.textContent =
        temaEscuro
          ? 'Tema claro'
          : 'Tema escuro';

    }


    // ==========================================================
    // BOTÃO SAIR
    // ==========================================================

    if (btnSair) {

      btnSair.addEventListener(
        'click',
        async () => {

          const confirmar =
            confirm(
              'Tem certeza que deseja sair da sua conta?'
            );


          if (!confirmar) {
            return;
          }


          // ----------------------------------------------------
          // SAIR DO SUPABASE
          // ----------------------------------------------------

          if (
            typeof supabaseClient !==
            'undefined'
          ) {

            const {
              error
            } =
              await supabaseClient.auth.signOut();


            if (error) {

              console.error(
                'Erro ao sair:',
                error
              );

              alert(
                'Não foi possível sair da conta.'
              );

              return;

            }

          }


          // ----------------------------------------------------
          // REDIRECIONAR
          // ----------------------------------------------------

          window.location.href =
            'index.html';

        }
      );

    }

  }
);
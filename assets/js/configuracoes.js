// ==========================================================
// TEAMSTUDY V2
// CONFIGURAÇÕES
// ==========================================================

document.addEventListener('DOMContentLoaded', async () => {

  // ========================================================
  // APLICAR TEMA SALVO IMEDIATAMENTE
  // ========================================================

  aplicarTema();


  // ========================================================
  // BOTÃO DE TEMA
  // ========================================================

  const btnAlternarTema =
    document.getElementById('btnAlternarTema');


  if (btnAlternarTema) {

    atualizarBotaoTema(
      btnAlternarTema
    );


    btnAlternarTema.addEventListener(
      'click',
      () => {

        const temaAtual =
          localStorage.getItem('TS_tema');


        const novoTema =
          temaAtual === 'dark'
            ? 'light'
            : 'dark';


        localStorage.setItem(
          'TS_tema',
          novoTema
        );


        aplicarTema();


        atualizarBotaoTema(
          btnAlternarTema
        );

      }
    );

  }


  // ========================================================
  // BOTÃO SAIR
  // ========================================================

  const btnSair =
    document.getElementById('btnSair');


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


        // -----------------------------------------------
        // TENTAR SAIR DO SUPABASE
        // -----------------------------------------------

        if (
          typeof supabaseClient !== 'undefined'
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

          }

        }


        // -----------------------------------------------
        // LIMPAR SESSÃO ANTIGA
        // -----------------------------------------------

        localStorage.removeItem(
          'TS_usuarioLogado'
        );


        // -----------------------------------------------
        // IR PARA LOGIN
        // -----------------------------------------------

        window.location.href =
          'index.html';

      }
    );

  }

});


// ==========================================================
// APLICAR TEMA
// ==========================================================

function aplicarTema() {

  const tema =
    localStorage.getItem('TS_tema');


  // --------------------------------------------------------
  // TEMA ESCURO
  // --------------------------------------------------------

  if (tema === 'dark') {

    document.documentElement
      .classList.add('dark-mode');

    document.body
      ?.classList.add('dark-mode');

    return;
  }


  // --------------------------------------------------------
  // TEMA CLARO
  // --------------------------------------------------------

  document.documentElement
    .classList.remove('dark-mode');

  document.body
    ?.classList.remove('dark-mode');

}


// ==========================================================
// ATUALIZAR BOTÃO
// ==========================================================

function atualizarBotaoTema(
  botao
) {

  const tema =
    localStorage.getItem('TS_tema');


  const icone =
    botao.querySelector(
      '.material-symbols-outlined'
    );


  if (tema === 'dark') {

    if (icone) {
      icone.textContent =
        'light_mode';
    }


    botao.lastChild.textContent =
      ' Tema Claro';

  } else {

    if (icone) {
      icone.textContent =
        'dark_mode';
    }


    botao.lastChild.textContent =
      ' Tema Escuro';

  }

}
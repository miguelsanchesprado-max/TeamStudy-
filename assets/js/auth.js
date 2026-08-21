document.addEventListener('DOMContentLoaded', async () => {

  const formLogin = document.getElementById('formLogin');
  const btnEsqueciSenha = document.getElementById('btnEsqueciSenha');
  const formRecuperar = document.getElementById('formRecuperar');
  const formCadastro = document.getElementById('formCadastro');


  // ==========================================================
  // CONFIGURAÇÕES DA SESSÃO
  // ==========================================================

  const TEMPO_SESSAO = 24 * 60 * 60 * 1000;
  const CHAVE_LOGIN = 'teamstudy_login_time';


  // ==========================================================
  // VERIFICAR SESSÃO DE 24 HORAS
  // ==========================================================

  async function verificarSessao() {

    const loginTime =
      localStorage.getItem(CHAVE_LOGIN);

    // Se nunca fez login neste dispositivo,
    // não há nada para verificar.
    if (!loginTime) {
      return;
    }

    const agora = Date.now();

    const tempoDecorrido =
      agora - Number(loginTime);


    // ========================================================
    // SESSÃO EXPIRADA
    // ========================================================

    if (tempoDecorrido >= TEMPO_SESSAO) {

      console.log(
        'Sessão TeamStudy expirou após 24 horas.'
      );

      localStorage.removeItem(CHAVE_LOGIN);

      await supabaseClient.auth.signOut();

      // Se não estiver no login,
      // manda o usuário para a página de login.
      if (
        !window.location.pathname.endsWith('index.html') &&
        !window.location.pathname.endsWith('/')
      ) {

        window.location.href = 'index.html';

      }

      return;
    }


    // ========================================================
    // VERIFICAR SE O SUPABASE AINDA POSSUI A SESSÃO
    // ========================================================

    const {
      data: { session },
      error
    } = await supabaseClient.auth.getSession();


    if (error) {

      console.error(
        'Erro ao recuperar sessão:',
        error
      );

      return;
    }


    // ========================================================
    // NÃO EXISTE SESSÃO
    // ========================================================

    if (!session) {

      console.log(
        'Nenhuma sessão ativa encontrada.'
      );

      localStorage.removeItem(CHAVE_LOGIN);

      // Se estiver em uma página protegida,
      // volta para o login.
      if (
        !window.location.pathname.endsWith('index.html') &&
        !window.location.pathname.endsWith('/')
      ) {

        window.location.href = 'index.html';

      }

      return;
    }


    // ========================================================
    // SESSÃO VÁLIDA
    // ========================================================

    const tempoRestante =
      TEMPO_SESSAO - tempoDecorrido;

    const horasRestantes =
      Math.floor(
        tempoRestante / (60 * 60 * 1000)
      );

    console.log(
      `Sessão TeamStudy ativa. Aproximadamente ${horasRestantes}h restantes.`
    );

  }


  // ==========================================================
  // VERIFICAR SESSÃO AO ABRIR QUALQUER PÁGINA
  // ==========================================================

  await verificarSessao();


  // ==========================================================
  // LOGIN
  // ==========================================================

  if (formLogin) {

    formLogin.addEventListener('submit', async (e) => {

      e.preventDefault();


      const idInput =
        document.getElementById('loginIdentificacao');

      const senhaInput =
        document.getElementById('loginSenha');


      if (!idInput || !senhaInput) {
        return;
      }


      const identificacao =
        idInput.value.trim().toLowerCase();

      const senha =
        senhaInput.value.trim();


      if (!identificacao || !senha) {

        alert(
          'Preencha todos os campos.'
        );

        return;
      }


      // ======================================================
      // SUPABASE AUTH
      // ======================================================

      const {
        data,
        error
      } =
        await supabaseClient.auth.signInWithPassword({

          email: identificacao,

          password: senha

        });


      // ======================================================
      // ERRO
      // ======================================================

      if (error) {

        console.error(
          'Erro no login:',
          error
        );

        alert(
          'Credenciais inválidas. Verifique seu e-mail e senha.'
        );

        return;
      }


      // ======================================================
      // LOGIN REALIZADO
      // ======================================================

      if (data.user) {

        console.log(
          'Login realizado com sucesso!'
        );

        console.log(
          'UID:',
          data.user.id
        );


        // ====================================================
        // REGISTRAR INÍCIO DA SESSÃO DE 24 HORAS
        // ====================================================

        localStorage.setItem(
          CHAVE_LOGIN,
          Date.now().toString()
        );


        console.log(
          'Sessão de 24 horas iniciada.'
        );


        // ====================================================
        // IR PARA O DASHBOARD
        // ====================================================

        window.location.href =
          'dashboard.html';

      }

    });

  }


  // ==========================================================
  // ESQUECI A SENHA
  // ==========================================================

  if (btnEsqueciSenha) {

    btnEsqueciSenha.addEventListener(
      'click',
      (e) => {

        e.preventDefault();

        const modal =
          document.getElementById(
            'modalRecuperar'
          );


        if (modal) {

          modal.style.display =
            'block';

        }

      }
    );

  }


  // ==========================================================
  // RECUPERAÇÃO DE SENHA
  // ==========================================================

  if (formRecuperar) {

    formRecuperar.addEventListener(
      'submit',
      async (e) => {

        e.preventDefault();


        const email =
          document
            .getElementById('recEmail')
            ?.value
            .trim()
            .toLowerCase();


        if (!email) {

          alert(
            'Informe seu e-mail.'
          );

          return;
        }


        const {
          error
        } =
          await supabaseClient.auth
            .resetPasswordForEmail(
              email,
              {
                redirectTo:
                  `${window.location.origin}/index.html`
              }
            );


        if (error) {

          console.error(
            'Erro na recuperação:',
            error
          );

          alert(
            'Não foi possível enviar o e-mail de recuperação.'
          );

          return;
        }


        alert(
          `Um e-mail de recuperação foi enviado para:\n${email}`
        );


        const modal =
          document.getElementById(
            'modalRecuperar'
          );


        if (modal) {

          modal.style.display =
            'none';

        }

      }
    );

  }


  // ==========================================================
  // CADASTRO
  // ==========================================================

  if (formCadastro) {

    formCadastro.addEventListener(
      'submit',
      async (e) => {

        e.preventDefault();


        const nome =
          document
            .getElementById('cadNome')
            ?.value
            .trim();


        const ra =
          document
            .getElementById('cadRa')
            ?.value
            .trim()
            .toLowerCase();


        const email =
          document
            .getElementById('cadEmail')
            ?.value
            .trim()
            .toLowerCase();


        const senha =
          document
            .getElementById('cadSenha')
            ?.value
            .trim();


        // ====================================================
        // VALIDAÇÕES
        // ====================================================

        if (
          !nome ||
          !ra ||
          !email ||
          !senha
        ) {

          alert(
            'Preencha todos os campos.'
          );

          return;
        }


        if (senha.length < 6) {

          alert(
            'A senha deve ter pelo menos 6 caracteres!'
          );

          return;
        }


        // ====================================================
        // CRIAR USUÁRIO
        // ====================================================

        const {
          data,
          error
        } =
          await supabaseClient.auth.signUp({

            email: email,

            password: senha,

            options: {

              data: {

                nome: nome,

                ra: ra,

                eLider: false

              }

            }

          });


        // ====================================================
        // ERRO
        // ====================================================

        if (error) {

          console.error(
            'Erro ao criar conta:',
            error
          );


          if (
            error.message
              .toLowerCase()
              .includes('already registered')
          ) {

            alert(
              'Este e-mail já está cadastrado.'
            );

          } else {

            alert(
              'Não foi possível criar sua conta:\n' +
              error.message
            );

          }

          return;
        }


        // ====================================================
        // CADASTRO REALIZADO
        // ====================================================

        console.log(
          'Usuário criado:',
          data.user
        );


        alert(
          'Conta criada com sucesso!'
        );


        // ====================================================
        // CONFIRMAÇÃO DE E-MAIL
        // ====================================================

        if (!data.session) {

          alert(
            'Verifique seu e-mail para confirmar sua conta antes de fazer login.'
          );

        }


        window.location.href =
          'index.html';

      }
    );

  }

});


// ==========================================================
// VERIFICAR SE ESTÁ RODANDO COMO APP
// ==========================================================

function isAppInstalado() {

  return (

    window.matchMedia(
      '(display-mode: standalone)'
    ).matches

    ||

    window.navigator.standalone

  );

}


// ==========================================================
// BANNER DE INSTALAÇÃO
// ==========================================================

function exibirBannerInstalacao() {

  if (isAppInstalado()) {

    console.log(
      'Executando como App instalado. Popup bloqueado.'
    );

    return;
  }


  const popup =
    document.getElementById(
      'seu-popup-id'
    );


  if (popup) {

    popup.style.display =
      'block';

  }

}


document.addEventListener(
  'DOMContentLoaded',
  () => {

    exibirBannerInstalacao();

  }
);
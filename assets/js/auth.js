document.addEventListener('DOMContentLoaded', () => {

  const formLogin = document.getElementById('formLogin');
  const btnEsqueciSenha = document.getElementById('btnEsqueciSenha');
  const formRecuperar = document.getElementById('formRecuperar');
  const formCadastro = document.getElementById('formCadastro');


  // ==========================================================
  // LOGIN
  // ==========================================================

  if (formLogin) {

    formLogin.addEventListener('submit', async (e) => {

      e.preventDefault();

      const idInput = document.getElementById('loginIdentificacao');
      const senhaInput = document.getElementById('loginSenha');

      if (!idInput || !senhaInput) {
        return;
      }

      const identificacao = idInput.value.trim().toLowerCase();
      const senha = senhaInput.value.trim();

      if (!identificacao || !senha) {
        alert('Preencha todos os campos.');
        return;
      }


      // ======================================================
      // SUPABASE AUTH
      // ======================================================

      // Por enquanto o login será feito pelo e-mail.
      // O login por RA será implementado quando criarmos
      // a tabela de perfis do TeamStudy.

      const { data, error } =
        await supabaseClient.auth.signInWithPassword({
          email: identificacao,
          password: senha
        });


      if (error) {

        console.error('Erro no login:', error);

        alert(
          'Credenciais inválidas. Verifique seu e-mail e senha.'
        );

        return;
      }


      if (data.user) {

        console.log('Login realizado com sucesso!');
        console.log('UID:', data.user.id);

        // O Supabase já mantém a sessão automaticamente.
        // Não precisamos salvar a senha no localStorage.

        window.location.href = 'dashboard.html';
      }

    });

  }


  // ==========================================================
  // ESQUECI A SENHA
  // ==========================================================

  if (btnEsqueciSenha) {

    btnEsqueciSenha.addEventListener('click', (e) => {

      e.preventDefault();

      const modal = document.getElementById('modalRecuperar');

      if (modal) {
        modal.style.display = 'block';
      }

    });

  }


  // ==========================================================
  // RECUPERAÇÃO DE SENHA
  // ==========================================================

  if (formRecuperar) {

    formRecuperar.addEventListener('submit', async (e) => {

      e.preventDefault();

      const nome =
        document.getElementById('recNome')?.value.trim();

      const email =
        document.getElementById('recEmail')?.value.trim().toLowerCase();


      if (!email) {

        alert('Informe seu e-mail.');

        return;
      }


      const { error } =
        await supabaseClient.auth.resetPasswordForEmail(
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
        document.getElementById('modalRecuperar');

      if (modal) {
        modal.style.display = 'none';
      }

    });

  }


  // ==========================================================
  // CADASTRO
  // ==========================================================

  if (formCadastro) {

    formCadastro.addEventListener('submit', async (e) => {

      e.preventDefault();


      const nome =
        document.getElementById('cadNome')
          ?.value.trim();

      const ra =
        document.getElementById('cadRa')
          ?.value.trim()
          .toLowerCase();

      const email =
        document.getElementById('cadEmail')
          ?.value.trim()
          .toLowerCase();

      const senha =
        document.getElementById('cadSenha')
          ?.value.trim();


      // ======================================================
      // VALIDAÇÕES
      // ======================================================

      if (!nome || !ra || !email || !senha) {

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


      // ======================================================
      // CRIAR USUÁRIO NO SUPABASE AUTH
      // ======================================================

      const { data, error } =
        await supabaseClient.auth.signUp({

          email: email,

          password: senha,

          options: {

            // Essas informações ficam nos metadados
            // do usuário do Supabase.
            data: {

              nome: nome,

              ra: ra,

              eLider: false

            }

          }

        });


      // ======================================================
      // TRATAMENTO DE ERRO
      // ======================================================

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


      // ======================================================
      // CADASTRO REALIZADO
      // ======================================================

      console.log(
        'Usuário criado:',
        data.user
      );


      alert(
        'Conta criada com sucesso!'
      );


      // Se o Supabase exigir confirmação de e-mail,
      // o usuário receberá um e-mail.
      if (!data.session) {

        alert(
          'Verifique seu e-mail para confirmar sua conta antes de fazer login.'
        );

      }


      window.location.href =
        'index.html';

    });

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
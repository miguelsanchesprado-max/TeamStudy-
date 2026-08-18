document.addEventListener('DOMContentLoaded', async () => {

  const perfilNome = document.getElementById('perfilNome');
  const perfilEmail = document.getElementById('perfilEmail');
  const perfilRa = document.getElementById('perfilRa');
  const perfilCargo = document.getElementById('perfilCargo');


  // ==========================================================
  // PREENCHER PERFIL
  // ==========================================================

  function preencherPerfil(usuario) {

    if (perfilNome) {
      perfilNome.textContent =
        usuario.nome || 'Não informado';
    }


    if (perfilEmail) {
      perfilEmail.textContent =
        usuario.email || 'Não informado';
    }


    if (perfilRa) {
      perfilRa.textContent =
        usuario.ra || 'Não informado';
    }


    if (perfilCargo) {

      perfilCargo.textContent = usuario.eLider
        ? '👑 Aluno Líder'
        : '👤 Aluno Integrante';

    }

  }


  // ==========================================================
  // MOSTRAR ERRO
  // ==========================================================

  function mostrarErro(mensagem) {

    if (perfilNome) {
      perfilNome.textContent = 'Não disponível';
    }


    if (perfilEmail) {
      perfilEmail.textContent = 'Não disponível';
    }


    if (perfilRa) {
      perfilRa.textContent = 'Não disponível';
    }


    if (perfilCargo) {
      perfilCargo.textContent = 'Não disponível';
    }


    console.error(
      '[TeamStudy Perfil]',
      mensagem
    );

  }


  // ==========================================================
  // VERIFICAR SUPABASE
  // ==========================================================

  try {

    if (
      typeof supabaseClient === 'undefined' ||
      !supabaseClient
    ) {

      mostrarErro(
        'supabaseClient não foi carregado.'
      );

      return;

    }


    console.log(
      '[TeamStudy Perfil] Verificando sessão...'
    );


    // ========================================================
    // OBTER SESSÃO
    // ========================================================

    const {
      data,
      error
    } = await supabaseClient.auth.getSession();


    if (error) {

      console.error(
        '[TeamStudy Perfil] Erro do Supabase:',
        error
      );


      mostrarErro(
        'Não foi possível verificar a sessão.'
      );

      return;

    }


    const session = data?.session;


    // ========================================================
    // USUÁRIO NÃO LOGADO
    // ========================================================

    if (!session || !session.user) {

      console.warn(
        '[TeamStudy Perfil] Nenhuma sessão encontrada.'
      );


      window.location.href = './index.html';

      return;

    }


    // ========================================================
    // USUÁRIO DO SUPABASE
    // ========================================================

    const usuarioSupabase = session.user;

    const metadata =
      usuarioSupabase.user_metadata || {};


    console.log(
      '[TeamStudy Perfil] Usuário Supabase:',
      usuarioSupabase
    );


    // ========================================================
    // USUÁRIO LOCAL
    // ========================================================

    let usuarioLocal = null;


    /*
     * getUsuarioLogado é opcional.
     *
     * Se existir, usamos como informação complementar.
     * Se não existir, não quebra o sistema.
     */

    if (
      typeof getUsuarioLogado === 'function'
    ) {

      try {

        usuarioLocal =
          getUsuarioLogado();

      } catch (storageError) {

        console.warn(
          '[TeamStudy Perfil] Erro ao obter usuário local:',
          storageError
        );

      }

    }


    // ========================================================
    // MONTAR USUÁRIO FINAL
    // ========================================================

    const usuario = {

      id:
        usuarioSupabase.id ||
        usuarioLocal?.id ||
        null,


      nome:
        metadata.nome ||
        metadata.name ||
        usuarioLocal?.nome ||
        usuarioSupabase.email ||
        'Não informado',


      email:
        usuarioSupabase.email ||
        usuarioLocal?.email ||
        'Não informado',


      ra:
        metadata.ra ||
        usuarioLocal?.ra ||
        '',


      eLider:
        metadata.eLider === true ||
        metadata.eLider === 'true' ||
        usuarioLocal?.eLider === true ||
        usuarioLocal?.eLider === 'true'

    };


    // ========================================================
    // SALVAR LOCALMENTE
    // ========================================================

    try {

      localStorage.setItem(
        'TS_usuarioLogado',
        JSON.stringify(usuario)
      );


    } catch (storageError) {

      console.warn(
        '[TeamStudy Perfil] Não foi possível salvar no localStorage:',
        storageError
      );

    }


    // ========================================================
    // MOSTRAR PERFIL
    // ========================================================

    preencherPerfil(usuario);


    console.log(
      '[TeamStudy Perfil] Perfil carregado com sucesso:',
      usuario
    );


  } catch (error) {

    console.error(
      '[TeamStudy Perfil] Erro inesperado:',
      error
    );


    mostrarErro(
      'Ocorreu um erro ao carregar o perfil.'
    );

  }

});
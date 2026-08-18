document.addEventListener('DOMContentLoaded', async () => {

  // ==========================================================
  // VERIFICAR SESSÃO DO SUPABASE
  // ==========================================================

  const {
    data: { session },
    error
  } = await supabaseClient.auth.getSession();


  if (error || !session) {

    console.log(
      'Nenhuma sessão do Supabase encontrada.'
    );

    window.location.href = 'index.html';

    return;
  }


  // ==========================================================
  // OBTER USUÁRIO
  // ==========================================================

  let usuario =
    getUsuarioLogado();


  /*
   * Se existir no LocalStorage,
   * usamos os dados já existentes.
   *
   * Caso contrário, usamos os metadados
   * do usuário do Supabase.
   */

  if (!usuario) {

    const usuarioSupabase =
      session.user;


    usuario = {

      id:
        usuarioSupabase.id,

      nome:
        usuarioSupabase.user_metadata?.nome ||
        usuarioSupabase.email,

      email:
        usuarioSupabase.email,

      ra:
        usuarioSupabase.user_metadata?.ra ||
        '',

      eLider:
        usuarioSupabase.user_metadata?.eLider === true

    };


    localStorage.setItem(
      'TS_usuarioLogado',
      JSON.stringify(usuario)
    );

  }


  // ==========================================================
  // ELEMENTOS DA PÁGINA
  // ==========================================================

  const perfilNome =
    document.getElementById(
      'perfilNome'
    );

  const perfilEmail =
    document.getElementById(
      'perfilEmail'
    );

  const perfilRa =
    document.getElementById(
      'perfilRa'
    );

  const perfilCargo =
    document.getElementById(
      'perfilCargo'
    );


  // ==========================================================
  // PREENCHER PERFIL
  // ==========================================================

  if (perfilNome) {

    perfilNome.innerText =
      usuario.nome || 'Não informado';

  }


  if (perfilEmail) {

    perfilEmail.innerText =
      usuario.email || 'Não informado';

  }


  if (perfilRa) {

    perfilRa.innerText =
      usuario.ra || 'Não informado';

  }


  if (perfilCargo) {

    perfilCargo.innerText =
      usuario.eLider
        ? '👑 Aluno Líder'
        : '👤 Aluno Integrante';

  }


});
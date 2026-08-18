document.addEventListener('DOMContentLoaded', async () => {
  const perfilNome = document.getElementById('perfilNome');
  const perfilEmail = document.getElementById('perfilEmail');
  const perfilRa = document.getElementById('perfilRa');
  const perfilCargo = document.getElementById('perfilCargo');

  /**
   * Preenche os dados do perfil na página.
   */
  function preencherPerfil(usuario) {
    if (perfilNome) {
      perfilNome.textContent = usuario.nome || 'Não informado';
    }

    if (perfilEmail) {
      perfilEmail.textContent = usuario.email || 'Não informado';
    }

    if (perfilRa) {
      perfilRa.textContent = usuario.ra || 'Não informado';
    }

    if (perfilCargo) {
      perfilCargo.textContent = usuario.eLider
        ? '👑 Aluno Líder'
        : '👤 Aluno Integrante';
    }
  }

  /**
   * Exibe uma mensagem de erro na página.
   */
  function mostrarErro(mensagem) {
    if (perfilNome) perfilNome.textContent = 'Não disponível';
    if (perfilEmail) perfilEmail.textContent = 'Não disponível';
    if (perfilRa) perfilRa.textContent = 'Não disponível';
    if (perfilCargo) perfilCargo.textContent = 'Não disponível';

    console.error('[TeamStudy Perfil]', mensagem);
  }

  try {
    // Verifica se o Supabase foi carregado.
    if (
      typeof supabaseClient === 'undefined' ||
      !supabaseClient
    ) {
      mostrarErro('supabaseClient não foi carregado.');
      return;
    }

    // Verifica a sessão atual.
    const { data, error } =
      await supabaseClient.auth.getSession();

    if (error) {
      console.error(
        '[TeamStudy Perfil] Erro ao obter sessão:',
        error
      );

      mostrarErro(
        'Não foi possível verificar a sessão.'
      );

      return;
    }

    const session = data?.session;

    // Usuário não está logado.
    if (!session?.user) {
      window.location.href = 'index.html';
      return;
    }

    const usuarioSupabase = session.user;
    const metadata = usuarioSupabase.user_metadata || {};

    // Tenta recuperar usuário salvo localmente.
    let usuarioLocal = null;

    try {
      if (typeof getUsuarioLogado === 'function') {
        usuarioLocal = getUsuarioLogado();
      }
    } catch (storageError) {
      console.warn(
        '[TeamStudy Perfil] Erro ao obter usuário local:',
        storageError
      );
    }

    /*
     * Monta o usuário final.
     *
     * A sessão do Supabase tem prioridade.
     * O usuário local serve como fallback.
     */
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
        usuarioLocal?.eLider === true
    };

    // Salva os dados atualizados localmente.
    try {
      localStorage.setItem(
        'TS_usuarioLogado',
        JSON.stringify(usuario)
      );
    } catch (storageError) {
      console.warn(
        '[TeamStudy Perfil] Não foi possível salvar o usuário:',
        storageError
      );
    }

    // Preenche o perfil.
    preencherPerfil(usuario);

    console.log(
      '[TeamStudy Perfil] Perfil carregado com sucesso.',
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
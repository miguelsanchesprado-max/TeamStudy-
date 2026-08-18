document.addEventListener('DOMContentLoaded', async () => {

  // ==========================================================
  // VERIFICAR SESSÃO DO SUPABASE
  // ==========================================================

  const {
    data: { session },
    error
  } = await supabaseClient.auth.getSession();


  if (error) {

    console.error(
      'Erro ao verificar sessão:',
      error
    );

    window.location.href = 'index.html';

    return;
  }


  // ==========================================================
  // USUÁRIO NÃO ESTÁ LOGADO
  // ==========================================================

  if (!session) {

    console.log(
      'Nenhuma sessão encontrada.'
    );

    window.location.href = 'index.html';

    return;
  }


  const usuarioAuth = session.user;


  console.log(
    'Usuário autenticado:',
    usuarioAuth
  );


  // ==========================================================
  // BUSCAR PERFIL
  // ==========================================================

  const {
    data: perfil,
    error: erroPerfil
  } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('id', usuarioAuth.id)
    .maybeSingle();


  if (erroPerfil) {

    console.error(
      'Erro ao buscar perfil:',
      erroPerfil
    );

  }


  // ==========================================================
  // BOAS-VINDAS
  // ==========================================================

  const boasVindas =
    document.getElementById('boasVindas');

  const subtituloCargo =
    document.getElementById('subtituloCargo');


  if (perfil) {

    boasVindas.innerText =
      `Olá, ${perfil.nome}! 👋`;


    subtituloCargo.innerText =
      perfil.e_lider
        ? '👑 Você é o Aluno Líder deste projeto.'
        : '👤 Você é um integrante do grupo.';

  } else {

    boasVindas.innerText =
      'Olá! Bem-vindo ao TeamStudy 👋';


    subtituloCargo.innerText =
      'Configure seu perfil para continuar.';

  }


  // ==========================================================
  // PENDÊNCIAS
  // ==========================================================

  const pendencias =
    getPendencias();


  const pendentes =
    pendencias.filter(
      p => p.status === 'pendente'
    );


  const entregues =
    pendencias.filter(
      p => p.status === 'entregue'
    );


  document.getElementById(
    'totalPendentes'
  ).innerText =
    pendentes.length;


  document.getElementById(
    'totalEntregues'
  ).innerText =
    entregues.length;


  // ==========================================================
  // RESUMO DAS TAREFAS
  // ==========================================================

  const resumoTarefas =
    document.getElementById(
      'resumoTarefas'
    );


  if (pendentes.length === 0) {

    resumoTarefas.innerHTML =
      '<p>Nenhuma entrega pendente para os próximos dias!</p>';

  } else {

    resumoTarefas.innerHTML =
      pendentes
        .slice(0, 3)
        .map(p => `

          <div
            style="
              border-bottom: 1px solid var(--border-color);
              padding: 10px 0;
            "
          >

            <strong>
              ${p.titulo}
            </strong>

            -
            Responsável:
            ${p.nomeResponsavel}

            <br>

            <small>
              Prazo:
              ${new Date(p.prazo).toLocaleString('pt-BR')}
            </small>

          </div>

        `)
        .join('');

  }


  // ==========================================================
  // BUSCAR GRUPO DO USUÁRIO
  // ==========================================================

  const nomeGrupo =
    document.getElementById(
      'nomeGrupo'
    );


  const {
    data: integrante,
    error: erroIntegrante
  } = await supabaseClient
    .from('integrantes')
    .select('grupo_id')
    .eq('usuario_id', usuarioAuth.id)
    .maybeSingle();


  if (erroIntegrante) {

    console.error(
      'Erro ao buscar grupo:',
      erroIntegrante
    );

    return;
  }


  if (!integrante) {

    nomeGrupo.innerText =
      'Sem grupo';

    return;
  }


  // ==========================================================
  // BUSCAR NOME DO GRUPO
  // ==========================================================

  const {
    data: grupo,
    error: erroGrupo
  } = await supabaseClient
    .from('grupos')
    .select('nome')
    .eq('id', integrante.grupo_id)
    .maybeSingle();


  if (erroGrupo) {

    console.error(
      'Erro ao buscar grupo:',
      erroGrupo
    );

    return;
  }


  if (grupo) {

    nomeGrupo.innerText =
      grupo.nome;

  } else {

    nomeGrupo.innerText =
      'Sem grupo';

  }

});
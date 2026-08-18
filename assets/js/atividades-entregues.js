document.addEventListener('DOMContentLoaded', async () => {

  // ==========================================================
  // ELEMENTOS
  // ==========================================================

  const listaEntregas =
    document.getElementById('listaEntregas');


  if (!listaEntregas) {
    return;
  }


  // ==========================================================
  // VERIFICAR SUPABASE
  // ==========================================================

  if (
    typeof supabaseClient === 'undefined'
  ) {

    console.error(
      'supabaseClient não encontrado.'
    );

    listaEntregas.innerHTML = `
      <p class="text-muted">
        Não foi possível conectar ao Supabase.
      </p>
    `;

    return;
  }


  // ==========================================================
  // VERIFICAR USUÁRIO
  // ==========================================================

  const {
    data: {
      user
    },
    error: erroUsuario
  } =
    await supabaseClient.auth.getUser();


  if (
    erroUsuario ||
    !user
  ) {

    console.log(
      'Nenhum usuário autenticado.'
    );

    window.location.href =
      'index.html';

    return;
  }


  const usuarioId =
    user.id;


  // ==========================================================
  // CRIAR BOTÃO DE LIMPAR HISTÓRICO
  // ==========================================================

  const botaoLimparHistorico =
    document.createElement('button');


  botaoLimparHistorico.type =
    'button';


  botaoLimparHistorico.id =
    'btnLimparHistorico';


  botaoLimparHistorico.className =
    'btn';


  botaoLimparHistorico.textContent =
    '🗑️ Limpar meu histórico';


  botaoLimparHistorico.style.marginBottom =
    '20px';


  botaoLimparHistorico.style.background =
    'var(--danger-color)';


  listaEntregas.parentNode.insertBefore(
    botaoLimparHistorico,
    listaEntregas
  );


  // ==========================================================
  // FUNÇÃO PARA LIMPAR HISTÓRICO DO USUÁRIO
  // ==========================================================

  botaoLimparHistorico.addEventListener(
    'click',
    async () => {

      const confirmar =
        confirm(
          '⚠️ ATENÇÃO!\n\n' +
          'Isso irá apagar todas as SUAS entregas do histórico.\n\n' +
          'As entregas dos outros integrantes continuarão normalmente.\n\n' +
          'Deseja realmente continuar?'
        );


      if (!confirmar) {
        return;
      }


      // ------------------------------------------------------
      // DESABILITAR BOTÃO
      // ------------------------------------------------------

      botaoLimparHistorico.disabled =
        true;


      botaoLimparHistorico.textContent =
        '🗑️ Limpando histórico...';


      // ------------------------------------------------------
      // APAGAR SOMENTE AS ENTREGAS DO USUÁRIO
      // ------------------------------------------------------

      const {
        error: erroDelete
      } =
        await supabaseClient
          .from('entregas')
          .delete()
          .eq(
            'usuario_id',
            usuarioId
          );


      // ------------------------------------------------------
      // ERRO
      // ------------------------------------------------------

      if (erroDelete) {

        console.error(
          'Erro ao limpar histórico:',
          erroDelete
        );


        alert(
          'Não foi possível limpar seu histórico.\n\n' +
          erroDelete.message
        );


        botaoLimparHistorico.disabled =
          false;


        botaoLimparHistorico.textContent =
          '🗑️ Limpar meu histórico';


        return;
      }


      // ------------------------------------------------------
      // SUCESSO
      // ------------------------------------------------------

      alert(
        '🧹 Seu histórico foi limpo com sucesso!'
      );


      botaoLimparHistorico.disabled =
        false;


      botaoLimparHistorico.textContent =
        '🗑️ Limpar meu histórico';


      // ------------------------------------------------------
      // ATUALIZAR A LISTA
      // ------------------------------------------------------

      await carregarHistorico();

    }
  );


  // ==========================================================
  // FUNÇÃO PARA CARREGAR O HISTÓRICO
  // ==========================================================

  async function carregarHistorico() {

    listaEntregas.innerHTML = `
      <p class="text-muted">
        Carregando entregas...
      </p>
    `;


    // ========================================================
    // BUSCAR GRUPO DO USUÁRIO
    // ========================================================

    const {
      data: integrante,
      error: erroIntegrante
    } =
      await supabaseClient
        .from('integrantes')
        .select('grupo_id')
        .eq(
          'usuario_id',
          usuarioId
        )
        .maybeSingle();


    if (erroIntegrante) {

      console.error(
        'Erro ao buscar grupo:',
        erroIntegrante
      );

      listaEntregas.innerHTML = `
        <p class="text-muted">
          Não foi possível identificar seu grupo.
        </p>
      `;

      return;
    }


    // ========================================================
    // USUÁRIO SEM GRUPO
    // ========================================================

    if (!integrante) {

      listaEntregas.innerHTML = `
        <p class="text-muted">
          Você ainda não está em nenhum grupo.
        </p>
      `;

      return;
    }


    const grupoId =
      integrante.grupo_id;


    // ========================================================
    // BUSCAR ENTREGAS DO GRUPO
    // ========================================================

    const {
      data: entregas,
      error: erroEntregas
    } =
      await supabaseClient
        .from('entregas')
        .select(`
          id,
          arquivo_path,
          arquivo_nome,
          link,
          comentario,
          created_at,

          usuario_id,

          pendencias (
            id,
            grupo_id,
            titulo,
            descricao,
            prioridade,
            prazo,

            profiles!pendencias_responsavel_id_fkey (
              id,
              nome,
              ra,
              email
            )
          ),

          profiles!entregas_usuario_id_fkey (
            id,
            nome,
            ra,
            email
          )
        `)
        .eq(
          'pendencias.grupo_id',
          grupoId
        )
        .order(
          'created_at',
          {
            ascending: false
          }
        );


    if (erroEntregas) {

      console.error(
        'Erro ao buscar entregas:',
        erroEntregas
      );

      listaEntregas.innerHTML = `
        <p class="text-muted">
          Não foi possível carregar o histórico de entregas.
        </p>

        <p class="text-muted">
          ${escaparHTML(
            erroEntregas.message
          )}
        </p>
      `;

      return;
    }


    // ========================================================
    // FILTRAR RESULTADOS VÁLIDOS
    // ========================================================

    const entregasDoGrupo =
      (entregas || [])
        .filter(
          entrega =>
            entrega.pendencias &&
            entrega.pendencias.grupo_id === grupoId
        );


    // ========================================================
    // NENHUMA ENTREGA
    // ========================================================

    if (
      entregasDoGrupo.length === 0
    ) {

      listaEntregas.innerHTML = `
        <div style="text-align: center; padding: 30px;">

          <h3>
            📭 Nenhuma atividade entregue
          </h3>

          <p class="text-muted">
            Quando os integrantes entregarem atividades,
            elas aparecerão aqui.
          </p>

        </div>
      `;

      return;
    }


    // ========================================================
    // EXIBIR HISTÓRICO
    // ========================================================

    listaEntregas.innerHTML =
      entregasDoGrupo
        .map(
          renderizarEntrega
        )
        .join('');

  }


  // ==========================================================
  // RENDERIZAR ENTREGA
  // ==========================================================

  function renderizarEntrega(
    entrega
  ) {

    const tarefa =
      entrega.pendencias;


    const aluno =
      entrega.profiles;


    const nomeAluno =
      aluno?.nome ||
      'Usuário';


    const raAluno =
      aluno?.ra ||
      'Não informado';


    const dataEntrega =
      entrega.created_at
        ? new Date(
            entrega.created_at
          ).toLocaleString(
            'pt-BR'
          )
        : 'Data não informada';


    const prioridade =
      tarefa.prioridade ||
      'media';


    // ========================================================
    // ARQUIVO
    // ========================================================

    let arquivoHTML =
      '';


    if (
      entrega.arquivo_nome
    ) {

      arquivoHTML = `

        <div
          class="entrega-item"
          style="margin-top: 12px;"
        >

          <strong>
            📎 Arquivo:
          </strong>

          <span>
            ${escaparHTML(
              entrega.arquivo_nome
            )}
          </span>

        </div>

      `;

    }


    // ========================================================
    // LINK
    // ========================================================

    let linkHTML =
      '';


    if (
      entrega.link
    ) {

      const linkSeguro =
        escaparHTML(
          entrega.link
        );


      linkHTML = `

        <div
          class="entrega-item"
          style="margin-top: 12px;"
        >

          <strong>
            🔗 Link:
          </strong>

          <br>

          <a
            href="${linkSeguro}"
            target="_blank"
            rel="noopener noreferrer"
          >
            ${linkSeguro}
          </a>

        </div>

      `;

    }


    // ========================================================
    // COMENTÁRIO
    // ========================================================

    let comentarioHTML =
      '';


    if (
      entrega.comentario
    ) {

      comentarioHTML = `

        <div
          class="entrega-item"
          style="margin-top: 12px;"
        >

          <strong>
            📝 Comentário:
          </strong>

          <p>
            ${escaparHTML(
              entrega.comentario
            )}
          </p>

        </div>

      `;

    }


    // ========================================================
    // PRIORIDADE
    // ========================================================

    const prioridadeTexto =
      formatarPrioridade(
        prioridade
      );


    // ========================================================
    // CARD
    // ========================================================

    return `

      <div
        class="
          card
          tarefa-card
          prioridade-${escaparHTML(
            prioridade
          )}
        "
        style="
          margin-bottom: 20px;
        "
      >

        <h3>
          ✅
          ${escaparHTML(
            tarefa.titulo
          )}
        </h3>


        <p>
          ${escaparHTML(
            tarefa.descricao ||
            'Sem descrição.'
          )}
        </p>


        <div
          class="tarefa-meta"
        >

          <span>

            👤
            <strong>
              Entregue por:
            </strong>

            ${escaparHTML(
              nomeAluno
            )}

          </span>


          <span>

            🪪
            <strong>
              RA:
            </strong>

            ${escaparHTML(
              raAluno
            )}

          </span>


          <span>

            📅
            <strong>
              Entregue em:
            </strong>

            ${dataEntrega}

          </span>


          <span>

            📌
            <strong>
              Prioridade:
            </strong>

            ${prioridadeTexto}

          </span>

        </div>


        ${arquivoHTML}


        ${linkHTML}


        ${comentarioHTML}


      </div>

    `;

  }


  // ==========================================================
  // FORMATAR PRIORIDADE
  // ==========================================================

  function formatarPrioridade(
    prioridade
  ) {

    switch (
      prioridade
    ) {

      case 'alta':
        return '🔴 Alta';

      case 'baixa':
        return '🟢 Baixa';

      default:
        return '🟡 Média';

    }

  }


  // ==========================================================
  // ESCAPAR HTML
  // ==========================================================

  function escaparHTML(
    valor
  ) {

    if (
      valor === null ||
      valor === undefined
    ) {

      return '';

    }


    return String(valor)
      .replace(
        /&/g,
        '&amp;'
      )
      .replace(
        /</g,
        '&lt;'
      )
      .replace(
        />/g,
        '&gt;'
      )
      .replace(
        /"/g,
        '&quot;'
      )
      .replace(
        /'/g,
        '&#039;'
      );

  }


  // ==========================================================
  // INICIAR
  // ==========================================================

  await carregarHistorico();

});
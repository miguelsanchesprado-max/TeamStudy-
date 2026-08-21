document.addEventListener('DOMContentLoaded', async () => {

  // ==========================================================
  // ELEMENTOS
  // ==========================================================

  const painelLider =
    document.getElementById('painelLider');

  const formCriarTarefa =
    document.getElementById('formCriarTarefa');

  const listaPendencias =
    document.getElementById('listaPendencias');

  const selectResponsavel =
    document.getElementById('tarefaResponsavel');


  // ==========================================================
  // VARIÁVEIS
  // ==========================================================

  let usuarioAtual = null;
  let perfilAtual = null;
  let grupoAtual = null;
  let integrantesGrupo = [];
  let timerInterval = null;
  let realtimeChannel = null;


  // ==========================================================
  // VERIFICAR SUPABASE
  // ==========================================================

  if (typeof supabaseClient === 'undefined') {

    console.error(
      'supabaseClient não encontrado.'
    );

    alert(
      'Erro ao conectar ao Supabase.'
    );

    return;
  }


  // ==========================================================
  // OBTER USUÁRIO
  // ==========================================================

  async function obterUsuarioAtual() {

    const {
      data,
      error
    } = await supabaseClient.auth.getUser();

    if (error) {

      console.error(
        'Erro ao obter usuário:',
        error
      );

      return null;
    }

    if (!data || !data.user) {
      return null;
    }

    return data.user;
  }


  // ==========================================================
  // BUSCAR PERFIL
  // ==========================================================

  async function buscarPerfil() {

    if (!usuarioAtual) {
      return null;
    }

    const {
      data,
      error
    } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', usuarioAtual.id)
      .maybeSingle();

    if (error) {

      console.error(
        'Erro ao buscar perfil:',
        error
      );

      return null;
    }

    return data;
  }


  // ==========================================================
  // BUSCAR GRUPO ATUAL
  // ==========================================================

  async function buscarGrupoAtual() {

    if (!usuarioAtual) {
      return null;
    }

    const {
      data: integrante,
      error: erroIntegrante
    } = await supabaseClient
      .from('integrantes')
      .select('grupo_id')
      .eq('usuario_id', usuarioAtual.id)
      .maybeSingle();

    if (erroIntegrante) {

      console.error(
        'Erro ao buscar integrante:',
        erroIntegrante
      );

      return null;
    }

    if (!integrante) {
      return null;
    }

    const {
      data: grupo,
      error: erroGrupo
    } = await supabaseClient
      .from('grupos')
      .select('*')
      .eq('id', integrante.grupo_id)
      .maybeSingle();

    if (erroGrupo) {

      console.error(
        'Erro ao buscar grupo:',
        erroGrupo
      );

      return null;
    }

    return grupo;
  }


  // ==========================================================
  // CARREGAR INTEGRANTES
  // ==========================================================

  async function carregarIntegrantes() {

    if (
      !grupoAtual ||
      !selectResponsavel
    ) {
      return;
    }

    const {
      data,
      error
    } = await supabaseClient
      .from('integrantes')
      .select(`
        usuario_id,
        profiles (
          id,
          nome,
          ra,
          email,
          e_lider
        )
      `)
      .eq('grupo_id', grupoAtual.id);

    if (error) {

      console.error(
        'Erro ao carregar integrantes:',
        error
      );

      selectResponsavel.innerHTML = `
        <option value="">
          Erro ao carregar integrantes
        </option>
      `;

      return;
    }

    integrantesGrupo =
      (data || [])
        .filter(item => item.profiles);


    selectResponsavel.innerHTML = `
      <option value="">
        Selecione um integrante
      </option>
    `;


    integrantesGrupo.forEach(item => {

      const perfil = item.profiles;

      const option =
        document.createElement('option');

      option.value =
        perfil.id;

      option.textContent =
        `${perfil.nome || 'Usuário'}${
          perfil.ra
            ? ` — RA: ${perfil.ra}`
            : ''
        }`;

      selectResponsavel.appendChild(
        option
      );
    });
  }


  // ==========================================================
  // CRIAR TAREFA
  // ==========================================================

  if (formCriarTarefa) {

    formCriarTarefa.addEventListener(
      'submit',
      async (event) => {

        event.preventDefault();


        // ------------------------------------------------------
        // VERIFICAR USUÁRIO
        // ------------------------------------------------------

        if (!usuarioAtual) {

          alert(
            'Você precisa estar logado.'
          );

          return;
        }


        // ------------------------------------------------------
        // VERIFICAR GRUPO
        // ------------------------------------------------------

        if (!grupoAtual) {

          alert(
            'Você precisa estar em um grupo.'
          );

          return;
        }


        // ------------------------------------------------------
        // VERIFICAR LÍDER
        // ------------------------------------------------------

        if (
          grupoAtual.lider_id !==
          usuarioAtual.id
        ) {

          alert(
            'Apenas o líder pode criar tarefas.'
          );

          return;
        }


        // ------------------------------------------------------
        // CAMPOS
        // ------------------------------------------------------

        const titulo =
          document
            .getElementById('tarefaTitulo')
            .value
            .trim();

        const descricao =
          document
            .getElementById('tarefaDescricao')
            .value
            .trim();

        const responsavelId =
          document
            .getElementById('tarefaResponsavel')
            .value;

        const prioridade =
          document
            .getElementById('tarefaPrioridade')
            .value;

        const prazo =
          document
            .getElementById('tarefaPrazo')
            .value;


        // ------------------------------------------------------
        // VALIDAÇÕES
        // ------------------------------------------------------

        if (!titulo) {

          alert(
            'Digite o título da tarefa.'
          );

          return;
        }


        if (!descricao) {

          alert(
            'Digite a descrição da tarefa.'
          );

          return;
        }


        if (!responsavelId) {

          alert(
            'Selecione o integrante responsável.'
          );

          return;
        }


        if (!prazo) {

          alert(
            'Informe o prazo da tarefa.'
          );

          return;
        }


        const prazoData =
          new Date(prazo);


        if (
          Number.isNaN(
            prazoData.getTime()
          )
        ) {

          alert(
            'O prazo informado é inválido.'
          );

          return;
        }


        if (
          prazoData.getTime() <=
          Date.now()
        ) {

          alert(
            'O prazo precisa ser uma data futura.'
          );

          return;
        }


        const prazoISO =
          prazoData.toISOString();


        // ------------------------------------------------------
        // CRIAR TAREFA NO SUPABASE
        // ------------------------------------------------------

        const {
          data,
          error
        } = await supabaseClient
          .from('pendencias')
          .insert({
            grupo_id:
              grupoAtual.id,

            criado_por:
              usuarioAtual.id,

            responsavel_id:
              responsavelId,

            titulo:
              titulo,

            descricao:
              descricao,

            prioridade:
              prioridade,

            prazo:
              prazoISO,

            status:
              'pendente'
          })
          .select()
          .single();


        if (error) {

          console.error(
            'Erro ao criar tarefa:',
            error
          );

          alert(
            'Não foi possível criar a tarefa.\n\n' +
            error.message
          );

          return;
        }


        console.log(
          'Tarefa criada:',
          data
        );


        // ------------------------------------------------------
        // SUCESSO
        // ------------------------------------------------------

        alert(
          'Tarefa atribuída com sucesso!'
        );


        formCriarTarefa.reset();


        await carregarPendencias();
      }
    );
  }


  // ==========================================================
  // BUSCAR PENDÊNCIAS
  // ==========================================================

  async function buscarPendencias() {

    if (!usuarioAtual) {
      return [];
    }


    // --------------------------------------------------------
    // LÍDER
    // --------------------------------------------------------

    if (
      grupoAtual &&
      grupoAtual.lider_id ===
      usuarioAtual.id
    ) {

      const {
        data,
        error
      } = await supabaseClient
        .from('pendencias')
        .select(`
          *,
          profiles!pendencias_responsavel_id_fkey (
            id,
            nome,
            ra,
            email
          )
        `)
        .eq(
          'grupo_id',
          grupoAtual.id
        )
        .order(
          'prazo',
          {
            ascending: true
          }
        );


      if (error) {

        console.error(
          'Erro ao buscar tarefas:',
          error
        );

        return [];
      }


      return data || [];
    }


    // --------------------------------------------------------
    // INTEGRANTE
    // --------------------------------------------------------

    const {
      data,
      error
    } = await supabaseClient
      .from('pendencias')
      .select(`
        *,
        profiles!pendencias_responsavel_id_fkey (
          id,
          nome,
          ra,
          email
        )
      `)
      .eq(
        'responsavel_id',
        usuarioAtual.id
      )
      .order(
        'prazo',
        {
          ascending: true
        }
      );


    if (error) {

      console.error(
        'Erro ao buscar tarefas:',
        error
      );

      return [];
    }


    return data || [];
  }


  // ==========================================================
  // CARREGAR PENDÊNCIAS
  // ==========================================================

  async function carregarPendencias() {

    if (!listaPendencias) {
      return;
    }


    listaPendencias.innerHTML = `
      <p class="text-muted">
        Carregando tarefas...
      </p>
    `;


    const pendencias =
      await buscarPendencias();


    if (
      !pendencias ||
      pendencias.length === 0
    ) {

      listaPendencias.innerHTML = `
        <p class="text-muted">
          Nenhuma pendência no momento.
        </p>
      `;

      return;
    }


    listaPendencias.innerHTML =
      pendencias
        .map(
          renderizarPendencia
        )
        .join('');


    iniciarTimers();
  }


  // ==========================================================
  // RENDERIZAR PENDÊNCIA
  // ==========================================================

  function renderizarPendencia(
    pendencia
  ) {

    const perfilResponsavel =
      pendencia.profiles;


    const nomeResponsavel =
      perfilResponsavel?.nome ||
      'Usuário';


    const ehResponsavel =
      pendencia.responsavel_id ===
      usuarioAtual.id;


    const ehLider =
      grupoAtual &&
      grupoAtual.lider_id ===
      usuarioAtual.id;


    const prioridade =
      pendencia.prioridade ||
      'media';


    const prazo =
      new Date(
        pendencia.prazo
      );


    const status =
      pendencia.status ||
      'pendente';


    return `
      <div
        class="card tarefa-card prioridade-${escaparHTML(prioridade)}"
        data-tarefa-id="${escaparHTML(pendencia.id)}"
      >

        <h4>
          ${escaparHTML(
            pendencia.titulo
          )}
        </h4>


        <p>
          <strong>
            Descrição:
          </strong>

          ${escaparHTML(
            pendencia.descricao
          )}
        </p>


        <div class="tarefa-meta">

          <span>
            👤 Responsável:

            <strong>
              ${escaparHTML(
                nomeResponsavel
              )}
            </strong>
          </span>


          <span>
            📌 Prioridade:

            <strong>
              ${formatarPrioridade(
                prioridade
              )}
            </strong>
          </span>


          <span>
            📅 Prazo:

            ${prazo.toLocaleString(
              'pt-BR'
            )}
          </span>

        </div>


        ${
          status === 'entregue'

            ?

          `
            <div
              class="timer-box"
              style="
                background: var(--success-soft);
                border-color: var(--success-color);
              "
            >

              🟢

              <strong>
                Atividade entregue
              </strong>

            </div>
          `

            :

          `
            <div class="timer-box">

              ⏱️ Tempo restante:

              <span
                class="timer timer-count"
                data-prazo="${escaparHTML(
                  pendencia.prazo
                )}"
              >
                Calculando...
              </span>

            </div>
          `
        }


        ${
          ehResponsavel &&
          status !== 'entregue'

            ?

          `
            <div
              class="form-group entrega-form"
            >

              <label>
                <strong>
                  📤 Sua Entrega
                </strong>
              </label>


              <label
                for="arquivo-${escaparHTML(
                  pendencia.id
                )}"
              >
                📎 Arquivo
              </label>


              <input
                type="file"
                id="arquivo-${escaparHTML(
                  pendencia.id
                )}"
              >


              <label
                for="link-${escaparHTML(
                  pendencia.id
                )}"
                style="margin-top: 12px;"
              >
                🔗 Link
              </label>


              <input
                type="url"
                id="link-${escaparHTML(
                  pendencia.id
                )}"
                placeholder="https://..."
              >


              <label
                for="comentario-${escaparHTML(
                  pendencia.id
                )}"
                style="margin-top: 12px;"
              >
                📝 Comentário
              </label>


              <textarea
                id="comentario-${escaparHTML(
                  pendencia.id
                )}"
                rows="4"
                placeholder="Adicione uma observação sobre sua entrega..."
              ></textarea>


              <button
                class="btn"
                style="margin-top: 12px;"
                onclick="entregarTarefa('${escaparHTML(
                  pendencia.id
                )}')"
              >
                🚀 Publicar e Entregar
              </button>

            </div>
          `

            :

          !ehResponsavel

            ?

          `
            <p
              style="margin-top: 10px;"
            >
              <em>
                Apenas o aluno responsável pode realizar a entrega desta pendência.
              </em>
            </p>
          `

            :

          ''
        }


        ${
          ehLider &&
          !ehResponsavel &&
          status !== 'entregue'

            ?

          `
            <p
              class="text-muted"
              style="margin-top: 10px;"
            >
              👑 Você é o líder desta equipe.
            </p>
          `

            :

          ''
        }

      </div>
    `;
  }


  // ==========================================================
  // ESCAPAR HTML
  // ==========================================================

  function escaparHTML(valor) {

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
  // FORMATAR PRIORIDADE
  // ==========================================================

  function formatarPrioridade(
    prioridade
  ) {

    switch (prioridade) {

      case 'alta':
        return '🔴 Alta';

      case 'baixa':
        return '🟢 Baixa';

      default:
        return '🟡 Média';
    }
  }


  // ==========================================================
  // TIMER
  // ==========================================================

  function iniciarTimers() {

    if (timerInterval) {

      clearInterval(
        timerInterval
      );
    }


    function atualizarTimers() {

      const elementos =
        document.querySelectorAll(
          '.timer[data-prazo]'
        );


      elementos.forEach(
        elemento => {

          const prazo =
            new Date(
              elemento.dataset.prazo
            ).getTime();


          const agora =
            Date.now();


          const diferenca =
            prazo - agora;


          if (
            diferenca <= 0
          ) {

            elemento.textContent =
              'Prazo encerrado!';

            elemento.style.color =
              'var(--danger-color)';

            return;
          }


          const dias =
            Math.floor(
              diferenca /
              (
                1000 *
                60 *
                60 *
                24
              )
            );


          const horas =
            Math.floor(
              (
                diferenca %
                (
                  1000 *
                  60 *
                  60 *
                  24
                )
              ) /
              (
                1000 *
                60 *
                60
              )
            );


          const minutos =
            Math.floor(
              (
                diferenca %
                (
                  1000 *
                  60 *
                  60
                )
              ) /
              (
                1000 *
                60
              )
            );


          const segundos =
            Math.floor(
              (
                diferenca %
                (
                  1000 *
                  60
                )
              ) /
              1000
            );


          elemento.textContent =
            `${dias}d ${horas}h ${minutos}m ${segundos}s`;
        }
      );
    }


    atualizarTimers();


    timerInterval =
      setInterval(
        atualizarTimers,
        1000
      );
  }


  // ==========================================================
  // ENTREGAR TAREFA
  // ==========================================================

  window.entregarTarefa =
    async function (
      pendenciaId
    ) {

      const inputArquivo =
        document.getElementById(
          `arquivo-${pendenciaId}`
        );


      const inputLink =
        document.getElementById(
          `link-${pendenciaId}`
        );


      const inputComentario =
        document.getElementById(
          `comentario-${pendenciaId}`
        );


      const arquivo =
        inputArquivo?.files?.[0] ||
        null;


      const link =
        inputLink?.value.trim() ||
        '';


      const comentario =
        inputComentario?.value.trim() ||
        '';


      // ------------------------------------------------------
      // VALIDAR ENTREGA
      // ------------------------------------------------------

      if (
        !arquivo &&
        !link &&
        !comentario
      ) {

        alert(
          'Informe pelo menos um arquivo, link ou comentário para realizar a entrega.'
        );

        return;
      }


      // ------------------------------------------------------
      // VERIFICAR USUÁRIO
      // ------------------------------------------------------

      if (!usuarioAtual) {

        alert(
          'Sua sessão expirou. Faça login novamente.'
        );

        return;
      }


      // ------------------------------------------------------
      // VERIFICAR PRAZO
      // ------------------------------------------------------

      const pendencias =
        await buscarPendencias();


      const pendencia =
        pendencias.find(
          p =>
            String(p.id) ===
            String(pendenciaId)
        );


      if (!pendencia) {

        alert(
          'Não foi possível encontrar esta tarefa.'
        );

        return;
      }


      if (
        pendencia.status ===
        'entregue'
      ) {

        alert(
          'Esta atividade já foi entregue.'
        );

        return;
      }


      // ------------------------------------------------------
      // ARQUIVO
      // ------------------------------------------------------

      let arquivoPath = null;
      let arquivoNome = null;


      if (arquivo) {

        const limite =
          50 *
          1024 *
          1024;


        if (
          arquivo.size >
          limite
        ) {

          alert(
            'O arquivo não pode ultrapassar 50 MB.'
          );

          return;
        }


        const extensao =
          arquivo.name.includes('.')

            ?

          arquivo.name
            .split('.')
            .pop()
            .toLowerCase()

            :

          'arquivo';


        const nomeSeguro =
          `${crypto.randomUUID()}.${extensao}`;


        arquivoPath =
          `${usuarioAtual.id}/${pendenciaId}/${nomeSeguro}`;


        arquivoNome =
          arquivo.name;


        // ----------------------------------------------------
        // UPLOAD NO SUPABASE STORAGE
        // ----------------------------------------------------

        const {
          error: erroUpload
        } = await supabaseClient.storage
          .from('entregas')
          .upload(
            arquivoPath,
            arquivo,
            {
              cacheControl: '3600',
              upsert: false
            }
          );


        if (erroUpload) {

          console.error(
            'Erro ao enviar arquivo:',
            erroUpload
          );

          alert(
            'Não foi possível enviar o arquivo.\n\n' +
            erroUpload.message
          );

          return;
        }
      }


      // ------------------------------------------------------
      // REGISTRAR ENTREGA
      // ------------------------------------------------------

      const {
        data: entrega,
        error: erroEntrega
      } =
        await supabaseClient
          .from('entregas')
          .insert({

            pendencia_id:
              pendenciaId,

            usuario_id:
              usuarioAtual.id,

            arquivo_path:
              arquivoPath,

            arquivo_nome:
              arquivoNome,

            link:
              link || null,

            comentario:
              comentario || null

          })
          .select()
          .single();


      if (erroEntrega) {

        console.error(
          'Erro ao registrar entrega:',
          erroEntrega
        );


        // Se o arquivo já foi enviado,
        // tentar removê-lo caso o registro da entrega falhe.

        if (arquivoPath) {

          await supabaseClient.storage
            .from('entregas')
            .remove([
              arquivoPath
            ]);
        }


        alert(
          'Não foi possível registrar sua entrega.\n\n' +
          erroEntrega.message
        );

        return;
      }


      console.log(
        'Entrega registrada:',
        entrega
      );


      // ------------------------------------------------------
      // ATUALIZAR STATUS
      // ------------------------------------------------------

      const {
        error: erroStatus
      } =
        await supabaseClient
          .from('pendencias')
          .update({
            status:
              'entregue'
          })
          .eq(
            'id',
            pendenciaId
          )
          .eq(
            'responsavel_id',
            usuarioAtual.id
          );


      if (erroStatus) {

        console.error(
          'Erro ao atualizar status:',
          erroStatus
        );

        alert(
          'A entrega foi registrada, mas não foi possível atualizar o status da tarefa.\n\n' +
          erroStatus.message
        );

        return;
      }


      // ------------------------------------------------------
      // SUCESSO
      // ------------------------------------------------------

      alert(
        '🎉 Atividade entregue com sucesso!'
      );


      await carregarPendencias();
    };


  // ==========================================================
  // REALTIME
  // ==========================================================

  function iniciarRealtime() {

    if (!grupoAtual) {
      return;
    }

    if (realtimeChannel) {

      supabaseClient.removeChannel(
        realtimeChannel
      );
    }


    realtimeChannel =
      supabaseClient
        .channel(
          `pendencias-grupo-${grupoAtual.id}`
        )

        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'pendencias',
            filter: `grupo_id=eq.${grupoAtual.id}`
          },
          async () => {

            console.log(
              'Atualização em tempo real recebida.'
            );

            await carregarPendencias();
          }
        )

        .subscribe(
          status => {

            console.log(
              'Realtime:',
              status
            );
          }
        );
  }


  // ==========================================================
  // INICIALIZAÇÃO
  // ==========================================================

  usuarioAtual =
    await obterUsuarioAtual();


  if (!usuarioAtual) {

    alert(
      'Você precisa estar logado para acessar suas pendências.'
    );

    window.location.href =
      'index.html';

    return;
  }


  console.log(
    'Usuário autenticado:',
    usuarioAtual.id,
    usuarioAtual.email
  );


  // ----------------------------------------------------------
  // PERFIL
  // ----------------------------------------------------------

  perfilAtual =
    await buscarPerfil();


  if (!perfilAtual) {

    alert(
      'Seu perfil não foi encontrado.'
    );

    return;
  }


  console.log(
    'Perfil:',
    perfilAtual
  );


  // ----------------------------------------------------------
  // GRUPO
  // ----------------------------------------------------------

  grupoAtual =
    await buscarGrupoAtual();


  if (!grupoAtual) {

    if (painelLider) {

      painelLider.style.display =
        'none';
    }


    if (listaPendencias) {

      listaPendencias.innerHTML = `
        <p class="text-muted">
          Você ainda não está em nenhum grupo.
        </p>
      `;
    }


    return;
  }


  console.log(
    'Grupo atual:',
    grupoAtual
  );


  // ----------------------------------------------------------
  // VERIFICAR LÍDER
  // ----------------------------------------------------------

  const ehLider =
    grupoAtual.lider_id ===
    usuarioAtual.id;


  if (ehLider) {

    if (painelLider) {

      painelLider.style.display =
        'block';
    }


    await carregarIntegrantes();

  } else {

    if (painelLider) {

      painelLider.style.display =
        'none';
    }
  }


  // ----------------------------------------------------------
  // CARREGAR TAREFAS
  // ----------------------------------------------------------

  await carregarPendencias();


  // ----------------------------------------------------------
  // ATIVAR REALTIME
  // ----------------------------------------------------------

  iniciarRealtime();

});
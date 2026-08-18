document.addEventListener('DOMContentLoaded', async () => {

  // ==========================================================
  // ELEMENTOS DA PÁGINA
  // ==========================================================

  const formCriarGrupo =
    document.getElementById('formCriarGrupo');

  const formEntrarGrupo =
    document.getElementById('formEntrarGrupo');

  const nomeGrupo =
    document.getElementById('nomeGrupo');

  const codigoGrupo =
    document.getElementById('codigoGrupo');

  const listaMembros =
    document.getElementById('listaMembros');

  const painelLider =
    document.getElementById('painelLider');

  const btnFinalizarGrupo =
    document.getElementById('btnFinalizarGrupo');


  let usuarioAtual = null;
  let perfilAtual = null;
  let grupoAtual = null;


  // ==========================================================
  // VERIFICAR SUPABASE
  // ==========================================================

  if (typeof supabaseClient === 'undefined') {

    console.error(
      'supabaseClient não foi encontrado.'
    );

    alert(
      'Erro ao conectar ao sistema. Recarregue a página.'
    );

    return;
  }


  // ==========================================================
  // OBTER USUÁRIO AUTENTICADO
  // ==========================================================

  async function obterUsuarioAtual() {

    const {
      data,
      error
    } = await supabaseClient.auth.getUser();


    if (error) {

      console.error(
        'Erro ao obter usuário autenticado:',
        error
      );

      return null;
    }


    if (!data || !data.user) {

      console.log(
        'Nenhum usuário autenticado.'
      );

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


    console.log(
      'Buscando perfil do usuário:',
      usuarioAtual.id
    );


    const {
      data,
      error
    } =
      await supabaseClient
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


    if (!data) {

      console.warn(
        'Perfil não encontrado para o UUID:',
        usuarioAtual.id
      );

      return null;
    }


    console.log(
      'Perfil encontrado:',
      data
    );


    return data;
  }


  // ==========================================================
  // GERAR CÓDIGO DO GRUPO
  // ==========================================================

  function gerarCodigoGrupo() {

    const caracteres =
      'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    let codigo = 'TS-';


    for (let i = 0; i < 5; i++) {

      codigo += caracteres.charAt(
        Math.floor(
          Math.random() * caracteres.length
        )
      );

    }


    return codigo;
  }


  // ==========================================================
  // CRIAR GRUPO
  // ==========================================================

  if (formCriarGrupo) {

    formCriarGrupo.addEventListener(
      'submit',
      async (e) => {

        e.preventDefault();


        if (!usuarioAtual) {

          alert(
            'Você precisa estar logado para criar um grupo.'
          );

          return;
        }


        const campoNome =
          document.getElementById(
            'nomeNovoGrupo'
          );


        const nome =
          campoNome
            ? campoNome.value.trim()
            : '';


        if (!nome) {

          alert(
            'Digite o nome do grupo.'
          );

          return;
        }


        perfilAtual =
          await buscarPerfil();


        if (!perfilAtual) {

          alert(
            'Seu usuário está autenticado, mas seu perfil ainda não foi encontrado.'
          );

          return;
        }


        const codigo =
          gerarCodigoGrupo();


        const {
          data: grupo,
          error: erroGrupo
        } =
          await supabaseClient
            .from('grupos')
            .insert({

              nome: nome,

              codigo: codigo,

              lider_id: usuarioAtual.id

            })
            .select()
            .single();


        if (erroGrupo) {

          console.error(
            'Erro ao criar grupo:',
            erroGrupo
          );

          alert(
            'Não foi possível criar o grupo.\n\n' +
            erroGrupo.message
          );

          return;
        }


        grupoAtual = grupo;


        // ====================================================
        // TRANSFORMAR USUÁRIO EM LÍDER
        // ====================================================

        const {
          error: erroLider
        } =
          await supabaseClient
            .from('profiles')
            .update({
              e_lider: true
            })
            .eq('id', usuarioAtual.id);


        if (erroLider) {

          console.error(
            'Erro ao atualizar líder:',
            erroLider
          );

          alert(
            'O grupo foi criado, mas não foi possível definir você como líder.'
          );

          return;
        }


        perfilAtual.e_lider = true;


        // ====================================================
        // ADICIONAR LÍDER AO GRUPO
        // ====================================================

        const {
          error: erroIntegrante
        } =
          await supabaseClient
            .from('integrantes')
            .insert({

              grupo_id: grupoAtual.id,

              usuario_id: usuarioAtual.id

            });


        if (erroIntegrante) {

          console.error(
            'Erro ao adicionar líder ao grupo:',
            erroIntegrante
          );

          alert(
            'O grupo foi criado, mas não foi possível adicionar você como integrante.\n\n' +
            erroIntegrante.message
          );

          return;
        }


        alert(
          `Grupo criado com sucesso!\n\n` +
          `Nome: ${grupo.nome}\n` +
          `Código: ${grupo.codigo}`
        );


        formCriarGrupo.reset();


        await carregarGrupo();

      }
    );

  }


  // ==========================================================
  // ENTRAR EM GRUPO
  // ==========================================================

  if (formEntrarGrupo) {

    formEntrarGrupo.addEventListener(
      'submit',
      async (e) => {

        e.preventDefault();


        if (!usuarioAtual) {

          alert(
            'Você precisa estar logado para entrar em um grupo.'
          );

          return;
        }


        const campoCodigo =
          document.getElementById(
            'codigoEntrarGrupo'
          );


        const codigo =
          campoCodigo
            ? campoCodigo.value.trim().toUpperCase()
            : '';


        if (!codigo) {

          alert(
            'Digite o código do grupo.'
          );

          return;
        }


        const {
          data: grupo,
          error: erroGrupo
        } =
          await supabaseClient
            .from('grupos')
            .select('*')
            .eq('codigo', codigo)
            .maybeSingle();


        if (erroGrupo) {

          console.error(
            'Erro ao buscar grupo:',
            erroGrupo
          );

          alert(
            'Erro ao procurar o grupo.\n\n' +
            erroGrupo.message
          );

          return;
        }


        if (!grupo) {

          alert(
            'Grupo não encontrado.\n\n' +
            'Verifique se o código está correto.'
          );

          return;
        }


        const {
          data: existente,
          error: erroExistente
        } =
          await supabaseClient
            .from('integrantes')
            .select('id')
            .eq('grupo_id', grupo.id)
            .eq('usuario_id', usuarioAtual.id)
            .maybeSingle();


        if (erroExistente) {

          console.error(
            'Erro ao verificar integrante:',
            erroExistente
          );

          alert(
            'Não foi possível verificar sua participação no grupo.\n\n' +
            erroExistente.message
          );

          return;
        }


        if (existente) {

          alert(
            'Você já faz parte deste grupo.'
          );

          return;
        }


        const {
          error: erroEntrada
        } =
          await supabaseClient
            .from('integrantes')
            .insert({

              grupo_id: grupo.id,

              usuario_id: usuarioAtual.id

            });


        if (erroEntrada) {

          console.error(
            'Erro ao entrar no grupo:',
            erroEntrada
          );

          alert(
            'Não foi possível entrar no grupo.\n\n' +
            erroEntrada.message
          );

          return;
        }


        alert(
          `Você entrou no grupo "${grupo.nome}" com sucesso!`
        );


        formEntrarGrupo.reset();


        await carregarGrupo();

      }
    );

  }


  // ==========================================================
  // SAIR DO GRUPO
  // ==========================================================

  async function sairDoGrupo() {

    if (!usuarioAtual || !grupoAtual) {
      return;
    }


    if (
      grupoAtual.lider_id ===
      usuarioAtual.id
    ) {

      alert(
        'O líder não pode sair do grupo.\n\n' +
        'Use "Finalizar Grupo" para encerrar o grupo.'
      );

      return;
    }


    const confirmar =
      confirm(
        `Tem certeza que deseja sair do grupo "${grupoAtual.nome}"?`
      );


    if (!confirmar) {
      return;
    }


    const {
      error
    } =
      await supabaseClient
        .from('integrantes')
        .delete()
        .eq('grupo_id', grupoAtual.id)
        .eq('usuario_id', usuarioAtual.id);


    if (error) {

      console.error(
        'Erro ao sair do grupo:',
        error
      );

      alert(
        'Não foi possível sair do grupo.\n\n' +
        error.message
      );

      return;
    }


    alert(
      'Você saiu do grupo com sucesso!'
    );


    grupoAtual = null;


    await carregarGrupo();

  }


  // ==========================================================
  // FINALIZAR GRUPO
  // ==========================================================

  async function finalizarGrupo() {

    if (!usuarioAtual || !grupoAtual) {
      return;
    }


    if (
      grupoAtual.lider_id !==
      usuarioAtual.id
    ) {

      alert(
        'Apenas o líder pode finalizar o grupo.'
      );

      return;
    }


    const confirmar =
      confirm(
        `ATENÇÃO!\n\n` +
        `Você está prestes a finalizar o grupo "${grupoAtual.nome}".\n\n` +
        `Todos os integrantes serão removidos e o grupo será encerrado.\n\n` +
        `Essa ação não pode ser desfeita.\n\n` +
        `Deseja continuar?`
      );


    if (!confirmar) {
      return;
    }


    const {
      data,
      error
    } =
      await supabaseClient.rpc(
        'finalizar_grupo',
        {
          p_grupo_id: grupoAtual.id
        }
      );


    if (error) {

      console.error(
        'Erro ao finalizar grupo:',
        error
      );

      alert(
        'Não foi possível finalizar o grupo.\n\n' +
        error.message
      );

      return;
    }


    if (data !== true) {

      alert(
        'O grupo não pôde ser finalizado.'
      );

      return;
    }


    if (perfilAtual) {
      perfilAtual.e_lider = false;
    }


    grupoAtual = null;


    alert(
      'Grupo finalizado com sucesso!\n\n' +
      'Todos os integrantes foram removidos do grupo.'
    );


    await carregarGrupo();

  }


  // ==========================================================
  // BOTÃO FINALIZAR GRUPO
  // ==========================================================

  if (btnFinalizarGrupo) {

    btnFinalizarGrupo.addEventListener(
      'click',
      finalizarGrupo
    );

  }


  // ==========================================================
  // CARREGAR GRUPO
  // ==========================================================

  async function carregarGrupo() {

    if (!usuarioAtual) {
      return;
    }


    const {
      data: integrante,
      error
    } =
      await supabaseClient
        .from('integrantes')
        .select('grupo_id')
        .eq('usuario_id', usuarioAtual.id)
        .maybeSingle();


    if (error) {

      console.error(
        'Erro ao buscar grupo do usuário:',
        error
      );

      return;
    }


    // ========================================================
    // NÃO ESTÁ EM GRUPO
    // ========================================================

    if (!integrante) {

      grupoAtual = null;


      if (nomeGrupo) {

        nomeGrupo.textContent =
          'Nenhum grupo';

      }


      if (codigoGrupo) {

        codigoGrupo.textContent =
          '🔗 —';

      }


      if (listaMembros) {

        listaMembros.innerHTML = `
          <p class="text-muted">
            Você ainda não está em nenhum grupo.
          </p>
        `;

      }


      if (painelLider) {

        painelLider.style.display =
          'none';

      }


      return;
    }


    // ========================================================
    // BUSCAR GRUPO
    // ========================================================

    const {
      data: grupo,
      error: erroGrupo
    } =
      await supabaseClient
        .from('grupos')
        .select('*')
        .eq('id', integrante.grupo_id)
        .single();


    if (erroGrupo) {

      console.error(
        'Erro ao carregar grupo:',
        erroGrupo
      );

      return;
    }


    grupoAtual = grupo;


    // ========================================================
    // MOSTRAR GRUPO
    // ========================================================

    if (nomeGrupo) {

      nomeGrupo.textContent =
        `Grupo: ${grupo.nome}`;

    }


    if (codigoGrupo) {

      codigoGrupo.textContent =
        `🔗 ${grupo.codigo}`;

    }


    // ========================================================
    // VERIFICAR LÍDER
    // ========================================================

    const souLider =
      grupo.lider_id ===
      usuarioAtual.id;


    if (painelLider) {

      painelLider.style.display =
        souLider
          ? 'block'
          : 'none';

    }


    // ========================================================
    // CARREGAR MEMBROS
    // ========================================================

    await carregarIntegrantes(
      grupo.id
    );

  }


  // ==========================================================
  // CARREGAR INTEGRANTES
  // ==========================================================

  async function carregarIntegrantes(
    grupoId
  ) {

    const {
      data,
      error
    } =
      await supabaseClient
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
        .eq('grupo_id', grupoId);


    if (error) {

      console.error(
        'Erro ao carregar integrantes:',
        error
      );


      if (listaMembros) {

        listaMembros.innerHTML = `
          <p class="text-muted">
            Não foi possível carregar os integrantes.
          </p>
        `;

      }


      return;
    }


    if (!data || data.length === 0) {

      if (listaMembros) {

        listaMembros.innerHTML = `
          <p class="text-muted">
            Nenhum integrante encontrado.
          </p>
        `;

      }


      return;
    }


    listaMembros.innerHTML =
      data
        .map(item => {

          const perfil =
            item.profiles;


          if (!perfil) {
            return '';
          }


          const ehLider =
            perfil.id ===
            grupoAtual.lider_id;


          const ehUsuarioAtual =
            perfil.id ===
            usuarioAtual.id;


          let botaoAcao = '';


          // ==================================================
          // BOTÃO SAIR DO GRUPO
          // ==================================================

          if (
            ehUsuarioAtual &&
            !ehLider
          ) {

            botaoAcao = `
              <button
                type="button"
                class="btn"
                onclick="sairDoGrupo()"
                style="
                  margin-left: 15px;
                  white-space: nowrap;
                "
              >
                🚪 Sair do Grupo
              </button>
            `;

          }


          return `
            <div
              style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 15px;
                padding: 12px 0;
                border-bottom: 1px solid var(--border-color);
              "
            >

              <div>

                <strong>
                  ${perfil.nome || 'Usuário'}
                </strong>

                ${
                  ehLider
                    ? ' 👑 (Líder)'
                    : ''
                }

                <br>

                <small>

                  ${
                    perfil.ra
                      ? `RA: ${perfil.ra}`
                      : 'RA: não informado'
                  }

                  |

                  ${
                    perfil.email
                      ? `E-mail: ${perfil.email}`
                      : 'E-mail: não informado'
                  }

                </small>

              </div>

              ${botaoAcao}

            </div>
          `;

        })
        .join('');

  }


  // ==========================================================
  // DISPONIBILIZAR FUNÇÃO PARA O HTML
  // ==========================================================

  window.sairDoGrupo =
    sairDoGrupo;


  // ==========================================================
  // COPIAR CÓDIGO
  // ==========================================================

  if (codigoGrupo) {

    codigoGrupo.addEventListener(
      'click',
      async () => {

        if (
          !grupoAtual ||
          !grupoAtual.codigo
        ) {

          return;
        }


        try {

          await navigator.clipboard.writeText(
            grupoAtual.codigo
          );


          alert(
            'Código do grupo copiado!'
          );


        } catch (error) {

          console.error(
            'Erro ao copiar código:',
            error
          );


          try {

            const textarea =
              document.createElement(
                'textarea'
              );


            textarea.value =
              grupoAtual.codigo;


            document.body.appendChild(
              textarea
            );


            textarea.select();


            document.execCommand(
              'copy'
            );


            textarea.remove();


            alert(
              'Código do grupo copiado!'
            );

          } catch (erroFallback) {

            console.error(
              'Erro no fallback:',
              erroFallback
            );

          }

        }

      }
    );

  }


  // ==========================================================
  // INICIALIZAÇÃO
  // ==========================================================

  usuarioAtual =
    await obterUsuarioAtual();


  if (!usuarioAtual) {

    console.log(
      'Nenhum usuário autenticado.'
    );

    return;
  }


  console.log(
    'Usuário autenticado:',
    usuarioAtual.id,
    usuarioAtual.email
  );


  perfilAtual =
    await buscarPerfil();


  if (!perfilAtual) {

    console.warn(
      'Usuário autenticado, porém perfil não encontrado.'
    );

  } else {

    console.log(
      'Perfil carregado:',
      perfilAtual
    );

  }


  await carregarGrupo();

});
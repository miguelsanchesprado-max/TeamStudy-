document.addEventListener('DOMContentLoaded', async () => {

  const formCriarGrupo = document.getElementById('formCriarGrupo');
  const formEntrarGrupo = document.getElementById('formEntrarGrupo');

  const nomeGrupo = document.getElementById('nomeGrupo');
  const codigoGrupo = document.getElementById('codigoGrupo');

  const listaMembros = document.getElementById('listaMembros');
  const painelLider = document.getElementById('painelLider');

  let usuarioAtual = null;
  let grupoAtual = null;


  // ==========================================================
  // OBTER USUÁRIO LOGADO
  // ==========================================================

  async function obterUsuarioAtual() {

    const { data, error } =
      await supabaseClient.auth.getUser();

    if (error) {

      console.error(
        'Erro ao obter usuário:',
        error
      );

      return null;
    }

    return data.user;
  }


  // ==========================================================
  // GERAR CÓDIGO DO GRUPO
  // ==========================================================

  function gerarCodigoGrupo() {

    const caracteres =
      'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    let codigo = 'TS-';

    for (let i = 0; i < 5; i++) {

      codigo +=
        caracteres.charAt(
          Math.floor(
            Math.random() * caracteres.length
          )
        );

    }

    return codigo;
  }


  // ==========================================================
  // BUSCAR PERFIL
  // ==========================================================

  async function buscarPerfil() {

    if (!usuarioAtual) {
      return null;
    }

    const { data, error } =
      await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', usuarioAtual.id)
        .single();


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


        const nome =
          document
            .getElementById('nomeNovoGrupo')
            .value
            .trim();


        if (!nome) {

          alert(
            'Digite o nome do grupo.'
          );

          return;
        }


        const perfil =
          await buscarPerfil();


        if (!perfil) {

          alert(
            'Seu perfil ainda não está cadastrado no sistema.'
          );

          return;
        }


        const codigo =
          gerarCodigoGrupo();


        const { data, error } =
          await supabaseClient
            .from('grupos')
            .insert({

              nome: nome,

              codigo: codigo,

              lider_id: usuarioAtual.id

            })
            .select()
            .single();


        if (error) {

          console.error(
            'Erro ao criar grupo:',
            error
          );

          alert(
            'Não foi possível criar o grupo.\n\n' +
            error.message
          );

          return;
        }


        grupoAtual = data;


        // Adiciona o líder automaticamente
        const { error: erroIntegrante } =
          await supabaseClient
            .from('integrantes')
            .insert({

              grupo_id: grupoAtual.id,

              usuario_id: usuarioAtual.id

            });


        if (erroIntegrante) {

          console.error(
            'Erro ao adicionar líder:',
            erroIntegrante
          );

          alert(
            'Grupo criado, mas não foi possível adicionar o líder.'
          );

          return;
        }


        alert(
          `Grupo criado com sucesso!\n\nCódigo: ${codigo}`
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


        const codigo =
          document
            .getElementById('codigoEntrarGrupo')
            .value
            .trim()
            .toUpperCase();


        if (!codigo) {

          alert(
            'Digite o código do grupo.'
          );

          return;
        }


        // Buscar grupo pelo código
        const { data: grupo, error } =
          await supabaseClient
            .from('grupos')
            .select('*')
            .eq('codigo', codigo)
            .single();


        if (error || !grupo) {

          console.error(
            'Grupo não encontrado:',
            error
          );

          alert(
            'Grupo não encontrado. Verifique o código.'
          );

          return;
        }


        // Verificar se já está no grupo
        const { data: existente } =
          await supabaseClient
            .from('integrantes')
            .select('*')
            .eq('grupo_id', grupo.id)
            .eq('usuario_id', usuarioAtual.id)
            .maybeSingle();


        if (existente) {

          alert(
            'Você já faz parte deste grupo.'
          );

          return;
        }


        // Adicionar integrante
        const { error: erroEntrada } =
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
          'Você entrou no grupo com sucesso!'
        );


        formEntrarGrupo.reset();


        await carregarGrupo();

      }
    );

  }


  // ==========================================================
  // CARREGAR GRUPO DO USUÁRIO
  // ==========================================================

  async function carregarGrupo() {

    if (!usuarioAtual) {
      return;
    }


    const { data: integrante, error } =
      await supabaseClient
        .from('integrantes')
        .select('grupo_id')
        .eq('usuario_id', usuarioAtual.id)
        .maybeSingle();


    if (error) {

      console.error(
        'Erro ao buscar grupo:',
        error
      );

      return;
    }


    if (!integrante) {

      nomeGrupo.textContent =
        'Nenhum grupo';

      codigoGrupo.textContent =
        '🔗 —';

      listaMembros.innerHTML = `
        <p class="text-muted">
          Você ainda não está em nenhum grupo.
        </p>
      `;

      return;
    }


    const { data: grupo, error: erroGrupo } =
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


    nomeGrupo.textContent =
      `Grupo: ${grupo.nome}`;


    codigoGrupo.textContent =
      `🔗 ${grupo.codigo}`;


    if (
      grupo.lider_id === usuarioAtual.id
    ) {

      painelLider.style.display =
        'block';

    }


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

    const { data, error } =
      await supabaseClient
        .from('integrantes')
        .select(`
          usuario_id,
          profiles (
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

      listaMembros.innerHTML = `
        <p class="text-muted">
          Não foi possível carregar os integrantes.
        </p>
      `;

      return;
    }


    if (!data || data.length === 0) {

      listaMembros.innerHTML = `
        <p class="text-muted">
          Nenhum integrante encontrado.
        </p>
      `;

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


          return `
            <div
              style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 0;
                border-bottom: 1px solid var(--border-color);
              "
            >

              <div>

                <strong>
                  ${perfil.nome}
                </strong>

                ${
                  perfil.e_lider
                    ? ' 👑 (Líder)'
                    : ''
                }

                <br>

                <small>
                  RA: ${perfil.ra}
                  |
                  E-mail: ${perfil.email}
                </small>

              </div>

            </div>
          `;

        })
        .join('');

  }


  // ==========================================================
  // COPIAR CÓDIGO DO GRUPO
  // ==========================================================

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

      }

    }
  );


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


  await carregarGrupo();

});
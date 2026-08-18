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
  // USUÁRIO LOGADO
  // ==========================================================

  let usuarioLogado =
    getUsuarioLogado();


  /*
   * Caso o usuário ainda não esteja
   * no LocalStorage, utilizamos os dados
   * da sessão do Supabase.
   */

  if (!usuarioLogado) {

    const usuarioSupabase =
      session.user;


    usuarioLogado = {

      id:
        usuarioSupabase.id,

      email:
        usuarioSupabase.email,

      nome:
        usuarioSupabase.user_metadata?.nome ||
        usuarioSupabase.email,

      ra:
        usuarioSupabase.user_metadata?.ra ||
        '',

      eLider:
        usuarioSupabase.user_metadata?.eLider === true

    };


    localStorage.setItem(
      'TS_usuarioLogado',
      JSON.stringify(usuarioLogado)
    );

  }


  // ==========================================================
  // ELEMENTO DA LISTA
  // ==========================================================

  const listaEntregas =
    document.getElementById(
      'listaEntregas'
    );


  if (!listaEntregas) {

    return;

  }


  // ==========================================================
  // BUSCAR ENTREGAS
  // ==========================================================

  const entregas =
    getPendencias()
      .filter(
        p => p.status === 'entregue'
      );


  // ==========================================================
  // NENHUMA ENTREGA
  // ==========================================================

  if (entregas.length === 0) {

    listaEntregas.innerHTML =
      '<p>Nenhuma atividade foi entregue ainda.</p>';

    return;

  }


  // ==========================================================
  // EXIBIR ENTREGAS
  // ==========================================================

  listaEntregas.innerHTML =
    entregas.map(e => `

      <div
        style="
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 15px;
          margin-bottom: 15px;
        "
      >

        <h4>
          ✅ ${e.titulo}
        </h4>


        <p>

          <strong>
            Enviado por:
          </strong>

          ${e.nomeResponsavel}

          (RA: ${e.raResponsavel})

        </p>


        <p>

          <strong>
            Data da Entrega:
          </strong>

          ${new Date(
            e.dataEntrega
          ).toLocaleString('pt-BR')}

        </p>


        <p>

          <strong>
            Conteúdo/Link enviado:
          </strong>

          ${
            e.linkEntrega
              ? `
                <a
                  href="${e.linkEntrega}"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ${e.linkEntrega}
                </a>
              `
              : 'Nenhum conteúdo informado.'
          }

        </p>

      </div>

    `).join('');

});
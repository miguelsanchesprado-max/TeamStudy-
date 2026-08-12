// Dados iniciais de simulação do TeamStudy
const dadosIniciais = {
  grupo: {
    id: "g1",
    nome: "TCC - Desenvolvimento de Sistemas",
    codigo: "TS-2026-TCC",
    descricao: "Projeto final de curso focado na criação de uma plataforma de organização escolar.",
    professor: "Prof. Carlos Andrade",
    dataEntregaFinal: "2026-11-30"
  },
  notasPesquisa: [
    {
      id: "n1",
      autor: "Aluno Líder Demo",
      titulo: "Levantamento de Requisitos",
      conteudo: "Pesquisa sobre a importância do controle de tarefas em trabalhos de grupos escolares.",
      data: "2026-08-10"
    },
    {
      id: "n2",
      autor: "Aluno Comum Demo",
      titulo: "Estruturação de LocalStorage",
      conteudo: "Estudo sobre como salvar estados de sessão no navegador sem necessidade de backend.",
      data: "2026-08-11"
    }
  ]
};

// Inicializa os dados de simulação no LocalStorage caso não existam
(function carregarDadosIniciais() {
  if (!localStorage.getItem('TS_dadosGrupo')) {
    localStorage.setItem('TS_dadosGrupo', JSON.stringify(dadosIniciais.grupo));
  }
  if (!localStorage.getItem('TS_notasPesquisa')) {
    localStorage.setItem('TS_notasPesquisa', JSON.stringify(dadosIniciais.notasPesquisa));
  }
})();

function getDadosGrupo() {
  return JSON.parse(localStorage.getItem('TS_dadosGrupo')) || {};
}

function getNotasPesquisa() {
  return JSON.parse(localStorage.getItem('TS_notasPesquisa')) || [];
}

function salvarNotasPesquisa(notas) {
  localStorage.setItem('TS_notasPesquisa', JSON.stringify(notas));
}
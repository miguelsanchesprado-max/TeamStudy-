// Inicialização do LocalStorage com a lista real de alunos
(function initStorage() {
  if (!localStorage.getItem('TS_usuarios')) {
    const usuariosIniciais = [
      { id: '1', ra: '00001096687768sp', nome: 'Guilherme Almeida De Sousa', email: '00001096687768sp@al.educacao.sp.gov.br', senha: '123', eLider: false },
      { id: '2', ra: '00001129212543sp', nome: 'Thales Alves De Sousa', email: '00001129212543sp@al.educacao.sp.gov.br', senha: '123', eLider: false },
      { id: '3', ra: '00001118971450sp', nome: 'Yasmin Alves Oliveira', email: '00001118971450sp@al.educacao.sp.gov.br', senha: '123', eLider: false },
      { id: '4', ra: '00001118971450sp_k', nome: 'Kaua Augusto De Oliveira', email: '00001118971450sp@al.educacao.sp.gov.br', senha: '123', eLider: false },
      { id: '5', ra: '00001114095400sp', nome: 'Luciano Barbosa Silva', email: '00001114095400sp@al.educacao.sp.gov.br', senha: '123', eLider: false },
      { id: '6', ra: '00001105925304sp', nome: 'Geovanna Beatriz Das Gracas Pereira', email: '00001105925304sp@al.educacao.sp.gov.br', senha: '123', eLider: false },
      { id: '7', ra: '00001128083474sp', nome: 'Felipe Bonfiglio Rodrigues', email: '00001128083474sp@al.educacao.sp.gov.br', senha: '123', eLider: false },
      { id: '8', ra: '00001127942888sp', nome: 'Beatriz Cristina Rocha Berato', email: '00001127942888sp@al.educacao.sp.gov.br', senha: '123', eLider: false },
      { id: '9', ra: '00001128024767sp', nome: 'Leticia De Sousa Cruz', email: '00001128024767sp@al.educacao.sp.gov.br', senha: '123', eLider: false },
      { id: '10', ra: '00001122003973sp', nome: 'Guilherme De Souza Costa', email: '00001122003973sp@al.educacao.sp.gov.br', senha: '123', eLider: false },
      { id: '11', ra: '00001104639488sp', nome: 'Jhonatan Ferreira Silva', email: '00001104639488sp@al.educacao.sp.gov.br', senha: '123', eLider: false },
      { id: '12', ra: '00001130097146sp', nome: 'Cleysson Freitas Santos', email: '00001130097146sp@al.educacao.sp.gov.br', senha: '123', eLider: false },
      { id: '13', ra: '00001142584719sp', nome: 'Arthur Goncalves De Souza', email: '00001142584719sp@al.educacao.sp.gov.br', senha: '123', eLider: false },
      { id: '14', ra: '00001131054593sp', nome: 'Leandro Henrique De Carvalho', email: '00001131054593sp@al.educacao.sp.gov.br', senha: '123', eLider: false },
      { id: '15', ra: '00001138811816sp', nome: 'Pedro Henrique De Souza Porto', email: '00001138811816sp@al.educacao.sp.gov.br', senha: '123', eLider: false },
      { id: '16', ra: '0000111367653xsp', nome: 'Luiz Henrique Mendes Valerio De Sousa', email: '0000111367653xsp@al.educacao.sp.gov.br', senha: '123', eLider: false },
      { id: '17', ra: '00001107424896sp', nome: 'Carlos Henrique Rosa Silva', email: '00001107424896sp@al.educacao.sp.gov.br', senha: '123', eLider: false },
      { id: '18', ra: '00001110354307sp', nome: 'Luan Henry Neres Rocha', email: '00001110354307sp@al.educacao.sp.gov.br', senha: '123', eLider: false },
      { id: '19', ra: '00001137629678sp', nome: 'Victor Hugo Silveira', email: '00001137629678sp@al.educacao.sp.gov.br', senha: '123', eLider: false },
      { id: '20', ra: '00001143901228sp', nome: 'Felipe Kalil Freitas Limeira', email: '00001143901228sp@al.educacao.sp.gov.br', senha: '123', eLider: false },
      { id: '21', ra: '0000113034535xsp', nome: 'Matheus Leite Moureira', email: '0000113034535xsp@al.educacao.sp.gov.br', senha: '123', eLider: false },
      { id: '22', ra: '00001115257675sp', nome: 'Pedro Lima Conrado', email: '00001115257675sp@al.educacao.sp.gov.br', senha: '123', eLider: false },
      { id: '23', ra: '0000111162611xsp', nome: 'Athos Lima Leite De Almeida', email: '0000111162611xsp@al.educacao.sp.gov.br', senha: '123', eLider: false },
      { id: '24', ra: '00001127879765sp', nome: 'Natan Messias Bueno', email: '00001127879765sp@al.educacao.sp.gov.br', senha: '123', eLider: false },
      { id: '25', ra: '00001131058938sp', nome: 'Joao Pedro Felix Araujo Dos Reis', email: '00001131058938sp@al.educacao.sp.gov.br', senha: '123', eLider: false },
      { id: '26', ra: '00001121278541sp', nome: 'Joao Pedro Paixao Domingues', email: '00001121278541sp@al.educacao.sp.gov.br', senha: '123', eLider: false },
      { id: '27', ra: '00001134409667sp', nome: 'Gabriel Perpetuo Pereira', email: '00001134409667sp@al.educacao.sp.gov.br', senha: '123', eLider: false },
      { id: '28', ra: '00001146955510sp', nome: 'Manuela Prado Sanches Araújo', email: '00001146955510sp@al.educacao.sp.gov.br', senha: '123', eLider: true }, // 👑 LÍDER
      { id: '29', ra: '00001096685024sp', nome: 'Sofia Ramos Leal', email: '00001096685024sp@al.educacao.sp.gov.br', senha: '123', eLider: false },
      { id: '30', ra: '00001116914293sp', nome: 'Davi Silva Passos', email: '00001116914293sp@al.educacao.sp.gov.br', senha: '123', eLider: false }
    ];
    localStorage.setItem('TS_usuarios', JSON.stringify(usuariosIniciais));
  }

  if (!localStorage.getItem('TS_pendencias')) {
    const pendenciasIniciais = [
      {
        id: '101',
        titulo: 'Introdução do TCC',
        descricao: 'Escrever a introdução e justificativa do projeto TeamStudy.',
        raResponsavel: '00001129212543sp',
        nomeResponsavel: 'Thales Alves De Sousa',
        prazo: new Date(Date.now() + 86400000 * 2).toISOString(),
        status: 'pendente',
        linkEntrega: '',
        dataEntrega: null
      }
    ];
    localStorage.setItem('TS_pendencias', JSON.stringify(pendenciasIniciais));
  }

  if (localStorage.getItem('TS_tema') === 'dark') {
    document.body.classList.add('dark-mode');
  }
})();

function getUsuarios() {
  return JSON.parse(localStorage.getItem('TS_usuarios')) || [];
}

function getUsuarioLogado() {
  return JSON.parse(localStorage.getItem('TS_usuarioLogado'));
}

function getPendencias() {
  return JSON.parse(localStorage.getItem('TS_pendencias')) || [];
}

function salvarPendencias(pendencias) {
  localStorage.setItem('TS_pendencias', JSON.stringify(pendencias));
}

function verificarAutenticacao() {
  const usuario = getUsuarioLogado();
  if (!usuario && !window.location.pathname.includes('index.html') && !window.location.pathname.includes('cadastro.html')) {
    window.location.href = 'index.html';
  }
  return usuario;
}
// Aplica o tema escuro automaticamente em qualquer página assim que o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('TS_tema') === 'dark') {
    document.body.classList.add('dark-mode');
  }
});

function getUsuarios() {
  return JSON.parse(localStorage.getItem('TS_usuarios')) || [];
}

function getUsuarioLogado() {
  return JSON.parse(localStorage.getItem('TS_usuarioLogado'));
}

function getPendencias() {
  return JSON.parse(localStorage.getItem('TS_pendencias')) || [];
}

function salvarPendencias(pendencias) {
  localStorage.setItem('TS_pendencias', JSON.stringify(pendencias));
}

function verificarAutenticacao() {
  const usuario = getUsuarioLogado();
  if (!usuario && !window.location.pathname.includes('index.html') && !window.location.pathname.includes('cadastro.html')) {
    window.location.href = 'index.html';
  }
  return usuario;
}

document.addEventListener('DOMContentLoaded', () => {
  const formLogin = document.getElementById('formLogin');
  const btnEsqueciSenha = document.getElementById('btnEsqueciSenha');
  const formRecuperar = document.getElementById('formRecuperar');
  const formCadastro = document.getElementById('formCadastro');

  // --- LÓGICA DE LOGIN ---
  if (formLogin) {
    formLogin.addEventListener('submit', (e) => {
      e.preventDefault();

      const idInput = document.getElementById('loginIdentificacao');
      const senhaInput = document.getElementById('loginSenha');

      if (!idInput || !senhaInput) return;

      const id = idInput.value.trim().toLowerCase();
      const senha = senhaInput.value.trim();

      // Busca a lista de usuários cadastrados
      const usuarios = typeof getUsuarios === 'function' ? getUsuarios() : [];

      const user = usuarios.find(u => {
        // Tratamento seguro para evitar crash caso algum campo seja undefined
        const ra = (u.ra || '').toLowerCase().trim();
        const email = (u.email || '').toLowerCase().trim();
        const userSenha = u.senha || '';

        const raSemSp = ra.replace(/sp$/i, '');
        const idLimpo = id.replace(/sp$/i, '');

        const loginValido = (ra === id || email === id || (raSemSp && raSemSp === idLimpo));
        return loginValido && userSenha === senha;
      });

      if (user) {
        // Salva a sessão ativa do usuário
        localStorage.setItem('TS_usuarioLogado', JSON.stringify(user));
        
        // Redireciona para a página principal
        window.location.href = 'dashboard.html';
      } else {
        alert('Credenciais inválidas. Verifique os dados ou cadastre uma conta.');
      }
    });
  }

  // --- ESQUECI A SENHA (ABRIR MODAL) ---
  if (btnEsqueciSenha) {
    btnEsqueciSenha.addEventListener('click', (e) => {
      e.preventDefault();
      const modal = document.getElementById('modalRecuperar');
      if (modal) modal.style.display = 'block';
    });
  }

  // --- RECUPERAR SENHA ---
  if (formRecuperar) {
    formRecuperar.addEventListener('submit', (e) => {
      e.preventDefault();
      const nome = document.getElementById('recNome')?.value.trim();
      const email = document.getElementById('recEmail')?.value.trim();

      const usuarios = typeof getUsuarios === 'function' ? getUsuarios() : [];
      const user = usuarios.find(u => 
        (u.nome || '').toLowerCase() === (nome || '').toLowerCase() && 
        (u.email || '').toLowerCase() === (email || '').toLowerCase()
      );

      if (user) {
        alert(`Instruções de recuperação simuladas com sucesso!\nUm e-mail de redefinição foi enviado para: ${email}`);
        const modal = document.getElementById('modalRecuperar');
        if (modal) modal.style.display = 'none';
      } else {
        alert('Os dados informados não coincidem com nenhum registro em nosso sistema.');
      }
    });
  }

  // --- LÓGICA DE CADASTRO ---
  if (formCadastro) {
    formCadastro.addEventListener('submit', (e) => {
      e.preventDefault();

      const nome = document.getElementById('cadNome').value.trim();
      const ra = document.getElementById('cadRa').value.trim().toLowerCase();
      const email = document.getElementById('cadEmail').value.trim().toLowerCase();
      const senha = document.getElementById('cadSenha').value.trim();

      if (senha.length < 6) {
        alert('A senha deve ter pelo menos 6 caracteres!');
        return;
      }

      const usuarios = typeof getUsuarios === 'function' ? getUsuarios() : [];

      // Verifica duplicidade com proteção nula
      const jaExiste = usuarios.some(u => 
        (u.ra && u.ra.toLowerCase() === ra) || 
        (u.email && u.email.toLowerCase() === email)
      );

      if (jaExiste) {
        alert('Este RA ou E-mail já está cadastrado no sistema!');
        return;
      }

      const novoUsuario = {
        id: String(Date.now()),
        ra: ra,
        nome: nome,
        email: email,
        senha: senha,
        eLider: false
      };

      usuarios.push(novoUsuario);
      localStorage.setItem('TS_usuarios', JSON.stringify(usuarios));

      alert('Cadastro realizado com sucesso! Faça login para continuar.');
      window.location.href = 'index.html';
    });
  }
});
// 1. Função para verificar se está rodando dentro do App (Standalone)
function isAppInstalado() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
}

// 2. Na sua lógica do Popup / Autenticação:
function exibirBannerInstalacao() {
  // Se estiver dentro do App, aborta imediatamente
  if (isAppInstalado()) {
    console.log("Executando como App instalado. Popup bloqueado.");
    return;
  }

  // Se estiver no navegador comum, exibe o popup normalmente
  const popup = document.getElementById('seu-popup-id');
  if (popup) {
    popup.style.display = 'block';
  }
}

// Chame a função quando a página/script carregar
document.addEventListener('DOMContentLoaded', () => {
  exibirBannerInstalacao();
});
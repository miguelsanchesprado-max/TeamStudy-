document.addEventListener('DOMContentLoaded', () => {
  const formLogin = document.getElementById('formLogin');
  const btnEsqueciSenha = document.getElementById('btnEsqueciSenha');
  const formRecuperar = document.getElementById('formRecuperar');
  const formCadastro = document.getElementById('formCadastro');

  // --- LÓGICA DE LOGIN ---
  if (formLogin) {
    formLogin.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('loginIdentificacao').value.trim().toLowerCase();
      const senha = document.getElementById('loginSenha').value.trim();

      const usuarios = getUsuarios();
      const user = usuarios.find(u => {
        const ra = u.ra.toLowerCase().trim();
        const email = u.email.toLowerCase().trim();
        const raSemSp = ra.replace('sp', '');
        const idLimpo = id.replace('sp', '');

        return (ra === id || email === id || raSemSp === idLimpo) && u.senha === senha;
      });

      if (user) {
        localStorage.setItem('TS_usuarioLogado', JSON.stringify(user));
        window.location.href = 'dashboard.html';
      } else {
        alert('Credenciais inválidas. Verifique os dados fornecidos.');
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
      const nome = document.getElementById('recNome').value.trim();
      const email = document.getElementById('recEmail').value.trim();

      const usuarios = getUsuarios();
      const user = usuarios.find(u => u.nome.toLowerCase() === nome.toLowerCase() && u.email.toLowerCase() === email.toLowerCase());

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

      // Trava de mínimo 6 caracteres
      if (senha.length < 6) {
        alert('A senha deve ter pelo menos 6 caracteres!');
        return;
      }

      const usuarios = getUsuarios();

      // Verifica duplicidade
      const jaExiste = usuarios.some(u => u.ra.toLowerCase() === ra || u.email.toLowerCase() === email);

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
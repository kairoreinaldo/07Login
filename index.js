// Animação dos painéis (seu código original)
const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

signUpButton.addEventListener('click', () => {
    container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
    container.classList.remove("right-panel-active");
});

// ============================================
// NOVO CÓDIGO - VALIDAÇÃO E ENVIO DE DADOS
// ============================================

// Função para mostrar mensagens
function mostrarMensagem(mensagem, tipo) {
    // Remove mensagem anterior se existir
    const msgAnterior = document.querySelector('.mensagem-feedback');
    if (msgAnterior) {
        msgAnterior.remove();
    }

    // Cria nova mensagem
    const div = document.createElement('div');
    div.className = `mensagem-feedback ${tipo}`;
    div.textContent = mensagem;
    div.style.cssText = `
        padding: 10px 20px;
        margin: 10px 0;
        border-radius: 5px;
        text-align: center;
        font-size: 14px;
        ${tipo === 'sucesso' 
            ? 'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;' 
            : 'background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;'}
    `;

    // Adiciona ao formulário
    const form = document.querySelector(`.${tipo === 'sucesso' ? 'sign-in' : 'sign-up'}-container form`);
    form.insertBefore(div, form.firstChild);

    // Remove após 5 segundos
    setTimeout(() => div.remove(), 5000);
}

// 📝 REGISTRO DE USUÁRIO
const formRegistro = document.querySelector('.sign-up-container form');
const btnRegistrar = document.querySelector('.sign-up-container .btn-grad');

btnRegistrar.addEventListener('click', async (e) => {
    e.preventDefault();

    // Capturar valores dos campos
    const nome = formRegistro.querySelector('input[type="text"]').value.trim();
    const email = formRegistro.querySelector('input[type="email"]').value.trim();
    const senha = formRegistro.querySelector('input[type="password"]').value;

    // Validação básica no frontend
    if (!nome || !email || !senha) {
        mostrarMensagem('Preencha todos os campos!', 'erro');
        return;
    }

    if (senha.length < 6) {
        mostrarMensagem('A senha deve ter no mínimo 6 caracteres!', 'erro');
        return;
    }

    // Desabilitar botão durante o envio
    btnRegistrar.style.opacity = '0.6';
    btnRegistrar.style.pointerEvents = 'none';
    btnRegistrar.textContent = 'Registrando...';

    try {
        // Enviar dados para o servidor
        const response = await fetch('http://localhost:3000/registrar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nome, email, senha })
        });

        const data = await response.json();

        if (data.sucesso) {
            mostrarMensagem(data.mensagem, 'sucesso');
            formRegistro.reset();
            
            // Mudar para tela de login após 2 segundos
            setTimeout(() => {
                container.classList.remove("right-panel-active");
            }, 2000);
        } else {
            mostrarMensagem(data.mensagem, 'erro');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao conectar com o servidor!', 'erro');
    } finally {
        // Reabilitar botão
        btnRegistrar.style.opacity = '1';
        btnRegistrar.style.pointerEvents = 'auto';
        btnRegistrar.textContent = 'Registrar';
    }
});

// 🔐 LOGIN DE USUÁRIO
const formLogin = document.querySelector('.sign-in-container form');
const btnLogin = document.querySelector('.sign-in-container .btn-grad');

btnLogin.addEventListener('click', async (e) => {
    e.preventDefault();

    // Capturar valores dos campos
    const email = formLogin.querySelector('input[type="email"]').value.trim();
    const senha = formLogin.querySelector('input[type="password"]').value;

    // Validação básica
    if (!email || !senha) {
        mostrarMensagem('Preencha todos os campos!', 'erro');
        return;
    }

    // Desabilitar botão durante o envio
    btnLogin.style.opacity = '0.6';
    btnLogin.style.pointerEvents = 'none';
    btnLogin.textContent = 'Entrando...';

    try {
        // Enviar dados para o servidor
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, senha })
        });

        const data = await response.json();

        if (data.sucesso) {
            mostrarMensagem(data.mensagem, 'sucesso');
            
            // Salvar dados do usuário no localStorage
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            
            // Redirecionar para a página principal após 1.5 segundos
            setTimeout(() => {
                window.location.href = 'dashboard.html'; // ⚠️ Crie esta página depois
            }, 1500);
        } else {
            mostrarMensagem(data.mensagem, 'erro');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao conectar com o servidor!', 'erro');
    } finally {
        // Reabilitar botão
        btnLogin.style.opacity = '1';
        btnLogin.style.pointerEvents = 'auto';
        btnLogin.textContent = 'Entrar';
    }
}); 
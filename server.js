const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // Servir arquivos estáticos (HTML, CSS, JS)

// Configuração do MySQL
// ⚠️ IMPORTANTE: Altere os dados abaixo conforme seu MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',        // Seu usuário do MySQL
    password: '',        // Sua senha do MySQL
    database: 'sistema_login'
});

// Conectar ao banco
db.connect((err) => {
    if (err) {
        console.error('❌ Erro ao conectar ao MySQL:', err);
        return;
    }
    console.log('✅ Conectado ao MySQL!');
});

// Rota principal - servir o HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 📝 ROTA DE REGISTRO
app.post('/registrar', async (req, res) => {
    const { nome, email, senha } = req.body;

    // Validação simples
    if (!nome || !email || !senha) {
        return res.status(400).json({ 
            sucesso: false, 
            mensagem: 'Preencha todos os campos!' 
        });
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ 
            sucesso: false, 
            mensagem: 'Email inválido!' 
        });
    }

    // Validar senha (mínimo 6 caracteres)
    if (senha.length < 6) {
        return res.status(400).json({ 
            sucesso: false, 
            mensagem: 'A senha deve ter no mínimo 6 caracteres!' 
        });
    }

    try {
        // Verificar se o email já existe
        db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ 
                    sucesso: false, 
                    mensagem: 'Erro no servidor!' 
                });
            }

            if (results.length > 0) {
                return res.status(400).json({ 
                    sucesso: false, 
                    mensagem: 'Este email já está cadastrado!' 
                });
            }

            // Criptografar a senha
            const senhaHash = await bcrypt.hash(senha, 10);

            // Inserir usuário no banco
            db.query(
                'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
                [nome, email, senhaHash],
                (err, result) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ 
                            sucesso: false, 
                            mensagem: 'Erro ao criar conta!' 
                        });
                    }

                    res.status(201).json({ 
                        sucesso: true, 
                        mensagem: 'Conta criada com sucesso!' 
                    });
                }
            );
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            sucesso: false, 
            mensagem: 'Erro no servidor!' 
        });
    }
});

// 🔐 ROTA DE LOGIN
app.post('/login', (req, res) => {
    const { email, senha } = req.body;

    // Validação simples
    if (!email || !senha) {
        return res.status(400).json({ 
            sucesso: false, 
            mensagem: 'Preencha todos os campos!' 
        });
    }

    // Buscar usuário no banco
    db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ 
                sucesso: false, 
                mensagem: 'Erro no servidor!' 
            });
        }

        if (results.length === 0) {
            return res.status(401).json({ 
                sucesso: false, 
                mensagem: 'Email ou senha incorretos!' 
            });
        }

        const usuario = results[0];

        // Verificar senha
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

        if (!senhaCorreta) {
            return res.status(401).json({ 
                sucesso: false, 
                mensagem: 'Email ou senha incorretos!' 
            });
        }

        // Login bem-sucedido
        res.json({ 
            sucesso: true, 
            mensagem: 'Login realizado com sucesso!',
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email
            }
        });
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
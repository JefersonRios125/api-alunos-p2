require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const Usuario = require('./Usuario');
const Aluno = require('./Aluno');

const app = express();
const PORT = 3004;

// Permitir acesso pelo Live Server e pela própria API.
app.use(cors({
    origin: [
        'http://localhost:5500',
        'http://127.0.0.1:5500',
        'http://localhost:3004',
        'http://127.0.0.1:3004'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Disponibilizar HTML, CSS e JavaScript.
app.use('/app', express.static(path.join(__dirname, 'public')));

// Dados do autor.
app.get('/', (req, res) => {
    res.json({
        mensagem: 'API feita por: Jeferson Rios Pereira, RA: 2456182',
        nome: 'Jeferson Rios Pereira',
        ra: '2456182',
        curso: 'Análise e Desenvolvimento de Sistemas',
        turma: '5º semestre - Noite'
    });
});

// Cadastrar usuário — rota preservada no backend.
app.post('/usuarios', async (req, res) => {
    try {
        const { nome, email, senha } = req.body || {};

        if (
            typeof nome !== 'string' || !nome.trim() ||
            typeof email !== 'string' || !email.trim() ||
            typeof senha !== 'string' ||
            senha.length < 8 ||
            Buffer.byteLength(senha, 'utf8') > 72
        ) {
            return res.status(400).json({
                mensagem: 'Informe nome, email e senha com pelo menos 8 caracteres e no máximo 72 bytes.'
            });
        }

        const senhaHash = await bcrypt.hash(senha, 12);

        const usuario = await Usuario.create({
            nome,
            email,
            senhaHash
        });

        res.status(201).json({
            id: usuario._id,
            nome: usuario.nome,
            email: usuario.email
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                mensagem: 'Email já cadastrado.'
            });
        }

        res.status(500).json({
            mensagem: 'Erro ao cadastrar usuário.'
        });
    }
});

// Login — rota preservada no backend.
app.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body || {};

        if (
            typeof email !== 'string' || !email.trim() ||
            typeof senha !== 'string' || !senha
        ) {
            return res.status(400).json({
                mensagem: 'Informe email e senha.'
            });
        }

        const usuario = await Usuario.findOne({
            email: email.trim().toLowerCase()
        }).select('+senhaHash');

        if (
            !usuario ||
            !(await bcrypt.compare(senha, usuario.senhaHash))
        ) {
            return res.status(401).json({
                mensagem: 'Email ou senha incorretos.'
            });
        }

        const token = jwt.sign(
            {},
            process.env.JWT_SECRET,
            {
                subject: usuario._id.toString(),
                expiresIn: '1h',
                algorithm: 'HS256'
            }
        );

        res.json({ token });
    } catch (error) {
        res.status(500).json({
            mensagem: 'Erro ao fazer login.'
        });
    }
});

// Validar token nas operações que continuam protegidas.
function autenticar(req, res, next) {
    const autorizacao = req.headers.authorization || '';
    const partes = autorizacao.split(' ');

    if (
        partes.length !== 2 ||
        partes[0] !== 'Bearer' ||
        !partes[1]
    ) {
        return res.status(401).json({
            mensagem: 'Envie o token no formato Bearer TOKEN.'
        });
    }

    try {
        const dados = jwt.verify(
            partes[1],
            process.env.JWT_SECRET,
            { algorithms: ['HS256'] }
        );

        req.usuarioId = dados.sub;
        next();
    } catch (error) {
        return res.status(401).json({
            mensagem: 'Token inválido ou expirado.'
        });
    }
}

// A consulta é pública. Cadastro, edição e exclusão exigem token.
app.use('/alunos', (req, res, next) => {
    if (req.method === 'GET' || req.method === 'HEAD') {
        return next();
    }

    return autenticar(req, res, next);
});

// Validar os campos obrigatórios.
function camposAlunoValidos(dados) {
    const { nome, ra, curso, turma } = dados || {};

    return [nome, ra, curso, turma].every(
        valor => typeof valor === 'string' && valor.trim()
    );
}

// GET: listar todos ou buscar por nome e RA.
app.get('/alunos', async (req, res) => {
    try {
        const busca = typeof req.query.busca === 'string'
            ? req.query.busca.trim()
            : '';

        if (busca.length > 100) {
            return res.status(400).json({
                mensagem: 'A busca deve ter no máximo 100 caracteres.'
            });
        }

        // Tratar caracteres especiais como texto literal.
        const textoSeguro = busca.replace(
            /[.*+?^${}()|[\]\\]/g,
            '\\$&'
        );

        const filtro = busca
            ? {
                $or: [
                    {
                        nome: {
                            $regex: textoSeguro,
                            $options: 'i'
                        }
                    },
                    {
                        ra: {
                            $regex: textoSeguro,
                            $options: 'i'
                        }
                    }
                ]
            }
            : {};

        const alunos = await Aluno.find(filtro);

        res.json(alunos);
    } catch (error) {
        res.status(500).json({
            mensagem: 'Erro ao consultar alunos.'
        });
    }
});

// POST: cadastrar aluno.
app.post('/alunos', async (req, res) => {
    try {
        if (!camposAlunoValidos(req.body)) {
            return res.status(400).json({
                mensagem: 'Informe nome, ra, curso e turma como textos preenchidos.'
            });
        }

        const { nome, ra, curso, turma } = req.body;

        const aluno = await Aluno.create({
            nome,
            ra,
            curso,
            turma
        });

        res.status(201).json(aluno);
    } catch (error) {
        res.status(400).json({
            mensagem: 'Não foi possível cadastrar o aluno.'
        });
    }
});

// PUT: rota original preservada, com autenticação.
app.put('/alunos/:id', async (req, res) => {
    try {
        if (!mongoose.isObjectIdOrHexString(req.params.id)) {
            return res.status(400).json({
                mensagem: 'ID inválido.'
            });
        }

        if (!camposAlunoValidos(req.body)) {
            return res.status(400).json({
                mensagem: 'Informe nome, ra, curso e turma como textos preenchidos.'
            });
        }

        const { nome, ra, curso, turma } = req.body;

        const aluno = await Aluno.findByIdAndUpdate(
            req.params.id,
            { nome, ra, curso, turma },
            { new: true, runValidators: true }
        );

        if (!aluno) {
            return res.status(404).json({
                mensagem: 'Aluno não encontrado.'
            });
        }

        res.json(aluno);
    } catch (error) {
        res.status(400).json({
            mensagem: 'Não foi possível atualizar o aluno.'
        });
    }
});

// DELETE: rota original preservada, com autenticação.
app.delete('/alunos/:id', async (req, res) => {
    try {
        if (!mongoose.isObjectIdOrHexString(req.params.id)) {
            return res.status(400).json({
                mensagem: 'ID inválido.'
            });
        }

        const aluno = await Aluno.findByIdAndDelete(req.params.id);

        if (!aluno) {
            return res.status(404).json({
                mensagem: 'Aluno não encontrado.'
            });
        }

        res.json({
            mensagem: 'Aluno excluído com sucesso.'
        });
    } catch (error) {
        res.status(500).json({
            mensagem: 'Erro ao excluir aluno.'
        });
    }
});

// Conectar ao banco e iniciar o servidor.
async function iniciarServidor() {
    try {
        if (!process.env.MONGO_URL) {
            throw new Error('Configure MONGO_URL no arquivo .env');
        }

        if (!process.env.JWT_SECRET) {
            throw new Error('Configure JWT_SECRET no arquivo .env');
        }

        await mongoose.connect(process.env.MONGO_URL, {
            dbName: 'nova_api_alunos'
        });

        console.log('MongoDB conectado ao banco nova_api_alunos');

        app.listen(PORT, () => {
            console.log(`API: http://localhost:${PORT}`);
            console.log(`Página: http://localhost:${PORT}/app/`);
        });
    } catch (error) {
        console.error('Erro ao iniciar:', error.message);
    }
}

iniciarServidor();
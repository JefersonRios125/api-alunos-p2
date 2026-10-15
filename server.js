require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Usuario = require('./Usuario');
const Aluno = require('./Aluno');

const app = express();
const PORT = 3004;

app.use(express.json());

// Exibir os dados do autor
app.get('/', (req, res) => {
    res.json({
        mensagem: 'API feita por: Jeferson Rios Pereira, RA: SEU_RA',
        nome: 'Jeferson Rios Pereira',
        ra: 'SEU_RA',
        curso: 'Análise e Desenvolvimento de Sistemas',
        turma: '5º semestre - Noite'
    });
});

// Cadastrar usuário
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

// Fazer login e gerar token
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

// Validar token
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

// Proteger todas as rotas de alunos
app.use('/alunos', autenticar);

// Validar os campos do aluno
function camposAlunoValidos(dados) {
    const { nome, ra, curso, turma } = dados || {};

    return [nome, ra, curso, turma].every(
        valor => typeof valor === 'string' && valor.trim()
    );
}

// Consultar alunos
app.get('/alunos', async (req, res) => {
    try {
        const alunos = await Aluno.find();
        res.json(alunos);
    } catch (error) {
        res.status(500).json({
            mensagem: 'Erro ao consultar alunos.'
        });
    }
});

// Cadastrar aluno
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

// Atualizar aluno
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

// Excluir aluno
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

// Conectar ao MongoDB e iniciar a API
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
            console.log(`Servidor ligado em http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Erro ao iniciar:', error.message);
    }
}

iniciarServidor();
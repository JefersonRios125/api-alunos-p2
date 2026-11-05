'use strict';

// Abrir em http://localhost:3004/app/.
const API_URL = 'http://localhost:3004';
const caixa = document.getElementById('caixa');
const formulario = document.getElementById('form-aluno');
let ocupado = false;
let token = sessionStorage.getItem('token') || '';
let alunoEmEdicao = null;
const campos = ['nome', 'ra', 'curso', 'turma'];
const formLogin = document.getElementById('form-login');
const sair = document.getElementById('sair');
const cancelar = document.getElementById('cancelar-edicao');

function limparEdicao() {
    alunoEmEdicao = null;
    formulario.reset();
    document.getElementById('titulo-form').textContent = 'Cadastrar aluno';
    document.getElementById('salvar').textContent = 'Cadastrar aluno';
    cancelar.hidden = true;
}

function atualizarLogin(novoToken) {
    token = novoToken;
    if (token) sessionStorage.setItem('token', token);
    else sessionStorage.removeItem('token');
    formLogin.hidden = Boolean(token);
    sair.hidden = !token;
    document.getElementById('status-login').textContent = token
        ? 'Sessão iniciada.'
        : 'Entre para cadastrar, editar ou excluir alunos.';
    if (!token) limparEdicao();
}

function exigirLogin() {
    if (!token) throw new Error('Entre para realizar esta operação.');
}

function mensagem(texto) {
    document.getElementById('mensagem').textContent = texto;
}
//Removido o array fixo testes, os dados agora vêm da API
async function requisicao(rota, method = 'GET', dados) {
    let resposta;
    try {
        resposta = await fetch(`${API_URL}${rota}`, {
            method,
            headers: {
                ...(dados ? { 'Content-Type': 'application/json' } : {}),
                ...(token && method !== 'GET' && rota !== '/login'
                    ? { Authorization: `Bearer ${token}` } : {})
            },
            body: dados ? JSON.stringify(dados) : undefined
        });
    } catch {
        throw new Error('Não foi possível conectar à API. Verifique se o servidor está ligado.');
    }
    const texto = await resposta.text();
    let resultado;
    try { resultado = texto ? JSON.parse(texto) : null; }
    catch { throw new Error('A API retornou uma resposta inesperada.'); }
    if (resposta.status === 401 && rota !== '/login') atualizarLogin('');
    if (!resposta.ok) throw new Error(resultado?.mensagem || `Erro HTTP ${resposta.status}`);
    return resultado;
}

async function executar(acao) {
    if (ocupado) return;
    ocupado = true;
    document.querySelectorAll('button').forEach(botao => { botao.disabled = true; });
    try { await acao(); }
    catch (erro) { mensagem(erro.message); }
    finally {
        ocupado = false;
        document.querySelectorAll('button').forEach(botao => { botao.disabled = false; });
    }
}

// GET: busca os alunos da API, substituindo o array fixo do mural.
async function listarAlunos() {
    const busca = document.getElementById('busca').value.trim();
    const rota = busca ? `/alunos?busca=${encodeURIComponent(busca)}` : '/alunos';
    const alunos = await requisicao(rota);
    if (!Array.isArray(alunos)) throw new Error('A API não retornou uma lista de alunos.');
    caixa.replaceChildren();
    if (!alunos.length) {
        caixa.textContent = busca ? 'Nenhum aluno encontrado para essa busca.' : 'Nenhum aluno cadastrado.';
        return;
    }
    for (const aluno of alunos) {
        const card = document.createElement('article');
        const texto = document.createElement('p');
        texto.textContent = `Nome: ${aluno.nome} | RA: ${aluno.ra} | Curso: ${aluno.curso} | Turma: ${aluno.turma}`;
        const editar = document.createElement('button');
        editar.type = 'button';
        editar.textContent = 'Editar';
        editar.addEventListener('click', () => executar(() => {
            exigirLogin();
            alunoEmEdicao = aluno._id;
            for (const campo of campos) document.getElementById(campo).value = aluno[campo] ?? '';
            document.getElementById('titulo-form').textContent = 'Editar aluno';
            document.getElementById('salvar').textContent = 'Salvar alterações';
            cancelar.hidden = false;
            document.getElementById('nome').focus();
        }));

        const excluir = document.createElement('button');
        excluir.type = 'button';
        excluir.textContent = 'Excluir';
        excluir.addEventListener('click', () => executar(async () => {
            exigirLogin();
            if (!window.confirm(`Excluir ${aluno.nome}?`)) return;
            await requisicao(`/alunos/${encodeURIComponent(aluno._id)}`, 'DELETE');
            if (alunoEmEdicao === aluno._id) limparEdicao();
            card.remove();
            if (!caixa.children.length) caixa.textContent = 'Nenhum aluno nesta lista.';
            mensagem('Aluno excluído com sucesso.');
        }));
        card.append(texto, editar, excluir);
        caixa.appendChild(card);
    }
}

// POST: envia os campos digitados para cadastrar um aluno.
//A função coleta os campos e envia para a API
async function salvar() {
    exigirLogin();
    const dados = {};
    for (const campo of campos) {
        dados[campo] = document.getElementById(campo).value.trim();
        if (!dados[campo]) throw new Error('Preencha todos os campos do aluno.');
    }
    const id = alunoEmEdicao;
    await requisicao(id ? `/alunos/${encodeURIComponent(id)}` : '/alunos', id ? 'PUT' : 'POST', dados);
    limparEdicao();
    caixa.replaceChildren();
    mensagem(id ? 'Aluno atualizado. Consulte a lista para ver a alteração.'
        : 'Aluno cadastrado. Clique em Buscar ou Mostrar todos para consultar.');
}

formulario.addEventListener('submit', evento => {
    evento.preventDefault();
    executar(salvar);
});
document.getElementById('form-busca').addEventListener('submit', evento => {
    evento.preventDefault();
    executar(async () => {
        await listarAlunos();
        mensagem('Busca concluída.');
    });
});
document.getElementById('atualizar').addEventListener('click', () => executar(async () => {
    document.getElementById('busca').value = '';
    await listarAlunos();
    mensagem('Todos os alunos foram consultados.');
}));
// A lista só é consultada ao clicar em Buscar ou Mostrar todos.


formLogin.addEventListener('submit', evento => {
    evento.preventDefault();
    executar(async () => {
        const resultado = await requisicao('/login', 'POST', {
            email: document.getElementById('email').value.trim(),
            senha: document.getElementById('senha').value
        });
        atualizarLogin(resultado.token);
        formLogin.reset();
        mensagem('Login realizado.');
    });
});
sair.addEventListener('click', () => {
    atualizarLogin('');
    mensagem('Você saiu da sessão.');
});
cancelar.addEventListener('click', limparEdicao);
atualizarLogin(token);

'use strict';

// Abrir em http://localhost:3004/app/.
const API_URL = 'http://localhost:3004';
const caixa = document.getElementById('caixa');
const formulario = document.getElementById('form-aluno');
let ocupado = false;

function mensagem(texto) {
    document.getElementById('mensagem').textContent = texto;
}
//Removido o array fixo testes, os dados agora vêm da API
async function requisicao(rota, method = 'GET', dados) {
    let resposta;
    try {
        resposta = await fetch(`${API_URL}${rota}`, {
            method,
            headers: dados ? { 'Content-Type': 'application/json' } : {},
            body: dados ? JSON.stringify(dados) : undefined
        });
    } catch {
        throw new Error('Não foi possível conectar à API. Verifique se o servidor está ligado.');
    }
    const texto = await resposta.text();
    let resultado;
    try { resultado = texto ? JSON.parse(texto) : null; }
    catch { throw new Error('A API retornou uma resposta inesperada.'); }
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
        card.appendChild(texto);
        caixa.appendChild(card);
    }
}

// POST: envia os campos digitados para cadastrar um aluno.
//A função coleta os campos e envia para a API
async function salvar() {
    const dados = {};
    for (const campo of ['nome', 'ra', 'curso', 'turma']) {
        dados[campo] = document.getElementById(campo).value.trim();
        if (!dados[campo]) throw new Error('Preencha todos os campos do aluno.');
    }
    await requisicao('/alunos', 'POST', dados);
    formulario.reset();
    caixa.replaceChildren();
    mensagem('Aluno cadastrado com sucesso. Clique em Buscar ou Mostrar todos para consultar.');
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

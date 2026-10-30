# API de Alunos — P2

API desenvolvida por Jeferson Rios Pereira para a atividade de Microsserviços.

Permite cadastrar, consultar, atualizar e excluir alunos. A interface HTML e JavaScript utiliza GET e POST sem login; atualização e exclusão continuam exigindo token JWT. As senhas dos usuários são armazenadas como hash.

## Tecnologias

- Node.js e Express
- MongoDB Atlas e Mongoose
- bcryptjs
- JSON Web Token (JWT)
- dotenv
- CORS
- HTML, CSS e JavaScript com fetch

## Campos do aluno

- nome
- ra
- curso
- turma

Todos os campos são obrigatórios e devem ser enviados como texto.

## Como executar

Instale as dependências:

```bash
npm install
```

Crie um arquivo `.env` na raiz do projeto:

```env
MONGO_URL=SUA_CONEXAO_DO_MONGODB_ATLAS
JWT_SECRET=SUA_CHAVE_SECRETA
```

O arquivo `.env` contém informações privadas e não deve ser enviado ao GitHub.

Inicie a API:

```bash
npm start
```

Endereço: http://localhost:3004

Banco utilizado: `nova_api_alunos`.

## Rotas

| Método | Rota | Função | Exige token |
|---|---|---|---|
| GET | / | Mensagem inicial | Não |
| POST | /usuarios | Cadastrar usuário | Não |
| POST | /login | Fazer login e gerar token | Não |
| GET | /alunos | Listar ou buscar alunos por nome ou RA | Não |
| POST | /alunos | Cadastrar aluno | Não |
| PUT | /alunos/:id | Atualizar aluno | Sim |
| DELETE | /alunos/:id | Excluir aluno | Sim |

## Cadastro de usuário

Envie um POST para `/usuarios`:

```json
{
  "nome": "Usuario de teste",
  "email": "teste@example.com",
  "senha": "SenhaTeste2026!"
}
```

A senha deve ter pelo menos 8 caracteres e no máximo 72 bytes.
Ela é armazenada como hash e não é retornada na resposta.

## Login

Envie um POST para `/login`:

```json
{
  "email": "teste@example.com",
  "senha": "SenhaTeste2026!"
}
```

O token retornado tem validade de uma hora. Nas rotas PUT e DELETE de alunos, envie o cabeçalho:

```text
Authorization: Bearer SEU_TOKEN
```

Consulta e cadastro de alunos são públicos para quem alcançar a API. Atualização e exclusão exigem autenticação.

## Cadastro e atualização de aluno

Envie os quatro campos no POST ou PUT:

```json
{
  "nome": "Aluno de exemplo",
  "ra": "TESTE001",
  "curso": "ADS",
  "turma": "Noite"
}
```

Para atualizar ou excluir, substitua `:id` pelo `_id` do aluno.

## Interface web

Abra http://localhost:3004/app/ após iniciar a API.

- A página não solicita login nem cadastro de usuário.
- Preencha nome, RA, curso e turma e clique em **Cadastrar aluno** para enviar POST /alunos.
- A lista começa vazia e não é carregada automaticamente após o cadastro.
- **Buscar** consulta GET /alunos?busca=texto por parte do nome ou RA, sem diferenciar maiúsculas e minúsculas.
- **Mostrar todos** limpa o filtro e consulta GET /alunos. Buscar sem texto também lista todos.
- O CSS utiliza azul e cinza, fundo em degradê e sombras nos cartões.

Também é possível abrir public/index.html pelo Live Server na porta 5500. O frontend aponta para http://localhost:3004. O CORS permite localhost e 127.0.0.1 nas portas 5500 e 3004, com GET e POST. Para outra porta, ajuste o server.js. CORS é uma regra do navegador; não substitui autenticação.

## Alterações em relação ao exemplo do professor

- Array fixo substituído por uma consulta GET com fetch.
- Função salvar() adaptada para enviar os inputs por POST em JSON.
- Campo único substituído pelos quatro campos obrigatórios do modelo Aluno.
- Área caixa preservada para apresentar os resultados com textContent.
- Adicionados busca manual, mensagens de retorno, tratamento de erros e bloqueio de envios duplicados.
- Configurados CORS e publicação dos arquivos estáticos em /app/.
- Preservadas as rotas anteriores de usuários, login, PUT e DELETE.

## Validação desta atualização

Sintaxe JavaScript, integração HTML/JS e fluxos GET/POST verificados. Rotas HTTP e CORS exercitados com o acesso ao banco simulado, sem consultar ou alterar o MongoDB Atlas real. O teste com o banco real deve ser feito localmente com o .env.

# API de Alunos — P2

API desenvolvida por Jeferson Rios Pereira para a atividade de Microsserviços.

Permite cadastrar, consultar, atualizar e excluir alunos. A interface HTML e JavaScript consulta alunos sem login. Cadastro, edição e exclusão exigem token JWT. As senhas dos usuários são armazenadas como hash.

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

Copie `.env.example` para `.env` na raiz do projeto. No PowerShell:

```powershell
Copy-Item .env.example .env
```

Edite o `.env` com suas credenciais reais:

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
| POST | /alunos | Cadastrar aluno | Sim |
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

O token retornado tem validade de uma hora. Nas rotas POST, PUT e DELETE de alunos, envie o cabeçalho:

```text
Authorization: Bearer SEU_TOKEN
```

A consulta é pública. As operações que alteram os dados exigem autenticação.

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

- Use o e-mail e a senha de um usuário existente. Se precisar criar uma conta de teste, siga a seção Cadastro de usuário acima.
- Preencha nome, RA, curso e turma e clique em **Cadastrar aluno** para enviar POST /alunos.
- Após buscar um aluno, use **Editar** para preencher o formulário ou **Excluir** e confirme a ação. O botão **Cancelar edição** volta ao cadastro.
- O token fica no armazenamento da sessão da aba. Use **Sair** para encerrar a sessão.
- A lista começa vazia e não é carregada automaticamente após o cadastro.
- **Buscar** consulta GET /alunos?busca=texto por parte do nome ou RA, sem diferenciar maiúsculas e minúsculas.
- **Mostrar todos** limpa o filtro e consulta GET /alunos. Buscar sem texto também lista todos.
- O CSS utiliza azul e cinza, fundo em degradê e sombras nos cartões.

Também é possível abrir public/index.html pelo Live Server na porta 5500. O frontend aponta para http://localhost:3004. O CORS permite localhost e 127.0.0.1 nas portas 5500 e 3004, com GET, POST, PUT e DELETE. Para outra porta, ajuste o server.js. CORS é uma regra do navegador; não substitui autenticação.

## Alterações em relação ao exemplo do professor

- Array fixo substituído por uma consulta GET com fetch.
- Função salvar() adaptada para enviar os inputs por POST em JSON.
- Campo único substituído pelos quatro campos obrigatórios do modelo Aluno.
- Área caixa preservada para apresentar os resultados com textContent.
- Adicionados busca manual, mensagens de retorno, tratamento de erros e bloqueio de envios duplicados.
- Configurados CORS e publicação dos arquivos estáticos em /app/.
- Preservadas as rotas anteriores de usuários, login, PUT e DELETE.

## Atualização conforme a cartilha: CRUD e JWT

- Integrados login e logout à interface, com token guardado no sessionStorage e enviado automaticamente nas operações protegidas.
- POST /alunos passou a exigir token, assim como PUT e DELETE. GET permanece público.
- Adicionados botões Editar, Excluir e Cancelar edição. O formulário usa POST para cadastrar e PUT para salvar uma edição.
- Incluída confirmação antes da exclusão e encerramento da sessão ao receber 401 em operações protegidas.
- Ampliado o CORS para GET, POST, PUT e DELETE.
- Incluído .env.example com valores fictícios; o .env real permanece ignorado pelo Git.

Adaptações ao exemplo da cartilha: login por e-mail com usuários no MongoDB e senhas com hash; quatro campos obrigatórios; sessionStorage; consulta manual; interface em /app/. Porta 3004 e banco nova_api_alunos continuam definidos no server.js, sem leitura de PORT ou DB_NAME.

## Validação

Em 05/11/2026, passaram 20 testes locais com banco simulado: arquivos estáticos, consulta pública, cadastro de usuário com hash, e-mail duplicado, login, JWT válido/inválido/expirado, bloqueio sem token, cadastro e validação de alunos, busca por nome/RA, caracteres especiais, edição, IDs inválidos/inexistentes, exclusão e CORS/preflight. A sintaxe de server.js e public/main.js também foi verificada.

A tentativa de conexão ao Atlas no ambiente de testes foi recusada (ECONNREFUSED); nenhum dado real foi alterado nesses testes. O autor informou que o sistema funcionou em seu computador. Os cliques da interface não foram verificados automaticamente no navegador.

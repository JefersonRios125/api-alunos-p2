# API de Alunos — P2

API desenvolvida por Jeferson Rios Pereira para a atividade de Microsserviços.

Permite cadastrar, consultar, atualizar e excluir alunos, com autenticação por token JWT e armazenamento de senhas como hash.

## Tecnologias

- Node.js e Express
- MongoDB Atlas e Mongoose
- bcryptjs
- JSON Web Token (JWT)
- dotenv

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
| GET | /alunos | Listar alunos | Sim |
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

O token retornado tem validade de uma hora. Nas rotas de alunos, envie o cabeçalho:

```text
Authorization: Bearer SEU_TOKEN
```

Qualquer usuário autenticado pode consultar e gerenciar os alunos.

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

## Validação realizada

Foram testados cadastro, consulta, atualização e exclusão de alunos, além de cadastro de usuário, login e consulta com token.
# Interface CRUD com JWT

1. Coloque o seu arquivo `.env` ao lado de `server.js`, com `MONGO_URL` e `JWT_SECRET`.
2. Execute `npm install` e `npm start`.
3. Abra [a interface](http://localhost:3004/app/).

Use **Buscar** ou **Mostrar todos** para consultar os alunos. Entre com seu e-mail e senha para cadastrar, editar ou excluir. Para criar um usuário de teste pelo endpoint `POST /usuarios`, siga o exemplo no [README](README.md).

No Thunder Client, obtenha o token em `POST /login` e use **Auth → Bearer** nos métodos POST, PUT e DELETE de alunos. Use `GET /alunos` para conferir o resultado.

| Operação | Rota | Token |
|---|---|---|
| Consultar | GET /alunos?busca=texto | Não |
| Cadastrar | POST /alunos | Sim |
| Editar | PUT /alunos/:id | Sim |
| Excluir | DELETE /alunos/:id | Sim |

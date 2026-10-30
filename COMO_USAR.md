# Interface sem login — GET e POST

1. Coloque seu .env original junto de server.js.
2. Execute npm install e npm start.
3. Abra http://localhost:3004/app/.

A página abre diretamente no formulário e na área de consulta; a lista começa vazia. GET /alunos e POST /alunos agora são públicos: qualquer pessoa que alcance a API poderá consultar e cadastrar alunos. PUT e DELETE continuam exigindo token. As rotas de usuários e login foram preservadas no backend.

O CSS azul e cinza está incluído e vinculado ao HTML.
Validação: sintaxe JavaScript e fluxos GET/POST com respostas simuladas; conexão real com MongoDB depende do seu .env.

## Buscar alunos (GET)
Digite parte do nome ou RA no campo de busca e clique em Buscar, ou pressione Enter. A página chama GET /alunos?busca=texto. A API busca em nome e RA sem diferenciar maiúsculas e minúsculas. Mostrar todos limpa o filtro e chama GET /alunos. Busca vazia também lista todos.

A lista começa vazia. Não é feita consulta automática ao abrir a página ou após cadastrar. Clique em Buscar para filtrar ou em Mostrar todos para listar todos. Os botões não exibem o nome GET.

## Live Server e CORS

A dependência cors já está no package.json e é instalada por npm install. O Live Server pode usar http://localhost:5500 ou http://127.0.0.1:5500. A API deve estar ligada na porta 3004. Se usar outra porta no Live Server, ajuste as origens em server.js.

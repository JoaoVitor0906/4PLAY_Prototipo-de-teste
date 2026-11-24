# 4PLAY

Protótipo web para explorar eventos de e-sports, acompanhar partidas e organizar preferências pessoais. A aplicação usa HTML, CSS e JavaScript no navegador, com um servidor Node.js/Express e banco SQLite para contas e preferências.

## Requisitos

- Node.js 22.5 ou superior (a aplicação usa o módulo integrado `node:sqlite`).
- npm.

## Executar localmente

Na pasta do projeto, instale as dependências e inicie o servidor:

```powershell
npm.cmd install
npm.cmd start
```

Abra [http://localhost:3000](http://localhost:3000) no navegador. Para usar outra porta, defina a variável de ambiente `PORT` antes de iniciar o servidor.

O banco `4play.sqlite` é criado automaticamente na raiz do projeto quando o servidor inicia. Mantenha esse arquivo para preservar as contas e preferências locais.

### Se não conseguir criar conta ou entrar

O cadastro e o login precisam do servidor e da API em execução. Não abra `4play/index.html` diretamente pelo explorador de arquivos; inicie o servidor na pasta do projeto com `npm.cmd start` e acesse `http://localhost:3000`. Mantenha o terminal do servidor aberto enquanto usa a aplicação.

No PowerShell, `npm.cmd` evita bloqueios da política de execução que podem impedir o script `npm.ps1` de iniciar.

## Funcionalidades

- **Início:** destaques, eventos ao vivo e próximas partidas.
- **Explorar:** busca e filtros por jogo, categoria e estado do evento.
- **Partidas:** detalhes fictícios, horários e estatísticas de exemplo.
- **Conta:** cadastro, login, logout e painel de preferências.
- **Preferências:** jogos favoritos, equipes seguidas, alertas e agenda de partidas salvas.
- **Persistência:** contas, sessões e preferências armazenadas em SQLite; a sessão do navegador é mantida em `localStorage`.

Os eventos e as estatísticas são dados fictícios de demonstração. O link “Esqueci minha senha” exibe o formulário e informa que a recuperação ainda não está ativada; nenhum e-mail é enviado nem senha é alterada.

## Identidade visual

A interface usa um tema escuro com vermelho como cor de destaque, inspirado em transmissões e competições de e-sports:

- **Cores:** fundo quase preto (`#090909`), superfícies de cartões (`#171717`), texto principal claro (`#f5f5f5`) e vermelho de ação (`#e30613`). Tons de vermelho mais claros são usados em destaques, links e estados de foco.
- **Tipografia:** Inter para textos e controles; Space Grotesk para títulos e a marca 4PLAY. As fontes são carregadas do Google Fonts.
- **Componentes:** cartões com bordas discretas e cantos arredondados, botões vermelhos para ações principais, botões contornados para ações secundárias e chips para filtros e seleções.
- **Estados de partidas:** etiquetas distinguem eventos ao vivo, próximos e concluídos. A indicação “AO VIVO” usa vermelho e um ponto animado.
- **Layout e acessibilidade:** conteúdo centralizado em uma área de largura máxima, grades que se adaptam a telas menores, indicadores de foco visíveis e respeito à preferência do sistema por movimento reduzido.

## API

As rotas da API são servidas pelo mesmo endereço da aplicação:

| Método | Rota | Descrição |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Cria uma conta e inicia uma sessão. |
| `POST` | `/api/auth/login` | Autentica uma conta e inicia uma sessão. |
| `POST` | `/api/auth/logout` | Encerra a sessão atual. Requer autenticação. |
| `GET` | `/api/me` | Retorna a conta e as preferências atuais. Requer autenticação. |
| `PUT` | `/api/preferences` | Atualiza as preferências da conta. Requer autenticação. |

As rotas autenticadas esperam um token no cabeçalho `Authorization: Bearer <token>`.

## Estrutura do projeto

```text
.
├── server.js              # Inicializa Express, rotas da API e banco SQLite
├── package.json           # Metadados, dependências e comando npm start
├── 4play.sqlite           # Banco local criado automaticamente na primeira execução
└── 4play/
    ├── index.html         # Documento principal e estrutura das telas
    ├── css/
    │   └── style.css      # Identidade visual, componentes e regras responsivas
    └── js/
        └── app.js         # Dados de demonstração, navegação e lógica do cliente
```

### Responsabilidades

- **`server.js`:** cria o banco e as tabelas de usuários, sessões e preferências; oferece endpoints de autenticação e preferências; publica os arquivos estáticos de `4play/`.
- **`4play/index.html`:** define a navegação e as regiões das telas Início, Explorar, Partida e Painel. A aplicação alterna as telas usando a rota por hash (`#inicio`, `#explorar` e `#painel`).
- **`4play/css/style.css`:** concentra variáveis de cor, tipografia, estilos de navegação, cartões, formulários, filtros e layout responsivo.
- **`4play/js/app.js`:** renderiza os eventos, controla filtros e navegação, gerencia estado e sessão no navegador e comunica-se com a API.
- **`4play.sqlite`:** arquivo local de persistência criado pelo servidor; não é necessário criar ou configurar tabelas manualmente.

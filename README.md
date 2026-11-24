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

Para encerrar o servidor local, volte ao terminal onde executou `npm.cmd start` e pressione **Ctrl+C**. Fechar a aba do navegador não encerra o servidor.

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

## Checklist da entrega de IHC

Legenda: `[x]` implementado no protótipo; `[ ]` precisa ser preparado ou concluído para a apresentação.

### O que apresentar

- [ ] Informar o(s) nome(s) do(s) integrante(s) na apresentação.
- [x] Apresentar a proposta: facilitar a descoberta de eventos de e-sports e a organização de partidas de interesse.
- [ ] Explicitar o público-alvo e o contexto de utilização; esses pontos ainda precisam ser definidos para a apresentação.
- [x] Demonstrar pelo menos quatro interfaces e suas finalidades:
  - Início: destaques e próximas partidas.
  - Explorar: busca e filtros de eventos.
  - Detalhes da partida: informações, estado e horários.
  - Painel: preferências do usuário e “Minha agenda”.
- [x] Apresentar uma interface visual de alta fidelidade, com identidade visual, componentes e layout responsivo.
- [x] Demonstrar percursos de utilização, como explorar eventos, abrir uma partida, ativar um lembrete e encontrá-lo em “Minha agenda”.
- [x] Demonstrar funcionalidades interativas: navegação, busca, filtros, conta, preferências e lembretes.
- [ ] Explicar na apresentação quais conceitos de IHC estudados fundamentaram as decisões de projeto.

### Critérios de avaliação

- [ ] Relacionar claramente a proposta às necessidades do público-alvo definido.
- [x] Organizar as informações com hierarquia visual, títulos e componentes de interface.
- [x] Manter padrões visuais e rótulos consistentes entre as telas.
- [x] Permitir navegação entre as telas e retorno aos conteúdos.
- [x] Fornecer feedback de ações e erros, por exemplo, com mensagens na interface para operações e falhas de conta ou salvamento.
- [x] Aplicar práticas de usabilidade e acessibilidade, como foco visível, rótulos acessíveis, feedback anunciado, layout responsivo e respeito à preferência por movimento reduzido.
- [x] Ter funcionalidades interativas implementadas e demonstráveis.
- [ ] Preparar a apresentação oral para justificar as decisões de projeto e responder às perguntas do professor.
- [ ] Explicitar como o projeto considera as necessidades dos usuários, a organização da interface e a qualidade da interação.

> **Nota para a demonstração:** eventos, estatísticas e transmissões são fictícios. Os lembretes são organizados no protótipo, mas não enviam notificações reais.

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

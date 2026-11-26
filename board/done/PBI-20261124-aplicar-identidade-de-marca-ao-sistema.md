---
id: PBI-20261124-aplicar-identidade-de-marca-ao-sistema
tipo: feature
titulo: Aplicar identidade de marca (fonte, logos e cores do Cuidaflux) ao sistema via configuração de Branding
status: done
prioridade: alta
workspaces: [core-backend, intranet-frontend, extranet-frontend, architecture-registry]
criado_em: 2026-11-24
origem: PBI-20261124-rebranding-marca-clinica (dividido; metade de implementação), revisado após inspeção do código
bloqueado_por: []
---

# Aplicar identidade de marca (fonte, logos e cores do Cuidaflux) ao sistema via configuração de Branding

## Contexto de Negócio
- **Objetivo:** Intranet, Extranet, telas de login e e-mails exibirem nome, logos, cores e **fonte** do brand book do Cuidaflux (`Architecture-Registry/context/marca/`) por configuração. Hoje o contrato de Branding não tem fonte e a fonte está fixa no código.
- **Persona:** dono do produto e implantador; usuários da clínica e pacientes (veem a marca).
- **Jornada atual (verificada no código em 2026-11-26):**
  - Contrato `GET /api/Branding` com 8 campos mais os 4 de `completar-branding` (`logoIconUrl`, `logoIconDarkUrl`, `phone`, `address`); **sem** `fontFamily`/`fontUrl`.
  - Intranet: Outfit via `@import` do Google Fonts em `index.css:1` + `--font-outfit: Outfit, sans-serif` (`index.css:10`) e `Outfit` literal em ~35 pontos (gráficos Apex). Extranet: Satoshi (`src/css/satoshi.css`, `tailwind.config.ts:10`).
  - `appsettings.json` do backend traz a marca neutra ("Sistema Clínica"); os ativos neutros estão em `public/images/logo/` dos dois fronts.
  - Os templates de e-mail já têm cabeçalho com logo (`emailTemplates.ts:218,569,921`, usa `logoDarkUrl` com `absoluteUrl`); e-mail **não** carrega web fonts.
- **Jornada desejada:** trocar a marca = mudar a seção `Branding` + ativos estáticos; sem editar código por marca.
- **Dependências:** `PBI-20261124-definir-identidade-de-marca-clinica` (done: nome, paleta, fontes, logos) e `PBI-20261124-completar-branding-e-remover-nomes-de-unidade` (done: contrato com ícone/contato/contraste, código nos worktrees `feature/completar-branding`; este PBI parte desses branches).

## User Story
Como dono do produto, quero que a marca final (incluindo fonte) seja aplicada ao sistema por configuração, para que a plataforma tenha identidade própria sem alterar código a cada ajuste de marca.

## Critérios de Aceite
- **AC-1 (contrato de fonte)** — DADO o contrato de Branding, QUANDO acrescento `fontFamily` (texto e interface), `fontHeadingFamily` (títulos, opcional; vazio = usa `fontFamily`) e `fontUrl` (CSS da fonte), ENTÃO backend (`BrandingSettings`, `BrandingResponseDto`, `BrandingService`), Intranet (`config/branding.ts`) e Extranet (`lib/branding-resolve.ts`) os expõem e validam com a mesma spec: `fontFamily` e `fontHeadingFamily` com `^[A-Za-z0-9 ,-]{1,100}$` (senão vazio); `fontUrl` relativa (`/x`, nunca `//`) ou `https://`, sem espaço nem `\ " ' < >` (senão vazio); ausente nunca lança.
- **AC-2 (Intranet)** — DADO `fontFamily`/`fontUrl` válidos, QUANDO a Intranet carrega, ENTÃO `BrandingHead` injeta `<link rel="stylesheet" href=fontUrl>` e define `--font-brand` (`<fontFamily>, system-ui, sans-serif`) e `--font-brand-heading` (`<fontHeadingFamily ou fontFamily>, system-ui, sans-serif`); o tema usa `--font-brand`; os gráficos Apex leem a fonte de um helper único (`getBrandFont()`); nenhuma string literal `Outfit` sobra em `src/` além da definição de fallback em `index.css`.
- **AC-3 (Extranet)** — DADO os mesmos campos, QUANDO a Extranet renderiza, ENTÃO o `layout.tsx` (server component) injeta o `<link>` da fonte e define as variáveis CSS, e o `tailwind.config.ts` usa `var(--font-brand, Satoshi)`; Satoshi permanece só como fallback.
- **AC-4 (fallback seguro)** — DADO `fontFamily`/`fontUrl` ausentes ou `fontUrl` indisponível (404/offline), QUANDO a tela carrega, ENTÃO o layout não quebra e o texto renderiza na fonte atual do front (Outfit/Satoshi) ou na fonte de sistema.
- **AC-5 (e-mail)** — DADO os templates de e-mail, QUANDO a marca é configurada, ENTÃO o cabeçalho usa o logo do Branding com URL **absoluta** e em formato aceito por clientes de e-mail (**PNG**, não SVG), e nenhum template depende de web font (fonte de sistema).
- **AC-6 (marca do produto)** — DADO o brand book aprovado, QUANDO configuro o produto, ENTÃO o `appsettings.json` do backend traz `Branding` do Cuidaflux — `Name`/`ShortName` "Cuidaflux", `PrimaryColor` `#0F766E`, `SecondaryColor` `#BE3455`, `FontFamily` "Atkinson Hyperlegible Next", `FontHeadingFamily` "Bricolage Grotesque", `FontUrl` do Google Fonts do `visual.md`, logos horizontais PNG (claro/escuro, para app e e-mail), ícones SVG (claro/escuro) e favicon SVG apontando para `/images/brand/cuidaflux/…` — e os dois fronts têm esses arquivos em `public/images/brand/cuidaflux/` (copiados de `context/marca/assets/logo/`); os valores passam pelos validadores sem cair no padrão (a primária tem contraste 5,47:1 com branco).
- **AC-7 (integridade)** — DADO o `appsettings.json` e os ativos, QUANDO rodo os testes, ENTÃO todo arquivo referenciado por `Branding` (logos, ícones, favicon) existe em `public/` de cada front, e a seção `Branding` do `appsettings.json` desserializa e valida sem nenhum campo voltar ao padrão.
- **AC-8 (registry)** — DADO o contrato novo, QUANDO atualizo o registry, ENTÃO `architecture-registry.yaml` documenta os campos do contrato (os 8 originais, `logoIconUrl`, `logoIconDarkUrl`, `phone`, `address`, `fontFamily`, `fontHeadingFamily`, `fontUrl`, `GET /api/Branding` com 15 campos) e a marca do produto.

## Regras de Negócio
- `fontFamily`/`fontHeadingFamily`: 1–100 caracteres; letras, dígitos, espaço, vírgula e hífen. `fontUrl`: relativa (`/...`, nunca `//host`) ou `https://...`.
- Campo vazio/ausente nunca derruba a tela; cai no padrão atual de cada front.
- Fontes têm licença livre (SIL OFL, Google Fonts); `fontUrl` externa expõe o IP do usuário ao provedor da fonte — se o dono exigir LGPD estrita, hospedar a fonte própria (relativa), o que o contrato já suporta.
- Logos de e-mail: PNG com URL absoluta pública (e-mail não resolve caminho relativo nem renderiza SVG de forma confiável).
- Cores passam pelo validador de contraste existente (`completar-branding`); não duplicar.
- Contrato retrocompatível: clientes que ignoram campos novos continuam funcionando; os padrões neutros do código permanecem como fallback.
- **Fora de escopo (decisão registrada):** o **tema escuro azul** do brand book (fundo `#203246`, superfícies `#293E55`…) exige tokens de superfície configuráveis; a Intranet usa a escala `gray-*`. Fica para um PBI próprio. Aqui só entram nome, logos, cores primária/secundária e fonte.

## Cenários de Teste Unitário
| ID | AC | Cenário | Entrada | Saída esperada |
|----|----|---------|---------|----------------|
| UT-1 | AC-1 | `BrandingService` fontes válidas | `FontFamily "Inter, sans-serif"`, `FontUrl https://fonts.googleapis.com/css2?family=Inter&display=swap` | DTO com ambos |
| UT-2 | AC-1 | `fontFamily` inválido | `Inter;}body{x:1` | vazio |
| UT-3 | AC-1 | `fontUrl` inválido | `javascript:x`, `//evil.com/f.css`, `http://x` | vazio |
| UT-4 | AC-1 | Sem fonte | seção sem os campos | vazios, sem exceção |
| UT-5 | AC-1 | Paridade Intranet/Extranet | as mesmas 4 entradas | mesmos resultados do backend |
| UT-6 | AC-2 | Variáveis de fonte | `fontFamily "Inter"`, heading vazio | `--font-brand` e `--font-brand-heading` = `Inter, system-ui, sans-serif` |
| UT-7 | AC-2 | `BrandingHead` injeta link | `fontUrl` válida | 1 `<link rel=stylesheet>`; sem duplicar ao rerenderizar; sem `fontUrl` não injeta |
| UT-8 | AC-2 | Literais de fonte | `src/` da Intranet | 0 ocorrências de `Outfit` além do fallback em `index.css`; `getBrandFont()` devolve a fonte configurada |
| UT-9 | AC-3 | Extranet monta link e variáveis | branding com fonte | link e variáveis geradas; vazio não gera |
| UT-10 | AC-4 | Fonte ausente | sem `fontFamily` | `--font-brand` não definida; fonte atual |
| UT-11 | AC-5 | Logo do e-mail | `logoDarkUrl` PNG relativa e absoluta | `<img src>` absoluto `.png`; sem `@font-face` nos templates |
| UT-12 | AC-6/AC-7 | `appsettings.json` | seção `Branding` real | desserializa e `GetBranding()` devolve os mesmos valores (nenhum cai no padrão) |
| UT-13 | AC-7 | Ativos referenciados | caminhos de `Branding` | cada arquivo existe em `public/` da Intranet e da Extranet |

## Cenários de Teste Funcional / E2E
| ID | AC | Fluxo | Resultado observável |
|----|----|-------|----------------------|
| FT-1 | AC-6 | Subir API com o `appsettings.json` novo; abrir login e dashboard da Intranet (claro e escuro) | Nome, logos, cores e fonte do Cuidaflux; Network sem erro de fonte |
| FT-2 | AC-6 | Abrir login e home da Extranet | Mesma identidade |
| FT-3 | AC-5 | Abrir o preview de e-mail na Intranet | Cabeçalho com o logo PNG do Cuidaflux e fonte de sistema |
| FT-4 | AC-4 | Configurar `fontUrl` inexistente | Layout íntegro, fonte de fallback |
| FT-5 | AC-2 | Abrir os gráficos do dashboard | Rótulos e tooltips na fonte da marca |

## Requisitos Técnicos
- **Tipo de mudança:** feature + refactor leve; contrato novo (campos opcionais, compatível); sem migration.
- **Backend (`core-backend`):** `BrandingSettings.cs`, `BrandingResponseDto.cs`, `BrandingService.cs`, testes em `Branding/`, `appsettings.json` (seção `Branding`).
- **Intranet (`intranet-frontend`):** `config/branding.ts`, `hooks/useBranding.ts`, `components/common/BrandingHead.tsx`, `index.css`, gráficos Apex com `Outfit` literal, `constants/emailTemplates.ts` (verificação), `public/images/brand/cuidaflux/`.
- **Extranet (`extranet-frontend`):** `lib/branding-resolve.ts`, `app/layout.tsx`, `tailwind.config.ts`, `css/satoshi.css` (fallback), `public/images/brand/cuidaflux/`.
- **Registry (`architecture-registry`):** `architecture-registry.yaml` (contrato e marca do produto).
- **Requisitos não-funcionais:** `font-display: swap` (parâmetro `display=swap` da URL); contraste AA; texto alternativo nos logos; PNG 2× para e-mail.
- **Riscos técnicos:**
  - Mudar a fonte altera métricas de texto e pode quebrar layout de tabelas e gráficos — verificar nas telas principais.
  - Fonte externa: se houver CSP nos fronts (não há no repo; checar headers da Vercel), liberar `style-src`/`font-src` do provedor; a CSP do backend vale só para a API.
  - Dois temas e uma só cor primária (`#0F766E`): o tema escuro azul fica fora de escopo (decisão acima).
  - O e-mail usa `logoDarkUrl`: PNG absoluto exige URL pública configurada em produção.
  - O brand book tem o desenho final condicionado à consulta de INPI (ver `decisao-nome.md`).
  - O trabalho parte dos branches `feature/completar-branding` (sem push); a Extranet depende da base `desvincular-marca` ainda não publicada.

## Definition of Ready
- [x] Título no padrão [Verbo] + [Objeto] + [Contexto]
- [x] Contexto de negócio completo
- [x] ≥1 User Story com ACs em DADO/QUANDO/ENTÃO
- [x] Regras de negócio documentadas
- [x] Cenários de teste unitário e funcional definidos
- [x] Workspaces impactados identificados
- [x] Tipo de mudança e prioridade definidos

## Validação
**Status:** ✅ APPROVED — 2026-11-26
**Validador:** /validate-pbi
**Notas:** código inspecionado: o cabeçalho de e-mail com logo **já existe** (a versão anterior do PBI previa criá-lo, o que era incorreto); logos de e-mail precisam ser PNG; Outfit está em `index.css:1,10` e em ~35 pontos dos gráficos; a Extranet usa Satoshi via `tailwind.config.ts:10`. Ajustes: `fontHeadingFamily` (o brand book tem 2 famílias), integridade dos ativos referenciados, tema escuro azul fora de escopo, ordem de trabalho a partir dos branches de `completar-branding`.

## Tasks
> Status por task: ⬜ pendente · 🟦 em progresso · ✅ concluída
> Base: branches `feature/completar-branding` dos 3 repositórios (worktrees locais). Backend primeiro; fronts em paralelo; registry por último. Cada task embute "escrever o teste primeiro (RED)".

### core-backend (C# .NET 8 → coder-csharp)
- [x] **T-1** ✅ (AC-1, UT-1, UT-2, UT-3, UT-4) — `BrandingSettings`/`BrandingResponseDto`/`BrandingService`: `FontFamily`, `FontHeadingFamily`, `FontUrl` com a spec do AC-1 e testes em `Branding/BrandingServiceTests.cs` e `BrandingControllerTests.cs` (contrato camelCase).
- [x] **T-2** ✅ (AC-6, AC-7, UT-12) — `appsettings.json` com `Branding` do Cuidaflux (valores do AC-6; `SupportEmail`, `Phone` e `Address` ficam como estão/vazios: decisão do dono) e teste que lê o `appsettings.json` real, desserializa e confere que `GetBranding()` devolve os mesmos valores.

### extranet-frontend (Next.js + TS → coder-nextjs)
- [x] **T-3** ✅ (AC-1, UT-5) — `lib/branding-resolve.ts`: campos de fonte, validadores e `FALLBACK_BRANDING`; testes de paridade com o backend.
- [x] **T-4** ✅ (AC-3, AC-4, UT-9, UT-10) — `app/layout.tsx` injeta `<link>` e variáveis CSS; `tailwind.config.ts` usa `var(--font-brand, Satoshi)`; função pura `buildFontHead(branding)` testável; vazio não gera nada.
- [x] **T-5** ✅ (AC-6, AC-7, UT-13) — copiar os logos de `Architecture-Registry/context/marca/assets/logo/` para `public/images/brand/cuidaflux/` e teste de que cada caminho referenciado em `Branding` existe.

### intranet-frontend (React + Vite + TS → coder-react-ts)
- [x] **T-6** ✅ (AC-1, UT-5) — `config/branding.ts`: campos de fonte, validadores, `FALLBACK_BRANDING`; testes de paridade.
- [x] **T-7** ✅ (AC-2, AC-4, UT-6, UT-7, UT-8, UT-10) — `BrandingHead.tsx` injeta o `<link>` (sem duplicar) e define `--font-brand` e `--font-brand-heading`; `index.css` usa `--font-brand` com o Outfit como fallback; helper `getBrandFont()` e troca dos `Outfit` literais nos gráficos; teste de que não sobram literais.
- [x] **T-8** ✅ (AC-5, AC-6, AC-7, UT-11, UT-13) — copiar os logos para `public/images/brand/cuidaflux/`; teste dos ativos referenciados; teste de que o cabeçalho do e-mail usa o logo absoluto `.png` e que nenhum template tem `@font-face`/web font.

### architecture-registry
- [x] **T-9** ✅ (AC-8) — `architecture-registry.yaml`: seção `branding` com os 15 campos, `GET /api/Branding` com 15 campos e a marca do produto; `node scripts/check-brand.mjs . --exclude board,context,tokens.json` segue em 0.

### Verificação funcional
- [x] **T-10** ✅ (FT-1..FT-5) — com API e fronts locais: marca do Cuidaflux (claro e escuro), Extranet, preview de e-mail, `fontUrl` inexistente, gráficos; registrar o que foi e o que não foi exercitado.

### Rastreabilidade
| AC | Tasks | Cenários |
|----|-------|----------|
| AC-1 | T-1, T-3, T-6 | UT-1..UT-5 |
| AC-2 | T-7 | UT-6, UT-7, UT-8, FT-5 |
| AC-3 | T-4 | UT-9 |
| AC-4 | T-4, T-7 | UT-10, FT-4 |
| AC-5 | T-8 | UT-11, FT-3 |
| AC-6 | T-2, T-5, T-8 | UT-12, FT-1, FT-2 |
| AC-7 | T-2, T-5, T-8 | UT-12, UT-13 |
| AC-8 | T-9 | check-brand do registry |

**Cobertura:** 10 tasks; 8 ACs, todos com ≥ 1 task e ≥ 1 teste; UT-1..UT-13 e FT-1..FT-5 cobertos.

## Coordenação
- **Radar início (2026-11-26):** 0 PRs abertos nos 3 repositórios; nenhuma sessão ativa tocando o escopo; trabalho nos worktrees `_worktrees/{backend,intranet,extranet}-branding` (branch `feature/completar-branding`, commits locais, **sem push**); árvore principal da Intranet com alterações não commitadas de terceiros (não tocadas).
- **Acordos:** n/a
- **Radar fim (2026-11-26):** sem mudança — 0 PRs abertos, nenhuma sessão ativa tocando o escopo; commits locais nos 3 repositórios, sem push.

## Execução
**Concluído em:** 2026-11-26 (T-1..T-10). Código em commits **locais** nos worktrees `_worktrees/{backend,intranet,extranet}-branding` (branch `feature/completar-branding`, empilhado sobre o `completar-branding`), **sem push**.
**Arquivos:** backend — `BrandingSettings`, `BrandingResponseDto`, `BrandingService`, `appsettings.json` (Branding do Cuidaflux), testes (inclui `BrandingAppSettingsTests`); Intranet — `config/branding.ts`, `config/brandFont.ts`, `hooks/useBrandFont.ts`, `BrandingHead.tsx`, `index.css`, 17 gráficos, testes, `public/images/brand/cuidaflux/`; Extranet — `lib/branding-resolve.ts`, `lib/brand-font.ts`, `app/layout.tsx`, `tailwind.config.ts`, `css/style.css`, testes, `public/images/brand/cuidaflux/`; registry — `architecture-registry.yaml` (15 campos; seção `Branding`).
**Prova de Rastreabilidade:** AC-1..AC-8 por UT-1..UT-13 (PASS). Intranet: suíte completa 366/366, `tsc` limpo, `check:brand` 0. Extranet: 26/26, `check:brand` 0. Backend: 912/915 — as 3 falhas são `ScheduleControllerTests.*ClienteForbiddenIfNotOwner`, pré-existentes (confirmadas em `origin/master`); filtro Branding 93/93.
**Verificação funcional (T-10, com API de mentira devolvendo o Branding do Cuidaflux):** Intranet `/signin` — título "Entrar - Cuidaflux", logo PNG, `--font-brand` = Atkinson Hyperlegible Next, `h1` em Bricolage Grotesque (carregadas do Google Fonts), `--color-brand-500` `#0f766e`, `--color-brand-secondary` `#BE3455`, favicon SVG, tema claro e escuro OK; `fontUrl` inexistente → link não carrega, layout íntegro, sem overflow, fonte cai para `system-ui`. Extranet `/auth/sign-in` — título "Portal Cliente - Cuidaflux", logo, fontes e variáveis aplicadas. Não verificados: dashboard autenticado e gráficos, agenda, e-mail, migration em banco real.
**Quality Gate:** 3× APPROVE por repositório (0 P0/P1); P2 corrigidos.
**Achados / decisões:** (1) a **cor primária na Extranet não pinta a UI**: botões e links usam `primary: "#18194d"` do `tailwind.config.ts`; `primaryColor` só colore a barra de carregamento — fica para um PBI próprio (variável de tema); (2) o **tema escuro azul** do brand book segue fora de escopo (Intranet usa a escala `gray-*`); (3) a Intranet continua carregando o Outfit do Google Fonts como fallback; (4) logos de e-mail são PNG e precisam de URL pública absoluta em produção; (5) `SupportEmail` segue `suporte@example.com` (decisão do dono).
**Débitos:** os do `completar-branding` (TimeOnlyConverter, MapperProfile, `aria-invalid`); fonte externa sem CSP validada na Vercel; Extranet com `primary` estático; tema escuro azul; `next lint` da Extranet não roda neste ambiente.
**Coordenação:** radar início e fim sem sobreposição.

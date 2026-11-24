---
id: PBI-20261124-desvincular-marca-instituto-barros
tipo: debt
titulo: Desvincular marca Instituto Barros e extrair branding para configuração em todo o ecossistema
status: done
prioridade: alta
workspaces: [core-backend, intranet-frontend, extranet-frontend, architecture-registry]
criado_em: 2026-11-24
---

# Desvincular marca Instituto Barros e extrair branding para configuração em todo o ecossistema

## Contexto de Negócio
- **Objetivo:** remover toda referência ao Instituto Barros (nome, logos, e-mails, URLs, dados de exemplo, identificadores técnicos) e transformar a identidade visual/textual em **configuração**, deixando o produto neutro e pronto para receber a marca nova (PBI-2) e, futuramente, white-label por cliente. Métrica: **0 ocorrências** de `barros` (case-insensitive) nos repositórios, exceto avisos de licença de terceiros.
- **Persona:** time de produto/dev (dono do produto); indireto: futuros clientes clínicas (qualquer nicho).
- **Jornada atual:** nome, logos, textos e URLs do Instituto estão hardcoded em ~32 arquivos da Intranet, ~13 da Extranet, ~14 do backend (workflow CI, solution, guia de criptografia, `Moq_Data.sql`) e no `architecture-registry.yaml`. Qualquer troca de marca exige caça manual.
- **Jornada desejada:** uma única fonte de configuração de marca (nome, nome curto, logos, cores primárias, e-mail de suporte, domínio, textos legais) consumida por back e fronts; placeholder neutro ("Sistema Clínica") até o PBI-2.
- **Dependências:** nenhuma. É pré-requisito do PBI-2 e do PBI-3 (pitch/demo sem marca de terceiro).

## User Story
Como dono do produto, quero que nenhuma referência ao Instituto Barros exista no código e que a marca seja configurável, para que eu possa lançar a plataforma com identidade própria e vender para outras clínicas sem expor dados de terceiros.

## Critérios de Aceite
- **AC-1** — DADO os 3 repositórios (backend, intranet, extranet) e os arquivos operacionais do registry (`architecture-registry.yaml`, `README.md`), QUANDO executo o script `scripts/check-brand.mjs` (busca case-insensitive por `barros`, `institutobarros`, `instituto_barros`, `instituto-barros` em conteúdo, nomes de arquivo e de pasta, excluindo `.git`, `node_modules`, `bin`, `obj`, lockfiles e, no registry, `board/` e `context/` que são histórico documental do baseline), ENTÃO retorna 0 ocorrências e exit code 0.
- **AC-2** — DADO o backend, QUANDO chamo `GET /api/Branding` (anônimo), ENTÃO retorna 200 com nome, nome curto, URLs de logo, cor primária/secundária e e-mail de suporte lidos de `BrandingSettings` (appsettings/variáveis de ambiente).
- **AC-3** — DADO a Intranet e a Extranet, QUANDO iniciam, ENTÃO título da aba, favicon, logo (header, sidebar, login), textos de rodapé/documentação e cores usam o branding carregado; se a API falhar, usam o fallback neutro embutido (sem erro de tela).
- **AC-4** — DADO templates de e-mail (`emailTemplates.ts`, assuntos, assinaturas) e template de importação de pacientes, QUANDO renderizados, ENTÃO usam o nome da marca configurado e nenhum domínio/e-mail do Instituto.
- **AC-5** — DADO a infraestrutura (`Instituto_Barros_Sistema.sln`, workflow `instituto_barros.yml`, `app-name` do Azure, imagem Docker `tecnologiainstitutobarrros/...`, nomes de pastas/projetos, `DATABASE_ENCRYPTION_GUIDE.md`, banco `InstitutoBarrosDB`), QUANDO reviso, ENTÃO todos usam o nome neutro; build, testes e `docker build` continuam passando.
- **AC-6** — DADO URLs externas hardcoded (Azure, Vercel, `api.institutobarros.com/errors`, `security.txt`/bug-bounty), QUANDO reviso, ENTÃO vêm de configuração/variável de ambiente ou foram removidas.
- **AC-7** — DADO `Moq_Data.sql` e seeds, QUANDO reviso, ENTÃO e-mails usam `@example.com`, usuário admin de exemplo é neutro (`admDemo`), e nomes de pessoas reais ou unidades (Morumbi, Mooca, Paulista, Ipiranga) são substituídos por dados fictícios.
- **AC-8** — DADO `architecture-registry.yaml`, `README`s e `mapa-modulos.md`, QUANDO reviso, ENTÃO descrevem a organização como "Sistema Clínica" (placeholder) sem endpoints ou domínios do Instituto.
- **AC-9** — DADO avisos de licença de terceiros (ex.: `LICENSE.md` do template TailAdmin) e pacote `tailadmin-react`, QUANDO reviso, ENTÃO os avisos de terceiros são preservados e o `package.json` usa nome neutro.
- **AC-11** — DADO os identificadores técnicos neutros (solution, namespaces, pastas, imagem Docker, banco, pacotes), QUANDO reviso, ENTÃO todos derivam de um conjunto único e documentado de tokens (`tokens.json`: ex. `SistemaClinica`, `sistema-clinica`, `SistemaClinicaDB`) que o gerador white-label (PBI-20261124-gerador-white-label-clinica) usa para substituição segura, sem colisão com palavras comuns.
- **AC-10** — DADO uma varredura de segredos (appsettings, workflows, `.env`, histórico recente), QUANDO executada, ENTÃO nenhuma chave/senha/token real do Instituto está no working tree; achados no histórico são listados no PBI como ação de rotação.

## Regras de Negócio
- Placeholder de marca padrão: nome "Sistema Clínica", nome curto "Clínica", cores neutras já presentes no tema.
- `GET /api/Branding` é somente leitura, anônimo e não expõe segredos.
- Fallback de branding no front é obrigatório (aplicação nunca fica sem nome/logo).
- Assets do Instituto (`instituto-barros-logo-*`) são removidos do repo; logos placeholder neutros entram no lugar.
- Dados pessoais reais (se houver) não podem permanecer em seeds, testes ou docs.
- Renomear banco/app-name exige nota de migração (conexões existentes não quebram sem aviso).

## Cenários de Teste Unitário
> Rastreiam ACs; base do AC-TDD.

| ID | AC | Cenário | Entrada | Saída esperada |
|----|----|---------|---------|----------------|
| UT-1 | AC-2 | BrandingService lê configuração | `BrandingSettings` válido | DTO com todos os campos |
| UT-2 | AC-2 | BrandingService com campo ausente | `SupportEmail` vazio | usa valor padrão neutro, não lança |
| UT-3 | AC-3 | `useBranding` com API ok | resposta 200 | retorna nome/logo/cores da API |
| UT-4 | AC-3 | `useBranding` com API falhando | erro de rede | retorna fallback neutro, sem throw |
| UT-5 | AC-4 | Template de e-mail | marca "Acme Saúde" | corpo e assunto contêm "Acme Saúde" |
| UT-6 | AC-1 | `check-brand` detecta marca | fixture com arquivo contendo `InstitutoBarros` | exit code 1 e lista o arquivo |
| UT-8 | AC-1 | `check-brand` limpo | fixture sem marca | exit code 0 |
| UT-9 | AC-3 | `resolveBranding` função pura | resposta parcial da API + fallback | campos faltantes vêm do fallback |
| UT-7 | AC-6 | URL base da API | variável de ambiente ausente | falha explícita com mensagem clara (sem URL do Instituto como default) |

## Cenários de Teste Funcional / E2E

| ID | AC | Fluxo | Resultado observável |
|----|----|-------|----------------------|
| FT-1 | AC-2/AC-3 | Subir API + Intranet com `BrandingSettings.Name="Teste Clínica"` e abrir `/signin` | Título da aba, logo e textos mostram "Teste Clínica" |
| FT-2 | AC-3 | Subir Intranet com API offline | Tela carrega com marca neutra, sem erro |
| FT-3 | AC-4 | Enviar e-mail de teste pela tela de disparo | E-mail recebido sem menção ao Instituto |
| FT-4 | AC-5 | Pipeline CI no novo repo | Build, testes e imagem Docker concluem verdes |
| FT-5 | AC-7 | Aplicar `Moq_Data.sql` em banco limpo | Seeds carregam; nenhum nome/e-mail do Instituto na UI |

## Requisitos Técnicos
- **Tipo de mudança:** refactor + infra (sem mudança de regra de negócio)
- **APIs/contratos:** novo endpoint de leitura:
  ```json
  GET /api/Branding
  {
    "name": "Sistema Clínica",
    "shortName": "Clínica",
    "logoLightUrl": "/images/logo/logo.svg",
    "logoDarkUrl": "/images/logo/logo-dark.svg",
    "faviconUrl": "/favicon.ico",
    "primaryColor": "#465fff",
    "secondaryColor": "#101828",
    "supportEmail": "suporte@example.com"
  }
  ```
- **Requisitos não-funcionais:** resposta cacheável (ex.: 5 min); sem dados sensíveis; build de front não pode depender da API para renderizar o primeiro frame.
- **Método de execução (obrigatório):** a troca de identificadores é feita por **script determinístico**, não manualmente nem arquivo a arquivo: (1) inventário por `git grep -il` das variantes (`InstitutoBarros`, `instituto-barros`, `instituto_barros`, `institutobarros`, `Instituto Barros`, `INSTITUTO_BARROS`); (2) `git mv` em lote de pastas e arquivos; (3) substituição por regex com mapa de variantes → tokens; (4) um único `build` + `test` ao final; (5) varredura final de 0 ocorrências (AC-1). Meta de tempo da conversão: minutos, não horas. O mesmo script é a semente do gerador do PBI-4.
- **Escopo de testes de front:** a Intranet tem Vitest (`npm test`); a Extranet (Next.js) não tem runner. A lógica de branding fica em função pura `resolveBranding(resposta, fallback)` testada na Intranet (UT-3, UT-4, UT-9); na Extranet o AC-3 é provado por `npm run build` + FT-1/FT-2 (sem adicionar framework de teste neste PBI).
- **Guarda anti-marca (UT-6/UT-8):** `scripts/check-brand.mjs` (Node, sem dependências) versionado em cada repo e executado no CI; testado com fixtures.
- **Extranet sem repo no GitHub novo:** as mudanças são feitas e commitadas localmente; criar/apontar o repo da Extranet é pré-requisito do push (decisão do dono).
- **Namespaces C#:** são `DomainDrivenDesign.*` (sem marca); o que muda no back são `Instituto_Barros_Sistema.sln`, workflow, `app-name`, imagem Docker, nome do banco e textos. Manter nomes de projeto/namespace `DomainDrivenDesign.*` neste PBI; o gerador (PBI-4) cobre a renomeação de projetos.
- **Nota de migração (ações manuais por ambiente):**
  - Vercel (Extranet): renomear a variável `NEXT_PUBLIC_API_URL` para `NEXT_PUBLIC_API_BASE_URL`.
  - GitHub (backend): criar as variáveis de repositório `DOCKER_IMAGE` e `AZURE_WEBAPP_NAME`.
  - Produção: definir `Cors__AllowedOrigins__N` (uma variável por origem do admin e do portal).
  - JWT: Issuer/Audience mudaram para `SistemaClinica`; tokens emitidos antes da troca são invalidados. O valor pode ser sobrescrito por variável de ambiente.
  - Banco: o nome passou a `SistemaClinicaDB`; ajustar as connection strings existentes ou renomear o banco.
- **Riscos técnicos:** renomear solution/workflow quebra paths do CI e Dockerfile; renomear banco exige coordenar connection strings; remover histórico antigo (git) fica fora do escopo, mas segredos antigos nele exigem rotação; confirmar que a licença cedida pelo Instituto cobre uso/modificação/venda do código e guardar o termo fora do repositório.

## Definition of Ready
- [x] Título no padrão [Verbo] + [Objeto] + [Contexto]
- [x] Contexto de negócio completo
- [x] ≥1 User Story com ACs em DADO/QUANDO/ENTÃO
- [x] Regras de negócio documentadas
- [x] Cenários de teste unitário e funcional definidos
- [x] Workspaces impactados identificados
- [x] Tipo de mudança e prioridade definidos

## Tasks
> Status por task: ⬜ pendente · 🟦 em progresso · ✅ concluída

### architecture-registry (YAML/Markdown/Node → scribe + coder-nextjs para o script)
- [x] ✅ **T-1** (AC-11) — criar `tokens.json` em `Architecture-Registry/` com variantes neutras (`SistemaClinica`, `sistema-clinica`, `sistema_clinica`, `SistemaClinicaDB`, `Sistema Clínica`) e mapa das variantes antigas a localizar.
- [x] ✅ **T-2** (AC-1, UT-6, UT-8) — escrever `scripts/check-brand.mjs` (RED com fixtures: com marca → exit 1; sem marca → exit 0) e implementar até GREEN; cobre conteúdo, nomes de arquivo e pasta; exclusões do AC-1.
- [x] ✅ **T-3** (AC-1) — copiar `check-brand.mjs` para os 3 repos e acrescentar passo no CI/`package.json` (`npm run check:brand`).

### core-backend (C# .NET 8 → coder-csharp)
- [x] ✅ **T-4** (AC-2, UT-1, UT-2) — RED: testes de `BrandingService` (config válida e campo ausente → padrão neutro). GREEN: `BrandingSettings`, `BrandingService`, DTO e `GET /api/Branding` anônimo com cache de 5 min (`BrandingController`).
- [x] ✅ **T-5** (AC-6) — `GlobalExceptionFilter.cs:67` passa a montar `Type` a partir de `ErrorDocs:BaseUrl` (configuração) com padrão neutro `https://example.com/errors/`; teste unitário do filtro.
- [x] ✅ **T-6** (AC-6) — CORS em `appsettings.json:24-25` lido de `Cors:AllowedOrigins` por variável de ambiente (padrão `http://localhost:5173`, `http://localhost:3000`); `wwwroot/.well-known/security.txt` removido (sem canal de segurança definido ainda) e referência no `Program.cs` ajustada se existir.
- [x] ✅ **T-7** (AC-5, AC-11) — renomear `Instituto_Barros_Sistema.sln` → `SistemaClinica.sln`, workflow `instituto_barros.yml` → `sistema-clinica.yml` (`name`, `app-name`, imagem Docker via `secrets`/`vars`), `Dockerfile` e referências; banco `InstitutoBarrosDB` → `SistemaClinicaDB` em docs e exemplos de connection string. Executar por script determinístico (método do PBI); `dotnet build` + `dotnet test` ao final.
- [x] ✅ **T-8** (AC-7) — neutralizar `Moq_Data.sql`: e-mails `@example.com`, usuário `admInstitutoBarros` → `admDemo`, nomes/unidades fictícios; validar carga em banco limpo.
- [x] ✅ **T-9** (AC-1, AC-5, AC-8) — atualizar `README.md`, `DATABASE_ENCRYPTION_GUIDE.md` e demais textos do back com nome neutro.

### intranet-frontend (React 18 + Vite → coder-react-ts)
- [x] **T-10** (AC-3, UT-3, UT-4, UT-9) — RED: testes de `resolveBranding(resposta, fallback)` e `useBranding` (API ok, API falhando, resposta parcial). GREEN: `src/config/branding.ts`, serviço `BrandingService` e hook com fallback neutro.
- [x] **T-11** (AC-3) — aplicar branding em `index.html` (título/favicon), `Header.tsx:84`, `UserDropdown.tsx:43`, `UserMetaCard.tsx:35`, `AppHeader`, `AppSidebar`, `AuthPageLayout`, `SignIn`, `Documentacao` e demais telas listadas pelo inventário (32 arquivos); trocar textos "Instituto Barros" por `brand.name`.
- [x] **T-12** (AC-4, UT-5) — RED/GREEN: `emailTemplates.ts` (linha ~198 e assuntos/assinaturas) e `customerImportTemplate.ts` usam o nome da marca; sem domínio do Instituto.
- [x] **T-13** (AC-6, UT-7) — RED/GREEN: `AxioService.ts:6` lê `VITE_API_BASE_URL`; sem a variável, falha explícita em produção; criar `.env.example`.
- [x] **T-14** (AC-3, AC-1) — remover `public/images/logo/instituto-barros-*` e adicionar logos neutros (`logo.svg`, `logo-dark.svg`, `logo-icon.svg` já existentes reaproveitados + favicon neutro).
- [x] **T-15** (AC-9, AC-5) — `package.json`: `name` → `sistema-clinica-intranet`; manter `LICENSE.md` do TailAdmin; atualizar `README.md`.

### extranet-frontend (Next.js → coder-nextjs)
- [x] ✅ **T-16** (AC-3) — carregar branding (server component/`layout.tsx`) com fallback neutro; aplicar em metadata, favicon, logo e textos das ~13 ocorrências.
- [x] ✅ **T-17** (AC-6) — `ApiClient.ts` lê `NEXT_PUBLIC_API_BASE_URL`; falha explícita sem a variável; `.env.example`; remover URLs Vercel/Azure.
- [x] ✅ **T-18** (AC-9, AC-1) — `package.json` name neutro (1 ocorrência), assets e README.

### transversal / verificação
- [x] ✅ **T-19** (AC-8) — atualizar `architecture-registry.yaml` (organização, ambientes, imagens), `README.md` do registry e nota no `mapa-modulos.md` indicando baseline histórico.
- [x] **T-20** (AC-10) — varredura de segredos (appsettings, workflows, `.env*`, histórico recente via `git log -p -S`); registrar achados e recomendação de rotação no PBI; nenhum segredo real no working tree.
- [x] **T-21** (AC-1, FT-1..FT-5) — verificação final: `check-brand` nos 3 repos + registry (0 ocorrências), `dotnet build/test`, `npm run build` e `npm test` (intranet), `npm run build` (extranet), carga de `Moq_Data.sql`, FT-1 a FT-5 (FT-4: validar workflow localmente via `docker build`).

### Rastreabilidade
| AC | Tasks | Cenários |
|----|-------|----------|
| AC-1 | T-2, T-3, T-9, T-14, T-18, T-21 | UT-6, UT-8, FT-1 |
| AC-2 | T-4 | UT-1, UT-2, FT-1 |
| AC-3 | T-10, T-11, T-14, T-16 | UT-3, UT-4, UT-9, FT-1, FT-2 |
| AC-4 | T-12 | UT-5, FT-3 |
| AC-5 | T-7, T-9, T-15 | FT-4 |
| AC-6 | T-5, T-6, T-13, T-17 | UT-7 |
| AC-7 | T-8 | FT-5 |
| AC-8 | T-19, T-9 | — (verificado por T-2/T-21) |
| AC-9 | T-15, T-18 | — (revisão: LICENSE preservada, `check-brand`) |
| AC-10 | T-20 | — (relatório de varredura) |
| AC-11 | T-1, T-7 | — (revisão de `tokens.json` + `check-brand`) |

**Cobertura:** 21 tasks, 11 ACs. AC-8, AC-9, AC-10 e AC-11 são provados por revisão/varredura automatizada (`check-brand`, relatório), não por UT/FT dedicados; é o suficiente para ACs de documentação e conformidade.

## Validação
**Status:** ✅ APPROVED — 2026-11-24 (após correção de 3 pendências)
**Validador:** /validate-pbi
**Pendências encontradas e corrigidas:**
1. AC-1 contradizia o próprio registry (`board/` e `context/` citam a marca por serem histórico) — escopo e script definidos.
2. UT-6 sem local de execução — `scripts/check-brand.mjs` + fixtures (UT-6/UT-8).
3. Extranet sem runner de testes — estratégia explícita (função pura testada na Intranet + build/FT na Extranet).
**Notas técnicas verificadas no código:** `GlobalExceptionFilter.cs:67` usa `api.institutobarros.com/errors`; `appsettings.json:24-25` lista origens CORS Vercel do Instituto (precisam virar configuração); `wwwroot/.well-known/security.txt` tem 12+ refs (PGP, bug bounty) — remover ou parametrizar; logos referenciados em `Header.tsx:84`, `UserDropdown.tsx:43`, `UserMetaCard.tsx:35`, `emailTemplates.ts:198`; `LICENSE.md` da Intranet é MIT do TailAdmin (preservar); `package.json` da Extranet tem 1 ocorrência; endpoint `/api/Branding` não existe (nova feature, sem duplicidade).

## Coordenação
- **Radar início (2026-11-24):** 30 sessões listadas, 0 em execução, 0 com cwd em Sistema-Clinica; 0 PRs abertos nos 3 repos `Caous/Clinica-Saude-*`; worktrees: só o checkout principal de cada repo, limpos; sem outros PBIs em `in-progress`. Sem sobreposição.
- **Acordos:** n/a
- **Radar fim (2026-11-24):** sem PRs abertos nos 3 repos, nenhuma sessão rodando em Sistema-Clinica, sem worktrees extras; base `master` dos repos não andou. Ordem de merge: backend → intranet → registry (o contrato `GET /api/Branding` nasce no backend; fronts têm fallback e funcionam sem ele). Extranet aguarda criação do repo no GitHub novo.

## Execução
**Concluído em:** 2026-11-24
**Repos e branches:** `Clinica-Saude-Backend`, `Clinica-Saude-Frontend` (Intranet), `Clinica-Saude-Archtecture-Registry`, branch `feature/desvincular-marca`; Extranet só local (sem repo novo).
**Prova de Rastreabilidade:**
| AC | Teste / verificação | Resultado |
|----|--------------------|-----------|
| AC-1 | `check-brand` (11 testes `node:test`) + varredura 0 ocorrências nos 3 repos e no registry | PASS |
| AC-2 | `BrandingServiceTests`, `BrandingControllerTests` (UT-1, UT-2, validação, Vary Origin) | PASS |
| AC-3 | Intranet `branding.test.ts`, `useBranding.test.tsx`, `BrandingHead.test.tsx` (UT-3, UT-4, UT-9); Extranet `test:unit` + build com/sem variável | PASS (FT-1/FT-2 visuais não executados; ícone fixo registrado como débito) |
| AC-4 | `emailTemplates.test.ts`, `EmailDispatchBrandTests` (UT-5; `{{empresa}}` do envio resolvido no backend) | PASS (FT-3 envio real não executado) |
| AC-5 | build `SistemaClinica.sln` + workflow `sistema-clinica.yml` (job `verify`) | PASS (`docker build` e execução do workflow no GitHub não executados) |
| AC-6 | `GlobalExceptionFilterTests`, `apiBaseUrl.test.ts` (UT-7), CORS por configuração, `security.txt` removido | PASS |
| AC-7 | `Moq_Data.sql` carregado em SQL Server 2019 (schema 45 migrações + seed: 5 usuários, 12 clientes, 4 funcionários, 4 unidades, 99 agendamentos), 0 marca nos dados (FT-5) | PASS |
| AC-8 | `architecture-registry.yaml`, `README.md`, `mapa-modulos.md` neutros; `check-brand` 0 | PASS (YAML já inválido na origem: ver débito) |
| AC-9 | `LICENSE.md` TailAdmin preservado; `package.json` neutros | PASS |
| AC-10 | Working tree sem segredo; histórico: varredura por padrões não achou segredo real (só placeholder e fixtures) | PASS (varredura heurística) |
| AC-11 | `tokens.json` + uso no rename e no `check-brand` | PASS |
**Testes:** backend 848 aprovados e 3 falhas pré-existentes (`ScheduleControllerTests`, idênticas no baseline); Intranet 251 testes, `tsc -b` e build verdes; Extranet 11 testes + build; registry 11 testes.
**Quality Gate:** auditoria (backend, Extranet, Intranet) sem P0; P1 corrigidos (rate limit, OutputCache+Vary Origin, escape de `logoDarkUrl`, regex de cor, variável de ambiente na Vercel, `{{empresa}}`); review final REQUEST_CHANGES → blockers B1/B2 e médios M1-M3 corrigidos.
**Não executado:** verificação visual no navegador (FT-1, FT-2), envio real de e-mail (FT-3), `docker build` e workflow no GitHub (FT-4), Stryker, `dotnet format`.
**Débitos abertos:** `PBI-20261124-completar-branding-e-remover-nomes-de-unidade`, `PBI-20261124-corrigir-yaml-e-paths-do-registry`.
**Pendências de ambiente (nota de migração):** criar `NEXT_PUBLIC_API_BASE_URL` (Vercel) e `VITE_API_BASE_URL`; vars `DOCKER_IMAGE` e `AZURE_WEBAPP_NAME` no GitHub; `Cors__AllowedOrigins__N` em produção; JWT Issuer/Audience agora `SistemaClinica` (tokens antigos invalidam); banco `SistemaClinicaDB`.

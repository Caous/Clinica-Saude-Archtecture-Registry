---
id: PBI-20261124-completar-branding-e-remover-nomes-de-unidade
tipo: debt
titulo: Completar branding configurável e remover nomes de unidades hardcoded da Intranet
status: done
prioridade: media
workspaces: [core-backend, intranet-frontend, extranet-frontend]
criado_em: 2026-11-24
revisado_em: 2026-11-26
---

# Completar branding configurável e remover nomes de unidades hardcoded da Intranet

## Contexto de Negócio
- **Objetivo:** fechar as lacunas de white-label deixadas pelo PBI-20261124-desvincular-marca-instituto-barros (achados P2/P3 da auditoria): ícone, cor secundária, cores fixas em gráficos, rodapé de e-mail e lógica atrelada a nomes reais de unidades. É pré-requisito de `PBI-20261124-aplicar-identidade-de-marca-ao-sistema`.
- **Persona:** dono do produto e implantador (gerador white-label).
- **Jornada atual (verificada no código em 2026-11-26):**
  - Ícone fixo `/images/logo/logo-icon.svg` em `UserMetaCard.tsx:37`, `UserDropdown.tsx:45` e `AppSidebar.tsx:491` (Intranet). Extranet não tem consumidor de ícone.
  - `--color-brand-secondary` é gravada por `BrandingHead.tsx:7` mas **ninguém a consome**.
  - Azul fixo `#465FFF`/`#9CB9FF` em `BarChartOne.tsx:6`, `LineChartOne.tsx:11`, `MonthlyTarget.tsx:11,50`, `StatisticsChart.tsx:30`, `CountryMap.tsx:17,27,36,41,47,71,75` e no controle deslizante de `index.css:525,531`. O anel de foco e os demais usos já passam por `ring-brand-*`/`--color-brand-*` (dinâmicos); **não** são alvo.
  - `emailTemplates.ts` (Intranet) tem em 3 templates (linhas ~248-249, ~627-628, ~1003-1004) o telefone fixo `(11) 1234-5678` e o endereço placeholder "Endereço da clínica, Cidade - Estado". O backend (`EmailDispatchService.cs:69,225`) só substitui `{{empresa}}`.
  - `Calendar.tsx:1065-1100` decide o horário da agenda por nome de filial (`MARKETPLACE`, `PAULISTA`, `MOOCA`, `IPIRANGA`, `PAZ`, `ALPHAVILLE`) com `includes`.
  - `BranchOfficeModel`/`BranchOfficeResponseDto` não têm horário de funcionamento; nomes dos campos em português (`NomeFilial`, `IdGerenteFilial`).
  - Cada front tem `scripts/check-brand.mjs` (`npm run check:brand`).
- **Jornada desejada:** tudo vem do contrato `GET /api/Branding` e dos dados da filial; nenhuma lógica por nome de unidade.
- **Dependências:** `PBI-20261124-desvincular-marca-instituto-barros` (done).

## User Story
Como implantador, quero que ícone, cores, rodapé de e-mail e horários venham de configuração ou dos dados da filial, para que cada cliente white-label tenha identidade e regras próprias sem alterar código.

## Critérios de Aceite
- **AC-1 (ícone)** — DADO o contrato de Branding, QUANDO acrescento `logoIconUrl` e `logoIconDarkUrl` (opcionais), ENTÃO o backend (`BrandingSettings`, `BrandingResponseDto`, `BrandingService`, mesma regra de URL: relativa `/x` ou `https`, sem `"'<>`), a Intranet (`config/branding.ts`) e a Extranet (`lib/branding.ts`, `lib/branding-resolve.ts`) os expõem e validam com a mesma spec; vazio ou inválido cai em `/images/logo/logo-icon.svg` (claro) e, para o escuro, em `logoIconUrl`; e `UserDropdown`, `UserMetaCard` e a sidebar recolhida da Intranet usam o ícone do tema ativo. A Extranet apenas resolve/valida os campos (sem consumidor visual nesta entrega).
- **AC-2 (cores)** — DADO `primaryColor` e `secondaryColor`, QUANDO aplicadas, ENTÃO: (a) as cores fixas listadas na Jornada atual passam a ler a cor configurada (`primaryColor` nas séries principais, no mapa e no slider; `secondaryColor` na segunda série de `LineChartOne` e `StatisticsChart`), por um helper único (ex.: `getBrandColors()`); (b) uma `primaryColor` cujo contraste com branco seja **< 4,5:1** (WCAG AA) é **rejeitada** — o backend e os dois fronts voltam ao padrão `#465fff` (4,84:1) e o backend registra aviso em log; (c) `--color-brand-secondary` passa a ter consumidor (segunda série dos gráficos).
- **AC-3 (rodapé de e-mail)** — DADO `phone` e `address` no Branding (opcionais; backend, Intranet e Extranet com a mesma validação), QUANDO a Intranet monta os templates de `emailTemplates.ts`, ENTÃO o telefone e o endereço do rodapé vêm do Branding; sem configuração, as linhas correspondentes são **omitidas** (nunca o placeholder nem o telefone fictício).
- **AC-4 (horário da filial)** — DADO a entidade de filial, QUANDO ela ganha `HorarioAbertura` e `HorarioFechamento` (`TimeOnly?`, JSON `horarioAbertura`/`horarioFechamento` em `HH:mm:ss`; nomes em português, como `NomeFilial`), ENTÃO a API de `BranchOffice` (create/update/get) os persiste e devolve (migration), valida abertura < fechamento quando ambos informados, e `Calendar.tsx` usa esses valores (mín./máx. do calendário) sem nenhum `if` por nome de unidade; filial sem horário usa 08:00–22:00; sem filial selecionada usa o menor `horarioAbertura` e o maior `horarioFechamento` entre as filiais (padrão 06:00–23:00 se nenhuma tiver horário).
- **AC-5 (guarda de nomes)** — DADO a lista de nomes reais de unidades (PAULISTA, MOOCA, IPIRANGA, PAZ, ALPHAVILLE, MARKETPLACE), QUANDO rodo `npm run check:brand` da Intranet estendido, ENTÃO há **0** ocorrências em `src/` da Intranet (padrões montados por partes para o script não se auto-detectar; a migration de dados do backend fica fora desta varredura).

## Regras de Negócio
- Horário padrão de filial: 08:00–22:00 quando não configurado; para a agenda sem filial: menor abertura e maior fechamento configurados, padrão 06:00–23:00.
- `logoIconUrl`, `logoIconDarkUrl`, `phone` e `address` seguem as validações do contrato: URL relativa ou https sem `"'<>`; `phone`/`address` até 200 caracteres, sem `<>` (texto escapado no HTML do e-mail com `escapeHtml`).
- Contraste: a `primaryColor` precisa de razão ≥ 4,5:1 com branco; qualquer cor com menos que isso é rejeitada e vira o padrão. `secondaryColor` não tem exigência de contraste (só hex válido).
- A **data migration** em produção dá horário às filiais existentes, sem perda do comportamento atual: nome contendo MARKETPLACE → 06:00–23:00; IPIRANGA → 07:00–22:00; as demais → 08:00–22:00. A migration só faz `UPDATE` por nome; não depende de código da Intranet.
- Os três validadores (backend C#, Intranet TS, Extranet TS) mantêm a mesma spec de campos; mudança em um exige a mesma nos outros.

## Cenários de Teste Unitário
| ID | AC | Cenário | Entrada | Saída esperada |
|----|----|---------|---------|----------------|
| UT-1 | AC-1 | `BrandingService` (C#) com `logoIconUrl` | `/icon.svg` / null / `javascript:x` / `//host/x` | valor / padrão / padrão / padrão |
| UT-2 | AC-1 | `resolveBranding` Intranet e Extranet | mesmas 4 entradas | mesmos resultados do backend (paridade) |
| UT-3 | AC-1 | Ícone por tema | tema escuro com `logoIconDarkUrl` vazio | usa `logoIconUrl` |
| UT-4 | AC-2 | Contraste da primária (backend e fronts) | `#ffff00` (1,07:1) e `#465fff` (4,84:1) | rejeita → `#465fff` e log de aviso / aceita |
| UT-5 | AC-2 | Helper `getBrandColors()` | branding com primária e secundária | cores aplicadas nas séries; secundária na 2ª série |
| UT-6 | AC-2 | Slider (`index.css`) | variável de marca definida | usa `var(--color-brand-500)`, sem `#465fff` literal |
| UT-7 | AC-3 | Template de e-mail sem telefone | `phone` vazio | rodapé sem linha de telefone e sem `(11) 1234-5678` |
| UT-8 | AC-3 | Template com `phone`/`address` | valores válidos | linhas presentes e escapadas (`<` vira `&lt;`) |
| UT-9 | AC-3 | `phone`/`address` inválidos | `<script>`, > 200 caracteres | ignorados (vazios) |
| UT-10 | AC-4 | Horário da filial no calendário | `06:00:00`/`23:00:00` | `slotMinTime`/`slotMaxTime` = 06–23 |
| UT-11 | AC-4 | Filial sem horário | campos nulos | 08:00–22:00 |
| UT-12 | AC-4 | Sem filial selecionada | filiais com horários variados | menor abertura e maior fechamento; padrão 06–23 sem dados |
| UT-13 | AC-4 | Validador de filial (C#) | abertura 22:00, fechamento 08:00 | erro de validação |
| UT-14 | AC-4 | Mapper e DTO (C#) | filial com horário | `HorarioAbertura`/`HorarioFechamento` ida e volta |
| UT-15 | AC-5 | `check-brand` estendido | arquivo com `"PAULISTA"` / sem | exit 1 apontando o arquivo / exit 0 |

## Cenários de Teste Funcional / E2E
| ID | AC | Fluxo | Resultado observável |
|----|----|-------|----------------------|
| FT-1 | AC-1/AC-2 | Subir API com `Branding__*` customizado (ícone, cores) e abrir a Intranet | Ícone no avatar/sidebar, gráficos e slider na cor da marca, claro e escuro |
| FT-2 | AC-4 | Abrir a agenda de filial com horário 06–23 e outra sem horário | Grade 06–23 e 08–22, sem referência a nome de unidade |
| FT-3 | AC-3 | Abrir o preview de e-mail da Intranet com e sem `phone`/`address` | Rodapé com os dados / sem as linhas |
| FT-4 | AC-4 | Aplicar a migration em banco com filiais de teste (nomes MARKETPLACE, IPIRANGA, outra) | Horários 06–23, 07–22 e 08–22 |
| FT-5 | AC-5 | `npm run check:brand` na Intranet | exit 0 |

## Requisitos Técnicos
- **Tipo de mudança:** débito técnico com refactor e contrato novo (campos opcionais, retrocompatível). Migration de schema + data migration em `BranchOffice`.
- **Backend (`core-backend`):** `BrandingSettings.cs`, `BrandingResponseDto.cs`, `BrandingService.cs` (+ `Branding/BrandingServiceTests.cs`, `BrandingControllerTests.cs`), `BranchOfficeModel.cs`, `BranchOfficeResponseDto.cs` e request DTO, mapper EF em `Application/Mapper`, `MapperProfile.cs`, validador de filial, migration em `Infrastructure.Data/Migrations`. Seguir os padrões do registry (repositório sem `SaveChangesAsync`; mappers EF em Application).
- **Intranet (`intranet-frontend`):** `config/branding.ts`, `hooks/useBranding.ts`, `components/common/BrandingHead.tsx`, `UserDropdown.tsx`, `UserMetaCard.tsx`, `AppSidebar.tsx`, gráficos listados, `index.css`, `constants/emailTemplates.ts`, `pages/Calendar.tsx`, `scripts/check-brand.mjs`; serviço/tipos de filial e formulário de filial (BranchOfficeGrid) para editar horários.
- **Extranet (`extranet-frontend`):** `lib/branding.ts`, `lib/branding-resolve.ts` (+ testes).
- **Requisitos não-funcionais:** contraste WCAG AA; compatibilidade retroativa dos clientes do contrato; escape de HTML no e-mail.
- **Riscos técnicos:** migration em produção (backup antes; `UPDATE` por nome pode não casar com nomes reais — o padrão 08–22 cobre); três validadores a manter alinhados; ordem de deploy (API antes dos fronts: campo ausente cai no padrão); `slotMinTime` dinâmico exige recriar o calendário; fixtures de teste não devem conter nomes reais de unidades (o guarda quebraria).

## Definition of Ready
- [x] Título no padrão [Verbo] + [Objeto] + [Contexto]
- [x] Contexto de negócio completo
- [x] ≥1 User Story com ACs em DADO/QUANDO/ENTÃO
- [x] Regras de negócio documentadas
- [x] Cenários de teste unitário e funcional definidos
- [x] Workspaces impactados identificados
- [x] Tipo de mudança e prioridade definidos

## Validação
**Status:** ❌ CHANGES_REQUESTED — 2026-11-26 (versão anterior do PBI), corrigido nesta revisão.
**Pendências encontradas no código e tratadas acima:**
1. "Anel de foco" e "slider" como azul fixo: o anel de foco já é dinâmico (`ring-brand-*`); o azul fixo real está em 5 componentes de gráfico e no `index.css:525,531`. Lista concreta incluída.
2. AC-2 ambíguo ("rejeitada ou ajustada"): fixada a regra (rejeita e volta ao padrão, com log) e o consumidor da secundária (2ª série dos gráficos).
3. Variante escura do ícone indefinida: criado `logoIconDarkUrl` opcional.
4. AC-3 sem local: o rodapé fixo está em `emailTemplates.ts` (Intranet), com telefone fictício; o backend não tem rodapé.
5. Extranet sem consumidor de ícone: definido como contrato e validação apenas.
6. AC-4 sem formato nem nomes: `TimeOnly?`, JSON `horarioAbertura`/`horarioFechamento` (português, como `NomeFilial`), validação abertura < fechamento, regra para "sem filial" e data migration por nome.
7. AC-5 sem local da guarda: `scripts/check-brand.mjs` de cada front; padrão por partes; migration fora da varredura.
8. Faltavam testes de backend (UT-1, UT-13, UT-14), de AC-3 (UT-7..9), do slider (UT-6) e FT para e-mail e migration.

**Re-validação:** ✅ APPROVED — 2026-11-26
**Validador:** /validate-pbi
**Notas:** código inspecionado (Intranet, Extranet, backend). Contas: `#465fff` sobre branco = 4,84:1 (aceita); `#ffff00` = 1,07:1 (rejeitada). Cada AC tem teste (UT-1..UT-15, FT-1..FT-5). Nomes de campo de filial em português (`horarioAbertura`/`horarioFechamento`) seguem `NomeFilial` — decisão registrada, reversível antes da implementação. Dependência declarada para `PBI-20261124-aplicar-identidade-de-marca-ao-sistema`.

## Tasks
> Status por task: ⬜ pendente · 🟦 em progresso · ✅ concluída
> Ordem: backend primeiro (contrato e dados), depois Extranet e Intranet (podem rodar em paralelo), por fim verificação funcional. Cada task embute "escrever o teste primeiro (RED)".

### core-backend (C# .NET 8 → coder-csharp)
- [x] **T-1** ✅ (AC-1, UT-1) — `BrandingSettings`: `LogoIconUrl` (padrão `/images/logo/logo-icon.svg`) e `LogoIconDarkUrl` (opcional); `BrandingResponseDto` (`logoIconUrl`, `logoIconDarkUrl`); `BrandingService` valida com a regra de URL existente. Testes em `Branding/BrandingServiceTests.cs` (valor, null, `javascript:x`, `//host/x`) e `BrandingControllerTests.cs` (contrato).
- [x] **T-2** ✅ (AC-3, UT-9) — `Phone` e `Address` em `BrandingSettings`/DTO (opcionais, até 200 caracteres, sem `<>`; inválido ou vazio vira vazio). Testes de validação.
- [x] **T-3** ✅ (AC-2, UT-4) — `BrandingService`: `PrimaryColor` com contraste < 4,5:1 contra branco é rejeitada, volta ao padrão `#465fff` e registra aviso (`ILogger`); `SecondaryColor` só valida hex. Testes: `#ffff00` rejeitada, `#465fff` aceita, fronteira 4,5.
- [x] **T-4** ✅ (AC-4, UT-13, UT-14) — `BranchOfficeModel`: `HorarioAbertura`/`HorarioFechamento` (`TimeOnly?`); request/response DTO, mapper EF (Application/Mapper), `MapperProfile`, validador (abertura < fechamento quando ambos informados). Testes de mapper ida e volta e do validador.
- [x] **T-5** ✅ (AC-4, FT-4) — Migration em `Infrastructure.Data/Migrations` com as 2 colunas nuláveis e data migration `UPDATE` por nome (MARKETPLACE 06:00–23:00; IPIRANGA 07:00–22:00; demais 08:00–22:00); validar com `dotnet ef migrations script` (sem DROP de outras tabelas) e teste/integration com banco de teste (FT-4). Rodar `dotnet` com `-p:OutputPath=bin/TestRun/` se a API local estiver rodando.

### extranet-frontend (Next.js + TS → coder-nextjs)
- [x] **T-6** ✅ (AC-1, AC-2, AC-3, UT-2, UT-4, UT-9) — `lib/branding.ts` e `lib/branding-resolve.ts`: `logoIconUrl`, `logoIconDarkUrl`, `phone`, `address` (mesma spec do backend) e rejeição de primária com contraste < 4,5:1 (volta a `#465fff`). Testes de paridade com o backend (UT-2). Sem consumidor visual.

### intranet-frontend (React + Vite + TS → coder-react-ts)
- [x] **T-7** ✅ (AC-1, AC-2, AC-3, UT-2, UT-3, UT-4, UT-9) — `config/branding.ts`: campos novos, validadores e contraste (função pura `contrastWithWhite`); fallback e `FALLBACK_BRANDING` atualizados; testes em `branding.test.ts`.
- [x] **T-8** ✅ (AC-1, UT-3) — `UserDropdown.tsx:45`, `UserMetaCard.tsx:37`, `AppSidebar.tsx:491` usam o ícone do tema ativo (`logoIconDarkUrl` no escuro, com fallback para `logoIconUrl`); testes de componente.
- [x] **T-9** ✅ (AC-2, UT-5, UT-6) — helper `getBrandColors()`; trocar as cores fixas em `BarChartOne`, `LineChartOne`, `MonthlyTarget`, `StatisticsChart`, `CountryMap` (primária nas séries/mapa; secundária na 2ª série de `LineChartOne` e `StatisticsChart`) e o slider em `index.css:525,531` por `var(--color-brand-500)`; teste de que não restam literais `#465fff`/`#9cb9ff` nesses arquivos.
- [x] **T-10** ✅ (AC-3, UT-7, UT-8) — `constants/emailTemplates.ts`: rodapé dos 3 templates usa `brand.phone` e `brand.address` com `escapeHtml`; sem valor, a linha é omitida (remover `(11) 1234-5678` e o endereço placeholder). Testes de template.
- [x] **T-11** ✅ (AC-4, UT-10, UT-11, UT-12) — tipos e serviço de filial com `horarioAbertura`/`horarioFechamento`; `Calendar.tsx:1065-1100` usa os dados (sem `includes` de nome; padrão 08:00–22:00; sem filial = menor abertura e maior fechamento, padrão 06:00–23:00); campos de horário no formulário/grid de filial (`BranchOfficeGrid`). Testes do cálculo de limites.
- [x] **T-12** ✅ (AC-5, UT-15, FT-5) — estender `scripts/check-brand.mjs` da Intranet com os 6 nomes de unidade (padrões montados por partes) e teste; garantir 0 ocorrências em `src/` (fixtures sem nomes reais).

### Verificação funcional
- [ ] **T-13** (FT-1, FT-2, FT-3, FT-4, FT-5) — com API e Intranet locais (ou preview): branding customizado (ícone, cores, claro/escuro), agenda 06–23 e 08–22, preview de e-mail com e sem `phone`/`address`, migration em banco de teste e `npm run check:brand`. Registrar o que foi e o que não foi exercitado.

### Rastreabilidade
| AC | Tasks | Cenários |
|----|-------|----------|
| AC-1 | T-1, T-6, T-7, T-8 | UT-1, UT-2, UT-3, FT-1 |
| AC-2 | T-3, T-6, T-7, T-9 | UT-4, UT-5, UT-6, FT-1 |
| AC-3 | T-2, T-6, T-7, T-10 | UT-7, UT-8, UT-9, FT-3 |
| AC-4 | T-4, T-5, T-11 | UT-10..UT-14, FT-2, FT-4 |
| AC-5 | T-12 | UT-15, FT-5 |

**Cobertura:** 13 tasks; 5 ACs, todos com ≥ 1 task e ≥ 1 teste; UT-1..UT-15 e FT-1..FT-5 cobertos.

## Coordenação
- **Radar início (2026-11-26):** 0 PRs abertos nos 3 repositórios de código; nenhuma sessão ativa tocando o escopo; Intranet tem alterações **não commitadas de terceiros** na árvore principal (`.env.example`, `AxioService.ts` com import duplicado, `vite-env.d.ts`) — por isso o trabalho roda em **worktrees** (`_worktrees/backend-branding`, `intranet-branding`, `extranet-branding`) a partir de `origin/master` (backend e Intranet) e do branch local `feature/desvincular-marca` (Extranet, ainda não publicado; o remote dela é a organização antiga `InstitutoBarrosTecnologia`: **sem push** sem ordem do dono).
- **Acordos:** n/a
- **Radar fim (2026-11-26):** sem mudança — 0 PRs abertos nos 3 repositórios, `origin/master` sem novidades; trabalho isolado em worktrees; nenhum push. Ordem de merge: backend antes dos fronts (campos ausentes caem no padrão, então a ordem não quebra), Extranet só depois de a base `desvincular-marca` ser publicada.

## Execução
**Concluído em:** 2026-11-26 (T-1..T-12). T-13 (verificação funcional) **não executada**.
**Onde está:** worktrees locais `G:\Projetos\Sistema-Clinica\_worktrees\{backend,intranet,extranet}-branding` (branch `feature/completar-branding`), **sem commit e sem push**.
**Arquivos:** backend — `BrandingSettings`, `BrandingResponseDto`, `BrandingService`, `BranchOfficeModel`/DTOs/mapper EF/`MapperProfile`/`BranchOfficeValidator`/`BranchOfficeConst`, `Program.cs` (`TimeOnlyConverter("HH:mm:ss")`), migration `20261126223123_AddBranchOfficeHorario` (+Designer, Snapshot), testes; Intranet — `config/branding.ts`, `config/brandColors.ts`, hooks `useBrandIconUrl`/`useBrandColors`, `utils/branchOfficeHours.ts`, `emailTemplates.ts`, `Calendar.tsx`, `FormBranchOffice`, `BranchOfficeGrid`, 5 gráficos, `index.css`, `scripts/check-brand.mjs`, testes; Extranet — `lib/branding-resolve.ts` + testes.
**Prova de Rastreabilidade:** AC-1..AC-5 cobertos por UT-1..UT-15 (PASS). Backend: suíte unitária 887/890 — as 3 falhas são `ScheduleControllerTests.*ClienteForbiddenIfNotOwner`, **pré-existentes** (confirmadas em `origin/master`); filtro Branding/BranchOffice 107/107. Intranet: suíte completa 331/331, `tsc` limpo, `check:brand` 0. Extranet: `test:unit` 17/17, `check:brand` 0 (os 7 erros de `tsc` por módulos `*.svg` são pré-existentes).
**Quality Gate:** auditoria e review por repositório sem P0/P1 (3× APPROVE); P2/P3 corrigidos.
**Decisões:** 2ª série dos gráficos usa `secondaryColor` só se diferente do padrão `#101828` (que é igual ao fundo do tema escuro); caso contrário o tom 300 da escala da primária. Removidos telefone e WhatsApp fictícios do template de e-mail e renomeado "Marketplace" nos dados de exemplo de gráficos. `TimeOnlyConverter("HH:mm:ss")` afeta só os campos novos.
**Não executado:** FT-1..FT-4 (navegador, claro/escuro, grade da agenda, e-mail, migration em banco SQL Server com filiais de teste — fazer backup antes de produção); `next lint` da Extranet não roda neste ambiente; verificação visual.
**Débitos:** `TimeOnlyConverter.Read` usa `TimeOnly.Parse` (lança com horário malformado); `MapperProfile` com mapeamentos redundantes; erro de horário do `FormBranchOffice` só em toast (sem `aria-invalid`); `AutoMapper` com vulnerabilidade (NU1903, pré-existente); drift de `TipoCheckIn` no EF (fora da migration).
**Coordenação:** radar início e fim sem sobreposição.

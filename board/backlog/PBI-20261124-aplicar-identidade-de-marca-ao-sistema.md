---
id: PBI-20261124-aplicar-identidade-de-marca-ao-sistema
tipo: feature
titulo: Aplicar identidade de marca (fonte, logo e e-mails) ao sistema via configuração de Branding
status: backlog
prioridade: alta
workspaces: [core-backend, intranet-frontend, extranet-frontend, architecture-registry]
criado_em: 2026-11-24
origem: PBI-20261124-rebranding-marca-clinica (dividido; esta é a metade de implementação)
bloqueado_por: [PBI-20261124-definir-identidade-de-marca-clinica, PBI-20261124-completar-branding-e-remover-nomes-de-unidade]
---

# Aplicar identidade de marca (fonte, logo e e-mails) ao sistema via configuração de Branding

## Contexto de Negócio
- **Objetivo:** fazer Intranet, Extranet, telas de login e e-mails exibirem nome, logo, cores e **fonte** do brand book apenas por configuração. Hoje o contrato `GET /api/Branding` não tem fonte e a fonte está fixa no código.
- **Persona:** dono do produto e implantador; usuários da clínica e pacientes (veem a marca).
- **Jornada atual:** contrato com 8 campos (`name`, `shortName`, `logoLightUrl`, `logoDarkUrl`, `faviconUrl`, `primaryColor`, `secondaryColor`, `supportEmail`; `BrandingSettings.cs:17-24`). Fonte Outfit fixa em 18 arquivos da Intranet (35 ocorrências, incluindo `index.css` e ~17 gráficos) e Satoshi fixa na Extranet (`src/css/satoshi.css`, `tailwind.config.ts`). E-mail só troca `{{empresa}}` pelo nome (`EmailDispatchService.cs:225`); não há cabeçalho/logo.
- **Jornada desejada:** trocar a marca = mudar a seção `Branding` + ativos estáticos; sem editar código por cliente/marca.
- **Dependências (bloqueantes):**
  - `PBI-20261124-definir-identidade-de-marca-clinica` — fornece nome, paleta, fonte e logos (`Sistema-Clinica-Marca/tokens-marca.json` e `assets/logo/`).
  - `PBI-20261124-completar-branding-e-remover-nomes-de-unidade` — já adiciona `logoIconUrl`, `phone`, `address`, consumo de `secondaryColor` e validação de contraste da cor primária no mesmo contrato e nos 3 validadores. **Este PBI NÃO repete esses itens**; só soma `fontFamily` e `fontUrl` e usa o contrato resultante.

## User Story
Como dono do produto, quero que a marca final (incluindo fonte) seja aplicada ao sistema por configuração, para que a plataforma tenha identidade própria sem alterar código a cada ajuste de marca.

## Critérios de Aceite
- **AC-1** — DADO o contrato de Branding, QUANDO acrescento `fontFamily` e `fontUrl` (opcionais, retrocompatíveis), ENTÃO `BrandingSettings`, `BrandingResponseDto` e `BrandingService` os expõem em `GET /api/Branding`; `fontFamily` aceita só `^[A-Za-z0-9 ,-]{1,100}$` e `fontUrl` só caminho relativo ou `https` (mesma regra de URL dos demais campos); valor ausente/inválido vem vazio, sem lançar exceção.
- **AC-2** — DADO `fontFamily`/`fontUrl` válidos, QUANDO a Intranet carrega, ENTÃO `resolveBranding` (`config/branding.ts`) os valida com as mesmas regras do backend, a app injeta `<link rel="stylesheet">` de `fontUrl` e define a variável CSS `--font-brand` como `<fontFamily>, system-ui, sans-serif`; `font-display: swap` garantido (parâmetro `display=swap` na URL ou `@font-face` próprio).
- **AC-3** — DADO a variável `--font-brand`, QUANDO renderizo páginas e gráficos da Intranet, ENTÃO nenhum arquivo em `src/` contém `Outfit` literal (varredura retorna 0 fora de `index.css` fallback); gráficos Apex passam a ler a fonte de um helper único (ex.: `getBrandFont()`), não de string literal em cada componente.
- **AC-4** — DADO os mesmos campos, QUANDO a Extranet carrega, ENTÃO `lib/branding-resolve.ts` valida, `app/layout.tsx` injeta a fonte e `tailwind.config.ts` usa a variável; `css/satoshi.css` deixa de ser a única fonte (permanece apenas como fallback quando `fontFamily` vazio).
- **AC-5** — DADO `fontFamily`/`fontUrl` ausentes ou `fontUrl` indisponível (404/offline), QUANDO a tela carrega, ENTÃO o layout não quebra e o texto renderiza na fonte atual do front (Outfit na Intranet, Satoshi na Extranet) ou na fonte de sistema.
- **AC-6** — DADO e-mails de disparo, QUANDO o `EmailDispatchService` monta o corpo, ENTÃO o template inclui cabeçalho com logo (`logoLightUrl` absoluta) e `name` e a assinatura com `supportEmail`; com `logoLightUrl` relativa o cabeçalho usa só o nome (e-mail não resolve caminho relativo); campos de `phone`/`address` seguem o PBI `completar-branding`.
- **AC-7** — DADO o brand book aprovado, QUANDO preencho `Branding__*` (nome, cores, logos, favicon, fonte) e copio os ativos de `Sistema-Clinica-Marca/assets/logo/` para os fronts, ENTÃO login e dashboard da Intranet e login e home da Extranet exibem marca final em tema claro e escuro, sem outra alteração de código.
- **AC-8** — DADO o contrato novo, QUANDO atualizo o registry, ENTÃO `architecture-registry.yaml` documenta `fontFamily`/`fontUrl` na seção `branding` e o `CHANGELOG`/doc de contrato do endpoint os cita.

## Regras de Negócio
- `fontFamily`: 1–100 caracteres; letras, dígitos, espaço, vírgula e hífen. `fontUrl`: relativa (`/...`, nunca `//host`) ou `https://...`, sem espaço nem `\ " ' < >`.
- Campo vazio/ausente nunca derruba a tela; cai no padrão atual do front.
- Fonte deve ter licença livre (decidido no PBI de identidade); `fontUrl` externa expõe o IP do usuário ao provedor da fonte — se o dono exigir LGPD estrita, hospedar a fonte própria (`/fonts/...` relativa), o que o contrato já suporta.
- Cores do tema passam pelo validador de contraste do PBI `completar-branding` (não duplicar).
- Contrato permanece retrocompatível: clientes que ignoram campos novos continuam funcionando.

## Cenários de Teste Unitário
| ID | AC | Cenário | Entrada | Saída esperada |
|----|----|---------|---------|----------------|
| UT-1 | AC-1 | `BrandingService` fonte válida | `fontFamily: "Inter, sans-serif"`, `fontUrl: "https://fonts.googleapis.com/css2?family=Inter&display=swap"` | DTO com ambos |
| UT-2 | AC-1 | `fontFamily` inválido | `Inter;}body{x:1` | `fontFamily` vazio |
| UT-3 | AC-1 | `fontUrl` inválido | `javascript:x`, `//evil.com/f.css`, `http://...` | `fontUrl` vazio |
| UT-4 | AC-1 | Config sem fonte | seção sem os campos | DTO com os dois vazios, sem exceção |
| UT-5 | AC-2 | `resolveBranding` Intranet | fonte válida / ausente / inválida | valor / vazio / vazio |
| UT-6 | AC-4 | `branding-resolve` Extranet | mesmas 3 entradas | mesmos resultados da Intranet (paridade) |
| UT-7 | AC-2 | Montagem de `--font-brand` | `fontFamily: "Inter"` | `Inter, system-ui, sans-serif` |
| UT-8 | AC-3 | Varredura de `Outfit` literal | `src/` da Intranet | 0 ocorrências (teste/script) |
| UT-9 | AC-5 | `fontFamily` vazio | branding sem fonte | `--font-brand` não é definida; fonte atual do front |
| UT-10 | AC-6 | Template de e-mail com logo absoluta | `logoLightUrl: https://...` | cabeçalho com `<img>` e nome |
| UT-11 | AC-6 | Template com logo relativa | `/images/logo/logo.svg` | cabeçalho só com o nome |

## Cenários de Teste Funcional / E2E
| ID | AC | Fluxo | Resultado observável |
|----|----|-------|----------------------|
| FT-1 | AC-7 | Subir API com `Branding__*` da marca final; abrir login e dashboard da Intranet (claro e escuro) | Nome, logo, cores e fonte corretos; Network sem erro de fonte |
| FT-2 | AC-7 | Abrir login e home da Extranet | Mesma identidade |
| FT-3 | AC-6 | Disparar e-mail de teste | Cabeçalho com logo e nome, assinatura com `supportEmail` |
| FT-4 | AC-5 | Configurar `fontUrl` inexistente | Layout íntegro, fonte de fallback |
| FT-5 | AC-3 | Abrir gráficos do dashboard | Rótulos e tooltips na fonte da marca |

## Requisitos Técnicos
- **Tipo de mudança:** feature + refactor leve; contrato novo (campos opcionais, compatível); sem migration.
- **Workspaces:** `core-backend` (`BrandingSettings.cs`, `BrandingResponseDto.cs`, `BrandingService.cs`, `EmailDispatchService.cs`, template de e-mail, testes em `Branding/`); `intranet-frontend` (`config/branding.ts`, `hooks/useBranding.ts`, `components/common/BrandingHead.tsx`, `index.css`, ~17 gráficos); `extranet-frontend` (`lib/branding.ts`, `lib/branding-resolve.ts`, `app/layout.tsx`, `contexts/branding-context.tsx`, `tailwind.config.ts`); `architecture-registry` (yaml).
- **Requisitos não-funcionais:** `font-display: swap`; contraste AA (herdado do PBI `completar-branding`); acessibilidade de logo (alt); alinhar os 3 validadores (backend, Intranet, Extranet) com a mesma spec.
- **Riscos técnicos:**
  - Mudança de fonte altera métricas de texto e pode quebrar layout de tabelas/gráficos — testar nas telas principais.
  - Fonte externa: se houver CSP nos fronts (não encontrada no repo; checar headers da Vercel), liberar `style-src`/`font-src` do provedor. A CSP do backend (`SecurityHeadersMiddleware.cs:41`) vale só para respostas da API.
  - Dois PBIs mexem no mesmo contrato e validadores: executar depois do `completar-branding` para evitar conflito.
  - Ativos de logo só existem após o PBI de identidade; sem eles, o PBI só valida com fixtures.
  - Logo relativa não funciona em e-mail (AC-6): exigir URL absoluta pública no config de produção.

## Definition of Ready
- [x] Título no padrão [Verbo] + [Objeto] + [Contexto]
- [x] Contexto de negócio completo
- [x] ≥1 User Story com ACs em DADO/QUANDO/ENTÃO
- [x] Regras de negócio documentadas
- [x] Cenários de teste unitário e funcional definidos
- [x] Workspaces impactados identificados
- [x] Tipo de mudança e prioridade definidos

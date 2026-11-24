---
id: PBI-20261124-rebranding-marca-clinica
tipo: feature
titulo: Criar identidade de marca completa da plataforma de gestão para clínicas
status: superseded
substituido_por: [PBI-20261124-definir-identidade-de-marca-clinica, PBI-20261124-aplicar-identidade-de-marca-ao-sistema]
prioridade: alta
workspaces: [architecture-registry, intranet-frontend, extranet-frontend, core-backend]
criado_em: 2026-11-24
---

# Criar identidade de marca completa da plataforma de gestão para clínicas

## Contexto de Negócio
- **Objetivo:** definir nome forte, logo, missão, visão, valores, história, paleta, tipografia e tom de voz da plataforma, e aplicá-los ao produto via configuração. Métrica: marca aprovada pelo dono + aplicada nos 2 fronts + nome com domínio e registro viáveis.
- **Persona:** dono do produto (decisor); clínicas pequenas/médias e profissionais de saúde formais e informais (público da marca); equipe de vendas.
- **Jornada atual:** produto sem identidade própria (placeholder após PBI-1), sem posicionamento de marca nem pesquisa de nomes.
- **Jornada desejada:** brand book versionado no registry, marca aplicada ao sistema por `BrandingSettings`, ativos prontos para site, apresentação comercial e redes sociais.
- **Dependências:** PBI-20261124-desvincular-marca-instituto-barros (branding por configuração). Insumos de mercado do PBI-3 reforçam posicionamento; as duas pesquisas devem ser coordenadas.

## User Story
Como dono do produto, quero uma identidade de marca completa e aplicada ao sistema, para que a plataforma seja reconhecida, memorável e vendável para clínicas de vários nichos.

## Critérios de Aceite
- **AC-1** — DADO a lista de concorrentes diretos e indiretos (mín. 8), QUANDO a pesquisa termina, ENTÃO existe documento com nome, posicionamento, tom de voz, identidade visual, preço público e lacunas de cada um.
- **AC-2** — DADO critérios de naming (curto, fácil de pronunciar em PT-BR, sem conotação negativa, serve a todos os nichos), QUANDO gero candidatos, ENTÃO há ≥10 nomes pré-filtrados e ≥3 finalistas com checagem de domínio (.com.br/.com), handles de Instagram/LinkedIn e busca de anterioridade no INPI.
- **AC-3** — DADO os finalistas, QUANDO o dono escolhe, ENTÃO o nome final fica registrado com justificativa e riscos.
- **AC-4** — DADO o nome final, QUANDO crio a identidade, ENTÃO existem: missão, visão, valores (3–6), história da marca, proposta de valor, slogan e tom de voz documentados.
- **AC-5** — DADO a identidade, QUANDO desenho o logo, ENTÃO entrega inclui versões (horizontal, vertical, ícone, claro/escuro/monocromático) em SVG e PNG, com área de proteção e tamanho mínimo.
- **AC-6** — DADO paleta e tipografia, QUANDO validadas, ENTÃO todos os pares texto/fundo da paleta atingem contraste WCAG AA (≥4.5:1 texto normal) e as fontes têm licença livre (ex.: Google Fonts).
- **AC-7** — DADO o brand book aprovado, QUANDO atualizo `BrandingSettings`, ENTÃO Intranet, Extranet, e-mails e telas de login exibem nome, logo, cores e fonte novos sem alteração de código além de config/assets.
- **AC-8** — DADO o brand book, QUANDO publicado, ENTÃO fica em `Architecture-Registry/context/marca/` em Markdown, com assets em `assets/`, e é referenciado no `architecture-registry.yaml`.

## Regras de Negócio
- Nome não pode colidir com marca registrada na classe de software/saúde no INPI (verificação preliminar; registro formal é ação posterior).
- Nome e identidade devem funcionar para todos os nichos-alvo (fisioterapia, estética, odontologia, medicina, outros), sem termo restritivo a uma especialidade.
- Fontes e imagens com licença que permita uso comercial; IA generativa só com termos de uso que permitam, e registrar a origem.
- Decisões de nome e logo são do dono do produto; o agente propõe e justifica.
- Alterações de cor/fonte passam por validação de contraste.

## Cenários de Teste Unitário

| ID | AC | Cenário | Entrada | Saída esperada |
|----|----|---------|---------|----------------|
| UT-1 | AC-6 | Contraste AA da paleta | pares texto/fundo da paleta final | todos ≥ 4.5:1 |
| UT-2 | AC-6 | Contraste reprovado | par 3.0:1 | validador falha e aponta o par |
| UT-3 | AC-7 | `BrandingSettings` com marca final | config completa | DTO com nome, logos, cores, fonte |
| UT-4 | AC-7 | Fonte configurada indisponível | URL de fonte inválida | cai na fonte de sistema, sem quebrar layout |
| UT-5 | AC-5 | Checagem de assets | pasta de logos | todas as variantes exigidas existem em SVG e PNG |

## Cenários de Teste Funcional / E2E

| ID | AC | Fluxo | Resultado observável |
|----|----|-------|----------------------|
| FT-1 | AC-7 | Abrir login e dashboard da Intranet com a marca final | Logo, nome, cores e fonte corretos em claro e escuro |
| FT-2 | AC-7 | Abrir portal do paciente (Extranet) | Mesma identidade aplicada |
| FT-3 | AC-7 | Disparar e-mail de teste | Assinatura e cabeçalho com marca final |
| FT-4 | AC-8 | Abrir `context/marca/` no GitHub | Brand book legível com todos os assets linkados |

## Requisitos Técnicos
- **Tipo de mudança:** nova feature (documentação + assets + configuração)
- **APIs/contratos:** reutiliza `GET /api/Branding` do PBI-1, acrescentando `fontFamily` e `fontUrl`.
- **Requisitos não-funcionais:** assets SVG otimizados; fontes com `font-display: swap`; contraste AA; acessibilidade de logo (texto alternativo).
- **Riscos técnicos:** nome indisponível no INPI/domínio; dependência de decisão subjetiva; direitos de uso de fontes e imagens.

## Definition of Ready
- [x] Título no padrão [Verbo] + [Objeto] + [Contexto]
- [x] Contexto de negócio completo
- [x] ≥1 User Story com ACs em DADO/QUANDO/ENTÃO
- [x] Regras de negócio documentadas
- [x] Cenários de teste unitário e funcional definidos
- [x] Workspaces impactados identificados
- [x] Tipo de mudança e prioridade definidos

## Validação
**Status:** ❌ CHANGES_REQUESTED — 2026-11-24
**Validador:** /validate-pbi
**Pendências:**
1. **AC-7 é falso como escrito ("sem alteração de código além de config/assets")** — o contrato atual não tem fonte: `BrandingSettings.cs:17-24`, `config/branding.ts:6-15` e `BrandingResponseDto` só têm 8 campos. Fonte está fixa no código: Outfit hardcoded em ~12 gráficos da Intranet (ex.: `BarChartOne.tsx:8,57`, `BarChartGeneric.tsx:53,89,127`, `CountryMap.tsx:63`) e Satoshi via `Extranet/src/css/satoshi.css` + `tailwind.config.ts`. Corrigir: reescrever AC-7 prevendo código (campos `fontFamily`/`fontUrl` em BrandingSettings, DTO, `BrandingService` com validador, `resolveBranding` da Intranet, `branding-resolve.ts` da Extranet, injeção de `<link>`/CSS var e troca do `fontFamily` dos gráficos por variável).
2. **E-mails (AC-7 / FT-3) sem base no código** — `EmailDispatchService.cs:69,225` só substitui `{{empresa}}` pelo nome; não existe cabeçalho/assinatura/logo no template (`constants/emailTemplates.ts`). Definir: o PBI inclui criar cabeçalho/assinatura com logo? Se sim, listar como entrega e AC próprio; se não, remover e-mail do AC-7/FT-3.
3. **Sobreposição não declarada com `PBI-...-completar-branding-e-remover-nomes-de-unidade`** (backlog) — ele já cobre `logoIconUrl`, `secondaryColor` consumida, contraste WCAG da cor primária (AC-2) e `phone/address`. Mesmo contrato e mesmos 3 validadores seriam alterados por dois PBIs. Declarar em Dependências e definir ordem (recomendado: completar-branding antes; este só soma `fontFamily`/`fontUrl`); remover do escopo o que duplica o validador de contraste.
4. **ACs 1, 2, 3, 4 e 8 não são testáveis automaticamente** (pesquisa, naming, escolha do dono, textos, publicação). Regra "cada AC testável" reprova. Corrigir: converter em critérios verificáveis por artefato (ex.: AC-1 → arquivo `context/marca/concorrentes.md` com ≥8 linhas e colunas obrigatórias, checável por script; AC-3 → arquivo `decisao-nome.md` com aprovação do dono registrada) **ou** separar a parte de descoberta num PBI `spike`/pesquisa e deixar neste só o que vira código (AC-5 a AC-8).
5. **Entrega de AC-5 (logo) é decisão criativa/subjetiva sem rastreio de origem** — falta definir quem gera o logo (designer, IA com licença) e onde registrar a origem exigida pela regra de negócio de IA generativa; UT-5 só checa existência de arquivos. Acrescentar o local do registro de origem/licença e o critério objetivo mínimo (nomes de arquivo esperados, viewBox, tamanho máximo SVG).
6. **Contrato/nomenclatura inconsistente com o código** — o PBI cita `BrandingSettings` como seção de config; a seção real é `Branding` (`BrandingSettings.cs:6`). `GET /api/Branding` "do PBI-1" não existe como ID rastreável; referenciar `PBI-20261124-desvincular-marca-instituto-barros` (em `done/`). "Extranet" = `sistema-clinica-portal` no registry; `workspaces` usa nomes (`core-backend`, `intranet-frontend`, `extranet-frontend`) que não existem como `name:` no `architecture-registry.yaml` (ver PBI corrigir-yaml-e-paths-do-registry). Alinhar com o padrão adotado nos demais PBIs ou com o registry.
7. **UT-1/UT-2 não dizem onde mora o validador de contraste** (backend C#? front TS? script de build?). UT-3 ("DTO com nome, logos, cores, fonte") e UT-4 ("URL inválida cai na fonte de sistema") só fazem sentido após item 1. Especificar a camada e o arquivo, e o limite explícito (≥4.5:1 texto normal; ≥3:1 para texto grande/ícones se aplicável).
8. **Riscos técnicos incompletos** — falta: carregar fonte externa vs CSP dos fronts (a CSP do `SecurityHeadersMiddleware` vale só para a API; nenhuma CSP de front encontrada no repo — checar headers da Vercel), self-host de fonte (LGPD/performance) e impacto no modo escuro (logos dark/light já existem, mas paleta nova exige revalidar contraste nos dois temas).
9. **Pesquisa de concorrentes duplicada com `PBI-...-publico-mercado-modelo-negocio`** — o próprio PBI diz coordenar, mas AC-1 repete a lista de ≥8 concorrentes. Definir qual PBI é dono do documento e o outro apenas consome.

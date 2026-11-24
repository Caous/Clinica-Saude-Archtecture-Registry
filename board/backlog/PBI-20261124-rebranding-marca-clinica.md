---
id: PBI-20261124-rebranding-marca-clinica
tipo: feature
titulo: Criar identidade de marca completa da plataforma de gestão para clínicas
status: backlog
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

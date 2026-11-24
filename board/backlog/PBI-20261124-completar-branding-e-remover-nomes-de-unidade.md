---
id: PBI-20261124-completar-branding-e-remover-nomes-de-unidade
tipo: debt
titulo: Completar branding configurável e remover nomes de unidades hardcoded da Intranet
status: backlog
prioridade: media
workspaces: [core-backend, intranet-frontend, extranet-frontend]
criado_em: 2026-11-24
---

# Completar branding configurável e remover nomes de unidades hardcoded da Intranet

## Contexto de Negócio
- **Objetivo:** fechar as lacunas de white-label deixadas pelo PBI-20261124-desvincular-marca-instituto-barros (achados P2/P3 da auditoria): ícone, cor secundária, tema, rodapé de e-mail e lógica atrelada a nomes reais de unidades.
- **Persona:** dono do produto e implantador (gerador white-label).
- **Jornada atual:** o ícone do avatar/sidebar recolhida é fixo (`logo-icon.svg`); `--color-brand-secondary` é gravada mas sem consumidor; anel de foco, slider e gráficos têm azul fixo; rodapé de e-mail tem telefone/endereço fixos; `Calendar.tsx` (~1080-1090) decide horário de funcionamento por nomes reais (PAULISTA, MOOCA, IPIRANGA, PAZ, ALPHAVILLE, MARKETPLACE) com `includes`.
- **Jornada desejada:** tudo vem do contrato `GET /api/Branding` e dos dados da filial; nenhuma lógica por nome de unidade.
- **Dependências:** PBI-20261124-desvincular-marca-instituto-barros concluído.

## User Story
Como implantador, quero que ícone, cores, rodapé e horários venham de configuração ou dos dados da filial, para que cada cliente white-label tenha identidade e regras próprias sem alterar código.

## Critérios de Aceite
- **AC-1** — DADO o contrato de Branding, QUANDO acrescento `logoIconUrl` (backend, Intranet, Extranet, mesmas validações), ENTÃO `UserDropdown`, `UserMetaCard` e a sidebar recolhida usam o ícone configurado, com variante para fundo escuro ou contraste verificado.
- **AC-2** — DADO `primaryColor`/`secondaryColor`, QUANDO aplicadas, ENTÃO anel de foco, slider, gráficos (`BarChartOne`, `CountryMap`) e a variável secundária usam a cor configurada, e uma cor primária que reprove contraste WCAG AA com texto branco é rejeitada ou ajustada com aviso.
- **AC-3** — DADO telefone e endereço de rodapé dos e-mails, QUANDO configurados (`phone`, `address` no Branding), ENTÃO aparecem nos templates; sem configuração, o rodapé omite os campos.
- **AC-4** — DADO a filial, QUANDO a API de `BranchOffice` expõe `openingTime`/`closingTime`, ENTÃO `Calendar.tsx` usa esses dados e não há mais `if` por nome de unidade; filiais sem horário usam o padrão 08:00–22:00.
- **AC-5** — DADO a varredura de nomes reais de unidades (PAULISTA, MOOCA, IPIRANGA, PAZ, ALPHAVILLE, MARKETPLACE), QUANDO executo `check-brand` estendido, ENTÃO 0 ocorrências na Intranet.

## Regras de Negócio
- Horário padrão de filial: 08:00–22:00 quando não configurado.
- `logoIconUrl`, `phone` e `address` seguem as validações do contrato (URL relativa ou https, sem `"'<>`).
- Migração de dados: filiais existentes recebem horário via script, sem perda do comportamento atual (MARKETPLACE 06–23, IPIRANGA 07–22).

## Cenários de Teste Unitário
| ID | AC | Cenário | Entrada | Saída esperada |
|----|----|---------|---------|----------------|
| UT-1 | AC-1 | resolveBranding com `logoIconUrl` válido/ausente/inválido | `/icon.svg`, null, `javascript:x` | valor, fallback, fallback |
| UT-2 | AC-2 | Contraste da cor primária | `#ffff00` | rejeitada/ajustada com aviso |
| UT-3 | AC-3 | Template de e-mail sem telefone | `phone` vazio | rodapé sem linha de telefone |
| UT-4 | AC-4 | Horário da filial | `openingTime 06:00`, `closingTime 23:00` | limites do calendário 06–23 |
| UT-5 | AC-4 | Filial sem horário | campos nulos | 08:00–22:00 |

## Cenários de Teste Funcional / E2E
| ID | AC | Fluxo | Resultado observável |
|----|----|-------|----------------------|
| FT-1 | AC-1/AC-2 | Subir com Branding customizado | Ícone, foco e gráficos na cor da marca |
| FT-2 | AC-4 | Abrir agenda de filial com horário 06–23 | Grade 06–23 sem referência a nome de unidade |

## Requisitos Técnicos
- **Tipo de mudança:** refactor + contrato novo (campos opcionais, compatível).
- **APIs/contratos:** `GET /api/Branding` ganha `logoIconUrl`, `phone`, `address`; `BranchOffice` ganha `openingTime`, `closingTime` (migration).
- **Requisitos não-funcionais:** contraste WCAG AA; compatibilidade retroativa dos clientes do contrato.
- **Riscos técnicos:** migration em produção; alinhar os 3 validadores.

## Definition of Ready
- [x] Título no padrão [Verbo] + [Objeto] + [Contexto]
- [x] Contexto de negócio completo
- [x] ≥1 User Story com ACs em DADO/QUANDO/ENTÃO
- [x] Regras de negócio documentadas
- [x] Cenários de teste unitário e funcional definidos
- [x] Workspaces impactados identificados
- [x] Tipo de mudança e prioridade definidos

---
id: PBI-20261124-corrigir-yaml-e-paths-do-registry
tipo: debt
titulo: Corrigir YAML inválido e paths desatualizados do architecture-registry
status: backlog
prioridade: media
workspaces: [architecture-registry]
criado_em: 2026-11-24
---

# Corrigir YAML inválido e paths desatualizados do architecture-registry

## Contexto de Negócio
- **Objetivo:** o `architecture-registry.yaml` não é parseável por um parser YAML estrito (já era assim no commit herdado) e seus `path:` apontam para nomes que não existem nas pastas reais. Isso impede ferramentas (e agentes) de ler o registry com segurança.
- **Persona:** time de dev e agentes que leem o registry.
- **Jornada atual:** `yaml.safe_load` falha: itens `Email?`/`CustomerId(FK)?` em listas de fluxo, item de lista com indentação errada (`InsightService`, ~linha 218) e texto livre com `: ` sem aspas (~linha 220, `DatabaseEncryptionHelper: AES-256...`); `path:` usa `Clinica-Saude-Backend/`, `PortalCliente/`, `Site/`, `Bot/...` sem correspondência exata com as pastas.
- **Jornada desejada:** YAML válido, validado em CI, com paths reais e termos neutros (`InstitutoContext` → nome real do DbContext definido pelo time).
- **Dependências:** PBI-20261124-desvincular-marca-instituto-barros concluído.

## User Story
Como desenvolvedor, quero um registry parseável e fiel às pastas reais, para que ferramentas e agentes o leiam sem erro.

## Critérios de Aceite
- **AC-1** — DADO o `architecture-registry.yaml`, QUANDO executo `node scripts/validate-registry.mjs` (ou parser YAML equivalente), ENTÃO retorna exit 0 sem erro de sintaxe.
- **AC-2** — DADO cada `path:`/`file:` do registry, QUANDO validado contra o disco do monorepo de trabalho, ENTÃO todo caminho existe ou está marcado `planned: true`.
- **AC-3** — DADO o CI do registry, QUANDO há push/PR, ENTÃO o validador roda e bloqueia YAML inválido.
- **AC-4** — DADO o nome do DbContext, QUANDO o time decidir renomear (`InstitutoContext`), ENTÃO o registry reflete o nome final (decisão registrada).

## Regras de Negócio
- Fonte da verdade dos paths é a estrutura de pastas dos repositórios `Clinica-Saude-*`.
- Textos livres com `:` ficam entre aspas ou em bloco `|`.

## Cenários de Teste Unitário
| ID | AC | Cenário | Entrada | Saída esperada |
|----|----|---------|---------|----------------|
| UT-1 | AC-1 | YAML válido | registry corrigido | exit 0 |
| UT-2 | AC-1 | YAML com `Email?` não citado | fixture | exit 1 com linha |
| UT-3 | AC-2 | Path inexistente | fixture com `path: x/` | exit 1 listando o path |
| UT-4 | AC-2 | Path `planned: true` | fixture | exit 0 |

## Cenários de Teste Funcional / E2E
| ID | AC | Fluxo | Resultado observável |
|----|----|-------|----------------------|
| FT-1 | AC-3 | Abrir PR com YAML quebrado | CI falha com mensagem da linha |

## Requisitos Técnicos
- **Tipo de mudança:** infra/docs
- **APIs/contratos:** `scripts/validate-registry.mjs` (dependência mínima de parser YAML; pode usar `js-yaml` em devDependency do registry).
- **Requisitos não-funcionais:** execução < 5 s.
- **Riscos técnicos:** paths dependem de onde o registry é executado (monorepo local vs. repos separados).

## Definition of Ready
- [x] Título no padrão [Verbo] + [Objeto] + [Contexto]
- [x] Contexto de negócio completo
- [x] ≥1 User Story com ACs em DADO/QUANDO/ENTÃO
- [x] Regras de negócio documentadas
- [x] Cenários de teste unitário e funcional definidos
- [x] Workspaces impactados identificados
- [x] Tipo de mudança e prioridade definidos

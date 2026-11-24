---
id: PBI-20261124-melhorias-check-marca
tipo: debt
titulo: Endurecer verificações e reduzir duplicação em scripts/check-marca.mjs
status: backlog
prioridade: baixa
workspaces: [architecture-registry]
criado_em: 2026-11-24
origem: auditoria de PBI-20261124-definir-identidade-de-marca-clinica (T-1..T-4)
---

# Endurecer verificações e reduzir duplicação em scripts/check-marca.mjs

## Contexto de Negócio
- **Objetivo:** fechar P3 da auditoria que não bloquearam a entrega do script de verificação do brand book.
- **Persona:** mantenedor do registry.

## Itens (numeração da auditoria)
- #7 `LINK_PATTERN` → `\[[^\][]*\]` (ReDoS leve).
- #8 fence `~~~`/tamanho, code spans inline, links `<com espaço>` e de referência; `findSection` ignorar blocos de código.
- #9 ordenar `readdirSync`; sensibilidade a caixa no Windows vs Linux em `existsSync`.
- #11 tabela de concorrentes: não aceitar tabela dentro de código; validar conteúdo de url e data.
- #12 exigir `Diga:` / `Instagram:` com dois-pontos; aceitar lista numerada.
- #13 `Valores` não contar itens aninhados.
- #14/#17/#18/#19/#20 extrair `describeRootError`, constantes `MIN_*`, `stripListMarker`, compilar regex fora do laço, quebrar linhas longas; padronizar acentos nas mensagens.
- #24/#26/#27 testes diretos das funções exportadas (mais rápidos que `spawnSync`), timeout, vazamento de tmpdir; cobrir CRLF, `#fff`, valores > 6.
- Placeholder `Aprovado por: <dono> em <data>` não deve passar; teste de `NCL 429` para exercitar a guarda de sufixo.

## Critérios de Aceite
- **AC-1** — DADO cada item acima, QUANDO corrigido, ENTÃO existe teste que falharia sem a correção e `node --test scripts/check-marca.test.mjs` passa.

## Definition of Ready
- [ ] Refinar antes de executar (débito de baixa prioridade; sem cenários funcionais próprios)

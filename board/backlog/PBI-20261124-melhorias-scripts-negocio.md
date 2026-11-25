---
id: PBI-20261124-melhorias-scripts-negocio
tipo: debt
titulo: Extrair lib comum e endurecer check-negocio e modelo-financeiro
status: backlog
prioridade: baixa
workspaces: [architecture-registry]
criado_em: 2026-11-24
origem: auditorias de PBI-20261124-publico-mercado-modelo-negocio (T-1..T-6)
---

# Extrair lib comum e endurecer check-negocio e modelo-financeiro

## Itens (P3 das auditorias)
- Extrair `scripts/lib/` (leitura segura de arquivo, normalização, datas ISO, parse de args, verificação de links) compartilhada por `check-marca` e `check-negocio`; extrair helpers internos (`requireFilledCells`, `plainTitle`, `parseLabelLine`/`collectChildItems`).
- `check-negocio`: links com espaço ou parênteses no alvo; spans de código inline e blocos indentados; fence ```/~~~ distintos; `realpath` contra symlinks; datas múltiplas por célula; duplicatas de nicho e de modelo; placeholders proibidos (TBD, N/A, TODO); `Nichos de expansão` com vírgula dentro de parênteses; primeira tabela que contenha o cabeçalho esperado.
- `modelo-financeiro`: `projetarCenario` exportada sem validação; BOM no CSV; arredondamento do cache do xlsx; tolerância do sim/nao no xlsx.
- Reavaliar `exceljs` (vulnerabilidades moderadas via `uuid`; pacote sem release desde 2023).

## Critérios de Aceite
- **AC-1** — DADO cada item, QUANDO corrigido, ENTÃO existe teste que falharia sem a correção e as suítes seguem verdes.

## Definition of Ready
- [ ] Refinar antes de executar (débito de baixa prioridade)

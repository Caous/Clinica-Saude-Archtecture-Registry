# Architecture-Registry

> Fonte da verdade da arquitetura do Sistema Clínica: padrões, regras, serviços e módulos do ecossistema.

## O que é

Este repositório documenta a arquitetura do Sistema Clínica (nome placeholder; a marca real é configurável): backend, intranet, extranet e automações. O documento principal, `architecture-registry.yaml`, deve ser mantido atualizado junto com os arquivos Markdown.

## Estrutura

- `architecture-registry.yaml`: registro técnico (serviços, endpoints, camadas, CI/CD, pendências e padrões).
- `context/`: documentos de contexto, como `mapa-modulos.md` (mapa de módulos e funções). Histórico documental do baseline.
- `board/`: quadro de trabalho em Markdown, com um PBI por arquivo, organizado por estágio (`ideias/`, `backlog/`, `in-progress/`).
- `tokens.json`: fonte única dos identificadores técnicos neutros.
- `scripts/check-brand.mjs`: guarda anti-marca.

## tokens.json

Define o conjunto único de identificadores derivados do nome do produto (`SistemaClinica`, `sistema-clinica`, `sistema_clinica`, `SistemaClinicaDB`, `Sistema Clínica`), o mapa das variantes antigas a localizar e os valores padrão de marca (nome e nome curto). Solution, workflow, imagem Docker, banco e pacotes derivam desses tokens, o que permite que o gerador white-label faça substituições seguras. O arquivo contém as variantes antigas por definição e por isso é excluído da varredura.

## scripts/check-brand.mjs

Script Node (22+) sem dependências que falha se encontrar a marca antiga em conteúdo, nomes de arquivo ou nomes de pasta. Ignora `.git`, `node_modules`, `bin`, `obj`, `dist`, `.next` e lockfiles.

```
node scripts/check-brand.mjs <raiz> [--exclude item1,item2]
```

- Exit code `0`: nenhuma ocorrência. `1`: ocorrências listadas como `caminho:linha`. `2`: erro de uso.
- `--exclude` recebe uma lista separada por vírgula de nomes de pasta/arquivo (em qualquer nível) ou caminhos relativos à raiz.

Neste repositório, `board/`, `context/` e `tokens.json` são histórico ou definição das variantes antigas, então a verificação é:

```
node scripts/check-brand.mjs . --exclude board,context,tokens.json
```

Os testes do script rodam com:

```
node --test "scripts/*.test.mjs"
```

## Contribuindo

Atualize o YAML e os Markdown sempre que a arquitetura mudar. Antes de enviar alterações, rode a verificação de marca acima.

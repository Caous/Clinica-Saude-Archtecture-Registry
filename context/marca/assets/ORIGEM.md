# Origem e licenças dos ativos

> Rascunho de 2026-11-24, condicionado à consulta manual de INPI (ver `decisao-nome.md`).

## Autoria e ferramentas

- **Autoria:** símbolo, lettering do nome, paleta e board de apresentação criados por Claude (modelo claude-fable-5-2), via MCP Pencil, a pedido do dono do produto.
- **Ferramentas:** Pencil (desenho e export PNG), scripts Node locais (geração dos SVG a partir da mesma geometria) e Python/Pillow (montagem da prévia). Nenhum gerador de imagem por IA externo, banco de imagens ou ativo de terceiros.
- **Arquivo-fonte:** `Idv-Visual-Sistema-Clinica.pen` (nesta pasta).
- **Uso comercial:** o dono do produto detém os direitos de uso do material criado para o projeto; a titularidade formal depende do registro de marca (fora deste PBI).

## Fontes tipográficas

| Fonte | Uso | Licença | Origem |
|---|---|---|---|
| Bricolage Grotesque (600, 700) | títulos | SIL Open Font License 1.1 | Google Fonts |
| Atkinson Hyperlegible Next (400, 700) | texto e interface | SIL Open Font License 1.1 | Google Fonts |

Nenhuma fonte foi baixada ou redistribuída neste repositório; só a URL do Google Fonts foi consultada para validar o CSS.

## Ativos

Todos os arquivos abaixo foram criados para o projeto e não têm licença de terceiros. O nome da marca nos SVG é lettering próprio em `path` (traços), sem dependência de fonte instalada.

| Arquivo | Origem | Licença |
|---|---|---|
| `logo/logo-horizontal-claro.svg` | geometria do Pencil, escrita por script Node | uso próprio do projeto |
| `logo/logo-horizontal-claro.png` | export Pencil (2×, fundo transparente) | uso próprio do projeto |
| `logo/logo-horizontal-escuro.svg` | idem | uso próprio do projeto |
| `logo/logo-horizontal-escuro.png` | idem | uso próprio do projeto |
| `logo/logo-horizontal-mono.svg` | idem | uso próprio do projeto |
| `logo/logo-horizontal-mono.png` | idem | uso próprio do projeto |
| `logo/logo-vertical-claro.svg` | idem | uso próprio do projeto |
| `logo/logo-vertical-claro.png` | idem | uso próprio do projeto |
| `logo/logo-vertical-escuro.svg` | idem | uso próprio do projeto |
| `logo/logo-vertical-escuro.png` | idem | uso próprio do projeto |
| `logo/logo-vertical-mono.svg` | idem | uso próprio do projeto |
| `logo/logo-vertical-mono.png` | idem | uso próprio do projeto |
| `logo/logo-icone-claro.svg` | idem | uso próprio do projeto |
| `logo/logo-icone-claro.png` | idem | uso próprio do projeto |
| `logo/logo-icone-escuro.svg` | idem | uso próprio do projeto |
| `logo/logo-icone-escuro.png` | idem | uso próprio do projeto |
| `logo/logo-icone-mono.svg` | idem | uso próprio do projeto |
| `logo/logo-icone-mono.png` | idem | uso próprio do projeto |
| `logo/logo-icone-pequeno-claro.svg` | variante óptica (≤ 32 px), script `scripts/gerar-logos.mjs` | uso próprio do projeto |
| `logo/logo-icone-pequeno-claro.png` | export Pencil (2×, fundo transparente) | uso próprio do projeto |
| `logo/logo-icone-pequeno-escuro.svg` | idem | uso próprio do projeto |
| `logo/logo-icone-pequeno-escuro.png` | idem | uso próprio do projeto |
| `previa-identidade-visual.png` | 6 seções exportadas do board e montadas com Pillow | uso próprio do projeto |
| `opcoes-simbolo.png` | export do board "Opções de símbolo" (rascunho de exploração) | uso próprio do projeto |
| `tema-escuro-azul.png` | export do board "Tema escuro azul suave" | uso próprio do projeto |
| `arquivo/logo-v1-coracao/*` | versão 1 (símbolo de coração aberto), recusada pelo dono em 2026-11-24 e guardada como histórico | uso próprio do projeto |
| `../scripts/gerar-logos.mjs` | script Node que gera os SVG a partir da geometria dos componentes; a tabela `CORES` no topo recolore | uso próprio do projeto |

## Histórico de versões

- **v1 (2026-11-24):** símbolo de coração aberto, tema escuro verde profundo. Arquivada em `arquivo/logo-v1-coracao/`.
- **v2 (2026-11-24):** símbolo "C em fluxo" escolhido pelo dono (opção A de três: C em fluxo, folha, abraço); tema escuro azul suave. Versão vigente.

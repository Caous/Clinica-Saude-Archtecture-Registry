# Cuidaflux — brand book

> Estado em 2026-11-24: brand book **aprovado pelo dono** e publicado aqui (`Architecture-Registry/context/marca/`, local definitivo). A cópia de trabalho `Sistema-Clinica-Marca/` serve para leitura e para o arquivo de desenho `.pen`.
>
> **Pendência antes de usar em escala:** consulta manual no INPI (classes 9, 42 e 44), handles de Instagram e LinkedIn e registro dos domínios `cuidaflux.com.br` e `cuidaflux.com`.

**Cuidaflux** — cuidado + fluxo. Plataforma de gestão para clínicas pequenas e médias e profissionais de saúde de todos os nichos.

Slogan: *O fluxo do cuidado.*

## Documentos

| Documento | O que tem |
|---|---|
| [identidade.md](identidade.md) | missão, visão, valores, história, proposta de valor, slogan e tom de voz |
| [visual.md](visual.md) | conceito do símbolo, paleta clara e escura, tipografia, logos, área de proteção e tamanhos mínimos |
| [decisao-nome.md](decisao-nome.md) | por que Cuidaflux, riscos e condições |
| [naming.md](naming.md) | critérios, 14 candidatos, 3 finalistas e checagens de domínio |
| [concorrentes-marca.md](concorrentes-marca.md) | marcas de 9 concorrentes (lista provisória) e lacunas de marca |
| [tokens-marca.json](tokens-marca.json) | cores e pares de contraste validados |

## Ativos

| Ativo | Arquivo |
|---|---|
| Prévia do board de identidade | [assets/previa-identidade-visual.png](assets/previa-identidade-visual.png) |
| Logos (SVG e PNG, 9 variantes + 2 ícones pequenos) | pasta [assets/logo/](assets/logo/) |
| Origem e licenças | [assets/ORIGEM.md](assets/ORIGEM.md) |
| Opções de símbolo exploradas | [assets/opcoes-simbolo.png](assets/opcoes-simbolo.png) |
| Tema escuro azul suave | [assets/tema-escuro-azul.png](assets/tema-escuro-azul.png) |
| Versão 1 (coração), arquivada | pasta [assets/arquivo/logo-v1-coracao/](assets/arquivo/logo-v1-coracao/) |

Arquivo de desenho: `Idv-Visual-Sistema-Clinica.pen` (abrir no Pencil). Gerador dos SVG: [scripts/gerar-logos.mjs](scripts/gerar-logos.mjs).

## Logo em uma olhada

![Logo horizontal claro](assets/logo/logo-horizontal-claro.png)

## Verificação

```
node scripts/check-marca.mjs .
```

(rodar na raiz do `Architecture-Registry`). Confere contraste WCAG AA, as 18 variantes de logo, a estrutura dos documentos e os links.

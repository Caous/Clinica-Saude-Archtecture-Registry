# Identidade visual Cuidaflux

> Rascunho para aprovação do dono (2026-11-24). Fonte do desenho: `Idv-Visual-Sistema-Clinica.pen` (board "Identidade Visual Cuidaflux"). Prévia: `assets/previa-identidade-visual.png`. Cores validadas por `check-marca --contraste` e registradas em `tokens-marca.json`.

## Conceito

O símbolo é um **"C em fluxo"**: uma única linha contínua, de pontas arredondadas, forma o "C" de **C**uidado e **C**uidar. A ponta superior se enrola para dentro e envolve um ponto framboesa, a pessoa cuidada (paciente ou profissional): o cuidado em movimento. O mesmo ponto aparece no pingo do "i" do nome. O nome usa um lettering minúsculo geométrico, desenhado com o mesmo traço do símbolo.

Sem cruz, estetoscópio, gota, onda ou coração: o símbolo serve a qualquer especialidade e foge dos clichês da área e das cores dos concorrentes (roxo, laranja, amarelo).

Histórico: o dono recusou o símbolo de coração aberto (versão 1, arquivada em `assets/arquivo/logo-v1-coracao/`) e a opção "folha" por não ter relação com a marca; escolheu o "C em fluxo" em 2026-11-24.

## Paleta

Verde-azulado como cor principal no tema claro (calma, saúde, confiança) e framboesa como acento humano. Fundo creme quente no tema claro. O **tema escuro é azul suave** (azul-ardósia, menos saturado), decisão do dono em 2026-11-24.

| Papel | Claro | Escuro | Uso |
|---|---|---|---|
| Primária | #0F766E | #9CC7EE | botões, links, símbolo |
| Primária forte | #0B5750 | #C2DDF5 | hover, ênfase |
| Primária suave | #D9F0EC | #2F4D6C | fundos de destaque |
| Sobre primária | #FFFFFF | #10263B | texto sobre a primária |
| Secundária | #BE3455 | #F6AFBE | destaques (pode ser texto) |
| Secundária suave | #FCE4E9 | #4E3547 | fundos |
| Sobre secundária | #FFFFFF | #4A1526 | texto sobre a secundária |
| Fundo | #FBF8F3 | #203246 | página |
| Superfície | #FFFFFF | #293E55 | cartões |
| Superfície alternativa | #F1ECE4 | #324A63 | áreas alternadas |
| Texto | #12312F | #F1F4F8 | texto principal |
| Texto secundário | #4A5957 | #C5D0DB | apoio |
| Texto suave | #66716F | #ADBBC9 | legendas |
| Sucesso | #1B7A43 | #8FDCAF | feedback |
| Alerta | #8A5A00 | #F2CD86 | feedback |
| Erro | #B3261E | #FFAAA1 | feedback |
| Informação | #1F5FA6 | #A3D2F8 | feedback |

Cores do logo: símbolo na primária, ponto #E8607A (tema claro) ou #F6AFBE (escuro) e nome no texto principal (#12312F no claro, #F1F4F8 no escuro). O ponto #E8607A é **decorativo** (3,10:1 sobre o fundo claro) e nunca serve para texto.

### Regras de contraste

- Todos os pares de texto/fundo declarados em `tokens-marca.json` atingem ≥ 4,5:1 nos temas claro e escuro (verificado por `node scripts/check-marca.mjs . --contraste`).
- Branco sobre a primária clara: 5,47:1. Texto sobre fundo: 13,16:1 no claro e 11,85:1 no escuro. Menor razão do tema escuro: texto suave sobre superfície alternativa, 4,67:1.
- **Não usar** texto suave sobre superfície alternativa no tema claro (4,30:1).
- Evite a framboesa (#BE3455) e o vermelho de erro (#B3261E) lado a lado como texto: são parecidos. No escuro, o mesmo vale para informação (#A3D2F8) e primária (#9CC7EE).
- Bordas são decorativas e não carregam informação.

## Tipografia

| Uso | Família | Pesos | Licença |
|---|---|---|---|
| Títulos | Bricolage Grotesque | 600, 700 | SIL OFL 1.1 (Google Fonts) |
| Texto e interface | Atkinson Hyperlegible Next | 400, 700 | SIL OFL 1.1 (Google Fonts) |

Atkinson Hyperlegible foi desenhada para máxima legibilidade, o que ajuda quem lê rápido no dia a dia da clínica. Acentos do PT-BR conferidos no board. Se algum ambiente não tiver a Atkinson Hyperlegible Next, use a Atkinson Hyperlegible (400/700, também OFL).

URL do Google Fonts (HTTP 200 em 2026-11-24):

`https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:wght@400;700&family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700&display=swap`

| Nível | Família e peso | Tamanho / entrelinha |
|---|---|---|
| H1 | Bricolage 700 | 48 px / 1,1 (espaçamento −1 px) |
| H2 | Bricolage 700 | 36 px / 1,15 |
| H3 | Bricolage 600 | 24 px / 1,25 |
| Corpo | Atkinson 400 | 16 px / 1,5 |
| Rótulo e botão | Atkinson 700 | 15 px / 1,2 |
| Legenda | Atkinson 400 | 13 px / 1,4 |

## Logo

Nove variantes em `assets/logo/`, cada uma em `.svg` e `.png`, nomeadas `logo-{horizontal|vertical|icone}-{claro|escuro|mono}`:

- **horizontal:** símbolo + nome lado a lado (cabeçalhos, e-mails, documentos).
- **vertical:** símbolo acima do nome (login, capas, redes sociais).
- **ícone:** só o símbolo (favicon, avatar, app).
- **ícone pequeno** (`logo-icone-pequeno-claro` e `-escuro`, arquivos extras): variante óptica com traço mais grosso e ponto maior, para uso **até 32 px** (favicon, abas).
- **claro:** para fundo claro (colorido).
- **escuro:** para fundo escuro (símbolo e nome claros); legível só sobre fundo escuro.
- **mono:** uma cor (#12312F), para impressão e carimbos.

### Área de proteção

Unidade X = altura do "c" do nome (cerca de 64% da altura do logo horizontal e 24,5% da altura do vertical). O respiro entre o símbolo e o nome é de 0,56X, para o símbolo não ser lido como uma letra a mais antes do nome. Deixe no mínimo **1X livre** em todos os lados nos formatos horizontal e vertical. No ícone, a margem livre é ¼ da altura do símbolo.

### Tamanho mínimo

| Formato | Digital | Impresso |
|---|---|---|
| Horizontal | 120 px de largura (≈ 18 px de altura) | 30 mm |
| Vertical | 80 px de largura | 20 mm |
| Ícone | 16 px | 5 mm |

As medidas em mm são recomendações derivadas das de tela, ainda não testadas em impressão.

### Usos a evitar

- Não esticar, girar ou alterar as cores do logo; use as variantes prontas.
- Não colocar o logo `claro` sobre fundo escuro, nem o `escuro` sobre fundo claro.
- Não usar o ponto framboesa decorativo como cor de texto.

## Pontos para o dono revisar

- Os SVG foram escritos a partir da geometria do Pencil e usam **traços** (não contornos preenchidos); se uma gráfica pedir contornos, é preciso "expandir traço" em Inkscape, Illustrator ou Figma.
- Testar `logo-icone-pequeno-*.svg` como favicon real em 16 px: nesse tamanho o ponto tem cerca de 2,9 px e quase encosta no traço.
- Conferir se o enrolado do "C" não lembra "6" ou "9" para quem vê de fora.
- Os SVG podem ser recoloridos por `scripts/gerar-logos.mjs` (tabela `CORES` no topo). Os arquivos `.pen` e os SVG são a fonte do desenho.
- O traço do símbolo é um pouco mais pesado que o do nome (intencional, mas é questão de gosto).
- O espaçamento das letras foi ajustado por regra geométrica; os pares "fl" e "ux" merecem olhar óptico.
- A versão negativa em branco aparece no board, mas não foi exportada como arquivo.
- Tudo é rascunho condicionado à consulta manual do INPI (ver `decisao-nome.md`).

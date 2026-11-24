#!/usr/bin/env node
// Gera os SVG do logo Cuidaflux (símbolo "C em fluxo" + lettering) a partir de uma única geometria.
// Uso: node scripts/gerar-logos.mjs [<dir-saida>] [--geo <arquivo.json>]
//   <dir-saida> padrão: assets/logo (relativo à pasta da marca).
//   --geo grava a geometria calculada (usada para redesenhar os componentes no Pencil).
// Para recolorir: altere SOMENTE a tabela CORES abaixo e rode o script de novo.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------- CORES (única tabela; espelha as variáveis do Pencil) ----------
// simbolo = $primaria · ponto = $secundaria-viva · nome = $texto
const CORES = {
  claro: { simbolo: '#0F766E', ponto: '#E8607A', nome: '#12312F' },
  escuro: { simbolo: '#9CC7EE', ponto: '#F6AFBE', nome: '#F1F4F8' },
  mono: { simbolo: '#12312F', ponto: '#12312F', nome: '#12312F' },
};

// ---------- SÍMBOLO "C em fluxo" ----------
// Linha central feita só de arcos tangentes (sem arestas), sentido horário na tela:
// começa na ponta inferior do C (ângulo `inicio`), contorna pela esquerda e, na ponta
// superior, enrola num arco menor em volta do ponto. Ângulos em graus, 0° = direita, 90° = baixo.
const SIMBOLO = {
  // desenho normal (≥ 32 px de altura)
  normal: { raio: 98, traco: 27, inicio: 52, arcos: [[98, 296], [39, 296 + 172]], ponto: 15.5 },
  // variante óptica (≤ 24 px): traço mais grosso, ponto maior, enrolado mais aberto
  pequeno: { raio: 92, traco: 34, inicio: 50, arcos: [[92, 300], [46, 300 + 120]], ponto: 21 },
};

// ---------- LETTERING "cuidaflux" (linha central; base 150, altura-x 50..150, ascendente 0) ----------
const u = (x) => [['M', x, 50], ['L', x, 105], ['A', 45, 0, 0, x + 90, 105], ['M', x + 90, 50], ['L', x + 90, 150]];
const bojo = (cx) => [['M', cx + 50, 100], ['A', 50, 1, 0, cx - 50, 100], ['A', 50, 1, 0, cx + 50, 100]];
const NOME = [
  ['M', 85.36, 64.64], ['A', 50, 1, 0, 85.36, 135.36],
  ...u(120),
  ['M', 262, 50], ['L', 262, 150],
  ...bojo(356), ['M', 406, 0], ['L', 406, 150],
  ...bojo(500), ['M', 550, 50], ['L', 550, 150],
  ['M', 612, 150], ['L', 612, 40], ['A', 40, 0, 1, 652, 0], ['L', 658, 0], ['M', 586, 50], ['L', 644, 50],
  ['M', 698, 0], ['L', 698, 150],
  ...u(750),
  ['M', 880, 50], ['L', 964, 150], ['M', 964, 50], ['L', 880, 150],
];
const NOME_PINGO = [262, 13, 12];
const NOME_TRACO = 18;
const NOME_LARGURA = 964;
const ALTURA_X = 100 + NOME_TRACO; // X da área de proteção = altura do "c"

// ---------- LAYOUT ----------
const MARGEM = 4;
const ESPACO_HORIZONTAL = 0.56 * ALTURA_X; // distância símbolo → nome (evita ler "c cuidaflux")
const ESPACO_VERTICAL = 56;

const r2 = (n) => Math.round(n * 100) / 100;
const rad = (g) => (g * Math.PI) / 180;
const polar = (c, raio, ang) => [c[0] + raio * Math.cos(rad(ang)), c[1] + raio * Math.sin(rad(ang))];

/** Linha central do símbolo com origem no centro do C; devolve comandos, caixa e centro do ponto. */
function desenharSimbolo(def) {
  let centro = [0, 0];
  let raio = def.raio;
  let ang = def.inicio;
  const cmds = [['M', ...polar(centro, raio, ang)]];
  const amostras = [polar(centro, raio, ang)];
  for (const [novoRaio, fim] of def.arcos) {
    const junta = polar(centro, raio, ang);
    centro = polar(junta, -novoRaio, ang);
    raio = novoRaio;
    for (let a = ang; a < fim; a += 1) amostras.push(polar(centro, raio, a));
    const partes = Math.ceil((fim - ang) / 170);
    for (let i = 1; i <= partes; i += 1) {
      cmds.push(['A', raio, 0, 1, ...polar(centro, raio, ang + ((fim - ang) * i) / partes)]);
    }
    ang = fim;
    amostras.push(polar(centro, raio, ang));
  }
  const m = def.traco / 2;
  const xs = amostras.map((p) => p[0]);
  const ys = amostras.map((p) => p[1]);
  const caixa = { x0: Math.min(...xs) - m, x1: Math.max(...xs) + m, y0: Math.min(...ys) - m, y1: Math.max(...ys) + m };
  return { cmds, caixa, ponto: [centro[0], centro[1], def.ponto], traco: def.traco };
}

/** Aplica escala uniforme k e translação a uma lista de comandos e devolve o atributo `d`. */
function caminho(cmds, k, dx, dy) {
  return cmds.map((c) => {
    if (c[0] === 'A') return `A${r2(c[1] * k)} ${r2(c[1] * k)} 0 ${c[2]} ${c[3]} ${r2(c[4] * k + dx)} ${r2(c[5] * k + dy)}`;
    return `${c[0]}${r2(c[1] * k + dx)} ${r2(c[2] * k + dy)}`;
  }).join('');
}

function montar(formato) {
  const pequeno = formato === 'icone-pequeno';
  const s = desenharSimbolo(pequeno ? SIMBOLO.pequeno : SIMBOLO.normal);
  const sl = s.caixa.x1 - s.caixa.x0;
  const sa = s.caixa.y1 - s.caixa.y0;
  let W; let H; let k; let sx; let sy; let nx = null; let ny = null;
  if (formato === 'horizontal') {
    k = 176 / sa;
    sx = MARGEM - s.caixa.x0 * k;
    sy = MARGEM - s.caixa.y0 * k;
    nx = MARGEM + sl * k + ESPACO_HORIZONTAL + NOME_TRACO / 2;
    ny = MARGEM + NOME_TRACO / 2 + 4;
    W = nx + NOME_LARGURA + NOME_TRACO / 2 + MARGEM;
    H = 176 + 2 * MARGEM;
  } else if (formato === 'vertical') {
    k = 250 / sa;
    W = NOME_LARGURA + NOME_TRACO + 2 * MARGEM;
    sx = (W - sl * k) / 2 - s.caixa.x0 * k;
    sy = MARGEM - s.caixa.y0 * k;
    nx = MARGEM + NOME_TRACO / 2;
    ny = MARGEM + 250 + ESPACO_VERTICAL + NOME_TRACO / 2;
    H = ny + 150 + NOME_TRACO / 2 + MARGEM;
  } else {
    W = 256; H = 256;
    k = (pequeno ? 240 : 224) / Math.max(sa, sl);
    sx = (W - sl * k) / 2 - s.caixa.x0 * k;
    sy = (H - sa * k) / 2 - s.caixa.y0 * k;
  }
  return {
    W: r2(W), H: r2(H),
    simbolo: { d: caminho(s.cmds, k, sx, sy), traco: r2(s.traco * k), caixa: [r2(s.caixa.x0 * k + sx), r2(s.caixa.y0 * k + sy), r2(sl * k), r2(sa * k)] },
    ponto: [r2(s.ponto[0] * k + sx), r2(s.ponto[1] * k + sy), r2(s.ponto[2] * k)],
    nome: nx === null ? null : { d: caminho(NOME, 1, nx, ny), traco: NOME_TRACO, x0: r2(nx - NOME_TRACO / 2), topoX: r2(ny + 50 - NOME_TRACO / 2), base: r2(ny + 150 + NOME_TRACO / 2) },
    pingo: nx === null ? null : [r2(NOME_PINGO[0] + nx), r2(NOME_PINGO[1] + ny), NOME_PINGO[2]],
  };
}

function svg(g, cor) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${g.W} ${g.H}" width="${g.W}" height="${g.H}" role="img" aria-labelledby="t"><title id="t">Cuidaflux</title>`
    + '<g fill="none" stroke-linecap="round" stroke-linejoin="round">'
    + `<path d="${g.simbolo.d}" stroke="${cor.simbolo}" stroke-width="${g.simbolo.traco}"/>`
    + (g.nome ? `<path d="${g.nome.d}" stroke="${cor.nome}" stroke-width="${g.nome.traco}"/>` : '')
    + '</g>'
    + `<circle cx="${g.ponto[0]}" cy="${g.ponto[1]}" r="${g.ponto[2]}" fill="${cor.ponto}"/>`
    + (g.pingo ? `<circle cx="${g.pingo[0]}" cy="${g.pingo[1]}" r="${g.pingo[2]}" fill="${cor.ponto}"/>` : '')
    + '</svg>\n';
}

const args = process.argv.slice(2);
const geoIdx = args.indexOf('--geo');
const geoPath = geoIdx >= 0 ? args.splice(geoIdx, 2)[1] : null;
const raizMarca = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const saida = resolve(args[0] ?? join(raizMarca, 'assets', 'logo'));
mkdirSync(saida, { recursive: true });

const FORMATOS = { horizontal: ['claro', 'escuro', 'mono'], vertical: ['claro', 'escuro', 'mono'], icone: ['claro', 'escuro', 'mono'], 'icone-pequeno': ['claro', 'escuro'] };
const geo = {};
for (const [formato, versoes] of Object.entries(FORMATOS)) {
  geo[formato] = montar(formato);
  for (const versao of versoes) {
    writeFileSync(join(saida, `logo-${formato}-${versao}.svg`), svg(geo[formato], CORES[versao]));
  }
}
if (geoPath) writeFileSync(resolve(geoPath), JSON.stringify({ cores: CORES, alturaX: ALTURA_X, formatos: geo }, null, 1));
console.log(`SVG gravados em ${saida}`);

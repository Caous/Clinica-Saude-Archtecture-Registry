#!/usr/bin/env node
// Verificador do brand book (padrao: <raiz>/context/marca/). Node 22+, sem dependencias.
// Uso: node check-marca.mjs [<raiz>] [--contraste] [--assets] [--docs] [--links] [--marca <dir>]
//   <raiz>  raiz do registry (padrao: diretorio atual). Sem flag de modo, roda os quatro.
//   --marca <dir>  diretorio do brand book (relativo ao cwd ou absoluto); deve existir.
//                  Padrao: <raiz>/context/marca. Abaixo, "pasta da marca" = esse diretorio.
//   exit 0 = ok, 1 = pendencias, 2 = erro de uso.
//
// --contraste  le <marca>/tokens-marca.json. Schema:
//   { "cores": { "<chave>": "#rrggbb" },
//     "pares": [ { "tema": "claro"|"escuro", "texto": "<chave>", "fundo": "<chave>" } ] }
//   Hex invalido falha apontando a chave; par com chave inexistente falha; exige pares
//   nos dois temas; razao WCAG 2.x (luminancia relativa sRGB) minima 4.5.
//
// --assets     exige em <marca>/assets/logo/ as 9 variantes
//   logo-{horizontal|vertical|icone}-{claro|escuro|mono} em .svg e .png (18 arquivos);
//   cada SVG com <title>, viewBox e <= 20 KB; e <marca>/assets/ORIGEM.md citando
//   o nome de cada um dos 18 arquivos.
//
// --docs       estrutura minima (cabecalhos de markdown comparados sem acento/caixa):
//   concorrentes-marca.md  tabela com colunas nome, url, data, posicionamento, tom, cores,
//                          fonte e >= 8 linhas; secao "Lacunas de marca" com >= 3 itens de lista.
//   naming.md              secao "Candidatos" com >= 10 itens de lista; secao "Finalistas" com
//                          >= 3 subsecoes "### <nome>", cada uma com itens de lista
//                          "Dominio .com.br:", "Dominio .com:", "Instagram:", "LinkedIn:" e
//                          "INPI NCL 9|42|44:", todos com data AAAA-MM-DD; INPI com link
//                          (http) ou a palavra "protocolo".
//   decisao-nome.md        secoes "Nome final", "Justificativa", "Riscos" e uma linha
//                          "Aprovado por: <nome> em <AAAA-MM-DD>" (data valida).
//   identidade.md          secoes "Missao", "Visao", "Valores" (3-6 itens), "Historia",
//                          "Proposta de valor", "Slogan" (1a linha com <= 8 palavras) e
//                          "Tom de voz" com >= 3 subsecoes "### <atributo>", cada uma com
//                          linhas "Diga: ..." e "Nao diga: ...".
//
// --links      links/imagens markdown relativos de todos os .md de <marca>/ devem
//   resolver (ignora http(s), mailto, ancoras puras e blocos de codigo cercados).
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative, isAbsolute, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const MODES = ['contraste', 'assets', 'docs', 'links'];
const USAGE = 'Uso: node check-marca.mjs [<raiz>] [--contraste] [--assets] [--docs] [--links] [--marca <dir>]';
const MIN_CONTRAST = 4.5;
const MAX_SVG_BYTES = 20 * 1024;
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;
const ISO_DATE = /(?<!\d)\d{4}-\d{2}-\d{2}(?!\d)/;
const THEMES = ['claro', 'escuro'];
export const LOGO_VARIANTS =['horizontal', 'vertical', 'icone'].flatMap((form) =>
  ['claro', 'escuro', 'mono'].map((tone) => `logo-${form}-${tone}`));
const LOGO_FILES = LOGO_VARIANTS.flatMap((variant) => [`${variant}.svg`, `${variant}.png`]);

// ---------- utilitarios puros ----------
const defaultMarcaDirOf = (root) => join(resolve(root), 'context', 'marca');

function normalize(text) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[*_`:]/g, '').trim();
}

function isValidIsoDate(text) {
  const date = new Date(`${text}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(text);
}

const isListItem = (line) => /^\s*([-*]|\d+\.)\s+\S/.test(line);

/** Le um arquivo; retorna { content } ou { code } (codigo de erro de I/O, ex.: ENOENT, EISDIR). */
function tryReadFile(path) {
  try {
    return { content: readFileSync(path) };
  } catch (error) {
    if (typeof error?.code !== 'string') throw error;
    return { code: error.code };
  }
}

/** Le texto de <marca>/<name>; ausente ou ilegivel vira pendencia e retorna null. */
function readMarcaFile(marcaDir, name, problems) {
  const result = tryReadFile(join(marcaDir, name));
  if (result.code === 'ENOENT') problems.push(`${name}: arquivo ausente na pasta da marca`);
  else if (result.code) problems.push(`${name}: nao foi possivel ler (${result.code})`);
  else return result.content.toString('utf8');
  return null;
}

// ---------- contraste ----------
function relativeLuminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Razao de contraste WCAG 2.x entre duas cores "#rrggbb" (1 a 21). */
export function contrastRatio(hexA, hexB) {
  const [lighter, darker] = [relativeLuminance(hexA), relativeLuminance(hexB)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

function findInvalidColors(colors) {
  return Object.entries(colors)
    .filter(([, value]) => typeof value !== 'string' || !HEX_COLOR.test(value))
    .map(([key, value]) => `tokens-marca.json: cor "${key}" invalida (${JSON.stringify(value)}); use "#rrggbb"`);
}

function checkPair(pair, colors) {
  const where = `par ${pair.tema}: ${pair.texto} sobre ${pair.fundo}`;
  const missing = [pair.texto, pair.fundo].filter((key) => !Object.hasOwn(colors, key));
  if (missing.length > 0) return [`tokens-marca.json: ${where} referencia chave inexistente: ${missing.join(', ')}`];
  if (!HEX_COLOR.test(colors[pair.texto]) || !HEX_COLOR.test(colors[pair.fundo])) return [];
  const ratio = contrastRatio(colors[pair.texto], colors[pair.fundo]);
  if (ratio >= MIN_CONTRAST) return [];
  // trunca (nao arredonda) para nunca exibir "4.50:1 < 4.5:1"
  const shownRatio = (Math.floor(ratio * 100) / 100).toFixed(2);
  return [`tokens-marca.json: ${where} reprovado, contraste ${shownRatio}:1 < ${MIN_CONTRAST}:1`];
}

/** Valida um objeto de tokens; retorna lista de pendencias. */
export function checkTokens(tokens) {
  const { cores, pares } = tokens ?? {};
  if (typeof cores !== 'object' || cores === null || Array.isArray(cores) || !Array.isArray(pares)) {
    return ['tokens-marca.json: schema invalido; esperado { "cores": {...}, "pares": [...] }'];
  }
  const problems = findInvalidColors(cores);
  const isWellFormedPair = (pair) => pair !== null && typeof pair === 'object'
    && ['tema', 'texto', 'fundo'].every((field) => typeof pair[field] === 'string');
  pares.forEach((pair, index) => {
    if (!isWellFormedPair(pair)) problems.push(`tokens-marca.json: pares[${index}] invalido; esperado { "tema": "claro|escuro", "texto": "<chave>", "fundo": "<chave>" }`);
  });
  const validPairs = pares.filter(isWellFormedPair);
  for (const theme of THEMES) {
    if (!validPairs.some((pair) => pair.tema === theme)) problems.push(`tokens-marca.json: nenhum par declarado no tema "${theme}"`);
  }
  for (const pair of validPairs) {
    if (!THEMES.includes(pair.tema)) problems.push(`tokens-marca.json: par com tema invalido ${JSON.stringify(pair.tema)} (use claro|escuro)`);
    else problems.push(...checkPair(pair, tokens.cores));
  }
  return problems;
}

export function checkContraste(root, marcaDir = defaultMarcaDirOf(root)) {
  const problems = [];
  const raw = readMarcaFile(marcaDir, 'tokens-marca.json', problems);
  if (raw === null) return problems;
  try {
    return checkTokens(JSON.parse(raw));
  } catch (error) {
    return [`tokens-marca.json: JSON malformado (${error.message})`];
  }
}

// ---------- assets ----------
function checkSvg(path, name) {
  const result = tryReadFile(path);
  if (result.code === 'ENOENT') return [`assets/logo/${name}: arquivo ausente`];
  if (result.code) return [`assets/logo/${name}: nao foi possivel ler (${result.code})`];
  const size = result.content.length;
  const content = result.content.toString('utf8');
  const problems = [];
  if (size > MAX_SVG_BYTES) problems.push(`assets/logo/${name}: SVG com ${size} bytes (> ${MAX_SVG_BYTES})`);
  if (!/<title[\s>]/i.test(content)) problems.push(`assets/logo/${name}: SVG sem <title>`);
  if (!/viewBox\s*=/.test(content)) problems.push(`assets/logo/${name}: SVG sem viewBox`);
  return problems;
}

export function checkAssets(root, marcaDir = defaultMarcaDirOf(root)) {
  const logoDir = join(marcaDir, 'assets', 'logo');
  const problems = [];
  for (const name of LOGO_FILES) {
    const path = join(logoDir, name);
    if (name.endsWith('.svg')) problems.push(...checkSvg(path, name));
    else if (!existsSync(path)) problems.push(`assets/logo/${name}: arquivo ausente`);
  }
  const origem = readMarcaFile(marcaDir, 'assets/ORIGEM.md', problems);
  if (origem === null) return problems;
  for (const name of LOGO_FILES) {
    if (!origem.includes(name)) problems.push(`assets/ORIGEM.md: sem entrada para ${name}`);
  }
  return problems;
}

// ---------- docs ----------
/** Retorna { level, lines } da secao cujo titulo normalizado e `title`, ou null. */
function findSection(markdown, title) {
  const lines = markdown.split(/\r?\n/);
  const headingOf = (line) => /^(#{1,6})\s+(.*)$/.exec(line);
  const start = lines.findIndex((line) => {
    const heading = headingOf(line);
    return heading && normalize(heading[2]) === normalize(title);
  });
  if (start === -1) return null;
  const level = headingOf(lines[start])[1].length;
  const body = [];
  for (const line of lines.slice(start + 1)) {
    const heading = headingOf(line);
    if (heading && heading[1].length <= level) break;
    body.push(line);
  }
  return { level, lines: body };
}

function splitSubsections(section) {
  const subsections = [];
  for (const line of section.lines) {
    const heading = new RegExp(`^#{${section.level + 1}}\\s+(.*)$`).exec(line);
    if (heading) subsections.push({ title: heading[1].trim(), lines: [] });
    else if (subsections.length > 0) subsections.at(-1).lines.push(line);
  }
  return subsections;
}

function requireSections(doc, markdown, titles, problems) {
  const found = {};
  for (const title of titles) {
    found[title] = findSection(markdown, title);
    if (!found[title]) problems.push(`${doc}: secao "${title}" ausente`);
  }
  return found;
}

function checkConcorrentes(markdown) {
  const doc = 'concorrentes-marca.md';
  const problems = [];
  const rows = markdown.split(/\r?\n/).filter((line) => line.trim().startsWith('|'))
    .filter((line) => !/^\s*\|[\s:|-]+\|\s*$/.test(line));
  const header = normalize(rows[0] ?? '');
  for (const column of ['nome', 'url', 'data', 'posicionamento', 'tom', 'cores', 'fonte']) {
    if (!header.includes(column)) problems.push(`${doc}: coluna "${column}" ausente na tabela`);
  }
  if (rows.length - 1 < 8) problems.push(`${doc}: ${Math.max(rows.length - 1, 0)} concorrente(s); minimo 8`);
  const gaps = findSection(markdown, 'Lacunas de marca');
  if (!gaps) problems.push(`${doc}: secao "Lacunas de marca" ausente`);
  else if (gaps.lines.filter(isListItem).length < 3) problems.push(`${doc}: "Lacunas de marca" precisa de >= 3 itens`);
  return problems;
}

const FINALIST_FIELDS = [
  { label: 'dominio .com.br' }, { label: 'dominio .com' }, { label: 'instagram' }, { label: 'linkedin' },
  { label: 'inpi ncl 9', needsEvidence: true }, { label: 'inpi ncl 42', needsEvidence: true }, { label: 'inpi ncl 44', needsEvidence: true },
];

function checkFinalist(finalist) {
  const problems = [];
  const items = finalist.lines.filter(isListItem).map((line) => line.replace(/^\s*([-*]|\d+\.)\s+/, ''));
  for (const { label, needsEvidence } of FINALIST_FIELDS) {
    // normalize() remove ":", entao o rotulo e seguido de qualquer coisa exceto "." ou caractere de palavra
    // (evita confundir ".com" com ".com.br" e "NCL 4" com "NCL 42").
    const item = items.find((text) => {
      const normalized = normalize(text);
      return normalized.startsWith(label) && !/^[.\w]/.test(normalized.slice(label.length));
    });
    const where = `naming.md: finalista "${finalist.title}", campo "${label}"`;
    if (!item) problems.push(`${where} ausente`);
    else if (!ISO_DATE.test(item)) problems.push(`${where} sem data AAAA-MM-DD`);
    else if (!isValidIsoDate(ISO_DATE.exec(item)[0])) problems.push(`${where} com data invalida (${ISO_DATE.exec(item)[0]})`);
    else if (needsEvidence && !/https?:\/\/|protocolo/i.test(item)) problems.push(`${where} sem link ou protocolo`);
  }
  return problems;
}

function checkNaming(markdown) {
  const problems = [];
  const sections = requireSections('naming.md', markdown, ['Candidatos', 'Finalistas'], problems);
  const candidates = sections.Candidatos?.lines.filter(isListItem).length ?? 0;
  if (sections.Candidatos && candidates < 10) problems.push(`naming.md: ${candidates} candidato(s); minimo 10`);
  if (!sections.Finalistas) return problems;
  const finalists = splitSubsections(sections.Finalistas);
  if (finalists.length < 3) problems.push(`naming.md: ${finalists.length} finalista(s); minimo 3`);
  for (const finalist of finalists) problems.push(...checkFinalist(finalist));
  return problems;
}

function checkDecisao(markdown) {
  const problems = [];
  requireSections('decisao-nome.md', markdown, ['Nome final', 'Justificativa', 'Riscos'], problems);
  const approval = /^\s*Aprovado por:\s*(.+?)\s+em\s+(\d{4}-\d{2}-\d{2})\s*$/m.exec(markdown);
  if (!approval) problems.push('decisao-nome.md: linha "Aprovado por: <nome> em <AAAA-MM-DD>" ausente');
  else if (!isValidIsoDate(approval[2])) problems.push(`decisao-nome.md: data de aprovacao invalida (${approval[2]})`);
  return problems;
}

function checkTomDeVoz(section) {
  const doc = 'identidade.md';
  const attributes = splitSubsections(section);
  const problems = attributes.length < 3 ? [`${doc}: "Tom de voz" com ${attributes.length} atributo(s); minimo 3`] : [];
  for (const { title, lines } of attributes) {
    const normalized = lines.map(normalize);
    if (!normalized.some((line) => /^[-*\s]*diga(\s|$)/.test(line))) problems.push(`${doc}: atributo "${title}" sem exemplo "Diga:"`);
    if (!normalized.some((line) => /^[-*\s]*nao diga(\s|$)/.test(line))) problems.push(`${doc}: atributo "${title}" sem exemplo "Não diga:"`);
  }
  return problems;
}

function checkIdentidade(markdown) {
  const doc = 'identidade.md';
  const titles = ['Missão', 'Visão', 'Valores', 'História', 'Proposta de valor', 'Slogan', 'Tom de voz'];
  const problems = [];
  const sections = requireSections(doc, markdown, titles, problems);
  if (sections.Valores) {
    const count = sections.Valores.lines.filter(isListItem).length;
    if (count < 3 || count > 6) problems.push(`${doc}: ${count} valor(es); esperado de 3 a 6`);
  }
  if (sections.Slogan) {
    const slogan = (sections.Slogan.lines.find((line) => line.trim()) ?? '').replace(/^\s*([-*]\s+)?/, '').replace(/["“”*_]/g, '').trim();
    const words = slogan ? slogan.split(/\s+/).length : 0;
    if (words === 0 || words > 8) problems.push(`${doc}: slogan com ${words} palavra(s); esperado de 1 a 8`);
  }
  if (sections['Tom de voz']) problems.push(...checkTomDeVoz(sections['Tom de voz']));
  return problems;
}

const DOC_CHECKS = [
  ['concorrentes-marca.md', checkConcorrentes],
  ['naming.md', checkNaming],
  ['decisao-nome.md', checkDecisao],
  ['identidade.md', checkIdentidade],
];

export function checkDocs(root, marcaDir = defaultMarcaDirOf(root)) {
  const problems = [];
  for (const [name, check] of DOC_CHECKS) {
    const markdown = readMarcaFile(marcaDir, name, problems);
    if (markdown !== null) problems.push(...check(markdown));
  }
  return problems;
}

// ---------- links ----------
const LINK_PATTERN = /!?\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g;
// qualquer esquema (http:, tel:, ftp:, data:, file:...), //host e ancora pura
const EXTERNAL_TARGET = /^([a-z][a-z0-9+.-]*:|\/\/|#)/i;
const WINDOWS_DRIVE_TARGET = /^[a-z]:[\\/]/i; // "C:\x" pareceria um esquema "c:"

function listMarkdownFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return listMarkdownFiles(full);
    return entry.isFile() && entry.name.toLowerCase().endsWith('.md') ? [full] : [];
  });
}

function extractLinks(markdown) {
  const links = [];
  let insideFence = false;
  markdown.split(/\r?\n/).forEach((text, index) => {
    if (/^\s*(```|~~~)/.test(text)) { insideFence = !insideFence; return; }
    if (insideFence) return;
    for (const match of text.matchAll(LINK_PATTERN)) links.push({ target: match[1], line: index + 1 });
  });
  return links;
}

/** Retorna a descricao do problema do link relativo `target`, ou null se estiver ok/ignorado. */
function describeLinkProblem(target, fromDir, marcaDir) {
  if (WINDOWS_DRIVE_TARGET.test(target)) return `link absoluto "${target}"; use caminho relativo`;
  if (EXTERNAL_TARGET.test(target)) return null;
  const pathPart = target.split('#')[0].split('?')[0];
  if (!pathPart) return null;
  let decoded = pathPart;
  try { decoded = decodeURIComponent(pathPart); } catch { /* mantem o texto original */ }
  if (isAbsolute(decoded)) return `link absoluto "${target}"; use caminho relativo`;
  const resolved = resolve(fromDir, decoded);
  const fromMarca = relative(marcaDir, resolved);
  if (fromMarca === '..' || fromMarca.startsWith(`..${sep}`) || isAbsolute(fromMarca)) {
    return `link "${target}" aponta para fora da pasta da marca`;
  }
  return existsSync(resolved) ? null : `link quebrado "${target}"`;
}

export function checkLinks(root, marcaDir = defaultMarcaDirOf(root)) {
  if (!existsSync(marcaDir)) return [`${marcaDir}: diretorio da marca ausente`];
  const problems = [];
  for (const file of listMarkdownFiles(marcaDir)) {
    const shownPath = file.slice(marcaDir.length + 1).split('\\').join('/');
    for (const { target, line } of extractLinks(readFileSync(file, 'utf8'))) {
      const problem = describeLinkProblem(target, dirname(file), marcaDir);
      if (problem) problems.push(`${shownPath}:${line}: ${problem}`);
    }
  }
  return problems;
}

// ---------- CLI ----------
const CHECKS = { contraste: checkContraste, assets: checkAssets, docs: checkDocs, links: checkLinks };

export function parseArgs(argv) {
  const positional = [];
  const modes = [];
  let marca;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) { positional.push(arg); continue; }
    if (arg === '--marca') {
      const value = argv[i + 1];
      if (value === undefined || value.startsWith('--')) throw new Error(`--marca exige um diretorio. ${USAGE}`);
      marca = value;
      i++;
      continue;
    }
    const mode = arg.slice(2);
    if (!MODES.includes(mode)) throw new Error(`flag desconhecida: ${arg}. ${USAGE}`);
    modes.push(mode);
  }
  if (positional.length > 1) throw new Error(USAGE);
  return { root: positional[0] ?? '.', modes: modes.length > 0 ? modes : MODES, marca };
}

/** Executa os modos e retorna { mode, problems }[]. */
export function runModes(root, modes, marcaDir = defaultMarcaDirOf(root)) {
  return modes.map((mode) => ({ mode, problems: CHECKS[mode](root, marcaDir) }));
}

function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
    if (!statSync(args.root).isDirectory()) throw new Error(`raiz nao e um diretorio: ${args.root}`);
    if (args.marca !== undefined) {
      if (!existsSync(args.marca)) throw new Error(`--marca: diretorio nao encontrado: ${args.marca}`);
      if (!statSync(args.marca).isDirectory()) throw new Error(`--marca: nao e um diretorio: ${args.marca}`);
    }
  } catch (error) {
    console.error(`check-marca: ${error.code === 'ENOENT' ? `raiz nao encontrada: ${process.argv.slice(2).find((a) => !a.startsWith('--'))}` : error.message}`);
    process.exitCode = 2;
    return;
  }

  let results;
  try {
    results = runModes(args.root, args.modes, args.marca === undefined ? undefined : resolve(args.marca));
  } catch (error) {
    console.error(`check-marca: erro de I/O ao verificar ${args.root}: ${error.code ?? ''} ${error.message}`.replace('  ', ' '));
    process.exitCode = 2;
    return;
  }
  let total = 0;
  for (const { mode, problems } of results) {
    for (const problem of problems) console.log(`[${mode}] ${problem}`);
    console.log(`check-marca --${mode}: ${problems.length === 0 ? 'ok' : `${problems.length} pendencia(s)`}`);
    total += problems.length;
  }
  if (total > 0) {
    console.error(`check-marca: ${total} pendencia(s).`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();

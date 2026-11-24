#!/usr/bin/env node
// Verificador dos documentos de negocio (padrao: <raiz>/context/negocio/). Node 22+, sem dependencias.
// Uso: node check-negocio.mjs [<raiz>] [--docs] [--links] [--arquivos] [--negocio <dir>]
//   <raiz>  raiz do registry (padrao: diretorio atual). Sem flag de modo, roda os tres.
//   --negocio <dir>  diretorio dos documentos (relativo ao cwd ou absoluto); deve existir.
//                    Padrao: <raiz>/context/negocio. Abaixo, "pasta de negocio" = esse diretorio.
//   exit 0 = ok, 1 = pendencias, 2 = erro de uso ou de I/O.
//
// Convencoes de leitura (cabecalhos, rotulos e colunas sao comparados sem acento/caixa/enfase):
//   - "tabela sob <secao>": primeiro bloco contiguo de linhas "| ... |" dentro da secao; a 1a linha e o
//     cabecalho; as colunas obrigatorias podem vir em qualquer ordem; colunas extras sao aceitas.
//   - "rotulo": linha "Rotulo: valor" (opcionalmente item de lista e/ou **negrito**). Se o valor
//     ficar vazio na linha, valem os itens de lista imediatamente abaixo.
//   - datas: AAAA-MM-DD validas no calendario.
//   - "Aprovado por: <nome> em <AAAA-MM-DD>": nome nao vazio e data valida.
//
// --docs  estrutura minima de cada documento (documento ausente/ilegivel vira pendencia):
//   mercado.md        tabela sob "Matriz de nichos" com colunas: nicho | tamanho de mercado | fonte | data |
//                     dor principal | ticket | adequacao do sistema | nota; exatamente 11 linhas, todas as
//                     celulas preenchidas; fonte = URL http(s) ou a palavra "hipotese"; data valida;
//                     nota = numero de 0 a 10.
//                     Secao "Decisao de nicho": "Nicho de entrada:" (valor nao vazio), "Nichos de expansao:"
//                     (1 a 2 itens, separados por virgula/ponto e virgula ou em itens de lista) e
//                     "Aprovado por: <nome> em <AAAA-MM-DD>".
//   concorrentes.md   tabela sob "Concorrentes" com colunas: nome | url | data | funcionalidades | preco |
//                     modelo de cobranca | pontos fortes | pontos fracos; >= 8 linhas, url http(s), data
//                     valida, celulas preenchidas ("nao confirmado" e um valor valido).
//                     Secao "Espaco de diferenciacao" com >= 3 itens de lista.
//   precificacao.md   "Aprovado por: <nome> em <AAAA-MM-DD>" e "Margem bruta minima: <n>%" (0 < n <= 100).
//   icp-personas.md   >= 2 secoes "## Persona: <nome>", cada uma com os rotulos Perfil:, Dores:,
//                     Gatilhos de compra:, Objecoes:, Criterios de decisao:, todos nao vazios.
//   modelo-negocio.md subsecoes "### (a) ..." ate "### (e) ...", cada uma com os rotulos Receita:, Custo:,
//                     Risco:, Esforco tecnico:, Adequacao:, todos nao vazios.
//   go-to-market.md   secao "Canais" com >= 6 itens de lista; secao "Funil" com tabela
//                     etapa | taxa minima | taxa maxima | hipotese (taxas em %, 0-100, minimo <= maximo,
//                     hipotese = "sim"); secoes "Oferta de lancamento" e "Plano de 90 dias" nao vazias.
//   riscos-prerequisitos.md  tabela (em qualquer ponto do documento) risco | tipo | PBI sugerido com
//                     >= 5 linhas; "risco" e "PBI sugerido" nao vazios.
//
// --links     links/imagens markdown relativos de todos os .md da pasta de negocio devem resolver e
//   ficar dentro dela (ignora http(s) e demais esquemas, ancoras puras e blocos de codigo cercados).
//   Nao exige conteudo dos documentos.
//
// --arquivos  exige na pasta de negocio os 13 arquivos obrigatorios (REQUIRED_FILES); o .xlsx so tem
//   a existencia verificada.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative, isAbsolute, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const MODES = ['docs', 'links', 'arquivos'];
const USAGE = 'Uso: node check-negocio.mjs [<raiz>] [--docs] [--links] [--arquivos] [--negocio <dir>]';
const ISO_DATE = /(?<!\d)\d{4}-\d{2}-\d{2}(?!\d)/;
const HTTP_URL = /^https?:\/\/\S+$/i;
const APPROVAL_VALUE = /^(.+?)\s+em\s+(\d{4}-\d{2}-\d{2})$/;
const MARKET_NICHE_COUNT = 11;
const MIN_COMPETITORS = 8;
const MIN_DIFFERENTIATORS = 3;
const MIN_PERSONAS = 2;
const MIN_CHANNELS = 6;
const MIN_RISKS = 5;

export const REQUIRED_FILES = [
  'mercado.md', 'icp-personas.md', 'concorrentes.md', 'modelo-negocio.md', 'precificacao.md',
  'go-to-market.md', 'script-vendas.md', 'demo-roteiro.md', 'objecoes-faq.md', 'proposta-modelo.md',
  'riscos-prerequisitos.md', 'README.md', 'modelo-financeiro.xlsx',
];

// ---------- utilitarios puros ----------
const defaultNegocioDirOf = (root) => join(resolve(root), 'context', 'negocio');

function normalize(text) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[*_`:]/g, '').trim();
}

function isValidIsoDate(text) {
  const date = new Date(`${text}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(text);
}

const isListItem = (line) => /^\s*([-*]|\d+\.)\s+\S/.test(line);
const stripListMarker = (line) => line.replace(/^\s*([-*+]|\d+\.)\s+/, '');
const isFilled = (text) => typeof text === 'string' && text.trim() !== '';

/** Descreve o problema de uma data AAAA-MM-DD em `text`, ou null se valida. */
function describeDateProblem(text) {
  const match = ISO_DATE.exec(text ?? '');
  if (!match) return 'sem data AAAA-MM-DD';
  return isValidIsoDate(match[0]) ? null : `com data invalida (${match[0]})`;
}

const MAX_FILE_BYTES = 1024 * 1024;
const TOO_LARGE_MESSAGE = 'arquivo muito grande (>1 MB)';

/** Le um arquivo; retorna { content }, { tooLarge } (> 1 MB, sem ler) ou { code } (erro de I/O, ex.: ENOENT, EISDIR). */
function tryReadFile(path) {
  try {
    if (statSync(path).size > MAX_FILE_BYTES) return { tooLarge: true };
    return { content: readFileSync(path) };
  } catch (error) {
    if (typeof error?.code !== 'string') throw error;
    return { code: error.code };
  }
}

/** Le texto de <negocio>/<name>; ausente ou ilegivel vira pendencia e retorna null. */
function readNegocioFile(negocioDir, name, problems) {
  const result = tryReadFile(join(negocioDir, name));
  if (result.code === 'ENOENT') problems.push(`${name}: arquivo ausente na pasta de negocio`);
  else if (result.tooLarge) problems.push(`${name}: ${TOO_LARGE_MESSAGE}`);
  else if (result.code) problems.push(`${name}: nao foi possivel ler (${result.code})`);
  else return result.content.toString('utf8').replace(/^\uFEFF/, '');
  return null;
}

// ---------- leitura de markdown ----------
const headingOf = (line) => /^(#{1,6})\s+(.*)$/.exec(line);

/** Retorna { level, lines } da secao cujo titulo normalizado e `title`, ou null. */
function findSection(markdown, title) {
  const lines = markdown.split(/\r?\n/);
  const start = lines.findIndex((line) => {
    const heading = headingOf(line);
    return heading && normalize(heading[2]) === normalize(title);
  });
  if (start === -1) return null;
  return sectionFrom(lines, start);
}

function sectionFrom(lines, start) {
  const level = headingOf(lines[start])[1].length;
  const body = [];
  for (const line of lines.slice(start + 1)) {
    const heading = headingOf(line);
    if (heading && heading[1].length <= level) break;
    body.push(line);
  }
  return { level, title: headingOf(lines[start])[2].trim(), lines: body };
}

/** Todas as secoes cujo titulo satisfaz `matches(titulo)`; `title` e o texto original do cabecalho. */
function findSectionsWhere(markdown, matches) {
  const lines = markdown.split(/\r?\n/);
  return lines.flatMap((line, index) => {
    const heading = headingOf(line);
    return heading && matches(heading[2].trim()) ? [sectionFrom(lines, index)] : [];
  });
}

function requireSections(doc, markdown, titles, problems) {
  const found = {};
  for (const title of titles) {
    found[title] = findSection(markdown, title);
    if (!found[title]) problems.push(`${doc}: secao "${title}" ausente`);
  }
  return found;
}

// "\|" escapado fica dentro da celula (e vira "|")
const splitCells = (line) => line.trim().replace(/^\|/, '').replace(/(?<!\\)\|$/, '').split(/(?<!\\)\|/)
  .map((cell) => cell.replace(/\\\|/g, '|').trim());
const isSeparatorRow = (line) => /^\s*\|[\s:|-]+\|\s*$/.test(line);

/**
 * Primeiro bloco contiguo de tabela em `lines`: { header: string[] (normalizado), rows: string[][],
 * columnMismatches: { row, count }[] } ou null. `row` e o numero (base 1) da linha de dados.
 */
function parseTable(lines) {
  const start = lines.findIndex((line) => line.trim().startsWith('|'));
  if (start === -1) return null;
  const block = [];
  for (const line of lines.slice(start)) {
    if (!line.trim().startsWith('|')) break;
    if (!isSeparatorRow(line)) block.push(splitCells(line));
  }
  if (block.length === 0) return null;
  const [headerCells, ...rows] = block;
  const columnMismatches = rows.flatMap((cells, index) => (
    cells.some(isFilled) && cells.length !== headerCells.length ? [{ row: index + 1, count: cells.length }] : []
  ));
  return {
    header: headerCells.map(normalize),
    rows: rows.filter((cells) => cells.some(isFilled)),
    columnMismatches,
  };
}

/**
 * Le a tabela de `lines` e devolve as linhas como objetos { coluna: celula }.
 * Colunas ausentes viram pendencia e ficam fora de cada objeto (retornadas em `missing`).
 * Retorna null (com pendencia) se nao ha tabela.
 */
function requireTable(doc, lines, columns, where, problems) {
  const table = parseTable(lines);
  if (!table) {
    problems.push(`${doc}: tabela ausente ${where}`);
    return null;
  }
  for (const { row, count } of table.columnMismatches) {
    problems.push(`${doc}: linha ${row}: ${count} coluna(s), esperado ${table.header.length}`);
  }
  const missing = columns.filter((column) => !table.header.includes(column));
  for (const column of missing) problems.push(`${doc}: coluna "${column}" ausente na tabela`);
  const rows = table.rows.map((cells) => Object.fromEntries(
    columns.filter((column) => !missing.includes(column)).map((column) => [column, cells[table.header.indexOf(column)] ?? '']),
  ));
  return { rows, missing };
}

/**
 * Procura a linha "Rotulo: valor" em `lines`. Retorna { inline, items } ou null se ausente.
 * `items` = itens de lista logo abaixo, usados quando o valor da linha esta vazio.
 * `siblingLabels` interrompe a coleta de itens ao encontrar outro rotulo em formato de lista.
 */
function readLabel(lines, label, siblingLabels = []) {
  const labelOf = (line) => {
    const text = line.replace(/[*_`]/g, '').replace(/^\s*([-+]\s+|\d+\.\s+)?/, '');
    const colon = text.indexOf(':');
    return colon < 1 ? null : { name: normalize(text.slice(0, colon)), value: text.slice(colon + 1).trim() };
  };
  const index = lines.findIndex((line) => labelOf(line)?.name === normalize(label));
  if (index === -1) return null;
  const inline = labelOf(lines[index]).value;
  const indentOf = (line) => /^\s*/.exec(line)[0].length;
  const labelIsListItem = isListItem(lines[index]);
  const items = [];
  if (inline === '') {
    for (const line of lines.slice(index + 1)) {
      if (line.trim() === '') continue;
      if (headingOf(line) || !isListItem(line)) break;
      // rotulo em item de lista: so itens mais indentados sao seus filhos
      if (labelIsListItem && indentOf(line) <= indentOf(lines[index])) break;
      if (siblingLabels.map(normalize).includes(labelOf(line)?.name)) break;
      items.push(stripListMarker(line).trim());
    }
  }
  return { inline, items };
}

const labelText = (field) => [field.inline, ...field.items].filter(isFilled).join('; ');

/** Exige os rotulos `labels` nao vazios em `lines`; `where` descreve o local nas mensagens. */
function requireLabels(doc, where, lines, labels, problems) {
  const siblings = labels;
  for (const label of labels) {
    const field = readLabel(lines, label, siblings);
    if (!field) problems.push(`${doc}: ${where}: rotulo "${label}:" ausente`);
    else if (!isFilled(labelText(field))) problems.push(`${doc}: ${where}: rotulo "${label}:" vazio`);
  }
}

function checkApproval(doc, lines, problems) {
  const field = readLabel(lines, 'Aprovado por');
  const value = field ? labelText(field) : '';
  const match = APPROVAL_VALUE.exec(value);
  if (!match) {
    problems.push(`${doc}: linha "Aprovado por: <nome> em <AAAA-MM-DD>" ausente ou mal formada`);
    return;
  }
  if (!isValidIsoDate(match[2])) problems.push(`${doc}: data de aprovacao invalida (${match[2]})`);
}

const rowName = (name, index) => (isFilled(name) ? name : `linha ${index + 1}`);

// ---------- mercado.md ----------
const MARKET_COLUMNS = ['nicho', 'tamanho de mercado', 'fonte', 'data', 'dor principal', 'ticket', 'adequacao do sistema', 'nota'];

function checkMarketRow(row, index) {
  const where = `mercado.md: nicho "${rowName(row.nicho, index)}"`;
  const problems = [];
  for (const column of MARKET_COLUMNS) {
    if (Object.hasOwn(row, column) && !isFilled(row[column])) problems.push(`${where}: coluna "${column}" vazia`);
  }
  if (isFilled(row.fonte) && !/https?:\/\/\S+/i.test(row.fonte) && normalize(row.fonte) !== 'hipotese') {
    problems.push(`${where}: fonte sem URL http(s) nem "hipotese" (${row.fonte})`);
  }
  if (isFilled(row.data)) {
    const dateProblem = describeDateProblem(row.data);
    if (dateProblem) problems.push(`${where}: data ${dateProblem}`);
  }
  if (isFilled(row.nota)) {
    const score = /^\d+(?:[.,]\d+)?$/.test(row.nota.trim()) ? Number(row.nota.trim().replace(',', '.')) : Number.NaN;
    if (Number.isNaN(score) || score < 0 || score > 10) problems.push(`${where}: nota invalida (${row.nota}); esperado numero de 0 a 10`);
  }
  return problems;
}

function checkNicheDecision(section) {
  const doc = 'mercado.md';
  const problems = [];
  const entry = readLabel(section.lines, 'Nicho de entrada', ['Nichos de expansao', 'Aprovado por']);
  if (!entry || !isFilled(labelText(entry))) problems.push(`${doc}: "Nicho de entrada:" ausente ou vazio`);
  const expansion = readLabel(section.lines, 'Nichos de expansão', ['Nicho de entrada', 'Aprovado por']);
  if (!expansion) {
    problems.push(`${doc}: "Nichos de expansão:" ausente`);
  } else {
    const names = [...expansion.inline.split(/[;,]/), ...expansion.items].map((item) => item.trim()).filter(Boolean);
    if (names.length < 1 || names.length > 2) problems.push(`${doc}: ${names.length} nicho(s) de expansao; esperado de 1 a 2`);
  }
  checkApproval(doc, section.lines, problems);
  return problems;
}

function checkMercado(markdown) {
  const doc = 'mercado.md';
  const problems = [];
  const sections = requireSections(doc, markdown, ['Matriz de nichos', 'Decisão de nicho'], problems);
  if (sections['Matriz de nichos']) {
    const table = requireTable(doc, sections['Matriz de nichos'].lines, MARKET_COLUMNS, 'sob "Matriz de nichos"', problems);
    if (table) {
      if (table.rows.length !== MARKET_NICHE_COUNT) problems.push(`${doc}: ${table.rows.length} nicho(s) na matriz; esperado ${MARKET_NICHE_COUNT}`);
      table.rows.forEach((row, index) => problems.push(...checkMarketRow(row, index)));
    }
  }
  if (sections['Decisão de nicho']) problems.push(...checkNicheDecision(sections['Decisão de nicho']));
  return problems;
}

// ---------- concorrentes.md ----------
const COMPETITOR_COLUMNS = ['nome', 'url', 'data', 'funcionalidades', 'preco', 'modelo de cobranca', 'pontos fortes', 'pontos fracos'];

function checkCompetitorRow(row, index) {
  const where = `concorrentes.md: concorrente "${rowName(row.nome, index)}"`;
  const problems = [];
  for (const column of COMPETITOR_COLUMNS) {
    if (Object.hasOwn(row, column) && !isFilled(row[column])) problems.push(`${where}: coluna "${column}" vazia`);
  }
  if (isFilled(row.url) && !HTTP_URL.test(row.url.trim())) problems.push(`${where}: url invalida (${row.url}); use http(s)`);
  if (isFilled(row.data)) {
    const dateProblem = describeDateProblem(row.data);
    if (dateProblem) problems.push(`${where}: data ${dateProblem}`);
  }
  return problems;
}

function checkConcorrentes(markdown) {
  const doc = 'concorrentes.md';
  const problems = [];
  const sections = requireSections(doc, markdown, ['Concorrentes', 'Espaço de diferenciação'], problems);
  if (sections.Concorrentes) {
    const table = requireTable(doc, sections.Concorrentes.lines, COMPETITOR_COLUMNS, 'sob "Concorrentes"', problems);
    if (table) {
      if (table.rows.length < MIN_COMPETITORS) problems.push(`${doc}: ${table.rows.length} concorrente(s); minimo ${MIN_COMPETITORS}`);
      table.rows.forEach((row, index) => problems.push(...checkCompetitorRow(row, index)));
    }
  }
  const differentiation = sections['Espaço de diferenciação'];
  if (differentiation && differentiation.lines.filter(isListItem).length < MIN_DIFFERENTIATORS) {
    problems.push(`${doc}: "Espaço de diferenciação" precisa de >= ${MIN_DIFFERENTIATORS} itens`);
  }
  return problems;
}

// ---------- precificacao.md ----------
function checkPrecificacao(markdown) {
  const doc = 'precificacao.md';
  const problems = [];
  const lines = markdown.split(/\r?\n/);
  checkApproval(doc, lines, problems);
  const margin = readLabel(lines, 'Margem bruta mínima');
  const match = margin ? /^(\d+(?:[.,]\d+)?)\s*%/.exec(labelText(margin)) : null;
  if (!match) {
    problems.push(`${doc}: linha "Margem bruta mínima: <n>%" ausente ou mal formada`);
  } else {
    const percent = Number(match[1].replace(',', '.'));
    if (percent <= 0 || percent > 100) problems.push(`${doc}: margem bruta minima fora de 0-100% (${match[1]}%)`);
  }
  return problems;
}

// ---------- icp-personas.md ----------
const PERSONA_LABELS = ['Perfil', 'Dores', 'Gatilhos de compra', 'Objeções', 'Critérios de decisão'];

function checkIcpPersonas(markdown) {
  const doc = 'icp-personas.md';
  const personas = findSectionsWhere(markdown, (title) => normalize(title).startsWith('persona'))
    .filter((section) => /^persona\s*:/i.test(section.title.replace(/[*_`]/g, '')));
  const problems = personas.length < MIN_PERSONAS ? [`${doc}: ${personas.length} persona(s); minimo ${MIN_PERSONAS} (secoes "## Persona: <nome>")`] : [];
  for (const persona of personas) requireLabels(doc, `persona "${persona.title}"`, persona.lines, PERSONA_LABELS, problems);
  return problems;
}

// ---------- modelo-negocio.md ----------
const MODEL_LETTERS = ['a', 'b', 'c', 'd', 'e'];
const MODEL_LABELS = ['Receita', 'Custo', 'Risco', 'Esforço técnico', 'Adequação'];

function checkModeloNegocio(markdown) {
  const doc = 'modelo-negocio.md';
  const problems = [];
  const models = findSectionsWhere(markdown, (title) => /^\([a-e]\)/i.test(title.replace(/[*_`]/g, '')));
  for (const letter of MODEL_LETTERS) {
    const model = models.find((section) => section.title.replace(/[*_`]/g, '').toLowerCase().startsWith(`(${letter})`));
    if (!model) problems.push(`${doc}: modelo "(${letter})" ausente (subsecao "### (${letter}) ...")`);
    else requireLabels(doc, `modelo "${model.title}"`, model.lines, MODEL_LABELS, problems);
  }
  return problems;
}

// ---------- go-to-market.md ----------
const FUNNEL_COLUMNS = ['etapa', 'taxa minima', 'taxa maxima', 'hipotese'];
const PERCENT = /^(\d+(?:[.,]\d+)?)\s*%?$/;

const parsePercent = (text) => {
  const match = PERCENT.exec((text ?? '').trim());
  return match ? Number(match[1].replace(',', '.')) : Number.NaN;
};

function checkFunnelRow(row, index) {
  const where = `go-to-market.md: funil, etapa "${rowName(row.etapa, index)}"`;
  const problems = [];
  const [min, max] = [parsePercent(row['taxa minima']), parsePercent(row['taxa maxima'])];
  const label = { 'taxa minima': min, 'taxa maxima': max };
  for (const [column, value] of Object.entries(label)) {
    if (Object.hasOwn(row, column) && (Number.isNaN(value) || value > 100)) {
      problems.push(`${where}: "${column}" ausente ou invalida (${row[column] || 'vazia'}); esperado faixa mínimo–máximo em %`);
    }
  }
  if (!Number.isNaN(min) && !Number.isNaN(max) && min > max) problems.push(`${where}: taxa minima (${min}%) maior que a maxima (${max}%)`);
  if (Object.hasOwn(row, 'hipotese') && normalize(row.hipotese) !== 'sim') problems.push(`${where}: coluna "hipotese" deve ser "sim"`);
  return problems;
}

function checkGoToMarket(markdown) {
  const doc = 'go-to-market.md';
  const problems = [];
  const sections = requireSections(doc, markdown, ['Canais', 'Funil', 'Oferta de lançamento', 'Plano de 90 dias'], problems);
  if (sections.Canais) {
    const count = sections.Canais.lines.filter(isListItem).length;
    if (count < MIN_CHANNELS) problems.push(`${doc}: ${count} canal(is); minimo ${MIN_CHANNELS}`);
  }
  if (sections.Funil) {
    const table = requireTable(doc, sections.Funil.lines, FUNNEL_COLUMNS, 'sob "Funil"', problems);
    if (table && table.rows.length === 0) problems.push(`${doc}: tabela do funil sem etapas`);
    if (table) table.rows.forEach((row, index) => problems.push(...checkFunnelRow(row, index)));
  }
  for (const title of ['Oferta de lançamento', 'Plano de 90 dias']) {
    if (sections[title] && !sections[title].lines.some(isFilled)) problems.push(`${doc}: secao "${title}" vazia`);
  }
  return problems;
}

// ---------- riscos-prerequisitos.md ----------
const RISK_COLUMNS = ['risco', 'tipo', 'pbi sugerido'];

function checkRiscos(markdown) {
  const doc = 'riscos-prerequisitos.md';
  const problems = [];
  const table = requireTable(doc, markdown.split(/\r?\n/), RISK_COLUMNS, 'no documento', problems);
  if (!table) return problems;
  if (table.rows.length < MIN_RISKS) problems.push(`${doc}: ${table.rows.length} risco(s); minimo ${MIN_RISKS}`);
  table.rows.forEach((row, index) => {
    const where = `${doc}: risco "${rowName(row.risco, index)}"`;
    if (Object.hasOwn(row, 'risco') && !isFilled(row.risco)) problems.push(`${where}: coluna "risco" vazia`);
    if (Object.hasOwn(row, 'pbi sugerido') && !isFilled(row['pbi sugerido'])) problems.push(`${where}: sem PBI sugerido`);
  });
  return problems;
}

const DOC_CHECKS = [
  ['mercado.md', checkMercado],
  ['concorrentes.md', checkConcorrentes],
  ['precificacao.md', checkPrecificacao],
  ['icp-personas.md', checkIcpPersonas],
  ['modelo-negocio.md', checkModeloNegocio],
  ['go-to-market.md', checkGoToMarket],
  ['riscos-prerequisitos.md', checkRiscos],
];

export function checkDocs(root, negocioDir = defaultNegocioDirOf(root)) {
  const problems = [];
  for (const [name, check] of DOC_CHECKS) {
    const markdown = readNegocioFile(negocioDir, name, problems);
    if (markdown !== null) problems.push(...check(markdown));
  }
  return problems;
}

// ---------- arquivos obrigatorios ----------
export function checkArquivos(root, negocioDir = defaultNegocioDirOf(root)) {
  const problems = [];
  for (const name of REQUIRED_FILES) {
    const path = join(negocioDir, name);
    if (!existsSync(path)) problems.push(`${name}: arquivo obrigatorio ausente`);
    else if (!statSync(path).isFile()) problems.push(`${name}: obrigatorio, mas nao e um arquivo`);
  }
  return problems;
}

// ---------- links ----------
const LINK_PATTERN = /!?\[[^\[\]\n]*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g;
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
function describeLinkProblem(target, fromDir, negocioDir) {
  if (WINDOWS_DRIVE_TARGET.test(target)) return `link absoluto "${target}"; use caminho relativo`;
  if (EXTERNAL_TARGET.test(target)) return null;
  const pathPart = target.split('#')[0].split('?')[0];
  if (!pathPart) return null;
  let decoded = pathPart;
  try { decoded = decodeURIComponent(pathPart); } catch { /* mantem o texto original */ }
  if (isAbsolute(decoded)) return `link absoluto "${target}"; use caminho relativo`;
  const resolved = resolve(fromDir, decoded);
  const fromNegocio = relative(negocioDir, resolved);
  if (fromNegocio === '..' || fromNegocio.startsWith(`..${sep}`) || isAbsolute(fromNegocio)) {
    return `link "${target}" aponta para fora da pasta de negocio`;
  }
  return existsSync(resolved) ? null : `link quebrado "${target}"`;
}

export function checkLinks(root, negocioDir = defaultNegocioDirOf(root)) {
  if (!existsSync(negocioDir)) return [`${negocioDir}: diretorio de negocio ausente`];
  const problems = [];
  for (const file of listMarkdownFiles(negocioDir)) {
    const shownPath = file.slice(negocioDir.length + 1).split('\\').join('/');
    const result = tryReadFile(file);
    if (result.tooLarge) { problems.push(`${shownPath}: ${TOO_LARGE_MESSAGE}`); continue; }
    if (result.code) { problems.push(`${shownPath}: nao foi possivel ler (${result.code})`); continue; }
    for (const { target, line } of extractLinks(result.content.toString('utf8').replace(/^\uFEFF/, ''))) {
      const problem = describeLinkProblem(target, dirname(file), negocioDir);
      if (problem) problems.push(`${shownPath}:${line}: ${problem}`);
    }
  }
  return problems;
}

// ---------- CLI ----------
const CHECKS = { docs: checkDocs, links: checkLinks, arquivos: checkArquivos };

export function parseArgs(argv) {
  const positional = [];
  const modes = [];
  let negocio;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) { positional.push(arg); continue; }
    if (arg === '--negocio') {
      const value = argv[i + 1];
      if (value === undefined || value.startsWith('--')) throw new Error(`--negocio exige um diretorio. ${USAGE}`);
      negocio = value;
      i++;
      continue;
    }
    const mode = arg.slice(2);
    if (!MODES.includes(mode)) throw new Error(`flag desconhecida: ${arg}. ${USAGE}`);
    modes.push(mode);
  }
  if (positional.length > 1) throw new Error(USAGE);
  return { root: positional[0] ?? '.', modes: modes.length > 0 ? modes : MODES, negocio };
}

/** Executa os modos e retorna { mode, problems }[]. */
export function runModes(root, modes, negocioDir = defaultNegocioDirOf(root)) {
  return modes.map((mode) => ({ mode, problems: CHECKS[mode](root, negocioDir) }));
}

function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
    if (!statSync(args.root).isDirectory()) throw new Error(`raiz nao e um diretorio: ${args.root}`);
    if (args.negocio !== undefined) {
      if (!existsSync(args.negocio)) throw new Error(`--negocio: diretorio nao encontrado: ${args.negocio}`);
      if (!statSync(args.negocio).isDirectory()) throw new Error(`--negocio: nao e um diretorio: ${args.negocio}`);
    }
  } catch (error) {
    console.error(`check-negocio: ${error.code === 'ENOENT' ? `raiz nao encontrada: ${args?.root ?? process.argv.slice(2).find((a) => !a.startsWith('--'))}` : error.message}`);
    process.exitCode = 2;
    return;
  }

  let results;
  try {
    results = runModes(args.root, args.modes, args.negocio === undefined ? undefined : resolve(args.negocio));
  } catch (error) {
    console.error(`check-negocio: erro de I/O ao verificar ${args.root}: ${[error.code, error.message].filter(Boolean).join(' ')}`);
    process.exitCode = 2;
    return;
  }
  let total = 0;
  for (const { mode, problems } of results) {
    for (const problem of problems) console.log(`[${mode}] ${problem}`);
    console.log(`check-negocio --${mode}: ${problems.length === 0 ? 'ok' : `${problems.length} pendencia(s)`}`);
    total += problems.length;
  }
  if (total > 0) {
    console.error(`check-negocio: ${total} pendencia(s).`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();

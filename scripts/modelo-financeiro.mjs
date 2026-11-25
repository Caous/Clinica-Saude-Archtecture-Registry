#!/usr/bin/env node
// Modelo financeiro do Cuidaflux (PBI-20261124-publico-mercado-modelo-negocio). Node 22+.
// Funcoes puras (sem dependencias) calculam LTV, payback, ponto de equilibrio, cenarios,
// margem bruta minima e projecao de 12 meses. Valores de entrada sao HIPOTESES ate haver dado real.
//
// Uso: node modelo-financeiro.mjs [--churn <fracao>] [--out <arquivo.xlsx|.csv>] [--premissas <json>] [--force]
//   --churn      churn mensal base como fracao (0.05 = 5%); sobrescreve o das premissas.
//   --out        arquivo de saida (padrao: modelo-financeiro.xlsx no diretorio atual).
//                .xlsx usa a dependencia de desenvolvimento `exceljs` (scripts/package.json),
//                importada dinamicamente so neste comando; .csv nao exige nenhuma dependencia.
//   --premissas  JSON de premissas (padrao: modelo-financeiro.premissas-exemplo.json, valores EXEMPLO).
//   --force      sobrescreve o arquivo de --out se ja existir (sem a flag: exit 2).
//   exit 0 = ok, 1 = premissa invalida, 2 = erro de uso ou de I/O.
//
// Fallback .csv: use `--out arquivo.csv` quando `exceljs` nao puder ser instalado
// (npm install --prefix scripts). O .csv traz os mesmos valores calculados, sem formulas.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const MESES_PROJECAO = 12;
export const MARGEM_BRUTA_MINIMA_PADRAO = 0.6; // decisao do dono (2026-11-24): opcao A

const congelar = (objeto) => Object.freeze(Object.fromEntries(
  Object.entries(objeto).map(([chave, valor]) => [chave, Object.freeze({ ...valor })])));

/** Multiplicadores padrao (editaveis via argumento) aplicados sobre as premissas base. */
export const MULTIPLICADORES_PADRAO = congelar({
  base: { churn: 1, cac: 1, conversao: 1, arpa: 1 },
  conservador: { churn: 1.5, cac: 1.3, conversao: 0.7, arpa: 1 },
  otimista: { churn: 0.7, cac: 0.8, conversao: 1.3, arpa: 1 },
});
export const NOMES_CENARIOS = Object.freeze(['base', 'conservador', 'otimista']);

// ---------- utilitarios puros ----------
const invalido = (motivo) => ({ valido: false, motivo });
const valor = (numero) => ({ valido: true, valor: numero });
const isNumeroFinito = (x) => typeof x === 'number' && Number.isFinite(x);
const arredondar = (numero, casas = 2) => Math.round((numero + Number.EPSILON) * 10 ** casas) / 10 ** casas;

// ---------- T-1: formulas ----------
function validarFracao(nome, x, { exclusivoZero }) {
  if (!isNumeroFinito(x)) return `${nome} deve ser um numero (recebido ${JSON.stringify(x)})`;
  const abaixo = exclusivoZero ? x <= 0 : x < 0;
  if (abaixo || x > 1) return `${nome} deve estar ${exclusivoZero ? 'acima de 0' : 'entre 0'} e 100% como fracao, ex.: 0.03 (recebido ${x})`;
  return null;
}

/** LTV = ARPA x margem / churn (mensal). Retorna { valido, valor } ou { valido: false, motivo }. */
export function calcularLtv(entrada) {
  const { arpa, margem, churn } = entrada ?? {};
  if (!isNumeroFinito(arpa) || arpa <= 0) return invalido(`ARPA deve ser um numero maior que 0 (recebido ${JSON.stringify(arpa)})`);
  const problemaMargem = validarFracao('margem', margem, { exclusivoZero: false });
  if (problemaMargem) return invalido(problemaMargem);
  const problemaChurn = validarFracao('churn', churn, { exclusivoZero: true });
  if (problemaChurn) return invalido(problemaChurn);
  return valor(arredondar((arpa * margem) / churn));
}

/** Payback em meses = CAC / margem mensal por cliente (2 casas). */
export function calcularPayback(entrada) {
  const { cac, margemMensal } = entrada ?? {};
  if (!isNumeroFinito(cac) || cac < 0) return invalido(`CAC deve ser um numero maior ou igual a 0 (recebido ${JSON.stringify(cac)})`);
  if (!isNumeroFinito(margemMensal) || margemMensal <= 0) return invalido(`margem mensal deve ser maior que 0 (recebido ${JSON.stringify(margemMensal)})`);
  return valor(arredondar(cac / margemMensal));
}

/** Ponto de equilibrio em clientes = ceil(custo fixo / margem unitaria). */
export function calcularPontoEquilibrio(entrada) {
  const { custoFixo, margemUnitaria } = entrada ?? {};
  if (!isNumeroFinito(custoFixo) || custoFixo < 0) return invalido(`custo fixo deve ser um numero maior ou igual a 0 (recebido ${JSON.stringify(custoFixo)})`);
  if (!isNumeroFinito(margemUnitaria) || margemUnitaria <= 0) return invalido(`margem unitaria deve ser maior que 0 (recebido ${JSON.stringify(margemUnitaria)})`);
  // arredonda a 9 casas antes do ceil para ruido de ponto flutuante nao somar um cliente
  return valor(Math.ceil(arredondar(custoFixo / margemUnitaria, 9)));
}

/** Aplica multiplicadores a { churn, cac, conversao, arpa } sem mutar a entrada. */
export function aplicarMultiplicadores(premissas, multiplicadores) {
  return {
    ...premissas,
    churn: premissas.churn * multiplicadores.churn,
    cac: premissas.cac * multiplicadores.cac,
    conversao: premissas.conversao * multiplicadores.conversao,
    arpa: premissas.arpa * multiplicadores.arpa,
  };
}

/**
 * Indicadores de um conjunto de premissas { arpa, margem, churn, cac, conversao }.
 * Retorna { premissas, ltv, payback }; cada indicador e { valido, valor|motivo }.
 */
export function calcularIndicadores(premissas) {
  const ltv = calcularLtv(premissas);
  const margemMensal = isNumeroFinito(premissas?.arpa) && isNumeroFinito(premissas?.margem)
    ? premissas.arpa * premissas.margem : undefined;
  const payback = calcularPayback({ cac: premissas?.cac, margemMensal });
  return { premissas, ltv, payback };
}

/**
 * Cenarios base/conservador/otimista. `multiplicadores` (parcial) sobrescreve o padrao por cenario.
 * Retorna { base, conservador, otimista }, cada um { premissas, ltv, payback }.
 */
export function calcularCenarios(premissasBase, multiplicadores = {}) {
  return Object.fromEntries(NOMES_CENARIOS.map((nome) => (
    [nome, calcularIndicadores(aplicarMultiplicadores(premissasBase ?? {}, fatoresDoCenario(nome, multiplicadores)))])));
}

/** Multiplicadores efetivos do cenario: padrao sobrescrito pelos informados. */
function fatoresDoCenario(nome, multiplicadores) {
  return { ...MULTIPLICADORES_PADRAO[nome], ...multiplicadores[nome] };
}

// ---------- T-2: margem bruta minima ----------
const formatarPercentual = (fracao) => `${arredondar(fracao * 100, 2)}%`;

const TOLERANCIA_MARGEM = 1e-12; // 0,6 exato nao pode reprovar por 0,5999999999
const atendeMargemMinima = (margem, minimo) => margem >= minimo - TOLERANCIA_MARGEM;

function avaliarPlano(plano, minimo) {
  const { receita, custosVariaveis } = plano ?? {};
  const nome = plano?.nome ?? '(sem nome)';
  if (!isNumeroFinito(receita) || receita <= 0) {
    return { nome, aprovado: false, margem: null, motivo: `plano "${nome}": receita deve ser maior que 0 (recebido ${JSON.stringify(receita)})` };
  }
  if (!isNumeroFinito(custosVariaveis) || custosVariaveis < 0) {
    return { nome, aprovado: false, margem: null, motivo: `plano "${nome}": custos variaveis devem ser um numero maior ou igual a 0 (recebido ${JSON.stringify(custosVariaveis)})` };
  }
  const margem = (receita - custosVariaveis) / receita;
  const aprovado = atendeMargemMinima(margem, minimo);
  const motivo = aprovado ? null : `plano "${nome}": margem bruta ${formatarPercentual(margem)} abaixo do minimo ${formatarPercentual(minimo)}`;
  return { nome, aprovado, margem, motivo };
}

/**
 * Margem bruta por plano = (receita - custos variaveis) / receita, comparada ao minimo (padrao 60%).
 * `planos`: [{ nome, receita, custosVariaveis }] (valores por cliente/mes).
 * Retorna { aprovado, minimo, planos: [{ nome, margem, aprovado, motivo }], reprovados: [nome] }.
 */
export function avaliarMargemBruta(planos, minimo = MARGEM_BRUTA_MINIMA_PADRAO) {
  if (!isNumeroFinito(minimo) || minimo < 0 || minimo > 1) {
    throw new RangeError(`margem bruta minima deve ser uma fracao entre 0 e 1, ex.: 0.6 (recebido ${JSON.stringify(minimo)})`);
  }
  if (!Array.isArray(planos) || planos.length === 0) {
    throw new RangeError('avaliarMargemBruta exige ao menos um plano em [{ nome, receita, custosVariaveis }]');
  }
  const avaliados = planos.map((plano) => avaliarPlano(plano, minimo));
  const reprovados = avaliados.filter((plano) => !plano.aprovado).map((plano) => plano.nome);
  return { aprovado: reprovados.length === 0, minimo, planos: avaliados, reprovados };
}

// ---------- T-3: projecao e modelo ----------
const CAMPOS_PREMISSAS = ['arpa', 'custoVariavelPorCliente', 'churn', 'cac', 'custoFixo', 'clientesIniciais', 'leadsPorMes', 'conversao'];
const CAMPO_MARGEM_MINIMA = 'margemBrutaMinima'; // opcional; padrao MARGEM_BRUTA_MINIMA_PADRAO
const CAMPOS_ACEITOS = [...CAMPOS_PREMISSAS, CAMPO_MARGEM_MINIMA];
const CAMPOS_NAO_NEGATIVOS = ['custoVariavelPorCliente', 'cac', 'custoFixo', 'clientesIniciais', 'leadsPorMes'];

/**
 * Projecao mensal de um cenario. Entrada: { arpa, custoVariavelPorCliente, churn, cac, custoFixo,
 * clientesIniciais, novosPorMes }. Mes m: clientes = anterior x (1 - churn) + novos;
 * receita = MRR = clientes x ARPA; custo = fixo + clientes x variavel + novos x CAC; margem = receita - custo.
 * Clientes sao fracionarios (valor esperado); saidas arredondadas a 2 casas.
 */
export function projetarCenario(entrada, meses = MESES_PROJECAO) {
  const { arpa, custoVariavelPorCliente, churn, cac, custoFixo, clientesIniciais, novosPorMes } = entrada;
  const linhas = [];
  let clientes = clientesIniciais;
  for (let mes = 1; mes <= meses; mes++) {
    clientes = clientes * (1 - churn) + novosPorMes;
    const receita = clientes * arpa;
    const custo = custoFixo + clientes * custoVariavelPorCliente + novosPorMes * cac;
    linhas.push({
      mes,
      clientes: arredondar(clientes),
      novos: arredondar(novosPorMes),
      receita: arredondar(receita),
      custo: arredondar(custo),
      margem: arredondar(receita - custo),
      mrr: arredondar(receita),
    });
  }
  return linhas;
}

function descreverProblemaDePremissas(premissas) {
  if (premissas === null || typeof premissas !== 'object' || Array.isArray(premissas)) {
    return 'premissas devem ser um objeto com ' + CAMPOS_PREMISSAS.join(', ');
  }
  for (const campo of CAMPOS_PREMISSAS) {
    if (!isNumeroFinito(premissas[campo])) return `premissa "${campo}" ausente ou nao numerica (recebido ${JSON.stringify(premissas[campo])})`;
  }
  const negativo = CAMPOS_NAO_NEGATIVOS.find((campo) => premissas[campo] < 0);
  if (negativo) return `premissa "${negativo}" nao pode ser negativa (recebido ${premissas[negativo]})`;
  if (premissas.conversao < 0 || premissas.conversao > 1) return `premissa "conversao" deve ficar entre 0 e 100% como fracao, ex.: 0.25 (recebido ${premissas.conversao})`;
  const minimo = premissas[CAMPO_MARGEM_MINIMA];
  if (minimo !== undefined && (!isNumeroFinito(minimo) || minimo < 0 || minimo > 1)) {
    return `premissa "${CAMPO_MARGEM_MINIMA}" deve ser uma fracao entre 0 e 1, ex.: 0.6 (recebido ${JSON.stringify(minimo)})`;
  }
  return null;
}

const invalidoNoCenario = (nome, motivo) => invalido(`cenario ${nome}: ${motivo}`);

/**
 * Modelo completo: 3 cenarios com premissas efetivas, LTV, payback, equilibrio e projecao de 12 meses.
 * `premissasBrutas`: { arpa, custoVariavelPorCliente, churn, cac, custoFixo, clientesIniciais, leadsPorMes, conversao }
 * (churn e conversao como fracao). Retorna { valido: true, premissas, multiplicadores, cenarios } ou { valido: false, motivo }.
 */
export function calcularModelo(premissasBrutas, multiplicadores = {}) {
  const problema = descreverProblemaDePremissas(premissasBrutas);
  if (problema) return invalido(problema);
  const margemBrutaMinima = premissasBrutas[CAMPO_MARGEM_MINIMA] ?? MARGEM_BRUTA_MINIMA_PADRAO;
  const cenarios = {};
  for (const nome of NOMES_CENARIOS) {
    const efetivas = aplicarMultiplicadores(premissasBrutas, fatoresDoCenario(nome, multiplicadores));
    if (efetivas.conversao < 0 || efetivas.conversao > 1) return invalidoNoCenario(nome, `conversao deve ficar entre 0 e 100% (resultado ${efetivas.conversao})`);
    const margemUnitaria = efetivas.arpa - efetivas.custoVariavelPorCliente;
    const margem = margemUnitaria / efetivas.arpa;
    const { ltv, payback } = calcularIndicadores({ arpa: efetivas.arpa, margem, churn: efetivas.churn, cac: efetivas.cac, conversao: efetivas.conversao });
    const equilibrio = calcularPontoEquilibrio({ custoFixo: efetivas.custoFixo, margemUnitaria });
    const falha = [ltv, payback, equilibrio].find((indicador) => !indicador.valido);
    if (falha) return invalidoNoCenario(nome, falha.motivo);
    const novosPorMes = efetivas.leadsPorMes * efetivas.conversao;
    cenarios[nome] = {
      premissas: { ...efetivas, margem, margemUnitaria, novosPorMes },
      margem, margemMinimaAtendida: atendeMargemMinima(margem, margemBrutaMinima),
      ltv, payback, equilibrio,
      projecao: projetarCenario({ ...efetivas, novosPorMes }),
    };
  }
  return { valido: true, premissas: { ...premissasBrutas }, margemBrutaMinima, multiplicadores: structuredClone({ ...MULTIPLICADORES_PADRAO, ...multiplicadores }), cenarios };
}

// ---------- saidas: resumo, .csv e .xlsx ----------
const ROTULOS_CENARIOS = { base: 'Base', conservador: 'Conservador', otimista: 'Otimista' };
const PREMISSAS_PLANILHA = [
  ['ARPA (receita media por cliente/mes)', 'arpa'],
  ['Custo variavel por cliente/mes', 'custoVariavelPorCliente'],
  ['Churn mensal', 'churn'],
  ['CAC', 'cac'],
  ['Custo fixo mensal', 'custoFixo'],
  ['Clientes iniciais', 'clientesIniciais'],
  ['Leads por mes', 'leadsPorMes'],
  ['Conversao de lead em cliente', 'conversao'],
];
const LINHA_MULTIPLICADORES = { base: 14, conservador: 15, otimista: 16 };
const PRIMEIRA_LINHA_PROJECAO = 20;

/** Avisos (um por cenario) quando a margem bruta fica abaixo do minimo; [] se todos atendem. */
export function avisosDeMargem(modelo) {
  return NOMES_CENARIOS
    .filter((nome) => !modelo.cenarios[nome].margemMinimaAtendida)
    .map((nome) => `AVISO: cenario ${nome}: margem bruta ${formatarPercentual(modelo.cenarios[nome].margem)} abaixo do minimo ${formatarPercentual(modelo.margemBrutaMinima)}`);
}

/** Linhas de texto com os indicadores de cada cenario e avisos de margem (saida do CLI). */
export function resumirModelo(modelo) {
  const indicadores = NOMES_CENARIOS.map((nome) => {
    const { ltv, payback, equilibrio, projecao } = modelo.cenarios[nome];
    const ultimo = projecao.at(-1);
    return `cenario ${nome}: LTV ${ltv.valor.toFixed(2)} | payback ${payback.valor.toFixed(2)} meses | equilibrio ${equilibrio.valor} clientes | MRR mes ${ultimo.mes} ${ultimo.mrr.toFixed(2)} | margem mes ${ultimo.mes} ${ultimo.margem.toFixed(2)}`;
  });
  return [...indicadores, ...avisosDeMargem(modelo)];
}

const numeroPtBr = (numero) => String(numero).replace('.', ',');
const numeroPtBrLimpo = (numero) => numeroPtBr(arredondar(numero, 6)); // remove ruido de ponto flutuante

/** Texto livre vindo de JSON: remove quebras/';' e neutraliza injecao de formula (= + - @). */
function sanearCelulaCsv(texto) {
  const limpo = texto.replace(/[\r\n;]/g, '');
  return /^[=+\-@]/.test(limpo) ? `'${limpo}` : limpo;
}

/** Fallback sem dependencias: CSV (separador ';', decimal ',') com os valores calculados, sem formulas. */
export function gerarCsv(modelo, { aviso } = {}) {
  const linhas = [];
  if (aviso) linhas.push(`Aviso;${sanearCelulaCsv(aviso)}`);
  for (const linhaAviso of avisosDeMargem(modelo)) linhas.push(`Aviso margem;${linhaAviso.replace(/^AVISO: /, '')}`);
  linhas.push('Premissas;Valor');
  for (const [rotulo, campo] of PREMISSAS_PLANILHA) linhas.push(`${rotulo};${numeroPtBr(modelo.premissas[campo])}`);
  for (const nome of NOMES_CENARIOS) {
    const { premissas, ltv, payback, equilibrio, projecao } = modelo.cenarios[nome];
    linhas.push('', `Cenario ${ROTULOS_CENARIOS[nome]}`, 'Indicador;Valor',
      `ARPA;${numeroPtBrLimpo(premissas.arpa)}`, `Churn;${numeroPtBrLimpo(premissas.churn)}`, `CAC;${numeroPtBrLimpo(premissas.cac)}`,
      `Margem bruta;${numeroPtBr(arredondar(premissas.margem, 4))}`, `LTV;${numeroPtBr(ltv.valor)}`,
      `Payback (meses);${numeroPtBr(payback.valor)}`, `Ponto de equilibrio (clientes);${equilibrio.valor}`,
      'Mes;Clientes;Novos;Receita;Custo;Margem;MRR');
    for (const { mes, clientes, novos, receita, custo, margem, mrr } of projecao) {
      linhas.push([mes, clientes, novos, receita, custo, margem, mrr].map(numeroPtBr).join(';'));
    }
  }
  return `${linhas.join('\n')}\n`;
}

async function importarExcelJs() {
  try {
    return (await import('exceljs')).default;
  } catch (error) {
    if (error?.code !== 'ERR_MODULE_NOT_FOUND') throw error;
    throw new Error('dependencia "exceljs" nao instalada. Rode `npm install --prefix scripts` (devDependency) ou use --out <arquivo>.csv');
  }
}

function escreverAbaPremissas(livro, modelo, aviso) {
  const aba = livro.addWorksheet('Premissas');
  aba.columns = [{ width: 42 }, { width: 16 }, { width: 16 }, { width: 16 }, { width: 16 }];
  aba.addRow(['Premissa', 'Valor', 'Observacao']).font = { bold: true };
  PREMISSAS_PLANILHA.forEach(([rotulo, campo]) => aba.addRow([rotulo, modelo.premissas[campo], campo === 'churn' || campo === 'conversao' ? 'fracao (0,03 = 3%)' : '']));
  aba.addRow(['Margem bruta minima', modelo.margemBrutaMinima, 'decisao do dono: 60% (opcao A)']);
  aba.getCell('B4').numFmt = '0.0%';
  aba.getCell('B9').numFmt = '0.0%';
  aba.getCell('B10').numFmt = '0%';
  aba.getCell('A12').value = aviso ?? 'Valores sao hipoteses ate haver dado real.';
  aba.getRow(13).values = ['Multiplicadores por cenario (editaveis)', 'Churn', 'CAC', 'Conversao', 'ARPA'];
  aba.getRow(13).font = { bold: true };
  for (const nome of NOMES_CENARIOS) {
    const fatores = modelo.multiplicadores[nome];
    aba.getRow(LINHA_MULTIPLICADORES[nome]).values = [ROTULOS_CENARIOS[nome], fatores.churn, fatores.cac, fatores.conversao, fatores.arpa];
  }
}

function escreverAbaCenario(livro, nome, cenario) {
  const aba = livro.addWorksheet(ROTULOS_CENARIOS[nome]);
  const m = LINHA_MULTIPLICADORES[nome];
  const { premissas, ltv, payback, equilibrio, projecao } = cenario;
  aba.columns = [{ width: 38 }, { width: 18 }, { width: 18 }, { width: 14 }, { width: 14 }, { width: 14 }, { width: 14 }, { width: 14 }, { width: 14 }];
  aba.getCell('A1').value = `Cenario ${ROTULOS_CENARIOS[nome]}`;
  aba.getCell('A1').font = { bold: true, size: 14 };
  const indicadores = [
    ['ARPA', `Premissas!B2*Premissas!E${m}`, premissas.arpa],
    ['Custo variavel por cliente', 'Premissas!B3', premissas.custoVariavelPorCliente],
    ['Churn mensal', `Premissas!B4*Premissas!B${m}`, premissas.churn],
    ['CAC', `Premissas!B5*Premissas!C${m}`, premissas.cac],
    ['Custo fixo mensal', 'Premissas!B6', premissas.custoFixo],
    ['Clientes iniciais', 'Premissas!B7', premissas.clientesIniciais],
    ['Leads por mes', 'Premissas!B8', premissas.leadsPorMes],
    ['Conversao', `Premissas!B9*Premissas!D${m}`, premissas.conversao],
    ['Novos clientes por mes', 'B9*B10', premissas.novosPorMes],
    ['Margem unitaria (R$/cliente)', 'B3-B4', premissas.margemUnitaria],
    ['Margem bruta (%)', 'B12/B3', premissas.margem],
    ['LTV', 'ROUND(B3*B13/B5,2)', ltv.valor],
    ['Payback (meses)', 'ROUND(B6/B12,2)', payback.valor],
    ['Ponto de equilibrio (clientes)', 'ROUNDUP(B7/B12,0)', equilibrio.valor],
    ['Atende margem bruta minima?', 'IF(B13>=Premissas!B10,"sim","nao")', cenario.margemMinimaAtendida ? 'sim' : 'nao'],
  ];
  indicadores.forEach(([rotulo, formula, resultado], indice) => {
    aba.getCell(`A${indice + 3}`).value = rotulo;
    aba.getCell(`B${indice + 3}`).value = { formula, result: resultado };
  });
  for (const celula of ['B5', 'B10', 'B13']) aba.getCell(celula).numFmt = '0.0%';
  aba.getRow(19).values = ['Mes', 'Clientes (inicio)', 'Clientes perdidos', 'Novos', 'Clientes (fim)', 'Receita', 'Custo', 'Margem', 'MRR'];
  aba.getRow(19).font = { bold: true };
  projecao.forEach((linha, indice) => {
    const r = PRIMEIRA_LINHA_PROJECAO + indice;
    const inicio = indice === 0 ? premissas.clientesIniciais : projecao[indice - 1].clientes;
    aba.getCell(`A${r}`).value = linha.mes;
    aba.getCell(`B${r}`).value = { formula: indice === 0 ? 'B8' : `E${r - 1}`, result: inicio };
    aba.getCell(`C${r}`).value = { formula: `B${r}*$B$5`, result: arredondar(inicio * premissas.churn) };
    aba.getCell(`D${r}`).value = { formula: '$B$11', result: linha.novos };
    aba.getCell(`E${r}`).value = { formula: `B${r}-C${r}+D${r}`, result: linha.clientes };
    aba.getCell(`F${r}`).value = { formula: `E${r}*$B$3`, result: linha.receita };
    aba.getCell(`G${r}`).value = { formula: `$B$7+E${r}*$B$4+D${r}*$B$6`, result: linha.custo };
    aba.getCell(`H${r}`).value = { formula: `F${r}-G${r}`, result: linha.margem };
    aba.getCell(`I${r}`).value = { formula: `F${r}`, result: linha.mrr };
  });
}

/** Gera o .xlsx com aba "Premissas" e uma aba por cenario, usando formulas. Importa exceljs so aqui. */
export async function gerarXlsx(modelo, caminho, { aviso } = {}) {
  const ExcelJS = await importarExcelJs();
  const livro = new ExcelJS.Workbook();
  livro.calcProperties.fullCalcOnLoad = true;
  escreverAbaPremissas(livro, modelo, aviso);
  for (const nome of NOMES_CENARIOS) escreverAbaCenario(livro, nome, modelo.cenarios[nome]);
  await livro.xlsx.writeFile(caminho);
}

// ---------- CLI ----------
const USO = 'Uso: node modelo-financeiro.mjs [--churn <fracao>] [--out <arquivo.xlsx|.csv>] [--premissas <json>] [--force]';
const ARQUIVO_PREMISSAS_EXEMPLO = join(dirname(fileURLToPath(import.meta.url)), 'modelo-financeiro.premissas-exemplo.json');
const SAIDA_PADRAO = 'modelo-financeiro.xlsx';

export function parseArgs(argv) {
  const args = { churn: undefined, out: undefined, premissas: undefined };
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    if (flag === '--force') { args.force = true; continue; }
    if (!['--churn', '--out', '--premissas'].includes(flag)) throw new Error(`flag desconhecida: ${flag}. ${USO}`);
    const valorFlag = argv[i + 1];
    if (valorFlag === undefined || valorFlag.startsWith('--')) throw new Error(`${flag} exige um valor. ${USO}`);
    i++;
    if (flag === '--churn') {
      const churn = Number(valorFlag);
      if (valorFlag.trim() === '' || !Number.isFinite(churn)) throw new Error(`--churn exige um numero como fracao, ex.: 0.05 (recebido "${valorFlag}")`);
      args.churn = churn;
    } else args[flag.slice(2)] = valorFlag;
  }
  return args;
}

const CAMPOS_MULTIPLICADOR = ['churn', 'cac', 'conversao', 'arpa'];

/** Valida o bloco "multiplicadores" do JSON: cenarios e campos conhecidos, numeros finitos > 0. */
function descreverProblemaDeMultiplicadores(multiplicadores) {
  if (multiplicadores === undefined) return null;
  const ehObjeto = (x) => x !== null && typeof x === 'object' && !Array.isArray(x);
  if (!ehObjeto(multiplicadores)) return 'multiplicadores deve ser um objeto { base|conservador|otimista: { churn, cac, conversao, arpa } }';
  for (const [cenario, fatores] of Object.entries(multiplicadores)) {
    if (!NOMES_CENARIOS.includes(cenario)) return `multiplicadores: cenario desconhecido "${cenario}" (use ${NOMES_CENARIOS.join(', ')})`;
    if (!ehObjeto(fatores)) return `multiplicadores.${cenario} deve ser um objeto com ${CAMPOS_MULTIPLICADOR.join(', ')}`;
    for (const [campo, fator] of Object.entries(fatores)) {
      if (!CAMPOS_MULTIPLICADOR.includes(campo)) return `multiplicadores.${cenario}: campo desconhecido "${campo}" (use ${CAMPOS_MULTIPLICADOR.join(', ')})`;
      if (!isNumeroFinito(fator) || fator <= 0) return `multiplicadores.${cenario}.${campo} deve ser um numero maior que 0 (recebido ${JSON.stringify(fator)})`;
    }
  }
  return null;
}

function lerPremissas(caminho) {
  let json;
  try {
    json = JSON.parse(readFileSync(caminho, 'utf8'));
  } catch (error) {
    throw new Error(`nao foi possivel ler premissas em ${caminho}: ${error.code ?? error.message}`);
  }
  if (json === null || typeof json !== 'object' || Array.isArray(json)) throw new Error(`${caminho}: JSON deve ser um objeto de premissas`);
  const { multiplicadores, ...resto } = json;
  const premissas = Object.fromEntries(Object.entries(resto).filter(([chave]) => !chave.startsWith('_')));
  const desconhecidas = Object.keys(premissas).filter((chave) => !CAMPOS_ACEITOS.includes(chave));
  if (desconhecidas.length > 0) throw new Error(`${caminho}: premissa(s) desconhecida(s): ${desconhecidas.join(', ')}`);
  const aviso = typeof json._aviso === 'string' && json._aviso.includes('EXEMPLO') ? json._aviso : undefined;
  const problemaMultiplicadores = descreverProblemaDeMultiplicadores(multiplicadores);
  if (problemaMultiplicadores) throw new Error(`${caminho}: ${problemaMultiplicadores}`);
  return { premissas, multiplicadores: multiplicadores ?? {}, aviso };
}

async function main() {
  let args;
  let entrada;
  try {
    args = parseArgs(process.argv.slice(2));
    entrada = lerPremissas(args.premissas ?? ARQUIVO_PREMISSAS_EXEMPLO);
  } catch (error) {
    console.error(`modelo-financeiro: ${error.message}`);
    process.exitCode = 2;
    return;
  }
  const premissas = args.churn === undefined ? entrada.premissas : { ...entrada.premissas, churn: args.churn };
  const modelo = calcularModelo(premissas, entrada.multiplicadores);
  if (!modelo.valido) {
    console.error(`modelo-financeiro: premissa invalida: ${modelo.motivo}`);
    process.exitCode = 1;
    return;
  }
  const saida = resolve(args.out ?? SAIDA_PADRAO);
  const extensao = saida.toLowerCase().split('.').at(-1);
  try {
    if (extensao !== 'csv' && extensao !== 'xlsx') throw new Error(`--out deve terminar em .xlsx ou .csv (recebido ${saida})`);
    if (existsSync(saida) && !args.force) throw new Error(`${saida} ja existe; use --force para sobrescrever`);
    if (extensao === 'csv') writeFileSync(saida, gerarCsv(modelo, { aviso: entrada.aviso }), 'utf8');
    else await gerarXlsx(modelo, saida, { aviso: entrada.aviso });
  } catch (error) {
    console.error(`modelo-financeiro: ${error.message}`);
    process.exitCode = 2;
    return;
  }
  if (entrada.aviso) console.log(`modelo-financeiro: ${entrada.aviso}`);
  console.log(`modelo-financeiro: churn base ${(modelo.premissas.churn * 100).toFixed(2)}%`);
  for (const linha of resumirModelo(modelo)) console.log(linha);
  console.log(`modelo-financeiro: arquivo gerado: ${saida}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();

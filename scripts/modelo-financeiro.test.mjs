import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  calcularLtv,
  calcularPayback,
  calcularPontoEquilibrio,
  calcularCenarios,
  avaliarMargemBruta,
  MARGEM_BRUTA_MINIMA_PADRAO,
  MULTIPLICADORES_PADRAO,
  projetarCenario,
  calcularModelo,
  parseArgs,
  gerarCsv,
} from './modelo-financeiro.mjs';

const basePremissas = { arpa: 300, margem: 0.7, churn: 0.03, cac: 1200, conversao: 0.2 };

// ---------- T-1 ----------
test('UT-1: LTV com ARPA 300, margem 70% e churn 3% = 7.000', () => {
  assert.deepEqual(calcularLtv({ arpa: 300, margem: 0.7, churn: 0.03 }), { valido: true, valor: 7000 });
});

test('UT-2: payback com CAC 1.200 e margem mensal 210 = 5,71 meses', () => {
  assert.deepEqual(calcularPayback({ cac: 1200, margemMensal: 210 }), { valido: true, valor: 5.71 });
});

test('UT-3: ponto de equilibrio com custo fixo 15.000 e margem unitaria 210 = 72 (arredonda para cima)', () => {
  assert.deepEqual(calcularPontoEquilibrio({ custoFixo: 15000, margemUnitaria: 210 }), { valido: true, valor: 72 });
});

test('UT-3b: divisao exata nao sobe um cliente (210 / 210 = 1)', () => {
  assert.equal(calcularPontoEquilibrio({ custoFixo: 21000, margemUnitaria: 210 }).valor, 100);
});

test('UT-4: churn zero e sinalizado como premissa invalida, sem divisao por zero', () => {
  const resultado = calcularLtv({ arpa: 300, margem: 0.7, churn: 0 });
  assert.equal(resultado.valido, false);
  assert.match(resultado.motivo, /churn/i);
});

test('UT-4b: churn negativo ou acima de 100% tambem e invalido', () => {
  assert.equal(calcularLtv({ arpa: 300, margem: 0.7, churn: -0.1 }).valido, false);
  assert.equal(calcularLtv({ arpa: 300, margem: 0.7, churn: 1.5 }).valido, false);
});

test('UT-6: ARPA <= 0 e sinalizado como premissa invalida', () => {
  for (const arpa of [0, -10]) {
    const resultado = calcularLtv({ arpa, margem: 0.7, churn: 0.03 });
    assert.equal(resultado.valido, false);
    assert.match(resultado.motivo, /arpa/i);
  }
});

test('UT-6b: margem fora de 0-100% e sinalizada como premissa invalida', () => {
  for (const margem of [-0.1, 1.1]) {
    const resultado = calcularLtv({ arpa: 300, margem, churn: 0.03 });
    assert.equal(resultado.valido, false);
    assert.match(resultado.motivo, /margem/i);
  }
});

test('UT-6c: entradas nao numericas viram invalido, nao excecao', () => {
  assert.equal(calcularLtv({ arpa: 'x', margem: 0.7, churn: 0.03 }).valido, false);
  assert.equal(calcularLtv(undefined).valido, false);
  assert.equal(calcularPayback({ cac: 1200, margemMensal: 0 }).valido, false);
  assert.equal(calcularPontoEquilibrio({ custoFixo: 15000, margemUnitaria: -1 }).valido, false);
});

test('UT-5: cenarios padrao a partir de churn base 3%', () => {
  const { base, conservador, otimista } = calcularCenarios(basePremissas);
  assert.equal(base.premissas.churn, 0.03);
  assert.ok(Math.abs(conservador.premissas.churn - 0.045) < 1e-12);
  assert.ok(Math.abs(otimista.premissas.churn - 0.021) < 1e-12);
  assert.equal(base.ltv.valor, 7000);
  assert.equal(conservador.ltv.valor, 4666.67);
  assert.equal(otimista.ltv.valor, 10000);
});

test('UT-5b: multiplicadores padrao de CAC, conversao e ARPA', () => {
  const { conservador, otimista } = calcularCenarios(basePremissas);
  assert.ok(Math.abs(conservador.premissas.cac - 1560) < 1e-9);
  assert.ok(Math.abs(conservador.premissas.conversao - 0.14) < 1e-12);
  assert.ok(Math.abs(otimista.premissas.cac - 960) < 1e-9);
  assert.ok(Math.abs(otimista.premissas.conversao - 0.26) < 1e-12);
  assert.equal(conservador.premissas.arpa, 300);
  assert.equal(otimista.premissas.arpa, 300);
});

test('UT-5c: multiplicadores sao editaveis e o padrao nao e mutado', () => {
  const { conservador } = calcularCenarios(basePremissas, {
    conservador: { churn: 2, cac: 1, conversao: 1, arpa: 1 },
  });
  assert.equal(conservador.premissas.churn, 0.06);
  assert.equal(MULTIPLICADORES_PADRAO.conservador.churn, 1.5);
  assert.throws(() => { MULTIPLICADORES_PADRAO.conservador.churn = 9; }, TypeError);
});

test('UT-6d: premissa invalida na base propaga invalido nos cenarios', () => {
  const { base, conservador } = calcularCenarios({ ...basePremissas, churn: 0 });
  assert.equal(base.ltv.valido, false);
  assert.equal(conservador.ltv.valido, false);
});

// ---------- T-2 ----------
test('UT-7: plano com margem bruta 55% contra minimo 60% e reprovado e apontado', () => {
  const resultado = avaliarMargemBruta([
    { nome: 'Essencial', receita: 200, custosVariaveis: 90 },
    { nome: 'Pro', receita: 400, custosVariaveis: 100 },
  ], 0.6);
  assert.equal(resultado.aprovado, false);
  assert.deepEqual(resultado.reprovados, ['Essencial']);
  const essencial = resultado.planos.find((plano) => plano.nome === 'Essencial');
  assert.ok(Math.abs(essencial.margem - 0.55) < 1e-12);
  assert.equal(essencial.aprovado, false);
  assert.match(essencial.motivo, /Essencial.*55.*60/);
  assert.equal(resultado.planos.find((plano) => plano.nome === 'Pro').aprovado, true);
});

test('T-2: minimo padrao e 60% e margem exatamente no minimo aprova', () => {
  assert.equal(MARGEM_BRUTA_MINIMA_PADRAO, 0.6);
  const resultado = avaliarMargemBruta([{ nome: 'Limite', receita: 100, custosVariaveis: 40 }]);
  assert.equal(resultado.aprovado, true);
  assert.deepEqual(resultado.reprovados, []);
});

test('T-2: plano com receita invalida ou custo negativo e reprovado com motivo, sem excecao', () => {
  const resultado = avaliarMargemBruta([
    { nome: 'SemReceita', receita: 0, custosVariaveis: 10 },
    { nome: 'CustoNegativo', receita: 100, custosVariaveis: -5 },
  ]);
  assert.deepEqual(resultado.reprovados, ['SemReceita', 'CustoNegativo']);
  assert.match(resultado.planos[0].motivo, /receita/i);
});

test('T-2: minimo fora de 0-100% e lista vazia falham alto', () => {
  assert.throws(() => avaliarMargemBruta([{ nome: 'A', receita: 1, custosVariaveis: 0 }], 60), RangeError);
  assert.throws(() => avaliarMargemBruta([]), RangeError);
});

// ---------- T-3 ----------
const premissasBrutas = {
  arpa: 300, custoVariavelPorCliente: 90, churn: 0.03, cac: 1200,
  custoFixo: 15000, clientesIniciais: 10, leadsPorMes: 20, conversao: 0.25,
};

test('T-3: projecao de 12 meses traz clientes, receita, custo, margem e MRR', () => {
  const projecao = projetarCenario({
    arpa: 300, custoVariavelPorCliente: 90, churn: 0.03, cac: 1200,
    custoFixo: 15000, clientesIniciais: 10, novosPorMes: 5,
  });
  assert.equal(projecao.length, 12);
  assert.deepEqual(projecao[0], {
    mes: 1, clientes: 14.7, novos: 5, receita: 4410, custo: 22323, margem: -17913, mrr: 4410,
  });
  assert.equal(projecao[11].mes, 12);
  assert.ok(projecao[11].clientes > projecao[0].clientes);
});

test('T-3: projecao nao muta a entrada e e deterministica', () => {
  const entrada = { arpa: 300, custoVariavelPorCliente: 90, churn: 0.03, cac: 1200, custoFixo: 15000, clientesIniciais: 10, novosPorMes: 5 };
  const copia = structuredClone(entrada);
  assert.deepEqual(projetarCenario(entrada), projetarCenario(entrada));
  assert.deepEqual(entrada, copia);
});

test('T-3: calcularModelo devolve 3 cenarios com LTV, payback, equilibrio e projecao', () => {
  const modelo = calcularModelo(premissasBrutas);
  assert.equal(modelo.valido, true);
  const { base, conservador, otimista } = modelo.cenarios;
  assert.equal(base.ltv.valor, 7000);
  assert.equal(base.payback.valor, 5.71);
  assert.equal(base.equilibrio.valor, 72);
  assert.equal(base.projecao.length, 12);
  assert.equal(conservador.ltv.valor, 4666.67);
  assert.equal(otimista.ltv.valor, 10000);
  assert.ok(otimista.projecao[11].mrr > base.projecao[11].mrr);
  assert.ok(base.projecao[11].mrr > conservador.projecao[11].mrr);
});

test('T-3: premissas invalidas voltam { valido: false, motivo } apontando o campo', () => {
  assert.match(calcularModelo({ ...premissasBrutas, churn: 0 }).motivo, /churn/i);
  assert.match(calcularModelo({ ...premissasBrutas, arpa: 0 }).motivo, /arpa/i);
  assert.match(calcularModelo({ ...premissasBrutas, custoVariavelPorCliente: 400 }).motivo, /margem/i);
  assert.match(calcularModelo({ ...premissasBrutas, leadsPorMes: undefined }).motivo, /leadsPorMes/);
  assert.match(calcularModelo({ ...premissasBrutas, conversao: 0.8 }).motivo, /conversao/i);
  assert.match(calcularModelo({ ...premissasBrutas, churn: 0.8 }).motivo, /churn/i);
  assert.equal(calcularModelo(null).valido, false);
});

test('T-3: parseArgs le --churn, --out e --premissas e rejeita flag desconhecida', () => {
  assert.deepEqual(parseArgs(['--churn', '0.05', '--out', 'x.csv', '--premissas', 'p.json']),
    { churn: 0.05, out: 'x.csv', premissas: 'p.json' });
  assert.deepEqual(parseArgs([]), { churn: undefined, out: undefined, premissas: undefined });
  assert.throws(() => parseArgs(['--churn']), /--churn/);
  assert.throws(() => parseArgs(['--churn', 'abc']), /--churn/);
  assert.throws(() => parseArgs(['--foo']), /desconhecida/);
});

// ---------- CLI / FT-2 ----------
const script = join(dirname(fileURLToPath(import.meta.url)), 'modelo-financeiro.mjs');

function rodarCli(...args) {
  const resultado = spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' });
  return { code: resultado.status, out: resultado.stdout, err: resultado.stderr };
}

function comDiretorioTemporario(fn) {
  const dir = mkdtempSync(join(tmpdir(), 'modelo-financeiro-'));
  const limpar = () => rmSync(dir, { recursive: true, force: true });
  let resultado;
  try { resultado = fn(dir); } catch (erro) { limpar(); throw erro; }
  if (resultado instanceof Promise) return resultado.finally(limpar);
  limpar();
  return resultado;
}

const extrair = (saida, cenario, rotulo) =>
  Number(new RegExp(`cenario ${cenario}:.*?${rotulo} ([\\d.]+)`).exec(saida)?.[1]);

test('FT-2: --churn 0.05 muda LTV e cenarios (payback depende so de CAC e margem) e regenera o arquivo', () => {
  comDiretorioTemporario((dir) => {
    const padrao = rodarCli('--out', join(dir, 'a.csv'));
    const alterado = rodarCli('--churn', '0.05', '--out', join(dir, 'b.csv'));
    assert.equal(padrao.code, 0, padrao.err);
    assert.equal(alterado.code, 0, alterado.err);
    assert.equal(extrair(padrao.out, 'base', 'LTV'), 7000);
    assert.equal(extrair(alterado.out, 'base', 'LTV'), 4200);
    assert.equal(extrair(alterado.out, 'conservador', 'LTV'), 2800);
    assert.equal(extrair(alterado.out, 'otimista', 'LTV'), 6000);
    assert.notEqual(extrair(padrao.out, 'conservador', 'LTV'), extrair(alterado.out, 'conservador', 'LTV'));
    assert.equal(extrair(alterado.out, 'base', 'payback'), 5.71);
    assert.notEqual(extrair(alterado.out, 'conservador', 'payback'), extrair(alterado.out, 'base', 'payback'));
    assert.notEqual(readFileSync(join(dir, 'a.csv'), 'utf8'), readFileSync(join(dir, 'b.csv'), 'utf8'));
  });
});

test('CLI: premissas invalidas -> exit 1 e motivo; uso incorreto -> exit 2', () => {
  comDiretorioTemporario((dir) => {
    const invalidas = rodarCli('--churn', '0', '--out', join(dir, 'c.csv'));
    assert.equal(invalidas.code, 1);
    assert.match(invalidas.err, /churn/i);
    assert.equal(existsSync(join(dir, 'c.csv')), false);
    assert.equal(rodarCli('--foo').code, 2);
    assert.equal(rodarCli('--premissas', join(dir, 'nao-existe.json')).code, 2);
  });
});

test('CLI: aceita --premissas proprio e avisa quando usa o arquivo EXEMPLO', () => {
  comDiretorioTemporario((dir) => {
    const proprio = join(dir, 'p.json');
    writeFileSync(proprio, JSON.stringify(premissasBrutas));
    const real = rodarCli('--premissas', proprio, '--out', join(dir, 'd.csv'));
    assert.equal(real.code, 0, real.err);
    assert.doesNotMatch(real.out, /EXEMPLO/);
    const exemplo = rodarCli('--out', join(dir, 'e.csv'));
    assert.match(exemplo.out, /EXEMPLO/);
  });
});

test('CLI: .xlsx tem aba Premissas, uma aba por cenario e formulas', async (t) => {
  let ExcelJS;
  try { ExcelJS = (await import('exceljs')).default; } catch { t.skip('exceljs nao instalado (npm install --prefix scripts)'); return; }
  await comDiretorioTemporario(async (dir) => {
    const arquivo = join(dir, 'modelo.xlsx');
    const resultado = rodarCli('--churn', '0.05', '--out', arquivo);
    assert.equal(resultado.code, 0, resultado.err);
    const livro = new ExcelJS.Workbook();
    await livro.xlsx.readFile(arquivo);
    assert.deepEqual(livro.worksheets.map((aba) => aba.name), ['Premissas', 'Base', 'Conservador', 'Otimista']);
    assert.equal(livro.getWorksheet('Premissas').getCell('B4').value, 0.05);
    const base = livro.getWorksheet('Base');
    const formulas = ['B5', 'B6', 'B13', 'B14', 'B15', 'B16'].map((celula) => base.getCell(celula).value?.formula);
    assert.ok(formulas.every((formula) => typeof formula === 'string'), `sem formula: ${formulas}`);
    assert.match(base.getCell('B14').value.formula, /B3\*B13\/B5/);
    assert.equal(base.getCell('B14').value.result, 4200);
    assert.equal(base.getCell('F31').value.formula, 'E31*$B$3');
  });
});

// ---------- Auditoria: correcoes P2/P3 ----------
const escreverPremissas = (dir, nome, conteudo) => {
  const caminho = join(dir, nome);
  writeFileSync(caminho, JSON.stringify(conteudo));
  return caminho;
};

function valorNoCsv(csv, rotuloCenario, indicador) {
  const linhas = csv.split('\n');
  const inicio = linhas.indexOf(`Cenario ${rotuloCenario}`);
  assert.notEqual(inicio, -1, `cenario ${rotuloCenario} ausente no CSV`);
  const linha = linhas.slice(inicio).find((l) => l.startsWith(`${indicador};`));
  return linha?.split(';')[1];
}

// P2-1: conversao negativa
test('P2-1: conversao negativa e premissa invalida (funcao e CLI exit 1)', () => {
  const modelo = calcularModelo({ ...premissasBrutas, conversao: -0.25 });
  assert.equal(modelo.valido, false);
  assert.match(modelo.motivo, /conversao/i);
  comDiretorioTemporario((dir) => {
    const p = escreverPremissas(dir, 'neg.json', { ...premissasBrutas, conversao: -0.25 });
    const r = rodarCli('--premissas', p, '--out', join(dir, 'n.csv'));
    assert.equal(r.code, 1);
    assert.match(r.err, /conversao/i);
    assert.equal(existsSync(join(dir, 'n.csv')), false);
  });
});

test('P2-1b: multiplicador de conversao negativo gera conversao efetiva negativa e e invalido', () => {
  const modelo = calcularModelo(premissasBrutas, { conservador: { conversao: -1 } });
  assert.equal(modelo.valido, false);
  assert.match(modelo.motivo, /conservador.*conversao/i);
});

// P2-2: ruido de ponto flutuante no CSV
test('P2-2: CSV nao mostra ruido de ponto flutuante em churn, CAC e ARPA dos cenarios', () => {
  const csv = gerarCsv(calcularModelo(premissasBrutas));
  assert.equal(valorNoCsv(csv, 'Base', 'Churn'), '0,03');
  assert.equal(valorNoCsv(csv, 'Conservador', 'Churn'), '0,045');
  assert.equal(valorNoCsv(csv, 'Otimista', 'Churn'), '0,021');
  assert.equal(valorNoCsv(csv, 'Base', 'CAC'), '1200');
  assert.equal(valorNoCsv(csv, 'Conservador', 'CAC'), '1560');
  assert.equal(valorNoCsv(csv, 'Otimista', 'CAC'), '960');
  assert.equal(valorNoCsv(csv, 'Otimista', 'ARPA'), '300');
});

// P2-3: margem bruta minima aplicada ao modelo
test('P2-3: calcularModelo expoe margem e margemMinimaAtendida por cenario', () => {
  const ruim = calcularModelo({ ...premissasBrutas, custoVariavelPorCliente: 200 });
  for (const nome of ['base', 'conservador', 'otimista']) {
    assert.equal(ruim.cenarios[nome].margemMinimaAtendida, false);
    assert.ok(Math.abs(ruim.cenarios[nome].margem - 1 / 3) < 1e-9);
  }
  const boa = calcularModelo(premissasBrutas);
  assert.equal(boa.margemBrutaMinima, 0.6);
  for (const nome of ['base', 'conservador', 'otimista']) assert.equal(boa.cenarios[nome].margemMinimaAtendida, true);
  const exigente = calcularModelo({ ...premissasBrutas, margemBrutaMinima: 0.8 });
  assert.equal(exigente.cenarios.base.margemMinimaAtendida, false);
  assert.match(calcularModelo({ ...premissasBrutas, margemBrutaMinima: 1.5 }).motivo, /margemBrutaMinima/);
});

test('P2-3: CLI avisa (exit 0) no resumo e no CSV quando margem fica abaixo do minimo; sem aviso quando atende', () => {
  comDiretorioTemporario((dir) => {
    const ruim = escreverPremissas(dir, 'ruim.json', { ...premissasBrutas, custoVariavelPorCliente: 200 });
    const rRuim = rodarCli('--premissas', ruim, '--out', join(dir, 'ruim.csv'));
    assert.equal(rRuim.code, 0, rRuim.err);
    assert.match(rRuim.out, /AVISO.*margem bruta.*abaixo do minimo/i);
    assert.match(readFileSync(join(dir, 'ruim.csv'), 'utf8'), /^Aviso margem;.*abaixo do minimo/im);
    const boa = escreverPremissas(dir, 'boa.json', premissasBrutas);
    const rBoa = rodarCli('--premissas', boa, '--out', join(dir, 'boa.csv'));
    assert.equal(rBoa.code, 0, rBoa.err);
    assert.doesNotMatch(rBoa.out, /abaixo do minimo/i);
    assert.doesNotMatch(readFileSync(join(dir, 'boa.csv'), 'utf8'), /abaixo do minimo/i);
  });
});

// Cobertura (a): mutantes de UT-3b
test('UT-3b: ruido de ponto flutuante nao soma cliente (0,3/0,1 = 3 e (0,1+0,2)/0,1 = 3)', () => {
  assert.equal(calcularPontoEquilibrio({ custoFixo: 0.3, margemUnitaria: 0.1 }).valor, 3);
  assert.equal(calcularPontoEquilibrio({ custoFixo: 0.1 + 0.2, margemUnitaria: 0.1 }).valor, 3);
  assert.equal(calcularPontoEquilibrio({ custoFixo: 21001, margemUnitaria: 210 }).valor, 101);
});

// Cobertura (b): tolerancia de T-2
test('T-2: margem 0,5999999999999 aprova pela tolerancia; 0,59999999999 reprova', () => {
  assert.equal(avaliarMargemBruta([{ nome: 'A', receita: 1, custosVariaveis: 0.4000000000001 }]).aprovado, true);
  assert.equal(avaliarMargemBruta([{ nome: 'B', receita: 1, custosVariaveis: 0.40000000001 }]).aprovado, false);
});

// P3: plano nulo
test('P3: avaliarMargemBruta([null]) nao lanca e reprova com motivo', () => {
  const resultado = avaliarMargemBruta([null]);
  assert.equal(resultado.aprovado, false);
  assert.match(resultado.planos[0].motivo, /receita/i);
});

// Cobertura (c): xlsx formulas e valores em cache
const formulasDoCenario = (m) => ({
  B3: `Premissas!B2*Premissas!E${m}`, B4: 'Premissas!B3', B5: `Premissas!B4*Premissas!B${m}`,
  B6: `Premissas!B5*Premissas!C${m}`, B7: 'Premissas!B6', B8: 'Premissas!B7', B9: 'Premissas!B8',
  B10: `Premissas!B9*Premissas!D${m}`, B11: 'B9*B10', B12: 'B3-B4', B13: 'B12/B3',
  B14: 'ROUND(B3*B13/B5,2)', B15: 'ROUND(B6/B12,2)', B16: 'ROUNDUP(B7/B12,0)',
  B17: 'IF(B13>=Premissas!B10,"sim","nao")',
});

async function lerXlsxGerado(dir, premissas) {
  const { default: ExcelJS } = await import('exceljs');
  const arquivo = join(dir, 'm.xlsx');
  const r = rodarCli('--premissas', escreverPremissas(dir, 'x.json', premissas), '--out', arquivo);
  assert.equal(r.code, 0, r.err);
  const livro = new ExcelJS.Workbook();
  await livro.xlsx.readFile(arquivo);
  return livro;
}

test('P2-3/xlsx: formulas e valores em cache de B3..B17 e da projecao nas abas Base, Conservador e Otimista', async (t) => {
  try { await import('exceljs'); } catch { t.skip('exceljs nao instalado'); return; }
  await comDiretorioTemporario(async (dir) => {
    const livro = await lerXlsxGerado(dir, premissasBrutas);
    const modelo = calcularModelo(premissasBrutas);
    const abas = [['Base', 'base', 14], ['Conservador', 'conservador', 15], ['Otimista', 'otimista', 16]];
    for (const [aba, nome, m] of abas) {
      const folha = livro.getWorksheet(aba);
      const c = modelo.cenarios[nome];
      const resultados = {
        B3: c.premissas.arpa, B4: c.premissas.custoVariavelPorCliente, B5: c.premissas.churn, B6: c.premissas.cac,
        B7: c.premissas.custoFixo, B8: c.premissas.clientesIniciais, B9: c.premissas.leadsPorMes,
        B10: c.premissas.conversao, B11: c.premissas.novosPorMes, B12: c.premissas.margemUnitaria,
        B13: c.premissas.margem, B14: c.ltv.valor, B15: c.payback.valor, B16: c.equilibrio.valor, B17: 'sim',
      };
      for (const [celula, formula] of Object.entries(formulasDoCenario(m))) {
        const valorCelula = folha.getCell(celula).value;
        assert.equal(valorCelula.formula, formula, `${aba}!${celula} formula`);
        assert.equal(valorCelula.result, resultados[celula], `${aba}!${celula} valor`);
      }
      const p = c.projecao;
      const linha20 = folha.getRow(20);
      assert.equal(linha20.getCell('B').value.formula, 'B8');
      assert.equal(linha20.getCell('B').value.result, c.premissas.clientesIniciais);
      const r = 21;
      const esperadas = { B: `E${r - 1}`, C: `B${r}*$B$5`, D: '$B$11', E: `B${r}-C${r}+D${r}`, F: `E${r}*$B$3`, G: `$B$7+E${r}*$B$4+D${r}*$B$6`, H: `F${r}-G${r}`, I: `F${r}` };
      const valores = { B: p[0].clientes, D: p[1].novos, E: p[1].clientes, F: p[1].receita, G: p[1].custo, H: p[1].margem, I: p[1].mrr };
      for (const [col, formula] of Object.entries(esperadas)) {
        const v = folha.getCell(`${col}${r}`).value;
        assert.equal(v.formula, formula, `${aba}!${col}${r} formula`);
        if (col in valores) assert.equal(v.result, valores[col], `${aba}!${col}${r} valor`);
      }
      assert.equal(folha.getCell(`A${r}`).value, 2);
    }
  });
});

test('P2-3/xlsx: "atende margem minima" e Premissas!B10 usam margemBrutaMinima das premissas', async (t) => {
  try { await import('exceljs'); } catch { t.skip('exceljs nao instalado'); return; }
  await comDiretorioTemporario(async (dir) => {
    const livro = await lerXlsxGerado(dir, { ...premissasBrutas, margemBrutaMinima: 0.8 });
    assert.equal(livro.getWorksheet('Premissas').getCell('B10').value, 0.8);
    for (const aba of ['Base', 'Conservador', 'Otimista']) assert.equal(livro.getWorksheet(aba).getCell('B17').value.result, 'nao');
  });
});

// Cobertura (d): --out
test('--out: extensao invalida -> exit 2 sem criar arquivo', () => {
  comDiretorioTemporario((dir) => {
    const r = rodarCli('--out', join(dir, 'saida.txt'));
    assert.equal(r.code, 2);
    assert.match(r.err, /\.xlsx ou \.csv/);
    assert.equal(existsSync(join(dir, 'saida.txt')), false);
  });
});

test('--out: arquivo existente exige --force (sem ele exit 2 e arquivo intacto)', () => {
  comDiretorioTemporario((dir) => {
    const alvo = join(dir, 'existente.csv');
    writeFileSync(alvo, 'original');
    const sem = rodarCli('--out', alvo);
    assert.equal(sem.code, 2);
    assert.match(sem.err, /--force/);
    assert.equal(readFileSync(alvo, 'utf8'), 'original');
    const com = rodarCli('--out', alvo, '--force');
    assert.equal(com.code, 0, com.err);
    assert.match(readFileSync(alvo, 'utf8'), /Premissas;Valor/);
  });
});

test('parseArgs: --force e flag booleana sem valor', () => {
  assert.equal(parseArgs(['--force']).force, true);
  assert.equal(parseArgs(['--out', 'x.csv', '--force']).force, true);
});

// P3: multiplicadores do --premissas
test('P3: --premissas valida multiplicadores (cenario/campo desconhecido, nao positivo) com exit 2', () => {
  comDiretorioTemporario((dir) => {
    const casos = [
      [{ pessimista: { churn: 2 } }, /pessimista/],
      [{ conservador: { churm: 2 } }, /churm/],
      [{ conservador: { churn: 0 } }, /churn/],
      [{ otimista: { conversao: -1 } }, /conversao/],
      [{ base: { cac: 'x' } }, /cac/],
      [[1], /multiplicadores/],
    ];
    casos.forEach(([multiplicadores, padrao], i) => {
      const p = escreverPremissas(dir, `m${i}.json`, { ...premissasBrutas, multiplicadores });
      const r = rodarCli('--premissas', p, '--out', join(dir, `m${i}.csv`));
      assert.equal(r.code, 2, `caso ${i}: ${r.err}`);
      assert.match(r.err, padrao);
    });
    const ok = escreverPremissas(dir, 'ok.json', { ...premissasBrutas, multiplicadores: { conservador: { churn: 2 } } });
    assert.equal(rodarCli('--premissas', ok, '--out', join(dir, 'ok.csv')).code, 0);
  });
});

// P3: _aviso saneado no CSV
test('P3: _aviso no CSV e saneado contra injecao de formula e quebra de linha/coluna', () => {
  const modelo = calcularModelo(premissasBrutas);
  const primeira = (aviso) => gerarCsv(modelo, { aviso }).split('\n')[0];
  assert.equal(primeira('=HYPERLINK("x")'), 'Aviso;\'=HYPERLINK("x")');
  for (const inicio of ['+', '-', '@']) assert.equal(primeira(`${inicio}cmd`), `Aviso;'${inicio}cmd`);
  assert.equal(primeira('EXEMPLO\nlinha;extra'), 'Aviso;EXEMPLOlinhaextra');
  assert.equal(primeira('EXEMPLO normal'), 'Aviso;EXEMPLO normal');
});

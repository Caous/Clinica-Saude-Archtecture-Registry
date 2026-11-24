import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { REQUIRED_FILES } from './check-negocio.mjs';

const script = join(dirname(fileURLToPath(import.meta.url)), 'check-negocio.mjs');

const NEGOCIO = 'context/negocio/';
const NO_STACK = /\n\s+at /;

function fixture(files) {
  const root = mkdtempSync(join(tmpdir(), 'check-negocio-'));
  for (const [rel, content] of Object.entries(files)) {
    const full = join(root, NEGOCIO, rel);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, content);
  }
  return root;
}

function run(root, ...extra) {
  const r = spawnSync(process.execPath, [script, root, ...extra], { encoding: 'utf8' });
  return { code: r.status, out: r.stdout, err: r.stderr };
}

function withFixture(files, fn) {
  const root = fixture(files);
  try { return fn(root); } finally { rmSync(root, { recursive: true, force: true }); }
}

/** Roda --docs sobre os documentos validos com `overrides` e retorna { code, out }. */
function runDocs(overrides) {
  return withFixture({ ...docsOk(), ...overrides }, (root) => run(root, '--docs'));
}

// ---------- fixtures validas ----------
const NICHOS = ['Fisioterapia', 'Estética', 'Odontologia', 'Medicina', 'Psicologia', 'Nutrição',
  'Fonoaudiologia', 'Pilates', 'Veterinária', 'Podologia', 'Autônomos'];

const mercadoRow = (nicho, i) => `| ${nicho} | R$ 1 bi | ${i % 2 ? 'https://fonte.example/x' : 'hipótese'} | 2026-11-24 | agenda | R$ 300 | módulos x lacunas | ${i % 10} |`;
const mercadoOk = [
  '# Mercado',
  '## Matriz de nichos',
  '| Nicho | Tamanho de mercado | Fonte | Data | Dor principal | Ticket | Adequação do sistema | Nota |',
  '|---|---|---|---|---|---|---|---|',
  ...NICHOS.map(mercadoRow),
  '',
  '## Decisão de nicho',
  'Nicho de entrada: Fisioterapia',
  'Nichos de expansão: Pilates, Psicologia',
  'Aprovado por: Maria Silva em 2026-11-24',
].join('\n');

const concorrentesOk = [
  '# Concorrentes',
  '## Concorrentes',
  '| Nome | URL | Data | Funcionalidades | Preço | Modelo de cobrança | Pontos fortes | Pontos fracos |',
  '|---|---|---|---|---|---|---|---|',
  ...Array.from({ length: 8 }, (_, i) => `| C${i} | https://c${i}.example | 2026-11-24 | f | não confirmado | mensal | forte | fraco |`),
  '',
  '## Espaço de diferenciação',
  '- IA', '- WhatsApp', '- Agendamento',
].join('\n');

const precificacaoOk = [
  '# Precificação',
  'Margem bruta mínima: 60%',
  'Aprovado por: Maria Silva em 2026-11-24',
].join('\n');

const persona = (nome) => [
  `## Persona: ${nome}`,
  'Perfil: clínica de 3 profissionais',
  'Dores: agenda no papel',
  'Gatilhos de compra: faltas',
  'Objeções: preço',
  'Critérios de decisão: facilidade',
].join('\n');
const personasOk = ['# ICP', persona('Ana'), persona('Bruno')].join('\n');

const modelo = (letra) => [
  `### (${letra}) Modelo ${letra}`,
  'Receita: mensal',
  'Custo: infra',
  'Risco: churn',
  'Esforço técnico: baixo',
  'Adequação: pequenas',
].join('\n');
const modeloOk = ['# Modelos', '## Comparação', ...['a', 'b', 'c', 'd', 'e'].map(modelo)].join('\n');

const gtmOk = [
  '# GTM',
  '## Canais',
  '- indicação', '- parcerias', '- WhatsApp', '- redes', '- anúncios', '- conteúdo',
  '## Funil',
  '| Etapa | Taxa mínima | Taxa máxima | Hipótese |',
  '|---|---|---|---|',
  '| Lead para demo | 10% | 20% | sim |',
  '| Demo para venda | 15 | 30 | sim |',
  '## Oferta de lançamento',
  'Implantação gratuita nos 10 primeiros.',
  '## Plano de 90 dias',
  '- Semana 1: lista de leads',
].join('\n');

const riscosOk = [
  '# Riscos',
  '| Risco | Tipo | PBI sugerido |',
  '|---|---|---|',
  ...Array.from({ length: 5 }, (_, i) => `| R${i} | técnico | PBI-futuro-${i} |`),
].join('\n');

const docsOk = () => ({
  'mercado.md': mercadoOk,
  'concorrentes.md': concorrentesOk,
  'precificacao.md': precificacaoOk,
  'icp-personas.md': personasOk,
  'modelo-negocio.md': modeloOk,
  'go-to-market.md': gtmOk,
  'riscos-prerequisitos.md': riscosOk,
});

const allRequiredFiles = () => Object.fromEntries(REQUIRED_FILES.map((name) => [name, `# ${name}`]));

test('docs: fixtures completas -> exit 0', () => {
  const { code, out } = runDocs({});
  assert.equal(code, 0, out);
});

// ---------- UT-8, UT-9: mercado ----------
test('UT-8: nicho sem nota -> exit 1 apontando o nicho', () => {
  const { code, out } = runDocs({ 'mercado.md': mercadoOk.replace(mercadoRow('Odontologia', 2), mercadoRow('Odontologia', 2).replace(/\| 2 \|$/, '|  |')) });
  assert.equal(code, 1);
  assert.match(out, /nicho "Odontologia".*nota/);
});

test('UT-8: coluna ausente, nota fora de 0-10 ou nao numerica, ou != 11 linhas -> exit 1', async (t) => {
  const variantes = {
    'coluna ausente': [mercadoOk.replace('| Nota |', '| Outra |'), /coluna "nota" ausente/],
    'nota 11': [mercadoOk.replace('| 2 |', '| 11 |'), /nota invalida \(11\)/],
    'nota texto': [mercadoOk.replace('| 3 |', '| alta |'), /nota invalida \(alta\)/],
    '10 linhas': [mercadoOk.replace(/\| Autônomos .*\n?/, ''), /10 nicho\(s\) na matriz; esperado 11/],
    '12 linhas': [`${mercadoOk.replace('\n\n## Decisão', `\n${mercadoRow('Extra', 1)}\n\n## Decisão`)}`, /12 nicho\(s\) na matriz; esperado 11/],
    'matriz ausente': [mercadoOk.replace('## Matriz de nichos', '## Outra'), /secao "Matriz de nichos" ausente/],
  };
  for (const [nome, [conteudo, esperado]] of Object.entries(variantes)) {
    await t.test(nome, () => {
      const { code, out } = runDocs({ 'mercado.md': conteudo });
      assert.equal(code, 1);
      assert.match(out, esperado);
    });
  }
});

test('UT-8: colunas em outra ordem, caixa e sem acento -> exit 0', () => {
  const embaralhado = [
    '## Matriz de nichos',
    '| NOTA | data | FONTE | nicho | Adequacao do sistema | ticket | dor principal | tamanho de mercado |',
    '|---|---|---|---|---|---|---|---|',
    ...NICHOS.map((n, i) => `| 5 | 2026-11-24 | hipotese | ${n} | a | b | c | d${i} |`),
    '## Decisão de nicho',
    'Nicho de entrada: X', 'Nichos de expansão: Y', 'Aprovado por: Z em 2026-11-24',
  ].join('\n');
  const { code, out } = runDocs({ 'mercado.md': embaralhado });
  assert.equal(code, 0, out);
});

test('UT-9: linha de mercado sem URL nem "hipótese" -> exit 1 apontando o nicho', () => {
  const { code, out } = runDocs({ 'mercado.md': mercadoOk.replace('hipótese', 'achismo') });
  assert.equal(code, 1);
  assert.match(out, /nicho "Fisioterapia".*fonte sem URL/);
});

test('UT-9: data da linha ausente ou invalida -> exit 1', async (t) => {
  for (const [nome, data] of [['invalida', '2026-13-45'], ['ausente', 'ontem']]) {
    await t.test(nome, () => {
      const { code, out } = runDocs({ 'mercado.md': mercadoOk.replace('2026-11-24 | agenda', `${data} | agenda`) });
      assert.equal(code, 1);
      assert.match(out, /nicho "Fisioterapia".*data/);
    });
  }
});

// ---------- UT-11 e decisao de nicho ----------
test('UT-11: "Decisão de nicho" sem Aprovado por, ou com data invalida -> exit 1', async (t) => {
  await t.test('sem aprovacao', () => {
    const { code, out } = runDocs({ 'mercado.md': mercadoOk.replace(/Aprovado por:.*/, '') });
    assert.equal(code, 1);
    assert.match(out, /mercado\.md.*Aprovado por/);
  });
  await t.test('data invalida', () => {
    const { code, out } = runDocs({ 'mercado.md': mercadoOk.replace('em 2026-11-24', 'em 2026-02-30') });
    assert.equal(code, 1);
    assert.match(out, /data de aprovacao invalida/);
  });
});

test('decisao de nicho: sem entrada, sem expansao ou com 3 expansoes -> exit 1', async (t) => {
  const variantes = {
    'sem entrada': [mercadoOk.replace('Nicho de entrada: Fisioterapia', ''), /Nicho de entrada/],
    'sem expansao': [mercadoOk.replace(/Nichos de expansão:.*/, ''), /Nichos de expansão/],
    '3 expansoes': [mercadoOk.replace('Pilates, Psicologia', 'A, B, C'), /3 nicho\(s\) de expansao/],
  };
  for (const [nome, [conteudo, esperado]] of Object.entries(variantes)) {
    await t.test(nome, () => {
      const { code, out } = runDocs({ 'mercado.md': conteudo });
      assert.equal(code, 1);
      assert.match(out, esperado);
    });
  }
});

test('decisao de nicho: expansao em itens de lista e rotulos em negrito/lista -> exit 0', () => {
  const alterado = mercadoOk.replace(/Nicho de entrada:[\s\S]*$/, [
    '- **Nicho de entrada:** Fisioterapia',
    '- **Nichos de expansão:**',
    '  - Pilates',
    '  - Psicologia',
    '- **Aprovado por:** Maria Silva em 2026-11-24',
  ].join('\n'));
  const { code, out } = runDocs({ 'mercado.md': alterado });
  assert.equal(code, 0, out);
});

test('UT-11: precificacao.md sem Aprovado por -> exit 1', () => {
  const { code, out } = runDocs({ 'precificacao.md': precificacaoOk.replace(/Aprovado por:.*/, '') });
  assert.equal(code, 1);
  assert.match(out, /precificacao\.md.*Aprovado por/);
});

test('precificacao: margem ausente, mal formada ou fora de 0-100 -> exit 1', async (t) => {
  const variantes = {
    ausente: [precificacaoOk.replace(/Margem.*\n/, ''), /Margem bruta/],
    'sem percentual': [precificacaoOk.replace('60%', 'sessenta'), /Margem bruta/],
    'acima de 100': [precificacaoOk.replace('60%', '160%'), /fora de 0-100/],
  };
  for (const [nome, [conteudo, esperado]] of Object.entries(variantes)) {
    await t.test(nome, () => {
      const { code, out } = runDocs({ 'precificacao.md': conteudo });
      assert.equal(code, 1);
      assert.match(out, esperado);
    });
  }
});

// ---------- UT-10: concorrentes ----------
test('UT-10: concorrentes com menos de 8 linhas -> exit 1', () => {
  const { code, out } = runDocs({ 'concorrentes.md': concorrentesOk.replace(/\| C7 .*\n/, '') });
  assert.equal(code, 1);
  assert.match(out, /7 concorrente\(s\); minimo 8/);
});

test('concorrentes: url invalida, data invalida, coluna vazia/ausente ou sem diferenciacao -> exit 1', async (t) => {
  const variantes = {
    'url sem http': [concorrentesOk.replace('https://c0.example', 'c0.example'), /concorrente "C0".*url invalida/],
    'data invalida': [concorrentesOk.replace('| C1 | https://c1.example | 2026-11-24', '| C1 | https://c1.example | 2026-00-10'), /concorrente "C1".*data/],
    'celula vazia': [concorrentesOk.replace('| C2 | https://c2.example | 2026-11-24 | f |', '| C2 | https://c2.example | 2026-11-24 |  |'), /concorrente "C2".*"funcionalidades" vazia/],
    'coluna ausente': [concorrentesOk.replace('| Pontos fracos |', '| Outro |'), /coluna "pontos fracos" ausente/],
    'diferenciacao curta': [concorrentesOk.replace('- Agendamento', ''), /Espaço de diferenciação.*>= 3/],
    'diferenciacao ausente': [concorrentesOk.replace('## Espaço de diferenciação', '## Outra'), /secao "Espaço de diferenciação" ausente/],
  };
  for (const [nome, [conteudo, esperado]] of Object.entries(variantes)) {
    await t.test(nome, () => {
      const { code, out } = runDocs({ 'concorrentes.md': conteudo });
      assert.equal(code, 1);
      assert.match(out, esperado);
    });
  }
});

// ---------- UT-14: personas ----------
test('UT-14: icp-personas.md com 1 persona -> exit 1', () => {
  const { code, out } = runDocs({ 'icp-personas.md': ['# ICP', persona('Ana')].join('\n') });
  assert.equal(code, 1);
  assert.match(out, /icp-personas\.md.*1 persona\(s\); minimo 2/);
});

test('UT-14: persona sem objecoes (ou rotulo vazio) -> exit 1 apontando a persona', async (t) => {
  await t.test('ausente', () => {
    const { code, out } = runDocs({ 'icp-personas.md': ['# ICP', persona('Ana'), persona('Bruno').replace('Objeções: preço\n', '')].join('\n') });
    assert.equal(code, 1);
    assert.match(out, /persona "Persona: Bruno".*"Objeções:" ausente/);
  });
  await t.test('vazio', () => {
    const { code, out } = runDocs({ 'icp-personas.md': ['# ICP', persona('Ana').replace('Dores: agenda no papel', 'Dores:'), persona('Bruno')].join('\n') });
    assert.equal(code, 1);
    assert.match(out, /persona "Persona: Ana".*"Dores:" vazio/);
  });
});

test('UT-14: rotulo com itens de lista abaixo conta como preenchido', () => {
  const comLista = persona('Ana').replace('Dores: agenda no papel', 'Dores:\n- agenda no papel\n- faltas');
  const { code, out } = runDocs({ 'icp-personas.md': ['# ICP', comLista, persona('Bruno')].join('\n') });
  assert.equal(code, 0, out);
});

// ---------- UT-15: modelos ----------
test('UT-15: modelo-negocio.md sem o modelo (e) -> exit 1 apontando o modelo', () => {
  const { code, out } = runDocs({ 'modelo-negocio.md': modeloOk.replace(modelo('e'), '') });
  assert.equal(code, 1);
  assert.match(out, /modelo-negocio\.md.*modelo "\(e\)" ausente/);
});

test('UT-15: modelo sem "Risco:" -> exit 1 apontando o modelo', () => {
  const { code, out } = runDocs({ 'modelo-negocio.md': modeloOk.replace(modelo('c'), modelo('c').replace('Risco: churn\n', '')) });
  assert.equal(code, 1);
  assert.match(out, /modelo "\(c\) Modelo c".*"Risco:" ausente/);
});

// ---------- UT-12: funil ----------
test('UT-12: taxa sem faixa minimo-maximo -> exit 1 apontando a etapa', async (t) => {
  const variantes = {
    'maximo vazio': [gtmOk.replace('| 10% | 20% | sim |', '| 10% |  | sim |'), /etapa "Lead para demo".*taxa maxima/],
    'taxa unica sem faixa': [gtmOk.replace('| Taxa mínima | Taxa máxima | Hipótese |', '| Taxa | Taxa máxima | Hipótese |'), /coluna "taxa minima" ausente/],
    'minimo > maximo': [gtmOk.replace('| 15 | 30 |', '| 40 | 30 |'), /etapa "Demo para venda".*maior que a maxima/],
    'acima de 100': [gtmOk.replace('| 10% | 20% |', '| 10% | 120% |'), /etapa "Lead para demo".*taxa maxima/],
    'nao e hipotese': [gtmOk.replace('| 15 | 30 | sim |', '| 15 | 30 | nao |'), /etapa "Demo para venda".*hipotese/],
    'funil sem etapas': [gtmOk.replace(/\| Lead para demo.*\n\| Demo para venda.*\n/, ''), /funil sem etapas/],
  };
  for (const [nome, [conteudo, esperado]] of Object.entries(variantes)) {
    await t.test(nome, () => {
      const { code, out } = runDocs({ 'go-to-market.md': conteudo });
      assert.equal(code, 1);
      assert.match(out, esperado);
    });
  }
});

test('go-to-market: oferta ou plano de 90 dias vazios -> exit 1', async (t) => {
  await t.test('oferta vazia', () => {
    const { code, out } = runDocs({ 'go-to-market.md': gtmOk.replace('Implantação gratuita nos 10 primeiros.', '') });
    assert.equal(code, 1);
    assert.match(out, /"Oferta de lançamento" vazia/);
  });
  await t.test('plano ausente', () => {
    const { code, out } = runDocs({ 'go-to-market.md': gtmOk.replace('## Plano de 90 dias', '## Outro') });
    assert.equal(code, 1);
    assert.match(out, /secao "Plano de 90 dias" ausente/);
  });
});

// ---------- UT-16: canais e riscos ----------
test('UT-16: menos de 6 canais -> exit 1', () => {
  const { code, out } = runDocs({ 'go-to-market.md': gtmOk.replace('- conteúdo', '') });
  assert.equal(code, 1);
  assert.match(out, /5 canal\(is\); minimo 6/);
});

test('UT-16: risco sem PBI sugerido -> exit 1 apontando o risco', () => {
  const { code, out } = runDocs({ 'riscos-prerequisitos.md': riscosOk.replace('PBI-futuro-3', '') });
  assert.equal(code, 1);
  assert.match(out, /risco "R3": sem PBI sugerido/);
});

test('UT-16: menos de 5 riscos ou coluna ausente -> exit 1', async (t) => {
  await t.test('4 riscos', () => {
    const { code, out } = runDocs({ 'riscos-prerequisitos.md': riscosOk.replace(/\| R4 .*/, '') });
    assert.equal(code, 1);
    assert.match(out, /4 risco\(s\); minimo 5/);
  });
  await t.test('coluna ausente', () => {
    const { code, out } = runDocs({ 'riscos-prerequisitos.md': riscosOk.replace('| PBI sugerido |', '| Ação |') });
    assert.equal(code, 1);
    assert.match(out, /coluna "pbi sugerido" ausente/);
  });
});

// ---------- UT-13: arquivos obrigatorios e links ----------
test('--arquivos: todos os 13 obrigatorios -> exit 0', () => {
  withFixture(allRequiredFiles(), (root) => {
    const { code, out } = run(root, '--arquivos');
    assert.equal(code, 0, out);
  });
  assert.equal(REQUIRED_FILES.length, 13);
});

test('UT-13: falta riscos-prerequisitos.md (e o xlsx) -> exit 1 listando os arquivos', () => {
  const files = allRequiredFiles();
  delete files['riscos-prerequisitos.md'];
  delete files['modelo-financeiro.xlsx'];
  withFixture(files, (root) => {
    const { code, out } = run(root, '--arquivos');
    assert.equal(code, 1);
    assert.match(out, /riscos-prerequisitos\.md/);
    assert.match(out, /modelo-financeiro\.xlsx/);
  });
});

test('--arquivos: obrigatorio que e diretorio -> exit 1', () => {
  const files = allRequiredFiles();
  delete files['objecoes-faq.md'];
  files['objecoes-faq.md/x'] = 'x';
  withFixture(files, (root) => {
    const { code, out } = run(root, '--arquivos');
    assert.equal(code, 1);
    assert.match(out, /objecoes-faq\.md.*nao e um arquivo/);
  });
});

test('links ok (relativos, imagens, ancora, http, mailto, esquemas, bloco de codigo) -> exit 0', () => {
  const readme = [
    '[a](mercado.md) [b](mercado.md#secao) ![l](img/x.png "t")',
    '[c](#topo) [d](https://x.example) [e](mailto:a@b.c) [f](tel:123) [g](//host/x)',
    '```',
    '[ignorado](nao-existe.md)',
    '```',
  ].join('\n');
  withFixture({ 'README.md': readme, 'mercado.md': '# m', 'img/x.png': 'png' }, (root) => {
    const { code, out } = run(root, '--links');
    assert.equal(code, 0, out);
  });
});

test('UT-13: link quebrado -> exit 1 apontando link e arquivo de origem', () => {
  withFixture({ 'README.md': '[x](nao-existe.md)', 'sub/outro.md': '![i](../faltando.png)' }, (root) => {
    const { code, out } = run(root, '--links');
    assert.equal(code, 1);
    assert.match(out, /README\.md:1/);
    assert.match(out, /nao-existe\.md/);
    assert.match(out, /outro\.md:1/);
    assert.match(out, /faltando\.png/);
  });
});

test('links: ausencia de documentos nao faz --links falhar', () => {
  withFixture({ 'README.md': '# so o indice' }, (root) => {
    assert.equal(run(root, '--links').code, 0);
  });
});

test('links: alvo fora da pasta de negocio (mesmo existente) -> pendencia', () => {
  withFixture({ 'README.md': '[x](../marca/identidade.md)', '../marca/identidade.md': '# i' }, (root) => {
    const { code, out } = run(root, '--links');
    assert.equal(code, 1);
    assert.match(out, /fora da pasta de negocio/);
  });
});

test('links: caminho absoluto (/etc/hosts, C:\\x) -> pendencia "absoluto"', async (t) => {
  for (const target of ['/etc/hosts', 'C:\\x']) {
    await t.test(target, () => {
      withFixture({ 'README.md': `[x](${target})` }, (root) => {
        const { code, out } = run(root, '--links');
        assert.equal(code, 1);
        assert.match(out, /absoluto/);
      });
    });
  }
});

// ---------- I/O ----------
test('docs: arquivo ausente -> exit 1 apontando o arquivo', () => {
  const files = docsOk();
  delete files['icp-personas.md'];
  withFixture(files, (root) => {
    const { code, out } = run(root, '--docs');
    assert.equal(code, 1);
    assert.match(out, /icp-personas\.md: arquivo ausente/);
  });
});

test('I/O: mercado.md como diretorio -> pendencia com codigo, sem stack trace', () => {
  const files = docsOk();
  delete files['mercado.md'];
  files['mercado.md/x'] = 'x';
  withFixture(files, (root) => {
    const { code, out, err } = run(root, '--docs');
    assert.equal(code, 1);
    assert.match(out, /mercado\.md.*EISDIR/);
    assert.doesNotMatch(err, NO_STACK);
  });
});

test('I/O: context/negocio como arquivo -> exit 2 com mensagem clara, sem stack trace', () => {
  const root = mkdtempSync(join(tmpdir(), 'check-negocio-'));
  try {
    mkdirSync(join(root, 'context'), { recursive: true });
    writeFileSync(join(root, 'context', 'negocio'), 'arquivo');
    const { code, err } = run(root, '--links');
    assert.equal(code, 2);
    assert.match(err, /check-negocio:/);
    assert.doesNotMatch(err, NO_STACK);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// ---------- CLI ----------
test('sem flag roda os tres modos e consolida exit code', () => {
  withFixture({ 'README.md': '# vazio' }, (root) => {
    const { code, out } = run(root);
    assert.equal(code, 1);
    assert.match(out, /\[docs\].*mercado\.md/);
    assert.match(out, /\[arquivos\].*riscos-prerequisitos\.md/);
    assert.match(out, /check-negocio --links: ok/);
  });
});

test('FT-3: documentos, arquivos e links completos -> exit 0 no modo padrao', () => {
  const files = { ...allRequiredFiles(), ...docsOk(), 'README.md': '[m](mercado.md) [c](concorrentes.md)' };
  withFixture(files, (root) => {
    const { code, out } = run(root);
    assert.equal(code, 0, out);
  });
});

test('raiz inexistente, flag desconhecida ou excesso de posicionais -> exit 2', () => {
  assert.equal(run(join(tmpdir(), 'nao-existe-check-negocio-xyz')).code, 2);
  withFixture({ 'README.md': '#' }, (root) => {
    assert.equal(run(root, '--bogus').code, 2);
    assert.equal(spawnSync(process.execPath, [script, root, root], { encoding: 'utf8' }).status, 2);
  });
});

// ---------- --negocio <dir> ----------
function withNegocioOutsideRoot(files, fn) {
  const base = mkdtempSync(join(tmpdir(), 'check-negocio-ext-'));
  const root = join(base, 'registry');
  const negocio = join(base, 'Negocio');
  mkdirSync(root, { recursive: true });
  for (const [rel, content] of Object.entries(files)) {
    const full = join(negocio, rel);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, content);
  }
  try { return fn(root, negocio); } finally { rmSync(base, { recursive: true, force: true }); }
}

test('--negocio: pasta fora da raiz (absoluta) com docs validos -> exit 0', () => {
  withNegocioOutsideRoot(docsOk(), (root, negocio) => {
    const { code, out } = run(root, '--docs', '--negocio', negocio);
    assert.equal(code, 0, out);
  });
});

test('--negocio: caminho relativo ao cwd e aceito', () => {
  withNegocioOutsideRoot(docsOk(), (root) => {
    const r = spawnSync(process.execPath, [script, root, '--docs', '--negocio', '../Negocio'], { encoding: 'utf8', cwd: root });
    assert.equal(r.status, 0, r.stdout + r.stderr);
  });
});

test('--negocio: sem valor -> exit 2 com mensagem clara', () => {
  for (const argv of [['--negocio'], ['--negocio', '--docs']]) {
    const { code, err } = run('.', ...argv);
    assert.equal(code, 2);
    assert.match(err, /check-negocio:.*--negocio/);
  }
});

test('--negocio: diretorio inexistente -> exit 2 com mensagem clara', () => {
  const { code, err } = run('.', '--negocio', join(tmpdir(), 'nao-existe-negocio-xyz'));
  assert.equal(code, 2);
  assert.match(err, /check-negocio:.*nao encontrad/);
});

// ---------- auditoria: P2 ----------
test('P2-1: linha com 50 mil "[" nao causa ReDoS em --links (< 1 s)', () => {
  withFixture({ 'a.md': `${'['.repeat(50000)}\n` }, (root) => {
    const start = Date.now();
    const { code, out } = run(root, '--links');
    assert.equal(code, 0, out);
    assert.ok(Date.now() - start < 1000, `demorou ${Date.now() - start} ms`);
  });
});

test('P2-1: arquivo > 1 MB vira pendencia "arquivo muito grande" em --links e --docs', () => {
  const big = `${'x'.repeat(1024 * 1024)}\n`;
  withFixture({ 'grande.md': big }, (root) => {
    const { code, out } = run(root, '--links');
    assert.equal(code, 1);
    assert.match(out, /grande\.md: arquivo muito grande \(>1 MB\)/);
  });
  const { code, out } = runDocs({ 'mercado.md': big });
  assert.equal(code, 1);
  assert.match(out, /mercado\.md: arquivo muito grande \(>1 MB\)/);
});

test('P2-2: rotulo em item de lista: so filhos mais indentados contam; irmao de mesma indentacao nao', async (t) => {
  const decisao = (linhasExpansao) => mercadoOk.replace(/Nicho de entrada:[\s\S]*$/, [
    '- **Nicho de entrada:** Fisioterapia',
    '- **Nichos de expansão:**',
    ...linhasExpansao,
    '- **Aprovado por:** Maria Silva em 2026-11-24',
  ].join('\n'));
  await t.test('filhos indentados contam', () => {
    const { code, out } = runDocs({ 'mercado.md': decisao(['  - Pilates', '  - Psicologia']) });
    assert.equal(code, 0, out);
  });
  await t.test('irmao com a mesma indentacao nao conta como filho', () => {
    const { code, out } = runDocs({ 'mercado.md': decisao(['- Pilates']) });
    assert.equal(code, 1);
    assert.match(out, /Nichos de expansão:" ausente|0 nicho\(s\) de expansao/);
  });
});

test('P2-3: pipe escapado (barra invertida + pipe) nao separa celulas', () => {
  const conteudo = concorrentesOk.replace('| C0 |', String.raw`| C0 \| alias |`);
  const { code, out } = runDocs({ 'concorrentes.md': conteudo });
  assert.equal(code, 0, out);
});

test('P2-3: linha de tabela com numero de colunas diferente do cabecalho -> pendencia', () => {
  const conteudo = concorrentesOk.replace('| C1 | https://c1.example |', '| C1 | https://c1.example | extra |');
  const { code, out } = runDocs({ 'concorrentes.md': conteudo });
  assert.equal(code, 1);
  assert.match(out, /concorrentes\.md: linha 2: 9 coluna\(s\), esperado 8/);
});

// ---------- auditoria: P3 ----------
test('P3: BOM no inicio do arquivo e ignorado', () => {
  const { code, out } = runDocs({ 'mercado.md': `\uFEFF${mercadoOk.replace('# Mercado\n', '')}` });
  assert.equal(code, 0, out);
});

test('P3: bloco de tabela so com separador -> "tabela ausente", sem TypeError', () => {
  const { code, out, err } = runDocs({ 'riscos-prerequisitos.md': '# Riscos\n|---|---|\n' });
  assert.equal(code, 1, err);
  assert.match(out, /riscos-prerequisitos\.md: tabela ausente/);
  assert.doesNotMatch(err, NO_STACK);
});

test('P3: raiz inexistente cita a raiz, nao o valor de --negocio', () => {
  withFixture({ 'README.md': '#' }, (root) => {
    const ausente = join(tmpdir(), 'raiz-inexistente-check-negocio-xyz');
    const r = spawnSync(process.execPath, [script, '--negocio', join(root, NEGOCIO), ausente], { encoding: 'utf8' });
    assert.equal(r.status, 2);
    assert.ok(r.stderr.includes(ausente), r.stderr);
  });
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { contrastRatio, LOGO_VARIANTS } from './check-marca.mjs';

const script = join(dirname(fileURLToPath(import.meta.url)), 'check-marca.mjs');

const MARCA = 'context/marca/';
const VARIANTS = LOGO_VARIANTS;
const goodSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><title>Logo</title></svg>';

function fixture(files) {
  const root = mkdtempSync(join(tmpdir(), 'check-marca-'));
  for (const [rel, content] of Object.entries(files)) {
    const full = join(root, MARCA, rel);
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

// ---------- contraste ----------
const tokens = (cores, pares) => JSON.stringify({ cores, pares });
const bothThemes = (texto, fundo) => [
  { tema: 'claro', texto, fundo },
  { tema: 'escuro', texto, fundo },
];

test('contrastRatio: preto/branco = 21 e simetrico', () => {
  assert.ok(Math.abs(contrastRatio('#000000', '#ffffff') - 21) < 1e-9);
  assert.ok(Math.abs(contrastRatio('#ffffff', '#000000') - 21) < 1e-9);
});

test('UT-1: par #101828 sobre #ffffff >= 4.5 -> exit 0', () => {
  assert.ok(contrastRatio('#101828', '#ffffff') >= 4.5);
  const json = tokens({ texto: '#101828', fundo: '#ffffff' }, bothThemes('texto', 'fundo'));
  withFixture({ 'tokens-marca.json': json }, (root) => {
    assert.equal(run(root, '--contraste').code, 0);
  });
});

test('UT-2: par #9ca3af sobre #ffffff reprovado -> exit 1 e imprime o par', () => {
  const json = tokens({ cinza: '#9ca3af', fundo: '#ffffff' }, bothThemes('cinza', 'fundo'));
  withFixture({ 'tokens-marca.json': json }, (root) => {
    const { code, out } = run(root, '--contraste');
    assert.equal(code, 1);
    assert.match(out, /cinza/);
    assert.match(out, /fundo/);
    assert.match(out, /2\.\d\d/);
  });
});

test('UT-3: token de cor invalido -> exit 1 apontando a chave', () => {
  const json = tokens({ primaria: 'azul', fundo: '#ffffff' }, bothThemes('fundo', 'fundo'));
  withFixture({ 'tokens-marca.json': json }, (root) => {
    const { code, out } = run(root, '--contraste');
    assert.equal(code, 1);
    assert.match(out, /primaria/);
  });
});

test('contraste: par com chave inexistente -> exit 1 apontando a chave', () => {
  const json = tokens({ fundo: '#ffffff' }, [...bothThemes('fantasma', 'fundo')]);
  withFixture({ 'tokens-marca.json': json }, (root) => {
    const { code, out } = run(root, '--contraste');
    assert.equal(code, 1);
    assert.match(out, /fantasma/);
  });
});

test('contraste: exige pares nos dois temas', () => {
  const json = tokens({ texto: '#101828', fundo: '#ffffff' }, [{ tema: 'claro', texto: 'texto', fundo: 'fundo' }]);
  withFixture({ 'tokens-marca.json': json }, (root) => {
    const { code, out } = run(root, '--contraste');
    assert.equal(code, 1);
    assert.match(out, /escuro/);
  });
});

test('contraste: arquivo ausente ou JSON malformado -> exit 1', () => {
  withFixture({ 'outro.md': 'x' }, (root) => {
    assert.equal(run(root, '--contraste').code, 1);
  });
  withFixture({ 'tokens-marca.json': '{ nao e json' }, (root) => {
    assert.equal(run(root, '--contraste').code, 1);
  });
});

// ---------- assets ----------
function logoFiles({ skip = [], svg = goodSvg } = {}) {
  const files = {};
  for (const v of VARIANTS) {
    files[`assets/logo/${v}.svg`] = svg;
    files[`assets/logo/${v}.png`] = 'png';
  }
  files['assets/ORIGEM.md'] = VARIANTS.map((v) => `- ${v}.svg e ${v}.png: autoria X, ferramenta Y, licenca Z`).join('\n');
  for (const s of skip) delete files[`assets/logo/${s}`];
  return files;
}

test('UT-4: 18 variantes completas + ORIGEM.md -> exit 0', () => {
  withFixture(logoFiles(), (root) => {
    assert.equal(run(root, '--assets').code, 0);
  });
});

test('UT-5: variante faltando -> exit 1 listando o arquivo (todas as faltas de uma vez)', () => {
  withFixture(logoFiles({ skip: ['logo-icone-mono.png', 'logo-vertical-claro.svg'] }), (root) => {
    const { code, out } = run(root, '--assets');
    assert.equal(code, 1);
    assert.match(out, /logo-icone-mono\.png/);
    assert.match(out, /logo-vertical-claro\.svg/);
  });
});

test('UT-6: SVG sem <title>, sem viewBox ou > 20 KB -> exit 1 apontando o arquivo', async (t) => {
  const casos = {
    'sem-title': '<svg viewBox="0 0 1 1"></svg>',
    'sem-viewbox': '<svg><title>x</title></svg>',
    'grande': `<svg viewBox="0 0 1 1"><title>x</title><!--${'a'.repeat(21 * 1024)}--></svg>`,
  };
  for (const [nome, svg] of Object.entries(casos)) {
    await t.test(nome, () => {
      const files = logoFiles();
      files['assets/logo/logo-horizontal-claro.svg'] = svg;
      withFixture(files, (root) => {
        const { code, out } = run(root, '--assets');
        assert.equal(code, 1);
        assert.match(out, /logo-horizontal-claro\.svg/);
      });
    });
  }
});

test('assets: ORIGEM.md ausente ou sem entrada de um ativo -> exit 1', () => {
  const semOrigem = logoFiles();
  delete semOrigem['assets/ORIGEM.md'];
  withFixture(semOrigem, (root) => {
    assert.equal(run(root, '--assets').code, 1);
  });
  const incompleta = logoFiles();
  incompleta['assets/ORIGEM.md'] = incompleta['assets/ORIGEM.md'].replace(/logo-icone-mono\.png/, 'outro');
  withFixture(incompleta, (root) => {
    const { code, out } = run(root, '--assets');
    assert.equal(code, 1);
    assert.match(out, /logo-icone-mono\.png/);
  });
});

// ---------- docs ----------
const concorrentesOk = [
  '# Concorrentes',
  '| Nome | URL | Data da consulta | Posicionamento | Tom de voz | Cores | Fonte |',
  '|---|---|---|---|---|---|---|',
  ...Array.from({ length: 8 }, (_, i) => `| C${i} | https://c${i}.example | 2026-11-24 | p | t | azul | Inter |`),
  '',
  '## Lacunas de marca',
  '- a',
  '- b',
  '- c',
].join('\n');

const finalista = (nome) => [
  `### ${nome}`,
  '- Domínio .com.br: livre em 2026-11-24',
  '- Domínio .com: ocupado em 2026-11-24',
  '- Instagram: livre em 2026-11-24',
  '- LinkedIn: livre em 2026-11-24',
  '- INPI NCL 9: sem colidencia em 2026-11-24 (protocolo 123)',
  '- INPI NCL 42: sem colidencia em 2026-11-24 (https://inpi.example/42)',
  '- INPI NCL 44: sem colidencia em 2026-11-24 (protocolo 125)',
].join('\n');

const namingOk = [
  '# Naming',
  '## Candidatos',
  ...Array.from({ length: 10 }, (_, i) => `- Nome${i}`),
  '## Finalistas',
  finalista('Alfa'),
  finalista('Beta'),
  finalista('Gama'),
].join('\n');

const decisaoOk = [
  '# Decisao',
  '## Nome final', 'Alfa',
  '## Justificativa', 'porque sim',
  '## Riscos', 'poucos',
  '',
  'Aprovado por: Maria Silva em 2026-11-24',
].join('\n');

const tom = (nome) => `### ${nome}\n- Diga: "ola"\n- Não diga: "oi gente"`;
const identidadeOk = [
  '# Identidade',
  '## Missão', 'm',
  '## Visão', 'v',
  '## Valores', '- a', '- b', '- c',
  '## História', 'h',
  '## Proposta de valor', 'p',
  '## Slogan', '"Cuidar de quem cuida"',
  '## Tom de voz', tom('Acolhedor'), tom('Claro'), tom('Preciso'),
].join('\n');

const docsOk = () => ({
  'concorrentes-marca.md': concorrentesOk,
  'naming.md': namingOk,
  'decisao-nome.md': decisaoOk,
  'identidade.md': identidadeOk,
});

test('docs: fixtures completas -> exit 0', () => {
  withFixture(docsOk(), (root) => {
    const { code, out } = run(root, '--docs');
    assert.equal(code, 0, out);
  });
});

test('UT-8: identidade.md sem "Missão" -> exit 1 apontando a seção', () => {
  const files = docsOk();
  files['identidade.md'] = identidadeOk.replace('## Missão\nm\n', '');
  withFixture(files, (root) => {
    const { code, out } = run(root, '--docs');
    assert.equal(code, 1);
    assert.match(out, /identidade\.md/);
    assert.match(out, /Miss/);
  });
});

test('UT-8: identidade com slogan longo, valores fora de 3-6 ou tom sem exemplos -> exit 1', async (t) => {
  const variantes = {
    slogan: identidadeOk.replace('"Cuidar de quem cuida"', 'um dois tres quatro cinco seis sete oito nove'),
    valores: identidadeOk.replace('- c\n', ''),
    tom: identidadeOk.replace('- Não diga: "oi gente"', ''),
  };
  for (const [nome, conteudo] of Object.entries(variantes)) {
    await t.test(nome, () => {
      const files = docsOk();
      files['identidade.md'] = conteudo;
      withFixture(files, (root) => {
        assert.equal(run(root, '--docs').code, 1);
      });
    });
  }
});

test('UT-8: concorrentes com <8 linhas ou sem lacunas, naming com <3 finalistas ou sem data -> exit 1', async (t) => {
  const variantes = {
    'concorrentes-marca.md': [
      concorrentesOk.replace(/\| C7 .*\n/, ''),
      concorrentesOk.replace('- c', ''),
      concorrentesOk.replace('| Tom de voz ', '| Outro '),
    ],
    'naming.md': [
      namingOk.replace(finalista('Gama'), ''),
      namingOk.replace('- Nome9', ''),
      namingOk.replace('- LinkedIn: livre em 2026-11-24', '- LinkedIn: livre'),
    ],
  };
  for (const [arquivo, conteudos] of Object.entries(variantes)) {
    for (const [index, conteudo] of conteudos.entries()) {
      await t.test(`${arquivo} variante ${index + 1}`, () => {
        const files = docsOk();
        files[arquivo] = conteudo;
        withFixture(files, (root) => {
          const { code, out } = run(root, '--docs');
          assert.equal(code, 1);
          assert.match(out, new RegExp(arquivo.replace('.', '\\.')));
        });
      });
    }
  }
});

test('UT-9: decisao-nome.md sem linha "Aprovado por:" -> exit 1', () => {
  const files = docsOk();
  files['decisao-nome.md'] = decisaoOk.replace(/Aprovado por:.*/, '');
  withFixture(files, (root) => {
    const { code, out } = run(root, '--docs');
    assert.equal(code, 1);
    assert.match(out, /Aprovado por/);
  });
});

test('UT-9: aprovacao com data invalida -> exit 1', () => {
  const files = docsOk();
  files['decisao-nome.md'] = decisaoOk.replace('2026-11-24', '2026-13-45');
  withFixture(files, (root) => {
    assert.equal(run(root, '--docs').code, 1);
  });
});

test('docs: arquivo ausente -> exit 1 apontando o arquivo', () => {
  const files = docsOk();
  delete files['naming.md'];
  withFixture(files, (root) => {
    const { code, out } = run(root, '--docs');
    assert.equal(code, 1);
    assert.match(out, /naming\.md/);
  });
});

// ---------- links ----------
test('links ok (relativos, imagens, ancora, http, mailto) -> exit 0', () => {
  const readme = [
    '[a](visual.md) [b](visual.md#secao) ![l](assets/logo.svg "t")',
    '[c](#topo) [d](https://x.example) [e](mailto:a@b.c)',
    '```',
    '[ignorado](nao-existe.md)',
    '```',
  ].join('\n');
  withFixture({ 'README.md': readme, 'visual.md': '# v', 'assets/logo.svg': goodSvg }, (root) => {
    const { code, out } = run(root, '--links');
    assert.equal(code, 0, out);
  });
});

test('UT-7: link quebrado -> exit 1 apontando link e arquivo de origem', () => {
  withFixture({ 'README.md': '[x](nao-existe.md)', 'sub/outro.md': '![i](../faltando.png)' }, (root) => {
    const { code, out } = run(root, '--links');
    assert.equal(code, 1);
    assert.match(out, /README\.md:1/);
    assert.match(out, /nao-existe\.md/);
    assert.match(out, /outro\.md:1/);
    assert.match(out, /faltando\.png/);
  });
});

// ---------- auditoria P2 ----------
const runLinks = (files) => withFixture(files, (root) => run(root, '--links'));
const NO_STACK = /\n\s+at /;

test('links: alvo fora da pasta da marca -> pendencia "fora da pasta da marca"', () => {
  const { code, out } = runLinks({ 'README.md': '[x](../../x)' });
  assert.equal(code, 1);
  assert.match(out, /fora da pasta da marca/);
});

test('links: caminho absoluto (/etc/hosts, C:\\x) -> pendencia "absoluto"', async (t) => {
  for (const target of ['/etc/hosts', 'C:\\x']) {
    await t.test(target, () => {
      const { code, out } = runLinks({ 'README.md': `[x](${target})` });
      assert.equal(code, 1);
      assert.match(out, /absoluto/);
    });
  }
});

test('links: esquemas (tel:, ftp:, data:, file:) e //host sao ignorados', () => {
  const readme = '[a](tel:123) [b](ftp://h/x) [c](data:text/plain,x) [d](file:///x) [e](//host/x)';
  const { code, out } = runLinks({ 'README.md': readme });
  assert.equal(code, 0, out);
});

test('I/O: naming.md como diretorio -> pendencia com codigo, sem stack trace', () => {
  const files = docsOk();
  delete files['naming.md'];
  files['naming.md/x'] = 'x';
  withFixture(files, (root) => {
    const { code, out, err } = run(root, '--docs');
    assert.equal(code, 1);
    assert.match(out, /naming\.md.*EISDIR/);
    assert.doesNotMatch(err, NO_STACK);
  });
});

test('I/O: SVG ilegivel (diretorio) -> pendencia com codigo apontando o arquivo', () => {
  const files = logoFiles();
  delete files['assets/logo/logo-horizontal-claro.svg'];
  files['assets/logo/logo-horizontal-claro.svg/x'] = 'x';
  withFixture(files, (root) => {
    const { code, out, err } = run(root, '--assets');
    assert.equal(code, 1);
    assert.match(out, /logo-horizontal-claro\.svg.*EISDIR/);
    assert.doesNotMatch(err, NO_STACK);
  });
});

test('I/O: tokens-marca.json como diretorio -> pendencia com codigo', () => {
  withFixture({ 'tokens-marca.json/x': 'x' }, (root) => {
    const { code, out, err } = run(root, '--contraste');
    assert.equal(code, 1);
    assert.match(out, /tokens-marca\.json.*EISDIR/);
    assert.doesNotMatch(err, NO_STACK);
  });
});

test('I/O: context/marca como arquivo -> exit 2 com mensagem clara, sem stack trace', () => {
  const root = mkdtempSync(join(tmpdir(), 'check-marca-'));
  try {
    mkdirSync(join(root, 'context'), { recursive: true });
    writeFileSync(join(root, 'context', 'marca'), 'arquivo');
    const { code, err } = run(root, '--links');
    assert.equal(code, 2);
    assert.match(err, /check-marca:/);
    assert.doesNotMatch(err, NO_STACK);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('contraste: chave herdada do prototipo ("constructor") reprova como inexistente', () => {
  const json = tokens({ fundo: '#ffffff' }, bothThemes('constructor', 'fundo'));
  withFixture({ 'tokens-marca.json': json }, (root) => {
    const { code, out } = run(root, '--contraste');
    assert.equal(code, 1);
    assert.match(out, /inexistente.*constructor/);
  });
});

test('contraste: fronteira 4.5 (#767676 passa, #777777 falha sobre branco)', () => {
  const runWith = (cor) => withFixture(
    { 'tokens-marca.json': tokens({ cor, fundo: '#ffffff' }, bothThemes('cor', 'fundo')) },
    (root) => run(root, '--contraste'),
  );
  assert.equal(runWith('#767676').code, 0);
  assert.equal(runWith('#777777').code, 1);
});

test('contraste: mensagem trunca a razao, nunca "4.50:1 < 4.5:1"', () => {
  assert.ok(contrastRatio('#77767c', '#ffffff') < 4.5);
  const json = tokens({ cor: '#77767c', fundo: '#ffffff' }, bothThemes('cor', 'fundo'));
  withFixture({ 'tokens-marca.json': json }, (root) => {
    const { code, out } = run(root, '--contraste');
    assert.equal(code, 1);
    assert.match(out, /4\.49:1 < 4\.5:1/);
    assert.doesNotMatch(out, /4\.50:1/);
  });
});

test('naming: data de finalista invalida ou com digitos extras -> exit 1', async (t) => {
  for (const [nome, data] of [['mes/dia impossiveis', '2026-13-45'], ['digitos extras', '12026-11-245']]) {
    await t.test(nome, () => {
      const files = docsOk();
      files['naming.md'] = namingOk.replace('- LinkedIn: livre em 2026-11-24', `- LinkedIn: livre em ${data}`);
      withFixture(files, (root) => {
        const { code, out } = run(root, '--docs');
        assert.equal(code, 1);
        assert.match(out, /linkedin/);
      });
    });
  }
});

test('naming: INPI sem link http(s) nem "protocolo" -> exit 1 "sem link ou protocolo"', () => {
  const files = docsOk();
  files['naming.md'] = namingOk.replace(
    '- INPI NCL 9: sem colidencia em 2026-11-24 (protocolo 123)',
    '- INPI NCL 9: sem colidencia em 2026-11-24',
  );
  withFixture(files, (root) => {
    const { code, out } = run(root, '--docs');
    assert.equal(code, 1);
    assert.match(out, /campo "inpi ncl 9" sem link ou protocolo/);
  });
});

test('naming: rotulos ambiguos - so ".com.br" nao satisfaz ".com"; so "NCL 4" nao satisfaz "NCL 42"', async (t) => {
  await t.test('.com ausente', () => {
    const files = docsOk();
    files['naming.md'] = namingOk.replace('- Domínio .com: ocupado em 2026-11-24\n', '');
    withFixture(files, (root) => {
      const { code, out } = run(root, '--docs');
      assert.equal(code, 1);
      assert.match(out, /campo "dominio \.com" ausente/);
      assert.doesNotMatch(out, /campo "dominio \.com\.br"/);
    });
  });
  await t.test('NCL 42 ausente', () => {
    const files = docsOk();
    files['naming.md'] = namingOk.replace('- INPI NCL 42:', '- INPI NCL 4:');
    withFixture(files, (root) => {
      const { code, out } = run(root, '--docs');
      assert.equal(code, 1);
      assert.match(out, /campo "inpi ncl 42" ausente/);
    });
  });
});

test('contraste: par nulo ou incompleto -> "pares[i] invalido", nunca "JSON malformado"', async (t) => {
  const base = { texto: '#101828', fundo: '#ffffff' };
  const casos = {
    'null': [null, ...bothThemes('texto', 'fundo')],
    'string': ['x', ...bothThemes('texto', 'fundo')],
    'sem fundo': [{ tema: 'claro', texto: 'texto' }, ...bothThemes('texto', 'fundo')],
  };
  for (const [nome, pares] of Object.entries(casos)) {
    await t.test(nome, () => {
      withFixture({ 'tokens-marca.json': tokens(base, pares) }, (root) => {
        const { code, out } = run(root, '--contraste');
        assert.equal(code, 1);
        assert.match(out, /pares\[0\] invalido/);
        assert.doesNotMatch(out, /malformado/);
      });
    });
  }
});

test('contraste: "cores" como array -> schema invalido', () => {
  withFixture({ 'tokens-marca.json': tokens(['#ffffff'], bothThemes('0', '0')) }, (root) => {
    const { code, out } = run(root, '--contraste');
    assert.equal(code, 1);
    assert.match(out, /schema invalido/);
  });
});

// ---------- CLI ----------
test('sem flag roda os quatro modos e consolida exit code', () => {
  withFixture({ 'README.md': '# vazio' }, (root) => {
    const { code, out } = run(root);
    assert.equal(code, 1);
    assert.match(out, /tokens-marca\.json/);
    assert.match(out, /logo-horizontal-claro\.svg/);
    assert.match(out, /naming\.md/);
  });
});

test('raiz inexistente, flag desconhecida ou excesso de posicionais -> exit 2', () => {
  assert.equal(run(join(tmpdir(), 'nao-existe-check-marca-xyz')).code, 2);
  withFixture({ 'README.md': '#' }, (root) => {
    assert.equal(run(root, '--bogus').code, 2);
    assert.equal(spawnSync(process.execPath, [script, root, root], { encoding: 'utf8' }).status, 2);
  });
});

// ---------- --marca <dir> ----------
function withMarcaOutsideRoot(files, fn) {
  const base = mkdtempSync(join(tmpdir(), 'check-marca-ext-'));
  const root = join(base, 'registry');
  const marca = join(base, 'Marca');
  mkdirSync(root, { recursive: true });
  for (const [rel, content] of Object.entries(files)) {
    const full = join(marca, rel);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, content);
  }
  try { return fn(root, marca); } finally { rmSync(base, { recursive: true, force: true }); }
}

test('--marca: pasta fora da raiz (absoluta) com docs validos -> exit 0', () => {
  withMarcaOutsideRoot(docsOk(), (root, marca) => {
    const { code, out } = run(root, '--docs', '--marca', marca);
    assert.equal(code, 0, out);
  });
});

test('--marca: caminho relativo ao cwd e aceito', () => {
  withMarcaOutsideRoot(docsOk(), (root, marca) => {
    const r = spawnSync(process.execPath, [script, root, '--docs', '--marca', '../Marca'],
      { encoding: 'utf8', cwd: root });
    assert.equal(r.status, 0, r.stdout + r.stderr);
  });
});

test('--marca: link ../x fora da pasta marca -> pendencia "fora da pasta da marca"', () => {
  withMarcaOutsideRoot({ 'README.md': '[x](../x)' }, (root, marca) => {
    const { code, out } = run(root, '--links', '--marca', marca);
    assert.equal(code, 1);
    assert.match(out, /fora da pasta da marca/);
  });
});

test('--marca: sem valor -> exit 2 com mensagem clara', () => {
  for (const argv of [['--marca'], ['--marca', '--docs']]) {
    const { code, err } = run('.', ...argv);
    assert.equal(code, 2);
    assert.match(err, /check-marca:.*--marca/);
  }
});

test('--marca: diretorio inexistente -> exit 2 com mensagem clara', () => {
  const { code, err } = run('.', '--marca', join(tmpdir(), 'nao-existe-marca-xyz'));
  assert.equal(code, 2);
  assert.match(err, /check-marca:.*nao encontrad/);
});

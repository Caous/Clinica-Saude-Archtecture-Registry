import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Partes montadas para o arquivo nao conter a marca literal.
const b = 'bar' + 'ros';
const B = 'Bar' + 'ros';

const script = join(dirname(fileURLToPath(import.meta.url)), 'check-brand.mjs');

function fixture(files) {
  const root = mkdtempSync(join(tmpdir(), 'check-brand-'));
  for (const [rel, content] of Object.entries(files)) {
    const full = join(root, rel);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, content);
  }
  return root;
}

function run(root, ...extra) {
  const r = spawnSync(process.execPath, [script, root, ...extra], { encoding: 'utf8' });
  return { code: r.status, out: r.stdout };
}

function withFixture(files, fn) {
  const root = fixture(files);
  try { return fn(root); } finally { rmSync(root, { recursive: true, force: true }); }
}

test(`UT-6: conteudo com a marca antiga -> exit 1 e lista arquivo:linha`, () => {
  withFixture({ 'src/a.ts': `ok\nconst n = "Instituto${B}";\n` }, (root) => {
    const { code, out } = run(root);
    assert.equal(code, 1);
    assert.match(out, /a\.ts:2/);
  });
});

test('UT-8: fixture limpa -> exit 0', () => {
  withFixture({ 'src/a.ts': 'const n = "SistemaClinica";\n' }, (root) => {
    assert.equal(run(root).code, 0);
  });
});

test('detecta todas as variantes, case-insensitive', () => {
  const variantes = [`instituto-${b}`, `instituto_${b}`, `instituto${b}`, `Instituto ${B}`, `INSTITUTO_${B.toUpperCase()}`, B.toUpperCase(), `instituto${b}r`];
  for (const v of variantes) {
    withFixture({ 'x.txt': `a ${v} b\n` }, (root) => {
      assert.equal(run(root).code, 1, v);
    });
  }
});

test('detecta nome de arquivo com a marca', () => {
  withFixture({ [`instituto-${b}-logo.svg`]: 'x' }, (root) => {
    const { code, out } = run(root);
    assert.equal(code, 1);
    assert.match(out, new RegExp(`instituto-${b}-logo\\.svg`));
  });
});

test('detecta nome de pasta com a marca', () => {
  withFixture({ [`Instituto${B}/clean.txt`]: 'limpo' }, (root) => {
    const { code, out } = run(root);
    assert.equal(code, 1);
    assert.match(out, new RegExp(`Instituto${B}`));
  });
});

test('ignora diretorios padrao e lockfiles', () => {
  withFixture({
    '.git/config': b,
    'node_modules/p/i.js': b,
    'bin/a.txt': b,
    'obj/a.txt': b,
    'dist/a.txt': b,
    '.next/a.txt': b,
    'package-lock.json': b,
    'yarn.lock': b,
    'ok.txt': 'limpo',
  }, (root) => {
    assert.equal(run(root).code, 0);
  });
});

test('ignora binario por extensao e por byte NUL', () => {
  withFixture({ 'logo.png': b, 'data.dat': `${b}\0\x01` }, (root) => {
    assert.equal(run(root).code, 0);
  });
});

test('--exclude ignora diretorios adicionais', () => {
  withFixture({ 'board/a.md': b, 'context/b.md': b, 'src/c.ts': 'limpo' }, (root) => {
    assert.equal(run(root).code, 1);
    assert.equal(run(root, '--exclude', 'board,context').code, 0);
  });
});

test('raiz inexistente -> exit 2 com mensagem', () => {
  const r = run(join(tmpdir(), 'nao-existe-check-brand-xyz'));
  assert.equal(r.code, 2);
});

test('--exclude aceita arquivo por nome', () => {
  withFixture({ 'tokens.json': b, 'src/c.ts': 'limpo' }, (root) => {
    assert.equal(run(root).code, 1);
    assert.equal(run(root, '--exclude', 'tokens.json').code, 0);
  });
});

test('--exclude aceita arquivo por caminho relativo e nao afeta homonimo em outro caminho', () => {
  withFixture({ 'cfg/tokens.json': b, 'other/tokens.json': b }, (root) => {
    const { code, out } = run(root, '--exclude', 'cfg/tokens.json');
    assert.equal(code, 1);
    assert.match(out, /other\/tokens\.json/);
    assert.doesNotMatch(out, /cfg\/tokens\.json/);
  });
});

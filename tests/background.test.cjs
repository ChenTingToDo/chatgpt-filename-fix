const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Test the actual installed service-worker file, not a reimplementation.
const file = path.join(__dirname, '..', 'Edge_Extension', 'background.js');
let handler;
vm.runInNewContext(fs.readFileSync(file, 'utf8'), {
  chrome: { downloads: { onDeterminingFilename: { addListener(callback) { handler = callback; } } } },
});
assert.equal(typeof handler, 'function');

function run(filename) {
  let called = 0;
  let supplied;
  handler({ filename }, (suggestion) => { called++; supplied = suggestion; });
  assert.equal(called, 1, 'suggest must be called exactly once');
  // VM contexts use different Object prototypes; normalize across realms.
  return supplied === undefined ? undefined : JSON.parse(JSON.stringify(supplied));
}

const unchanged = [
  'normal-file.md',
  'picture.png',
  '%E4%ZZ.md',               // malformed hex in URI text
  '%E4%B8.md',               // incomplete UTF-8
  '%2Fhello.md',             // decoded slash
  '%5Chello.md',             // decoded backslash
  '%3Ahello.md',             // decoded colon
  '%E4%B8%AD%00.md',         // decoded NUL
  '%43%4F%4E.md',            // ASCII only
  'file%E4%B8%AD.tmp',      // intentionally ignored transient filename
];
for (const input of unchanged) {
  test(`leave unchanged: ${input}`, () => assert.equal(run(input), undefined));
}

test('decode Chinese filename', () => {
  assert.deepEqual(run('%E4%B8%AD%E6%96%87.md'), {
    filename: '中文.md', conflictAction: 'uniquify'
  });
});

test('preserve surrounding directory', () => {
  assert.deepEqual(run('notes/%E4%B8%AD%E6%96%87.pdf'), {
    filename: 'notes/中文.pdf', conflictAction: 'uniquify'
  });
});

test('decode a mixed Latin and Chinese basename', () => {
  assert.deepEqual(run('summary_%E4%B8%AD%E6%96%87_2026.md'), {
    filename: 'summary_中文_2026.md', conflictAction: 'uniquify'
  });
});

test('reject illegal characters mixed with decoded Chinese', () => {
  assert.equal(run('%E4%B8%AD%3A.md'), undefined);
  assert.equal(run('%E4%B8%AD%2Fhello.md'), undefined);
  assert.equal(run('%E4%B8%AD%5Chello.md'), undefined);
});

test('reject Windows device names after decoding', () => {
  assert.equal(run('%43%4F%4E%E4%B8%AD.md')?.filename, 'CON中.md');
  // Once the basename starts with the exact reserved token followed by '.'
  // the extension is designed to reject that filename.
  assert.equal(run('%43%4F%4E.%E4%B8%AD.md'), undefined);
});

test('reject trailing space and excessively long decoded filenames', () => {
  assert.equal(run('%E4%B8%AD%20'), undefined);
  assert.equal(run('%E4%B8%AD' + 'x'.repeat(241) + '.md'), undefined);
});

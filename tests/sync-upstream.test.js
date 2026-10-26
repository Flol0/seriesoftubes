const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

test('upstream sync preserves deleted workflows and aborts game conflicts', () => {
  const r = spawnSync('python3', [path.join(__dirname, 'sync-upstream.test.py')], { encoding: 'utf8', timeout: 30000 });
  assert.equal(r.status, 0, r.error?.message || r.stderr || r.stdout);
});

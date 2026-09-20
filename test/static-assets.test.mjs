import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('page uses relative local assets so it works from a subpath or file preview', () => {
  const page = readFileSync('index.html', 'utf8');
  assert.match(page, /href="\.\/src\/style\.css"/);
  assert.match(page, /src="\.\/src\/main\.js"/);
  assert.doesNotMatch(page, /["']\/src\//);
});

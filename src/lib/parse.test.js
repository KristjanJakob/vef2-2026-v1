import assert from 'node:assert';
import { describe, it } from 'node:test';
import { parseLine } from './parse.js';

describe('parseLine', () => {
  it('parses a valid csv line into an object', () => {
    const line = '4,Íslendingasögur,2,3,Hver er þetta?,Svar';
    const q = parseLine(line);

    assert.ok(q);
    assert.strictEqual(q.subCategory, 'Íslendingasögur');
    assert.strictEqual(q.question, 'Hver er þetta?');
    assert.strictEqual(q.answer, 'Svar');
  });

  it('returns null for invalid line', () => {
    const q = parseLine('bara,of,stutt');
    assert.strictEqual(q, null);
  });
});

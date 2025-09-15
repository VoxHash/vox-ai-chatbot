import assert from 'node:assert/strict';
import test from 'node:test';
import jwt from 'jsonwebtoken';

test('JWT signing/verification', () => {
  const token = jwt.sign({ sub: 1, role: 'user' }, 'secret', { expiresIn: '1h' });
  const decoded = jwt.verify(token, 'secret');
  assert.equal(decoded.sub, 1);
  assert.equal(decoded.role, 'user');
});

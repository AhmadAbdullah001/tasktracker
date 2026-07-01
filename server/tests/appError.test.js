const test = require('node:test');
const assert = require('node:assert/strict');
const AppError = require('../Utils/AppError');

test('AppError captures message, statusCode and isOperational flag', () => {
  const err = new AppError('Bad request', 400);

  assert.equal(err.message, 'Bad request');
  assert.equal(err.statusCode, 400);
  assert.equal(err.isOperational, true);
  assert.equal(err.status, 'fail');
});

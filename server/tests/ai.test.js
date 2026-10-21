const test = require('node:test');
const assert = require('node:assert/strict');
const { sigmoid, trainLogistic, predictLogistic, trainRidge, predictRidge, auc } = require('../src/services/ai/logistic');
const { buildFeatures, toVector, FEATURE_NAMES } = require('../src/services/ai/features');

test('sigmoid remains finite for large positive and negative inputs', () => {
  assert.equal(sigmoid(0), 0.5);
  assert.ok(sigmoid(1000) > 0.999);
  assert.ok(sigmoid(-1000) < 0.001);
});

test('logistic regression learns a simple separable dataset', () => {
  const X = [[-2], [-1], [1], [2]];
  const model = trainLogistic(X, [0, 0, 1, 1], { epochs: 2000, lr: 0.1 });
  assert.ok(predictLogistic(model, [-2]) < 0.2);
  assert.ok(predictLogistic(model, [2]) > 0.8);
});

test('ridge regression fits a simple linear relationship', () => {
  const model = trainRidge([[0], [1], [2]], [1, 3, 5], { epochs: 5000, lr: 0.05, l2: 0 });
  assert.ok(Math.abs(predictRidge(model, [3]) - 7) < 0.1);
});

test('AUC handles perfect ranking, ties, and a missing class', () => {
  assert.equal(auc([0.1, 0.8, 0.2, 0.9], [0, 1, 0, 1]), 1);
  assert.equal(auc([0.5, 0.5], [0, 1]), 0.5);
  assert.equal(auc([0.1, 0.2], [0, 0]), 0.5);
});

test('feature building emits finite named features and a complete vector', () => {
  const features = buildFeatures({
    reason_category: 'MEDICAL', destination_type: 'OTHER', distance_km: 25,
    depart_at: '2026-10-21T10:00:00+05:30', expected_return_at: '2026-10-21T18:00:00+05:30', past_delay_rate: 0.25,
  });
  const vector = toVector(features);
  assert.equal(vector.length, FEATURE_NAMES.length);
  assert.equal(features.cat_medical, 1);
  assert.equal(features.dest_home, 0);
  assert.ok(vector.every(Number.isFinite));
});

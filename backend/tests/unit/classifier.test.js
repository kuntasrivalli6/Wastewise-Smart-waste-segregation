import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeText, classificationService } from '../../src/services/classificationService.js';

test('Text Normalization: cleans punctuation, lowers case, and collapses spaces', () => {
  assert.equal(normalizeText('  Plastic   Bottle!! '), 'plastic bottle');
  assert.equal(normalizeText('Chai-Patti (Used)'), 'chai patti used');
  assert.equal(normalizeText('BATTERIES!!!'), 'batteries');
});

test('Classification: accurately matches exact item names', async () => {
  const result = await classificationService.classify('Vegetable & Fruit Peels');
  assert.equal(result.recognized, true);
  assert.equal(result.category.slug, 'wet-biodegradable');
  assert.equal(result.confidence, 'high');
});

test('Classification: accurately matches Indian household aliases', async () => {
  // Test chai patti -> Wet
  const teaResult = await classificationService.classify('chai patti');
  assert.equal(teaResult.recognized, true);
  assert.equal(teaResult.category.slug, 'wet-biodegradable');

  // Test doodh packet -> Dry recyclable
  const milkResult = await classificationService.classify('doodh packet');
  assert.equal(milkResult.recognized, true);
  assert.equal(milkResult.category.slug, 'dry-recyclable');

  // Test whisper pad -> Sanitary
  const padResult = await classificationService.classify('whisper pad');
  assert.equal(padResult.recognized, true);
  assert.equal(padResult.category.slug, 'sanitary-waste');

  // Test tubelight -> Hazardous
  const cflResult = await classificationService.classify('tubelight');
  assert.equal(cflResult.recognized, true);
  assert.equal(cflResult.category.slug, 'domestic-hazardous');
});

test('Classification: gracefully returns unrecognized for unknown items', async () => {
  const result = await classificationService.classify('quantum space hyperdrive engine');
  assert.equal(result.recognized, false);
  assert.ok(result.message.includes('quantum space hyperdrive engine'));
  assert.ok(result.suggestedCategories.length > 0);
});


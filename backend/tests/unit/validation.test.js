import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyInputSchema, categorySchema, moduleSchema } from '../../src/validators/schemas.js';

test('Validation: classifyInputSchema accepts valid input and rejects empty text', () => {
  const valid = classifyInputSchema.safeParse({ text: 'Cardboard box', saveRecord: true });
  assert.equal(valid.success, true);

  const empty = classifyInputSchema.safeParse({ text: '   ' });
  assert.equal(empty.success, false);
});

test('Validation: categorySchema validates slugs and hex colors', () => {
  const valid = categorySchema.safeParse({
    name: 'Wet Waste',
    slug: 'wet-waste',
    description: 'Decomposable organic matter',
    disposal_instructions: 'Place inside the green bin',
    color_hex: '#10B981',
  });
  assert.equal(valid.success, true);

  // Invalid slug with uppercase / spaces
  const badSlug = categorySchema.safeParse({
    name: 'Wet Waste',
    slug: 'Wet Waste!',
    description: 'Decomposable organic matter',
    disposal_instructions: 'Place inside the green bin',
  });
  assert.equal(badSlug.success, false);

  // Invalid hex color
  const badColor = categorySchema.safeParse({
    name: 'Wet Waste',
    slug: 'wet-waste',
    description: 'Decomposable organic matter',
    disposal_instructions: 'Place inside the green bin',
    color_hex: 'not-a-color',
  });
  assert.equal(badColor.success, false);
});


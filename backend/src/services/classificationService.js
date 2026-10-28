import { supabase, isConfigured } from '../config/supabase.js';
import { rewardService } from './rewardService.js';
import { logger } from '../utils/logger.js';

// Built-in fallback catalog ensuring reliable operation even during offline / setup testing
export const DEFAULT_CATEGORIES = [
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    name: 'Wet / Biodegradable Waste',
    slug: 'wet-biodegradable',
    description: 'Organic kitchen and garden materials that decompose naturally.',
    disposal_instructions: 'Deposit in the Green Bin unbagged or wrapped in paper. Ideal for home composting.',
    safety_notes: 'Keep free from plastic bags or synthetic wrappers.',
    color_hex: '#10B981',
    icon_name: 'leaf'
  },
  {
    id: 'c2222222-2222-2222-2222-222222222222',
    name: 'Dry / Recyclable Waste',
    slug: 'dry-recyclable',
    description: 'Clean paper, cardboard, plastics, metals, and container glass.',
    disposal_instructions: 'Rinse, dry, and flatten before placing in the Blue Bin.',
    safety_notes: 'Must be clean and dry. Avoid food or liquid contamination.',
    color_hex: '#2563EB',
    icon_name: 'recycle'
  },
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    name: 'Domestic Hazardous Waste',
    slug: 'domestic-hazardous',
    description: 'Toxic, chemical, flammable, or medical household items.',
    disposal_instructions: 'Wrap securely, label, and drop at authorized hazardous collection points or Red bin.',
    safety_notes: 'Never pour down drains. Do not crush tubes or puncture aerosol cans.',
    color_hex: '#DC2626',
    icon_name: 'alert-triangle'
  },
  {
    id: 'c4444444-4444-4444-4444-444444444444',
    name: 'Electronic Waste (E-Waste)',
    slug: 'electronic-waste',
    description: 'Discarded electronics, chargers, batteries, and appliances.',
    disposal_instructions: 'Store indoors safely. Deposit at registered E-waste kiosks or collection drives.',
    safety_notes: 'Do not dismantle or burn wires. Keep away from household bins.',
    color_hex: '#7C3AED',
    icon_name: 'cpu'
  },
  {
    id: 'c5555555-5555-5555-5555-555555555555',
    name: 'Sanitary Waste',
    slug: 'sanitary-waste',
    description: 'Menstrual products, diapers, bandages, and biological waste.',
    disposal_instructions: 'Wrap securely in newspaper, mark with a red cross or dot, and hand over separately.',
    safety_notes: 'Never flush down toilets. Protect sanitary workers by wrapping tightly.',
    color_hex: '#D97706',
    icon_name: 'shield-alert'
  },
  {
    id: 'c6666666-6666-6666-6666-666666666666',
    name: 'Residual / Non-Recyclable Waste',
    slug: 'residual-waste',
    description: 'Greasy packaging, multi-layer wrappers, broken ceramics.',
    disposal_instructions: 'Discard into the Black / Grey general waste bin for controlled municipal disposal.',
    safety_notes: 'Minimize this stream by strictly separating organic and recyclable items.',
    color_hex: '#4B5563',
    icon_name: 'trash-2'
  }
];

export const DEFAULT_ITEMS = [
  {
    id: 'item-1',
    name: 'Vegetable & Fruit Peels',
    normalized_name: 'vegetable fruit peels',
    aliases: ['onion peels', 'potato peels', 'banana peel', 'banana peels', 'apple skin', 'sabzi chilka', 'fruit scraps', 'citrus rinds'],
    category_id: 'c1111111-1111-1111-1111-111111111111',
    description: 'Raw kitchen scraps from vegetables and fruits.',
    disposal_instructions: 'Place in the green compost bin or home composter.',
    safety_notes: 'Do not mix with plastic wrappers or fruit stickers.'
  },
  {
    id: 'item-2',
    name: 'Plastic Milk Pouches',
    normalized_name: 'plastic milk pouches',
    aliases: ['milk pouch', 'milk packet', 'doodh packet', 'curd pouch', 'amul packet'],
    category_id: 'c2222222-2222-2222-2222-222222222222',
    description: 'LDPE plastic pouch used for milk or curd.',
    disposal_instructions: 'Cut a slit without detaching corner, wash with water, air dry, and place with dry plastics.',
    safety_notes: 'Avoid snipping small detachable corners that escape recycling.'
  },
  {
    id: 'item-3',
    name: 'Used Dry Cell Batteries',
    normalized_name: 'used dry cell batteries',
    aliases: ['aa battery', 'aaa battery', 'battery', 'batteries', 'torch battery', 'button cell', 'duracell'],
    category_id: 'c3333333-3333-3333-3333-333333333333',
    description: 'Alkaline or lithium portable chemical cells.',
    disposal_instructions: 'Tape terminals with cello tape and hand over to hazardous/e-waste collection.',
    safety_notes: 'Toxic heavy metals. Never place in regular wet or dry garbage.'
  },
  {
    id: 'item-4',
    name: 'Old Smartphone / Mobile Phone',
    normalized_name: 'old smartphone mobile phone',
    aliases: ['smartphone', 'mobile phone', 'broken phone', 'cell phone', 'iphone', 'android phone', 'purana mobile'],
    category_id: 'c4444444-4444-4444-4444-444444444444',
    description: 'Consumer telecommunication device with lithium battery and circuit boards.',
    disposal_instructions: 'Factory reset and return to brand e-waste takeback kiosk or authorized e-waste collector.',
    safety_notes: 'Lithium battery can cause fire if compacted in ordinary garbage trucks.'
  },
  {
    id: 'item-5',
    name: 'Sanitary Napkins & Menstrual Pads',
    normalized_name: 'sanitary napkins menstrual pads',
    aliases: ['sanitary pad', 'menstrual pad', 'whisper pad', 'stayfree', 'tampon', 'pads', 'period pad'],
    category_id: 'c5555555-5555-5555-5555-555555555555',
    description: 'Absorbent menstrual hygiene products.',
    disposal_instructions: 'Wrap tightly in newspaper, mark with a red cross/dot, and hand over separately.',
    safety_notes: 'Never flush in toilet. Protect sanitation workers from direct exposure.'
  },
  {
    id: 'item-6',
    name: 'Greasy Pizza Box',
    normalized_name: 'greasy pizza box',
    aliases: ['pizza box', 'oily pizza box', 'food stained box', 'greasy cardboard'],
    category_id: 'c6666666-6666-6666-6666-666666666666',
    description: 'Cardboard box saturated with food oils and cheese.',
    disposal_instructions: 'Tear off the clean lid for Blue dry recycling. Place the grease-soaked base in Residual waste.',
    safety_notes: 'Grease ruins paper recycling batches.'
  },
  {
    id: 'item-7',
    name: 'Newspapers & Cardboard',
    normalized_name: 'newspapers cardboard',
    aliases: ['newspaper', 'raddi', 'cardboard box', 'amazon box', 'carton', 'paper', 'magazines', 'notebook'],
    category_id: 'c2222222-2222-2222-2222-222222222222',
    description: 'Clean recyclable paper and corrugated cardboard packaging.',
    disposal_instructions: 'Flatten and tie neatly. Give to raddi-wala or place in Blue dry bin.',
    safety_notes: 'Keep dry and free of oil or chemical residues.'
  },
  {
    id: 'item-8',
    name: 'Tea Leaves & Spent Coffee Grounds',
    normalized_name: 'tea leaves spent coffee grounds',
    aliases: ['chai patti', 'tea bag', 'tea leaves', 'coffee grounds', 'used coffee'],
    category_id: 'c1111111-1111-1111-1111-111111111111',
    description: 'Spent beverage leaves and grounds rich in nitrogen.',
    disposal_instructions: 'Rinse off milk/sugar if possible and place in green compost bin.',
    safety_notes: 'Remove synthetic staples/tags from tea bags before composting.'
  },
  {
    id: 'item-9',
    name: 'Multi-layer Chips / Biscuit Wrappers',
    normalized_name: 'multi layer chips biscuit wrappers',
    aliases: ['chips packet', 'lays packet', 'biscuit wrapper', 'kurkure packet', 'chocolate wrapper', 'metallized plastic'],
    category_id: 'c6666666-6666-6666-6666-666666666666',
    description: 'Multi-layer plastic laminate fused with thin aluminum foil.',
    disposal_instructions: 'Deposit in residual dry bin for municipal cement-kiln co-processing or waste-to-energy.',
    safety_notes: 'Cannot be recycled by ordinary scrap dealers due to mixed material layers.'
  },
  {
    id: 'item-10',
    name: 'CFL & Fluorescent Tubelight',
    normalized_name: 'cfl fluorescent tubelight',
    aliases: ['tubelight', 'cfl bulb', 'fluorescent light', 'cfl'],
    category_id: 'c3333333-3333-3333-3333-333333333333',
    description: 'Discharge lamps containing toxic mercury vapor.',
    disposal_instructions: 'Wrap in cardboard, label clearly, and hand over to hazardous waste collection.',
    safety_notes: 'Do not break or crush. Mercury vapor is highly toxic upon inhalation.'
  }
];

export function normalizeText(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ') // remove special punctuation
    .replace(/\s+/g, ' ')         // collapse multiple spaces
    .trim();
}

export const classificationService = {
  /**
   * Deterministic rule-based classification algorithm
   */
  classify: async (rawInput, user = null, saveRecord = false) => {
    const input = normalizeText(rawInput);
    if (!input) {
      return {
        recognized: false,
        message: 'Empty or invalid input provided.',
      };
    }

    // 1. Fetch catalog from database, or fallback to built-in items
    let categories = DEFAULT_CATEGORIES;
    let items = DEFAULT_ITEMS;

    if (isConfigured) {
      try {
        const { data: dbCategories } = await supabase
          .from('waste_categories')
          .select('*')
          .eq('is_active', true);

        if (dbCategories && dbCategories.length > 0) {
          categories = dbCategories;
        }

        const { data: dbItems } = await supabase
          .from('waste_items')
          .select('*')
          .eq('is_active', true);

        if (dbItems && dbItems.length > 0) {
          items = dbItems;
        }
      } catch (err) {
        logger.warn('Using built-in classification catalog fallback', { error: err.message });
      }
    }

    // 2. Matching logic: deterministic hierarchy
    let matchedItem = null;
    let confidence = 'none';
    let matchType = 'none';

    // A. Exact match on normalized_name or name
    matchedItem = items.find(
      (item) =>
        normalizeText(item.name) === input ||
        normalizeText(item.normalized_name) === input
    );
    if (matchedItem) {
      confidence = 'high';
      matchType = 'exact_name';
    }

    // B. Exact match on an alias
    if (!matchedItem) {
      matchedItem = items.find((item) =>
        item.aliases &&
        item.aliases.some((alias) => normalizeText(alias) === input)
      );
      if (matchedItem) {
        confidence = 'high';
        matchType = 'exact_alias';
      }
    }

    // C. Substring / Token inclusion match
    if (!matchedItem) {
      const inputWords = input.split(' ').filter(w => w.length > 2);
      
      let bestScore = 0;
      for (const item of items) {
        const itemAliases = (item.aliases || []).map(a => normalizeText(a));
        const allPhrases = [normalizeText(item.name), normalizeText(item.normalized_name), ...itemAliases];

        // Check if any phrase is contained in input or input is contained in phrase
        for (const phrase of allPhrases) {
          if (input.includes(phrase) || phrase.includes(input)) {
            const score = phrase.length / Math.max(input.length, 1);
            if (score > bestScore) {
              bestScore = score;
              matchedItem = item;
              confidence = 'medium';
              matchType = 'phrase_containment';
            }
          }
        }

        // Token intersection match
        if (!matchedItem && inputWords.length > 0) {
          const itemText = allPhrases.join(' ');
          const matchingWords = inputWords.filter(word => itemText.includes(word));
          if (matchingWords.length === inputWords.length && matchingWords.length > 0) {
            matchedItem = item;
            confidence = 'medium';
            matchType = 'token_match';
            break;
          }
        }
      }
    }

    // 3. Handle Unrecognized Result
    if (!matchedItem) {
      return {
        recognized: false,
        inputText: rawInput,
        message: `We could not find an exact match for "${rawInput}" in the Waste Wise standard catalog.`,
        guidance: 'For items not listed, follow your local Urban Local Body (ULB) / municipal guidelines. If it decomposes, place in Wet waste. If clean packaging, place in Dry recyclables. If hazardous, take to a specialized drop-off.',
        suggestedCategories: categories.map(c => ({ id: c.id, name: c.name, color_hex: c.color_hex })),
      };
    }

    // 4. Link Category
    const category = categories.find((c) => c.id === matchedItem.category_id) || {
      name: 'General Waste',
      color_hex: '#4B5563',
      description: 'Standard household waste stream.',
      disposal_instructions: matchedItem.disposal_instructions,
      safety_notes: matchedItem.safety_notes,
    };

    const explanation = `Matched to "${matchedItem.name}" under ${category.name} via ${matchType} rule.`;

    const result = {
      recognized: true,
      inputText: rawInput,
      item: {
        id: matchedItem.id,
        name: matchedItem.name,
        description: matchedItem.description,
      },
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        color_hex: category.color_hex,
        icon_name: category.icon_name || 'trash-2',
        description: category.description,
      },
      disposal_instructions: matchedItem.disposal_instructions || category.disposal_instructions,
      safety_notes: matchedItem.safety_notes || category.safety_notes || 'Always wear protective gloves when handling contaminated or sharp items.',
      confidence,
      classification_method: 'rule_based',
      result_explanation: explanation,
    };

    // 5. Persist record and award points if requested and authenticated
    if (saveRecord && user) {
      try {
        const { data: record, error: recordErr } = await supabase
          .from('classification_records')
          .insert({
            user_id: user.id,
            waste_item_id: matchedItem.id.startsWith('item-') ? null : matchedItem.id,
            category_id: category.id,
            input_text: rawInput,
            classification_method: 'rule_based',
            result_explanation: explanation,
          })
          .select()
          .single();

        if (record) {
          result.recordId = record.id;
          result.saved = true;

          // Award points for valid classification (Idempotent per user + item + date)
          const today = new Date().toISOString().split('T')[0];
          const idempotencyKey = `classify:${user.id}:${today}:${matchedItem.normalized_name.replace(/\s+/g, '_')}`;
          const award = await rewardService.awardPoints(
            user.id,
            'classify_waste',
            idempotencyKey,
            record.id
          );
          result.reward = award;
        }
      } catch (saveErr) {
        logger.error('Failed to save classification record or award points', { error: saveErr.message });
      }
    }

    return result;
  },
};

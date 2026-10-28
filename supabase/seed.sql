-- ====================================================================
-- Waste Wise — Smart Waste Segregation
-- Seed Data: Categories, Waste Catalog Items, Learning Modules & Reward Rules
-- Tailored for Indian Household Context & Municipal Segregation Norms
-- ====================================================================

-- 1. Insert Core Waste Categories
INSERT INTO public.waste_categories (id, name, slug, description, disposal_instructions, safety_notes, color_hex, icon_name, is_active)
VALUES 
(
    'c1111111-1111-1111-1111-111111111111',
    'Wet / Biodegradable Waste',
    'wet-biodegradable',
    'Organic kitchen and garden materials that decompose naturally through biological action.',
    'Deposit directly in the Green Bin unbagged or lined with compostable/newspaper wrapping. Ideal for home composting or municipal biomethanation.',
    'Keep separate from dry recyclables. Avoid mixing with plastic bags or non-biodegradable wrappers.',
    '#10B981',
    'leaf',
    true
),
(
    'c2222222-2222-2222-2222-222222222222',
    'Dry / Recyclable Waste',
    'dry-recyclable',
    'Inorganic materials capable of being reprocessed into new products such as paper, plastics, glass, and metals.',
    'Rinse and dry all containers before discarding into the Blue Bin. Flatten cartons and plastic bottles to save bin volume.',
    'Must be free of food residue or liquid contamination to ensure high recyclability and safe handling by sanitation workers.',
    '#2563EB',
    'recycle',
    true
),
(
    'c3333333-3333-3333-3333-333333333333',
    'Domestic Hazardous Waste',
    'domestic-hazardous',
    'Toxic, flammable, corrosive, or chemically reactive household items posing health and environmental hazards.',
    'Wrap securely, label clearly, and place in the designated Hazardous Waste container (or Red/Yellow bin depending on municipal setup). Deliver to authorized drop-off points.',
    'WARNING: Never pour paints, solvents, or chemicals down household drains. Do not crush CFL bulbs or puncture aerosol cans.',
    '#DC2626',
    'alert-triangle',
    true
),
(
    'c4444444-4444-4444-4444-444444444444',
    'Electronic Waste (E-Waste)',
    'electronic-waste',
    'Discarded electrical or electronic equipment containing toxic heavy metals like lead, cadmium, and mercury.',
    'Store safely indoors away from moisture. Hand over to authorized E-waste collection drives, manufacturer take-back kiosks, or registered PROs.',
    'Do not dismantle batteries or circuit boards at home. Never burn electronic cables or dispose of them in municipal trash bins.',
    '#7C3AED',
    'cpu',
    true
),
(
    'c5555555-5555-5555-5555-555555555555',
    'Sanitary Waste',
    'sanitary-waste',
    'Personal hygiene items, soiled diapers, menstrual pads, and household medical dressings contaminated with biological fluids.',
    'Wrap individually and securely in old newspaper or opaque bags marked with a red cross/dot. Hand over separately to sanitation workers.',
    'Essential for sanitary worker dignity and disease prevention. Never flush sanitary products into toilets as they block sewage lines.',
    '#D97706',
    'shield-alert',
    true
),
(
    'c6666666-6666-6666-6666-666666666666',
    'Residual / Non-Recyclable Waste',
    'residual-waste',
    'Mixed, heavily soiled, or multi-layered waste materials that cannot be composted or mechanically recycled.',
    'Deposit in the Black / Grey general waste bin for controlled municipal sanitary landfilling or waste-to-energy incineration.',
    'Ensure this bin is kept as small as possible by rigorous segregation of organic and recyclable streams.',
    '#4B5563',
    'trash-2',
    true
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    disposal_instructions = EXCLUDED.disposal_instructions,
    safety_notes = EXCLUDED.safety_notes,
    color_hex = EXCLUDED.color_hex;

-- 2. Insert Realistic Waste Catalog Items with Aliases & Rules
INSERT INTO public.waste_items (name, normalized_name, aliases, category_id, description, disposal_instructions, safety_notes, classification_rule, is_active)
VALUES
-- Wet Waste Items
(
    'Vegetable & Fruit Peels',
    'vegetable fruit peels',
    ARRAY['onion peels', 'potato peels', 'banana peels', 'apple skin', 'sabzi chilka', 'fruit scraps', 'citrus rinds', 'vegetable trimmings'],
    'c1111111-1111-1111-1111-111111111111',
    'Raw organic matter left after cooking and peeling vegetables and fruits.',
    'Place in the green compost bin. Perfect feed for vermicomposting or local biomethanation units.',
    'Do not mix with plastic wrappers, rubber bands, or produce stickers.',
    '{"match_type": "exact_or_alias", "priority": 1}',
    true
),
(
    'Cooked Food Leftovers',
    'cooked food leftovers',
    ARRAY['stale rice', 'leftover roti', 'dal leftover', 'curry leftovers', 'spoiled food', 'bassi khana'],
    'c1111111-1111-1111-1111-111111111111',
    'Prepared meals and leftover cooked organic food items.',
    'Drain excess liquids/gravy before adding to the green bin. Can be added to well-aerated compost piles.',
    'Avoid adding very oily or salty gravy in large quantities directly to small aerobic home composters.',
    '{"match_type": "exact_or_alias", "priority": 2}',
    true
),
(
    'Tea Leaves and Coffee Grounds',
    'tea leaves coffee grounds',
    ARRAY['chai patti', 'used tea leaves', 'tea bags', 'filter coffee grounds', 'espresso puck'],
    'c1111111-1111-1111-1111-111111111111',
    'Organic spent beverage grounds and leaves rich in nitrogen.',
    'Rinse milk/sugar off chai patti if possible, remove tea bag staples/tags, and place in the green bin.',
    'Ensure commercial tea bags do not contain synthetic plastic mesh before composting.',
    '{"match_type": "exact_or_alias", "priority": 2}',
    true
),
(
    'Eggshells',
    'eggshells',
    ARRAY['egg shell', 'anda chilka', 'crushed eggshells'],
    'c1111111-1111-1111-1111-111111111111',
    'Calcium-rich avian eggshell fragments.',
    'Rinse and crush lightly before placing in the green bin or soil/compost bin.',
    'Crushing speeds up decomposition considerably.',
    '{"match_type": "exact_or_alias", "priority": 2}',
    true
),
(
    'Puja Flowers & Garden Leaves',
    'puja flowers garden leaves',
    ARRAY['dry leaves', 'garden trimmings', 'temple flowers', 'nirmalya', 'marigold garlands', 'rose petals', 'lawn clippings'],
    'c1111111-1111-1111-1111-111111111111',
    'Botanical waste, ritual floral offerings, and fallen dry/green foliage.',
    'Remove decorative threads, ribbons, or foil wrap. Place flowers in designated nirmalya bins or green compost bin.',
    'Never dump floral waste into lakes, rivers, or open water bodies.',
    '{"match_type": "exact_or_alias", "priority": 2}',
    true
),
(
    'Coconut Shells & Husk',
    'coconut shells husk',
    ARRAY['nariyal chilka', 'nariyal katora', 'coconut coir', 'coconut shell'],
    'c1111111-1111-1111-1111-111111111111',
    'Fibrous lignified organic matter from tender or mature coconuts.',
    'Break into smaller pieces if composting at home, or deposit in municipal green organic bins.',
    'Takes longer to break down due to high lignin content.',
    '{"match_type": "exact_or_alias", "priority": 3}',
    true
),

-- Dry Recyclable Items
(
    'Cardboard Cartons & Boxes',
    'cardboard cartons boxes',
    ARRAY['corrugated box', 'amazon carton', 'flipkart box', 'shoe box', 'cereal box', 'packing carton'],
    'c2222222-2222-2222-2222-222222222222',
    'Corrugated brown packaging cartons and paperboard packaging.',
    'Flatten all boxes to save space, remove plastic packing tape where possible, and place in the Blue dry waste bin.',
    'Must be kept dry. Wet or fungus-infested cardboard cannot be recycled.',
    '{"match_type": "exact_or_alias", "priority": 1}',
    true
),
(
    'Plastic Milk Pouches',
    'plastic milk pouches',
    ARRAY['doodh packet', 'milk pouch', 'curd pouch', 'dahi packet', 'amul pouch', 'mother dairy packet'],
    'c2222222-2222-2222-2222-222222222222',
    'High-Density Polyethylene (HDPE) or LDPE flexible plastic pouches used for dairy packaging.',
    'Cut off a small corner without fully detaching the tip. Wash thoroughly with water, air dry, and store with dry plastics.',
    'Do not snip tiny separate corner pieces, as micro-plastic corners escape recycling sorting facilities.',
    '{"match_type": "exact_or_alias", "priority": 1}',
    true
),
(
    'PET Plastic Bottles',
    'pet plastic bottles',
    ARRAY['water bottle', 'bisleri bottle', 'cold drink bottle', 'shampoo bottle', 'oil bottle cleaned', 'plastic soda bottle'],
    'c2222222-2222-2222-2222-222222222222',
    'Clear or tinted Polyethylene Terephthalate rigid containers.',
    'Empty liquid, rinse residue, crush bottle flat, screw cap back on, and discard into the Blue dry bin.',
    'Avoid burning under any circumstance as it produces carcinogenic dioxins.',
    '{"match_type": "exact_or_alias", "priority": 1}',
    true
),
(
    'Newspapers & Books',
    'newspapers books',
    ARRAY['raddi', 'old newspaper', 'magazines', 'notebooks', 'office paper', 'printer paper', 'envelopes'],
    'c2222222-2222-2222-2222-222222222222',
    'Clean unlaminated cellulose paper products.',
    'Stack flat and tie with jute twine. Place in dry recyclable bin or sell directly to local kabadiwala.',
    'Keep free from grease, oil, and moisture.',
    '{"match_type": "exact_or_alias", "priority": 1}',
    true
),
(
    'Metal Food Cans & Tins',
    'metal food cans tins',
    ARRAY['tin can', 'cold drink can', 'aluminum soda can', 'ghee tin', 'oil can', 'canned food tin'],
    'c2222222-2222-2222-2222-222222222222',
    'Aluminum and tin-plated steel food containers.',
    'Rinse thoroughly to remove sweet syrup or sauce residue. Push lid inside can and put in Blue dry bin.',
    'Be careful of sharp metal edges when cleaning.',
    '{"match_type": "exact_or_alias", "priority": 1}',
    true
),
(
    'Glass Bottles & Jars',
    'glass bottles jars',
    ARRAY['jam jar', 'pickle jar', 'sauce bottle', 'beer bottle', 'glass container'],
    'c2222222-2222-2222-2222-222222222222',
    'Intact soda-lime silica glass packaging.',
    'Rinse residue, dry, and place into the Blue bin. Return deposit bottles where applicable.',
    'Broken glass requires careful wrapping to prevent cuts to sanitation workers.',
    '{"match_type": "exact_or_alias", "priority": 1}',
    true
),

-- Domestic Hazardous Waste
(
    'Used Dry Cell Batteries',
    'used dry cell batteries',
    ARRAY['aa battery', 'aaa battery', 'torch battery', 'button cell', 'rechargeable battery', 'cell', 'duracell'],
    'c3333333-3333-3333-3333-333333333333',
    'Alkaline, lithium, or zinc-carbon portable chemical cells.',
    'Tape over battery terminals with electrical or cello tape. Store in a sturdy plastic box and deposit at specialized hazardous/e-waste collection points.',
    'DANGER: Never place in regular wet or dry trash. Heavy metals leach into groundwater causing long-term neurological toxicity.',
    '{"match_type": "exact_or_alias", "priority": 1}',
    true
),
(
    'CFL Bulbs & Fluorescent Tube Lights',
    'cfl bulbs fluorescent tube lights',
    ARRAY['tubelight', 'cfl', 'fluorescent lamp', 'mercury bulb'],
    'c3333333-3333-3333-3333-333333333333',
    'Lighting fixtures containing toxic elemental mercury vapor.',
    'Wrap in original cardboard sleeve or bubble wrap. Hand over directly to municipal hazardous waste collection or authorized electrical vendors.',
    'DANGER: Do not break or crush. If broken accidentally, ventilate room immediately and avoid inhaling dust or vapor.',
    '{"match_type": "exact_or_alias", "priority": 1}',
    true
),
(
    'Expired Medicines & Injections',
    'expired medicines injections',
    ARRAY['expired tablets', 'cough syrup bottle', 'blister pack', 'ointment tube', 'dawai', 'expired capsules'],
    'c3333333-3333-3333-3333-333333333333',
    'Unused, contaminated, or expired pharmaceuticals and chemical preparations.',
    'Keep in original blister foil or bottle. Place in red domestic hazardous collection bin or participate in pharmacy take-back schemes.',
    'Never flush down toilets or sinks, as pharmaceuticals contaminate drinking water systems and generate antibiotic resistance.',
    '{"match_type": "exact_or_alias", "priority": 1}',
    true
),
(
    'Insecticides & Mosquito Vaporizer Refills',
    'insecticides mosquito vaporizer refills',
    ARRAY['all out refill', 'good knight refill', 'hit spray can', 'pesticide bottle', 'baygon spray', 'rat poison'],
    'c3333333-3333-3333-3333-333333333333',
    'Chemical repellents, propellants, and aerosol cylinders containing synthetic pyrethroids.',
    'Keep cap tightly closed. Deliver to hazardous waste collection. Never puncture pressurized aerosol cans.',
    'Highly flammable and poisonous to humans and pets. Keep out of reach of children.',
    '{"match_type": "exact_or_alias", "priority": 1}',
    true
),
(
    'Paints, Thinners & Polishes',
    'paints thinners polishes',
    ARRAY['varnish can', 'paint bucket', 'turpentine oil', 'wood polish', 'nail polish bottle'],
    'c3333333-3333-3333-3333-333333333333',
    'Volatile organic compounds (VOCs) and petroleum-based solvent finishes.',
    'Allow residue to harden completely if negligible, otherwise seal lid tightly and deposit at local chemical disposal points.',
    'Extremely flammable. Keep away from direct flame or heat.',
    '{"match_type": "exact_or_alias", "priority": 2}',
    true
),

-- Electronic Waste (E-Waste)
(
    'Old Smartphones & Feature Phones',
    'old smartphones feature phones',
    ARRAY['mobile phone', 'broken smartphone', 'iphone', 'android phone', 'purana mobile', 'cellphone'],
    'c4444444-4444-4444-4444-444444444444',
    'Consumer telecommunication hardware with circuit boards, display modules, and lithium-ion batteries.',
    'Perform factory data reset. Hand over to authorized e-waste recyclers, electronics brand take-back programs, or authorized collection bins.',
    'Lithium batteries can swell or combust if crushed in ordinary garbage compactors.',
    '{"match_type": "exact_or_alias", "priority": 1}',
    true
),
(
    'Charging Cables, Adapters & Earphones',
    'charging cables adapters earphones',
    ARRAY['usb cable', 'charger', 'type c cable', 'earphones', 'headphones', 'extension cord', 'wire scraps'],
    'c4444444-4444-4444-4444-444444444444',
    'Copper wires insulated with PVC/rubber and power supply adapters.',
    'Coil neatly and place in E-waste bin or drop box.',
    'Never burn cables to extract copper; PVC burning releases deadly dioxins.',
    '{"match_type": "exact_or_alias", "priority": 1}',
    true
),
(
    'Computer Keyboards & Mice',
    'computer keyboards mice',
    ARRAY['keyboard', 'optical mouse', 'laptop charger', 'webcam', 'peripherals'],
    'c4444444-4444-4444-4444-444444444444',
    'Computer peripheral devices made of flame-retardant plastics and printed circuits.',
    'Deposit at designated IT e-waste collection kiosks.',
    'Contains flame retardants that need controlled extraction during recycling.',
    '{"match_type": "exact_or_alias", "priority": 2}',
    true
),

-- Sanitary Waste
(
    'Sanitary Napkins & Menstrual Pads',
    'sanitary napkins menstrual pads',
    ARRAY['whisper pad', 'stayfree pad', 'period pad', 'menstrual napkin', 'tampons'],
    'c5555555-5555-5555-5555-555555555555',
    'Absorbent cellulose and superabsorbent polymer hygiene pads containing biological matter.',
    'Wrap tightly in several sheets of old newspaper or disposal pouch and mark prominently with a red cross or red dot. Hand over directly to waste collectors.',
    'CRITICAL: Never flush pads down toilets (causes severe blockages). Always protect sanitation workers by wrapping securely.',
    '{"match_type": "exact_or_alias", "priority": 1}',
    true
),
(
    'Baby & Adult Diapers',
    'baby adult diapers',
    ARRAY['diaper', 'pampers', 'huggies', 'adult incontinence brief', 'soiled diaper'],
    'c5555555-5555-5555-5555-555555555555',
    'High-capacity polymer briefs with biological fecal or urinary discharge.',
    'Empty solid waste into toilet if possible. Roll diaper tightly, seal with adhesive tabs, wrap in newspaper marked with red dot, and dispose in sanitary bin.',
    'Never mix with regular dry or wet kitchen waste.',
    '{"match_type": "exact_or_alias", "priority": 1}',
    true
),
(
    'Used Bandages & Cotton Swabs',
    'used bandages cotton swabs',
    ARRAY['band-aid', 'cotton swab with blood', 'dressing gauze', 'medical cotton', 'earbuds'],
    'c5555555-5555-5555-5555-555555555555',
    'Household first-aid supplies with biological fluid contact.',
    'Wrap in paper and deposit with sanitary waste for high-temperature incineration.',
    'Potential pathogen vector if left exposed.',
    '{"match_type": "exact_or_alias", "priority": 2}',
    true
),

-- Residual / Non-Recyclable Waste
(
    'Greasy Pizza Box',
    'greasy pizza box',
    ARRAY['pizza box with oil', 'oily cardboard', 'food stained paper box'],
    'c6666666-6666-6666-6666-666666666666',
    'Cardboard permeated with cooking oil and cheese fats.',
    'Tear off the clean, unsoiled cardboard lid and put in Blue dry bin. Put the grease-saturated bottom in the Residual waste bin (or backyard compost if unbleached).',
    'Grease prevents paper fibers from binding during the paper recycling process.',
    '{"match_type": "exact_or_alias", "priority": 1}',
    true
),
(
    'Multi-Layered Chips & Biscuit Wrappers',
    'multi layered chips biscuit wrappers',
    ARRAY['lays packet', 'chips wrapper', 'kurkure packet', 'chocolate wrapper', 'metallized plastic', 'maggi packet'],
    'c6666666-6666-6666-6666-666666666666',
    'Multi-layer laminate packaging (MLP) bonded with aluminum foil and BOPP plastic layers.',
    'Collect in dry residual bin or municipal MLP recovery drives for co-processing in cement kilns or road-tar blending.',
    'Cannot be recycled mechanically by ordinary scrap recyclers due to fused material layers.',
    '{"match_type": "exact_or_alias", "priority": 1}',
    true
),
(
    'Broken Ceramics & Crockery',
    'broken ceramics crockery',
    ARRAY['broken cup', 'ceramic plate', 'clay pot broken', 'porcelain mug', 'crockery shards'],
    'c6666666-6666-6666-6666-666666666666',
    'Fired clay, ceramic, or porcelain kitchenware shards.',
    'Wrap pieces carefully in thick paper or cardboard box to prevent injury, and discard into the residual bin.',
    'Ceramics have different melting temperatures than bottle glass and cannot be mixed with recyclable container glass.',
    '{"match_type": "exact_or_alias", "priority": 2}',
    true
),
(
    'Thermocol & Polystyrene Packaging',
    'thermocol polystyrene packaging',
    ARRAY['thermocol', 'styrofoam', 'polystyrene blocks', 'appliance protective foam'],
    'c6666666-6666-6666-6666-666666666666',
    'Expanded polystyrene (EPS) foam packaging.',
    'Break down and store clean. Hand over to specialized bulky waste pickup or deposit into residual bin for volume densification.',
    'Never burn thermocol; it produces extremely toxic styrene gas.',
    '{"match_type": "exact_or_alias", "priority": 2}',
    true
)
ON CONFLICT DO NOTHING;

-- 3. Insert Practical Indian Household Learning Modules
INSERT INTO public.learning_modules (title, slug, summary, content, difficulty, estimated_minutes, points_reward, category_tag, is_published)
VALUES
(
    'The 3-Way Waste Segregation Rule in Indian Cities',
    'three-way-segregation-guide',
    'Master the fundamentals of segregating wet, dry, and sanitary waste at home under the Solid Waste Management Rules (SWM).',
    '# The 3-Way Waste Segregation Rule in Indian Cities

Under the **Solid Waste Management Rules (2016)** framed by the Ministry of Environment, Forest and Climate Change (MoEFCC), every Indian waste generator is legally mandated to segregate waste at source.

## The Three Fundamental Bins

### 1. Green Bin: Organic / Wet Waste
Everything that was once part of a living plant or animal that breaks down naturally:
* Vegetable scraps, fruit peels, and seed cores.
* Leftover rice, rotis, curries (drain sauces and curries).
* Used tea powder (*chai patti*), coffee grounds, eggshells.
* Floral offerings (*puja nirmalya*), garden leaves, and plant trimmings.

**Action:** Keep it completely free of plastic bags or poly-wrappers. Line your kitchen caddy with newspaper if needed.

---

### 2. Blue Bin: Dry / Recyclable Waste
Inorganic items that can be collected, baled, and reprocessed:
* Cardboard delivery boxes, newspapers, notebooks, paper bags.
* PET plastic water bottles, shampoo bottles, detergent jugs.
* Thoroughly washed and dried milk pouches (*doodh packets*).
* Metal cans, aluminum beverage tins, clean tin lids.
* Clean glass sauce and pickle bottles.

**Action:** Follow the three golden words: **Rinse, Dry, Flatten**. Storing clean recyclables eliminates foul odors and insect infestation.

---

### 3. Red / Marked Bag: Sanitary & Domestic Hazardous Waste
Items contaminated with human biological fluids or hazardous chemicals:
* Menstrual pads, tampons, pantyliners.
* Baby and adult diapers.
* Soiled medical dressings, cotton swabs, and adhesive bandages.
* Expired medicines, CFL bulbs, and dry cell batteries.

**Action:** Wrap sanitary items securely in old newspapers and mark with a visible red cross or red dot. This directly protects our sanitation workers from communicable diseases.',
    'Beginner',
    4,
    25,
    'Fundamentals',
    true
),
(
    'Kitchen Composting: Turn Scraps into Garden Gold',
    'kitchen-composting-guide',
    'A step-by-step guide to starting an odor-free, pest-free composting system on your balcony or backyard.',
    '# Kitchen Composting: Turn Scraps into Garden Gold

Over 50% of an average Indian household’s garbage consists of moisture-rich organic waste. When dumped into municipal landfills, organic waste decomposes anaerobically (without oxygen) and produces **methane**—a greenhouse gas 28 times more potent than carbon dioxide.

By composting at home, you slash your household waste by half while generating nutrient-rich black compost for your potted plants.

## The Golden Formula: Browns vs. Greens

Composting relies on microbial aerobic digestion requiring a balanced carbon-to-nitrogen ratio:

* **Greens (Nitrogen Rich):** Fresh vegetable peels, fruit rinds, coffee grounds, tea leaves, green grass.
* **Browns (Carbon Rich):** Dry leaves, shredded unprinted cardboard, cocopeat, saw dust, crushed eggshells.

### The 3 Easy Steps to Start in an Apartment:

1. **Pick an Aerated Pot:** Use a terracotta or plastic pot with multiple side holes for oxygen circulation.
2. **Layer Systematically:** Place a bottom layer of browns (cocopeat or dry leaves, 2 inches thick). Add your daily kitchen scraps. Cover *every* fresh layer of green scraps with an equal layer of brown matter.
3. **Weekly Aeration:** Turn the pile gently once a week with a small gardening fork. Within 4 to 6 weeks, your waste will turn into rich, crumbly, sweet-smelling compost.',
    'Beginner',
    5,
    25,
    'Composting',
    true
),
(
    'Demystifying Plastics: Wash, Dry, and Flatten',
    'clean-dry-flatten-plastics',
    'Why unwashed plastics end up in dumps and how the simple habit of washing milk pouches saves thousands of tons from landfills.',
    '# Demystifying Plastics: Wash, Dry, and Flatten

Did you know that waste pickers and automated recycling centers reject over 60% of recyclable plastics simply because they are contaminated with food stains, grease, or sour milk?

## The Journey of an Indian Milk Pouch

Over 50 million plastic milk packets are consumed every morning in India. Made of virgin Food-Grade Low-Density Polyethylene (LDPE), they possess high scrap value—**if kept clean**.

### The 3 Mistakes to Avoid:

1. **Do Not Cut the Corner Off:** When opening a milk packet, make an incision without cutting off a small corner triangle. That tiny separate piece cannot be caught by sorting equipment and invariably washes into storm drains and rivers.
2. **Rinse with Used Water:** Rinse the inside of the pouch with a splash of water (you can use vegetable wash water to conserve water).
3. **Air Dry Thoroughly:** Invert the pouch over a utensil stand or clothesline for 30 minutes. Once bone dry, drop it into your dry waste collection sack.

When your dry sack is full, hand it over to your dry waste collector or local *kabadiwala*. Dry plastics fetch a fair income for waste workers and enter the circular economy.',
    'Intermediate',
    4,
    25,
    'Recycling',
    true
),
(
    'Safe Handling of Domestic Hazardous and Sanitary Waste',
    'hazardous-and-sanitary-protocols',
    'Protect sanitation workers and safeguard groundwater by following strict disposal protocols for batteries, chemicals, and medical waste.',
    '# Safe Handling of Domestic Hazardous and Sanitary Waste

Safeguarding human dignity and public health begins inside our bathrooms and utility cabinets.

## Dignity and Safety for Sanitation Workers

In India, hundreds of thousands of sanitation workers manually sort garbage daily. When exposed razor blades, broken glass, or unwrapped sanitary napkins are mixed into general bins, workers suffer physical lacerations, hepatitis, tetanus, and severe infections.

### Golden Protocol for Sanitary Waste:
* **The Red Dot Movement:** Fold the soiled sanitary pad or diaper. Wrap it tightly in 3-4 layers of discarded newspaper.
* **Mark It Clearly:** Draw a prominent **Red Cross** or **Red Dot** on the packet with a marker or sindoor.
* **Handover Separately:** Never hide sanitary packets inside regular wet or dry waste bins. Give it separately to the collection vehicle collector.

### Handling Broken Glass and Sharp Objects:
* Wrap shattered glass pieces in multiple newspaper sheets, place inside a discarded carton box, and tape securely with a written warning label: *"Caution: Broken Glass Inside"*.

### Managing E-Waste and CFLs:
* Never throw tube lights, CFL bulbs, or batteries in regular garbage.
* Tape over the terminal poles of old button cells and 9V batteries.
* Hand over to dedicated quarterly municipal e-waste drives or authorized retailer dropboxes.',
    'Intermediate',
    5,
    25,
    'Safety',
    true
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    summary = EXCLUDED.summary,
    content = EXCLUDED.content,
    points_reward = EXCLUDED.points_reward;

-- 4. Insert Default Reward Rules
INSERT INTO public.reward_rules (event_type, description, points, is_active)
VALUES
    ('classify_waste', 'Awarded for correctly identifying and logging a waste item in the classifier', 10, true),
    ('complete_module', 'Awarded for completing an interactive educational module in the Learn center', 25, true),
    ('daily_streak', 'Awarded for performing waste segregation activities on consecutive days', 5, true)
ON CONFLICT (event_type) DO UPDATE SET
    points = EXCLUDED.points,
    description = EXCLUDED.description;


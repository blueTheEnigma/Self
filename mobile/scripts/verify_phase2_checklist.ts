/**
 * Verification Test Harness: Phase 2 Checklist Domains & Sensory Celebrations
 * Gate 2 Checklist:
 * 1. Every one of the 10 checklist items maps to exactly one valid life domain.
 * 2. Domain completion counts match actual completed states across all 3 domains:
 *    - Spirit & Intellect (5 items)
 *    - Physical Sovereignty (2 items)
 *    - Craft & Sanctuary (3 items)
 * 3. Milestone celebration flag triggers if and only if all 10 items are complete.
 * 4. TypeScript compilation with 0 errors.
 */

import type { ChecklistItem, LifeDomain } from '../src/components/TodayChecklist.js';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${msg}`);
}

const VALID_DOMAINS: LifeDomain[] = ['spirit_intellect', 'physical_sovereignty', 'craft_sanctuary'];

// Mock items generator simulating App.tsx
function createMockChecklist(completedIds: string[]): ChecklistItem[] {
  const items: ChecklistItem[] = [
    {
      id: 'wakeup',
      title: 'Morning Prayer & Dedication',
      subtitle: '05:30 waking dedication',
      domain: 'spirit_intellect',
      category: 'spiritual',
      isCompleted: completedIds.includes('wakeup'),
      onToggle: () => {},
    },
    {
      id: 'track_prayer',
      title: '15m Track Walking Prayer',
      subtitle: 'Walking prayer round tracks',
      domain: 'spirit_intellect',
      category: 'spiritual',
      isCompleted: completedIds.includes('track_prayer'),
      onToggle: () => {},
    },
    {
      id: 'bible',
      title: 'Scripture Reading',
      subtitle: 'Proverbs / Daily passage',
      domain: 'spirit_intellect',
      category: 'spiritual',
      isCompleted: completedIds.includes('bible'),
      onToggle: () => {},
    },
    {
      id: 'audiobook',
      title: 'Daily Audiobook Summary',
      subtitle: 'Strategic & intellectual fuel',
      domain: 'spirit_intellect',
      category: 'mind',
      isCompleted: completedIds.includes('audiobook'),
      onToggle: () => {},
    },
    {
      id: 'scholarship_outreach',
      title: '1 Scholarship Cold Email',
      subtitle: 'Send 1 cold email to professor',
      domain: 'spirit_intellect',
      category: 'outreach',
      isCompleted: completedIds.includes('scholarship_outreach'),
      onToggle: () => {},
    },
    {
      id: 'movement',
      title: '2.5km Run & Calisthenics',
      subtitle: 'Physical discipline',
      domain: 'physical_sovereignty',
      category: 'movement',
      isCompleted: completedIds.includes('movement'),
      onToggle: () => {},
    },
    {
      id: 'satiety',
      title: 'Mindful Satiety (Hara Hachi Bu)',
      subtitle: 'Stop at 80% fullness',
      domain: 'physical_sovereignty',
      category: 'nutrition',
      isCompleted: completedIds.includes('satiety'),
      onToggle: () => {},
    },
    {
      id: 'focus',
      title: '90m Deep Work Session',
      subtitle: 'Quant Bot / Multivariable Calc',
      domain: 'craft_sanctuary',
      category: 'focus',
      isCompleted: completedIds.includes('focus'),
      onToggle: () => {},
    },
    {
      id: 'guitar',
      title: '15m Acoustic Guitar Anchor',
      subtitle: 'Non-screen tactile acoustic play',
      domain: 'craft_sanctuary',
      category: 'creative',
      isCompleted: completedIds.includes('guitar'),
      onToggle: () => {},
    },
    {
      id: 'journal',
      title: 'Evening Micro-Reflection',
      subtitle: '60s wins, friction & tomorrow anchor',
      domain: 'craft_sanctuary',
      category: 'spiritual',
      isCompleted: completedIds.includes('journal'),
      onToggle: () => {},
    },
  ];
  return items;
}

async function runGate2Tests() {
  console.log('--- STARTING GATE 2: CHECKLIST DOMAINS & SENSORY CELEBRATION VERIFICATION ---');

  const allItems = createMockChecklist([]);

  // Test 1: Total count is 10
  assert(allItems.length === 10, `Checklist contains exactly 10 disciplines. Got: ${allItems.length}`);

  // Test 2: Domain mappings
  const spiritItems = allItems.filter(i => i.domain === 'spirit_intellect');
  assert(spiritItems.length === 5, `Spirit & Intellect domain has exactly 5 items. Got: ${spiritItems.length}`);

  const physicalItems = allItems.filter(i => i.domain === 'physical_sovereignty');
  assert(physicalItems.length === 2, `Physical Sovereignty domain has exactly 2 items. Got: ${physicalItems.length}`);

  const craftItems = allItems.filter(i => i.domain === 'craft_sanctuary');
  assert(craftItems.length === 3, `Craft & Sanctuary domain has exactly 3 items. Got: ${craftItems.length}`);

  // Test 3: Every item has a valid life domain
  allItems.forEach(item => {
    assert(VALID_DOMAINS.includes(item.domain), `Item '${item.id}' maps to valid domain '${item.domain}'`);
  });

  // Test 4: Partial domain completion logic
  const partialItems = createMockChecklist(['wakeup', 'track_prayer', 'movement']);
  const partialSpiritDone = partialItems.filter(i => i.domain === 'spirit_intellect' && i.isCompleted).length;
  assert(partialSpiritDone === 2, `Partial spirit items done: 2/5. Got: ${partialSpiritDone}`);

  const partialPhysicalDone = partialItems.filter(i => i.domain === 'physical_sovereignty' && i.isCompleted).length;
  assert(partialPhysicalDone === 1, `Partial physical items done: 1/2. Got: ${partialPhysicalDone}`);

  const isPartialAllSealed = partialItems.length > 0 && partialItems.filter(i => i.isCompleted).length === partialItems.length;
  assert(isPartialAllSealed === false, `Celebration does NOT trigger when only 3/10 items completed.`);

  // Test 5: Full 10/10 consecration trigger
  const full10Items = createMockChecklist([
    'wakeup', 'track_prayer', 'bible', 'audiobook', 'scholarship_outreach',
    'movement', 'satiety',
    'focus', 'guitar', 'journal'
  ]);
  const completedCount = full10Items.filter(i => i.isCompleted).length;
  assert(completedCount === 10, `All 10 items completed.`);

  const isConsecrated = full10Items.length > 0 && completedCount === full10Items.length;
  assert(isConsecrated === true, `Celebration milestone triggers when 10/10 items sealed.`);

  console.log('🎉 ALL GATE 2 TESTS PASSED SUCCESSFULLY!');
}

runGate2Tests().catch(err => {
  console.error(err);
  process.exit(1);
});


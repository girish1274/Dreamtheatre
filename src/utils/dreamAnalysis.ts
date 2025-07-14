import type { DreamAnalysis, DreamElement } from '../types';

export function analyzeDreamText(text: string): DreamAnalysis {
  // Extract key elements from the dream text
  const elements: DreamElement[] = text.toLowerCase()
    .split(/[.,!?]/)
    .flatMap(sentence => {
      const words = sentence.trim().split(' ');
      return extractDreamElements(words);
    });

  // Group similar elements and calculate prominence
  const groupedElements = groupElements(elements);
  
  return {
    elements: groupedElements,
    dominantThemes: extractThemes(groupedElements),
    suggestedPalette: generateColorPalette(groupedElements),
    moodScore: calculateMoodScore(elements),
  };
}

function extractDreamElements(words: string[]): DreamElement[] {
  const elements: DreamElement[] = [];
  
  // Common dream symbols and their categories
  const symbolCategories = {
    environment: ['city', 'building', 'street', 'sky'],
    objects: ['mirror', 'glass', 'window'],
    actions: ['walking', 'floating', 'flying', 'falling'],
    emotions: ['fear', 'peace', 'anxiety', 'joy'],
  };

  words.forEach(word => {
    for (const [category, symbols] of Object.entries(symbolCategories)) {
      if (symbols.includes(word)) {
        elements.push({
          type: category as DreamElement['type'],
          value: word,
          prominence: 1,
        });
      }
    }
  });

  return elements;
}

function groupElements(elements: DreamElement[]): DreamElement[] {
  const grouped = new Map<string, DreamElement>();
  
  elements.forEach(element => {
    const key = `${element.type}-${element.value}`;
    if (grouped.has(key)) {
      const existing = grouped.get(key)!;
      existing.prominence += 1;
    } else {
      grouped.set(key, { ...element });
    }
  });

  return Array.from(grouped.values());
}

function extractThemes(elements: DreamElement[]): string[] {
  const themes = new Set<string>();
  
  // Theme detection rules
  const themeRules = [
    {
      name: 'transformation',
      condition: (els: DreamElement[]) => 
        els.some(e => e.value === 'mirror') && 
        els.some(e => e.type === 'actions'),
    },
    {
      name: 'transcendence',
      condition: (els: DreamElement[]) =>
        els.some(e => e.value === 'floating' || e.value === 'flying'),
    },
    {
      name: 'urban mysticism',
      condition: (els: DreamElement[]) =>
        els.some(e => e.value === 'city') && 
        els.some(e => e.type === 'objects'),
    },
  ];

  themeRules.forEach(rule => {
    if (rule.condition(elements)) {
      themes.add(rule.name);
    }
  });

  return Array.from(themes);
}

function generateColorPalette(elements: DreamElement[]): string[] {
  // Base colors for different dream elements
  const elementColors = {
    city: ['#232B2B', '#465362'],
    mirror: ['#C0C0C0', '#E8EBE4'],
    floating: ['#87CEEB', '#B0E0E6'],
  };

  const palette = new Set<string>();
  
  elements.forEach(element => {
    const colors = elementColors[element.value as keyof typeof elementColors];
    if (colors) {
      colors.forEach(color => palette.add(color));
    }
  });

  return Array.from(palette);
}

function calculateMoodScore(elements: DreamElement[]): number {
  const moodValues = {
    floating: 0.7,
    mirror: 0.3,
    shattering: -0.4,
  };

  let score = 0.5; // neutral baseline
  let totalFactors = 1;

  elements.forEach(element => {
    const moodImpact = moodValues[element.value as keyof typeof moodValues];
    if (moodImpact !== undefined) {
      score += moodImpact;
      totalFactors += 1;
    }
  });

  return score / totalFactors;
}
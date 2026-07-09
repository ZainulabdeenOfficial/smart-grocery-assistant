import { genkit } from 'genkit';
import * as z from 'zod';
import { vertexAI } from '@genkit-ai/vertexai';

const ai = genkit({
  plugins: [vertexAI()],
});

const outputSchema = z.object({
  suggestions: z.array(
    z.object({
      name: z.string(),
      category: z.string(),
      reason: z.string(),
      priority: z.enum(['low', 'medium', 'high']),
      quantity: z.number().min(1).optional(),
      unit: z.string().optional(),
    }),
  ),
});

function getFallbackSuggestions(items: string[]) {
  const hasItem = (name: string) => items.some(i => i.toLowerCase().includes(name));

  const fallbacks: Array<{ name: string; category: string; reason: string; priority: 'low' | 'medium' | 'high'; quantity?: number; unit?: string }> = [];

  if (hasItem('milk') || hasItem('cereal') || hasItem('oatmeal')) {
    fallbacks.push({ name: 'Bananas', category: 'produce', reason: 'complementary', priority: 'medium', quantity: 1, unit: 'bunch' });
  }
  if (hasItem('bread') || hasItem('peanut butter')) {
    fallbacks.push({ name: 'Strawberry Jam', category: 'pantry', reason: 'complementary', priority: 'low', quantity: 1, unit: 'jar' });
  }
  if (hasItem('chicken') || hasItem('beef') || hasItem('pork')) {
    fallbacks.push({ name: 'Mixed Vegetables', category: 'produce', reason: 'complementary', priority: 'high', quantity: 1, unit: 'bag' });
  }
  if (hasItem('pasta') || hasItem('rice')) {
    fallbacks.push({ name: 'Pasta Sauce', category: 'pantry', reason: 'complementary', priority: 'medium', quantity: 1, unit: 'jar' });
  }
  if (hasItem('lettuce') || hasItem('tomato') || hasItem('salad')) {
    fallbacks.push({ name: 'Salad Dressing', category: 'pantry', reason: 'complementary', priority: 'low', quantity: 1, unit: 'bottle' });
  }
  if (hasItem('chips') || hasItem('crackers')) {
    fallbacks.push({ name: 'Salsa', category: 'pantry', reason: 'complementary', priority: 'low', quantity: 1, unit: 'jar' });
  }
  if (hasItem('eggs')) {
    fallbacks.push({ name: 'Cheddar Cheese', category: 'dairy', reason: 'complementary', priority: 'medium', quantity: 1, unit: 'block' });
  }
  if (hasItem('coffee') || hasItem('tea')) {
    fallbacks.push({ name: 'Sugar', category: 'pantry', reason: 'complementary', priority: 'low', quantity: 1, unit: 'bag' });
  }
  if (hasItem('butter') || hasItem('flour') || hasItem('sugar')) {
    fallbacks.push({ name: 'Vanilla Extract', category: 'pantry', reason: 'complementary', priority: 'low', quantity: 1, unit: 'bottle' });
  }

  if (fallbacks.length === 0) {
    fallbacks.push(
      { name: 'Whole Milk', category: 'dairy', reason: 'regular_purchase', priority: 'high', quantity: 1, unit: 'gallon' },
      { name: 'Wheat Bread', category: 'pantry', reason: 'regular_purchase', priority: 'high', quantity: 1, unit: 'loaf' },
      { name: 'Eggs', category: 'dairy', reason: 'regular_purchase', priority: 'high', quantity: 12, unit: 'pcs' },
      { name: 'Apples', category: 'produce', reason: 'regular_purchase', priority: 'medium', quantity: 4, unit: 'pcs' },
      { name: 'Chicken Breast', category: 'meat', reason: 'regular_purchase', priority: 'medium', quantity: 1, unit: 'lb' },
    );
  }

  return { suggestions: fallbacks.slice(0, 5) };
}

export const simpleSuggestionsFlow = ai.defineFlow(
  {
    name: 'simpleSuggestions',
    inputSchema: z.object({
      items: z.array(z.string()).describe('Array of grocery items'),
    }),
    outputSchema: outputSchema,
  },
  async (input) => {
    const prompt = `
    You are a grocery shopping assistant. I have these items in my shopping list:
${input.items.join(', ')}

Please suggest 3-5 additional grocery items that would complement this list. For each suggestion, provide:
- name: the item name
- category: one of (produce, dairy, meat, pantry, beverages, snacks, other)
- reason: why this item is suggested (complementary, essential, healthy, etc.)
- priority: low, medium, or high

Focus on practical, commonly purchased items that make sense with the current list.
  `;
    try {
      const { output } = await ai.generate({
        model: 'vertexai/gemini-2.0-flash',
        prompt,
        output: {
          schema: outputSchema,
        },
      });

      return output || { suggestions: [] };
    } catch (error) {
      console.error('Error generating suggestions with Genkit: ', error);
      console.log('Using fallback suggestions instead.');
      return getFallbackSuggestions(input.items);
    }
  },
);

export function initializeGenkit() {
  console.log('Genkit initialized');
}
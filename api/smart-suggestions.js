function getFallbackSuggestions(items) {
  const hasItem = (name) => items.some(i => i.toLowerCase().includes(name));

  const fallbacks = [];

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

  return fallbacks.slice(0, 5);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Invalid items array' });
    }

    const itemNames = items.map((item) => item.name);

    const suggestions = getFallbackSuggestions(itemNames).map((suggestion) => ({
      item: {
        id: Math.random().toString(36).substring(2),
        name: suggestion.name,
        category: suggestion.category,
        quantity: suggestion.quantity,
        unit: suggestion.unit || 'pcs',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      reason: suggestion.reason,
      priority: suggestion.priority,
    }));

    return res.status(200).json(suggestions);
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return res.status(500).json({
      error: 'AI suggestions unavailable',
      message: 'Unable to generate smart suggestions at the moment',
    });
  }
}

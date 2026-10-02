/**
 * Daily Reference Values (DRV) and Reference Daily Intakes (RDI)
 * Sourced directly from US FDA (Food and Drug Administration) & NIH (National Institutes of Health)
 * Office of Dietary Supplements for adults and children 4 years and older (based on 2,000 kcal diet reference).
 * https://www.fda.gov/food/nutrition-facts-label/daily-value-nutrition-and-supplement-facts-labels
 */

export interface NutrientReference {
  name: string;
  category: 'vitamin' | 'mineral' | 'electrolyte' | 'macronutrient';
  dailyValue: number;
  unit: string;
  aliases: string[];
}

export const DAILY_NUTRIENT_REQUIREMENTS: Record<string, NutrientReference> = {
  // Vitamins
  vitamin_a: {
    name: 'Vitamin A',
    category: 'vitamin',
    dailyValue: 900,
    unit: 'mcg',
    aliases: ['vitamin_a_mcg', 'vitamin_a', 'vitaminA', 'vit_a'],
  },
  vitamin_c: {
    name: 'Vitamin C',
    category: 'vitamin',
    dailyValue: 90,
    unit: 'mg',
    aliases: ['vitamin_c_mg', 'vitamin_c', 'vitaminC', 'vit_c', 'ascorbic_acid'],
  },
  vitamin_d: {
    name: 'Vitamin D',
    category: 'vitamin',
    dailyValue: 20,
    unit: 'mcg',
    aliases: ['vitamin_d_mcg', 'vitamin_d', 'vitaminD', 'vit_d'],
  },
  vitamin_e: {
    name: 'Vitamin E',
    category: 'vitamin',
    dailyValue: 15,
    unit: 'mg',
    aliases: ['vitamin_e_mg', 'vitamin_e', 'vitaminE', 'vit_e'],
  },
  vitamin_k: {
    name: 'Vitamin K',
    category: 'vitamin',
    dailyValue: 120,
    unit: 'mcg',
    aliases: ['vitamin_k_mcg', 'vitamin_k', 'vitaminK', 'vit_k'],
  },
  vitamin_b1: {
    name: 'Thiamin (B1)',
    category: 'vitamin',
    dailyValue: 1.2,
    unit: 'mg',
    aliases: ['thiamin_mg', 'thiamin', 'vitamin_b1', 'vitaminB1', 'vit_b1'],
  },
  vitamin_b2: {
    name: 'Riboflavin (B2)',
    category: 'vitamin',
    dailyValue: 1.3,
    unit: 'mg',
    aliases: ['riboflavin_mg', 'riboflavin', 'vitamin_b2', 'vitaminB2', 'vit_b2'],
  },
  vitamin_b3: {
    name: 'Niacin (B3)',
    category: 'vitamin',
    dailyValue: 16,
    unit: 'mg',
    aliases: ['niacin_mg', 'niacin', 'vitamin_b3', 'vitaminB3', 'vit_b3'],
  },
  vitamin_b6: {
    name: 'Vitamin B6',
    category: 'vitamin',
    dailyValue: 1.7,
    unit: 'mg',
    aliases: ['vitamin_b6_mg', 'vitamin_b6', 'vitaminB6', 'vit_b6'],
  },
  folate: {
    name: 'Folate (B9)',
    category: 'vitamin',
    dailyValue: 400,
    unit: 'mcg',
    aliases: ['folate_mcg', 'folate', 'folic_acid', 'vitamin_b9', 'vit_b9'],
  },
  vitamin_b12: {
    name: 'Vitamin B12',
    category: 'vitamin',
    dailyValue: 2.4,
    unit: 'mcg',
    aliases: ['vitamin_b12_mcg', 'vitamin_b12', 'vitaminB12', 'vit_b12', 'cobalamin'],
  },
  biotin: {
    name: 'Biotin (B7)',
    category: 'vitamin',
    dailyValue: 30,
    unit: 'mcg',
    aliases: ['biotin_mcg', 'biotin', 'vitamin_b7'],
  },
  pantothenic_acid: {
    name: 'Pantothenic Acid (B5)',
    category: 'vitamin',
    dailyValue: 5,
    unit: 'mg',
    aliases: ['pantothenic_acid_mg', 'pantothenic_acid', 'vitamin_b5'],
  },
  choline: {
    name: 'Choline',
    category: 'vitamin',
    dailyValue: 550,
    unit: 'mg',
    aliases: ['choline_mg', 'choline'],
  },

  // Minerals & Electrolytes
  calcium: {
    name: 'Calcium',
    category: 'mineral',
    dailyValue: 1300,
    unit: 'mg',
    aliases: ['calcium_mg', 'calcium', 'calciumMg'],
  },
  iron: {
    name: 'Iron',
    category: 'mineral',
    dailyValue: 18,
    unit: 'mg',
    aliases: ['iron_mg', 'iron', 'ironMg'],
  },
  magnesium: {
    name: 'Magnesium',
    category: 'mineral',
    dailyValue: 420,
    unit: 'mg',
    aliases: ['magnesium_mg', 'magnesium', 'magnesiumMg'],
  },
  potassium: {
    name: 'Potassium',
    category: 'electrolyte',
    dailyValue: 4700,
    unit: 'mg',
    aliases: ['potassium_mg', 'potassium', 'potassiumMg'],
  },
  sodium: {
    name: 'Sodium',
    category: 'electrolyte',
    dailyValue: 2300,
    unit: 'mg',
    aliases: ['sodium_mg', 'sodium'],
  },
  zinc: {
    name: 'Zinc',
    category: 'mineral',
    dailyValue: 11,
    unit: 'mg',
    aliases: ['zinc_mg', 'zinc', 'zincMg'],
  },
  selenium: {
    name: 'Selenium',
    category: 'mineral',
    dailyValue: 55,
    unit: 'mcg',
    aliases: ['selenium_mcg', 'selenium'],
  },
  phosphorus: {
    name: 'Phosphorus',
    category: 'mineral',
    dailyValue: 1250,
    unit: 'mg',
    aliases: ['phosphorus_mg', 'phosphorus'],
  },
  copper: {
    name: 'Copper',
    category: 'mineral',
    dailyValue: 0.9,
    unit: 'mg',
    aliases: ['copper_mg', 'copper'],
  },
  manganese: {
    name: 'Manganese',
    category: 'mineral',
    dailyValue: 2.3,
    unit: 'mg',
    aliases: ['manganese_mg', 'manganese'],
  },
  chromium: {
    name: 'Chromium',
    category: 'mineral',
    dailyValue: 35,
    unit: 'mcg',
    aliases: ['chromium_mcg', 'chromium'],
  },
  iodine: {
    name: 'Iodine',
    category: 'mineral',
    dailyValue: 150,
    unit: 'mcg',
    aliases: ['iodine_mcg', 'iodine'],
  },
  molybdenum: {
    name: 'Molybdenum',
    category: 'mineral',
    dailyValue: 45,
    unit: 'mcg',
    aliases: ['molybdenum_mcg', 'molybdenum'],
  },
  fiber: {
    name: 'Dietary Fiber',
    category: 'macronutrient',
    dailyValue: 28,
    unit: 'g',
    aliases: ['fiber_g', 'fiber', 'dietary_fiber', 'fiberG'],
  },
};

/**
 * Normalizes any arbitrary nutrient string key (e.g. "calcium_mg", "Calcium", "calciumMg")
 * to its matched FDA/NIH Daily Value reference.
 */
export function findNutrientReference(rawKey: string): NutrientReference | null {
  const normalizedKey = rawKey.toLowerCase().replace(/[^a-z0-9]/g, '');

  for (const [key, ref] of Object.entries(DAILY_NUTRIENT_REQUIREMENTS)) {
    if (key.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedKey) {
      return ref;
    }
    for (const alias of ref.aliases) {
      if (alias.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedKey) {
        return ref;
      }
    }
  }

  return null;
}

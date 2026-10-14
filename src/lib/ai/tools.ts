import { AIToolDefinition } from './provider';

export const calflowTools: AIToolDefinition[] = [
  {
    type: 'function',
    function: {
      name: 'log_meal',
      description: 'Log a meal with items and conservative, realistic nutrition estimates (specifically avoiding protein overestimation)',
      parameters: {
        type: 'object',
        properties: {
          date: { type: 'string', description: 'YYYY-MM-DD. ALWAYS OMIT this field to default to the current date (today), unless the user explicitly specifies a different date (e.g. yesterday, Monday).' },
          meal_type: { type: 'string', enum: ['breakfast', 'lunch', 'dinner', 'snack'] },
          description: { type: 'string' },
          calories: { type: 'number', description: 'Total realistic calories estimated, accounting for cooking oils/fats' },
          protein_g: { type: 'number', description: 'Conservative, realistic protein in grams. DO NOT overestimate; reference USDA cooked portion standards (e.g., egg ~6g, 100g cooked chicken breast ~31g, 1 cup cooked dal ~15-18g).' },
          carbs_g: { type: 'number', description: 'Total realistic carbs in grams estimated' },
          fat_g: { type: 'number', description: 'Total realistic fat in grams estimated, including cooking fats' },
          fiber_g: { type: 'number', description: 'Total realistic fiber in grams estimated' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                food_name: { type: 'string' },
                quantity: { type: 'number' },
                unit: { type: 'string' },
                estimated_calories: { type: 'number' },
                estimated_protein: { type: 'number', description: 'Conservative, realistic protein in grams for this item' },
                estimated_carbs: { type: 'number' },
                estimated_fat: { type: 'number' },
                estimated_fiber: { type: 'number' },
                micronutrients: { type: 'object' }
              }
            }
          },
          estimated_total: {
            type: 'object',
            properties: {
              calories: { type: 'number' },
              protein_g: { type: 'number', description: 'Conservative, realistic total protein in grams' },
              carbs_g: { type: 'number' },
              fat_g: { type: 'number' },
              fiber_g: { type: 'number' }
            }
          },
          micronutrients: { type: 'object', description: 'Complete realistic vitamins and minerals based on USDA standards' },
          confidence: { type: 'string', enum: ['low', 'medium', 'high'] }
        },
        required: ['description']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_today_summary',
      description: "Get today's complete nutrition summary including targets, consumed, and remaining",
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_meals',
      description: 'Get meals for a specific date or date range',
      parameters: {
        type: 'object',
        properties: {
          date: { type: 'string', description: 'YYYY-MM-DD. ALWAYS OMIT this field to use today unless explicitly requested.' },
          start_date: { type: 'string', description: 'YYYY-MM-DD' },
          end_date: { type: 'string', description: 'YYYY-MM-DD' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'update_meal',
      description: 'Update an existing meal entry. Use this instead of log_meal when modifying a previously logged meal. First call get_meals to find the meal_id.',
      parameters: {
        type: 'object',
        properties: {
          meal_id: { type: 'string', description: 'The ID of the meal to update (get this from get_meals response)' },
          updates: {
            type: 'object',
            description: 'Fields to update on the meal',
            properties: {
              description: { type: 'string', description: 'Updated meal description' },
              meal_type: { type: 'string', enum: ['breakfast', 'lunch', 'dinner', 'snack'] },
              estimated_calories: { type: 'number', description: 'Updated realistic total calories' },
              estimated_protein: { type: 'number', description: 'Updated conservative, realistic protein in grams. DO NOT overestimate.' },
              estimated_carbs: { type: 'number', description: 'Updated realistic carbohydrates in grams' },
              estimated_fat: { type: 'number', description: 'Updated realistic fat in grams, accounting for oils' },
              estimated_fiber: { type: 'number', description: 'Updated realistic fiber in grams' },
              micronutrients: { type: 'object', description: 'Updated realistic micronutrients dictionary' },
              items: {
                type: 'array',
                description: 'Replaces all items on the meal',
                items: {
                  type: 'object',
                  properties: {
                    food_name: { type: 'string' },
                    quantity: { type: 'number' },
                    unit: { type: 'string' },
                    estimated_calories: { type: 'number' },
                    estimated_protein: { type: 'number', description: 'Conservative, realistic protein in grams for this item' },
                    estimated_carbs: { type: 'number' },
                    estimated_fat: { type: 'number' },
                    estimated_fiber: { type: 'number' },
                    micronutrients: { type: 'object' }
                  }
                }
              }
            }
          }
        },
        required: ['meal_id', 'updates']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'delete_meal',
      description: 'Delete a meal',
      parameters: {
        type: 'object',
        properties: {
          meal_id: { type: 'string' }
        },
        required: ['meal_id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_user_profile',
      description: "Get the user's profile including preferences, allergies, etc.",
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_nutrition_goals',
      description: "Get the user's current nutrition targets",
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'update_nutrition_goals',
      description: 'Update nutrition targets',
      parameters: {
        type: 'object',
        properties: {
          calorie_target: { type: 'number' },
          protein_target: { type: 'number' },
          carbohydrate_target: { type: 'number' },
          fat_target: { type: 'number' },
          fiber_target: { type: 'number' },
          water_target_ml: { type: 'number' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_nutrition_gaps',
      description: 'Get the difference between target and current intake for today',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_nutrition_summary',
      description: 'Get nutrition statistics for a date range',
      parameters: {
        type: 'object',
        properties: {
          start_date: { type: 'string' },
          end_date: { type: 'string' }
        },
        required: ['start_date', 'end_date']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'log_water',
      description: 'Log water intake',
      parameters: {
        type: 'object',
        properties: {
          amount_ml: { type: 'number' },
          date: { type: 'string', description: 'YYYY-MM-DD. ALWAYS OMIT to use today unless explicitly requested.' }
        },
        required: ['amount_ml']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_water_summary',
      description: 'Get water intake summary',
      parameters: {
        type: 'object',
        properties: {
          date: { type: 'string' },
          start_date: { type: 'string' },
          end_date: { type: 'string' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'log_weight',
      description: 'Log weight',
      parameters: {
        type: 'object',
        properties: {
          weight_kg: { type: 'number' },
          date: { type: 'string', description: 'YYYY-MM-DD. OMIT to use today.' },
          note: { type: 'string' }
        },
        required: ['weight_kg']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_weight_history',
      description: 'Get weight history',
      parameters: {
        type: 'object',
        properties: {
          start_date: { type: 'string' },
          end_date: { type: 'string' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_insights',
      description: 'Get aggregated nutrition and health insights',
      parameters: {
        type: 'object',
        properties: {
          days: { type: 'number', description: 'Number of days, default 30' }
        }
      }
    }
  }
];

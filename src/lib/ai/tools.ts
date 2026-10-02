import { AIToolDefinition } from './provider';

export const calflowTools: AIToolDefinition[] = [
  {
    type: 'function',
    function: {
      name: 'log_meal',
      description: 'Log a meal with items and nutrition estimates',
      parameters: {
        type: 'object',
        properties: {
          date: { type: 'string', description: 'YYYY-MM-DD (defaults to today)' },
          meal_type: { type: 'string', enum: ['breakfast', 'lunch', 'dinner', 'snack'] },
          description: { type: 'string' },
          calories: { type: 'number', description: 'Total calories estimated' },
          protein_g: { type: 'number', description: 'Total protein in grams estimated' },
          carbs_g: { type: 'number', description: 'Total carbs in grams estimated' },
          fat_g: { type: 'number', description: 'Total fat in grams estimated' },
          fiber_g: { type: 'number', description: 'Total fiber in grams estimated' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                food_name: { type: 'string' },
                quantity: { type: 'number' },
                unit: { type: 'string' },
                estimated_calories: { type: 'number' },
                estimated_protein: { type: 'number' },
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
              protein_g: { type: 'number' },
              carbs_g: { type: 'number' },
              fat_g: { type: 'number' },
              fiber_g: { type: 'number' }
            }
          },
          micronutrients: { type: 'object' },
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
          date: { type: 'string', description: 'YYYY-MM-DD' },
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
      description: 'Update an existing meal',
      parameters: {
        type: 'object',
        properties: {
          meal_id: { type: 'string' },
          updates: { type: 'object' }
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
          date: { type: 'string', description: 'YYYY-MM-DD' }
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
          date: { type: 'string' },
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

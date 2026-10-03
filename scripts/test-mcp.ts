import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

// Must import after dotenv
import { createClient } from '@supabase/supabase-js';
import { createMeal, getMealsByDate, updateMeal, deleteMeal } from '../src/lib/services/meals.service';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function runTests() {
  console.log("=== CalFlow DB Service Test Script ===");
  
  let userId = '';
  const { data: users, error: userError } = await supabase.auth.admin.listUsers();
  if (userError || !users?.users?.length) {
    console.error("Failed to fetch users.");
    process.exit(1);
  }
  
  const testEmail = 'calflow@yopmail.com';
  const testUser = users.users.find(u => u.email === testEmail);
  
  if (testUser) {
    userId = testUser.id;
  } else {
    console.warn(`Warning: Test account '${testEmail}' not found. Falling back to the first available user.`);
    userId = users.users[0].id;
  }
  
  console.log(`Using Test User ID: ${userId} (${testUser ? testEmail : users.users[0].email})`);

  const today = new Date().toISOString().split('T')[0];

  try {
    console.log("\n1. Testing createMeal...");
    const meal = await createMeal(userId, {
      date: today,
      mealType: 'lunch',
      description: 'Grilled Chicken Salad with Quinoa',
      estimatedCalories: 650,
      estimatedProtein: 45,
      estimatedCarbs: 55,
      estimatedFat: 28,
      estimatedFiber: 12,
      micronutrients: {
        vitamin_a_mcg: 120,
        vitamin_c_mg: 45,
        calcium_mg: 150,
        iron_mg: 4.5,
        potassium_mg: 850
      },
      items: [
        { 
          foodName: 'Grilled Chicken Breast', 
          quantity: 150, 
          unit: 'g',
          estimatedCalories: 248, 
          estimatedProtein: 46,
          estimatedCarbs: 0,
          estimatedFat: 5,
          micronutrients: { iron_mg: 1.5, potassium_mg: 380 }
        },
        { 
          foodName: 'Cooked Quinoa', 
          quantity: 1, 
          unit: 'cup',
          estimatedCalories: 222, 
          estimatedProtein: 8,
          estimatedCarbs: 39,
          estimatedFat: 4,
          estimatedFiber: 5,
          micronutrients: { iron_mg: 2.8, magnesium_mg: 118 }
        },
        { 
          foodName: 'Mixed Greens', 
          quantity: 2, 
          unit: 'cups',
          estimatedCalories: 18, 
          estimatedProtein: 2,
          estimatedCarbs: 3,
          estimatedFat: 0,
          estimatedFiber: 2,
          micronutrients: { vitamin_a_mcg: 110, vitamin_c_mg: 30, calcium_mg: 60 }
        },
        { 
          foodName: 'Olive Oil Vinaigrette', 
          quantity: 2, 
          unit: 'tbsp',
          estimatedCalories: 162, 
          estimatedProtein: 0,
          estimatedCarbs: 13,
          estimatedFat: 19,
          micronutrients: {}
        }
      ]
    });
    console.log("✅ Created meal:", meal.id);
    console.log(`Summary: ${meal.description} (${meal.estimated_calories} kcal, ${meal.items.length} items)`);

    console.log("\n2. Testing getMealsByDate...");
    const meals = await getMealsByDate(userId, today);
    const fetchedMeal = meals.find((m: any) => m.id === meal.id);
    console.log("✅ Fetched meal found:", !!fetchedMeal);
    console.log(`Fetched Items Count: ${fetchedMeal?.items?.length}`);

    console.log("\n3. Testing updateMeal...");
    
    // Map the fetched DB items (snake_case) back to MealInput (camelCase) for the update
    const mappedExistingItems = meal.items.map((i: any) => ({
      foodName: i.food_name,
      quantity: i.quantity,
      unit: i.unit,
      estimatedCalories: i.estimated_calories,
      estimatedProtein: i.estimated_protein,
      estimatedCarbs: i.estimated_carbs,
      estimatedFat: i.estimated_fat,
      estimatedFiber: i.estimated_fiber,
      micronutrients: i.micronutrients
    }));

    const updated = await updateMeal(userId, meal.id, {
      description: 'Spicy Grilled Chicken Salad with Quinoa',
      estimatedCalories: 680,
      items: [
        ...mappedExistingItems,
        { 
          foodName: 'Jalapeno Slices', 
          quantity: 0.5, 
          unit: 'cup',
          estimatedCalories: 30, 
          estimatedProtein: 1,
          estimatedCarbs: 7,
          estimatedFat: 0,
          estimatedFiber: 3,
          micronutrients: { vitamin_c_mg: 15 }
        }
      ]
    });
    console.log("✅ Updated meal description:", updated.description);
    console.log(`Updated Items Count: ${updated.items?.length}`);

    console.log("\n4. Testing deleteMeal...");
    await deleteMeal(userId, meal.id);
    console.log("✅ Deleted meal");

    console.log("\n=== All Tests Passed ===");
  } catch (err) {
    console.error("❌ Test Failed:", err);
  }
}

runTests().catch(console.error);

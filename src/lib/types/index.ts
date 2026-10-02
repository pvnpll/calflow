export interface Micronutrients {
  calciumMg?: number;
  ironMg?: number;
  magnesiumMg?: number;
  potassiumMg?: number;
  vitaminCMg?: number;
  vitaminB12Mcg?: number;
  vitaminDMcg?: number;
  zincMg?: number;
  [key: string]: number | undefined;
}

export interface UserProfile {
  userId: string;
  name?: string;
  age?: number;
  sex?: string;
  heightCm?: number;
  currentWeightKg?: number;
  activityLevel?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  goal?: 'lose_weight' | 'maintain_weight' | 'gain_weight' | 'gain_muscle' | 'general_health';
  diet?: 'omnivore' | 'vegetarian' | 'vegan' | 'pescatarian' | 'keto' | 'paleo' | 'other';
  preferences?: string[];
  allergies?: string[];
  foodsToAvoid?: string[];
  preferredMealCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface NutritionGoals {
  id: string;
  userId: string;
  calorieTarget?: number;
  proteinTarget?: number;
  carbohydrateTarget?: number;
  fatTarget?: number;
  fiberTarget?: number;
  waterTargetMl?: number;
  micronutrientTargets?: Micronutrients;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Meal {
  id: string;
  userId: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description?: string;
  estimatedCalories?: number;
  estimatedProtein?: number;
  estimatedCarbs?: number;
  estimatedFat?: number;
  estimatedFiber?: number;
  micronutrients?: Micronutrients;
  source?: 'chatgpt' | 'web_app' | 'import';
  confidence?: 'low' | 'medium' | 'high';
  createdAt?: string;
  updatedAt?: string;
}

export interface MealItem {
  id: string;
  mealId: string;
  foodName: string;
  quantity?: number;
  unit?: string;
  estimatedCalories?: number;
  estimatedProtein?: number;
  estimatedCarbs?: number;
  estimatedFat?: number;
  estimatedFiber?: number;
  micronutrients?: Micronutrients;
}

export interface WaterLog {
  id: string;
  userId: string;
  date: string;
  amountMl: number;
  createdAt?: string;
}

export interface WeightLog {
  id: string;
  userId: string;
  date: string;
  weightKg: number;
  note?: string;
  createdAt?: string;
}

export interface AiInteraction {
  id: string;
  userId: string;
  action: string;
  metadata?: Record<string, any>;
  createdAt?: string;
}

export interface NutritionEstimate {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
}

export interface NutritionSummary {
  targets: NutritionEstimate;
  consumed: NutritionEstimate;
  remaining: NutritionEstimate;
}

export interface MealItemInput {
  foodName: string;
  quantity?: number;
  unit?: string;
  estimatedCalories?: number;
  estimatedProtein?: number;
  estimatedCarbs?: number;
  estimatedFat?: number;
  estimatedFiber?: number;
  micronutrients?: Micronutrients;
}

export interface MealInput {
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description?: string;
  estimatedCalories?: number;
  estimatedProtein?: number;
  estimatedCarbs?: number;
  estimatedFat?: number;
  estimatedFiber?: number;
  micronutrients?: Micronutrients;
  source?: 'chatgpt' | 'web_app' | 'import';
  confidence?: 'low' | 'medium' | 'high';
  items?: MealItemInput[];
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface InsightsData {
  // Add appropriate fields for insights
  [key: string]: any;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface ToolResponse<T> {
  result?: T;
  error?: string;
}

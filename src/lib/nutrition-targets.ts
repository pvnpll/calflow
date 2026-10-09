/**
 * Daily calorie / macro / fiber / water targets from a profile.
 *
 * Evidence base (each constant below cites its source):
 *  - Energy: Mifflin-St Jeor BMR (validated as most accurate predictive equation by the
 *    Academy of Nutrition and Dietetics, Frankenfield 2005) x standard activity factors.
 *  - Weight change: ~7,700 kcal per kg of body-weight change (=> ~1,100 kcal/day per kg/week).
 *    Loss is capped at ~1% body weight/week and 25% of TDEE (ACSM 2009; Garthe 2011; Helms 2014);
 *    intake never goes below 1,500 (M) / 1,200 (F) kcal (NIH / AND minimums).
 *  - Protein: g/kg of a reference weight. RDA 0.8 g/kg is a minimum for sedentary adults; exercising
 *    people 1.4-2.0 g/kg (ISSN 2017; ACSM/AND/DC 2016); muscle gain plateaus ~1.6 g/kg, upper CI 2.2
 *    (Morton 2018); higher intakes (1.8-2.2) protect lean mass in a deficit (Helms 2014); adults 65+
 *    need >= 1.2 g/kg (PROT-AGE 2013). Always kept inside the AMDR of 10-35% of calories (IOM 2005).
 *  - Fat: 25% of calories (IOM AMDR 20-35%, WHO 15-30%), never below 20% of calories or 0.6 g/kg.
 *  - Carbohydrate: remainder, never below the 130 g/day RDA (IOM 2005).
 *  - Fiber: 14 g per 1,000 kcal (IOM AI), at least 25 g/day.
 *  - Water (fluids from drinks): ~35 ml/kg, bounded below by ~80% of the EFSA total-water AI
 *    (1.6 L F / 2.0 L M) and above by 4 L; +500 ml for very/extremely active (ACSM hydration).
 *
 * Not validated for under-18s, pregnancy/lactation or medical conditions — those need professional advice.
 */

// Standard activity factors applied to BMR.
const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extremely_active: 1.9,
};

const KCAL_PER_KG_PER_DAY = 7700 / 7; // ~1,100 kcal/day per 1 kg/week
const RATE_KG_PER_WEEK: Record<string, number> = { slow: 0.25, moderate: 0.5, fast: 0.75 };

// Lean-gain surpluses (kcal/day) — ACSM/Helms: 250-500, smaller is better for natural lifters.
const MUSCLE_SURPLUS: Record<string, number> = { slow: 200, moderate: 300, fast: 450 };

// Protein g/kg when cutting — rises with the size of the deficit (Helms 2014; ISSN 2017).
const CUT_PROTEIN_G_PER_KG: Record<string, number> = { slow: 1.6, moderate: 1.8, fast: 2.0 };
// Protein g/kg for everyone else, by activity (RDA minimum -> ISSN exercising range).
const GENERAL_PROTEIN_G_PER_KG: Record<string, number> = {
  sedentary: 1.0,
  lightly_active: 1.2,
  moderately_active: 1.4,
  very_active: 1.6,
  extremely_active: 1.6,
};
const MUSCLE_PROTEIN_G_PER_KG = 1.8; // above Morton's 1.62 breakpoint, inside ISSN 1.4-2.0

const MIN_CARBS_G = 130;
const FAT_SHARE = 0.25;
const MIN_FAT_SHARE = 0.2;
const MAX_FAT_SHARE = 0.35;

export interface CalculatedTargets {
  calorieTarget: number;
  proteinTarget: number;
  carbohydrateTarget: number;
  fatTarget: number;
  fiberTarget: number;
  waterTargetMl: number;
}

/**
 * Protein/fat are scaled to a reference weight, not raw weight, for people with obesity
 * (BMI >= 30): the weight at BMI 25 plus 25% of the excess (adjusted body weight).
 */
function referenceWeightKg(weightKg: number, heightM: number): number {
  const bmi = weightKg / (heightM * heightM);
  if (bmi < 30) return weightKg;
  const healthy = 25 * heightM * heightM;
  return healthy + 0.25 * (weightKg - healthy);
}

export function calculateTargets(
  profile: any,
  goal: string = profile?.goal,
  rate: string = profile?.goal_rate,
): CalculatedTargets | null {
  if (!profile?.current_weight_kg || !profile?.height_cm || !profile?.age || !profile?.sex) {
    return null;
  }
  const weight = Number(profile.current_weight_kg);
  const heightCm = Number(profile.height_cm);
  const age = Number(profile.age);
  const isMale = profile.sex === 'male';
  const activity: string = profile.activity_level in ACTIVITY_MULTIPLIERS ? profile.activity_level : 'sedentary';
  const rateKey = rate in RATE_KG_PER_WEEK ? rate : 'moderate';
  const heightM = heightCm / 100;
  const bmi = weight / (heightM * heightM);

  // --- Energy ---
  const bmr = 10 * weight + 6.25 * heightCm - 5 * age + (isMale ? 5 : -161);
  const tdee = bmr * ACTIVITY_MULTIPLIERS[activity];
  const minIntake = isMale ? 1500 : 1200;

  let calories = tdee;
  // A deficit is never prescribed to someone who is already underweight.
  const effectiveGoal = goal === 'lose_weight' && bmi < 18.5 ? 'maintain_weight' : goal;
  if (effectiveGoal === 'lose_weight') {
    const wanted = RATE_KG_PER_WEEK[rateKey] * KCAL_PER_KG_PER_DAY;
    const maxDeficit = Math.min(0.25 * tdee, 0.01 * weight * KCAL_PER_KG_PER_DAY);
    calories = Math.max(tdee - Math.min(wanted, maxDeficit), minIntake);
  } else if (effectiveGoal === 'gain_muscle') {
    calories = tdee + Math.min(MUSCLE_SURPLUS[rateKey], 0.15 * tdee);
  } else if (effectiveGoal === 'gain_weight') {
    const wanted = RATE_KG_PER_WEEK[rateKey] * KCAL_PER_KG_PER_DAY;
    calories = tdee + Math.min(wanted, 0.2 * tdee);
  }
  calories = Math.round(calories);

  // --- Protein ---
  const ref = referenceWeightKg(weight, heightM);
  let proteinPerKg =
    effectiveGoal === 'lose_weight' ? CUT_PROTEIN_G_PER_KG[rateKey]
    : effectiveGoal === 'gain_muscle' ? MUSCLE_PROTEIN_G_PER_KG
    // In a surplus, >= 1.6 g/kg (Morton 2018) steers the gain toward lean mass.
    : effectiveGoal === 'gain_weight' ? Math.max(GENERAL_PROTEIN_G_PER_KG[activity], 1.6)
    : GENERAL_PROTEIN_G_PER_KG[activity];
  const minPerKg = age >= 65 ? 1.2 : 0.8;
  proteinPerKg = Math.max(proteinPerKg, minPerKg);

  const proteinFloor = Math.max(minPerKg * ref, 0.1 * calories / 4);
  const proteinCeiling = Math.min(2.2 * ref, 0.35 * calories / 4);
  let protein = Math.min(Math.max(proteinPerKg * ref, proteinFloor), Math.max(proteinCeiling, proteinFloor));

  // --- Fat ---
  const fatFloor = Math.max(MIN_FAT_SHARE * calories / 9, 0.6 * ref);
  let fat = Math.min(Math.max(FAT_SHARE * calories / 9, fatFloor), MAX_FAT_SHARE * calories / 9);

  // --- Carbohydrate: remainder, with the 130 g minimum protected ---
  let carbs = (calories - protein * 4 - fat * 9) / 4;
  if (carbs < MIN_CARBS_G) {
    // Free calories from fat first (down to its floor), then from protein (down to its floor).
    let shortfall = (MIN_CARBS_G - carbs) * 4;
    const fatRoom = Math.max(0, (fat - fatFloor) * 9);
    const fatCut = Math.min(shortfall, fatRoom);
    fat -= fatCut / 9;
    shortfall -= fatCut;
    const proteinRoom = Math.max(0, (protein - proteinFloor) * 4);
    protein -= Math.min(shortfall, proteinRoom) / 4;
    carbs = Math.max(0, (calories - protein * 4 - fat * 9) / 4);
  }

  // --- Fiber & water ---
  const fiber = Math.max(25, (calories / 1000) * 14);
  let waterMl = weight * 35;
  waterMl = Math.min(Math.max(waterMl, isMale ? 2000 : 1600), 4000);
  if (activity === 'very_active' || activity === 'extremely_active') waterMl += 500;

  return {
    calorieTarget: calories,
    proteinTarget: Math.round(protein),
    carbohydrateTarget: Math.round(carbs),
    fatTarget: Math.round(fat),
    fiberTarget: Math.round(fiber),
    waterTargetMl: Math.round(waterMl / 50) * 50,
  };
}

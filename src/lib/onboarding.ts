/**
 * A profile is "onboarded" once it has what the target calculator needs plus a goal.
 * The dashboard layout sends anyone without this to /onboarding.
 */
export function isOnboardingComplete(profile: any): boolean {
  return !!(
    profile &&
    profile.age &&
    profile.sex &&
    profile.height_cm &&
    profile.current_weight_kg &&
    profile.goal
  );
}

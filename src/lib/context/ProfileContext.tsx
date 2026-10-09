'use client';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface ProfileContextValue {
  profile: any;
  goals: any;
  latestWeightKg: number | null;
  loading: boolean;
  refresh: () => void;
  refreshSilent: () => void;
}

const ProfileContext = createContext<ProfileContextValue>({
  profile: null,
  goals: null,
  latestWeightKg: null,
  loading: true,
  refresh: () => {},
  refreshSilent: () => {},
});

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<any>(null);
  const [goals, setGoals] = useState<any>(null);
  const [latestWeightKg, setLatestWeightKg] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/profile/full');
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        setGoals(data.goals);
        setLatestWeightKg(
          typeof data.latestWeightKg === 'number' ? data.latestWeightKg : null
        );
      }
    } catch (err) {
      console.error('ProfileContext fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Same fetch but without touching `loading` — no skeleton flash, no remount.
  const fetchSilent = useCallback(async () => {
    try {
      const res = await fetch('/api/profile/full');
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        setGoals(data.goals);
        setLatestWeightKg(
          typeof data.latestWeightKg === 'number' ? data.latestWeightKg : null
        );
      }
    } catch (err) {
      console.error('ProfileContext silent fetch failed:', err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <ProfileContext.Provider value={{ profile, goals, latestWeightKg, loading, refresh: fetchData, refreshSilent: fetchSilent }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}

'use client';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface ProfileContextValue {
  profile: any;
  goals: any;
  loading: boolean;
  refresh: () => void;
}

const ProfileContext = createContext<ProfileContextValue>({
  profile: null,
  goals: null,
  loading: true,
  refresh: () => {},
});

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<any>(null);
  const [goals, setGoals] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [profileRes, goalsRes] = await Promise.all([
        fetch('/api/profile'),
        fetch('/api/goals'),
      ]);
      if (profileRes.ok) setProfile(await profileRes.json());
      if (goalsRes.ok) setGoals(await goalsRes.json());
    } catch (err) {
      console.error('ProfileContext fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <ProfileContext.Provider value={{ profile, goals, loading, refresh: fetchData }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}

'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProfileForm from "@/components/profile/ProfileForm";
import GoalsForm from "@/components/profile/GoalsForm";
import PreferencesForm from "@/components/profile/PreferencesForm";
import ProfileOverview from "@/components/profile/ProfileOverview";
import { ProfileProvider, useProfile } from "@/lib/context/ProfileContext";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { User as UserIcon, Target, SlidersHorizontal, Settings2, Mail, ShieldAlert, Trash2, Loader2, BadgeCheck, LogOut, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type Section = 'personal' | 'goals' | 'preferences' | 'account';

const SECTION_META: Record<Section, { title: string; description: string }> = {
  personal: { title: 'Personal Info', description: 'Used to calculate your calories, macros and water targets.' },
  goals: { title: 'Goals & Targets', description: 'Your goal, pace and daily nutrition targets.' },
  preferences: { title: 'Food Preferences', description: 'Guides AI meal suggestions and plans.' },
  account: { title: 'Account', description: 'Sign-in details and danger zone.' },
};

function AccountTabContent() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) setEmail(user.email);
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-primary/10 p-2">
              <Mail className="h-4 w-4 text-primary" />
            </span>
            <div>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your sign-in details for CalFlow</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border bg-muted/30 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email address</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              {loading ? (
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                </span>
              ) : email ? (
                <>
                  <span className="text-sm font-semibold break-all">{email}</span>
                  <Badge variant="secondary" className="gap-1 text-[11px]">
                    <BadgeCheck className="h-3 w-3" /> Verified
                  </Badge>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">No email found</span>
              )}
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" onClick={handleLogout} className="w-full sm:w-auto">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/25 bg-destructive/[0.04] shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-destructive/10 p-2">
              <ShieldAlert className="h-4 w-4 text-destructive" />
            </span>
            <div>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions — proceed with care</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Permanently delete your account and all associated meals, weights and goals.
          </p>
          <Button variant="destructive" size="sm" className="w-full shrink-0 sm:w-auto">
            <Trash2 className="h-4 w-4" /> Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileTabs() {
  const { loading } = useProfile();
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [editSection, setEditSection] = useState<Section>('personal');

  const openEdit = (section: Section) => {
    setEditSection(section);
    setMode('edit');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-11 w-full rounded-xl" />
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-full rounded-lg" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---- View mode: single-page overview with one edit entry point ----
  if (mode === 'view') {
    return <ProfileOverview onEdit={openEdit} />;
  }

  // ---- Edit mode: your existing sections (same forms, tab layout fixed) ----
  const meta = SECTION_META[editSection];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={() => setMode('view')} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" /> Back to profile
        </Button>
        <span className="truncate text-xs text-muted-foreground">{meta.title}</span>
      </div>

      <div>
        <h2 className="text-lg font-bold tracking-tight">{meta.title}</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">{meta.description}</p>
      </div>

      <Tabs value={editSection} onValueChange={(v) => setEditSection(v as Section)} className="w-full">
        <TabsList className="grid h-auto w-full grid-cols-4 gap-1 p-1">
          <TabsTrigger value="personal" className="gap-1.5 px-1 py-2 text-[13px]">
            <UserIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Personal</span>
          </TabsTrigger>
          <TabsTrigger value="goals" className="gap-1.5 px-1 py-2 text-[13px]">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Goals</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-1.5 px-1 py-2 text-[13px]">
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Preferences</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="gap-1.5 px-1 py-2 text-[13px]">
            <Settings2 className="h-4 w-4" />
            <span className="hidden sm:inline">Account</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-4">
          <ProfileForm />
        </TabsContent>

        <TabsContent value="goals" className="mt-4">
          <GoalsForm />
        </TabsContent>

        <TabsContent value="preferences" className="mt-4">
          <PreferencesForm />
        </TabsContent>

        <TabsContent value="account" className="mt-4">
          <AccountTabContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 pb-8">
      {/* Single fetch, shared across all tabs via context */}
      <ProfileProvider>
        <ProfileTabs />
      </ProfileProvider>
    </div>
  );
}

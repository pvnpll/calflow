'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileForm from "@/components/profile/ProfileForm";
import GoalsForm from "@/components/profile/GoalsForm";
import PreferencesForm from "@/components/profile/PreferencesForm";
import { ProfileProvider } from "@/lib/context/ProfileContext";

export default function ProfilePage() {
  return (
    <div className="container mx-auto p-4 max-w-3xl space-y-6 pb-24">
      <h1 className="text-2xl font-bold">Profile & Settings</h1>

      {/* Single fetch, shared across all tabs via context */}
      <ProfileProvider>
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="mt-6">
            <ProfileForm />
          </TabsContent>

          <TabsContent value="goals" className="mt-6">
            <GoalsForm />
          </TabsContent>

          <TabsContent value="preferences" className="mt-6">
            <PreferencesForm />
          </TabsContent>

          <TabsContent value="account" className="mt-6 space-y-6">
            <div className="p-4 border rounded-lg bg-card">
              <h3 className="text-lg font-medium mb-4">Account Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <div className="mt-1">user@example.com</div>
                </div>
              </div>
            </div>

            <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
              <h3 className="text-lg font-medium text-destructive mb-4">Danger Zone</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Permanently delete your account and all associated data.
              </p>
              <button className="text-sm font-medium text-destructive hover:underline">
                Delete Account
              </button>
            </div>
          </TabsContent>
        </Tabs>
      </ProfileProvider>
    </div>
  );
}

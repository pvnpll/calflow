import { redirect } from 'next/navigation';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AuthorizePage(props: { searchParams: Promise<Record<string, string | undefined>> }) {
  const searchParams = await props.searchParams;
  const client_id = searchParams.client_id;
  const redirect_uri = searchParams.redirect_uri;
  const state = searchParams.state;

  if (!client_id || !redirect_uri) {
    return (
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Invalid Request</CardTitle>
          <CardDescription>Missing client_id or redirect_uri.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Redirect to login with return path
    const returnUrl = encodeURIComponent(`/mcp/authorize?client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&state=${state || ''}`);
    redirect(`/login?return_to=${returnUrl}`);
  }

  async function authorize() {
    'use server';
    const supabaseServer = await createClient();
    const { data: { user } } = await supabaseServer.auth.getUser();
    
    if (!user) {
      throw new Error("Unauthorized");
    }

    // Generate auth code
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const code = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Store in DB using service role to bypass RLS
    const admin = createAdminClient();

    const { TABLES } = await import('@/lib/db-tables');
    await admin.from(TABLES.MCP_AUTH_CODES).insert({
      code,
      user_id: user.id,
      client_id,
      redirect_uri
    });

    const redirectUrl = new URL(redirect_uri as string);
    redirectUrl.searchParams.set('code', code);
    if (state) {
      redirectUrl.searchParams.set('state', state as string);
    }
    
    redirect(redirectUrl.toString());
  }

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Connect Application</CardTitle>
        <CardDescription>
          An application is requesting access to your CalFlow account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">
          This will allow the app to view your nutrition goals, log meals, and retrieve your meal history.
        </p>
        <p className="text-sm mt-4 text-muted-foreground">
          Connected as: {user.email}
        </p>
      </CardContent>
      <CardFooter>
        <form action={authorize} className="w-full">
          <Button type="submit" className="w-full">Authorize</Button>
        </form>
      </CardFooter>
    </Card>
  );
}

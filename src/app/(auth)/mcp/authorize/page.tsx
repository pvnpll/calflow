import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { randomBytes } from 'crypto';

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
    const code = randomBytes(32).toString('hex');
    
    // Store in DB using service role to bypass RLS, or we can just use the user's session if RLS allows.
    // Wait, the migration didn't add an insert policy. Let's just use service role client.
    const { createClient: createAdmin } = await import('@supabase/supabase-js');
    const admin = createAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await admin.from('mcp_auth_codes').insert({
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
        <CardTitle>Connect to Claude</CardTitle>
        <CardDescription>
          Claude is requesting access to your CalFlow account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">
          This will allow Claude to view your nutrition goals, log meals, and retrieve your meal history.
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

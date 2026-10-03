import { createClient } from "@supabase/supabase-js";
import { readFileSync } from 'fs';
import * as dotenv from 'dotenv';
const env = dotenv.parse(readFileSync('.env.local'));

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const { data, error } = await supabase.from('cf_meals').select('*').order('created_at', { ascending: false }).limit(5);
  console.log(JSON.stringify(data, null, 2));
}
main();

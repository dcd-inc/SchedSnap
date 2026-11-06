import { readFileSync } from 'node:fs';
import postgres from 'postgres';

export function connectCreatorDatabase(env) {
  const url = new URL(env.SUPABASE_DB_URL);
  for (const parameter of ['ssl', 'sslmode', 'sslrootcert', 'sslnegotiation']) url.searchParams.delete(parameter);
  const ca = readFileSync(new URL('../supabase/prod-ca-2021.crt', import.meta.url));
  return postgres(url.toString(), {
    ssl: { ca, servername: url.hostname, rejectUnauthorized: true },
    prepare: false,
    max: 2,
    idle_timeout: 20,
    connect_timeout: 6,
    connection: { statement_timeout: 5000 },
  });
}

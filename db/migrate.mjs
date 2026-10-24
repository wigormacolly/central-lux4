// Aplica db/migrations/*.sql em ordem, uma única vez cada, dentro de transação.
import postgres from 'postgres';
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const url = process.env.DATABASE_URL;
if (!url) { console.error('[migrate] DATABASE_URL ausente. Recusando subir.'); process.exit(1); }
const sql = postgres(url, { max: 1, onnotice: () => {} });
const dir = join(dirname(fileURLToPath(import.meta.url)), 'migrations');

try {
  await sql`create table if not exists _migracao (nome text primary key, aplicada_em timestamptz not null default now())`;
  const feitas = new Set((await sql`select nome from _migracao`).map(r => r.nome));
  for (const arq of readdirSync(dir).filter(f => f.endsWith('.sql')).sort()) {
    if (feitas.has(arq)) continue;
    const texto = readFileSync(join(dir, arq), 'utf8');
    await sql.begin(async tx => {
      await tx.unsafe(texto);
      await tx`insert into _migracao (nome) values (${arq})`;
    });
    console.log(`[migrate] aplicada ${arq}`);
  }
  console.log('[migrate] banco em dia');
} catch (e) {
  console.error('[migrate] falhou:', e.message);
  process.exit(1);
} finally {
  await sql.end();
}

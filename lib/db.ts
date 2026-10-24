import postgres from 'postgres';

declare global { var __sql: ReturnType<typeof postgres> | undefined }

function criar() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL ausente');
  return postgres(url, { max: 10, idle_timeout: 30, onnotice: () => {} });
}

/** Conexão única por processo. */
export function db() {
  if (!globalThis.__sql) globalThis.__sql = criar();
  return globalThis.__sql;
}

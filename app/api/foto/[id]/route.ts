import { db } from '@/lib/db';
import { usuarioAtual } from '@/lib/auth';

// Foto de perfil. Só para quem está logado.
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await usuarioAtual())) return new Response(null, { status: 401 });
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response(null, { status: 404 });
  const [r] = await db()<{ foto: Buffer | null }[]>`select foto from usuario where id = ${id}`;
  if (!r?.foto) return new Response(null, { status: 404 });
  return new Response(new Uint8Array(r.foto), {
    headers: { 'content-type': 'image/jpeg', 'cache-control': 'private, max-age=31536000, immutable', 'x-content-type-options': 'nosniff' },
  });
}

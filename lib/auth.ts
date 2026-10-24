import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { db } from './db';

export const COOKIE = 'central_sessao';
const DIAS_SESSAO = 30;

export type Usuario = { id: string; nome: string; email: string; papel: 'admin' | 'membro' };

export const hashToken = (t: string) => createHash('sha256').update(t).digest('hex');
export const novoToken = () => randomBytes(32).toString('base64url');

export async function hashSenha(senha: string) { return bcrypt.hash(senha, 12); }
export async function confereSenha(senha: string, hash: string) { return bcrypt.compare(senha, hash); }

export function senhaValida(s: string) { return typeof s === 'string' && s.length >= 10 && s.length <= 200; }

export function iguais(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export async function abrirSessao(usuarioId: string) {
  const token = novoToken();
  const expira = new Date(Date.now() + DIAS_SESSAO * 864e5);
  await db()`insert into sessao (token_hash, usuario_id, expira_em) values (${hashToken(token)}, ${usuarioId}, ${expira})`;
  (await cookies()).set(COOKIE, token, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', expires: expira,
  });
}

export async function fecharSessao() {
  const jar = await cookies();
  const t = jar.get(COOKIE)?.value;
  if (t) await db()`delete from sessao where token_hash = ${hashToken(t)}`;
  jar.delete(COOKIE);
}

/** Usuário da sessão, ou null. Em dúvida, nega. */
export async function usuarioAtual(): Promise<Usuario | null> {
  const t = (await cookies()).get(COOKIE)?.value;
  if (!t) return null;
  try {
    const [u] = await db()<Usuario[]>`
      select u.id, u.nome, u.email, u.papel from sessao s join usuario u on u.id = s.usuario_id
      where s.token_hash = ${hashToken(t)} and s.expira_em > now() and u.ativo`;
    return u ?? null;
  } catch { return null; }
}

export async function exigirUsuario(): Promise<Usuario> {
  const u = await usuarioAtual();
  if (!u) redirect('/login');
  return u;
}

export async function exigirAdmin(): Promise<Usuario> {
  const u = await exigirUsuario();
  if (u.papel !== 'admin') redirect('/');
  return u;
}

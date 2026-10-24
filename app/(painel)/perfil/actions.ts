'use server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { exigirUsuario } from '@/lib/auth';

const MAX = 300 * 1024;

/** Salva a foto. Cada pessoa troca a própria; admin pode trocar a de qualquer um. */
export async function salvarFoto(alvo: string, dataUrl: string): Promise<{ erro?: string }> {
  const u = await exigirUsuario();
  if (alvo !== u.id && u.papel !== 'admin') return { erro: 'Sem permissão.' };
  const m = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(String(dataUrl));
  if (!m) return { erro: 'Formato inválido.' };
  const buf = Buffer.from(m[1], 'base64');
  if (buf.length > MAX || buf[0] !== 0xff || buf[1] !== 0xd8) return { erro: 'Imagem inválida ou grande demais.' };
  await db()`update usuario set foto = ${buf}, foto_em = now() where id = ${alvo}`;
  revalidatePath('/', 'layout');
  return {};
}

export async function removerFoto(alvo: string) {
  const u = await exigirUsuario();
  if (alvo !== u.id && u.papel !== 'admin') return;
  await db()`update usuario set foto = null, foto_em = null where id = ${alvo}`;
  revalidatePath('/', 'layout');
}

export async function salvarNome(fd: FormData) {
  const u = await exigirUsuario();
  const nome = String(fd.get('nome') ?? '').trim().slice(0, 80);
  if (!nome) return;
  await db()`update usuario set nome = ${nome} where id = ${u.id}`;
  revalidatePath('/', 'layout');
}

'use server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { abrirSessao, hashSenha, hashToken, senhaValida } from '@/lib/auth';

export type Estado = { erro?: string };

export async function aceitar(token: string, _: Estado, fd: FormData): Promise<Estado> {
  const senha = String(fd.get('senha') ?? '');
  const conf = String(fd.get('confirmacao') ?? '');
  if (!senhaValida(senha)) return { erro: 'A senha precisa ter pelo menos 10 caracteres.' };
  if (senha !== conf) return { erro: 'As duas senhas não são iguais.' };
  const sql = db();
  const id = await sql.begin(async tx => {
    const [c] = await tx<{ usuario_id: string }[]>`
      update convite set usado_em = now() where token_hash = ${hashToken(token)} and usado_em is null and expira_em > now() returning usuario_id`;
    if (!c) return null;
    await tx`update usuario set senha_hash = ${await hashSenha(senha)} where id = ${c.usuario_id}`;
    await tx`delete from sessao where usuario_id = ${c.usuario_id}`;
    return c.usuario_id;
  });
  if (!id) return { erro: 'Este convite expirou ou já foi usado. Peça um novo ao administrador.' };
  await abrirSessao(id);
  redirect('/');
}

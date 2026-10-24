'use server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { abrirSessao, confereSenha, fecharSessao } from '@/lib/auth';

export type Estado = { erro?: string; email?: string; n?: number };

export async function entrar(ant: Estado, fd: FormData): Promise<Estado> {
  const r = await tentar(fd);
  return { ...r, email: String(fd.get('email') ?? ''), n: (ant.n ?? 0) + 1 };
}

async function tentar(fd: FormData): Promise<Estado> {
  const email = String(fd.get('email') ?? '').trim().toLowerCase();
  const senha = String(fd.get('senha') ?? '');
  if (!email || !senha) return { erro: 'Preencha e-mail e senha.' };
  const [u] = await db()<{ id: string; senha_hash: string | null }[]>`
    select id, senha_hash from usuario where email = ${email} and ativo`;
  // compara mesmo sem usuário, para não revelar quem existe pelo tempo de resposta
  const ok = await confereSenha(senha, u?.senha_hash ?? '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvali');
  if (!u || !u.senha_hash || !ok) return { erro: 'E-mail ou senha incorretos.' };
  await abrirSessao(u.id);
  redirect('/');
}

export async function sair() { await fecharSessao(); redirect('/login'); }

'use server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { abrirSessao, hashSenha, iguais, senhaValida } from '@/lib/auth';

export type Estado = { erro?: string; nome?: string; email?: string; n?: number };

export async function criarPrimeiro(ant: Estado, fd: FormData): Promise<Estado> {
  const r = await criar(fd);
  return r ? { ...r, nome: String(fd.get('nome') ?? ''), email: String(fd.get('email') ?? ''), n: (ant.n ?? 0) + 1 } : {};
}

async function criar(fd: FormData): Promise<Estado | null> {
  const esperado = process.env.SETUP_TOKEN ?? '';
  if (esperado.length < 24) return { erro: 'SETUP_TOKEN não está configurado no servidor (mínimo de 24 caracteres).' };
  const codigo = String(fd.get('codigo') ?? '');
  if (!iguais(codigo, esperado)) return { erro: 'Código de primeiro acesso incorreto.' };
  const nome = String(fd.get('nome') ?? '').trim();
  const email = String(fd.get('email') ?? '').trim().toLowerCase();
  const senha = String(fd.get('senha') ?? '');
  if (!nome || !email.includes('@')) return { erro: 'Preencha nome e e-mail.' };
  if (!senhaValida(senha)) return { erro: 'A senha precisa ter pelo menos 10 caracteres.' };
  const sql = db();
  const id = await sql.begin(async tx => {
    const [{ n }] = await tx<{ n: number }[]>`select count(*)::int n from usuario`;
    if (n > 0) return null;
    const [u] = await tx<{ id: string }[]>`insert into usuario (nome, email, papel, senha_hash) values (${nome}, ${email}, 'admin', ${await hashSenha(senha)}) returning id`;
    return u.id;
  });
  if (!id) return { erro: 'O primeiro acesso já foi criado. Entre pela tela de login.' };
  await abrirSessao(id);
  redirect('/');
}

'use server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { exigirAdmin, hashToken, novoToken } from '@/lib/auth';

export type Estado = { erro?: string; link?: string; nome?: string };
const DIAS = 7;

async function gerarConvite(usuarioId: string) {
  const token = novoToken();
  await db()`delete from convite where usuario_id = ${usuarioId} and usado_em is null`;
  await db()`insert into convite (token_hash, usuario_id, expira_em) values (${hashToken(token)}, ${usuarioId}, ${new Date(Date.now() + DIAS * 864e5)})`;
  return `${process.env.APP_URL ?? ''}/convite/${token}`;
}

export async function convidar(_: Estado, fd: FormData): Promise<Estado> {
  await exigirAdmin();
  const nome = String(fd.get('nome') ?? '').trim();
  const email = String(fd.get('email') ?? '').trim().toLowerCase();
  const papel = fd.get('papel') === 'admin' ? 'admin' : 'membro';
  if (!nome || !email.includes('@')) return { erro: 'Preencha nome e e-mail.' };
  const [existe] = await db()`select 1 from usuario where email = ${email}`;
  if (existe) return { erro: 'Já existe alguém com este e-mail. Use "Novo convite" na lista.' };
  const [u] = await db()<{ id: string }[]>`insert into usuario (nome, email, papel) values (${nome}, ${email}, ${papel}) returning id`;
  const link = await gerarConvite(u.id);
  revalidatePath('/equipe');
  return { link, nome };
}

export async function novoConvite(usuarioId: string, _: Estado): Promise<Estado> {
  await exigirAdmin();
  const [u] = await db()<{ nome: string }[]>`select nome from usuario where id = ${usuarioId}`;
  if (!u) return { erro: 'Pessoa não encontrada.' };
  const link = await gerarConvite(usuarioId);
  return { link, nome: u.nome };
}

export async function alternarAtivo(usuarioId: string) {
  const eu = await exigirAdmin();
  if (eu.id === usuarioId) return;
  await db()`update usuario set ativo = not ativo where id = ${usuarioId}`;
  await db()`delete from sessao where usuario_id = ${usuarioId}`;
  revalidatePath('/equipe');
}

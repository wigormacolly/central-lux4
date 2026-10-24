'use server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { exigirAdmin } from '@/lib/auth';

export async function alternarAberta(slug: string) {
  await exigirAdmin();
  await db()`update pesquisa set aberta = not aberta where slug = ${slug}`;
  revalidatePath(`/pesquisas/${slug}`);
}

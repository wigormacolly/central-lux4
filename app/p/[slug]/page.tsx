import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { modelo } from '@/lib/pesquisas';
import Questionario from './questionario';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Lumen · Mari França' };

export default async function Publica({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [p] = await db()<{ modelo: string; aberta: boolean }[]>`select modelo, aberta from pesquisa where slug = ${slug}`;
  const m = p && modelo(p.modelo);
  if (!p || !m) notFound();
  return (
    <main className="wrap" style={{ maxWidth: 620, paddingTop: 28 }}>
      <div className="row" style={{ gap: 12, marginBottom: 28 }}>
        <span className="serif" style={{ fontSize: 30, letterSpacing: '.01em' }}>Lumen</span>
        <span style={{ borderLeft: '1px solid rgba(250,250,250,.5)', paddingLeft: 12, fontWeight: 300, color: 'rgba(250,250,250,.75)' }}>Mari França</span>
      </div>
      {p.aberta ? <Questionario slug={slug} modelo={m} /> : (
        <div className="stack"><h1>Esta pesquisa foi encerrada</h1><p className="muted">Obrigada pelo interesse. Fique de olho no grupo do Lumen.</p></div>
      )}
    </main>
  );
}

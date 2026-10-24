import { db } from '@/lib/db';
import { modelo } from '@/lib/pesquisas';

export const dynamic = 'force-dynamic';

export default async function Obrigado({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [p] = await db()<{ modelo: string }[]>`select modelo from pesquisa where slug = ${slug}`;
  const m = p ? modelo(p.modelo) : null;
  return (
    <main className="wrap" style={{ maxWidth: 620, paddingTop: '16vh' }}>
      <span className="serif" style={{ fontSize: 30 }}>Lumen</span>
      <h1 style={{ marginTop: 18 }}>{m?.encerramento.titulo ?? 'Obrigada por responder'}</h1>
      <p className="muted" style={{ maxWidth: 520 }}>{m?.encerramento.texto}</p>
    </main>
  );
}

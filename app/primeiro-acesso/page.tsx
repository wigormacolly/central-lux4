import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import Marca from '@/components/Marca';
import Form from './form';

export const dynamic = 'force-dynamic';

export default async function PrimeiroAcesso() {
  const [{ n }] = await db()<{ n: number }[]>`select count(*)::int n from usuario`;
  if (n > 0) redirect('/login');
  return (
    <main className="wrap" style={{ maxWidth: 440, paddingTop: '10vh' }}>
      <Marca />
      <div className="eyebrow" style={{ marginTop: 28 }}>Central de lançamento</div>
      <h1>Primeiro acesso</h1>
      <p className="muted small">Crie o acesso de administrador. Use o código definido em SETUP_TOKEN no EasyPanel. Depois disso esta página se fecha.</p>
      <Form />
    </main>
  );
}

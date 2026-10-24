import { redirect } from 'next/navigation';
import { usuarioAtual } from '@/lib/auth';
import Marca from '@/components/Marca';
import FormLogin from './form';

export const dynamic = 'force-dynamic';

export default async function Login() {
  if (await usuarioAtual()) redirect('/');
  return (
    <main className="wrap" style={{ maxWidth: 420, paddingTop: '14vh' }}>
      <Marca />
      <div className="eyebrow" style={{ marginTop: 28 }}>Central de lançamento</div>
      <h1>Entrar</h1>
      <FormLogin />
    </main>
  );
}

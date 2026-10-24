import { db } from '@/lib/db';
import { hashToken } from '@/lib/auth';
import Marca from '@/components/Marca';
import Form from './form';

export const dynamic = 'force-dynamic';

export default async function Convite({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const [c] = await db()<{ nome: string }[]>`
    select u.nome from convite c join usuario u on u.id = c.usuario_id
    where c.token_hash = ${hashToken(token)} and c.usado_em is null and c.expira_em > now() and u.ativo`;
  return (
    <main className="wrap" style={{ maxWidth: 440, paddingTop: '10vh' }}>
      <Marca />
      <div className="eyebrow" style={{ marginTop: 28 }}>Central de lançamento</div>
      {c ? (<>
        <h1>Olá, {c.nome.split(' ')[0]}</h1>
        <p className="muted small">Crie sua senha para entrar na central.</p>
        <Form token={token} />
      </>) : (<>
        <h1>Convite indisponível</h1>
        <p className="muted">Este convite expirou ou já foi usado. Peça um novo ao administrador.</p>
      </>)}
    </main>
  );
}

import { db } from '@/lib/db';
import { exigirUsuario } from '@/lib/auth';
import Avatar from '@/components/Avatar';
import FotoUpload from '@/components/FotoUpload';
import { Enviar } from '@/components/Auto';
import { removerFoto, salvarFoto, salvarNome } from './actions';

export default async function Perfil() {
  const u = await exigirUsuario();
  const [eu] = await db()<{ id: string; nome: string; email: string; foto_em: string | null }[]>`select id, nome, email, foto_em from usuario where id = ${u.id}`;
  return (
    <main className="stack">
      <div><div className="eyebrow">Perfil</div><h1>Meu perfil</h1></div>
      <div className="card stack" style={{ maxWidth: 560 }}>
        <div className="row" style={{ gap: 18 }}>
          <Avatar p={eu} tam={96} />
          <div className="stack" style={{ gap: 8 }}>
            <FotoUpload acao={salvarFoto.bind(null, eu.id)} rotulo={eu.foto_em ? 'Trocar foto' : 'Adicionar foto'} />
            {eu.foto_em && <form action={removerFoto.bind(null, eu.id)}><button className="btn ghost sm">Remover foto</button></form>}
          </div>
        </div>
        <p className="muted small" style={{ margin: 0 }}>A foto aparece nas demandas, no calendário e no conteúdo. Ela é recortada no centro em formato quadrado.</p>
        <form action={salvarNome} className="form">
          <label className="field"><span>Nome</span><input className="input" name="nome" defaultValue={eu.nome} required /></label>
          <label className="field"><span>E-mail</span><input className="input" value={eu.email} disabled /></label>
          <Enviar ghost>Salvar nome</Enviar>
        </form>
      </div>
    </main>
  );
}

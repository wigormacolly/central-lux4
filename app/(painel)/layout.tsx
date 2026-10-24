import Link from 'next/link';
import { exigirUsuario } from '@/lib/auth';
import { db } from '@/lib/db';
import { captacao, edicaoAtual, faseNo, fmt, hoje, type Fase } from '@/lib/central';
import { sair } from '../login/actions';
import Marca from '@/components/Marca';
import Nav from '@/components/Nav';
import Avatar from '@/components/Avatar';

export const dynamic = 'force-dynamic';

export default async function Painel({ children }: { children: React.ReactNode }) {
  const u = await exigirUsuario();
  const ed = await edicaoAtual();
  const [eu] = await db()<{ id: string; nome: string; foto_em: string | null }[]>`select id, nome, foto_em from usuario where id = ${u.id}`;
  const fases = await db()<Fase[]>`select id, nome, inicio, dias, cor from fase where edicao_id = ${ed.id} order by inicio`;
  const h = hoje(ed);
  const fase = faseNo(fases, h);
  const cap = captacao(fases);
  const antes = fases.length && h < Math.min(...fases.map(f => f.inicio));
  return (
    <div className="wrap">
      <header className="topo">
        <Link href="/" style={{ textDecoration: 'none' }}><Marca edicao="4ª edição" /></Link>
        <div className="chips">
          <span className="chip"><span className="vivo" />fase <b>{fase ? fase.nome : antes ? 'antes do planejamento' : 'encerrada'}</b></span>
          <span className="chip">evento <b>{fmt(ed, 0)}</b></span>
          <span className="chip">{h < 0 ? <>faltam <b>{-h} dias</b></> : h === 0 ? <b>é hoje</b> : <>evento <b>passou</b></>}</span>
          {cap && <span className="chip">captação <b>{Math.round((cap.fim - cap.ini) / 7)} semanas · {fmt(ed, cap.ini)} a {fmt(ed, cap.fim - 1)}</b></span>}
          <Link href="/perfil" className="eu" title="Meu perfil"><Avatar p={eu} tam={30} /></Link>
          <form action={sair}><button className="chip sair" title={u.email}>Sair</button></form>
        </div>
      </header>
      <Nav admin={u.papel === 'admin'} />
      {children}
      <footer className="row muted small" style={{ justifyContent: 'space-between', marginTop: 48, borderTop: '1px solid var(--line)', paddingTop: 14 }}>
        <span>Central de lançamento · método Bins</span><span>{u.nome}</span>
      </footer>
    </div>
  );
}

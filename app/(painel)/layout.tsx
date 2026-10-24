import Link from 'next/link';
import { exigirUsuario } from '@/lib/auth';
import { sair } from '../login/actions';
import Marca from '@/components/Marca';

export const dynamic = 'force-dynamic';

export default async function Painel({ children }: { children: React.ReactNode }) {
  const u = await exigirUsuario();
  return (
    <div className="wrap">
      <header className="row" style={{ justifyContent: 'space-between', paddingBlock: 6, marginBottom: 26 }}>
        <Link href="/" style={{ textDecoration: 'none' }}><Marca edicao="4ª edição" /></Link>
        <nav className="row" style={{ gap: 6 }} aria-label="Seções">
          <Link className="btn ghost" href="/">Início</Link>
          <Link className="btn ghost" href="/pesquisas">Pesquisas</Link>
          {u.papel === 'admin' && <Link className="btn ghost" href="/equipe">Equipe</Link>}
          <form action={sair}><button className="btn ghost" title={u.email}>Sair</button></form>
        </nav>
      </header>
      {children}
      <footer className="row muted small" style={{ justifyContent: 'space-between', marginTop: 48, borderTop: '1px solid var(--line)', paddingTop: 14 }}>
        <span>Central de lançamento · método Bins</span><span>{u.nome}</span>
      </footer>
    </div>
  );
}

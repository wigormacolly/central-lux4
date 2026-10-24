'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ABAS = [
  { href: '/', nome: 'Visão geral' },
  { href: '/calendario', nome: 'Calendário' },
  { href: '/demandas', nome: 'Demandas' },
  { href: '/conteudo', nome: 'Conteúdo' },
  { href: '/pesquisas', nome: 'Pesquisas' },
];

export default function Nav({ admin }: { admin: boolean }) {
  const p = usePathname();
  const abas = admin ? [...ABAS, { href: '/equipe', nome: 'Equipe' }] : ABAS;
  return (
    <nav className="tabs" aria-label="Seções da central">
      {abas.map(a => {
        const ativo = a.href === '/' ? p === '/' : p.startsWith(a.href);
        return <Link key={a.href} href={a.href} className="tab" aria-current={ativo ? 'page' : undefined}>{a.nome}</Link>;
      })}
    </nav>
  );
}

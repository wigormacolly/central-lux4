/* eslint-disable @next/next/no-img-element */
export type ComFoto = { id: string; nome: string; foto_em?: string | null };

/** Bolinha com a foto da pessoa; sem foto, as iniciais. */
export default function Avatar({ p, tam = 24, vazio = 'Sem responsável' }: { p: ComFoto | null | undefined; tam?: number; vazio?: string }) {
  const st = { width: tam, height: tam, fontSize: Math.round(tam * 0.42) };
  if (!p) return <span className="av vazio" style={st} title={vazio} aria-label={vazio}>–</span>;
  if (p.foto_em) return <img className="av" style={st} src={`/api/foto/${p.id}?v=${new Date(p.foto_em).getTime()}`} alt={p.nome} title={p.nome} />;
  const ini = p.nome.split(/\s+/).filter(Boolean).slice(0, 2).map(s => s[0]).join('').toUpperCase();
  return <span className="av" style={st} title={p.nome} aria-label={p.nome}>{ini}</span>;
}

/* eslint-disable @next/next/no-img-element */
export default function Marca({ edicao }: { edicao?: string }) {
  return (
    <div className="row" style={{ gap: 14 }}>
      <img src="/lux-mark.png" alt="Lux" style={{ height: 34, width: 'auto' }} />
      {edicao && <span style={{ borderLeft: '1px solid rgba(250,250,250,.5)', paddingLeft: 12, fontWeight: 300, fontSize: 18, color: 'rgba(250,250,250,.8)' }}>{edicao}</span>}
    </div>
  );
}

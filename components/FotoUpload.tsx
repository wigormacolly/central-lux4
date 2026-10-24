'use client';
import { useRef, useState, useTransition } from 'react';

/** Escolhe uma imagem, recorta no centro, reduz para 256 px e envia em JPEG. */
export default function FotoUpload({ acao, rotulo = 'Trocar foto' }: { acao: (dataUrl: string) => Promise<{ erro?: string } | void>; rotulo?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [erro, setErro] = useState('');
  const [pend, start] = useTransition();

  async function escolher(f: File | undefined) {
    setErro('');
    if (!f) return;
    if (!f.type.startsWith('image/')) return setErro('Escolha uma imagem.');
    try {
      const bmp = await createImageBitmap(f);
      const lado = Math.min(bmp.width, bmp.height), T = 256;
      const c = document.createElement('canvas'); c.width = T; c.height = T;
      c.getContext('2d')!.drawImage(bmp, (bmp.width - lado) / 2, (bmp.height - lado) / 2, lado, lado, 0, 0, T, T);
      const url = c.toDataURL('image/jpeg', 0.86);
      start(async () => { const r = await acao(url); if (r && r.erro) setErro(r.erro); });
    } catch { setErro('Não consegui ler essa imagem. Tente outra (JPG ou PNG).'); }
    if (ref.current) ref.current.value = '';
  }

  return (
    <span className="row" style={{ gap: 8 }}>
      <input ref={ref} type="file" accept="image/*" hidden onChange={e => escolher(e.target.files?.[0])} />
      <button type="button" className="btn ghost sm" disabled={pend} onClick={() => ref.current?.click()}>{pend ? 'Enviando' : rotulo}</button>
      {erro && <span className="err">{erro}</span>}
    </span>
  );
}

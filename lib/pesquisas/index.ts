import { z } from 'zod';
import type { Modelo, Pergunta } from './tipos';
import { lumen2026 } from './lumen-2026';

const MODELOS: Record<string, Modelo> = { [lumen2026.chave]: lumen2026 };
export function modelo(chave: string): Modelo | null { return MODELOS[chave] ?? null; }
export const perguntas = (m: Modelo): Pergunta[] => m.blocos.flatMap(b => b.perguntas);

/** Valida as respostas contra o modelo. Rejeita qualquer valor fora das opções. */
export function validador(m: Modelo) {
  const forma: Record<string, z.ZodTypeAny> = {};
  for (const p of perguntas(m)) {
    if (p.tipo === 'unica') {
      const s = z.enum(p.opcoes.map(o => o.v) as [string, ...string[]]);
      forma[p.id] = p.obrigatoria ? s : s.optional();
    } else if (p.tipo === 'multipla') {
      const s = z.object({
        marcadas: z.array(z.enum(p.opcoes.map(o => o.v) as [string, ...string[]])).max(p.opcoes.length),
        outro: z.string().trim().max(300).optional(),
      }).refine(x => !p.obrigatoria || x.marcadas.length > 0 || (x.outro ?? '').length > 0, 'Marque pelo menos uma opção');
      forma[p.id] = s;
    } else if (p.tipo === 'antes_depois') {
      const e = z.enum(p.opcoes.map(o => o.v) as [string, ...string[]]);
      forma[p.id] = z.object({ antes: e, hoje: e });
    } else if (p.tipo === 'texto') {
      const s = z.string().trim().max(p.max ?? 1000);
      forma[p.id] = p.obrigatoria ? s.min(2, 'Escreva sua resposta') : s.optional();
    } else if (p.tipo === 'contato') {
      forma[p.id] = z.object({
        depoimento: z.boolean(), conversa: z.boolean(),
        nome: z.string().trim().max(120).optional(),
        whatsapp: z.string().trim().max(30).regex(/^[\d\s()+-]*$/, 'WhatsApp inválido').optional(),
      });
    }
  }
  return z.object(forma).strict();
}

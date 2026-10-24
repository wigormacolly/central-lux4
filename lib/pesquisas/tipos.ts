export type Opcao = { v: string; r: string };
export type Pergunta =
  | { id: string; tipo: 'unica'; titulo: string; ajuda?: string; opcoes: Opcao[]; obrigatoria?: boolean }
  | { id: string; tipo: 'multipla'; titulo: string; ajuda?: string; opcoes: Opcao[]; obrigatoria?: boolean; outro?: boolean }
  | { id: string; tipo: 'antes_depois'; titulo: string; ajuda?: string; opcoes: Opcao[]; rotulos: [string, string]; obrigatoria?: boolean }
  | { id: string; tipo: 'texto'; titulo: string; ajuda?: string; obrigatoria?: boolean; max?: number }
  | { id: string; tipo: 'contato'; titulo: string; ajuda?: string };

export type Bloco = { titulo: string; perguntas: Pergunta[] };
export type Modelo = { chave: string; abertura: { titulo: string; texto: string }; blocos: Bloco[]; encerramento: { titulo: string; texto: string } };

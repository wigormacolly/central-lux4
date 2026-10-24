import type { Modelo, Opcao } from './tipos';

const ticket: Opcao[] = [
  { v: 'ate300', r: 'Até R$ 300' }, { v: '301-600', r: 'R$ 301 a R$ 600' }, { v: '601-1000', r: 'R$ 601 a R$ 1.000' },
  { v: '1001-2000', r: 'R$ 1.001 a R$ 2.000' }, { v: 'acima2000', r: 'Acima de R$ 2.000' },
];
const ensaios: Opcao[] = [
  { v: '0', r: 'Nenhum' }, { v: '1-2', r: '1 a 2' }, { v: '3-5', r: '3 a 5' }, { v: '6-10', r: '6 a 10' }, { v: '10+', r: 'Mais de 10' },
];

export const lumen2026: Modelo = {
  chave: 'lumen-2026',
  abertura: {
    titulo: 'Nos ajude a deixar o Lumen ainda melhor',
    texto: 'São 10 perguntas rápidas, cerca de 3 minutos. Responda pensando no seu dia a dia de verdade. Não existe resposta certa.',
  },
  blocos: [
    { titulo: 'Sobre você', perguntas: [
      { id: 'tempo_lumen', tipo: 'unica', obrigatoria: true, titulo: 'Há quanto tempo você está no Lumen?', opcoes: [
        { v: '<1m', r: 'Menos de 1 mês' }, { v: '1-3m', r: '1 a 3 meses' }, { v: '3-6m', r: '3 a 6 meses' }, { v: '>6m', r: 'Mais de 6 meses' } ] },
      { id: 'momento', tipo: 'unica', obrigatoria: true, titulo: 'Hoje a fotografia para você é…', opcoes: [
        { v: 'hobby', r: 'Hobby, ainda não cobro' }, { v: 'extra', r: 'Renda extra, tenho outra fonte principal' },
        { v: 'principal', r: 'Minha renda principal, trabalho sozinha(o)' }, { v: 'negocio', r: 'Meu negócio, tenho equipe ou estúdio' } ] },
    ]},
    { titulo: 'Seu resultado', perguntas: [
      { id: 'ticket', tipo: 'antes_depois', obrigatoria: true, titulo: 'Quanto você cobra por ensaio?', ajuda: 'Valor médio de um ensaio.', rotulos: ['Antes do Lumen', 'Hoje'], opcoes: ticket },
      { id: 'ensaios', tipo: 'antes_depois', obrigatoria: true, titulo: 'Quantos ensaios você faz por mês?', rotulos: ['Antes do Lumen', 'Hoje'], opcoes: ensaios },
    ]},
    { titulo: 'Seu tempo', perguntas: [
      { id: 'tempo_semana', tipo: 'unica', obrigatoria: true, titulo: 'Quanto tempo por semana você consegue dedicar ao Lumen?', opcoes: [
        { v: '<30min', r: 'Menos de 30 minutos' }, { v: '30-60min', r: '30 minutos a 1 hora' }, { v: '1-3h', r: '1 a 3 horas' }, { v: '>3h', r: 'Mais de 3 horas' } ] },
      { id: 'mais_usou', tipo: 'multipla', obrigatoria: true, titulo: 'O que você mais usou no Lumen?', ajuda: 'Pode marcar mais de uma.', opcoes: [
        { v: 'aulas', r: 'Aulas' }, { v: 'lives', r: 'Lives com a Mari' }, { v: 'comunidade', r: 'Comunidade' },
        { v: 'materiais', r: 'Materiais e modelos' }, { v: 'quase_nada', r: 'Quase não usei' } ] },
      { id: 'atrapalhou', tipo: 'multipla', obrigatoria: true, outro: true, titulo: 'O que mais atrapalhou você a aplicar?', ajuda: 'Pode marcar mais de uma.', opcoes: [
        { v: 'tempo', r: 'Falta de tempo para assistir' }, { v: 'comeco', r: 'Não saber por onde começar' },
        { v: 'muito_conteudo', r: 'Muito conteúdo' }, { v: 'olhar_caso', r: 'Precisar de alguém olhando o meu caso' },
        { v: 'aplicar_sozinha', r: 'Dificuldade de aplicar sozinha(o)' } ] },
    ]},
    { titulo: 'O que acelera', perguntas: [
      { id: 'uma_coisa_pronta', tipo: 'unica', obrigatoria: true, titulo: 'Se você pudesse ter uma coisa pronta amanhã, qual seria?', ajuda: 'Escolha só uma.', opcoes: [
        { v: 'modelos', r: 'Modelos prontos de orçamento, mensagens e pacotes' },
        { v: 'assistente', r: 'Um assistente que responde minhas dúvidas na hora' },
        { v: 'anuncios', r: 'Alguém criando e rodando meus anúncios' },
        { v: 'revisao', r: 'Revisão do meu perfil e do meu atendimento' },
        { v: 'encontros', r: 'Encontros para aplicar junto' },
        { v: 'aulas', r: 'Mais aulas' } ] },
      { id: 'mari_resolver', tipo: 'texto', obrigatoria: true, max: 1200, titulo: 'Se a Mari pudesse resolver uma coisa no seu negócio esta semana, o que seria?', ajuda: 'Escreva do seu jeito.' },
    ]},
    { titulo: 'Para fechar', perguntas: [
      { id: 'contato', tipo: 'contato', titulo: 'Podemos contar com você?', ajuda: 'Nome e WhatsApp são opcionais. Só usamos para falar com você sobre o Lumen.' },
    ]},
  ],
  encerramento: { titulo: 'Obrigada por responder', texto: 'Suas respostas vão direto para a Mari e para o time. É com elas que o Lumen vai ficar melhor para você.' },
};

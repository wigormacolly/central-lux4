import { NextResponse, type NextRequest } from 'next/server';

// Negação por padrão: sem cookie de sessão, só passam as rotas públicas.
// A validade real da sessão é conferida no servidor, em cada página (exigirUsuario).
const PUBLICAS = [/^\/login$/, /^\/primeiro-acesso$/, /^\/convite\/[^/]+$/, /^\/p\/[^/]+(\/obrigado)?$/, /^\/api\/saude$/];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLICAS.some(r => r.test(pathname))) return NextResponse.next();
  if (!req.cookies.get('central_sessao')?.value) {
    const url = req.nextUrl.clone(); url.pathname = '/login'; url.search = '';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ['/((?!_next/|favicon|lux-mark.png|robots.txt).*)'] };

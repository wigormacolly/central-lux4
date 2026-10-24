import type { Metadata, Viewport } from 'next';
import './globals.css';
import Luz from './luz';

export const metadata: Metadata = { title: 'Central Lux', robots: { index: false, follow: false } };
export const viewport: Viewport = { themeColor: '#000000', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function Raiz({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400;500;600&family=EB+Garamond:wght@400;500&display=swap" />
      </head>
      <body><Luz />{children}</body>
    </html>
  );
}

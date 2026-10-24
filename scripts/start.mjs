// Sobe a build standalone do Next copiando os estáticos, como o Dockerfile faz.
import { cpSync, existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
if (!existsSync('.next/standalone/server.js')) { console.error('Rode primeiro: npm run build'); process.exit(1); }
cpSync('.next/static', '.next/standalone/.next/static', { recursive: true });
if (existsSync('public')) cpSync('public', '.next/standalone/public', { recursive: true });
spawn('node', ['.next/standalone/server.js'], { stdio: 'inherit', env: process.env }).on('exit', c => process.exit(c ?? 0));

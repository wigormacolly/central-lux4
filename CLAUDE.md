# Central Lux 4 — regras do projeto

- Acesso: negação por padrão. Toda página interna chama `exigirUsuario()`/`exigirAdmin()`. Rotas públicas só as listadas em `middleware.ts`.
- Senhas: só hash bcrypt. Sessão e convite guardam só o hash do token.
- Banco: mudança de esquema só por arquivo novo em `db/migrations` (nunca editar um já aplicado).
- Pesquisas: perguntas vivem em `lib/pesquisas/<modelo>.ts`; a resposta é validada contra o modelo no servidor.
- Visual: identidade do Lux. Preto, Public Sans, EB Garamond nos números, sem cor de destaque além do branco.
- Textos em português, sem emoji, sem exclamação.

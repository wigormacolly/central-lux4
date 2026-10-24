#!/bin/sh
# Aplica as migrations e só então sobe o servidor. Se a migration falhar, o container não sobe.
set -e
node db/migrate.mjs
exec node server.js

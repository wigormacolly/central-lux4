-- Foto de perfil (quadrada, já reduzida no navegador para 256 px, JPEG).
alter table usuario add column foto bytea, add column foto_em timestamptz;

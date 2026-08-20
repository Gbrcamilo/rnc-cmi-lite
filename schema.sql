-- Execute este script no SQL Editor do Supabase (gratuito) para criar a tabela de RNCs
create table if not exists rnc (
  id bigint generated always as identity primary key,
  protocolo text unique,
  setor text not null,
  data date not null,
  descricao text not null,
  gravidade text not null default 'Baixa',
  nome text default 'Anonimo',
  status text not null default 'Recebida',
  resposta text,
  respondido_em timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Se a tabela ja existia antes desta versao, rode tambem estes comandos:
-- alter table rnc add column if not exists protocolo text unique;
-- alter table rnc add column if not exists resposta text;
-- alter table rnc add column if not exists respondido_em timestamp with time zone;

alter table rnc enable row level security;

-- Permite que qualquer pessoa com a chave anon crie e leia registros
-- (ajuste depois para exigir autenticacao caso queira restringir)
create policy "Permitir leitura publica" on rnc for select using (true);
create policy "Permitir insercao publica" on rnc for insert with check (true);
create policy "Permitir atualizacao publica" on rnc for update using (true);

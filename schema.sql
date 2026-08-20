-- Execute este script no SQL Editor do Supabase (gratuito) para criar a tabela de RNCs
-- e a tabela de perfis vinculada ao sistema de login (Supabase Auth).

-- ===== Tabela de RNCs =====
create table if not exists rnc (
  id bigint generated always as identity primary key,
  setor text not null,
  data date not null,
  descricao text not null,
  gravidade text not null default 'Baixa',
  nome text default 'Anonimo',
  status text not null default 'Aberta',
  criado_por uuid references auth.users(id),
  created_at timestamp with time zone default now()
);

alter table rnc enable row level security;

-- Qualquer pessoa (mesmo sem login) pode criar um registro, permitindo o registro anonimo
create policy "Permitir insercao publica" on rnc
  for insert
  with check (true);

-- Apenas usuarios autenticados (equipe/colaboradores) podem ler os registros
create policy "Permitir leitura para logados" on rnc
  for select
  using (auth.role() = 'authenticated');

-- Apenas usuarios autenticados podem atualizar status/registros
create policy "Permitir atualizacao para logados" on rnc
  for update
  using (auth.role() = 'authenticated');


-- ===== Tabela de perfis (vinculada ao login) =====
-- Guarda dados extras do usuario, como nome e papel (colaborador, gestor, admin).
create table if not exists profiles (
  id uuid references auth.users(id) primary key,
  nome text,
  papel text not null default 'colaborador', -- colaborador | gestor | admin
  created_at timestamp with time zone default now()
);

alter table profiles enable row level security;

-- Cada usuario pode ver e editar apenas o proprio perfil
create policy "Usuario ve o proprio perfil" on profiles
  for select
  using (auth.uid() = id);

create policy "Usuario edita o proprio perfil" on profiles
  for update
  using (auth.uid() = id);

-- Cria o perfil automaticamente quando alguem se cadastra (trigger)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nome, papel)
  values (new.id, new.raw_user_meta_data->>'nome', 'colaborador');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

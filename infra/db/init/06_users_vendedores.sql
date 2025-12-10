-- Tabla de usuarios para autenticación y roles (admin, vendedor)
create table if not exists usuarios(
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  password_hash text not null,
  nombre text,
  role text not null default 'vendedor', -- 'admin' | 'vendedor'
  activo boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_usuarios_email on usuarios(email);

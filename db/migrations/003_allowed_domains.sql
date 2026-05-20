-- CR-005: allowed_domains — email domain allowlist for signup restriction

create table allowed_domains (
  id         uuid primary key default uuid_generate_v4(),
  domain     text not null unique,  -- bare domain, no '@', e.g. 'bas.no'
  created_at timestamptz not null default now()
);

-- Enable RLS — no policies means only the service role can read this table.
-- The future backoffice UI will also use the service role.
alter table allowed_domains enable row level security;

-- Seed initial allowed domain
insert into allowed_domains (domain) values ('bas.no');

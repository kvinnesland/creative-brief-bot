-- CR-001: Initial schema — all 5 entities from specs/entities.md
-- Run via: Supabase dashboard SQL editor, or `supabase db push`

-- ─────────────────────────────────────────────
-- Extensions
-- ─────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────
-- brief_sessions
-- ─────────────────────────────────────────────
create type session_status as enum ('in_progress', 'completed', 'archived');

create table brief_sessions (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text,
  status      session_status not null default 'in_progress',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index brief_sessions_user_id_idx  on brief_sessions(user_id);
create index brief_sessions_status_idx   on brief_sessions(status);

-- ─────────────────────────────────────────────
-- brief_states
-- ─────────────────────────────────────────────
create table brief_states (
  id                 uuid primary key default uuid_generate_v4(),
  session_id         uuid not null unique references brief_sessions(id) on delete cascade,
  business_goal      text,
  target_audience    text,
  core_message       text,
  tone_of_voice      text,
  visual_direction   text,
  deliverables       text[],
  constraints        text[],
  open_questions     text[],
  confidence_scores  jsonb,
  updated_at         timestamptz not null default now()
);

create index brief_states_session_id_idx on brief_states(session_id);

-- ─────────────────────────────────────────────
-- conversation_messages
-- ─────────────────────────────────────────────
create type message_role as enum ('user', 'assistant');

create table conversation_messages (
  id          uuid primary key default uuid_generate_v4(),
  session_id  uuid not null references brief_sessions(id) on delete cascade,
  role        message_role not null,
  content     text not null,
  created_at  timestamptz not null default now()
);

create index conversation_messages_session_id_idx  on conversation_messages(session_id);
create index conversation_messages_created_at_idx  on conversation_messages(created_at);

-- ─────────────────────────────────────────────
-- attachments
-- ─────────────────────────────────────────────
create type attachment_type as enum ('file', 'url');

create table attachments (
  id                 uuid primary key default uuid_generate_v4(),
  session_id         uuid not null references brief_sessions(id) on delete cascade,
  type               attachment_type not null,
  original_name      text,
  storage_path       text,
  url                text,
  extracted_context  text,
  created_at         timestamptz not null default now()
);

create index attachments_session_id_idx on attachments(session_id);

-- ─────────────────────────────────────────────
-- updated_at trigger (brief_sessions + brief_states)
-- ─────────────────────────────────────────────
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger brief_sessions_updated_at
  before update on brief_sessions
  for each row execute function update_updated_at();

create trigger brief_states_updated_at
  before update on brief_states
  for each row execute function update_updated_at();

-- ─────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────
alter table brief_sessions        enable row level security;
alter table brief_states          enable row level security;
alter table conversation_messages enable row level security;
alter table attachments           enable row level security;

-- brief_sessions: users own their own sessions
create policy "Users can manage their own sessions"
  on brief_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- brief_states: accessible only if the session belongs to the user
create policy "Users can manage their own brief states"
  on brief_states for all
  using (
    exists (
      select 1 from brief_sessions
      where brief_sessions.id = brief_states.session_id
        and brief_sessions.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from brief_sessions
      where brief_sessions.id = brief_states.session_id
        and brief_sessions.user_id = auth.uid()
    )
  );

-- conversation_messages: same pattern
create policy "Users can manage their own messages"
  on conversation_messages for all
  using (
    exists (
      select 1 from brief_sessions
      where brief_sessions.id = conversation_messages.session_id
        and brief_sessions.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from brief_sessions
      where brief_sessions.id = conversation_messages.session_id
        and brief_sessions.user_id = auth.uid()
    )
  );

-- attachments: same pattern
create policy "Users can manage their own attachments"
  on attachments for all
  using (
    exists (
      select 1 from brief_sessions
      where brief_sessions.id = attachments.session_id
        and brief_sessions.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from brief_sessions
      where brief_sessions.id = attachments.session_id
        and brief_sessions.user_id = auth.uid()
    )
  );

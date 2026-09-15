-- Jeu des fleurs : schéma Supabase
-- À coller tel quel dans SQL Editor, puis Run.

-- 1. La partie : état PUBLIC, lu par tous les téléphones (temps réel).
create table if not exists games (
  code          text primary key,
  status        text not null default 'lobby',   -- lobby | playing | finished
  mode          text not null default 'duo',     -- duo | solo
  bot_level     int,
  bouquet_size  int  not null default 5,
  p1_name       text,
  p2_name       text,
  p1_flowers    jsonb not null default '[]'::jsonb,  -- ex. [3,2,1] = qualités des fleurs gagnées
  p2_flowers    jsonb not null default '[]'::jsonb,
  turn_seat     int  not null default 1,          -- à qui le tour : 1 ou 2
  round         int  not null default 1,
  question_public jsonb,                          -- l'énoncé en cours, SANS la réponse
  bot_due_at    timestamptz,                      -- solo : heure à laquelle le robot répond
  bot_delay_ms  int,
  last_event    text,
  winner_seat   int,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- 2. Les sièges : PRIVÉ (le jeton d'appareil ne doit jamais sortir du serveur).
create table if not exists players (
  game_code text not null references games(code) on delete cascade,
  seat      int  not null,
  name      text not null,
  token     text not null,
  primary key (game_code, seat)
);
create index if not exists players_token_idx on players (token);

-- 3. Les tours : PRIVÉ (contient la bonne réponse et le chrono serveur).
create table if not exists turns (
  id          uuid primary key default gen_random_uuid(),
  game_code   text not null references games(code) on delete cascade,
  seat        int  not null,
  round       int  not null,
  question    jsonb not null,
  revealed_at timestamptz not null default now(),
  answered_at timestamptz,
  given       text,
  correct     boolean,
  elapsed_ms  int,
  quality     int
);

-- 4. Sécurité : tout est verrouillé, seule la lecture des parties est ouverte.
alter table games   enable row level security;
alter table players enable row level security;
alter table turns   enable row level security;

drop policy if exists "lecture publique des parties" on games;
create policy "lecture publique des parties"
  on games for select to anon, authenticated using (true);

-- 5. Temps réel : Supabase pousse chaque modification de games aux pages abonnées.
alter publication supabase_realtime add table games;

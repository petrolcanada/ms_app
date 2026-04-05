-- Migration 001: Create users and watchlists tables
-- Run: psql -d <database> -f 001_users_watchlist.sql

BEGIN;

CREATE TABLE IF NOT EXISTS users (
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  email           varchar(255)  UNIQUE NOT NULL,
  password_hash   varchar(255)  NOT NULL,
  name            varchar(255),
  plan            varchar(20)   NOT NULL DEFAULT 'free'
                                CHECK (plan IN ('free', 'pro')),
  stripe_customer_id varchar(255),
  created_at      timestamptz   NOT NULL DEFAULT now(),
  updated_at      timestamptz   NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS watchlists (
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fund_id         varchar(50)   NOT NULL,
  fund_name       varchar(500),
  ticker          varchar(20),
  category_name   varchar(255),
  security_type   varchar(50),
  added_at        timestamptz   NOT NULL DEFAULT now(),
  UNIQUE (user_id, fund_id)
);

CREATE INDEX IF NOT EXISTS idx_watchlists_user_id ON watchlists(user_id);

COMMIT;

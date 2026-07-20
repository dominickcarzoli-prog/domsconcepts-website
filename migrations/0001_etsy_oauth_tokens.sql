-- Single-row Etsy OAuth token store (id must always be 1).
CREATE TABLE etsy_oauth_tokens (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  etsy_user_id TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_type TEXT NOT NULL DEFAULT 'Bearer',
  scope TEXT,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

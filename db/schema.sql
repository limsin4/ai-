PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS discussions (
  id TEXT PRIMARY KEY,
  topic TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'ready', 'running', 'finished')),
  expert_count INTEGER NOT NULL,
  summary TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS participants (
  id TEXT PRIMARY KEY,
  discussion_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('host', 'expert')),
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  profession TEXT NOT NULL,
  stance TEXT NOT NULL,
  focus TEXT NOT NULL,
  color TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('waiting', 'preparing', 'speaking')),
  public_thought_summary TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (discussion_id) REFERENCES discussions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  discussion_id TEXT NOT NULL,
  speaker_id TEXT NOT NULL,
  speaker_name TEXT NOT NULL,
  speaker_title TEXT NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('opening', 'speech', 'follow_up', 'summary')),
  created_at TEXT NOT NULL,
  FOREIGN KEY (discussion_id) REFERENCES discussions(id) ON DELETE CASCADE,
  FOREIGN KEY (speaker_id) REFERENCES participants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS insights (
  id TEXT PRIMARY KEY,
  discussion_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('consensus', 'disagreement')),
  content TEXT NOT NULL,
  source_message_ids TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  FOREIGN KEY (discussion_id) REFERENCES discussions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_questions (
  id TEXT PRIMARY KEY,
  discussion_id TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued', 'addressed')),
  created_at TEXT NOT NULL,
  FOREIGN KEY (discussion_id) REFERENCES discussions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS discussion_events (
  id TEXT PRIMARY KEY,
  discussion_id TEXT NOT NULL,
  type TEXT NOT NULL,
  payload TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (discussion_id) REFERENCES discussions(id) ON DELETE CASCADE
);

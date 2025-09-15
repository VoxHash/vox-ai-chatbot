-- Basic schema & seed data
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
  sender TEXT NOT NULL, -- 'user' | 'assistant' | 'system'
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Demo user: email test@example.com / password: Passw0rd!
INSERT INTO users (email, password_hash, role)
VALUES ('test@example.com', '$2b$10$lXdhqxP7CIbNIt6VE7LCF.m4SxHl9cMQyTjTg.4C4UPmuMIDoKSfe', 'admin')
ON CONFLICT (email) DO NOTHING;

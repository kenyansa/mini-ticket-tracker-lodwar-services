DO $$ BEGIN
  CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS tickets (
  id          BIGSERIAL PRIMARY KEY,
  title       VARCHAR(200) NOT NULL CHECK (length(trim(title)) > 0),
  description TEXT,
  status      ticket_status NOT NULL DEFAULT 'open',
  priority    ticket_priority NOT NULL DEFAULT 'medium',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets (status);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at_id ON tickets (created_at DESC, id DESC);

-- ---------- auth ----------
CREATE TABLE IF NOT EXISTS roles (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS permissions (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id       INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id INT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS users (
  id            BIGSERIAL PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  name          VARCHAR(100) NOT NULL,
  password_hash TEXT NOT NULL,
  role_id       INT NOT NULL REFERENCES roles(id),
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- session store used by connect-pg-simple
CREATE TABLE IF NOT EXISTS "session" (
  "sid"    VARCHAR NOT NULL COLLATE "default" PRIMARY KEY,
  "sess"   JSON NOT NULL,
  "expire" TIMESTAMP(6) NOT NULL
);
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");

-- tickets: who created it, who it is assigned to
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS created_by  BIGINT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS assignee_id BIGINT REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_tickets_created_by  ON tickets (created_by);
CREATE INDEX IF NOT EXISTS idx_tickets_assignee_id ON tickets (assignee_id);

-- seed data: roles, permissions and the role -> permission matrix
INSERT INTO roles (name) VALUES ('admin'), ('agent'), ('requester')
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (name) VALUES
  ('ticket:create'), ('ticket:read_all'), ('ticket:update'),
  ('ticket:assign'), ('user:read'), ('user:manage')
ON CONFLICT (name) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM (VALUES
  ('admin','ticket:create'), ('admin','ticket:read_all'), ('admin','ticket:update'),
  ('admin','ticket:assign'), ('admin','user:read'),       ('admin','user:manage'),
  ('agent','ticket:create'), ('agent','ticket:read_all'), ('agent','ticket:update'),
  ('agent','ticket:assign'), ('agent','user:read'),
  ('requester','ticket:create')
) AS m(role_name, perm_name)
JOIN roles r ON r.name = m.role_name
JOIN permissions p ON p.name = m.perm_name
ON CONFLICT DO NOTHING;
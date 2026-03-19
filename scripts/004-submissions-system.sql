-- Таблиця секцій конкурсів
CREATE TABLE IF NOT EXISTS competition_sections (
    id SERIAL PRIMARY KEY,
    competition_id INTEGER REFERENCES competitions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    max_participants INTEGER DEFAULT 50,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблиця заявок (submissions)
CREATE TABLE IF NOT EXISTS submissions (
    id SERIAL PRIMARY KEY,
    competition_id INTEGER REFERENCES competitions(id) ON DELETE CASCADE,
    section_id INTEGER REFERENCES competition_sections(id) ON DELETE SET NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'accepted', 'rejected', 'needs_revision')),
    submitted_at TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewer_id INTEGER REFERENCES users(id),
    reviewer_comment TEXT,
    score DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(competition_id, user_id)
);

-- Таблиця файлів заявок
CREATE TABLE IF NOT EXISTS submission_files (
    id SERIAL PRIMARY KEY,
    submission_id INTEGER REFERENCES submissions(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(100),
    file_size INTEGER,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Індекси для швидкого пошуку
CREATE INDEX IF NOT EXISTS idx_sections_competition ON competition_sections(competition_id);
CREATE INDEX IF NOT EXISTS idx_submissions_competition ON submissions(competition_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submission_files_submission ON submission_files(submission_id);

-- Додаємо дозволи для заявок
INSERT INTO permissions (name, display_name, description, category) VALUES
    ('submit_application', 'Подання заявки', 'Дозвіл на подання заявок на конкурси', 'submissions'),
    ('view_own_submissions', 'Перегляд своїх заявок', 'Дозвіл на перегляд власних заявок', 'submissions'),
    ('review_submissions', 'Перегляд заявок', 'Дозвіл на перегляд всіх заявок', 'submissions'),
    ('manage_submissions', 'Управління заявками', 'Дозвіл на схвалення/відхилення заявок', 'submissions')
ON CONFLICT (name) DO NOTHING;

-- Прив'язуємо дозволи до ролей
-- Student - подання та перегляд своїх заявок
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'student' AND p.name IN ('submit_application', 'view_own_submissions')
ON CONFLICT DO NOTHING;

-- Teacher - перегляд заявок своїх учнів
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'teacher' AND p.name IN ('view_own_submissions', 'review_submissions')
ON CONFLICT DO NOTHING;

-- Methodist - управління заявками
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'methodist' AND p.name IN ('review_submissions', 'manage_submissions')
ON CONFLICT DO NOTHING;

-- Judge - перегляд та оцінювання
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'judge' AND p.name IN ('review_submissions', 'manage_submissions')
ON CONFLICT DO NOTHING;

-- Admin - всі дозволи
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'admin' AND p.category = 'submissions'
ON CONFLICT DO NOTHING;

-- Додаємо тестові секції до існуючих конкурсів
INSERT INTO competition_sections (competition_id, name, description, max_participants)
SELECT c.id, '9 клас', 'Секція для учнів 9 класу', 50 FROM competitions c WHERE c.title LIKE '%математики%' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO competition_sections (competition_id, name, description, max_participants)
SELECT c.id, '10 клас', 'Секція для учнів 10 класу', 50 FROM competitions c WHERE c.title LIKE '%математики%' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO competition_sections (competition_id, name, description, max_participants)
SELECT c.id, '11 клас', 'Секція для учнів 11 класу', 50 FROM competitions c WHERE c.title LIKE '%математики%' LIMIT 1
ON CONFLICT DO NOTHING;

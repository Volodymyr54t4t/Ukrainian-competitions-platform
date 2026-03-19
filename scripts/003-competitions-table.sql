-- Створення таблиці конкурсів
CREATE TABLE IF NOT EXISTS competitions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject VARCHAR(100) NOT NULL,
    level VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    max_participants INTEGER DEFAULT 100,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Створення таблиці заявок на конкурси
CREATE TABLE IF NOT EXISTS competition_applications (
    id SERIAL PRIMARY KEY,
    competition_id INTEGER REFERENCES competitions(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
    score DECIMAL(5,2),
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(competition_id, user_id)
);

-- Індекси для швидкого пошуку
CREATE INDEX IF NOT EXISTS idx_competitions_subject ON competitions(subject);
CREATE INDEX IF NOT EXISTS idx_competitions_level ON competitions(level);
CREATE INDEX IF NOT EXISTS idx_competitions_status ON competitions(status);
CREATE INDEX IF NOT EXISTS idx_competitions_created_by ON competitions(created_by);
CREATE INDEX IF NOT EXISTS idx_applications_competition ON competition_applications(competition_id);
CREATE INDEX IF NOT EXISTS idx_applications_user ON competition_applications(user_id);

-- Тестові дані конкурсів
INSERT INTO competitions (title, description, subject, level, start_date, end_date, max_participants, status, created_by)
VALUES 
    ('Всеукраїнська олімпіада з математики', 'Щорічна олімпіада для учнів 9-11 класів з математики. Включає теоретичні та практичні завдання.', 'mathematics', 'national', '2026-04-01', '2026-04-15', 500, 'active', 1),
    ('Регіональний конкурс з фізики', 'Конкурс з фізики для учнів 8-11 класів Київської області.', 'physics', 'regional', '2026-04-10', '2026-04-20', 200, 'active', 1),
    ('Конкурс з української мови та літератури', 'Творчий конкурс есе та поезії для учнів усіх класів.', 'ukrainian', 'school', '2026-03-25', '2026-04-05', 100, 'active', 1),
    ('Олімпіада з інформатики', 'Змагання з програмування та алгоритмів.', 'informatics', 'national', '2026-05-01', '2026-05-10', 300, 'draft', 1),
    ('Конкурс наукових проектів', 'Презентація та захист наукових робіт учнів.', 'science', 'regional', '2026-04-20', '2026-05-01', 150, 'active', 1),
    ('Всеукраїнський конкурс з хімії', 'Теоретичні та практичні завдання з хімії.', 'chemistry', 'national', '2026-05-15', '2026-05-25', 250, 'active', 1),
    ('Конкурс з біології', 'Олімпіада з біології для старшокласників.', 'biology', 'regional', '2026-04-05', '2026-04-15', 180, 'completed', 1),
    ('Літературний конкурс', 'Конкурс творчих робіт з української та світової літератури.', 'literature', 'school', '2026-03-20', '2026-03-30', 80, 'active', 1)
ON CONFLICT DO NOTHING;

-- Додаємо дозволи для конкурсів
INSERT INTO permissions (name, display_name, description, category) VALUES
    ('view_competitions', 'Перегляд конкурсів', 'Дозвіл на перегляд списку конкурсів', 'competitions'),
    ('create_competition', 'Створення конкурсу', 'Дозвіл на створення нових конкурсів', 'competitions'),
    ('edit_competition', 'Редагування конкурсу', 'Дозвіл на редагування існуючих конкурсів', 'competitions'),
    ('delete_competition', 'Видалення конкурсу', 'Дозвіл на видалення конкурсів', 'competitions'),
    ('manage_applications', 'Управління заявками', 'Дозвіл на управління заявками на конкурси', 'competitions'),
    ('evaluate_works', 'Оцінювання робіт', 'Дозвіл на оцінювання робіт учасників', 'competitions')
ON CONFLICT (name) DO NOTHING;

-- Прив'язуємо дозволи до ролей
-- Admin - всі дозволи
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'admin' AND p.category = 'competitions'
ON CONFLICT DO NOTHING;

-- Methodist - всі дозволи крім видалення
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'methodist' AND p.name IN ('view_competitions', 'create_competition', 'edit_competition', 'manage_applications')
ON CONFLICT DO NOTHING;

-- Teacher - перегляд та створення
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'teacher' AND p.name IN ('view_competitions', 'create_competition', 'edit_competition')
ON CONFLICT DO NOTHING;

-- Judge - перегляд та оцінювання
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'judge' AND p.name IN ('view_competitions', 'evaluate_works')
ON CONFLICT DO NOTHING;

-- Student - тільки перегляд
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'student' AND p.name = 'view_competitions'
ON CONFLICT DO NOTHING;

-- Створення таблиці секцій конкурсів
CREATE TABLE IF NOT EXISTS competition_sections (
    id SERIAL PRIMARY KEY,
    competition_id INTEGER REFERENCES competitions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Оновлення таблиці заявок для повного функціоналу
ALTER TABLE competition_applications 
ADD COLUMN IF NOT EXISTS section_id INTEGER REFERENCES competition_sections(id),
ADD COLUMN IF NOT EXISTS title VARCHAR(255),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS file_path VARCHAR(500),
ADD COLUMN IF NOT EXISTS file_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS file_size INTEGER;

-- Оновлення статусів заявок
ALTER TABLE competition_applications 
DROP CONSTRAINT IF EXISTS competition_applications_status_check;

ALTER TABLE competition_applications 
ADD CONSTRAINT competition_applications_status_check 
CHECK (status IN ('submitted', 'under_review', 'accepted', 'rejected', 'pending', 'approved', 'withdrawn'));

-- Індекси для швидкого пошуку
CREATE INDEX IF NOT EXISTS idx_sections_competition ON competition_sections(competition_id);
CREATE INDEX IF NOT EXISTS idx_applications_section ON competition_applications(section_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON competition_applications(status);

-- Додаємо секції до існуючих конкурсів
INSERT INTO competition_sections (competition_id, name, description)
SELECT c.id, 'Теоретичний тур', 'Теоретичні завдання та тести'
FROM competitions c
WHERE NOT EXISTS (SELECT 1 FROM competition_sections WHERE competition_id = c.id)
ON CONFLICT DO NOTHING;

INSERT INTO competition_sections (competition_id, name, description)
SELECT c.id, 'Практичний тур', 'Практичні завдання та задачі'
FROM competitions c
WHERE NOT EXISTS (SELECT 1 FROM competition_sections cs WHERE cs.competition_id = c.id AND cs.name = 'Практичний тур')
ON CONFLICT DO NOTHING;

INSERT INTO competition_sections (competition_id, name, description)
SELECT c.id, 'Творча робота', 'Творчі та дослідницькі проекти'
FROM competitions c
WHERE c.subject IN ('ukrainian', 'literature', 'science')
AND NOT EXISTS (SELECT 1 FROM competition_sections cs WHERE cs.competition_id = c.id AND cs.name = 'Творча робота')
ON CONFLICT DO NOTHING;

-- Додаємо дозвіл на подання заявок для студентів
INSERT INTO permissions (name, display_name, description, category) VALUES
    ('submit_application', 'Подання заявки', 'Дозвіл на подання заявок на конкурси', 'applications')
ON CONFLICT (name) DO NOTHING;

-- Прив'язуємо дозвіл до ролі student
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'student' AND p.name = 'submit_application'
ON CONFLICT DO NOTHING;

-- Створення таблиці секцій конкурсів
CREATE TABLE IF NOT EXISTS competition_sections (
    id SERIAL PRIMARY KEY,
    competition_id INTEGER REFERENCES competitions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
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

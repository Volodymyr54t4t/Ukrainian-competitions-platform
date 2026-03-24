-- Таблиця для зберігання учнів, доданих вчителем до конкурсу
-- Цей скрипт створює зв'язок між вчителем, учнем та конкурсом

-- Створюємо таблицю учасників конкурсу (додані вчителем)
CREATE TABLE IF NOT EXISTS competition_participants (
    id SERIAL PRIMARY KEY,
    competition_id INTEGER NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    institution_id INTEGER REFERENCES institutions(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'invited' CHECK (status IN ('invited', 'accepted', 'declined', 'participating')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(competition_id, student_id)
);

-- Індекси для швидкого пошуку
CREATE INDEX IF NOT EXISTS idx_competition_participants_competition ON competition_participants(competition_id);
CREATE INDEX IF NOT EXISTS idx_competition_participants_student ON competition_participants(student_id);
CREATE INDEX IF NOT EXISTS idx_competition_participants_teacher ON competition_participants(teacher_id);
CREATE INDEX IF NOT EXISTS idx_competition_participants_institution ON competition_participants(institution_id);
CREATE INDEX IF NOT EXISTS idx_competition_participants_status ON competition_participants(status);

-- Коментарі до таблиці
COMMENT ON TABLE competition_participants IS 'Учасники конкурсів, додані вчителями';
COMMENT ON COLUMN competition_participants.id IS 'Унікальний ідентифікатор запису';
COMMENT ON COLUMN competition_participants.competition_id IS 'Посилання на конкурс';
COMMENT ON COLUMN competition_participants.student_id IS 'Посилання на учня';
COMMENT ON COLUMN competition_participants.teacher_id IS 'Посилання на вчителя, який додав учня';
COMMENT ON COLUMN competition_participants.institution_id IS 'Посилання на навчальний заклад';
COMMENT ON COLUMN competition_participants.status IS 'Статус участі учня';
COMMENT ON COLUMN competition_participants.notes IS 'Примітки від вчителя';

-- Додаємо дозвіл для вчителів на додавання учнів до конкурсів
INSERT INTO permissions (name, display_name, description, category) VALUES
    ('add_students_to_competition', 'Додавання учнів до конкурсу', 'Дозвіл на додавання учнів свого закладу до конкурсів', 'competitions')
ON CONFLICT (name) DO NOTHING;

-- Прив'язуємо дозвіл до ролі teacher
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'teacher' AND p.name = 'add_students_to_competition'
ON CONFLICT DO NOTHING;

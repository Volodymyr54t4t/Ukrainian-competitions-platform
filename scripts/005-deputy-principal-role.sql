-- ============================================================================
-- Міграція для ролі "Завуч" (deputy_principal) та системи заявок закладів
-- Версія: 1.0
-- Дата: 2026-03-24
-- ============================================================================

-- ============================================================================
-- КРОК 1: Додавання нової ролі deputy_principal (Завуч)
-- ============================================================================
INSERT INTO roles (name, display_name, description) VALUES
    ('deputy_principal', 'Завуч', 'Заступник директора навчального закладу, затверджує проведення конкурсів у закладі')
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- КРОК 2: Додавання institution_id до таблиці users (якщо не існує)
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'institution_id'
    ) THEN
        ALTER TABLE users ADD COLUMN institution_id INTEGER;
        CREATE INDEX IF NOT EXISTS idx_users_institution_id ON users(institution_id);
        COMMENT ON COLUMN users.institution_id IS 'ID навчального закладу користувача';
    END IF;
END
$$;

-- ============================================================================
-- КРОК 3: Створення таблиці закладів освіти (institutions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS institutions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    region VARCHAR(100),
    city VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Індекси для швидкого пошуку
CREATE INDEX IF NOT EXISTS idx_institutions_region ON institutions(region);
CREATE INDEX IF NOT EXISTS idx_institutions_city ON institutions(city);

-- Коментарі до таблиці
COMMENT ON TABLE institutions IS 'Таблиця навчальних закладів освіти';
COMMENT ON COLUMN institutions.id IS 'Унікальний ідентифікатор закладу';
COMMENT ON COLUMN institutions.name IS 'Назва навчального закладу';
COMMENT ON COLUMN institutions.code IS 'Унікальний код закладу (ЄДЕБО)';

-- ============================================================================
-- КРОК 4: Створення таблиці заявок закладів на участь у конкурсах
-- ============================================================================
CREATE TABLE IF NOT EXISTS institution_applications (
    id SERIAL PRIMARY KEY,
    competition_id INTEGER NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    institution_id INTEGER NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(competition_id, institution_id)
);

-- Індекси для швидкого пошуку
CREATE INDEX IF NOT EXISTS idx_inst_apps_competition ON institution_applications(competition_id);
CREATE INDEX IF NOT EXISTS idx_inst_apps_institution ON institution_applications(institution_id);
CREATE INDEX IF NOT EXISTS idx_inst_apps_status ON institution_applications(status);

-- Коментарі до таблиці
COMMENT ON TABLE institution_applications IS 'Заявки закладів на участь у конкурсах (рішення завуча)';
COMMENT ON COLUMN institution_applications.status IS 'Статус заявки: pending - очікує, approved - затверджено, rejected - відхилено';
COMMENT ON COLUMN institution_applications.approved_by IS 'ID завуча, який затвердив/відхилив заявку';

-- ============================================================================
-- КРОК 5: Оновлення статусів конкурсів для нової ієрархії
-- ============================================================================
ALTER TABLE competitions 
DROP CONSTRAINT IF EXISTS competitions_status_check;

ALTER TABLE competitions 
ADD CONSTRAINT competitions_status_check 
CHECK (status IN ('draft', 'published', 'active', 'completed', 'cancelled'));

-- Оновлюємо існуючі активні конкурси на статус 'published' (опубліковані методистом)
UPDATE competitions SET status = 'published' WHERE status = 'active';

-- ============================================================================
-- КРОК 6: Додавання нових дозволів для ролей
-- ============================================================================
INSERT INTO permissions (name, display_name, description, category) VALUES
    ('approve_institution_competitions', 'Затвердження конкурсів для закладу', 'Дозвіл на затвердження проведення конкурсів у своєму закладі', 'competitions'),
    ('view_institution_applications', 'Перегляд заявок закладу', 'Дозвіл на перегляд заявок вчителів/учнів свого закладу', 'applications'),
    ('manage_institution_applications', 'Керування заявками закладу', 'Дозвіл на керування заявками на рівні закладу', 'applications'),
    ('publish_competition', 'Публікація конкурсу', 'Дозвіл на публікацію конкурсів', 'competitions')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- КРОК 7: Призначення дозволів для ролі deputy_principal
-- ============================================================================
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'deputy_principal' 
AND p.name IN (
    'view_competitions',
    'approve_institution_competitions',
    'view_institution_applications',
    'manage_institution_applications',
    'view_submissions'
)
ON CONFLICT DO NOTHING;

-- Додаємо дозвіл publish_competition для методиста
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'methodist' 
AND p.name = 'publish_competition'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- КРОК 8: Вставка тестових даних для демонстрації
-- ============================================================================

-- Тестові заклади освіти
INSERT INTO institutions (name, code, region, city, address) VALUES
    ('Київська гімназія №1', 'KG001', 'Київська область', 'Київ', 'вул. Хрещатик, 1'),
    ('Львівський ліцей №5', 'LL005', 'Львівська область', 'Львів', 'вул. Франка, 10'),
    ('Одеська школа №23', 'OS023', 'Одеська область', 'Одеса', 'вул. Приморська, 25'),
    ('Харківська гімназія №7', 'HG007', 'Харківська область', 'Харків', 'вул. Сумська, 15')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- КРОК 9: Оновлення mock користувача для завуча (якщо потрібно)
-- ============================================================================
-- Примітка: mock користувачі додаються в server.js

-- ============================================================================
-- ЗАВЕРШЕННЯ
-- ============================================================================
DO $$
DECLARE
    deputy_role_count INTEGER;
    inst_count INTEGER;
    inst_apps_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO deputy_role_count FROM roles WHERE name = 'deputy_principal';
    SELECT COUNT(*) INTO inst_count FROM institutions;
    SELECT COUNT(*) INTO inst_apps_count FROM institution_applications;
    
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Міграція deputy_principal успішно завершена!';
    RAISE NOTICE 'Роль deputy_principal: %', deputy_role_count;
    RAISE NOTICE 'Закладів освіти: %', inst_count;
    RAISE NOTICE 'Заявок закладів: %', inst_apps_count;
    RAISE NOTICE '============================================';
END
$$;

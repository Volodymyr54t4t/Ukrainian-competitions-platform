-- ============================================================================
-- RBAC (Role-Based Access Control) система для платформи "Єдина платформа конкурсів України"
-- Версія: 1.0
-- Дата: 2026-03-19
-- ============================================================================

-- ============================================================================
-- КРОК 1: Створення таблиці ролей (roles)
-- ============================================================================
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Індекс для швидкого пошуку по назві ролі
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);

-- Коментарі до таблиці roles
COMMENT ON TABLE roles IS 'Таблиця ролей користувачів системи';
COMMENT ON COLUMN roles.id IS 'Унікальний ідентифікатор ролі';
COMMENT ON COLUMN roles.name IS 'Системна назва ролі (унікальна)';
COMMENT ON COLUMN roles.display_name IS 'Відображувана назва ролі українською';
COMMENT ON COLUMN roles.description IS 'Опис ролі та її призначення';

-- ============================================================================
-- КРОК 2: Створення таблиці дозволів (permissions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Індекс для швидкого пошуку по назві дозволу
CREATE INDEX IF NOT EXISTS idx_permissions_name ON permissions(name);
CREATE INDEX IF NOT EXISTS idx_permissions_category ON permissions(category);

-- Коментарі до таблиці permissions
COMMENT ON TABLE permissions IS 'Таблиця дозволів системи';
COMMENT ON COLUMN permissions.id IS 'Унікальний ідентифікатор дозволу';
COMMENT ON COLUMN permissions.name IS 'Системна назва дозволу (унікальна)';
COMMENT ON COLUMN permissions.display_name IS 'Відображувана назва дозволу українською';
COMMENT ON COLUMN permissions.description IS 'Детальний опис дозволу';
COMMENT ON COLUMN permissions.category IS 'Категорія дозволу для групування';

-- ============================================================================
-- КРОК 3: Створення таблиці зв'язку ролей і дозволів (role_permissions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS role_permissions (
    id SERIAL PRIMARY KEY,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id, permission_id)
);

-- Індекси для швидкого пошуку
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON role_permissions(permission_id);

-- Коментарі до таблиці role_permissions
COMMENT ON TABLE role_permissions IS 'Таблиця зв''язку ролей та дозволів (Many-to-Many)';
COMMENT ON COLUMN role_permissions.role_id IS 'Посилання на роль';
COMMENT ON COLUMN role_permissions.permission_id IS 'Посилання на дозвіл';

-- ============================================================================
-- КРОК 4: Додавання role_id до таблиці users
-- ============================================================================
DO $$
BEGIN
    -- Перевіряємо чи колонка вже існує
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'role_id'
    ) THEN
        ALTER TABLE users ADD COLUMN role_id INTEGER REFERENCES roles(id) ON DELETE SET NULL;
        CREATE INDEX idx_users_role_id ON users(role_id);
        COMMENT ON COLUMN users.role_id IS 'Посилання на роль користувача (RBAC)';
    END IF;
END
$$;

-- ============================================================================
-- КРОК 5: Вставка ролей
-- ============================================================================
INSERT INTO roles (name, display_name, description) VALUES
    ('student', 'Учень/Студент', 'Учасник конкурсів, може переглядати та подавати роботи'),
    ('teacher', 'Вчитель', 'Керівник учнів, може додавати учнів та переглядати їх результати'),
    ('methodist', 'Методист', 'Методист освітнього закладу, може створювати та редагувати конкурси'),
    ('admin', 'Адміністратор', 'Повний доступ до всіх функцій системи'),
    ('judge', 'Суддя/Журі', 'Член журі, може оцінювати роботи учасників')
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- КРОК 6: Вставка дозволів
-- ============================================================================
INSERT INTO permissions (name, display_name, description, category) VALUES
    -- Дозволи для конкурсів
    ('create_competition', 'Створення конкурсу', 'Дозвіл на створення нових конкурсів', 'competitions'),
    ('edit_competition', 'Редагування конкурсу', 'Дозвіл на редагування існуючих конкурсів', 'competitions'),
    ('delete_competition', 'Видалення конкурсу', 'Дозвіл на видалення конкурсів', 'competitions'),
    ('publish_competition', 'Публікація конкурсу', 'Дозвіл на публікацію конкурсів для учасників', 'competitions'),
    
    -- Дозволи для результатів
    ('add_results', 'Додавання результатів', 'Дозвіл на додавання результатів конкурсів', 'results'),
    ('edit_results', 'Редагування результатів', 'Дозвіл на редагування результатів конкурсів', 'results'),
    
    -- Дозволи для управління
    ('manage_users', 'Управління користувачами', 'Дозвіл на управління обліковими записами користувачів', 'management'),
    ('view_reports', 'Перегляд звітів', 'Дозвіл на перегляд статистичних звітів системи', 'management'),
    ('manage_templates', 'Управління шаблонами', 'Дозвіл на управління шаблонами дипломів та сертифікатів', 'management'),
    
    -- Дозволи для робіт учасників
    ('evaluate_submissions', 'Оцінювання робіт', 'Дозвіл на оцінювання робіт учасників конкурсів', 'submissions'),
    ('view_submissions', 'Перегляд робіт', 'Дозвіл на перегляд поданих робіт учасників', 'submissions')
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    category = EXCLUDED.category;

-- ============================================================================
-- КРОК 7: Заповнення role_permissions для кожної ролі
-- ============================================================================

-- Очищення існуючих зв'язків для уникнення дублювання
DELETE FROM role_permissions;

-- ADMIN: Всі дозволи
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'admin';

-- METHODIST: Створення, редагування, публікація конкурсів, перегляд звітів, управління шаблонами
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'methodist' 
AND p.name IN (
    'create_competition', 
    'edit_competition', 
    'publish_competition', 
    'view_reports', 
    'manage_templates',
    'view_submissions',
    'add_results',
    'edit_results'
);

-- TEACHER: Перегляд звітів, перегляд робіт
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'teacher' 
AND p.name IN (
    'view_reports', 
    'view_submissions'
);

-- JUDGE: Оцінювання та перегляд робіт, додавання результатів
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'judge' 
AND p.name IN (
    'evaluate_submissions', 
    'view_submissions',
    'add_results'
);

-- STUDENT: Тільки перегляд робіт (власних)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'student' 
AND p.name IN (
    'view_submissions'
);

-- ============================================================================
-- КРОК 8: Призначення ролі student всім існуючим користувачам без role_id
-- ============================================================================
UPDATE users 
SET role_id = (SELECT id FROM roles WHERE name = 'student')
WHERE role_id IS NULL;

-- ============================================================================
-- КРОК 9: Створення допоміжних функцій для перевірки дозволів
-- ============================================================================

-- Функція для перевірки чи має користувач певний дозвіл
CREATE OR REPLACE FUNCTION user_has_permission(p_user_id INTEGER, p_permission_name VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    has_perm BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 
        FROM users u
        JOIN role_permissions rp ON u.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE u.id = p_user_id AND p.name = p_permission_name
    ) INTO has_perm;
    
    RETURN has_perm;
END;
$$ LANGUAGE plpgsql;

-- Функція для отримання всіх дозволів користувача
CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id INTEGER)
RETURNS TABLE (permission_name VARCHAR, display_name VARCHAR, category VARCHAR) AS $$
BEGIN
    RETURN QUERY
    SELECT p.name, p.display_name, p.category
    FROM users u
    JOIN role_permissions rp ON u.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE u.id = p_user_id
    ORDER BY p.category, p.name;
END;
$$ LANGUAGE plpgsql;

-- Функція для отримання ролі користувача
CREATE OR REPLACE FUNCTION get_user_role(p_user_id INTEGER)
RETURNS TABLE (role_name VARCHAR, display_name VARCHAR) AS $$
BEGIN
    RETURN QUERY
    SELECT r.name, r.display_name
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Коментарі до функцій
COMMENT ON FUNCTION user_has_permission IS 'Перевіряє чи має користувач певний дозвіл';
COMMENT ON FUNCTION get_user_permissions IS 'Повертає список всіх дозволів користувача';
COMMENT ON FUNCTION get_user_role IS 'Повертає роль користувача';

-- ============================================================================
-- ЗАВЕРШЕННЯ
-- ============================================================================
-- Виводимо підсумкову статистику
DO $$
DECLARE
    roles_count INTEGER;
    permissions_count INTEGER;
    role_permissions_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO roles_count FROM roles;
    SELECT COUNT(*) INTO permissions_count FROM permissions;
    SELECT COUNT(*) INTO role_permissions_count FROM role_permissions;
    
    RAISE NOTICE '============================================';
    RAISE NOTICE 'RBAC система успішно налаштована!';
    RAISE NOTICE 'Створено ролей: %', roles_count;
    RAISE NOTICE 'Створено дозволів: %', permissions_count;
    RAISE NOTICE 'Створено зв''язків роль-дозвіл: %', role_permissions_count;
    RAISE NOTICE '============================================';
END
$$;

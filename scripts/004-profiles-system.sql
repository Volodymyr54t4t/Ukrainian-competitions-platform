-- ============================================================================
-- Система профілів для платформи "Єдина платформа конкурсів України"
-- Версія: 1.0
-- Дата: 2026-04-11
-- ============================================================================

-- ============================================================================
-- КРОК 1: Створення таблиці закладів освіти (institutions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS institutions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(100),
    type VARCHAR(50) NOT NULL DEFAULT 'school',
    -- school, lyceum, gymnasium, college, university, other
    region VARCHAR(100),
    city VARCHAR(100),
    address TEXT,
    edrpou VARCHAR(20),
    -- код ЄДРПОУ
    email VARCHAR(100),
    phone VARCHAR(50),
    website VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Індекси для швидкого пошуку
CREATE INDEX IF NOT EXISTS idx_institutions_name ON institutions(name);
CREATE INDEX IF NOT EXISTS idx_institutions_type ON institutions(type);
CREATE INDEX IF NOT EXISTS idx_institutions_region ON institutions(region);
CREATE INDEX IF NOT EXISTS idx_institutions_city ON institutions(city);
CREATE INDEX IF NOT EXISTS idx_institutions_active ON institutions(is_active);

-- Коментарі до таблиці institutions
COMMENT ON TABLE institutions IS 'Таблиця освітніх закладів';
COMMENT ON COLUMN institutions.id IS 'Унікальний ідентифікатор закладу';
COMMENT ON COLUMN institutions.name IS 'Повна назва закладу';
COMMENT ON COLUMN institutions.short_name IS 'Скорочена назва закладу';
COMMENT ON COLUMN institutions.type IS 'Тип закладу (school, lyceum, gymnasium, college, university, other)';
COMMENT ON COLUMN institutions.region IS 'Область';
COMMENT ON COLUMN institutions.city IS 'Місто/село';
COMMENT ON COLUMN institutions.address IS 'Повна адреса';
COMMENT ON COLUMN institutions.edrpou IS 'Код ЄДРПОУ';
COMMENT ON COLUMN institutions.is_active IS 'Чи активний заклад';

-- ============================================================================
-- КРОК 2: Створення таблиці профілів (profiles)
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    
    -- Загальні поля для всіх ролей
    middle_name VARCHAR(50),
    phone VARCHAR(50),
    date_of_birth DATE,
    gender VARCHAR(20),
    -- male, female, other
    avatar_url TEXT,
    bio TEXT,
    
    -- Прив'язка до закладу (для всіх крім admin)
    institution_id INTEGER REFERENCES institutions(id) ON DELETE SET NULL,
    
    -- Поля для учня (student)
    student_class VARCHAR(20),
    -- клас (1-11, або курс 1-4)
    student_parallel VARCHAR(10),
    -- паралель (А, Б, В...)
    student_specialization VARCHAR(100),
    -- спеціалізація/профіль
    parent_name VARCHAR(150),
    -- ПІБ батьків/опікунів
    parent_phone VARCHAR(50),
    parent_email VARCHAR(100),
    
    -- Поля для вчителя (teacher)
    teacher_subject VARCHAR(100),
    -- предмет викладання
    teacher_category VARCHAR(50),
    -- категорія (спеціаліст, перша, вища, тощо)
    teacher_experience_years INTEGER,
    -- стаж роботи в роках
    teacher_education TEXT,
    -- освіта (виш, спеціальність)
    teacher_position VARCHAR(100),
    -- посада
    
    -- Поля для методиста (methodist)
    methodist_department VARCHAR(100),
    -- відділ
    methodist_specialization VARCHAR(100),
    -- напрям роботи
    methodist_qualification VARCHAR(100),
    -- кваліфікація
    
    -- Поля для судді (judge)
    judge_specialization VARCHAR(100),
    -- спеціалізація оцінювання
    judge_experience_years INTEGER,
    -- досвід суддівства
    judge_certifications TEXT,
    -- сертифікати
    
    -- Поля для адміністратора (admin)
    admin_department VARCHAR(100),
    -- відділ
    admin_position VARCHAR(100),
    -- посада
    
    -- Статус профілю
    is_complete BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    
    -- Метадані
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Індекси для швидкого пошуку
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_institution_id ON profiles(institution_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_complete ON profiles(is_complete);

-- Коментарі до таблиці profiles
COMMENT ON TABLE profiles IS 'Таблиця профілів користувачів з полями специфічними для кожної ролі';
COMMENT ON COLUMN profiles.user_id IS 'Посилання на користувача (1 до 1)';
COMMENT ON COLUMN profiles.institution_id IS 'Посилання на заклад освіти';
COMMENT ON COLUMN profiles.is_complete IS 'Чи заповнений профіль повністю';

-- ============================================================================
-- КРОК 3: Вставка тестових закладів освіти
-- ============================================================================
INSERT INTO institutions (name, short_name, type, region, city, address, email, phone) VALUES
    ('Київська гімназія №1 імені Т.Г. Шевченка', 'КГ №1', 'gymnasium', 'Київська', 'Київ', 'вул. Хрещатик, 1', 'gym1@kyiv.edu.ua', '+380441234567'),
    ('Львівський національний університет імені Івана Франка', 'ЛНУ ім. І. Франка', 'university', 'Львівська', 'Львів', 'вул. Університетська, 1', 'info@lnu.edu.ua', '+380322394701'),
    ('Харківський ліцей №27', 'ХЛ №27', 'lyceum', 'Харківська', 'Харків', 'вул. Сумська, 15', 'lyceum27@kharkiv.edu.ua', '+380577001234'),
    ('Одеська загальноосвітня школа №5', 'ОЗШ №5', 'school', 'Одеська', 'Одеса', 'вул. Дерибасівська, 10', 'school5@odesa.edu.ua', '+380487654321'),
    ('Дніпровський медичний коледж', 'ДМК', 'college', 'Дніпропетровська', 'Дніпро', 'пр. Гагаріна, 25', 'medcollege@dnipro.edu.ua', '+380567890123'),
    ('Запорізька гімназія №3', 'ЗГ №3', 'gymnasium', 'Запорізька', 'Запоріжжя', 'вул. Соборна, 50', 'gym3@zaporizhzhia.edu.ua', '+380612345678'),
    ('Вінницький педагогічний університет', 'ВДПУ', 'university', 'Вінницька', 'Вінниця', 'вул. Острозького, 32', 'info@vspu.edu.ua', '+380432654321'),
    ('Черкаська спеціалізована школа №17', 'ЧСШ №17', 'school', 'Черкаська', 'Черкаси', 'вул. Шевченка, 100', 'school17@cherkasy.edu.ua', '+380472987654'),
    ('Полтавський ліцей інформаційних технологій', 'ПЛІТ', 'lyceum', 'Полтавська', 'Полтава', 'вул. Європейська, 5', 'plit@poltava.edu.ua', '+380532123456'),
    ('Житомирський коледж культури і мистецтв', 'ЖККМ', 'college', 'Житомирська', 'Житомир', 'вул. Київська, 77', 'college@zhytomyr.edu.ua', '+380412789012')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- КРОК 4: Створення функції для автоматичного оновлення updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Тригер для таблиці profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Тригер для таблиці institutions
DROP TRIGGER IF EXISTS update_institutions_updated_at ON institutions;
CREATE TRIGGER update_institutions_updated_at
    BEFORE UPDATE ON institutions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- КРОК 5: Створення функції для перевірки заповненості профілю
-- ============================================================================
CREATE OR REPLACE FUNCTION check_profile_completeness(p_profile_id INTEGER, p_role VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    profile_record RECORD;
    is_complete BOOLEAN := TRUE;
BEGIN
    SELECT * INTO profile_record FROM profiles WHERE id = p_profile_id;
    
    IF profile_record IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Перевірка базових полів (обов'язкові для всіх)
    IF profile_record.phone IS NULL OR profile_record.phone = '' THEN
        is_complete := FALSE;
    END IF;
    
    -- Перевірка закладу (обов'язковий для всіх крім admin)
    IF p_role != 'admin' AND profile_record.institution_id IS NULL THEN
        is_complete := FALSE;
    END IF;
    
    -- Специфічні перевірки для кожної ролі
    CASE p_role
        WHEN 'student' THEN
            IF profile_record.student_class IS NULL OR profile_record.student_class = '' THEN
                is_complete := FALSE;
            END IF;
        WHEN 'teacher' THEN
            IF profile_record.teacher_subject IS NULL OR profile_record.teacher_subject = '' THEN
                is_complete := FALSE;
            END IF;
        WHEN 'methodist' THEN
            IF profile_record.methodist_department IS NULL OR profile_record.methodist_department = '' THEN
                is_complete := FALSE;
            END IF;
        WHEN 'judge' THEN
            IF profile_record.judge_specialization IS NULL OR profile_record.judge_specialization = '' THEN
                is_complete := FALSE;
            END IF;
        ELSE
            -- Для admin та інших ролей немає додаткових обов'язкових полів
            NULL;
    END CASE;
    
    RETURN is_complete;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_profile_completeness IS 'Перевіряє чи заповнений профіль для відповідної ролі';

-- ============================================================================
-- ЗАВЕРШЕННЯ
-- ============================================================================
DO $$
DECLARE
    institutions_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO institutions_count FROM institutions;
    
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Система профілів успішно налаштована!';
    RAISE NOTICE 'Створено закладів: %', institutions_count;
    RAISE NOTICE '============================================';
END
$$;

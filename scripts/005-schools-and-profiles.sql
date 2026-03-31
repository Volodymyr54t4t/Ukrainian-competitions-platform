-- ============================================================================
-- Таблиця навчальних закладів та профілів користувачів
-- Версія: 1.0
-- Дата: 2026-03-31
-- ============================================================================

-- ============================================================================
-- КРОК 1: Створення таблиці регіонів
-- ============================================================================
CREATE TABLE IF NOT EXISTS regions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставка областей України
INSERT INTO regions (name, code) VALUES
    ('Вінницька область', 'VIN'),
    ('Волинська область', 'VOL'),
    ('Дніпропетровська область', 'DNI'),
    ('Донецька область', 'DON'),
    ('Житомирська область', 'ZHY'),
    ('Закарпатська область', 'ZAK'),
    ('Запорізька область', 'ZAP'),
    ('Івано-Франківська область', 'IVF'),
    ('Київська область', 'KYI'),
    ('Кіровоградська область', 'KIR'),
    ('Луганська область', 'LUG'),
    ('Львівська область', 'LVI'),
    ('Миколаївська область', 'MYK'),
    ('Одеська область', 'ODE'),
    ('Полтавська область', 'POL'),
    ('Рівненська область', 'RIV'),
    ('Сумська область', 'SUM'),
    ('Тернопільська область', 'TER'),
    ('Харківська область', 'KHA'),
    ('Херсонська область', 'KHE'),
    ('Хмельницька область', 'KHM'),
    ('Черкаська область', 'CHK'),
    ('Чернівецька область', 'CHN'),
    ('Чернігівська область', 'CHG'),
    ('м. Київ', 'KYV')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- КРОК 2: Створення таблиці міст
-- ============================================================================
CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    region_id INTEGER REFERENCES regions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, region_id)
);

-- Індекс для швидкого пошуку
CREATE INDEX IF NOT EXISTS idx_cities_region ON cities(region_id);

-- Вставка міста Житомир
INSERT INTO cities (name, region_id) VALUES
    ('Житомир', (SELECT id FROM regions WHERE code = 'ZHY'))
ON CONFLICT (name, region_id) DO NOTHING;

-- ============================================================================
-- КРОК 3: Створення таблиці навчальних закладів
-- ============================================================================
CREATE TABLE IF NOT EXISTS schools (
    id SERIAL PRIMARY KEY,
    system_id VARCHAR(20) UNIQUE,
    full_name VARCHAR(500) NOT NULL,
    short_name VARCHAR(200),
    ownership_type VARCHAR(50), -- 'державна', 'комунальна', 'приватна'
    address TEXT,
    city_id INTEGER REFERENCES cities(id) ON DELETE SET NULL,
    region_id INTEGER REFERENCES regions(id) ON DELETE SET NULL,
    budget_code VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Індекси
CREATE INDEX IF NOT EXISTS idx_schools_city ON schools(city_id);
CREATE INDEX IF NOT EXISTS idx_schools_region ON schools(region_id);
CREATE INDEX IF NOT EXISTS idx_schools_ownership ON schools(ownership_type);

-- ============================================================================
-- КРОК 4: Вставка навчальних закладів Житомира
-- ============================================================================
INSERT INTO schools (system_id, full_name, short_name, ownership_type, address, city_id, region_id, budget_code) VALUES
    ('15699', 'Салезіянський приватний ліцей "Всесвіт" м.Житомира', 'Салезіянський ліцей "Всесвіт"', 'приватна', 'вул. Корабельна, 10', (SELECT id FROM cities WHERE name = 'Житомир'), (SELECT id FROM regions WHERE code = 'ZHY'), '2900000000'),
    ('16907', 'Вересівський ліцей Житомирської міської ради', 'Вересівський ліцей Житомирської міської ради', 'комунальна', 'с.Вереси, вул. Шевченка, 1', (SELECT id FROM cities WHERE name = 'Житомир'), (SELECT id FROM regions WHERE code = 'ZHY'), '0655200000'),
    ('24634', 'Відокремлений підрозділ "Заклад загальної середньої освіти І-ІІІ ступенів "Житомирський ліцей Київського інституту бізнесу та технологій"', 'Житомирський ліцей КІБіТ', 'приватна', 'Комерційна, 2', (SELECT id FROM cities WHERE name = 'Житомир'), (SELECT id FROM regions WHERE code = 'ZHY'), '2900000000'),
    ('24081', 'Відокремлений підрозділ "Науковий ліцей Житомирського державного університету імені Івана Франка"', 'Науковий ліцей ЖДУ ім. Івана Франка', 'державна', 'вул. Велика Бердичівська, 40', (SELECT id FROM cities WHERE name = 'Житомир'), (SELECT id FROM regions WHERE code = 'ZHY'), '3000000000'),
    ('24618', 'Відокремлений структурний підрозділ "Науковий ліцей Поліського національного університету"', 'Науковий ліцей ПолісНУ', 'державна', 'Б.Старий, 9', (SELECT id FROM cities WHERE name = 'Житомир'), (SELECT id FROM regions WHERE code = 'ZHY'), '3000000000'),
    ('15697', 'ЖИТОМИРСЬКИЙ ПРИВАТНИЙ ХРИСТИЯНСЬКИЙ ЛІЦЕЙ "СЯЙВО" М.ЖИТОМИРА', 'ЖПХЛ "Сяйво"', 'приватна', 'вул. Коцюбинського, 5', (SELECT id FROM cities WHERE name = 'Житомир'), (SELECT id FROM regions WHERE code = 'ZHY'), '2900000000'),
    ('15671', 'Ліцей № 10 міста Житомира', 'Ліцей № 10 м. Житомира', 'комунальна', 'шосе Київське шосе, 37', (SELECT id FROM cities WHERE name = 'Житомир'), (SELECT id FROM regions WHERE code = 'ZHY'), '0655200000'),
    ('15679', 'Ліцей № 21 міста Житомира', 'Ліцей № 21 м. Житомира', 'комунальна', 'вул. Святослава Ріхтера, 6а', (SELECT id FROM cities WHERE name = 'Житомир'), (SELECT id FROM regions WHERE code = 'ZHY'), '0655200000'),
    ('15668', 'Ліцей № 6 міста Житомира ім. В.Г. Короленка', 'Ліцей № 6 м. Житомира ім. В.Г. Короленка', 'комунальна', 'майдан Короленка, 7', (SELECT id FROM cities WHERE name = 'Житомир'), (SELECT id FROM regions WHERE code = 'ZHY'), '0655200000'),
    ('15693', 'Ліцей № 1 міста Житомира', 'Ліцей № 1 м. Житомира', 'комунальна', 'просп. Миру, 26', (SELECT id FROM cities WHERE name = 'Житомир'), (SELECT id FROM regions WHERE code = 'ZHY'), '0655200000'),
    ('15672', 'Ліцей № 12 міста Житомира ім. С. Ковальчука', 'Ліцей № 12 м. Житомира ім. С. Ковальчука', 'комунальна', 'б-р Старий, 4', (SELECT id FROM cities WHERE name = 'Житомир'), (SELECT id FROM regions WHERE code = 'ZHY'), '0655200000'),
    ('15673', 'Ліцей № 14 міста Житомира', 'Ліцей № 14 м. Житомира', 'комунальна', 'вул. Кибальчича, 7', (SELECT id FROM cities WHERE name = 'Житомир'), (SELECT id FROM regions WHERE code = 'ZHY'), '0655200000'),
    ('15674', 'Ліцей № 15 міста Житомира', 'Ліцей № 15 м. Житомира', 'комунальна', 'вул. Вільський Шлях, 261', (SELECT id FROM cities WHERE name = 'Житомир'), (SELECT id FROM regions WHERE code = 'ZHY'), '0655200000'),
    ('15675', 'Ліцей № 16 міста Житомира', 'Ліцей № 16 м. Житомира', 'комунальна', 'вул. Тараса Бульби-Боровця, 15', (SELECT id FROM cities WHERE name = 'Житомир'), (SELECT id FROM regions WHERE code = 'ZHY'), '0655200000'),
    ('15676', 'Ліцей № 17 міста Житомира', 'Ліцей № 17 м. Житомира', 'комунальна', 'вул. Київська, 49', (SELECT id FROM cities WHERE name = 'Житомир'), (SELECT id FROM regions WHERE code = 'ZHY'), '0655200000'),
    ('15677', 'Ліцей №19 міста Житомира', 'Ліцей № 19 м. Житомира', 'комунальна', 'вул. Лесі Українки, 71', (SELECT id FROM cities WHERE name = 'Житомир'), (SELECT id FROM regions WHERE code = 'ZHY'), '0655200000'),
    ('15665', 'Ліцей № 2 міста Житомира', 'Ліцей № 2 м. Житомира', 'комунальна', 'вул. Саєнка, 56', (SELECT id FROM cities WHERE name = 'Житомир'), (SELECT id FROM regions WHERE code = 'ZHY'), '0655200000'),
    ('15678', 'Ліцей № 20 міста Житомира', 'Ліцей № 20 м. Житомира', 'комунальна', 'вул. Східна, 65', (SELECT id FROM cities WHERE name = 'Житомир'), (SELECT id FROM regions WHERE code = 'ZHY'), '0655200000'),
    ('15680', 'Ліцей № 22 міста Житомира імені Василя Михайловича Кавуна', 'Ліцей № 22 м. Житомира ім. В. Кавуна', 'комунальна', 'вул. Космонавтів, 36', (SELECT id FROM cities WHERE name = 'Житомир'), (SELECT id FROM regions WHERE code = 'ZHY'), '0655200000'),
    ('15681', 'Ліцей № 23 міста Житомира ім. М. Очерета', 'Ліцей № 23 м. Житомира ім. М.Очерета', 'комунальна', 'вул. Лятошинського, 14', (SELECT id FROM cities WHERE name = 'Житомир'), (SELECT id FROM regions WHERE code = 'ZHY'), '0655200000'),
    ('15682', 'Ліцей № 24 міста Житомира', 'Ліцей № 24 м. Житомира', 'комунальна', 'вул. Шевченка, 105-Б', (SELECT id FROM cities WHERE name = 'Житомир'), (SELECT id FROM regions WHERE code = 'ZHY'), '0655200000'),
    ('15683', 'Ліцей № 25 міста Житомира', 'Ліцей № 25 м. Житомира', 'комунальна', 'вул. Мала Бердичівська, 18', (SELECT id FROM cities WHERE name = 'Житомир'), (SELECT id FROM regions WHERE code = 'ZHY'), '0655200000'),
    ('15684', 'Ліцей № 26 міста Житомира', 'Ліцей № 26 м. Житомира', 'комунальна', 'просп. Миру, 59', (SELECT id FROM cities WHERE name = 'Житомир'), (SELECT id FROM regions WHERE code = 'ZHY'), '0655200000'),
    ('15685', 'Ліцей № 27 міста Житомира', 'Ліцей № 27 м. Житомира', 'комунальна', 'просп. миру, 27', (SELECT id FROM cities WHERE name = 'Житомир'), (SELECT id FROM regions WHERE code = 'ZHY'), '0655200000'),
    ('15686', 'Ліцей № 28 міста Житомира імені гетьмана Івана Виговського', 'Ліцей № 28 м. Житомира ім. Гетьмана І. Виговського', 'комунальна', 'вул. Тараса Бульби-Боровця, 17', (SELECT id FROM cities WHERE name = 'Житомир'), (SELECT id FROM regions WHERE code = 'ZHY'), '0655200000'),
    ('15666', 'Ліцей № 3 міста Житомира', 'Ліцей № 3 м. Житомира', 'комунальна', 'вул. Грушевського, 8', (SELECT id FROM cities WHERE name = 'Житомир'), (SELECT id FROM regions WHERE code = 'ZHY'), '0655200000'),
    ('15687', 'Ліцей № 30 міста Житомира', 'Ліцей № 30 м.Житомира', 'комунальна', 'пров. Шкільний, 4', (SELECT id FROM cities WHERE name = 'Житомир'), (SELECT id FROM regions WHERE code = 'ZHY'), '0655200000'),
    ('15694', 'Ліцей № 31 міста Житомира', 'Ліцей № 31 м. Житомира', 'комунальна', 'вул. Вітрука, 55', (SELECT id FROM cities WHERE name = 'Житомир'), (SELECT id FROM regions WHERE code = 'ZHY'), '0655200000'),
    ('15688', 'Ліцей № 32 міста Житомира', 'Ліцей № 32 м. Житомира', 'комунальна', 'вул. Чуднівська, 48', (SELECT id FROM cities WHERE name = 'Житомир'), (SELECT id FROM regions WHERE code = 'ZHY'), '0655200000'),
    ('15689', 'Ліцей № 33 міста Житомира', 'Ліцей № 33 м. Житомира', 'комунальна', 'вул. Велика Бердичівська, 52', (SELECT id FROM cities WHERE name = 'Житомир'), (SELECT id FROM regions WHERE code = 'ZHY'), '0655200000'),
    ('15690', 'Ліцей № 34 міста Житомира', 'Ліцей № 34 м. Житомира', 'комунальна', 'вул. Івана Мазепи, 18', (SELECT id FROM cities WHERE name = 'Житомир'), (SELECT id FROM regions WHERE code = 'ZHY'), '0655200000'),
    ('15691', 'Ліцей № 35 міста Житомира', 'Ліцей № 35 м. Житомира', 'комунальна', 'вул. Івана Мазепи, 95-А', (SELECT id FROM cities WHERE name = 'Житомир'), (SELECT id FROM regions WHERE code = 'ZHY'), '0655200000'),
    ('15692', 'Ліцей № 36 міста Житомира ім. Я. Домбровського', 'Ліцей № 36 м. Житомира ім. Я. Домбровського', 'комунальна', 'вул. Домбровського, 21', (SELECT id FROM cities WHERE name = 'Житомир'), (SELECT id FROM regions WHERE code = 'ZHY'), '0655200000'),
    ('15664', 'Ліцей № 4 міста Житомира', 'Ліцей № 4 м. Житомира', 'комунальна', 'вул. Троянівська, 26', (SELECT id FROM cities WHERE name = 'Житомир'), (SELECT id FROM regions WHERE code = 'ZHY'), '0655200000'),
    ('15667', 'Ліцей № 5 міста Житомира', 'Ліцей № 5 м. Житомира', 'комунальна', 'вул. Клосовського, 16', (SELECT id FROM cities WHERE name = 'Житомир'), (SELECT id FROM regions WHERE code = 'ZHY'), '0655200000'),
    ('15669', 'Ліцей № 7 міста Житомира імені Валерія Вікторовича Бражевського', 'Ліцей № 7 м. Житомира ім. В.Бражевського', 'комунальна', 'вул. Перемоги, 79', (SELECT id FROM cities WHERE name = 'Житомир'), (SELECT id FROM regions WHERE code = 'ZHY'), '0655200000'),
    ('15670', 'Ліцей № 8 міста Житомира', 'Ліцей № 8 м. Житомира', 'комунальна', 'майдан Згоди, 5', (SELECT id FROM cities WHERE name = 'Житомир'), (SELECT id FROM regions WHERE code = 'ZHY'), '0655200000'),
    ('24066', 'Відокремлений підрозділ «Науковий ліцей» Державного університету «Житомирська політехніка»', 'Науковий ліцей Житомирської політехніки', 'державна', 'вул. Чуднівська, 103', (SELECT id FROM cities WHERE name = 'Житомир'), (SELECT id FROM regions WHERE code = 'ZHY'), '3000000000'),
    ('15698', 'Приватний ліцей "Ор Авнер" міста Житомира', 'ПЛ "Ор Авнер" м. Житомира', 'приватна', 'вул. Григорія Сковороди, 57', (SELECT id FROM cities WHERE name = 'Житомир'), (SELECT id FROM regions WHERE code = 'ZHY'), '2900000000'),
    ('20075', 'Початкова школа № 11 міста Житомира', 'Початкова школа № 11 м. Житомира', 'комунальна', 'вул. Західна, 110', (SELECT id FROM cities WHERE name = 'Житомир'), (SELECT id FROM regions WHERE code = 'ZHY'), '0655200000'),
    ('24592', 'Товариство з обмеженою відповідальністю загальноосвітній навчальний заклад "Синергія"', 'ТОВ "ЗНЗ""Синергія"', 'приватна', 'вул. Князів Острозьких, 8а к5', (SELECT id FROM cities WHERE name = 'Житомир'), (SELECT id FROM regions WHERE code = 'ZHY'), '2900000000'),
    ('24031', 'Товариство з обмеженою відповідальністю «ЗАКЛАД ОСВІТИ «УСПІХ»', 'ТОВ «ЗАКЛАД ОСВІТИ «УСПІХ»', 'приватна', 'пров. Кар''єрний 2, 13', (SELECT id FROM cities WHERE name = 'Житомир'), (SELECT id FROM regions WHERE code = 'ZHY'), '2900000000'),
    ('24106', 'ТОВАРИСТВО З ОБМЕЖЕНОЮ ВІДПОВІДАЛЬНІСТЮ «ПРИВАТНИЙ ЛІЦЕЙ «АЙ ТІ СТЕП СКУЛ ЖИТОМИР»', 'ТОВ «ПРИВАТНИЙ ЛІЦЕЙ «АЙ ТІ СТЕП СКУЛ ЖИТОМИР»', 'приватна', 'вул. Перемоги, 29', (SELECT id FROM cities WHERE name = 'Житомир'), (SELECT id FROM regions WHERE code = 'ZHY'), '2900000000')
ON CONFLICT (system_id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    short_name = EXCLUDED.short_name,
    ownership_type = EXCLUDED.ownership_type,
    address = EXCLUDED.address,
    updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- КРОК 5: Створення таблиці профілів користувачів
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Спільні поля для всіх ролей
    middle_name VARCHAR(50),
    phone VARCHAR(20),
    avatar_url TEXT,
    date_of_birth DATE,
    city_id INTEGER REFERENCES cities(id),
    region_id INTEGER REFERENCES regions(id),
    
    -- Поля для учня (student)
    grade VARCHAR(10), -- клас: 1-11
    school_id INTEGER REFERENCES schools(id),
    interests TEXT[], -- предмети інтересу
    participation_level VARCHAR(50), -- рівень участі
    achievements TEXT,
    certificates_urls TEXT[], -- файли дипломів/сертифікатів
    portfolio_url TEXT, -- портфоліо/GitHub
    mentor_id INTEGER REFERENCES users(id), -- наставник (вчитель)
    average_score DECIMAL(3,2), -- середній бал
    previous_competitions TEXT[], -- попередні конкурси
    strengths TEXT[], -- сильні сторони
    
    -- Поля для вчителя (teacher)
    position VARCHAR(100), -- посада
    experience_years INTEGER, -- стаж роботи
    subjects TEXT[], -- предмети викладання
    teaching_grades TEXT[], -- класи
    student_achievements TEXT,
    preparation_experience TEXT, -- досвід підготовки
    teacher_portfolio_url TEXT,
    rating DECIMAL(3,2), -- рейтинг
    winners_count INTEGER DEFAULT 0, -- кількість переможців
    
    -- Поля для завуча (vice_principal)
    school_contact_info JSONB, -- контактні дані школи
    school_statistics JSONB, -- статистика школи
    school_rating DECIMAL(3,2), -- рейтинг школи
    participants_count INTEGER DEFAULT 0, -- кількість учасників
    victories_count INTEGER DEFAULT 0, -- кількість перемог
    
    -- Поля для методиста (methodist)
    organization VARCHAR(200), -- організація
    activity_direction TEXT, -- напрям діяльності
    managed_competitions TEXT[], -- конкурси під управлінням
    competition_templates TEXT[], -- шаблони конкурсів
    regional_schools INTEGER[], -- школи регіону (IDs)
    regional_statistics JSONB, -- статистика регіону
    access_rights JSONB, -- права доступу
    
    -- Поля для журі (judge)
    specialization TEXT, -- спеціалізація
    judge_organization VARCHAR(200),
    country VARCHAR(100),
    judge_position VARCHAR(100),
    judge_experience TEXT, -- досвід
    evaluation_directions TEXT[], -- напрями оцінювання
    assigned_competitions INTEGER[], -- призначені конкурси
    works_to_evaluate INTEGER DEFAULT 0, -- роботи для оцінювання
    
    -- Системні поля
    is_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Індекси
CREATE INDEX IF NOT EXISTS idx_user_profiles_user ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_school ON user_profiles(school_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_city ON user_profiles(city_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_region ON user_profiles(region_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_mentor ON user_profiles(mentor_id);

-- Коментарі
COMMENT ON TABLE user_profiles IS 'Розширені профілі користувачів з даними для різних ролей';
COMMENT ON COLUMN user_profiles.grade IS 'Клас учня (1-11)';
COMMENT ON COLUMN user_profiles.interests IS 'Масив предметів інтересу учня';
COMMENT ON COLUMN user_profiles.subjects IS 'Масив предметів, які викладає вчитель';

-- ============================================================================
-- КРОК 6: Функція для отримання шкіл за регіоном
-- ============================================================================
CREATE OR REPLACE FUNCTION get_schools_by_region(p_region_code VARCHAR)
RETURNS TABLE (
    school_id INTEGER,
    school_name VARCHAR,
    short_name VARCHAR,
    ownership_type VARCHAR,
    address TEXT,
    city_name VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.full_name,
        s.short_name,
        s.ownership_type,
        s.address,
        c.name
    FROM schools s
    LEFT JOIN cities c ON s.city_id = c.id
    LEFT JOIN regions r ON s.region_id = r.id
    WHERE r.code = p_region_code AND s.is_active = true
    ORDER BY s.short_name;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- КРОК 7: Функція для оновлення профілю
-- ============================================================================
CREATE OR REPLACE FUNCTION upsert_user_profile(
    p_user_id INTEGER,
    p_profile_data JSONB
)
RETURNS INTEGER AS $$
DECLARE
    v_profile_id INTEGER;
BEGIN
    INSERT INTO user_profiles (user_id)
    VALUES (p_user_id)
    ON CONFLICT (user_id) DO NOTHING;
    
    UPDATE user_profiles
    SET 
        middle_name = COALESCE(p_profile_data->>'middle_name', middle_name),
        phone = COALESCE(p_profile_data->>'phone', phone),
        avatar_url = COALESCE(p_profile_data->>'avatar_url', avatar_url),
        date_of_birth = COALESCE((p_profile_data->>'date_of_birth')::DATE, date_of_birth),
        city_id = COALESCE((p_profile_data->>'city_id')::INTEGER, city_id),
        region_id = COALESCE((p_profile_data->>'region_id')::INTEGER, region_id),
        grade = COALESCE(p_profile_data->>'grade', grade),
        school_id = COALESCE((p_profile_data->>'school_id')::INTEGER, school_id),
        position = COALESCE(p_profile_data->>'position', position),
        experience_years = COALESCE((p_profile_data->>'experience_years')::INTEGER, experience_years),
        organization = COALESCE(p_profile_data->>'organization', organization),
        specialization = COALESCE(p_profile_data->>'specialization', specialization),
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = p_user_id
    RETURNING id INTO v_profile_id;
    
    RETURN v_profile_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ЗАВЕРШЕННЯ
-- ============================================================================
DO $$
DECLARE
    schools_count INTEGER;
    regions_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO schools_count FROM schools;
    SELECT COUNT(*) INTO regions_count FROM regions;
    
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Таблиці навчальних закладів та профілів створено!';
    RAISE NOTICE 'Регіонів: %', regions_count;
    RAISE NOTICE 'Навчальних закладів: %', schools_count;
    RAISE NOTICE '============================================';
END
$$;

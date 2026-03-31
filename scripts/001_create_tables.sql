-- =============================================
-- ТАБЛИЦЯ РЕГІОНІВ
-- =============================================
CREATE TABLE IF NOT EXISTS regions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- ТАБЛИЦЯ МІСТ
-- =============================================
CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY,
    region_id INTEGER REFERENCES regions(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(region_id, name)
);

-- =============================================
-- ТАБЛИЦЯ НАВЧАЛЬНИХ ЗАКЛАДІВ (УНІВЕРСАЛЬНА)
-- =============================================
CREATE TABLE IF NOT EXISTS schools (
    id SERIAL PRIMARY KEY,
    system_id INTEGER UNIQUE,
    city_id INTEGER REFERENCES cities(id) ON DELETE CASCADE,
    full_name VARCHAR(500) NOT NULL,
    short_name VARCHAR(200),
    ownership_type VARCHAR(50), -- 'комунальна', 'приватна', 'державна'
    address TEXT,
    budget_type VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Індекс для швидкого пошуку по місту
CREATE INDEX IF NOT EXISTS idx_schools_city ON schools(city_id);

-- =============================================
-- ТАБЛИЦЯ ПРЕДМЕТІВ
-- =============================================
CREATE TABLE IF NOT EXISTS subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- ТАБЛИЦЯ РОЛЕЙ
-- =============================================
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставка ролей
INSERT INTO roles (name, description) VALUES 
    ('student', 'Учень'),
    ('teacher', 'Вчитель'),
    ('vice_principal', 'Завуч'),
    ('methodist', 'Методист'),
    ('jury', 'Журі'),
    ('admin', 'Адміністратор')
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- ОСНОВНА ТАБЛИЦЯ КОРИСТУВАЧІВ
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER REFERENCES roles(id) ON DELETE SET NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    photo_url TEXT,
    city_id INTEGER REFERENCES cities(id),
    region_id INTEGER REFERENCES regions(id),
    is_verified BOOLEAN DEFAULT FALSE,
    account_status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'banned'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Індекси
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- =============================================
-- ПРОФІЛЬ УЧНЯ
-- =============================================
CREATE TABLE IF NOT EXISTS student_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    school_id INTEGER REFERENCES schools(id),
    birth_date DATE,
    class_name VARCHAR(10), -- '9-А', '11-Б' тощо
    participation_level VARCHAR(50), -- 'шкільний', 'районний', 'обласний', 'всеукраїнський'
    achievements TEXT,
    certificates_files JSONB, -- [{url: '', name: '', date: ''}]
    portfolio_url TEXT,
    github_url TEXT,
    mentor_id INTEGER REFERENCES users(id),
    average_grade DECIMAL(3,2),
    previous_competitions JSONB, -- [{name: '', year: '', result: ''}]
    strengths TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблиця предметів інтересу учня (many-to-many)
CREATE TABLE IF NOT EXISTS student_subjects (
    student_profile_id INTEGER REFERENCES student_profiles(id) ON DELETE CASCADE,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    PRIMARY KEY (student_profile_id, subject_id)
);

-- =============================================
-- ПРОФІЛЬ ВЧИТЕЛЯ
-- =============================================
CREATE TABLE IF NOT EXISTS teacher_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    school_id INTEGER REFERENCES schools(id),
    position VARCHAR(100),
    experience_years INTEGER,
    portfolio_url TEXT,
    rating DECIMAL(3,2),
    winners_count INTEGER DEFAULT 0,
    preparation_experience TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Предмети викладання вчителя
CREATE TABLE IF NOT EXISTS teacher_subjects (
    teacher_profile_id INTEGER REFERENCES teacher_profiles(id) ON DELETE CASCADE,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    PRIMARY KEY (teacher_profile_id, subject_id)
);

-- Класи вчителя
CREATE TABLE IF NOT EXISTS teacher_classes (
    id SERIAL PRIMARY KEY,
    teacher_profile_id INTEGER REFERENCES teacher_profiles(id) ON DELETE CASCADE,
    class_name VARCHAR(10) NOT NULL
);

-- Учні вчителя
CREATE TABLE IF NOT EXISTS teacher_students (
    teacher_profile_id INTEGER REFERENCES teacher_profiles(id) ON DELETE CASCADE,
    student_profile_id INTEGER REFERENCES student_profiles(id) ON DELETE CASCADE,
    PRIMARY KEY (teacher_profile_id, student_profile_id)
);

-- Досягнення учнів вчителя
CREATE TABLE IF NOT EXISTS teacher_student_achievements (
    id SERIAL PRIMARY KEY,
    teacher_profile_id INTEGER REFERENCES teacher_profiles(id) ON DELETE CASCADE,
    student_name VARCHAR(200),
    achievement TEXT,
    competition_name VARCHAR(200),
    year INTEGER,
    place VARCHAR(50)
);

-- =============================================
-- ПРОФІЛЬ ЗАВУЧА
-- =============================================
CREATE TABLE IF NOT EXISTS vice_principal_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    school_id INTEGER REFERENCES schools(id),
    position VARCHAR(100),
    school_contact_info JSONB, -- {phone: '', email: '', website: ''}
    school_statistics JSONB, -- {students_count: 0, teachers_count: 0, etc}
    school_rating DECIMAL(3,2),
    participants_count INTEGER DEFAULT 0,
    wins_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Список вчителів школи (через school_id)
-- Список учнів школи (через school_id)
-- Участь у конкурсах - окрема таблиця

-- =============================================
-- ПРОФІЛЬ МЕТОДИСТА
-- =============================================
CREATE TABLE IF NOT EXISTS methodist_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    organization VARCHAR(200),
    role_title VARCHAR(100),
    activity_direction TEXT,
    access_rights JSONB, -- {can_create_competitions: true, can_manage_schools: true, etc}
    regional_statistics JSONB, -- {schools_count: 0, students_count: 0, etc}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Конкурси під управлінням методиста
CREATE TABLE IF NOT EXISTS methodist_competitions (
    id SERIAL PRIMARY KEY,
    methodist_profile_id INTEGER REFERENCES methodist_profiles(id) ON DELETE CASCADE,
    competition_name VARCHAR(200),
    year INTEGER,
    status VARCHAR(50) -- 'active', 'completed', 'planned'
);

-- Шаблони конкурсів методиста
CREATE TABLE IF NOT EXISTS methodist_templates (
    id SERIAL PRIMARY KEY,
    methodist_profile_id INTEGER REFERENCES methodist_profiles(id) ON DELETE CASCADE,
    template_name VARCHAR(200),
    template_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- ПРОФІЛЬ ЖУРІ
-- =============================================
CREATE TABLE IF NOT EXISTS jury_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    organization VARCHAR(200),
    specialization VARCHAR(200),
    country VARCHAR(100),
    position VARCHAR(100),
    experience_years INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Напрями оцінювання журі
CREATE TABLE IF NOT EXISTS jury_evaluation_areas (
    id SERIAL PRIMARY KEY,
    jury_profile_id INTEGER REFERENCES jury_profiles(id) ON DELETE CASCADE,
    area_name VARCHAR(100) NOT NULL
);

-- Призначені конкурси для журі
CREATE TABLE IF NOT EXISTS jury_assigned_competitions (
    id SERIAL PRIMARY KEY,
    jury_profile_id INTEGER REFERENCES jury_profiles(id) ON DELETE CASCADE,
    competition_id INTEGER, -- Посилання на таблицю конкурсів
    competition_name VARCHAR(200),
    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'assigned' -- 'assigned', 'in_progress', 'completed'
);

-- Роботи для оцінювання
CREATE TABLE IF NOT EXISTS jury_works_to_evaluate (
    id SERIAL PRIMARY KEY,
    jury_profile_id INTEGER REFERENCES jury_profiles(id) ON DELETE CASCADE,
    work_id INTEGER, -- Посилання на таблицю робіт
    work_title VARCHAR(200),
    student_name VARCHAR(200),
    score DECIMAL(5,2),
    feedback TEXT,
    evaluated_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending' -- 'pending', 'evaluated'
);

-- =============================================
-- ПРОФІЛЬ АДМІНА
-- =============================================
CREATE TABLE IF NOT EXISTS admin_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    admin_role VARCHAR(50) NOT NULL, -- 'super_admin', 'support'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Логи доступу адміна
CREATE TABLE IF NOT EXISTS admin_access_logs (
    id SERIAL PRIMARY KEY,
    admin_profile_id INTEGER REFERENCES admin_profiles(id) ON DELETE CASCADE,
    action VARCHAR(200) NOT NULL,
    target_type VARCHAR(50), -- 'user', 'competition', 'school', etc
    target_id INTEGER,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- ФУНКЦІЯ ОНОВЛЕННЯ updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Тригери для автоматичного оновлення updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_profiles_updated_at BEFORE UPDATE ON student_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teacher_profiles_updated_at BEFORE UPDATE ON teacher_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vice_principal_profiles_updated_at BEFORE UPDATE ON vice_principal_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_methodist_profiles_updated_at BEFORE UPDATE ON methodist_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jury_profiles_updated_at BEFORE UPDATE ON jury_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_profiles_updated_at BEFORE UPDATE ON admin_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON schools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

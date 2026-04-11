-- Таблиця профілю студента для платформи "Єдина платформа конкурсів України"
-- Створення: профіль студента з усіма необхідними полями

-- Таблиця profile_student
CREATE TABLE IF NOT EXISTS profile_student (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    
    -- Основні дані
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    profile_photo VARCHAR(500),
    
    -- Навчальні дані
    class VARCHAR(20), -- Наприклад: "10-А", "11-Б"
    institution VARCHAR(255), -- Навчальний заклад
    city VARCHAR(100), -- Місто
    
    -- Інтереси
    interests TEXT[], -- Масив предметів інтересу
    
    -- Досягнення
    achievements JSONB DEFAULT '[]'::jsonb, -- JSON масив досягнень
    -- Формат: [{"title": "...", "description": "...", "date": "...", "level": "..."}]
    
    -- Сертифікати/Дипломи (необов'язково)
    certificates JSONB DEFAULT '[]'::jsonb, -- JSON масив сертифікатів
    -- Формат: [{"title": "...", "issuer": "...", "date": "...", "file_url": "..."}]
    
    -- Мета дані
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Індекси для оптимізації
CREATE INDEX IF NOT EXISTS idx_profile_student_user_id ON profile_student(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_student_city ON profile_student(city);
CREATE INDEX IF NOT EXISTS idx_profile_student_institution ON profile_student(institution);

-- Тригер для автоматичного оновлення updated_at
CREATE OR REPLACE FUNCTION update_profile_student_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_profile_student_updated_at ON profile_student;
CREATE TRIGGER trigger_update_profile_student_updated_at
    BEFORE UPDATE ON profile_student
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_student_updated_at();

-- Коментарі до таблиці
COMMENT ON TABLE profile_student IS 'Профіль студента/учня з детальною інформацією';
COMMENT ON COLUMN profile_student.interests IS 'Масив предметів інтересу (математика, фізика, інформатика тощо)';
COMMENT ON COLUMN profile_student.achievements IS 'JSON масив досягнень з полями: title, description, date, level';
COMMENT ON COLUMN profile_student.certificates IS 'JSON масив сертифікатів/дипломів з полями: title, issuer, date, file_url';

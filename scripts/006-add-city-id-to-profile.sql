-- Додаємо поле city_id до таблиці profile_student
ALTER TABLE profile_student 
ADD COLUMN IF NOT EXISTS city_id INTEGER REFERENCES ukraine_cities(id);

-- Індекс для пошуку за містом
CREATE INDEX IF NOT EXISTS idx_profile_student_city_id ON profile_student(city_id);

COMMENT ON COLUMN profile_student.city_id IS 'ID міста з таблиці ukraine_cities';

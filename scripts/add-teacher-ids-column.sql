-- Міграція: Додавання колонки teacher_ids до таблиці profile_student
-- Ця колонка зберігає масив ID вчителів, які пов'язані з учнем

-- Додаємо колонку teacher_ids як масив UUID (або INTEGER, якщо ваші ID цілі числа)
-- Варіант 1: Якщо ID вчителів - це UUID
ALTER TABLE profile_student 
ADD COLUMN IF NOT EXISTS teacher_ids UUID[] DEFAULT '{}';

-- Варіант 2: Якщо ID вчителів - це INTEGER (розкоментуйте нижче і закоментуйте вище)
-- ALTER TABLE profile_student 
-- ADD COLUMN IF NOT EXISTS teacher_ids INTEGER[] DEFAULT '{}';

-- Створюємо індекс для швидшого пошуку по teacher_ids
CREATE INDEX IF NOT EXISTS idx_profile_student_teacher_ids 
ON profile_student USING GIN (teacher_ids);

-- Перевірка: виводимо структуру таблиці після змін
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profile_student'
ORDER BY ordinal_position;

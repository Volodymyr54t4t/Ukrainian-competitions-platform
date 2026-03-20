-- Додавання колонки section до таблиці competitions
-- Це дозволить вчителям/методистам вказувати секції при створенні конкурсу

-- Додаємо нову колонку section до таблиці competitions
ALTER TABLE competitions 
ADD COLUMN IF NOT EXISTS section VARCHAR(255);

-- Додаємо коментар до колонки для документації
COMMENT ON COLUMN competitions.section IS 'Секція конкурсу, яку вказує вчитель/методист при створенні';

-- Створюємо індекс для швидкого пошуку за секцією
CREATE INDEX IF NOT EXISTS idx_competitions_section ON competitions(section);

-- Оновлюємо існуючі конкурси з прикладами секцій (необов'язково)
UPDATE competitions 
SET section = CASE 
    WHEN subject = 'mathematics' THEN 'Алгебра та геометрія'
    WHEN subject = 'physics' THEN 'Механіка та електрика'
    WHEN subject = 'informatics' THEN 'Алгоритми та структури даних'
    WHEN subject = 'ukrainian' THEN 'Граматика та стилістика'
    WHEN subject = 'chemistry' THEN 'Органічна хімія'
    WHEN subject = 'biology' THEN 'Анатомія та фізіологія'
    WHEN subject = 'literature' THEN 'Українська література'
    WHEN subject = 'science' THEN 'Природничі дослідження'
    ELSE NULL
END
WHERE section IS NULL;

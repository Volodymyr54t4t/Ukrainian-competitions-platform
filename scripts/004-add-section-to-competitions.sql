-- Додавання колонки sections (масив) до таблиці competitions
-- Це дозволить вчителям/методистам вказувати декілька секцій при створенні конкурсу

-- Видаляємо стару колонку section якщо існує
ALTER TABLE competitions 
DROP COLUMN IF EXISTS section;

-- Додаємо нову колонку sections як TEXT[] (масив текстових значень)
ALTER TABLE competitions 
ADD COLUMN IF NOT EXISTS sections TEXT[] DEFAULT '{}';

-- Додаємо коментар до колонки для документації
COMMENT ON COLUMN competitions.sections IS 'Секції конкурсу (масив), які вказує вчитель/методист при створенні';

-- Створюємо GIN індекс для швидкого пошуку по масиву секцій
CREATE INDEX IF NOT EXISTS idx_competitions_sections ON competitions USING GIN(sections);

-- Оновлюємо існуючі конкурси з прикладами секцій (необов'язково)
UPDATE competitions 
SET sections = CASE 
    WHEN subject = 'mathematics' THEN ARRAY['Алгебра', 'Геометрія', 'Математичний аналіз']
    WHEN subject = 'physics' THEN ARRAY['Механіка', 'Оптика', 'Електрика']
    WHEN subject = 'informatics' THEN ARRAY['Алгоритми', 'Структури даних', 'Web-програмування']
    WHEN subject = 'ukrainian' THEN ARRAY['Граматика', 'Стилістика', 'Творчі роботи']
    WHEN subject = 'chemistry' THEN ARRAY['Органічна хімія', 'Неорганічна хімія']
    WHEN subject = 'biology' THEN ARRAY['Анатомія', 'Фізіологія', 'Екологія']
    WHEN subject = 'literature' THEN ARRAY['Українська література', 'Зарубіжна література']
    WHEN subject = 'science' THEN ARRAY['Природничі дослідження']
    ELSE '{}'
END
WHERE sections = '{}' OR sections IS NULL;

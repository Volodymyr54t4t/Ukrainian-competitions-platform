-- Таблиця міст України
CREATE TABLE IF NOT EXISTS ukraine_cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    region VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Індекс для пошуку міст
CREATE INDEX IF NOT EXISTS idx_ukraine_cities_name ON ukraine_cities(name);

-- Вставка міст України (основні обласні центри та великі міста)
INSERT INTO ukraine_cities (id, name, region) VALUES
(1, 'Київ', 'Київська область'),
(2, 'Харків', 'Харківська область'),
(3, 'Одеса', 'Одеська область'),
(4, 'Дніпро', 'Дніпропетровська область'),
(5, 'Донецьк', 'Донецька область'),
(6, 'Запоріжжя', 'Запорізька область'),
(7, 'Львів', 'Львівська область'),
(8, 'Кривий Ріг', 'Дніпропетровська область'),
(9, 'Миколаїв', 'Миколаївська область'),
(10, 'Маріуполь', 'Донецька область'),
(11, 'Луганськ', 'Луганська область'),
(12, 'Вінниця', 'Вінницька область'),
(13, 'Херсон', 'Херсонська область'),
(14, 'Полтава', 'Полтавська область'),
(15, 'Чернігів', 'Чернігівська область'),
(16, 'Черкаси', 'Черкаська область'),
(17, 'Хмельницький', 'Хмельницька область'),
(18, 'Житомир', 'Житомирська область'),
(19, 'Суми', 'Сумська область'),
(20, 'Рівне', 'Рівненська область'),
(21, 'Івано-Франківськ', 'Івано-Франківська область'),
(22, 'Тернопіль', 'Тернопільська область'),
(23, 'Луцьк', 'Волинська область'),
(24, 'Ужгород', 'Закарпатська область'),
(25, 'Чернівці', 'Чернівецька область')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, region = EXCLUDED.region;

-- Оновлення таблиці навчальних закладів - додаємо поле city_id
ALTER TABLE zhytomyr_educational_institutions 
ADD COLUMN IF NOT EXISTS city_id INTEGER REFERENCES ukraine_cities(id);

-- Оновлюємо всі записи Житомира з city_id = 18
UPDATE zhytomyr_educational_institutions SET city_id = 18 WHERE city_id IS NULL;

-- Перейменування таблиці на більш загальну назву
ALTER TABLE zhytomyr_educational_institutions RENAME TO educational_institutions;

-- Коментар до таблиці
COMMENT ON TABLE ukraine_cities IS 'Міста України';
COMMENT ON TABLE educational_institutions IS 'Навчальні заклади України';

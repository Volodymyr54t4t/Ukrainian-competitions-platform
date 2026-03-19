-- Створення таблиці користувачів для платформи "Єдина платформа конкурсів України"
-- Цей скрипт створює основну таблицю users для зберігання даних про користувачів

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Індекс для швидкого пошуку по email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Коментарі до таблиці
COMMENT ON TABLE users IS 'Таблиця користувачів платформи конкурсів';
COMMENT ON COLUMN users.id IS 'Унікальний ідентифікатор користувача';
COMMENT ON COLUMN users.first_name IS 'Ім''я користувача';
COMMENT ON COLUMN users.last_name IS 'Прізвище користувача';
COMMENT ON COLUMN users.email IS 'Email користувача (унікальний)';
COMMENT ON COLUMN users.password_hash IS 'Хеш пароля (bcrypt)';
COMMENT ON COLUMN users.role IS 'Роль користувача (за замовчуванням: user)';
COMMENT ON COLUMN users.created_at IS 'Дата та час створення акаунту';

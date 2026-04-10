-- Створення таблиці system_logs для зберігання логів системи
-- Платформа: Єдина платформа конкурсів України

BEGIN;

-- Таблиця системних логів
CREATE TABLE IF NOT EXISTS public.system_logs
(
    id serial NOT NULL,
    level character varying(20) NOT NULL DEFAULT 'info',
    category character varying(100) NOT NULL,
    action character varying(255) NOT NULL,
    message text NOT NULL,
    details jsonb,
    user_id integer,
    user_email character varying(100),
    user_role character varying(50),
    ip_address character varying(45),
    user_agent text,
    request_method character varying(10),
    request_url text,
    request_body jsonb,
    response_status integer,
    duration_ms integer,
    error_stack text,
    session_id character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT system_logs_pkey PRIMARY KEY (id),
    CONSTRAINT system_logs_level_check CHECK (level IN ('debug', 'info', 'warning', 'error', 'critical'))
);

-- Коментарі до таблиці та полів
COMMENT ON TABLE public.system_logs IS 'Таблиця системних логів платформи';
COMMENT ON COLUMN public.system_logs.id IS 'Унікальний ідентифікатор лога';
COMMENT ON COLUMN public.system_logs.level IS 'Рівень логу: debug, info, warning, error, critical';
COMMENT ON COLUMN public.system_logs.category IS 'Категорія події: auth, users, competitions, system, api, security';
COMMENT ON COLUMN public.system_logs.action IS 'Дія що була виконана';
COMMENT ON COLUMN public.system_logs.message IS 'Детальний опис події';
COMMENT ON COLUMN public.system_logs.details IS 'Додаткові дані у форматі JSON';
COMMENT ON COLUMN public.system_logs.user_id IS 'ID користувача, що виконав дію';
COMMENT ON COLUMN public.system_logs.user_email IS 'Email користувача';
COMMENT ON COLUMN public.system_logs.user_role IS 'Роль користувача на момент події';
COMMENT ON COLUMN public.system_logs.ip_address IS 'IP адреса клієнта';
COMMENT ON COLUMN public.system_logs.user_agent IS 'User-Agent браузера';
COMMENT ON COLUMN public.system_logs.request_method IS 'HTTP метод запиту';
COMMENT ON COLUMN public.system_logs.request_url IS 'URL запиту';
COMMENT ON COLUMN public.system_logs.request_body IS 'Тіло запиту (без паролів)';
COMMENT ON COLUMN public.system_logs.response_status IS 'HTTP статус відповіді';
COMMENT ON COLUMN public.system_logs.duration_ms IS 'Час виконання запиту в мілісекундах';
COMMENT ON COLUMN public.system_logs.error_stack IS 'Stack trace помилки';
COMMENT ON COLUMN public.system_logs.session_id IS 'Ідентифікатор сесії';
COMMENT ON COLUMN public.system_logs.created_at IS 'Дата та час створення лога';

-- Індекси для швидкого пошуку
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON public.system_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON public.system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_category ON public.system_logs(category);
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON public.system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_action ON public.system_logs(action);

-- FK для user_id (опціонально, може бути NULL для системних логів)
ALTER TABLE IF EXISTS public.system_logs
    ADD CONSTRAINT system_logs_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES public.users (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE SET NULL;

END;

-- Створення таблиці page_permissions для зберігання прав доступу до сторінок
-- Платформа: Єдина платформа конкурсів України

BEGIN;

-- Таблиця сторінок системи
CREATE TABLE IF NOT EXISTS public.pages (
    id serial NOT NULL,
    page_id character varying(50) COLLATE pg_catalog."default" NOT NULL,
    name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    path character varying(255) COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default",
    icon text COLLATE pg_catalog."default",
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pages_pkey PRIMARY KEY (id),
    CONSTRAINT pages_page_id_key UNIQUE (page_id)
);

COMMENT ON TABLE public.pages IS 'Таблиця сторінок системи';
COMMENT ON COLUMN public.pages.page_id IS 'Унікальний ідентифікатор сторінки (dashboard, competitions, etc.)';
COMMENT ON COLUMN public.pages.name IS 'Назва сторінки для відображення';
COMMENT ON COLUMN public.pages.path IS 'URL шлях до сторінки';
COMMENT ON COLUMN public.pages.description IS 'Опис призначення сторінки';

-- Таблиця прав доступу до сторінок (Many-to-Many між pages і roles)
CREATE TABLE IF NOT EXISTS public.page_permissions (
    id serial NOT NULL,
    page_id integer NOT NULL,
    role_id integer NOT NULL,
    can_access boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT page_permissions_pkey PRIMARY KEY (id),
    CONSTRAINT page_permissions_page_role_key UNIQUE (page_id, role_id)
);

COMMENT ON TABLE public.page_permissions IS 'Таблиця прав доступу ролей до сторінок';
COMMENT ON COLUMN public.page_permissions.page_id IS 'Посилання на сторінку';
COMMENT ON COLUMN public.page_permissions.role_id IS 'Посилання на роль';
COMMENT ON COLUMN public.page_permissions.can_access IS 'Чи має роль доступ до сторінки';

-- Зовнішні ключі
ALTER TABLE IF EXISTS public.page_permissions
    ADD CONSTRAINT page_permissions_page_id_fkey FOREIGN KEY (page_id)
    REFERENCES public.pages (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.page_permissions
    ADD CONSTRAINT page_permissions_role_id_fkey FOREIGN KEY (role_id)
    REFERENCES public.roles (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;

-- Індекси для оптимізації запитів
CREATE INDEX IF NOT EXISTS idx_page_permissions_page ON public.page_permissions(page_id);
CREATE INDEX IF NOT EXISTS idx_page_permissions_role ON public.page_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_pages_page_id ON public.pages(page_id);

-- Вставка базових сторінок системи
INSERT INTO public.pages (page_id, name, path, description, display_order) VALUES
    ('dashboard', 'Головна панель', '/dashboard.html', 'Основна панель користувача', 1),
    ('competitions', 'Конкурси', '/competitions.html', 'Перегляд та управління конкурсами', 2),
    ('users', 'Користувачі', '/users.html', 'Управління користувачами системи', 3),
    ('permissions', 'Права доступу', '/permissions.html', 'Налаштування прав доступу до сторінок', 4),
    ('logs', 'Логи системи', '/logs.html', 'Перегляд системних логів', 5)
ON CONFLICT (page_id) DO NOTHING;

-- Вставка базових прав доступу (за замовчуванням)
-- Отримуємо ID ролей та сторінок для вставки
DO $$
DECLARE
    v_page_id integer;
    v_role_id integer;
BEGIN
    -- Dashboard - доступ для всіх ролей
    SELECT id INTO v_page_id FROM public.pages WHERE page_id = 'dashboard';
    FOR v_role_id IN SELECT id FROM public.roles LOOP
        INSERT INTO public.page_permissions (page_id, role_id, can_access) 
        VALUES (v_page_id, v_role_id, true)
        ON CONFLICT (page_id, role_id) DO NOTHING;
    END LOOP;

    -- Competitions - доступ для всіх ролей
    SELECT id INTO v_page_id FROM public.pages WHERE page_id = 'competitions';
    FOR v_role_id IN SELECT id FROM public.roles LOOP
        INSERT INTO public.page_permissions (page_id, role_id, can_access) 
        VALUES (v_page_id, v_role_id, true)
        ON CONFLICT (page_id, role_id) DO NOTHING;
    END LOOP;

    -- Users - тільки admin
    SELECT id INTO v_page_id FROM public.pages WHERE page_id = 'users';
    SELECT id INTO v_role_id FROM public.roles WHERE name = 'admin';
    IF v_page_id IS NOT NULL AND v_role_id IS NOT NULL THEN
        INSERT INTO public.page_permissions (page_id, role_id, can_access) 
        VALUES (v_page_id, v_role_id, true)
        ON CONFLICT (page_id, role_id) DO NOTHING;
    END IF;

    -- Permissions - тільки admin
    SELECT id INTO v_page_id FROM public.pages WHERE page_id = 'permissions';
    SELECT id INTO v_role_id FROM public.roles WHERE name = 'admin';
    IF v_page_id IS NOT NULL AND v_role_id IS NOT NULL THEN
        INSERT INTO public.page_permissions (page_id, role_id, can_access) 
        VALUES (v_page_id, v_role_id, true)
        ON CONFLICT (page_id, role_id) DO NOTHING;
    END IF;

    -- Logs - тільки admin
    SELECT id INTO v_page_id FROM public.pages WHERE page_id = 'logs';
    SELECT id INTO v_role_id FROM public.roles WHERE name = 'admin';
    IF v_page_id IS NOT NULL AND v_role_id IS NOT NULL THEN
        INSERT INTO public.page_permissions (page_id, role_id, can_access) 
        VALUES (v_page_id, v_role_id, true)
        ON CONFLICT (page_id, role_id) DO NOTHING;
    END IF;
END $$;

COMMIT;

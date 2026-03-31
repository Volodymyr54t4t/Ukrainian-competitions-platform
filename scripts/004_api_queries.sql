-- =============================================
-- ПРИКЛАДИ SQL ЗАПИТІВ ДЛЯ API
-- Ці запити використовувати в бекенді для роботи з профілями
-- =============================================

-- =============================================
-- 1. РЕЄСТРАЦІЯ НОВОГО КОРИСТУВАЧА
-- =============================================
-- При реєстрації створюємо запис в users та відповідну таблицю профілю

-- Приклад реєстрації учня
INSERT INTO users (email, password_hash, role_id, first_name, last_name, city_id, region_id)
SELECT 
    'student@example.com',
    '$2b$10$...',  -- bcrypt hash пароля
    r.id,
    'Іван',
    'Петренко',
    1,  -- city_id
    1   -- region_id
FROM roles r WHERE r.name = 'student'
RETURNING id;

-- Після створення user, створити профіль учня
INSERT INTO student_profiles (user_id) VALUES (/* user_id з попереднього запиту */);

-- =============================================
-- 2. ОТРИМАННЯ ПРОФІЛЮ
-- =============================================

-- Отримати профіль учня
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.phone,
    u.photo_url,
    u.is_verified,
    u.account_status,
    u.created_at,
    u.last_login,
    c.name as city_name,
    r.name as region_name,
    sp.birth_date,
    sp.class_name,
    sp.participation_level,
    sp.achievements,
    sp.certificates_files,
    sp.portfolio_url,
    sp.github_url,
    sp.average_grade,
    sp.strengths,
    sp.previous_competitions,
    s.id as school_id,
    s.short_name as school_name,
    s.ownership_type as school_type,
    (SELECT json_agg(sub.name) 
     FROM student_subjects ss 
     JOIN subjects sub ON ss.subject_id = sub.id 
     WHERE ss.student_profile_id = sp.id) as subjects
FROM users u
JOIN roles ro ON u.role_id = ro.id
LEFT JOIN cities c ON u.city_id = c.id
LEFT JOIN regions r ON u.region_id = r.id
LEFT JOIN student_profiles sp ON u.id = sp.user_id
LEFT JOIN schools s ON sp.school_id = s.id
WHERE u.id = $1 AND ro.name = 'student';

-- Отримати профіль вчителя
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.phone,
    u.photo_url,
    u.is_verified,
    u.account_status,
    u.created_at,
    u.last_login,
    c.name as city_name,
    r.name as region_name,
    tp.position,
    tp.experience_years,
    tp.portfolio_url,
    tp.rating,
    tp.winners_count,
    tp.preparation_experience,
    s.id as school_id,
    s.short_name as school_name,
    (SELECT json_agg(sub.name) 
     FROM teacher_subjects ts 
     JOIN subjects sub ON ts.subject_id = sub.id 
     WHERE ts.teacher_profile_id = tp.id) as subjects,
    (SELECT json_agg(tc.class_name) 
     FROM teacher_classes tc 
     WHERE tc.teacher_profile_id = tp.id) as classes,
    (SELECT json_agg(json_build_object(
        'student_name', tsa.student_name,
        'achievement', tsa.achievement,
        'competition_name', tsa.competition_name,
        'year', tsa.year,
        'place', tsa.place
     )) FROM teacher_student_achievements tsa 
     WHERE tsa.teacher_profile_id = tp.id) as student_achievements
FROM users u
JOIN roles ro ON u.role_id = ro.id
LEFT JOIN cities c ON u.city_id = c.id
LEFT JOIN regions r ON u.region_id = r.id
LEFT JOIN teacher_profiles tp ON u.id = tp.user_id
LEFT JOIN schools s ON tp.school_id = s.id
WHERE u.id = $1 AND ro.name = 'teacher';

-- Отримати профіль завуча
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.phone,
    u.photo_url,
    u.is_verified,
    u.created_at,
    c.name as city_name,
    vp.position,
    vp.school_contact_info,
    vp.school_statistics,
    vp.school_rating,
    vp.participants_count,
    vp.wins_count,
    s.id as school_id,
    s.full_name as school_full_name,
    s.short_name as school_name,
    s.address as school_address,
    s.ownership_type
FROM users u
JOIN roles ro ON u.role_id = ro.id
LEFT JOIN cities c ON u.city_id = c.id
LEFT JOIN vice_principal_profiles vp ON u.id = vp.user_id
LEFT JOIN schools s ON vp.school_id = s.id
WHERE u.id = $1 AND ro.name = 'vice_principal';

-- Отримати профіль методиста
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.phone,
    u.photo_url,
    u.is_verified,
    u.created_at,
    c.name as city_name,
    r.name as region_name,
    mp.organization,
    mp.role_title,
    mp.activity_direction,
    mp.access_rights,
    mp.regional_statistics,
    (SELECT json_agg(json_build_object(
        'id', mc.id,
        'competition_name', mc.competition_name,
        'year', mc.year,
        'status', mc.status
     )) FROM methodist_competitions mc 
     WHERE mc.methodist_profile_id = mp.id) as competitions,
    (SELECT json_agg(json_build_object(
        'id', mt.id,
        'template_name', mt.template_name,
        'created_at', mt.created_at
     )) FROM methodist_templates mt 
     WHERE mt.methodist_profile_id = mp.id) as templates
FROM users u
JOIN roles ro ON u.role_id = ro.id
LEFT JOIN cities c ON u.city_id = c.id
LEFT JOIN regions r ON u.region_id = r.id
LEFT JOIN methodist_profiles mp ON u.id = mp.user_id
WHERE u.id = $1 AND ro.name = 'methodist';

-- Отримати профіль журі
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.phone,
    u.photo_url,
    u.is_verified,
    u.created_at,
    c.name as city_name,
    jp.organization,
    jp.specialization,
    jp.country,
    jp.position,
    jp.experience_years,
    (SELECT json_agg(jea.area_name) 
     FROM jury_evaluation_areas jea 
     WHERE jea.jury_profile_id = jp.id) as evaluation_areas,
    (SELECT json_agg(json_build_object(
        'id', jac.id,
        'competition_name', jac.competition_name,
        'assigned_date', jac.assigned_date,
        'status', jac.status
     )) FROM jury_assigned_competitions jac 
     WHERE jac.jury_profile_id = jp.id) as assigned_competitions,
    (SELECT COUNT(*) FROM jury_works_to_evaluate jwe 
     WHERE jwe.jury_profile_id = jp.id AND jwe.status = 'pending') as pending_works_count
FROM users u
JOIN roles ro ON u.role_id = ro.id
LEFT JOIN cities c ON u.city_id = c.id
LEFT JOIN jury_profiles jp ON u.id = jp.user_id
WHERE u.id = $1 AND ro.name = 'jury';

-- Отримати профіль адміна
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.is_verified,
    u.account_status,
    u.created_at,
    u.last_login,
    ap.admin_role,
    (SELECT json_agg(json_build_object(
        'action', al.action,
        'target_type', al.target_type,
        'target_id', al.target_id,
        'created_at', al.created_at,
        'ip_address', al.ip_address
     ) ORDER BY al.created_at DESC) 
     FROM admin_access_logs al 
     WHERE al.admin_profile_id = ap.id
     LIMIT 50) as recent_logs
FROM users u
JOIN roles ro ON u.role_id = ro.id
LEFT JOIN admin_profiles ap ON u.id = ap.user_id
WHERE u.id = $1 AND ro.name = 'admin';

-- =============================================
-- 3. ОНОВЛЕННЯ ПРОФІЛІВ (вже є функції в 003_profile_functions.sql)
-- =============================================

-- Приклад виклику функції оновлення профілю учня:
-- SELECT update_student_profile(
--     1,                          -- p_user_id
--     'Іван',                     -- p_first_name
--     'Петренко',                 -- p_last_name
--     '+380671234567',            -- p_phone
--     NULL,                       -- p_photo_url (NULL = не змінювати)
--     1,                          -- p_city_id
--     5,                          -- p_school_id
--     '2008-05-15'::DATE,         -- p_birth_date
--     '10-А',                     -- p_class_name
--     'regional',                 -- p_participation_level
--     'Переможець обласної олімпіади', -- p_achievements
--     'https://portfolio.com',    -- p_portfolio_url
--     'https://github.com/user',  -- p_github_url
--     10.5,                       -- p_average_grade
--     ARRAY['Аналітичне мислення']::TEXT[], -- p_strengths
--     ARRAY[1, 5, 10]::INTEGER[]  -- p_subject_ids
-- );

-- =============================================
-- 4. РОБОТА ЗІ ШКОЛАМИ
-- =============================================

-- Отримати всі школи міста
SELECT 
    s.id,
    s.system_id,
    s.full_name,
    s.short_name,
    s.ownership_type,
    s.address,
    s.budget_type,
    c.name as city_name
FROM schools s
JOIN cities c ON s.city_id = c.id
WHERE s.city_id = $1
ORDER BY s.short_name;

-- Пошук школи за назвою
SELECT 
    s.id,
    s.system_id,
    s.full_name,
    s.short_name,
    s.ownership_type,
    s.address,
    c.name as city_name
FROM schools s
JOIN cities c ON s.city_id = c.id
WHERE (s.full_name ILIKE '%' || $1 || '%' OR s.short_name ILIKE '%' || $1 || '%')
ORDER BY s.short_name
LIMIT 20;

-- Отримати статистику школи
SELECT 
    s.id,
    s.short_name,
    COUNT(DISTINCT sp.id) as students_count,
    COUNT(DISTINCT tp.id) as teachers_count,
    COALESCE(SUM(tp.winners_count), 0) as total_winners
FROM schools s
LEFT JOIN student_profiles sp ON sp.school_id = s.id
LEFT JOIN teacher_profiles tp ON tp.school_id = s.id
WHERE s.id = $1
GROUP BY s.id, s.short_name;

-- =============================================
-- 5. СПИСОК ПРЕДМЕТІВ
-- =============================================

-- Отримати всі предмети
SELECT id, name FROM subjects ORDER BY name;

-- =============================================
-- 6. СПИСКИ ДЛЯ ЗАВУЧА
-- =============================================

-- Отримати список вчителів школи
SELECT 
    u.id,
    u.first_name,
    u.last_name,
    tp.position,
    tp.experience_years,
    tp.rating,
    tp.winners_count,
    (SELECT json_agg(sub.name) 
     FROM teacher_subjects ts 
     JOIN subjects sub ON ts.subject_id = sub.id 
     WHERE ts.teacher_profile_id = tp.id) as subjects
FROM users u
JOIN teacher_profiles tp ON u.id = tp.user_id
WHERE tp.school_id = $1
ORDER BY u.last_name, u.first_name;

-- Отримати список учнів школи
SELECT 
    u.id,
    u.first_name,
    u.last_name,
    sp.class_name,
    sp.participation_level,
    sp.average_grade,
    (SELECT json_agg(sub.name) 
     FROM student_subjects ss 
     JOIN subjects sub ON ss.subject_id = sub.id 
     WHERE ss.student_profile_id = sp.id) as subjects
FROM users u
JOIN student_profiles sp ON u.id = sp.user_id
WHERE sp.school_id = $1
ORDER BY sp.class_name, u.last_name, u.first_name;

-- =============================================
-- 7. ЛОГУВАННЯ ДІЙ АДМІНА
-- =============================================

-- Записати дію адміна
INSERT INTO admin_access_logs (admin_profile_id, action, target_type, target_id, ip_address, user_agent)
VALUES ($1, $2, $3, $4, $5, $6);

-- Приклад:
-- INSERT INTO admin_access_logs (admin_profile_id, action, target_type, target_id, ip_address, user_agent)
-- VALUES (1, 'Змінено статус користувача', 'user', 123, '192.168.1.1', 'Mozilla/5.0...');

-- =============================================
-- 8. АВТОРИЗАЦІЯ
-- =============================================

-- Перевірка логіну (отримати хеш пароля та роль)
SELECT 
    u.id,
    u.email,
    u.password_hash,
    u.first_name,
    u.last_name,
    u.is_verified,
    u.account_status,
    r.name as role
FROM users u
JOIN roles r ON u.role_id = r.id
WHERE u.email = $1 AND u.account_status = 'active';

-- Оновити last_login
UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1;

-- =============================================
-- 9. КОРИСНІ VIEW (ПРЕДСТАВЛЕННЯ)
-- =============================================

-- Створити view для швидкого доступу до списку користувачів
CREATE OR REPLACE VIEW users_overview AS
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.phone,
    u.is_verified,
    u.account_status,
    u.created_at,
    u.last_login,
    r.name as role,
    c.name as city,
    reg.name as region
FROM users u
JOIN roles r ON u.role_id = r.id
LEFT JOIN cities c ON u.city_id = c.id
LEFT JOIN regions reg ON u.region_id = reg.id;

-- Створити view для статистики по ролях
CREATE OR REPLACE VIEW role_statistics AS
SELECT 
    r.name as role,
    r.description as role_description,
    COUNT(u.id) as users_count,
    COUNT(CASE WHEN u.is_verified THEN 1 END) as verified_count,
    COUNT(CASE WHEN u.account_status = 'active' THEN 1 END) as active_count
FROM roles r
LEFT JOIN users u ON r.id = u.role_id
GROUP BY r.id, r.name, r.description;

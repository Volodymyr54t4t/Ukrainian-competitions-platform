-- =============================================
-- ФУНКЦІЇ ДЛЯ РОБОТИ З ПРОФІЛЯМИ
-- =============================================

-- Функція отримання повного профілю користувача за ID
CREATE OR REPLACE FUNCTION get_user_profile(p_user_id INTEGER)
RETURNS JSON AS $$
DECLARE
    v_role_name VARCHAR(50);
    v_result JSON;
BEGIN
    -- Отримуємо роль користувача
    SELECT r.name INTO v_role_name
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.id = p_user_id;

    IF v_role_name IS NULL THEN
        RETURN NULL;
    END IF;

    -- Повертаємо профіль в залежності від ролі
    CASE v_role_name
        WHEN 'student' THEN
            SELECT json_build_object(
                'user', row_to_json(u.*),
                'profile', row_to_json(sp.*),
                'school', row_to_json(s.*),
                'subjects', (SELECT json_agg(sub.name) FROM student_subjects ss JOIN subjects sub ON ss.subject_id = sub.id WHERE ss.student_profile_id = sp.id),
                'role', 'student'
            ) INTO v_result
            FROM users u
            LEFT JOIN student_profiles sp ON u.id = sp.user_id
            LEFT JOIN schools s ON sp.school_id = s.id
            WHERE u.id = p_user_id;

        WHEN 'teacher' THEN
            SELECT json_build_object(
                'user', row_to_json(u.*),
                'profile', row_to_json(tp.*),
                'school', row_to_json(s.*),
                'subjects', (SELECT json_agg(sub.name) FROM teacher_subjects ts JOIN subjects sub ON ts.subject_id = sub.id WHERE ts.teacher_profile_id = tp.id),
                'classes', (SELECT json_agg(tc.class_name) FROM teacher_classes tc WHERE tc.teacher_profile_id = tp.id),
                'role', 'teacher'
            ) INTO v_result
            FROM users u
            LEFT JOIN teacher_profiles tp ON u.id = tp.user_id
            LEFT JOIN schools s ON tp.school_id = s.id
            WHERE u.id = p_user_id;

        WHEN 'vice_principal' THEN
            SELECT json_build_object(
                'user', row_to_json(u.*),
                'profile', row_to_json(vp.*),
                'school', row_to_json(s.*),
                'role', 'vice_principal'
            ) INTO v_result
            FROM users u
            LEFT JOIN vice_principal_profiles vp ON u.id = vp.user_id
            LEFT JOIN schools s ON vp.school_id = s.id
            WHERE u.id = p_user_id;

        WHEN 'methodist' THEN
            SELECT json_build_object(
                'user', row_to_json(u.*),
                'profile', row_to_json(mp.*),
                'competitions', (SELECT json_agg(row_to_json(mc.*)) FROM methodist_competitions mc WHERE mc.methodist_profile_id = mp.id),
                'role', 'methodist'
            ) INTO v_result
            FROM users u
            LEFT JOIN methodist_profiles mp ON u.id = mp.user_id
            WHERE u.id = p_user_id;

        WHEN 'jury' THEN
            SELECT json_build_object(
                'user', row_to_json(u.*),
                'profile', row_to_json(jp.*),
                'evaluation_areas', (SELECT json_agg(jea.area_name) FROM jury_evaluation_areas jea WHERE jea.jury_profile_id = jp.id),
                'assigned_competitions', (SELECT json_agg(row_to_json(jac.*)) FROM jury_assigned_competitions jac WHERE jac.jury_profile_id = jp.id),
                'role', 'jury'
            ) INTO v_result
            FROM users u
            LEFT JOIN jury_profiles jp ON u.id = jp.user_id
            WHERE u.id = p_user_id;

        WHEN 'admin' THEN
            SELECT json_build_object(
                'user', row_to_json(u.*),
                'profile', row_to_json(ap.*),
                'role', 'admin'
            ) INTO v_result
            FROM users u
            LEFT JOIN admin_profiles ap ON u.id = ap.user_id
            WHERE u.id = p_user_id;

        ELSE
            v_result := NULL;
    END CASE;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- ФУНКЦІЯ ОНОВЛЕННЯ ПРОФІЛЮ УЧНЯ
-- =============================================
CREATE OR REPLACE FUNCTION update_student_profile(
    p_user_id INTEGER,
    p_first_name VARCHAR(100),
    p_last_name VARCHAR(100),
    p_phone VARCHAR(20),
    p_photo_url TEXT,
    p_city_id INTEGER,
    p_school_id INTEGER,
    p_birth_date DATE,
    p_class_name VARCHAR(10),
    p_participation_level VARCHAR(50),
    p_achievements TEXT,
    p_portfolio_url TEXT,
    p_github_url TEXT,
    p_average_grade DECIMAL(3,2),
    p_strengths TEXT[],
    p_subject_ids INTEGER[]
)
RETURNS BOOLEAN AS $$
DECLARE
    v_profile_id INTEGER;
BEGIN
    -- Оновлюємо основні дані користувача
    UPDATE users SET
        first_name = COALESCE(p_first_name, first_name),
        last_name = COALESCE(p_last_name, last_name),
        phone = COALESCE(p_phone, phone),
        photo_url = COALESCE(p_photo_url, photo_url),
        city_id = COALESCE(p_city_id, city_id)
    WHERE id = p_user_id;

    -- Отримуємо або створюємо профіль учня
    INSERT INTO student_profiles (user_id, school_id, birth_date, class_name, participation_level, achievements, portfolio_url, github_url, average_grade, strengths)
    VALUES (p_user_id, p_school_id, p_birth_date, p_class_name, p_participation_level, p_achievements, p_portfolio_url, p_github_url, p_average_grade, p_strengths)
    ON CONFLICT (user_id) DO UPDATE SET
        school_id = COALESCE(p_school_id, student_profiles.school_id),
        birth_date = COALESCE(p_birth_date, student_profiles.birth_date),
        class_name = COALESCE(p_class_name, student_profiles.class_name),
        participation_level = COALESCE(p_participation_level, student_profiles.participation_level),
        achievements = COALESCE(p_achievements, student_profiles.achievements),
        portfolio_url = COALESCE(p_portfolio_url, student_profiles.portfolio_url),
        github_url = COALESCE(p_github_url, student_profiles.github_url),
        average_grade = COALESCE(p_average_grade, student_profiles.average_grade),
        strengths = COALESCE(p_strengths, student_profiles.strengths)
    RETURNING id INTO v_profile_id;

    -- Оновлюємо предмети
    IF p_subject_ids IS NOT NULL THEN
        DELETE FROM student_subjects WHERE student_profile_id = v_profile_id;
        INSERT INTO student_subjects (student_profile_id, subject_id)
        SELECT v_profile_id, unnest(p_subject_ids);
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- ФУНКЦІЯ ОНОВЛЕННЯ ПРОФІЛЮ ВЧИТЕЛЯ
-- =============================================
CREATE OR REPLACE FUNCTION update_teacher_profile(
    p_user_id INTEGER,
    p_first_name VARCHAR(100),
    p_last_name VARCHAR(100),
    p_phone VARCHAR(20),
    p_photo_url TEXT,
    p_city_id INTEGER,
    p_school_id INTEGER,
    p_position VARCHAR(100),
    p_experience_years INTEGER,
    p_portfolio_url TEXT,
    p_preparation_experience TEXT,
    p_subject_ids INTEGER[],
    p_class_names TEXT[]
)
RETURNS BOOLEAN AS $$
DECLARE
    v_profile_id INTEGER;
BEGIN
    UPDATE users SET
        first_name = COALESCE(p_first_name, first_name),
        last_name = COALESCE(p_last_name, last_name),
        phone = COALESCE(p_phone, phone),
        photo_url = COALESCE(p_photo_url, photo_url),
        city_id = COALESCE(p_city_id, city_id)
    WHERE id = p_user_id;

    INSERT INTO teacher_profiles (user_id, school_id, position, experience_years, portfolio_url, preparation_experience)
    VALUES (p_user_id, p_school_id, p_position, p_experience_years, p_portfolio_url, p_preparation_experience)
    ON CONFLICT (user_id) DO UPDATE SET
        school_id = COALESCE(p_school_id, teacher_profiles.school_id),
        position = COALESCE(p_position, teacher_profiles.position),
        experience_years = COALESCE(p_experience_years, teacher_profiles.experience_years),
        portfolio_url = COALESCE(p_portfolio_url, teacher_profiles.portfolio_url),
        preparation_experience = COALESCE(p_preparation_experience, teacher_profiles.preparation_experience)
    RETURNING id INTO v_profile_id;

    IF p_subject_ids IS NOT NULL THEN
        DELETE FROM teacher_subjects WHERE teacher_profile_id = v_profile_id;
        INSERT INTO teacher_subjects (teacher_profile_id, subject_id)
        SELECT v_profile_id, unnest(p_subject_ids);
    END IF;

    IF p_class_names IS NOT NULL THEN
        DELETE FROM teacher_classes WHERE teacher_profile_id = v_profile_id;
        INSERT INTO teacher_classes (teacher_profile_id, class_name)
        SELECT v_profile_id, unnest(p_class_names);
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- ФУНКЦІЯ ОНОВЛЕННЯ ПРОФІЛЮ ЗАВУЧА
-- =============================================
CREATE OR REPLACE FUNCTION update_vice_principal_profile(
    p_user_id INTEGER,
    p_first_name VARCHAR(100),
    p_last_name VARCHAR(100),
    p_phone VARCHAR(20),
    p_photo_url TEXT,
    p_city_id INTEGER,
    p_school_id INTEGER,
    p_position VARCHAR(100),
    p_school_contact_info JSONB
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE users SET
        first_name = COALESCE(p_first_name, first_name),
        last_name = COALESCE(p_last_name, last_name),
        phone = COALESCE(p_phone, phone),
        photo_url = COALESCE(p_photo_url, photo_url),
        city_id = COALESCE(p_city_id, city_id)
    WHERE id = p_user_id;

    INSERT INTO vice_principal_profiles (user_id, school_id, position, school_contact_info)
    VALUES (p_user_id, p_school_id, p_position, p_school_contact_info)
    ON CONFLICT (user_id) DO UPDATE SET
        school_id = COALESCE(p_school_id, vice_principal_profiles.school_id),
        position = COALESCE(p_position, vice_principal_profiles.position),
        school_contact_info = COALESCE(p_school_contact_info, vice_principal_profiles.school_contact_info);

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- ФУНКЦІЯ ОНОВЛЕННЯ ПРОФІЛЮ МЕТОДИСТА
-- =============================================
CREATE OR REPLACE FUNCTION update_methodist_profile(
    p_user_id INTEGER,
    p_first_name VARCHAR(100),
    p_last_name VARCHAR(100),
    p_phone VARCHAR(20),
    p_photo_url TEXT,
    p_city_id INTEGER,
    p_region_id INTEGER,
    p_organization VARCHAR(200),
    p_role_title VARCHAR(100),
    p_activity_direction TEXT,
    p_access_rights JSONB
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE users SET
        first_name = COALESCE(p_first_name, first_name),
        last_name = COALESCE(p_last_name, last_name),
        phone = COALESCE(p_phone, phone),
        photo_url = COALESCE(p_photo_url, photo_url),
        city_id = COALESCE(p_city_id, city_id),
        region_id = COALESCE(p_region_id, region_id)
    WHERE id = p_user_id;

    INSERT INTO methodist_profiles (user_id, organization, role_title, activity_direction, access_rights)
    VALUES (p_user_id, p_organization, p_role_title, p_activity_direction, p_access_rights)
    ON CONFLICT (user_id) DO UPDATE SET
        organization = COALESCE(p_organization, methodist_profiles.organization),
        role_title = COALESCE(p_role_title, methodist_profiles.role_title),
        activity_direction = COALESCE(p_activity_direction, methodist_profiles.activity_direction),
        access_rights = COALESCE(p_access_rights, methodist_profiles.access_rights);

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- ФУНКЦІЯ ОНОВЛЕННЯ ПРОФІЛЮ ЖУРІ
-- =============================================
CREATE OR REPLACE FUNCTION update_jury_profile(
    p_user_id INTEGER,
    p_first_name VARCHAR(100),
    p_last_name VARCHAR(100),
    p_phone VARCHAR(20),
    p_photo_url TEXT,
    p_city_id INTEGER,
    p_organization VARCHAR(200),
    p_specialization VARCHAR(200),
    p_country VARCHAR(100),
    p_position VARCHAR(100),
    p_experience_years INTEGER,
    p_evaluation_areas TEXT[]
)
RETURNS BOOLEAN AS $$
DECLARE
    v_profile_id INTEGER;
BEGIN
    UPDATE users SET
        first_name = COALESCE(p_first_name, first_name),
        last_name = COALESCE(p_last_name, last_name),
        phone = COALESCE(p_phone, phone),
        photo_url = COALESCE(p_photo_url, photo_url),
        city_id = COALESCE(p_city_id, city_id)
    WHERE id = p_user_id;

    INSERT INTO jury_profiles (user_id, organization, specialization, country, position, experience_years)
    VALUES (p_user_id, p_organization, p_specialization, p_country, p_position, p_experience_years)
    ON CONFLICT (user_id) DO UPDATE SET
        organization = COALESCE(p_organization, jury_profiles.organization),
        specialization = COALESCE(p_specialization, jury_profiles.specialization),
        country = COALESCE(p_country, jury_profiles.country),
        position = COALESCE(p_position, jury_profiles.position),
        experience_years = COALESCE(p_experience_years, jury_profiles.experience_years)
    RETURNING id INTO v_profile_id;

    IF p_evaluation_areas IS NOT NULL THEN
        DELETE FROM jury_evaluation_areas WHERE jury_profile_id = v_profile_id;
        INSERT INTO jury_evaluation_areas (jury_profile_id, area_name)
        SELECT v_profile_id, unnest(p_evaluation_areas);
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- ФУНКЦІЯ ОНОВЛЕННЯ ПРОФІЛЮ АДМІНА
-- =============================================
CREATE OR REPLACE FUNCTION update_admin_profile(
    p_user_id INTEGER,
    p_first_name VARCHAR(100),
    p_last_name VARCHAR(100),
    p_admin_role VARCHAR(50)
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE users SET
        first_name = COALESCE(p_first_name, first_name),
        last_name = COALESCE(p_last_name, last_name)
    WHERE id = p_user_id;

    INSERT INTO admin_profiles (user_id, admin_role)
    VALUES (p_user_id, p_admin_role)
    ON CONFLICT (user_id) DO UPDATE SET
        admin_role = COALESCE(p_admin_role, admin_profiles.admin_role);

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- ФУНКЦІЯ ПОШУКУ ШКІЛ ЗА МІСТОМ
-- =============================================
CREATE OR REPLACE FUNCTION get_schools_by_city(p_city_id INTEGER)
RETURNS TABLE (
    id INTEGER,
    system_id INTEGER,
    full_name VARCHAR(500),
    short_name VARCHAR(200),
    ownership_type VARCHAR(50),
    address TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT s.id, s.system_id, s.full_name, s.short_name, s.ownership_type, s.address
    FROM schools s
    WHERE s.city_id = p_city_id
    ORDER BY s.short_name;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- ФУНКЦІЯ ПОШУКУ ШКІЛ ЗА НАЗВОЮ
-- =============================================
CREATE OR REPLACE FUNCTION search_schools(p_search_term VARCHAR(200), p_city_id INTEGER DEFAULT NULL)
RETURNS TABLE (
    id INTEGER,
    system_id INTEGER,
    full_name VARCHAR(500),
    short_name VARCHAR(200),
    ownership_type VARCHAR(50),
    address TEXT,
    city_name VARCHAR(100)
) AS $$
BEGIN
    RETURN QUERY
    SELECT s.id, s.system_id, s.full_name, s.short_name, s.ownership_type, s.address, c.name
    FROM schools s
    JOIN cities c ON s.city_id = c.id
    WHERE (s.full_name ILIKE '%' || p_search_term || '%' OR s.short_name ILIKE '%' || p_search_term || '%')
    AND (p_city_id IS NULL OR s.city_id = p_city_id)
    ORDER BY s.short_name
    LIMIT 50;
END;
$$ LANGUAGE plpgsql;

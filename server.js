/**
 * Сервер авторизації для платформи "Єдина платформа конкурсів України"
 *
 * Технології: Node.js, Express, PostgreSQL, JWT, bcrypt
 */

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
const path = require("path");

// Ініціалізація Express додатку
const app = express();
const PORT = parseInt(process.env.PORT, 10) || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Mock режим - працює без бази даних для демонстрації
const MOCK_MODE = !process.env.DATABASE_URL;

// Mock дані для демонстрації
const mockUsers = [
    {
        id: 1,
        first_name: "Адмін",
        last_name: "Системи",
        email: "admin@test.com",
        password_hash: "$2a$10$mockhashadmin",
        role: "admin",
        role_id: 5,
    },
    {
        id: 2,
        first_name: "Іван",
        last_name: "Петренко",
        email: "student@test.com",
        password_hash: "$2a$10$mockhashstudent",
        role: "student",
        role_id: 1,
    },
    {
        id: 3,
        first_name: "Марія",
        last_name: "Коваленко",
        email: "teacher@test.com",
        password_hash: "$2a$10$mockhashteacher",
        role: "teacher",
        role_id: 2,
    },
    {
        id: 4,
        first_name: "Олена",
        last_name: "Сидоренко",
        email: "methodist@test.com",
        password_hash: "$2a$10$mockhashmethodist",
        role: "methodist",
        role_id: 3,
    },
    {
        id: 5,
        first_name: "Петро",
        last_name: "Іваненко",
        email: "judge@test.com",
        password_hash: "$2a$10$mockhashjudge",
        role: "judge",
        role_id: 4,
    },
];

const mockRoles = [
    {
        id: 1,
        name: "student",
        display_name: "Учень",
        description: "Учасник конкурсів",
    },
    {
        id: 2,
        name: "teacher",
        display_name: "Вчитель",
        description: "Керівник учнів",
    },
    {
        id: 3,
        name: "methodist",
        display_name: "Методист",
        description: "Організатор конкурсів",
    },
    {
        id: 4,
        name: "judge",
        display_name: "Суддя",
        description: "Оцінювач робіт",
    },
    {
        id: 5,
        name: "admin",
        display_name: "Адміністратор",
        description: "Повний доступ",
    },
];

const mockPermissions = {
    1: [
        {
            name: "view_competitions",
            display_name: "Перегляд конкурсів",
            category: "competitions",
        },
        {
            name: "submit_application",
            display_name: "Подання заявок",
            category: "applications",
        },
    ],
    2: [
        {
            name: "view_competitions",
            display_name: "Перегляд конкурсів",
            category: "competitions",
        },
        {
            name: "create_competition",
            display_name: "Створення конкурсів",
            category: "competitions",
        },
        {
            name: "manage_students",
            display_name: "Керування учнями",
            category: "users",
        },
    ],
    3: [
        {
            name: "view_competitions",
            display_name: "Перегляд конкурсів",
            category: "competitions",
        },
        {
            name: "create_competition",
            display_name: "Створення конкурсів",
            category: "competitions",
        },
        {
            name: "manage_competitions",
            display_name: "Керування конкурсами",
            category: "competitions",
        },
        {
            name: "view_applications",
            display_name: "Перегляд заявок",
            category: "applications",
        },
    ],
    4: [
        {
            name: "view_competitions",
            display_name: "Перегляд конкурсів",
            category: "competitions",
        },
        {
            name: "evaluate_works",
            display_name: "Оцінювання робіт",
            category: "judging",
        },
    ],
    5: [
        {
            name: "view_competitions",
            display_name: "Перегляд конкурсів",
            category: "competitions",
        },
        {
            name: "create_competition",
            display_name: "Створення конкурсів",
            category: "competitions",
        },
        {
            name: "manage_competitions",
            display_name: "Керування конкурсами",
            category: "competitions",
        },
        {
            name: "manage_users",
            display_name: "Керування користувачами",
            category: "users",
        },
        {
            name: "manage_roles",
            display_name: "Керування ролями",
            category: "system",
        },
        {
            name: "system_settings",
            display_name: "Налаштування системи",
            category: "system",
        },
    ],
};

// Mock дані для закладів освіти
const mockInstitutions = [
    { id: 1, name: "Київська гімназія №1 імені Т.Г. Шевченка", short_name: "КГ №1", type: "gymnasium", region: "Київська", city: "Київ" },
    { id: 2, name: "Львівський національний університет імені Івана Франка", short_name: "ЛНУ ім. І. Франка", type: "university", region: "Львівська", city: "Львів" },
    { id: 3, name: "Харківський ліцей №27", short_name: "ХЛ №27", type: "lyceum", region: "Харківська", city: "Харків" },
    { id: 4, name: "Одеська загальноосвітня школа №5", short_name: "ОЗШ №5", type: "school", region: "Одеська", city: "Одеса" },
    { id: 5, name: "Дніпровський медичний коледж", short_name: "ДМК", type: "college", region: "Дніпропетровська", city: "Дніпро" },
    { id: 6, name: "Запорізька гімназія №3", short_name: "ЗГ №3", type: "gymnasium", region: "Запорізька", city: "Запоріжжя" },
    { id: 7, name: "Вінницький педагогічний університет", short_name: "ВДПУ", type: "university", region: "Вінницька", city: "Вінниця" },
    { id: 8, name: "Черкаська спеціалізована школа №17", short_name: "ЧСШ №17", type: "school", region: "Черкаська", city: "Черкаси" },
    { id: 9, name: "Полтавський ліцей інформаційних технологій", short_name: "ПЛІТ", type: "lyceum", region: "Полтавська", city: "Полтава" },
    { id: 10, name: "Житомирський коледж культури і мистецтв", short_name: "ЖККМ", type: "college", region: "Житомирська", city: "Житомир" },
];

// Mock дані для профілів
let mockProfiles = [
    {
        id: 1,
        user_id: 1,
        middle_name: "Олександрович",
        phone: "+380501234567",
        institution_id: null,
        admin_department: "IT відділ",
        admin_position: "Головний адміністратор",
        is_complete: true,
    },
    {
        id: 2,
        user_id: 2,
        middle_name: "Іванович",
        phone: "+380671234567",
        institution_id: 1,
        student_class: "11",
        student_parallel: "А",
        student_specialization: "Математичний профіль",
        parent_name: "Петренко Олена Василівна",
        parent_phone: "+380501111111",
        is_complete: true,
    },
    {
        id: 3,
        user_id: 3,
        middle_name: "Петрівна",
        phone: "+380631234567",
        institution_id: 1,
        teacher_subject: "Математика",
        teacher_category: "Вища категорія",
        teacher_experience_years: 15,
        teacher_position: "Вчитель математики",
        is_complete: true,
    },
    {
        id: 4,
        user_id: 4,
        middle_name: "Андріївна",
        phone: "+380661234567",
        institution_id: 2,
        methodist_department: "Відділ освіти",
        methodist_specialization: "Природничі науки",
        is_complete: true,
    },
    {
        id: 5,
        user_id: 5,
        middle_name: "Васильович",
        phone: "+380681234567",
        institution_id: 3,
        judge_specialization: "Математика та інформатика",
        judge_experience_years: 10,
        is_complete: true,
    },
];

let mockCompetitions = [
    {
        id: 1,
        title: "Всеукраїнська олімпіада з математики",
        subject: "mathematics",
        level: "national",
        status: "active",
        start_date: "2026-04-01",
        end_date: "2026-04-15",
        description: "Щорічна олімпіада для учнів 9-11 класів",
        sections: ["Алгебра", "Геометрія", "Математичний аналіз"],
        created_by: 3,
        max_participants: 500,
        applications_count: 0,
        created_at: "2026-01-15",
    },
    {
        id: 2,
        title: "Конкурс юних фізиків",
        subject: "physics",
        level: "regional",
        status: "active",
        start_date: "2026-05-01",
        end_date: "2026-05-10",
        description: "Регіональний конкурс з фізики",
        sections: ["Механіка", "Оптика"],
        created_by: 3,
        max_participants: 200,
        applications_count: 0,
        created_at: "2026-01-20",
    },
    {
        id: 3,
        title: "Олімпіада з інформатики",
        subject: "informatics",
        level: "national",
        status: "completed",
        start_date: "2026-02-01",
        end_date: "2026-02-15",
        description: "Змагання з програмування",
        sections: ["Алгоритми", "Структури даних", "Web-програмування"],
        created_by: 2,
        max_participants: 300,
        applications_count: 0,
        created_at: "2026-01-10",
    },
    {
        id: 4,
        title: "Конкурс есе з української мови",
        subject: "ukrainian",
        level: "school",
        status: "active",
        start_date: "2026-03-20",
        end_date: "2026-04-05",
        description: "Шкільний конкурс творчих робіт",
        sections: ["Творчі роботи"],
        created_by: 2,
        max_participants: 100,
        applications_count: 0,
        created_at: "2026-02-01",
    },
];

let pool = null;

if (!MOCK_MODE) {
    // Підключення до PostgreSQL через Pool
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false,
        },
    });

    // Перевірка підключення до бази даних
    pool.connect((err, client, release) => {
        if (err) {
            console.error("Помилка підключення до бази даних:", err.stack);
        } else {
            console.log("Успішне підключення до PostgreSQL");
            release();
        }
    });
} else {
    console.log(
        "MOCK MODE: Працюємо без бази даних. Використовуйте тестові акаунти:",
    );
    console.log("  - admin@test.com / password123 (Адміністратор)");
    console.log("  - student@test.com / password123 (Учень)");
    console.log("  - teacher@test.com / password123 (Вчитель)");
    console.log("  - methodist@test.com / password123 (Методист)");
    console.log("  - judge@test.com / password123 (Суддя)");
}

// JWT секретний ключ
const JWT_SECRET = process.env.JWT_SECRET || "default-secret-key";

/**
 * Валідація email
 * @param {string} email - Email для перевірки
 * @returns {boolean} - Чи валідний email
 */
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Валідація пароля (мінімум 6 символів)
 * @param {string} password - Пароль для перевірки
 * @returns {boolean} - Чи валідний пароль
 */
const validatePassword = (password) => {
    return password && password.length >= 6;
};

/**
 * API: Реєстрація нового користувача
 * POST /api/auth/register
 */
app.post("/api/auth/register", async (req, res) => {
    try {
        const { first_name, last_name, email, password, confirm_password } =
            req.body;

        // Валідація обов'язкових полів
        if (!first_name || !last_name || !email || !password || !confirm_password) {
            return res.status(400).json({
                success: false,
                message: "Будь ласка, заповніть всі поля",
            });
        }

        // Валідація імені та прізвища
        if (first_name.length < 2 || last_name.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Ім'я та прізвище повинні містити мінімум 2 символи",
            });
        }

        // Валідація email
        if (!validateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Невірний формат email",
            });
        }

        // Валідація пароля
        if (!validatePassword(password)) {
            return res.status(400).json({
                success: false,
                message: "Пароль повинен містити мінімум 6 символів",
            });
        }

        // Перевірка співпадіння паролів
        if (password !== confirm_password) {
            return res.status(400).json({
                success: false,
                message: "Пар��лі не співпадають",
            });
        }

        // MOCK MODE
        if (MOCK_MODE) {
            const existingMock = mockUsers.find(
                (u) => u.email === email.toLowerCase(),
            );
            if (existingMock) {
                return res.status(409).json({
                    success: false,
                    message: "Користув��ч з так��м email вже існує",
                });
            }

            const newId = mockUsers.length + 1;
            const newMockUser = {
                id: newId,
                first_name: first_name.trim(),
                last_name: last_name.trim(),
                email: email.toLowerCase(),
                role: "student",
                role_id: 1,
                created_at: new Date().toISOString(),
            };
            mockUsers.push(newMockUser);

            const token = jwt.sign(
                { userId: newId, email: newMockUser.email, role: "student", roleId: 1 },
                JWT_SECRET,
                { expiresIn: "24h" },
            );

            return res.status(201).json({
                success: true,
                message: "Реєстрація успішна",
                token,
                user: {
                    ...newMockUser,
                    role_display_name: "Учень",
                    permissions: mockPermissions[1],
                },
            });
        }

        // Перевірка унікальності email
        const existingUser = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email.toLowerCase()],
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Користувач з таким email вже існує",
            });
        }

        // Хешування пароля
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Отримуємо роль student за замовчуванням
        const defaultRole = await pool.query(
            "SELECT id, name, display_name FROM roles WHERE name = $1",
            ["student"],
        );
        const roleId = defaultRole.rows.length > 0 ? defaultRole.rows[0].id : null;

        // Створення нового користувача з role_id (RBAC)
        const newUser = await pool.query(
            `INSERT INTO users (first_name, last_name, email, password_hash, role, role_id)
             VALUES ($1, $2, $3, $4, 'student', $5)
             RETURNING id, first_name, last_name, email, role, role_id, created_at`,
            [
                first_name.trim(),
                last_name.trim(),
                email.toLowerCase(),
                passwordHash,
                roleId,
            ],
        );

        // Отримуємо дозволи для ролі
        const permissions = await pool.query(
            `SELECT p.name, p.display_name, p.category
             FROM permissions p
             JOIN role_permissions rp ON p.id = rp.permission_id
             WHERE rp.role_id = $1`,
            [roleId],
        );

        // Генерація JWT токена з role_id
        const token = jwt.sign(
            {
                userId: newUser.rows[0].id,
                email: newUser.rows[0].email,
                role: newUser.rows[0].role,
                roleId: newUser.rows[0].role_id,
            },
            JWT_SECRET,
            { expiresIn: "24h" },
        );

        // Успішна відповідь з RBAC даними
        res.status(201).json({
            success: true,
            message: "Реєстрація успішна",
            token,
            user: {
                id: newUser.rows[0].id,
                first_name: newUser.rows[0].first_name,
                last_name: newUser.rows[0].last_name,
                email: newUser.rows[0].email,
                role: newUser.rows[0].role,
                role_id: newUser.rows[0].role_id,
                role_display_name: defaultRole.rows[0]?.display_name || "Користувач",
                permissions: permissions.rows,
            },
        });
    } catch (error) {
        console.error("Помилка реєстрації:", error);
        res.status(500).json({
            success: false,
            message: "Внутрішня помилка сервера",
        });
    }
});

/**
 * API: Авторизація користувача
 * POST /api/auth/login
 */
app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Валідація обов'язкових полів
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Будь ласка, введіть email та пароль",
            });
        }

        // Валідація email
        if (!validateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Невірний формат email",
            });
        }

        // MOCK MODE
        if (MOCK_MODE) {
            const mockUser = mockUsers.find((u) => u.email === email.toLowerCase());

            if (!mockUser) {
                return res
                    .status(401)
                    .json({ success: false, message: "Невірний email або пароль" });
            }

            // У mock режимі приймаємо пароль "password123" для всіх
            if (password !== "password123") {
                return res
                    .status(401)
                    .json({ success: false, message: "Невірний email або пароль" });
            }

            const mockRole = mockRoles.find((r) => r.id === mockUser.role_id);
            const token = jwt.sign(
                {
                    userId: mockUser.id,
                    email: mockUser.email,
                    role: mockUser.role,
                    roleId: mockUser.role_id,
                },
                JWT_SECRET,
                { expiresIn: "24h" },
            );

            return res.status(200).json({
                success: true,
                message: "Авторизація успішна",
                token,
                user: {
                    id: mockUser.id,
                    first_name: mockUser.first_name,
                    last_name: mockUser.last_name,
                    email: mockUser.email,
                    role: mockUser.role,
                    role_id: mockUser.role_id,
                    role_display_name: mockRole?.display_name || "Користувач",
                    permissions: mockPermissions[mockUser.role_id] || [],
                },
            });
        }

        // Пошук користувача в базі з RBAC даними
        const result = await pool.query(
            `SELECT u.id, u.first_name, u.last_name, u.email, u.password_hash, u.role, u.role_id,
                    r.name as role_name, r.display_name as role_display_name
             FROM users u
             LEFT JOIN roles r ON u.role_id = r.id
             WHERE u.email = $1`,
            [email.toLowerCase()],
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Невірний email або пароль",
            });
        }

        const user = result.rows[0];

        // Перевірка пароля
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Невірний email або пароль",
            });
        }

        // Отримуємо дозволи користувача
        const permissions = await pool.query(
            `SELECT p.name, p.display_name, p.category
             FROM permissions p
             JOIN role_permissions rp ON p.id = rp.permission_id
             WHERE rp.role_id = $1`,
            [user.role_id],
        );

        // Генерація JWT токена з role_id
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role,
                roleId: user.role_id,
            },
            JWT_SECRET,
            { expiresIn: "24h" },
        );

        // Успішна відповідь з RBAC даними
        res.status(200).json({
            success: true,
            message: "Авторизація успішна",
            token,
            user: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role,
                role_id: user.role_id,
                role_display_name: user.role_display_name || "Користувач",
                permissions: permissions.rows,
            },
        });
    } catch (error) {
        console.error("Помилка авторизації:", error);
        res.status(500).json({
            success: false,
            message: "Внутрішня помилка сервера",
        });
    }
});

/**
 * Middleware: Перевірка JWT токена
 */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Токен авторизації не надано",
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: "Невалідний або прострочений токен",
            });
        }
        req.user = user;
        next();
    });
};

/**
 * Middleware: Перевірка дозволу (RBAC)
 * @param {string} permissionName - Назва дозволу для перевірки
 */
const requirePermission = (permissionName) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.userId;
            const roleId = req.user.roleId;

            // MOCK MODE
            if (MOCK_MODE) {
                const permissions = mockPermissions[roleId] || [];
                const hasPermission = permissions.some(
                    (p) => p.name === permissionName,
                );

                if (!hasPermission) {
                    return res.status(403).json({
                        success: false,
                        message: "Недостатньо прав для виконання цієї дії",
                    });
                }
                return next();
            }

            const result = await pool.query(
                `SELECT EXISTS (
                    SELECT 1 
                    FROM users u
                    JOIN role_permissions rp ON u.role_id = rp.role_id
                    JOIN permissions p ON rp.permission_id = p.id
                    WHERE u.id = $1 AND p.name = $2
                ) as has_permission`,
                [userId, permissionName],
            );

            if (!result.rows[0].has_permission) {
                return res.status(403).json({
                    success: false,
                    message: "Недостатньо прав для виконання цієї дії",
                });
            }

            next();
        } catch (error) {
            console.error("Помилка перевірки дозволу:", error);
            res.status(500).json({
                success: false,
                message: "Внутрішня помилка сервера",
            });
        }
    };
};

/**
 * Middleware: Перевірка ролі (RBAC)
 * @param {string[]} allowedRoles - Масив дозволених ролей
 */
const requireRole = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.userId;
            const userRole = req.user.role;

            // MOCK MODE
            if (MOCK_MODE) {
                if (!allowedRoles.includes(userRole)) {
                    return res.status(403).json({
                        success: false,
                        message: "Доступ заборонено для вашої ролі",
                    });
                }
                return next();
            }

            const result = await pool.query(
                `SELECT r.name as role_name
                 FROM users u
                 JOIN roles r ON u.role_id = r.id
                 WHERE u.id = $1`,
                [userId],
            );

            if (
                result.rows.length === 0 ||
                !allowedRoles.includes(result.rows[0].role_name)
            ) {
                return res.status(403).json({
                    success: false,
                    message: "Доступ заборонено для вашої ролі",
                });
            }

            next();
        } catch (error) {
            console.error("Помилка перевірки ролі:", error);
            res.status(500).json({
                success: false,
                message: "Внутрішня помилка сервера",
            });
        }
    };
};

/**
 * API: Отримання інформації про поточного користувача з повними RBAC да��ими
 * GET /api/auth/me
 */
app.get("/api/auth/me", authenticateToken, async (req, res) => {
    try {
        // MOCK MODE
        if (MOCK_MODE) {
            const mockUser = mockUsers.find((u) => u.id === req.user.userId);
            if (!mockUser) {
                return res.status(404).json({
                    success: false,
                    message: "Користувача не знайдено",
                });
            }

            const mockRole = mockRoles.find((r) => r.id === mockUser.role_id);
            const permissions = mockPermissions[mockUser.role_id] || [];

            return res.status(200).json({
                success: true,
                user: {
                    id: mockUser.id,
                    first_name: mockUser.first_name,
                    last_name: mockUser.last_name,
                    email: mockUser.email,
                    created_at: mockUser.created_at || new Date().toISOString(),
                    role: {
                        id: mockUser.role_id,
                        name: mockRole?.name || mockUser.role,
                        display_name: mockRole?.display_name || "Користувач",
                        description: mockRole?.description || "",
                    },
                    permissions: permissions,
                },
            });
        }

        // Отримуємо користувача з роллю
        const result = await pool.query(
            `SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.role_id, u.created_at,
                    r.name as role_name, r.display_name as role_display_name, r.description as role_description
             FROM users u
             LEFT JOIN roles r ON u.role_id = r.id
             WHERE u.id = $1`,
            [req.user.userId],
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Користувача не знайдено",
            });
        }

        const user = result.rows[0];

        // Отримуємо дозволи користувача
        const permissions = await pool.query(
            `SELECT p.name, p.display_name, p.description, p.category
             FROM permissions p
             JOIN role_permissions rp ON p.id = rp.permission_id
             WHERE rp.role_id = $1
             ORDER BY p.category, p.name`,
            [user.role_id],
        );

        res.status(200).json({
            success: true,
            user: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                created_at: user.created_at,
                role: {
                    id: user.role_id,
                    name: user.role_name,
                    display_name: user.role_display_name,
                    description: user.role_description,
                },
                permissions: permissions.rows,
            },
        });
    } catch (error) {
        console.error("Помилка отримання даних користувача:", error);
        res.status(500).json({
            success: false,
            message: "Внутрішня помилка сервера",
        });
    }
});

/**
 * API: Отримання всіх ролей системи
 * GET /api/roles
 */
app.get("/api/roles", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, name, display_name, description FROM roles ORDER BY id",
        );

        res.status(200).json({
            success: true,
            roles: result.rows,
        });
    } catch (error) {
        console.error("Помилка отримання ролей:", error);
        res.status(500).json({
            success: false,
            message: "Внутрішня помилка сервера",
        });
    }
});

/**
 * API: Отримання всіх дозволів системи
 * GET /api/permissions
 */
app.get("/api/permissions", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, name, display_name, description, category FROM permissions ORDER BY category, name",
        );

        res.status(200).json({
            success: true,
            permissions: result.rows,
        });
    } catch (error) {
        console.error("Помилка отримання дозволів:", error);
        res.status(500).json({
            success: false,
            message: "Внутрішня помилка сервера",
        });
    }
});

/**
 * API: Отримання дозволів для конкретно�� ролі
 * GET /api/roles/:roleId/permissions
 */
app.get(
    "/api/roles/:roleId/permissions",
    authenticateToken,
    async (req, res) => {
        try {
            const { roleId } = req.params;

            const result = await pool.query(
                `SELECT p.id, p.name, p.display_name, p.description, p.category
             FROM permissions p
             JOIN role_permissions rp ON p.id = rp.permission_id
             WHERE rp.role_id = $1
             ORDER BY p.category, p.name`,
                [roleId],
            );

            res.status(200).json({
                success: true,
                permissions: result.rows,
            });
        } catch (error) {
            console.error("Помилка отримання дозволів ролі:", error);
            res.status(500).json({
                success: false,
                message: "Внутрішня помилка сервера",
            });
        }
    },
);

/**
 * API: Перевірка дозволу для поточного користувача
 * GET /api/auth/check-permission/:permission
 */
app.get(
    "/api/auth/check-permission/:permission",
    authenticateToken,
    async (req, res) => {
        try {
            const { permission } = req.params;
            const userId = req.user.userId;

            const result = await pool.query(
                `SELECT EXISTS (
                SELECT 1 
                FROM users u
                JOIN role_permissions rp ON u.role_id = rp.role_id
                JOIN permissions p ON rp.permission_id = p.id
                WHERE u.id = $1 AND p.name = $2
            ) as has_permission`,
                [userId, permission],
            );

            res.status(200).json({
                success: true,
                permission: permission,
                has_permission: result.rows[0].has_permission,
            });
        } catch (error) {
            console.error("Помилка перевірки дозволу:", error);
            res.status(500).json({
                success: false,
                message: "Внутрішня помилка сервера",
            });
        }
    },
);

/**
 * API: Отримання списку всіх користувачів (тільки для admin)
 * GET /api/users
 */
app.get(
    "/api/users",
    authenticateToken,
    requireRole(["admin"]),
    async (req, res) => {
        try {
            const result = await pool.query(
                `SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.role_id, u.created_at,
                    r.name as role_name, r.display_name as role_display_name
             FROM users u
             LEFT JOIN roles r ON u.role_id = r.id
             ORDER BY u.created_at DESC`,
            );

            res.status(200).json({
                success: true,
                users: result.rows,
            });
        } catch (error) {
            console.error("Помилка отримання користувачів:", error);
            res.status(500).json({
                success: false,
                message: "Внутрішня помилка сервера",
            });
        }
    },
);

/**
 * API: Зміна ролі користувача (тільки для admin)
 * PUT /api/users/:userId/role
 */
app.put(
    "/api/users/:userId/role",
    authenticateToken,
    requireRole(["admin"]),
    async (req, res) => {
        try {
            const { userId } = req.params;
            const { role_id } = req.body;

            // Перевіряємо чи існує роль
            const roleCheck = await pool.query(
                "SELECT id, name, display_name FROM roles WHERE id = $1",
                [role_id],
            );
            if (roleCheck.rows.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Роль не знайдено",
                });
            }

            // Оновлюємо роль користувача
            const result = await pool.query(
                `UPDATE users SET role_id = $1, role = $2 WHERE id = $3
             RETURNING id, first_name, last_name, email, role, role_id`,
                [role_id, roleCheck.rows[0].name, userId],
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Користувача не знайдено",
                });
            }

            res.status(200).json({
                success: true,
                message: "Роль користувача успішно змінено",
                user: {
                    ...result.rows[0],
                    role_display_name: roleCheck.rows[0].display_name,
                },
            });
        } catch (error) {
            console.error("Помил��а зміни ролі:", error);
            res.status(500).json({
                success: false,
                message: "Внутрішня помилка сервера",
            });
        }
    },
);

/**
 * API: Отримання списку конкурсів
 * GET /api/competitions
 */
app.get("/api/competitions", authenticateToken, async (req, res) => {
    try {
        const { subject, level, status, search } = req.query;
        const userRole = req.user.role;
        const userId = req.user.userId;

        // MOCK MODE
        if (MOCK_MODE) {
            let filteredCompetitions = [...mockCompetitions];

            if (subject && subject !== "all") {
                filteredCompetitions = filteredCompetitions.filter(
                    (c) => c.subject === subject,
                );
            }
            if (level && level !== "all") {
                filteredCompetitions = filteredCompetitions.filter(
                    (c) => c.level === level,
                );
            }
            if (status && status !== "all") {
                filteredCompetitions = filteredCompetitions.filter(
                    (c) => c.status === status,
                );
            }
            if (search) {
                const searchLower = search.toLowerCase();
                filteredCompetitions = filteredCompetitions.filter(
                    (c) =>
                        c.title.toLowerCase().includes(searchLower) ||
                        (c.description &&
                            c.description.toLowerCase().includes(searchLower)),
                );
            }

            return res.status(200).json({
                success: true,
                competitions: filteredCompetitions,
            });
        }

        // Простий запит - отримуємо ВСІ конкурси
        let query = `
            SELECT c.*, 
                   u.first_name as creator_first_name, 
                   u.last_name as creator_last_name,
                   0 as applications_count
            FROM competitions c
            LEFT JOIN users u ON c.created_by = u.id
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;

        // Фільтр по предмету
        if (subject && subject !== "all") {
            query += ` AND c.subject = $${paramIndex}`;
            params.push(subject);
            paramIndex++;
        }

        // Фільтр по рівню
        if (level && level !== "all") {
            query += ` AND c.level = $${paramIndex}`;
            params.push(level);
            paramIndex++;
        }

        // Фільтр по статусу
        if (status && status !== "all") {
            query += ` AND c.status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }

        // Пошук по назві
        if (search) {
            query += ` AND (c.title ILIKE $${paramIndex} OR c.description ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        // Всі користувачі бачать всі конкурси
        query += ` ORDER BY c.created_at DESC`;

        const result = await pool.query(query, params);

        res.status(200).json({
            success: true,
            competitions: result.rows,
        });
    } catch (error) {
        console.error("Помилка отримання конкурсів:", error);
        res.status(500).json({
            success: false,
            message: "Внутрішня помилка сервера",
        });
    }
});

/**
 * API: Отримання конкурсу за ID
 * GET /api/competitions/:id
 */
app.get("/api/competitions/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // MOCK MODE
        if (MOCK_MODE) {
            const competition = mockCompetitions.find((c) => c.id === parseInt(id));
            if (!competition) {
                return res.status(404).json({
                    success: false,
                    message: "Конкурс не знайдено",
                });
            }
            return res.status(200).json({
                success: true,
                competition,
            });
        }

        const result = await pool.query(
            `SELECT c.*, 
                    u.first_name as creator_first_name, 
                    u.last_name as creator_last_name,
                    0 as applications_count
             FROM competitions c
             LEFT JOIN users u ON c.created_by = u.id
             WHERE c.id = $1`,
            [id],
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Конкурс не знайдено",
            });
        }

        res.status(200).json({
            success: true,
            competition: result.rows[0],
        });
    } catch (error) {
        console.error("Помилка отримання конкурсу:", error);
        res.status(500).json({
            success: false,
            message: "Внутрішня помилка сервера",
        });
    }
});

/**
 * API: Створення конкурсу
 * POST /api/competitions
 */
app.post(
    "/api/competitions",
    authenticateToken,
    requirePermission("create_competition"),
    async (req, res) => {
        try {
            const {
                title,
                description,
                subject,
                level,
                start_date,
                end_date,
                max_participants,
                status,
                sections,
            } = req.body;
            const userId = req.user.userId;

            if (!title || !subject || !level || !start_date || !end_date) {
                return res.status(400).json({
                    success: false,
                    message: "Заповніть всі обов'язкові поля",
                });
            }

            // Обробка секцій - перетворюємо в масив якщо це рядок
            const sectionsArray = Array.isArray(sections)
                ? sections
                : sections
                    ? [sections]
                    : [];

            // MOCK MODE
            if (MOCK_MODE) {
                const newCompetition = {
                    id: mockCompetitions.length + 1,
                    title,
                    description: description || "",
                    subject,
                    level,
                    start_date,
                    end_date,
                    max_participants: max_participants || 100,
                    sections: sectionsArray,
                    created_by: userId,
                    status: status || "draft",
                    applications_count: 0,
                    created_at: new Date().toISOString(),
                };
                mockCompetitions.push(newCompetition);

                return res.status(201).json({
                    success: true,
                    message: "Конкурс успішно створено",
                    competition: newCompetition,
                });
            }

            const result = await pool.query(
                `INSERT INTO competitions (title, description, subject, level, start_date, end_date, max_participants, created_by, status, sections)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING *`,
                [
                    title,
                    description,
                    subject,
                    level,
                    start_date,
                    end_date,
                    max_participants || 100,
                    userId,
                    status || "draft",
                    sectionsArray,
                ],
            );

            res.status(201).json({
                success: true,
                message: "Конкурс успішно створено",
                competition: result.rows[0],
            });
        } catch (error) {
            console.error("Помилка створення конкурсу:", error);
            res.status(500).json({
                success: false,
                message: "Внутрішня помилка сервера",
            });
        }
    },
);

/**
 * API: Оновлення конкурсу
 * PUT /api/competitions/:id
 */
app.put(
    "/api/competitions/:id",
    authenticateToken,
    requirePermission("edit_competition"),
    async (req, res) => {
        try {
            const { id } = req.params;
            const {
                title,
                description,
                subject,
                level,
                start_date,
                end_date,
                max_participants,
                status,
                sections,
            } = req.body;

            // Обробка секцій - перетворюємо в масив якщо це рядок
            const sectionsArray =
                sections !== undefined
                    ? Array.isArray(sections)
                        ? sections
                        : sections
                            ? [sections]
                            : []
                    : undefined;

            const result = await pool.query(
                `UPDATE competitions 
             SET title = COALESCE($1, title),
                 description = COALESCE($2, description),
                 subject = COALESCE($3, subject),
                 level = COALESCE($4, level),
                 start_date = COALESCE($5, start_date),
                 end_date = COALESCE($6, end_date),
                 max_participants = COALESCE($7, max_participants),
                 status = COALESCE($8, status),
                 sections = COALESCE($9, sections),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $10
             RETURNING *`,
                [
                    title,
                    description,
                    subject,
                    level,
                    start_date,
                    end_date,
                    max_participants,
                    status,
                    sectionsArray,
                    id,
                ],
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Конкурс не знайдено",
                });
            }

            res.status(200).json({
                success: true,
                message: "Конкурс успішно оновлено",
                competition: result.rows[0],
            });
        } catch (error) {
            console.error("Помилка оновлення конкурсу:", error);
            res.status(500).json({
                success: false,
                message: "Внутрішня помилка сервера",
            });
        }
    },
);

/**
 * API: Видалення конкурсу
 * DELETE /api/competitions/:id
 */
app.delete(
    "/api/competitions/:id",
    authenticateToken,
    requirePermission("delete_competition"),
    async (req, res) => {
        try {
            const { id } = req.params;

            const result = await pool.query(
                "DELETE FROM competitions WHERE id = $1 RETURNING id",
                [id],
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Конкурс не знайдено",
                });
            }

            res.status(200).json({
                success: true,
                message: "Конкурс успішно видалено",
            });
        } catch (error) {
            console.error("Помилка видалення конкурсу:", error);
            res.status(500).json({
                success: false,
                message: "Внутрішня поми��ка сервера",
            });
        }
    },
);

/**
 * API: Подати заявку на конкурс
 * POST /api/competitions/:id/apply
 */
app.post("/api/competitions/:id/apply", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        // Перевіряємо чи існує конкурс і чи він активний
        const competition = await pool.query(
            "SELECT * FROM competitions WHERE id = $1 AND status = $2",
            [id, "active"],
        );

        if (competition.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Конкурс не знайдено або не є активним",
            });
        }

        // Перевіряємо чи користувач вже подав заявку
        const existingApplication = await pool.query(
            "SELECT id FROM competition_applications WHERE competition_id = $1 AND user_id = $2",
            [id, userId],
        );

        if (existingApplication.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Ви вже подали заявку на цей конкурс",
            });
        }

        const result = await pool.query(
            `INSERT INTO competition_applications (competition_id, user_id, status)
             VALUES ($1, $2, 'pending')
             RETURNING *`,
            [id, userId],
        );

        res.status(201).json({
            success: true,
            message: "Заявку успішно подано",
            application: result.rows[0],
        });
    } catch (error) {
        console.error("Помилка подання заявки:", error);
        res.status(500).json({
            success: false,
            message: "Внутрішня помилка сервера",
        });
    }
});

/**
 * API: Отримання заявок на конкурс
 * GET /api/competitions/:id/applications
 */
app.get(
    "/api/competitions/:id/applications",
    authenticateToken,
    async (req, res) => {
        try {
            const { id } = req.params;

            const result = await pool.query(
                `SELECT ca.*, u.first_name, u.last_name, u.email
             FROM competition_applications ca
             JOIN users u ON ca.user_id = u.id
             WHERE ca.competition_id = $1
             ORDER BY ca.created_at DESC`,
                [id],
            );

            res.status(200).json({
                success: true,
                applications: result.rows,
            });
        } catch (error) {
            console.error("Помилка отримання заявок:", error);
            res.status(500).json({
                success: false,
                message: "Внутрішня помилка сервера",
            });
        }
    },
);

/**
 * API: Отримання списку всіх користувачів (тільки для admin) - розширене
 * GET /api/admin/users
 */
app.get(
    "/api/admin/users",
    authenticateToken,
    requireRole(["admin"]),
    async (req, res) => {
        try {
            // MOCK MODE
            if (MOCK_MODE) {
                const usersWithRoles = mockUsers.map(user => {
                    const role = mockRoles.find(r => r.id === user.role_id);
                    return {
                        ...user,
                        role_name: role?.name || user.role,
                        role_display_name: role?.display_name || user.role
                    };
                });

                return res.status(200).json({
                    success: true,
                    users: usersWithRoles,
                });
            }

            const result = await pool.query(
                `SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.role_id, u.created_at,
                    r.name as role_name, r.display_name as role_display_name
             FROM users u
             LEFT JOIN roles r ON u.role_id = r.id
             ORDER BY u.created_at DESC`,
            );

            res.status(200).json({
                success: true,
                users: result.rows,
            });
        } catch (error) {
            console.error("Помилка отримання користувачів:", error);
            res.status(500).json({
                success: false,
                message: "Внутрішня помилка сервера",
            });
        }
    },
);

/**
 * API: Отримання всіх ролей (для адмін-панелі)
 * GET /api/admin/roles
 */
app.get(
    "/api/admin/roles",
    authenticateToken,
    requireRole(["admin"]),
    async (req, res) => {
        try {
            // MOCK MODE
            if (MOCK_MODE) {
                return res.status(200).json({
                    success: true,
                    roles: mockRoles,
                });
            }

            const result = await pool.query(
                "SELECT id, name, display_name, description FROM roles ORDER BY id",
            );

            res.status(200).json({
                success: true,
                roles: result.rows,
            });
        } catch (error) {
            console.error("Помилка отримання ролей:", error);
            res.status(500).json({
                success: false,
                message: "Внутрішня помилка сервера",
            });
        }
    },
);

/**
 * API: Створення нового користувача (тільки для admin)
 * POST /api/admin/users
 */
app.post(
    "/api/admin/users",
    authenticateToken,
    requireRole(["admin"]),
    async (req, res) => {
        try {
            const { first_name, last_name, email, password, role_id } = req.body;

            // Валідація
            if (!first_name || !last_name || !email || !password || !role_id) {
                return res.status(400).json({
                    success: false,
                    message: "Заповніть всі обов'язкові поля",
                });
            }

            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: "Пароль повинен містити мінімум 6 символів",
                });
            }

            // MOCK MODE
            if (MOCK_MODE) {
                const existingMock = mockUsers.find(u => u.email === email.toLowerCase());
                if (existingMock) {
                    return res.status(409).json({
                        success: false,
                        message: "Користувач з таким email вже існує",
                    });
                }

                const role = mockRoles.find(r => r.id === parseInt(role_id));
                const newId = mockUsers.length + 1;
                const newUser = {
                    id: newId,
                    first_name: first_name.trim(),
                    last_name: last_name.trim(),
                    email: email.toLowerCase(),
                    role: role?.name || 'student',
                    role_id: parseInt(role_id),
                    role_name: role?.name,
                    role_display_name: role?.display_name,
                    created_at: new Date().toISOString(),
                };
                mockUsers.push(newUser);

                return res.status(201).json({
                    success: true,
                    message: "Користувача успішно створено",
                    user: newUser,
                });
            }

            // Перевірка унікальності email
            const existingUser = await pool.query(
                "SELECT id FROM users WHERE email = $1",
                [email.toLowerCase()],
            );

            if (existingUser.rows.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: "Користувач з таким email вже існує",
                });
            }

            // Перевіряємо чи існує роль
            const roleCheck = await pool.query(
                "SELECT id, name, display_name FROM roles WHERE id = $1",
                [role_id],
            );
            if (roleCheck.rows.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Роль не знайдено",
                });
            }

            // Хешування пароля
            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(password, saltRounds);

            // Створення користувача
            const result = await pool.query(
                `INSERT INTO users (first_name, last_name, email, password_hash, role, role_id)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, first_name, last_name, email, role, role_id, created_at`,
                [
                    first_name.trim(),
                    last_name.trim(),
                    email.toLowerCase(),
                    passwordHash,
                    roleCheck.rows[0].name,
                    role_id,
                ],
            );

            res.status(201).json({
                success: true,
                message: "Користувача успішно створено",
                user: {
                    ...result.rows[0],
                    role_name: roleCheck.rows[0].name,
                    role_display_name: roleCheck.rows[0].display_name,
                },
            });
        } catch (error) {
            console.error("Помилка створення користувача:", error);
            res.status(500).json({
                success: false,
                message: "Внутрішня помилка сервера",
            });
        }
    },
);

/**
 * API: Оновлення користувача (тільки для admin)
 * PUT /api/admin/users/:userId
 */
app.put(
    "/api/admin/users/:userId",
    authenticateToken,
    requireRole(["admin"]),
    async (req, res) => {
        try {
            const { userId } = req.params;
            const { first_name, last_name, email, password, role_id } = req.body;

            // MOCK MODE
            if (MOCK_MODE) {
                const userIndex = mockUsers.findIndex(u => u.id === parseInt(userId));
                if (userIndex === -1) {
                    return res.status(404).json({
                        success: false,
                        message: "Користувача не знайдено",
                    });
                }

                // Перевірка унікальності email
                const emailExists = mockUsers.find(
                    u => u.email === email.toLowerCase() && u.id !== parseInt(userId)
                );
                if (emailExists) {
                    return res.status(409).json({
                        success: false,
                        message: "Користувач з таким email вже існує",
                    });
                }

                const role = mockRoles.find(r => r.id === parseInt(role_id));
                mockUsers[userIndex] = {
                    ...mockUsers[userIndex],
                    first_name: first_name?.trim() || mockUsers[userIndex].first_name,
                    last_name: last_name?.trim() || mockUsers[userIndex].last_name,
                    email: email?.toLowerCase() || mockUsers[userIndex].email,
                    role: role?.name || mockUsers[userIndex].role,
                    role_id: parseInt(role_id) || mockUsers[userIndex].role_id,
                    role_name: role?.name,
                    role_display_name: role?.display_name,
                };

                return res.status(200).json({
                    success: true,
                    message: "Користувача успішно оновлено",
                    user: mockUsers[userIndex],
                });
            }

            // Перевірка унікальності email
            if (email) {
                const existingUser = await pool.query(
                    "SELECT id FROM users WHERE email = $1 AND id != $2",
                    [email.toLowerCase(), userId],
                );
                if (existingUser.rows.length > 0) {
                    return res.status(409).json({
                        success: false,
                        message: "Користувач з таким email вже існує",
                    });
                }
            }

            // Перевіряємо чи існує роль
            let roleName = null;
            let roleDisplayName = null;
            if (role_id) {
                const roleCheck = await pool.query(
                    "SELECT id, name, display_name FROM roles WHERE id = $1",
                    [role_id],
                );
                if (roleCheck.rows.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: "Роль не знайдено",
                    });
                }
                roleName = roleCheck.rows[0].name;
                roleDisplayName = roleCheck.rows[0].display_name;
            }

            // Оновлення користувача
            let query = `UPDATE users SET 
                first_name = COALESCE($1, first_name),
                last_name = COALESCE($2, last_name),
                email = COALESCE($3, email)`;
            let params = [first_name?.trim(), last_name?.trim(), email?.toLowerCase()];
            let paramIndex = 4;

            if (role_id) {
                query += `, role_id = $${paramIndex}, role = $${paramIndex + 1}`;
                params.push(role_id, roleName);
                paramIndex += 2;
            }

            if (password && password.length >= 6) {
                const passwordHash = await bcrypt.hash(password, 10);
                query += `, password_hash = $${paramIndex}`;
                params.push(passwordHash);
                paramIndex++;
            }

            query += ` WHERE id = $${paramIndex} RETURNING id, first_name, last_name, email, role, role_id, created_at`;
            params.push(userId);

            const result = await pool.query(query, params);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Користувача не знайдено",
                });
            }

            res.status(200).json({
                success: true,
                message: "Користувача успішно оновлено",
                user: {
                    ...result.rows[0],
                    role_name: roleName || result.rows[0].role,
                    role_display_name: roleDisplayName,
                },
            });
        } catch (error) {
            console.error("Помилка оновлення користувача:", error);
            res.status(500).json({
                success: false,
                message: "Внутрішня помилка сервера",
            });
        }
    },
);

/**
 * API: Видалення користувача (тільки для admin)
 * DELETE /api/admin/users/:userId
 */
app.delete(
    "/api/admin/users/:userId",
    authenticateToken,
    requireRole(["admin"]),
    async (req, res) => {
        try {
            const { userId } = req.params;
            const currentUserId = req.user.userId;

            // Заборона видалення самого себе
            if (parseInt(userId) === currentUserId) {
                return res.status(400).json({
                    success: false,
                    message: "Ви не можете видалити свій акаунт",
                });
            }

            // MOCK MODE
            if (MOCK_MODE) {
                const userIndex = mockUsers.findIndex(u => u.id === parseInt(userId));
                if (userIndex === -1) {
                    return res.status(404).json({
                        success: false,
                        message: "Користувача не знайдено",
                    });
                }
                mockUsers.splice(userIndex, 1);

                return res.status(200).json({
                    success: true,
                    message: "Користувача успішно видалено",
                });
            }

            const result = await pool.query(
                "DELETE FROM users WHERE id = $1 RETURNING id",
                [userId],
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Користувача не знайдено",
                });
            }

            res.status(200).json({
                success: true,
                message: "Користувача успішно видалено",
            });
        } catch (error) {
            console.error("Помилка видалення користувача:", error);
            res.status(500).json({
                success: false,
                message: "Внутрішня помилка сервера",
            });
        }
    },
);

// ============================================================================
// API: Система профілів та закладів освіти
// ============================================================================

/**
 * API: Отримання списку закладів освіти
 * GET /api/institutions
 */
app.get("/api/institutions", authenticateToken, async (req, res) => {
    try {
        const { type, region, search } = req.query;

        // MOCK MODE
        if (MOCK_MODE) {
            let filtered = [...mockInstitutions];

            if (type && type !== "all") {
                filtered = filtered.filter((i) => i.type === type);
            }
            if (region && region !== "all") {
                filtered = filtered.filter((i) => i.region === region);
            }
            if (search) {
                const searchLower = search.toLowerCase();
                filtered = filtered.filter(
                    (i) =>
                        i.name.toLowerCase().includes(searchLower) ||
                        (i.short_name && i.short_name.toLowerCase().includes(searchLower)) ||
                        i.city.toLowerCase().includes(searchLower)
                );
            }

            return res.status(200).json({
                success: true,
                institutions: filtered,
            });
        }

        let query = `SELECT * FROM institutions WHERE is_active = TRUE`;
        const params = [];
        let paramIndex = 1;

        if (type && type !== "all") {
            query += ` AND type = $${paramIndex}`;
            params.push(type);
            paramIndex++;
        }

        if (region && region !== "all") {
            query += ` AND region = $${paramIndex}`;
            params.push(region);
            paramIndex++;
        }

        if (search) {
            query += ` AND (name ILIKE $${paramIndex} OR short_name ILIKE $${paramIndex} OR city ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        query += ` ORDER BY name`;

        const result = await pool.query(query, params);

        res.status(200).json({
            success: true,
            institutions: result.rows,
        });
    } catch (error) {
        console.error("Помилка отримання закладів:", error);
        res.status(500).json({
            success: false,
            message: "Внутрішня помилка сервера",
        });
    }
});

/**
 * API: Отримання профілю поточного користувача
 * GET /api/profile
 */
app.get("/api/profile", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        // MOCK MODE
        if (MOCK_MODE) {
            const profile = mockProfiles.find((p) => p.user_id === userId);
            const user = mockUsers.find((u) => u.id === userId);
            const institution = profile?.institution_id
                ? mockInstitutions.find((i) => i.id === profile.institution_id)
                : null;

            return res.status(200).json({
                success: true,
                profile: profile || null,
                user: user
                    ? {
                          id: user.id,
                          first_name: user.first_name,
                          last_name: user.last_name,
                          email: user.email,
                          role: user.role,
                      }
                    : null,
                institution: institution,
            });
        }

        const result = await pool.query(
            `SELECT p.*, u.first_name, u.last_name, u.email, u.role, u.role_id,
                    i.name as institution_name, i.short_name as institution_short_name, 
                    i.type as institution_type, i.city as institution_city
             FROM profiles p
             RIGHT JOIN users u ON p.user_id = u.id
             LEFT JOIN institutions i ON p.institution_id = i.id
             WHERE u.id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Користувача не знайдено",
            });
        }

        const row = result.rows[0];

        res.status(200).json({
            success: true,
            profile: row.id
                ? {
                      id: row.id,
                      user_id: row.user_id,
                      middle_name: row.middle_name,
                      phone: row.phone,
                      date_of_birth: row.date_of_birth,
                      gender: row.gender,
                      avatar_url: row.avatar_url,
                      bio: row.bio,
                      institution_id: row.institution_id,
                      student_class: row.student_class,
                      student_parallel: row.student_parallel,
                      student_specialization: row.student_specialization,
                      parent_name: row.parent_name,
                      parent_phone: row.parent_phone,
                      parent_email: row.parent_email,
                      teacher_subject: row.teacher_subject,
                      teacher_category: row.teacher_category,
                      teacher_experience_years: row.teacher_experience_years,
                      teacher_education: row.teacher_education,
                      teacher_position: row.teacher_position,
                      methodist_department: row.methodist_department,
                      methodist_specialization: row.methodist_specialization,
                      methodist_qualification: row.methodist_qualification,
                      judge_specialization: row.judge_specialization,
                      judge_experience_years: row.judge_experience_years,
                      judge_certifications: row.judge_certifications,
                      admin_department: row.admin_department,
                      admin_position: row.admin_position,
                      is_complete: row.is_complete,
                  }
                : null,
            user: {
                id: userId,
                first_name: row.first_name,
                last_name: row.last_name,
                email: row.email,
                role: row.role,
            },
            institution: row.institution_id
                ? {
                      id: row.institution_id,
                      name: row.institution_name,
                      short_name: row.institution_short_name,
                      type: row.institution_type,
                      city: row.institution_city,
                  }
                : null,
        });
    } catch (error) {
        console.error("Помилка отримання профілю:", error);
        res.status(500).json({
            success: false,
            message: "Внутрішня помилка сервера",
        });
    }
});

/**
 * API: Створення або оновлення профілю
 * POST /api/profile
 */
app.post("/api/profile", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const userRole = req.user.role;
        const profileData = req.body;

        // MOCK MODE
        if (MOCK_MODE) {
            let existingIndex = mockProfiles.findIndex((p) => p.user_id === userId);

            const newProfile = {
                id: existingIndex >= 0 ? mockProfiles[existingIndex].id : mockProfiles.length + 1,
                user_id: userId,
                middle_name: profileData.middle_name || null,
                phone: profileData.phone || null,
                date_of_birth: profileData.date_of_birth || null,
                gender: profileData.gender || null,
                bio: profileData.bio || null,
                institution_id: profileData.institution_id || null,
                // Student fields
                student_class: profileData.student_class || null,
                student_parallel: profileData.student_parallel || null,
                student_specialization: profileData.student_specialization || null,
                parent_name: profileData.parent_name || null,
                parent_phone: profileData.parent_phone || null,
                parent_email: profileData.parent_email || null,
                // Teacher fields
                teacher_subject: profileData.teacher_subject || null,
                teacher_category: profileData.teacher_category || null,
                teacher_experience_years: profileData.teacher_experience_years || null,
                teacher_education: profileData.teacher_education || null,
                teacher_position: profileData.teacher_position || null,
                // Methodist fields
                methodist_department: profileData.methodist_department || null,
                methodist_specialization: profileData.methodist_specialization || null,
                methodist_qualification: profileData.methodist_qualification || null,
                // Judge fields
                judge_specialization: profileData.judge_specialization || null,
                judge_experience_years: profileData.judge_experience_years || null,
                judge_certifications: profileData.judge_certifications || null,
                // Admin fields
                admin_department: profileData.admin_department || null,
                admin_position: profileData.admin_position || null,
                is_complete: checkMockProfileComplete(profileData, userRole),
            };

            if (existingIndex >= 0) {
                mockProfiles[existingIndex] = newProfile;
            } else {
                mockProfiles.push(newProfile);
            }

            return res.status(200).json({
                success: true,
                message: existingIndex >= 0 ? "Профіль успішно оновлено" : "Профіль успішно створено",
                profile: newProfile,
            });
        }

        // Check if profile exists
        const existingProfile = await pool.query("SELECT id FROM profiles WHERE user_id = $1", [userId]);

        let result;
        if (existingProfile.rows.length > 0) {
            // Update existing profile
            result = await pool.query(
                `UPDATE profiles SET
                    middle_name = $1, phone = $2, date_of_birth = $3, gender = $4, bio = $5,
                    institution_id = $6,
                    student_class = $7, student_parallel = $8, student_specialization = $9,
                    parent_name = $10, parent_phone = $11, parent_email = $12,
                    teacher_subject = $13, teacher_category = $14, teacher_experience_years = $15,
                    teacher_education = $16, teacher_position = $17,
                    methodist_department = $18, methodist_specialization = $19, methodist_qualification = $20,
                    judge_specialization = $21, judge_experience_years = $22, judge_certifications = $23,
                    admin_department = $24, admin_position = $25,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = $26
                RETURNING *`,
                [
                    profileData.middle_name,
                    profileData.phone,
                    profileData.date_of_birth,
                    profileData.gender,
                    profileData.bio,
                    profileData.institution_id,
                    profileData.student_class,
                    profileData.student_parallel,
                    profileData.student_specialization,
                    profileData.parent_name,
                    profileData.parent_phone,
                    profileData.parent_email,
                    profileData.teacher_subject,
                    profileData.teacher_category,
                    profileData.teacher_experience_years,
                    profileData.teacher_education,
                    profileData.teacher_position,
                    profileData.methodist_department,
                    profileData.methodist_specialization,
                    profileData.methodist_qualification,
                    profileData.judge_specialization,
                    profileData.judge_experience_years,
                    profileData.judge_certifications,
                    profileData.admin_department,
                    profileData.admin_position,
                    userId,
                ]
            );
        } else {
            // Create new profile
            result = await pool.query(
                `INSERT INTO profiles (
                    user_id, middle_name, phone, date_of_birth, gender, bio, institution_id,
                    student_class, student_parallel, student_specialization,
                    parent_name, parent_phone, parent_email,
                    teacher_subject, teacher_category, teacher_experience_years, teacher_education, teacher_position,
                    methodist_department, methodist_specialization, methodist_qualification,
                    judge_specialization, judge_experience_years, judge_certifications,
                    admin_department, admin_position
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
                RETURNING *`,
                [
                    userId,
                    profileData.middle_name,
                    profileData.phone,
                    profileData.date_of_birth,
                    profileData.gender,
                    profileData.bio,
                    profileData.institution_id,
                    profileData.student_class,
                    profileData.student_parallel,
                    profileData.student_specialization,
                    profileData.parent_name,
                    profileData.parent_phone,
                    profileData.parent_email,
                    profileData.teacher_subject,
                    profileData.teacher_category,
                    profileData.teacher_experience_years,
                    profileData.teacher_education,
                    profileData.teacher_position,
                    profileData.methodist_department,
                    profileData.methodist_specialization,
                    profileData.methodist_qualification,
                    profileData.judge_specialization,
                    profileData.judge_experience_years,
                    profileData.judge_certifications,
                    profileData.admin_department,
                    profileData.admin_position,
                ]
            );
        }

        // Update is_complete status
        await pool.query(
            `UPDATE profiles SET is_complete = check_profile_completeness(id, $1) WHERE user_id = $2`,
            [userRole, userId]
        );

        res.status(200).json({
            success: true,
            message: existingProfile.rows.length > 0 ? "Профіль успішно оновлено" : "Профіль успішно створено",
            profile: result.rows[0],
        });
    } catch (error) {
        console.error("Помилка збереження профілю:", error);
        res.status(500).json({
            success: false,
            message: "Внутрішня помилка сервера",
        });
    }
});

/**
 * Helper: Перевірка заповненості профілю для mock режиму
 */
function checkMockProfileComplete(profile, role) {
    if (!profile.phone) return false;

    if (role !== "admin" && !profile.institution_id) return false;

    switch (role) {
        case "student":
            return !!profile.student_class;
        case "teacher":
            return !!profile.teacher_subject;
        case "methodist":
            return !!profile.methodist_department;
        case "judge":
            return !!profile.judge_specialization;
        default:
            return true;
    }
}

// Маршрут для головної сторінки авторизації
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "auth.html"));
});

// Маршрут для dashboard (статичний файл - перевірка токена на клієнті)
app.get("/dashboard.html", (req, res) => {
    res.sendFile(path.join(__dirname, "dashboard.html"));
});

// Маршрут для competitions (статичний файл - перевірка токена на клієнті)
app.get("/competitions.html", (req, res) => {
    res.sendFile(path.join(__dirname, "competitions.html"));
});

// Маршрут для users (адмін-панель - перевірка ролі на клієнті)
app.get("/users.html", (req, res) => {
    res.sendFile(path.join(__dirname, "users.html"));
});

// Маршрут для profile (сторінка профілю)
app.get("/profile.html", (req, res) => {
    res.sendFile(path.join(__dirname, "profile.html"));
});

// PWA файли
app.get("/manifest.json", (req, res) => {
    res.sendFile(path.join(__dirname, "manifest.json"));
});

app.get("/service-worker.js", (req, res) => {
    res.sendFile(path.join(__dirname, "service-worker.js"));
});

// Запуск сервера на фіксованому порту
const server = app.listen(PORT, () => {
    console.log(`Сервер запущено на порту ${PORT}`);
    console.log(`Відкрийте http://localhost:${PORT} для доступу до платформи`);
});

// Експорт для тестування та middleware
module.exports = { app, authenticateToken, requirePermission, requireRole };

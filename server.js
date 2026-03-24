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
const fs = require("fs");

// Створюємо папку uploads якщо не існує
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Ініціалізація Express додатку
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// File upload configuration (using built-in multipart parsing)
const ALLOWED_FILE_TYPES = [".pdf", ".doc", ".docx", ".zip", ".rar"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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
        institution_id: null,
    },
    {
        id: 2,
        first_name: "Іван",
        last_name: "Петренко",
        email: "student@test.com",
        password_hash: "$2a$10$mockhashstudent",
        role: "student",
        role_id: 1,
        institution_id: 1,
    },
    {
        id: 3,
        first_name: "Марія",
        last_name: "Коваленко",
        email: "teacher@test.com",
        password_hash: "$2a$10$mockhashteacher",
        role: "teacher",
        role_id: 2,
        institution_id: 1,
    },
    {
        id: 4,
        first_name: "Олена",
        last_name: "Сидоренко",
        email: "methodist@test.com",
        password_hash: "$2a$10$mockhashmethodist",
        role: "methodist",
        role_id: 3,
        institution_id: null,
    },
    {
        id: 5,
        first_name: "Петро",
        last_name: "Іваненко",
        email: "judge@test.com",
        password_hash: "$2a$10$mockhashjudge",
        role: "judge",
        role_id: 4,
        institution_id: null,
    },
    {
        id: 6,
        first_name: "Наталія",
        last_name: "Шевченко",
        email: "deputy@test.com",
        password_hash: "$2a$10$mockhashdeputy",
        role: "deputy_principal",
        role_id: 6,
        institution_id: 1,
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
    {
        id: 6,
        name: "deputy_principal",
        display_name: "Завуч",
        description: "Затверджує проведення конкурсів у закладі",
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
        {
            name: "publish_competition",
            display_name: "Публікація конкурсу",
            category: "competitions",
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
    6: [
        {
            name: "view_competitions",
            display_name: "Перегляд конкурсів",
            category: "competitions",
        },
        {
            name: "approve_institution_competitions",
            display_name: "Затвердження конкурсів для закладу",
            category: "competitions",
        },
        {
            name: "view_institution_applications",
            display_name: "Перегляд заявок закладу",
            category: "applications",
        },
        {
            name: "manage_institution_applications",
            display_name: "Керування заявками закладу",
            category: "applications",
        },
    ],
};

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
        created_by: 2,
        max_participants: 100,
        applications_count: 0,
        created_at: "2026-02-01",
    },
];

let mockSections = [
    {
        id: 1,
        competition_id: 1,
        name: "Теоретичний тур",
        description: "Теоретичні завдання та тести",
    },
    {
        id: 2,
        competition_id: 1,
        name: "Практичний тур",
        description: "Практичні завдання та задачі",
    },
    {
        id: 3,
        competition_id: 2,
        name: "Теоретичний тур",
        description: "Теоретичні завдання з фізики",
    },
    {
        id: 4,
        competition_id: 2,
        name: "Експериментальний тур",
        description: "Експериментальні завдання",
    },
    {
        id: 5,
        competition_id: 3,
        name: "Алгоритми",
        description: "Завдання на алгоритми",
    },
    {
        id: 6,
        competition_id: 3,
        name: "Програмування",
        description: "Практичні завдання з програмування",
    },
    {
        id: 7,
        competition_id: 4,
        name: "Есе",
        description: "Творчі есе на вільну тему",
    },
    {
        id: 8,
        competition_id: 4,
        name: "Диктант",
        description: "Диктант з української мови",
    },
];

let mockApplications = [];

// Mock дані для закладів освіти
const mockInstitutions = [
    {
        id: 1,
        name: "Київська гімназія №1",
        code: "KG001",
        region: "Київська область",
        city: "Київ",
    },
    {
        id: 2,
        name: "Львівський ліцей №5",
        code: "LL005",
        region: "Львівська область",
        city: "Львів",
    },
    {
        id: 3,
        name: "Одеська школа №23",
        code: "OS023",
        region: "Одеська область",
        city: "Одеса",
    },
    {
        id: 4,
        name: "Харківська гімназія №7",
        code: "HG007",
        region: "Харківська область",
        city: "Харків",
    },
];

// Mock дані для заявок закладів на участь у конкурсах
let mockInstitutionApplications = [
    {
        id: 1,
        competition_id: 1,
        institution_id: 1,
        status: "approved",
        approved_by: 6,
        approved_at: "2026-03-20",
        notes: "Затверджено для проведення",
    },
    {
        id: 2,
        competition_id: 2,
        institution_id: 1,
        status: "pending",
        approved_by: null,
        approved_at: null,
        notes: null,
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
    console.log("  - deputy@test.com / password123 (Завуч)");
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
                message: "Паролі не співпадають",
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
                    message: "Користувач з таким email вже існує",
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
 * API: Отримання інформації про поточного користувача з повними RBAC даними
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

        // Отримуємо ��ористувача з роллю
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
 * API: Отримання дозволів для конкретної ролі
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
            console.error("Помилка зміни ролі:", error);
            res.status(500).json({
                success: false,
                message: "Внутрішня помилка сервера",
            });
        }
    },
);

/**
 * API: Отримання списку конкурсів з урахуванням ієрархії
 * GET /api/competitions
 */
app.get("/api/competitions", authenticateToken, async (req, res) => {
    try {
        const { subject, level, status, search } = req.query;
        const userRole = req.user.role;
        const userId = req.user.userId;

        console.log(
            "[v0] GET /api/competitions - userRole:",
            userRole,
            "userId:",
            userId,
        );

        let params = [];
        let whereClauses = ["c.status IN ('published', 'active')"];

        let query = `
      SELECT c.*, 
             u.first_name as creator_first_name, 
             u.last_name as creator_last_name,
             (SELECT COUNT(*) FROM competition_applications WHERE competition_id = c.id) as applications_count
      FROM competitions c
      LEFT JOIN users u ON c.created_by = u.id
    `;

        // Отримуємо institution_id користувача
        const userResult = await pool.query(
            "SELECT institution_id FROM users WHERE id = $1",
            [userId],
        );
        const userInstitutionId = userResult.rows[0]?.institution_id;

        // ==================== ФІЛЬТРАЦІЯ ЗА РОЛЯМИ ====================
        if (userRole === "deputy_principal") {
            // Завуч бачить всі опубліковані конкурси
            // (може затверджувати їх для свого закладу)
            if (userInstitutionId) {
                whereClauses.push(`
          (c.status IN ('published', 'active') 
           OR EXISTS (
             SELECT 1 FROM institution_applications 
             WHERE competition_id = c.id AND institution_id = $${params.length + 1}
           ))
        `);
                params.push(userInstitutionId);
            }
        } else if (userRole === "teacher") {
            // Вчитель бачить тільки конкурси, затверджені завучем його закладу
            if (userInstitutionId) {
                whereClauses.push(`
          EXISTS (
            SELECT 1 FROM institution_applications 
            WHERE competition_id = c.id 
              AND institution_id = $${params.length + 1} 
              AND status = 'approved'
          )
        `);
                params.push(userInstitutionId);
            } else {
                whereClauses.push("1=0"); // вчитель без закладу нічого не бачить
            }
        } else if (userRole === "student") {
            // Учень бачить тільки конкурси, затверджені завучем для його закладу
            if (userInstitutionId) {
                whereClauses.push(`
                    EXISTS (
                        SELECT 1 FROM institution_applications ia
                        WHERE ia.competition_id = c.id
                        AND ia.institution_id = $${params.length + 1}
                        AND ia.status = 'approved'
                    )
                `);
                params.push(userInstitutionId);
            } else {
                whereClauses.push("1=0"); // учень без закладу нічого не бачить
            }
        }
        // admin, methodist, judge — бачать всі опубліковані конкурси

        // Збираємо WHERE
        query += " WHERE " + whereClauses.join(" AND ");

        // Додаткові фільтри
        if (subject && subject !== "all") {
            query += ` AND c.subject = $${params.length + 1}`;
            params.push(subject);
        }
        if (level && level !== "all") {
            query += ` AND c.level = $${params.length + 1}`;
            params.push(level);
        }
        if (status && status !== "all") {
            query += ` AND c.status = $${params.length + 1}`;
            params.push(status);
        }
        if (search) {
            query += ` AND (c.title ILIKE $${params.length + 1} OR c.description ILIKE $${params.length + 1})`;
            params.push(`%${search}%`);
        }

        query += ` ORDER BY c.created_at DESC`;

        console.log("[v0] Executing query:", query);
        console.log("[v0] With params:", params);

        const result = await pool.query(query, params);

        console.log("[v0] Query result count:", result.rows.length);

        // Додаємо статус заявки закладу для завуча
        let competitions = result.rows;
        if (userRole === "deputy_principal" && userInstitutionId) {
            const instResult = await pool.query(
                `SELECT competition_id, status as institution_application_status 
         FROM institution_applications 
         WHERE institution_id = $1`,
                [userInstitutionId],
            );

            const map = new Map(
                instResult.rows.map((row) => [
                    row.competition_id,
                    row.institution_application_status,
                ]),
            );

            competitions = competitions.map((c) => ({
                ...c,
                institution_application_status: map.get(c.id) || null,
            }));
        }

        res.status(200).json({
            success: true,
            competitions: competitions,
        });
    } catch (error) {
        console.error("[ERROR] /api/competitions:", error.message);
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
        const userRole = req.user.role;
        const userId = req.user.userId;

        console.log(
            `[v0] GET /api/competitions/${id} - userRole: ${userRole}, userId: ${userId}`,
        );

        // Отримуємо institution_id користувача
        const userResult = await pool.query(
            "SELECT institution_id FROM users WHERE id = $1",
            [userId],
        );
        const userInstitutionId = userResult.rows[0]?.institution_id;

        let query = `
      SELECT c.*, 
             u.first_name as creator_first_name, 
             u.last_name as creator_last_name,
             (SELECT COUNT(*) FROM competition_applications WHERE competition_id = c.id) as applications_count
      FROM competitions c
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.id = $1
    `;

        const params = [id];

        // Додаткова перевірка доступу залежно від ролі
        if (userRole === "student" || userRole === "teacher") {
            if (userInstitutionId) {
                query += `
          AND EXISTS (
            SELECT 1 FROM institution_applications ia
            WHERE ia.competition_id = c.id 
              AND ia.institution_id = $2 
              AND ia.status = 'approved'
          )
        `;
                params.push(userInstitutionId);
            } else {
                // Якщо немає institution_id — дозволяємо тільки якщо конкурс створений самим користувачем (рідко)
                query += ` AND c.created_by = $2`;
                params.push(userId);
            }
        } else if (userRole === "deputy_principal") {
            // Завуч може переглядати будь-який конкурс, але бачить статус заявки свого закладу
            if (userInstitutionId) {
                query += `
          AND (
            c.status IN ('published', 'active')
            OR EXISTS (
              SELECT 1 FROM institution_applications 
              WHERE competition_id = c.id AND institution_id = $2
            )
          )
        `;
                params.push(userInstitutionId);
            }
        }
        // admin, methodist, judge — мають повний доступ (без додаткових умов)

        const result = await pool.query(query, params);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Конкурс не знайдено або у вас немає доступу до нього",
            });
        }

        let competition = result.rows[0];

        // Для завуча додаємо статус заявки його закладу
        if (userRole === "deputy_principal" && userInstitutionId) {
            const instAppResult = await pool.query(
                `SELECT status as institution_application_status, 
                approved_at, notes 
         FROM institution_applications 
         WHERE competition_id = $1 AND institution_id = $2`,
                [id, userInstitutionId],
            );

            if (instAppResult.rows.length > 0) {
                competition = {
                    ...competition,
                    institution_application_status:
                        instAppResult.rows[0].institution_application_status,
                    institution_approved_at: instAppResult.rows[0].approved_at,
                    institution_notes: instAppResult.rows[0].notes,
                };
            }
        }

        res.status(200).json({
            success: true,
            competition: competition,
        });
    } catch (error) {
        console.error("[ERROR] GET /api/competitions/:id:", error.message);
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
            } = req.body;
            const userId = req.user.userId;

            if (!title || !subject || !level || !start_date || !end_date) {
                return res.status(400).json({
                    success: false,
                    message: "Заповніть всі обов'язкові поля",
                });
            }

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
                `INSERT INTO competitions (title, description, subject, level, start_date, end_date, max_participants, created_by, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
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
            } = req.body;

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
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $9
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
                message: "Внутрішня помилка сервера",
            });
        }
    },
);

/**
 * API: Отримання секцій конкурсу
 * GET /api/competitions/:id/sections
 */
app.get(
    "/api/competitions/:id/sections",
    authenticateToken,
    async (req, res) => {
        try {
            const { id } = req.params;

            // MOCK MODE
            if (MOCK_MODE) {
                const sections = mockSections.filter(
                    (s) => s.competition_id === parseInt(id),
                );
                return res.status(200).json({
                    success: true,
                    sections: sections,
                });
            }

            const result = await pool.query(
                "SELECT * FROM competition_sections WHERE competition_id = $1 ORDER BY id",
                [id],
            );

            res.status(200).json({
                success: true,
                sections: result.rows,
            });
        } catch (error) {
            console.error("Помилка отримання секцій:", error);
            res.status(500).json({
                success: false,
                message: "Внутрішня помилка сервера",
            });
        }
    },
);

/**
 * API: Перевірка чи студент вже подав заявку
 * GET /api/competitions/:id/my-application
 */
app.get(
    "/api/competitions/:id/my-application",
    authenticateToken,
    async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.userId;

            // MOCK MODE
            if (MOCK_MODE) {
                const application = mockApplications.find(
                    (a) => a.competition_id === parseInt(id) && a.user_id === userId,
                );
                return res.status(200).json({
                    success: true,
                    has_application: !!application,
                    application: application || null,
                });
            }

            const result = await pool.query(
                `SELECT ca.*, cs.name as section_name
             FROM competition_applications ca
             LEFT JOIN competition_sections cs ON ca.section_id = cs.id
             WHERE ca.competition_id = $1 AND ca.user_id = $2`,
                [id, userId],
            );

            res.status(200).json({
                success: true,
                has_application: result.rows.length > 0,
                application: result.rows[0] || null,
            });
        } catch (error) {
            console.error("Помилка перевірки заявки:", error);
            res.status(500).json({
                success: false,
                message: "Внутрішня помилка сервера",
            });
        }
    },
);

/**
 * API: Подати заявку на конкурс (повна форма)
 * POST /api/competitions/:id/apply
 */
app.post("/api/competitions/:id/apply", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const { section_id, title, description, file_data, file_name } = req.body;

        // MOCK MODE
        if (MOCK_MODE) {
            const competition = mockCompetitions.find((c) => c.id === parseInt(id));

            if (!competition) {
                return res.status(404).json({
                    success: false,
                    message: "Конкурс не знайдено",
                });
            }

            if (competition.status !== "active") {
                return res.status(400).json({
                    success: false,
                    message: "Конкурс не є активним",
                });
            }

            // Перевіряємо дедлайн
            const deadline = new Date(competition.end_date);
            if (new Date() > deadline) {
                return res.status(400).json({
                    success: false,
                    message: "Дедлайн подачі заявок минув",
                });
            }

            // Перевіряємо чи студент вже подав заявку
            const existingApp = mockApplications.find(
                (a) => a.competition_id === parseInt(id) && a.user_id === userId,
            );
            if (existingApp) {
                return res.status(409).json({
                    success: false,
                    message: "Ви вже подали заявку на цей конкурс",
                });
            }

            // Перевіряємо секцію
            const section = mockSections.find((s) => s.id === parseInt(section_id));
            if (!section || section.competition_id !== parseInt(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Невірна секція конкурсу",
                });
            }

            // Зберігаємо файл якщо є
            let filePath = null;
            let savedFileName = null;
            if (file_data && file_name) {
                const ext = path.extname(file_name).toLowerCase();
                if (!ALLOWED_FILE_TYPES.includes(ext)) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Недозволений тип файлу. Дозволені: pdf, doc, docx, zip, rar",
                    });
                }
                savedFileName = `${Date.now()}-${file_name}`;
                filePath = `/uploads/${savedFileName}`;

                // В реальному режимі тут буде збереження файлу
                // Для mock режиму просто зберігаємо шлях
            }

            const newApplication = {
                id: mockApplications.length + 1,
                competition_id: parseInt(id),
                user_id: userId,
                section_id: parseInt(section_id),
                title: title,
                description: description,
                file_path: filePath,
                file_name: savedFileName,
                status: "submitted",
                created_at: new Date().toISOString(),
                section_name: section.name,
            };
            mockApplications.push(newApplication);

            // Оновлюємо кількість заявок
            competition.applications_count =
                (competition.applications_count || 0) + 1;

            return res.status(201).json({
                success: true,
                message: "Заявку успішно подано",
                application: newApplication,
            });
        }

        // Перевіряємо чи існує конкурс і чи він активний
        const competition = await pool.query(
            "SELECT * FROM competitions WHERE id = $1",
            [id],
        );

        if (competition.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Конкурс не знайдено",
            });
        }

        const comp = competition.rows[0];

        if (comp.status !== "active") {
            return res.status(400).json({
                success: false,
                message: "Конкурс не є активним",
            });
        }

        // Перевіряємо дедлайн
        const deadline = new Date(comp.end_date);
        if (new Date() > deadline) {
            return res.status(400).json({
                success: false,
                message: "Дедлайн подачі заявок минув",
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

        // Перевіряємо секцію
        if (section_id) {
            const sectionCheck = await pool.query(
                "SELECT id FROM competition_sections WHERE id = $1 AND competition_id = $2",
                [section_id, id],
            );
            if (sectionCheck.rows.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Невірна секція конкурсу",
                });
            }
        }

        // Зберігаємо файл якщо є
        let filePath = null;
        let savedFileName = null;
        let fileSize = null;

        if (file_data && file_name) {
            const ext = path.extname(file_name).toLowerCase();
            if (!ALLOWED_FILE_TYPES.includes(ext)) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Недозволений тип файлу. Дозволені: pdf, doc, docx, zip, rar",
                });
            }

            // Декодуємо base64 та зберігаємо файл
            const fileBuffer = Buffer.from(file_data, "base64");

            if (fileBuffer.length > MAX_FILE_SIZE) {
                return res.status(400).json({
                    success: false,
                    message: "Файл занадто великий. Максимальний розмір: 10MB",
                });
            }

            savedFileName = `${Date.now()}-${userId}-${file_name}`;
            filePath = `/uploads/${savedFileName}`;
            fileSize = fileBuffer.length;

            const fullPath = path.join(__dirname, "uploads", savedFileName);
            fs.writeFileSync(fullPath, fileBuffer);
        }

        const result = await pool.query(
            `INSERT INTO competition_applications 
             (competition_id, user_id, section_id, title, description, file_path, file_name, file_size, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'submitted')
             RETURNING *`,
            [
                id,
                userId,
                section_id,
                title,
                description,
                filePath,
                savedFileName,
                fileSize,
            ],
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
 * API: Отримання заявок на конкурс (для адмінів/методистів)
 * GET /api/competitions/:id/applications
 */
app.get(
    "/api/competitions/:id/applications",
    authenticateToken,
    async (req, res) => {
        try {
            const { id } = req.params;

            // MOCK MODE
            if (MOCK_MODE) {
                const applications = mockApplications
                    .filter((a) => a.competition_id === parseInt(id))
                    .map((a) => {
                        const user = mockUsers.find((u) => u.id === a.user_id);
                        const section = mockSections.find((s) => s.id === a.section_id);
                        return {
                            ...a,
                            first_name: user?.first_name,
                            last_name: user?.last_name,
                            email: user?.email,
                            section_name: section?.name,
                        };
                    });
                return res.status(200).json({
                    success: true,
                    applications: applications,
                });
            }

            const result = await pool.query(
                `SELECT ca.*, u.first_name, u.last_name, u.email, cs.name as section_name
             FROM competition_applications ca
             JOIN users u ON ca.user_id = u.id
             LEFT JOIN competition_sections cs ON ca.section_id = cs.id
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
 * API: Отримання всіх заявок поточного користувача
 * GET /api/my-applications
 */
app.get("/api/my-applications", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        // MOCK MODE
        if (MOCK_MODE) {
            const applications = mockApplications
                .filter((a) => a.user_id === userId)
                .map((a) => {
                    const competition = mockCompetitions.find(
                        (c) => c.id === a.competition_id,
                    );
                    const section = mockSections.find((s) => s.id === a.section_id);
                    return {
                        ...a,
                        competition_title: competition?.title,
                        competition_subject: competition?.subject,
                        competition_level: competition?.level,
                        competition_status: competition?.status,
                        competition_end_date: competition?.end_date,
                        section_name: section?.name,
                    };
                });
            return res.status(200).json({
                success: true,
                applications: applications,
            });
        }

        const result = await pool.query(
            `SELECT ca.*, 
                    c.title as competition_title, 
                    c.subject as competition_subject,
                    c.level as competition_level,
                    c.status as competition_status,
                    c.end_date as competition_end_date,
                    cs.name as section_name
             FROM competition_applications ca
             JOIN competitions c ON ca.competition_id = c.id
             LEFT JOIN competition_sections cs ON ca.section_id = cs.id
             WHERE ca.user_id = $1
             ORDER BY ca.created_at DESC`,
            [userId],
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
});

/**
 * API: Завантаження файлу
 * POST /api/upload
 */
app.post("/api/upload", authenticateToken, async (req, res) => {
    try {
        const { file_data, file_name } = req.body;

        if (!file_data || !file_name) {
            return res.status(400).json({
                success: false,
                message: "Файл не надано",
            });
        }

        const ext = path.extname(file_name).toLowerCase();
        if (!ALLOWED_FILE_TYPES.includes(ext)) {
            return res.status(400).json({
                success: false,
                message: "Недозволений тип файлу. Дозволені: pdf, doc, docx, zip, rar",
            });
        }

        const fileBuffer = Buffer.from(file_data, "base64");

        if (fileBuffer.length > MAX_FILE_SIZE) {
            return res.status(400).json({
                success: false,
                message: "Файл занадто великий. Максимальний розмір: 10MB",
            });
        }

        const savedFileName = `${Date.now()}-${req.user.userId}-${file_name}`;
        const filePath = `/uploads/${savedFileName}`;

        const fullPath = path.join(__dirname, "uploads", savedFileName);
        fs.writeFileSync(fullPath, fileBuffer);

        res.status(200).json({
            success: true,
            message: "Файл успішно завантажено",
            file: {
                path: filePath,
                name: savedFileName,
                size: fileBuffer.length,
            },
        });
    } catch (error) {
        console.error("Помилка завантаження файлу:", error);
        res.status(500).json({
            success: false,
            message: "Внутрішня помилка сервера",
        });
    }
});

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

// Маршрут для перегляду деталей конкурсу
app.get("/competition.html", (req, res) => {
    res.sendFile(path.join(__dirname, "competition.html"));
});

// Маршрут для моїх заявок
app.get("/my-applications.html", (req, res) => {
    res.sendFile(path.join(__dirname, "my-applications.html"));
});

// ============================================================================
// API для системи заявок закладів (deputy_principal)
// ============================================================================

/**
 * API: Отримання заявок закладу на конкурси (для завуча)
 * GET /api/institution-applications
 */
app.get(
    "/api/institution-applications",
    authenticateToken,
    async (req, res) => {
        try {
            const userId = req.user.userId;
            const userRole = req.user.role;

            // Тільки для завучів
            if (userRole !== "deputy_principal" && userRole !== "admin") {
                return res.status(403).json({
                    success: false,
                    message: "Доступ заборонено",
                });
            }

            // MOCK MODE
            if (MOCK_MODE) {
                const mockUser = mockUsers.find((u) => u.id === userId);
                const institutionId = mockUser?.institution_id;

                if (!institutionId && userRole !== "admin") {
                    return res.status(400).json({
                        success: false,
                        message: "Користувач не прив'язаний до закладу",
                    });
                }

                // Отримуємо всі опубліковані конкурси
                const publishedCompetitions = mockCompetitions.filter(
                    (c) => c.status === "published" || c.status === "active",
                );

                // Додаємо інформацію про статус заявки
                const competitionsWithStatus = publishedCompetitions.map((c) => {
                    const instApp = mockInstitutionApplications.find(
                        (ia) =>
                            ia.competition_id === c.id &&
                            (userRole === "admin" || ia.institution_id === institutionId),
                    );
                    return {
                        ...c,
                        institution_application_status: instApp?.status || null,
                        institution_application_id: instApp?.id || null,
                        approved_at: instApp?.approved_at || null,
                        notes: instApp?.notes || null,
                    };
                });

                return res.status(200).json({
                    success: true,
                    competitions: competitionsWithStatus,
                    institution: mockInstitutions.find((i) => i.id === institutionId),
                });
            }

            // DB MODE - буде реалізовано пізніше
            res.status(501).json({
                success: false,
                message: "DB mode not implemented yet",
            });
        } catch (error) {
            console.error("Помилка отримання заявок закладу:", error);
            res.status(500).json({
                success: false,
                message: "Внутрішня помилка сервера",
            });
        }
    },
);

/**
 * API: Затвердити/відхилити конкурс для закладу (для завуча)
 * POST /api/institution-applications/:competitionId/approve
 */
app.post(
    "/api/institution-applications/:competitionId/approve",
    authenticateToken,
    async (req, res) => {
        try {
            const { competitionId } = req.params;
            const { status, notes } = req.body; // status: 'approved' | 'rejected'
            const userId = req.user.userId;
            const userRole = req.user.role;

            if (userRole !== "deputy_principal") {
                return res.status(403).json({
                    success: false,
                    message:
                        "Доступ заборонено. Тільки завуч може затверджувати конкурси для закладу",
                });
            }

            if (!["approved", "rejected"].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Невірний статус. Допустимі значення: approved, rejected",
                });
            }

            // Перевіряємо, чи існує конкурс і чи він опублікований
            const competitionCheck = await pool.query(
                "SELECT id, status FROM competitions WHERE id = $1",
                [competitionId],
            );

            if (competitionCheck.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Конкурс не знайдено",
                });
            }

            if (!["published", "active"].includes(competitionCheck.rows[0].status)) {
                return res.status(400).json({
                    success: false,
                    message: "Можна затверджувати тільки опубліковані конкурси",
                });
            }

            // Отримуємо institution_id завуча
            const userResult = await pool.query(
                "SELECT institution_id FROM users WHERE id = $1",
                [userId],
            );

            const institutionId = userResult.rows[0]?.institution_id;

            if (!institutionId) {
                return res.status(400).json({
                    success: false,
                    message: "Завуч не прив'язаний до жодного закладу освіти",
                });
            }

            // Затверджуємо / відхиляємо конкурс для закладу
            const result = await pool.query(
                `INSERT INTO institution_applications 
           (competition_id, institution_id, status, approved_by, approved_at, notes)
         VALUES ($1, $2, $3, $4, NOW(), $5)
         ON CONFLICT (competition_id, institution_id) 
         DO UPDATE SET 
           status = $3,
           approved_by = $4,
           approved_at = NOW(),
           notes = $5,
           updated_at = NOW()
         RETURNING *`,
                [competitionId, institutionId, status, userId, notes || null],
            );

            const message =
                status === "approved"
                    ? "Конкурс успішно затверджено для проведення у вашому закладі"
                    : "Конкурс відхилено для вашого закладу";

            res.status(200).json({
                success: true,
                message: message,
                institution_application: result.rows[0],
            });
        } catch (error) {
            console.error("Помилка затвердження конкурсу для закладу:", error);
            res.status(500).json({
                success: false,
                message: "Внутрішня помилка сервера",
            });
        }
    },
);

/**
 * API: Отримання списку конкурсів з урахуванням ієрархії
 * GET /api/competitions
 */
app.get("/api/competitions", authenticateToken, async (req, res) => {
    try {
        const { subject, level, status, search } = req.query;
        const userRole = req.user.role;
        const userId = req.user.userId;

        console.log(
            "[v0] GET /api/competitions - userRole:",
            userRole,
            "userId:",
            userId,
        );

        let params = [];
        let whereClauses = ["c.status IN ('published', 'active')"];

        let query = `
      SELECT c.*, 
             u.first_name as creator_first_name, 
             u.last_name as creator_last_name,
             (SELECT COUNT(*) FROM competition_applications WHERE competition_id = c.id) as applications_count
      FROM competitions c
      LEFT JOIN users u ON c.created_by = u.id
    `;

        // Отримуємо institution_id користувача
        const userResult = await pool.query(
            "SELECT institution_id FROM users WHERE id = $1",
            [userId],
        );
        const userInstitutionId = userResult.rows[0]?.institution_id;

        // ==================== ФІЛЬТРАЦІЯ ЗА РОЛЯМИ ====================
        if (userRole === "deputy_principal") {
            // Завуч бачить всі опубліковані конкурси + ті, що вже має в заявках
            if (userInstitutionId) {
                whereClauses.push(`
          (c.status IN ('published', 'active') 
           OR EXISTS (
             SELECT 1 FROM institution_applications 
             WHERE competition_id = c.id AND institution_id = $${params.length + 1}
           ))
        `);
                params.push(userInstitutionId);
            }
        } else if (userRole === "teacher") {
            if (userInstitutionId) {
                whereClauses.push(`
          (c.created_by = $${params.length + 1} 
           OR EXISTS (
             SELECT 1 FROM institution_applications 
             WHERE competition_id = c.id 
               AND institution_id = $${params.length + 2} 
               AND status = 'approved'
           ))
        `);
                params.push(userId, userInstitutionId);
            } else {
                whereClauses.push(`c.created_by = $${params.length + 1}`);
                params.push(userId);
            }
        } else if (userRole === "student") {
            if (userInstitutionId) {
                whereClauses.push(`
          EXISTS (
            SELECT 1 FROM institution_applications 
            WHERE competition_id = c.id 
              AND institution_id = $${params.length + 1} 
              AND status = 'approved'
          )
        `);
                params.push(userInstitutionId);
            } else {
                whereClauses.push("1=0"); // учень без закладу нічого не бачить
            }
        }
        // admin, methodist, judge — бачать всі published/active (базова умова)

        // Збираємо WHERE
        query += " WHERE " + whereClauses.join(" AND ");

        // Додаткові фільтри
        if (subject && subject !== "all") {
            query += ` AND c.subject = $${params.length + 1}`;
            params.push(subject);
        }
        if (level && level !== "all") {
            query += ` AND c.level = $${params.length + 1}`;
            params.push(level);
        }
        if (status && status !== "all") {
            query += ` AND c.status = $${params.length + 1}`;
            params.push(status);
        }
        if (search) {
            query += ` AND (c.title ILIKE $${params.length + 1} OR c.description ILIKE $${params.length + 1})`;
            params.push(`%${search}%`);
        }

        query += ` ORDER BY c.created_at DESC`;

        console.log("[v0] Executing query:", query);
        console.log("[v0] With params:", params);

        const result = await pool.query(query, params);

        console.log("[v0] Query result count:", result.rows.length);

        // Додаємо статус заявки закладу для завуча
        let competitions = result.rows;
        if (userRole === "deputy_principal" && userInstitutionId) {
            const instResult = await pool.query(
                `SELECT competition_id, status as institution_application_status 
         FROM institution_applications 
         WHERE institution_id = $1`,
                [userInstitutionId],
            );

            const map = new Map(
                instResult.rows.map((row) => [
                    row.competition_id,
                    row.institution_application_status,
                ]),
            );

            competitions = competitions.map((c) => ({
                ...c,
                institution_application_status: map.get(c.id) || null,
            }));
        }

        res.status(200).json({
            success: true,
            competitions: competitions,
        });
    } catch (error) {
        console.error("[ERROR] /api/competitions:", error.message);
        res.status(500).json({
            success: false,
            message: "Внутрішня помилка сервера",
        });
    }
});

/**
 * API: Отримання списку закладів (для адміністрування)
 * GET /api/institutions
 */
app.get("/api/institutions", authenticateToken, async (req, res) => {
    try {
        // MOCK MODE
        if (MOCK_MODE) {
            return res.status(200).json({
                success: true,
                institutions: mockInstitutions,
            });
        }

        // DB MODE
        const result = await pool.query("SELECT * FROM institutions ORDER BY name");
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
 * API: Публікація конкурсу (для методиста)
 * POST /api/competitions/:id/publish
 */
app.post(
    "/api/competitions/:id/publish",
    authenticateToken,
    requirePermission("publish_competition"),
    async (req, res) => {
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

                if (competition.status !== "draft") {
                    return res.status(400).json({
                        success: false,
                        message: "Конкурс вже опубліковано або має інший статус",
                    });
                }

                competition.status = "published";

                return res.status(200).json({
                    success: true,
                    message: "Конкурс успішно опубліковано",
                    competition: competition,
                });
            }

            // DB MODE
            const result = await pool.query(
                `UPDATE competitions SET status = 'published', updated_at = CURRENT_TIMESTAMP 
             WHERE id = $1 AND status = 'draft' 
             RETURNING *`,
                [id],
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Конкурс не знайдено або вже опубліковано",
                });
            }

            res.status(200).json({
                success: true,
                message: "Конкурс успішно опубліковано",
                competition: result.rows[0],
            });
        } catch (error) {
            console.error("Помилка публікації конкурсу:", error);
            res.status(500).json({
                success: false,
                message: "Внутрішня помилка сервера",
            });
        }
    },
);

// Функція для пошуку вільного порту
const startServer = (port) => {
    const server = app.listen(port, () => {
        console.log(`Сервер запущено на порту ${port}`);
        console.log(`Відкрийте http://localhost:${port} для доступу до платформи`);
    });

    server.on("error", (err) => {
        if (err.code === "EADDRINUSE") {
            console.log(`Пор�� ${port} зайнятий, спроба порту ${port + 1}...`);
            startServer(port + 1);
        } else {
            console.error("Помилка сервера:", err);
        }
    });
};

// Запуск сервера тільки якщо файл запущено напряму
if (require.main === module) {
    startServer(PORT);
}

// Експорт для тестування та middleware
module.exports = { app, authenticateToken, requirePermission, requireRole };
// v1.0.1

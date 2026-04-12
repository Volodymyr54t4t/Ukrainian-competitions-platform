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
const multer = require("multer");

// Ініціалізація Express додатку
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Налаштування для завантаження файлів
const uploadsDir = path.join(__dirname, "uploads", "profile_photo");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer конфігурація для завантаження фото профілю
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const userId = req.user?.userId || "unknown";
        const ext = path.extname(file.originalname);
        const filename = `profile_${userId}_${Date.now()}${ext}`;
        cb(null, filename);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Тільки зображення дозволені"), false);
        }
    }
});

// Статична папка для uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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

// Mock дані для навчальних закладів Житомира
const mockInstitutions = [
    { id: 16907, name: "Вересівський ліцей Житомирської міської ради" },
    { id: 24634, name: "Відокремлений підрозділ \"Заклад загальної середньої освіти І-ІІІ ступенів \"Житомирський ліцей Київського інституту бізнесу та технологій\"" },
    { id: 24081, name: "Відокремлений підрозділ \"Науковий ліцей Житомирського державного університету імені Івана Франка\"" },
    { id: 24618, name: "Відокремлений структурний підрозділ \"Науковий ліцей Поліського національного університету\"" },
    { id: 15697, name: "ЖИТОМИРСЬКИЙ ПРИВАТНИЙ ХРИСТИЯНСЬКИЙ ЛІЦЕЙ \"СЯЙВО\" М.ЖИТОМИРА" },
    { id: 15671, name: "Ліцей № 10 міста Житомира" },
    { id: 15679, name: "Ліцей № 21 міста Житомира" },
    { id: 15668, name: "Ліцей № 6 міста Житомира ім. В.Г. Короленка" },
    { id: 15693, name: "Ліцей № 1 міста Житомира" },
    { id: 15672, name: "Ліцей № 12 міста Житомира ім. С. Ковальчука" },
    { id: 15673, name: "Ліцей № 14 міста Житомира" },
    { id: 15674, name: "Ліцей № 15 міста Житомира" },
    { id: 15675, name: "Ліцей № 16 міста Житомира" },
    { id: 15676, name: "Ліцей № 17 міста Житомира" },
    { id: 15677, name: "Ліцей №19 міста Житомира" },
    { id: 15665, name: "Ліцей № 2 міста Житомира" },
    { id: 15678, name: "Ліцей № 20 міста Житомира" },
    { id: 15680, name: "Ліцей № 22 міста Житомира імені Василя Михайловича Кавуна" },
    { id: 15681, name: "Ліцей № 23 міста Житомира ім. М. Очерета" },
    { id: 15682, name: "Ліцей № 24 міста Житомира" },
    { id: 15683, name: "Ліцей № 25 міста Житомира" },
    { id: 15684, name: "Ліцей № 26 міста Житомира" },
    { id: 15685, name: "Ліцей № 27 міста Житомира" },
    { id: 15686, name: "Ліцей № 28 міста Житомира імені гетьмана Івана Виговського" },
    { id: 15666, name: "Ліцей № 3 міста Житомира" },
    { id: 15687, name: "Ліцей № 30 міста Житомира" },
    { id: 15694, name: "Ліцей № 31 міста Житомира" },
    { id: 15688, name: "Ліцей № 32 міста Житомира" },
    { id: 15689, name: "Ліцей № 33 міста Житомира" },
    { id: 15690, name: "Ліцей № 34 міста Житомира" },
    { id: 15691, name: "Ліцей № 35 міста Житомира" },
    { id: 15692, name: "Ліцей № 36 міста Житомира ім. Я. Домбровського" },
    { id: 15664, name: "Ліцей № 4 міста Житомира" },
    { id: 15667, name: "Ліцей № 5 міста Житомира" },
    { id: 15669, name: "Ліцей № 7 міста Житомира імені Валерія Вікторовича Бражевського" },
    { id: 15670, name: "Ліцей № 8 міста Житомира" },
    { id: 24066, name: "Відокремлений підрозділ «Науковий ліцей» Державного університету «Житомирська політехніка»" },
    { id: 15698, name: "Приватний ліцей \"Ор Авнер\" міста Житомира" },
    { id: 20075, name: "Початкова школа № 11 міста Житомира" },
    { id: 15699, name: "Салезіянський приватний ліцей \"Всесвіт\" м.Житомира" },
    { id: 24592, name: "Товариство з обмеженою відповідальністю загальноосвітній навчальний заклад \"Синергія\"" },
    { id: 24031, name: "Товариство з обмеженою відповідальністю «ЗАКЛАД ОСВІТИ «УСПІХ»" },
    { id: 24106, name: "ТОВАРИСТВО З ОБМЕЖЕНОЮ ВІДПОВІДАЛЬНІСТЮ «ПРИВАТНИЙ ЛІЦЕЙ «АЙ ТІ СТЕП СКУЛ ЖИТОМИР»" },
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
                message: "Внутрішня помилка сервера",
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

// Маршрут для profile-student (профіль студента)
app.get("/profile-student.html", (req, res) => {
    res.sendFile(path.join(__dirname, "profile-student.html"));
});

// ==================== MOCK DATA ДЛЯ ПРОФІЛІВ СТУДЕНТІВ ====================
const mockStudentProfiles = {};

/**
 * API: Отримання профілю студента
 * GET /api/profile/student
 */
app.get("/api/profile/student", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        // MOCK MODE
        if (MOCK_MODE) {
            const profile = mockStudentProfiles[userId];
            
            if (!profile) {
                // Повертаємо базову інформацію з users
                const user = mockUsers.find(u => u.id === userId);
                return res.status(200).json({
                    success: true,
                    profile: {
                        user_id: userId,
                        first_name: user?.first_name || "",
                        last_name: user?.last_name || "",
                        profile_photo: null,
                        class: null,
                        institution: null,
                        city: null,
                        interests: [],
                        achievements: [],
                        certificates: [],
                    },
                });
            }

            return res.status(200).json({
                success: true,
                profile,
            });
        }

        // Реальний режим з БД
        const result = await pool.query(
            `SELECT ps.*, u.first_name as user_first_name, u.last_name as user_last_name
             FROM profile_student ps
             RIGHT JOIN users u ON ps.user_id = u.id
             WHERE u.id = $1`,
            [userId],
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Профіль не знайдено",
            });
        }

        const row = result.rows[0];
        const profile = {
            user_id: userId,
            first_name: row.first_name || row.user_first_name,
            last_name: row.last_name || row.user_last_name,
            profile_photo: row.profile_photo,
            class: row.class,
            institution: row.institution,
            city: row.city,
            interests: row.interests || [],
            achievements: row.achievements || [],
            certificates: row.certificates || [],
        };

        res.status(200).json({
            success: true,
            profile,
        });
    } catch (error) {
        console.error("Помилка отримання профілю студента:", error);
        res.status(500).json({
            success: false,
            message: "Внутрішня помилка сервера",
        });
    }
});

/**
 * API: Збереження/оновлення профілю студента
 * POST /api/profile/student
 */
app.post("/api/profile/student", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const {
            first_name,
            last_name,
            profile_photo,
            class: studentClass,
            institution,
            city,
            interests,
            achievements,
            certificates,
        } = req.body;

        // Валідація обов'язкових полів
        if (!first_name || !last_name) {
            return res.status(400).json({
                success: false,
                message: "Ім'я та прізвище є обов'язковими",
            });
        }

        // MOCK MODE
        if (MOCK_MODE) {
            mockStudentProfiles[userId] = {
                user_id: userId,
                first_name: first_name.trim(),
                last_name: last_name.trim(),
                profile_photo: profile_photo || null,
                class: studentClass || null,
                institution: institution || null,
                city: city || null,
                interests: interests || [],
                achievements: achievements || [],
                certificates: certificates || [],
                updated_at: new Date().toISOString(),
            };

            // Оновлюємо також дані в mockUsers
            const userIndex = mockUsers.findIndex(u => u.id === userId);
            if (userIndex !== -1) {
                mockUsers[userIndex].first_name = first_name.trim();
                mockUsers[userIndex].last_name = last_name.trim();
            }

            return res.status(200).json({
                success: true,
                message: "Профіль успішно збережено",
                profile: mockStudentProfiles[userId],
            });
        }

        // Реальний режим з БД - UPSERT
        const result = await pool.query(
            `INSERT INTO profile_student (
                user_id, first_name, last_name, profile_photo, 
                class, institution, city, interests, achievements, certificates
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (user_id) DO UPDATE SET
                first_name = EXCLUDED.first_name,
                last_name = EXCLUDED.last_name,
                profile_photo = EXCLUDED.profile_photo,
                class = EXCLUDED.class,
                institution = EXCLUDED.institution,
                city = EXCLUDED.city,
                interests = EXCLUDED.interests,
                achievements = EXCLUDED.achievements,
                certificates = EXCLUDED.certificates,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *`,
            [
                userId,
                first_name.trim(),
                last_name.trim(),
                profile_photo || null,
                studentClass || null,
                institution || null,
                city || null,
                interests || [],
                JSON.stringify(achievements || []),
                JSON.stringify(certificates || []),
            ],
        );

        // Оновлюємо також дані в таблиці users
        await pool.query(
            "UPDATE users SET first_name = $1, last_name = $2 WHERE id = $3",
            [first_name.trim(), last_name.trim(), userId],
        );

        res.status(200).json({
            success: true,
            message: "Профіль успішно збережено",
            profile: result.rows[0],
        });
    } catch (error) {
        console.error("Помилка збереження профілю студента:", error);
        res.status(500).json({
            success: false,
            message: "Внутрішня помилка сервера",
        });
    }
});

/**
 * API: Завантаження фото профілю
 * POST /api/profile/photo
 */
app.post("/api/profile/photo", authenticateToken, upload.single("photo"), async (req, res) => {
    try {
        const userId = req.user.userId;
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Файл не завантажено",
            });
        }

        // Шлях до фото (відносний для збереження в БД)
        const photoPath = `/uploads/profile_photo/${req.file.filename}`;

        // MOCK MODE
        if (MOCK_MODE) {
            if (!mockStudentProfiles[userId]) {
                mockStudentProfiles[userId] = {
                    user_id: userId,
                    profile_photo: photoPath,
                };
            } else {
                // Видаляємо старе фото якщо є
                const oldPhoto = mockStudentProfiles[userId].profile_photo;
                if (oldPhoto && oldPhoto.startsWith("/uploads/")) {
                    const oldPath = path.join(__dirname, oldPhoto);
                    if (fs.existsSync(oldPath)) {
                        fs.unlinkSync(oldPath);
                    }
                }
                mockStudentProfiles[userId].profile_photo = photoPath;
            }

            return res.status(200).json({
                success: true,
                message: "Фото успішно завантажено",
                photo_url: photoPath,
            });
        }

        // Реальний режим - оновлення в БД
        // Спочатку отримуємо старе фото для видалення
        const oldPhotoResult = await pool.query(
            "SELECT profile_photo FROM profile_student WHERE user_id = $1",
            [userId],
        );

        if (oldPhotoResult.rows.length > 0 && oldPhotoResult.rows[0].profile_photo) {
            const oldPhoto = oldPhotoResult.rows[0].profile_photo;
            if (oldPhoto.startsWith("/uploads/")) {
                const oldPath = path.join(__dirname, oldPhoto);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
        }

        // Оновлюємо або створюємо запис
        await pool.query(
            `INSERT INTO profile_student (user_id, profile_photo, first_name, last_name)
             SELECT $1, $2, first_name, last_name FROM users WHERE id = $1
             ON CONFLICT (user_id) DO UPDATE SET
                profile_photo = EXCLUDED.profile_photo,
                updated_at = CURRENT_TIMESTAMP`,
            [userId, photoPath],
        );

        res.status(200).json({
            success: true,
            message: "Фото успішно завантажено",
            photo_url: photoPath,
        });
    } catch (error) {
        console.error("Помилка завантаження фото:", error);
        res.status(500).json({
            success: false,
            message: "Внутрішня помилка сервера",
        });
    }
});

/**
 * API: Отримання списку навчальних закладів
 * GET /api/institutions
 */
app.get("/api/institutions", async (req, res) => {
    try {
        // MOCK MODE
        if (MOCK_MODE) {
            return res.status(200).json({
                success: true,
                institutions: mockInstitutions,
            });
        }

        // Реальний режим з БД
        const result = await pool.query(
            "SELECT id, name FROM zhytomyr_educational_institutions ORDER BY name",
        );

        res.status(200).json({
            success: true,
            institutions: result.rows,
        });
    } catch (error) {
        console.error("Помилка отримання списку закладів:", error);
        res.status(500).json({
            success: false,
            message: "Внутрішня помилка сервера",
        });
    }
});

// PWA файли
app.get("/manifest.json", (req, res) => {
    res.sendFile(path.join(__dirname, "manifest.json"));
});

app.get("/service-worker.js", (req, res) => {
    res.sendFile(path.join(__dirname, "service-worker.js"));
});

// Функція для пошуку вільного порту
const startServer = (port) => {
    const server = app.listen(port, () => {
        console.log(`Сервер запущено на порту ${port}`);
        console.log(`Відкрийте http://localhost:${port} для доступу до платформи`);
    });

    server.on("error", (err) => {
        if (err.code === "EADDRINUSE") {
            console.log(`Порт ${port} зайнятий, спроба порту ${port + 1}...`);
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

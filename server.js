/**
 * Сервер авторизації для платформи "Єдина платформа конкурсів України"
 * 
 * Технології: Node.js, Express, PostgreSQL, JWT, bcrypt
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const path = require('path');

// Ініціалізація Express додатку
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Підключення до PostgreSQL через Pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Перевірка підключення до бази даних
pool.connect((err, client, release) => {
    if (err) {
        console.error('Помилка підключення до бази даних:', err.stack);
    } else {
        console.log('Успішне підключення до PostgreSQL');
        release();
    }
});

// JWT секретний ключ
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';

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
app.post('/api/auth/register', async (req, res) => {
    try {
        const { first_name, last_name, email, password, confirm_password } = req.body;

        // Валідація обов'язкових полів
        if (!first_name || !last_name || !email || !password || !confirm_password) {
            return res.status(400).json({
                success: false,
                message: 'Будь ласка, заповніть всі поля'
            });
        }

        // Валідація імені та прізвища
        if (first_name.length < 2 || last_name.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Ім\'я та прізвище повинні містити мінімум 2 символи'
            });
        }

        // Валідація email
        if (!validateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Невірний формат email'
            });
        }

        // Валідація пароля
        if (!validatePassword(password)) {
            return res.status(400).json({
                success: false,
                message: 'Пароль повинен містити мінімум 6 символів'
            });
        }

        // Перевірка співпадіння паролів
        if (password !== confirm_password) {
            return res.status(400).json({
                success: false,
                message: 'Паролі не співпадають'
            });
        }

        // Перевірка унікальності email
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Користувач з таким email вже існує'
            });
        }

        // Хешування пароля
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Отримуємо роль student за замовчуванням
        const defaultRole = await pool.query(
            'SELECT id, name, display_name FROM roles WHERE name = $1',
            ['student']
        );
        const roleId = defaultRole.rows.length > 0 ? defaultRole.rows[0].id : null;

        // Створення нового користувача з role_id (RBAC)
        const newUser = await pool.query(
            `INSERT INTO users (first_name, last_name, email, password_hash, role, role_id)
             VALUES ($1, $2, $3, $4, 'student', $5)
             RETURNING id, first_name, last_name, email, role, role_id, created_at`,
            [first_name.trim(), last_name.trim(), email.toLowerCase(), passwordHash, roleId]
        );

        // Отримуємо дозволи для ролі
        const permissions = await pool.query(
            `SELECT p.name, p.display_name, p.category
             FROM permissions p
             JOIN role_permissions rp ON p.id = rp.permission_id
             WHERE rp.role_id = $1`,
            [roleId]
        );

        // Генерація JWT токена з role_id
        const token = jwt.sign(
            {
                userId: newUser.rows[0].id,
                email: newUser.rows[0].email,
                role: newUser.rows[0].role,
                roleId: newUser.rows[0].role_id
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Успішна відповідь з RBAC даними
        res.status(201).json({
            success: true,
            message: 'Реєстрація успішна',
            token,
            user: {
                id: newUser.rows[0].id,
                first_name: newUser.rows[0].first_name,
                last_name: newUser.rows[0].last_name,
                email: newUser.rows[0].email,
                role: newUser.rows[0].role,
                role_id: newUser.rows[0].role_id,
                role_display_name: defaultRole.rows[0]?.display_name || 'Користувач',
                permissions: permissions.rows
            }
        });

    } catch (error) {
        console.error('Помилка реєстрації:', error);
        res.status(500).json({
            success: false,
            message: 'Внутрішня помилка сервера'
        });
    }
});

/**
 * API: Авторизація користувача
 * POST /api/auth/login
 */
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Валідація обов'язкових полів
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Будь ласка, введіть email та пароль'
            });
        }

        // Валідація email
        if (!validateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Невірний формат email'
            });
        }

        // Пошук користувача в базі з RBAC даними
        const result = await pool.query(
            `SELECT u.id, u.first_name, u.last_name, u.email, u.password_hash, u.role, u.role_id,
                    r.name as role_name, r.display_name as role_display_name
             FROM users u
             LEFT JOIN roles r ON u.role_id = r.id
             WHERE u.email = $1`,
            [email.toLowerCase()]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Невірний email або пароль'
            });
        }

        const user = result.rows[0];

        // Перевірка пароля
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Невірний email або пароль'
            });
        }

        // Отримуємо дозволи користувача
        const permissions = await pool.query(
            `SELECT p.name, p.display_name, p.category
             FROM permissions p
             JOIN role_permissions rp ON p.id = rp.permission_id
             WHERE rp.role_id = $1`,
            [user.role_id]
        );

        // Генерація JWT токена з role_id
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role,
                roleId: user.role_id
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Успішна відповідь з RBAC даними
        res.status(200).json({
            success: true,
            message: 'Авторизація успішна',
            token,
            user: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role,
                role_id: user.role_id,
                role_display_name: user.role_display_name || 'Користувач',
                permissions: permissions.rows
            }
        });

    } catch (error) {
        console.error('Помилка авторизації:', error);
        res.status(500).json({
            success: false,
            message: 'Внутрішня помилка сервера'
        });
    }
});

/**
 * Middleware: Перевірка JWT токена
 */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Токен авторизації не надано'
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: 'Невалідний або прострочений токен'
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
            
            const result = await pool.query(
                `SELECT EXISTS (
                    SELECT 1 
                    FROM users u
                    JOIN role_permissions rp ON u.role_id = rp.role_id
                    JOIN permissions p ON rp.permission_id = p.id
                    WHERE u.id = $1 AND p.name = $2
                ) as has_permission`,
                [userId, permissionName]
            );

            if (!result.rows[0].has_permission) {
                return res.status(403).json({
                    success: false,
                    message: 'Недостатньо прав для виконання цієї дії'
                });
            }

            next();
        } catch (error) {
            console.error('Помилка перевірки дозволу:', error);
            res.status(500).json({
                success: false,
                message: 'Внутрішня помилка сервера'
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
            
            const result = await pool.query(
                `SELECT r.name as role_name
                 FROM users u
                 JOIN roles r ON u.role_id = r.id
                 WHERE u.id = $1`,
                [userId]
            );

            if (result.rows.length === 0 || !allowedRoles.includes(result.rows[0].role_name)) {
                return res.status(403).json({
                    success: false,
                    message: 'Доступ заборонено для вашої ролі'
                });
            }

            next();
        } catch (error) {
            console.error('Помилка перевірки ролі:', error);
            res.status(500).json({
                success: false,
                message: 'Внутрішня помилка сервера'
            });
        }
    };
};

/**
 * API: Отримання інформації про поточного користувача з повними RBAC даними
 * GET /api/auth/me
 */
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        // Отримуємо користувача з роллю
        const result = await pool.query(
            `SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.role_id, u.created_at,
                    r.name as role_name, r.display_name as role_display_name, r.description as role_description
             FROM users u
             LEFT JOIN roles r ON u.role_id = r.id
             WHERE u.id = $1`,
            [req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Користувача не знайдено'
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
            [user.role_id]
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
                    description: user.role_description
                },
                permissions: permissions.rows
            }
        });

    } catch (error) {
        console.error('Помилка отримання даних користувача:', error);
        res.status(500).json({
            success: false,
            message: 'Внутрішня помилка сервера'
        });
    }
});

/**
 * API: Отримання всіх ролей системи
 * GET /api/roles
 */
app.get('/api/roles', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, display_name, description FROM roles ORDER BY id'
        );

        res.status(200).json({
            success: true,
            roles: result.rows
        });
    } catch (error) {
        console.error('Помилка отримання ролей:', error);
        res.status(500).json({
            success: false,
            message: 'Внутрішня помилка сервера'
        });
    }
});

/**
 * API: Отримання всіх дозволів системи
 * GET /api/permissions
 */
app.get('/api/permissions', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, display_name, description, category FROM permissions ORDER BY category, name'
        );

        res.status(200).json({
            success: true,
            permissions: result.rows
        });
    } catch (error) {
        console.error('Помилка отримання дозволів:', error);
        res.status(500).json({
            success: false,
            message: 'Внутрішня помилка сервера'
        });
    }
});

/**
 * API: Отримання дозволів для конкретної ролі
 * GET /api/roles/:roleId/permissions
 */
app.get('/api/roles/:roleId/permissions', authenticateToken, async (req, res) => {
    try {
        const { roleId } = req.params;

        const result = await pool.query(
            `SELECT p.id, p.name, p.display_name, p.description, p.category
             FROM permissions p
             JOIN role_permissions rp ON p.id = rp.permission_id
             WHERE rp.role_id = $1
             ORDER BY p.category, p.name`,
            [roleId]
        );

        res.status(200).json({
            success: true,
            permissions: result.rows
        });
    } catch (error) {
        console.error('Помилка отримання дозволів ролі:', error);
        res.status(500).json({
            success: false,
            message: 'Внутрішня помилка сервера'
        });
    }
});

/**
 * API: Перевірка дозволу для поточного користувача
 * GET /api/auth/check-permission/:permission
 */
app.get('/api/auth/check-permission/:permission', authenticateToken, async (req, res) => {
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
            [userId, permission]
        );

        res.status(200).json({
            success: true,
            permission: permission,
            has_permission: result.rows[0].has_permission
        });
    } catch (error) {
        console.error('Помилка перевірки дозволу:', error);
        res.status(500).json({
            success: false,
            message: 'Внутрішня помилка сервера'
        });
    }
});

/**
 * API: Отримання списку всіх користувачів (тільки для admin)
 * GET /api/users
 */
app.get('/api/users', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.role_id, u.created_at,
                    r.name as role_name, r.display_name as role_display_name
             FROM users u
             LEFT JOIN roles r ON u.role_id = r.id
             ORDER BY u.created_at DESC`
        );

        res.status(200).json({
            success: true,
            users: result.rows
        });
    } catch (error) {
        console.error('Помилка отримання користувачів:', error);
        res.status(500).json({
            success: false,
            message: 'Внутрішня помилка сервера'
        });
    }
});

/**
 * API: Зміна ролі користувача (тільки для admin)
 * PUT /api/users/:userId/role
 */
app.put('/api/users/:userId/role', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
        const { userId } = req.params;
        const { role_id } = req.body;

        // Перевіряємо чи існує роль
        const roleCheck = await pool.query('SELECT id, name, display_name FROM roles WHERE id = $1', [role_id]);
        if (roleCheck.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Роль не знайдено'
            });
        }

        // Оновлюємо роль користувача
        const result = await pool.query(
            `UPDATE users SET role_id = $1, role = $2 WHERE id = $3
             RETURNING id, first_name, last_name, email, role, role_id`,
            [role_id, roleCheck.rows[0].name, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Користувача не знайдено'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Роль користувача успішно змінено',
            user: {
                ...result.rows[0],
                role_display_name: roleCheck.rows[0].display_name
            }
        });
    } catch (error) {
        console.error('Помилка зміни ролі:', error);
        res.status(500).json({
            success: false,
            message: 'Внутрішня помилка сервера'
        });
    }
});

// Маршрут для головної сторінки авторизації
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'auth.html'));
});

// Маршрут для dashboard (статичний файл - перевірка токена на клієнті)
app.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Запуск сервера тільки якщо файл запущено напряму
if (require.main === module) {
    const server = app.listen(PORT, () => {
        console.log(`Сервер запущено на порту ${PORT}`);
        console.log(`Відкрийте http://localhost:${PORT} для доступу до платформи`);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Порт ${PORT} зайнятий, спроба порту ${PORT + 1}...`);
            app.listen(PORT + 1, () => {
                console.log(`Сервер запущено на порту ${PORT + 1}`);
            });
        } else {
            console.error('Помилка сервера:', err);
        }
    });
}

// Експорт для тестування та middleware
module.exports = { app, authenticateToken, requirePermission, requireRole };

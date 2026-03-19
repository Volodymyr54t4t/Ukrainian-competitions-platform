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
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Підключення до PostgreSQL через Pool
const pool = new Pool({
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

    // Створення нового користувача
    const newUser = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, role)
             VALUES ($1, $2, $3, $4, 'user')
             RETURNING id, first_name, last_name, email, role, created_at`,
      [first_name.trim(), last_name.trim(), email.toLowerCase(), passwordHash],
    );

    // Генерація JWT токена
    const token = jwt.sign(
      {
        userId: newUser.rows[0].id,
        email: newUser.rows[0].email,
        role: newUser.rows[0].role,
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    );

    // Успішна відповідь
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

    // Пошук користувача в базі
    const result = await pool.query(
      "SELECT id, first_name, last_name, email, password_hash, role FROM users WHERE email = $1",
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

    // Генерація JWT токена
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    );

    // Успішна відповідь
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
 * API: Отримання інформації про поточного користувача
 * GET /api/auth/me
 */
app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, first_name, last_name, email, role, created_at FROM users WHERE id = $1",
      [req.user.userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Користувача не знайдено",
      });
    }

    res.status(200).json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Помилка отримання даних користувача:", error);
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

// Маршрут для dashboard (заглушка)
app.get("/dashboard.html", authenticateToken, (req, res) => {
  res.sendFile(path.join(__dirname, "dashboard.html"));
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущено на порту ${PORT}`);
  console.log(`Відкрийте http://localhost:${PORT} для доступу до платформи`);
});

module.exports = app;

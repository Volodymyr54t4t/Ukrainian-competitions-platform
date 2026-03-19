/**
 * JavaScript для сторінки авторизації
 * Платформа: Єдина платформа конкурсів України
 */

document.addEventListener("DOMContentLoaded", () => {
  // Елементи DOM
  const tabButtons = document.querySelectorAll(".tab-btn");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const loginError = document.getElementById("loginError");
  const registerError = document.getElementById("registerError");
  const registerSuccess = document.getElementById("registerSuccess");
  const passwordToggles = document.querySelectorAll(".password-toggle");
  const registerPassword = document.getElementById("registerPassword");
  const passwordStrength = document.getElementById("passwordStrength");

  // API URL (той самий домен)
  const API_URL = "";

  // ==================== ПЕРЕКЛЮЧЕННЯ ТАБІВ ====================
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;

      // Оновлення активного таба
      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // Показ відповідної форми
      if (tab === "login") {
        loginForm.classList.add("active");
        registerForm.classList.remove("active");
      } else {
        registerForm.classList.add("active");
        loginForm.classList.remove("active");
      }

      // Очистка повідомлень
      hideMessage(loginError);
      hideMessage(registerError);
      hideMessage(registerSuccess);
    });
  });

  // ==================== TOGGLE PASSWORD VISIBILITY ====================
  passwordToggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const targetId = toggle.dataset.target;
      const input = document.getElementById(targetId);
      const icon = toggle.querySelector(".eye-icon");

      if (input.type === "password") {
        input.type = "text";
        icon.innerHTML = `
                    <path d="M2.5 2.5L17.5 17.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M8.33333 8.33333C7.41286 9.25381 7.41286 10.7462 8.33333 11.6667C9.25381 12.5871 10.7462 12.5871 11.6667 11.6667" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M4.16667 5.83333C2.5 7.5 1.66667 10 1.66667 10C1.66667 10 4.16667 15.8333 10 15.8333C11.6667 15.8333 13.0833 15.3333 14.1667 14.5833" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M16.6667 12.5C17.9167 11 18.3333 10 18.3333 10C18.3333 10 15.8333 4.16667 10 4.16667C9.41667 4.16667 8.83333 4.25 8.33333 4.33333" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                `;
      } else {
        input.type = "password";
        icon.innerHTML = `
                    <path d="M1.66667 10C1.66667 10 4.16667 4.16666 10 4.16666C15.8333 4.16666 18.3333 10 18.3333 10C18.3333 10 15.8333 15.8333 10 15.8333C4.16667 15.8333 1.66667 10 1.66667 10Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="10" cy="10" r="2.5" stroke="currentColor" stroke-width="1.5"/>
                `;
      }
    });
  });

  // ==================== PASSWORD STRENGTH ====================
  if (registerPassword && passwordStrength) {
    registerPassword.addEventListener("input", (e) => {
      const password = e.target.value;

      if (password.length === 0) {
        passwordStrength.classList.remove(
          "visible",
          "weak",
          "medium",
          "strong",
        );
        return;
      }

      passwordStrength.classList.add("visible");
      const strength = calculatePasswordStrength(password);

      passwordStrength.classList.remove("weak", "medium", "strong");
      passwordStrength.classList.add(strength.level);
      passwordStrength.querySelector(".strength-text").textContent =
        strength.text;
    });
  }

  /**
   * Розрахунок сили пароля
   * @param {string} password - Пароль
   * @returns {Object} - Рівень сили та текст
   */
  function calculatePasswordStrength(password) {
    let score = 0;

    // Довжина
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (password.length >= 14) score++;

    // Символи
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 2) {
      return { level: "weak", text: "Слабкий" };
    } else if (score <= 4) {
      return { level: "medium", text: "Середній" };
    } else {
      return { level: "strong", text: "Надійний" };
    }
  }

  // ==================== ФОРМА ВХОДУ ====================
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = loginForm.querySelector(".submit-btn");
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    // Валідація
    if (!email || !password) {
      showError(loginError, "Будь ласка, заповніть всі поля");
      return;
    }

    if (!isValidEmail(email)) {
      showError(loginError, "Невірний формат email");
      return;
    }

    // Відправка запиту
    setLoading(submitBtn, true);
    hideMessage(loginError);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Збереження токена
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Редірект на dashboard
        window.location.href = "/dashboard.html";
      } else {
        showError(loginError, data.message || "Помилка авторизації");
      }
    } catch (error) {
      console.error("Login error:", error);
      showError(loginError, "Помилка з'єднання з сервером");
    } finally {
      setLoading(submitBtn, false);
    }
  });

  // ==================== ФОРМА РЕЄСТРАЦІЇ ====================
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = registerForm.querySelector(".submit-btn");
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const agreeTerms = document.getElementById("agreeTerms").checked;

    // Валідація
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      showError(registerError, "Будь ласка, заповніть всі поля");
      return;
    }

    if (firstName.length < 2 || lastName.length < 2) {
      showError(
        registerError,
        "Ім'я та прізвище повинні містити мінімум 2 символи",
      );
      return;
    }

    if (!isValidEmail(email)) {
      showError(registerError, "Невірний формат email");
      return;
    }

    if (password.length < 6) {
      showError(registerError, "Пароль повинен містити мінімум 6 символів");
      return;
    }

    if (password !== confirmPassword) {
      showError(registerError, "Паролі не співпадають");
      return;
    }

    if (!agreeTerms) {
      showError(registerError, "Необхідно погодитись з умовами використання");
      return;
    }

    // Відправка запиту
    setLoading(submitBtn, true);
    hideMessage(registerError);
    hideMessage(registerSuccess);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          password,
          confirm_password: confirmPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Збереження токена
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Показ повідомлення про успіх
        showSuccess(registerSuccess, "Реєстрація успішна! Перенаправлення...");

        // Редірект на dashboard через 1.5 секунди
        setTimeout(() => {
          window.location.href = "/dashboard.html";
        }, 1500);
      } else {
        showError(registerError, data.message || "Помилка реєстрації");
      }
    } catch (error) {
      console.error("Register error:", error);
      showError(registerError, "Помилка з'єднання з сервером");
    } finally {
      setLoading(submitBtn, false);
    }
  });

  // ==================== ДОПОМІЖНІ ФУНКЦІЇ ====================

  /**
   * Перевірка валідності email
   * @param {string} email - Email для перевірки
   * @returns {boolean} - Чи валідний email
   */
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Показ повідомлення про помилку
   * @param {HTMLElement} element - Елемент повідомлення
   * @param {string} message - Текст повідомлення
   */
  function showError(element, message) {
    element.textContent = message;
    element.classList.add("show");
  }

  /**
   * Показ повідомлення про успіх
   * @param {HTMLElement} element - Елемент повідомлення
   * @param {string} message - Текст повідомлення
   */
  function showSuccess(element, message) {
    element.textContent = message;
    element.classList.add("show");
  }

  /**
   * Приховання повідомлення
   * @param {HTMLElement} element - Елемент повідомлення
   */
  function hideMessage(element) {
    element.textContent = "";
    element.classList.remove("show");
  }

  /**
   * Встановлення стану завантаження кнопки
   * @param {HTMLElement} button - Кнопка
   * @param {boolean} isLoading - Чи в стані завантаження
   */
  function setLoading(button, isLoading) {
    if (isLoading) {
      button.classList.add("loading");
      button.disabled = true;
    } else {
      button.classList.remove("loading");
      button.disabled = false;
    }
  }

  // ==================== ПЕРЕВІРКА АВТОРИЗАЦІЇ ====================
  // Якщо користувач вже авторизований, редірект на dashboard
  const token = localStorage.getItem("authToken");
  if (token) {
    // Перевірка валідності токена (опціонально)
    fetch(`${API_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          window.location.href = "/dashboard.html";
        } else {
          // Токен невалідний, видаляємо
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");
        }
      })
      .catch(() => {
        // Помилка запиту, залишаємось на сторінці
      });
  }
});

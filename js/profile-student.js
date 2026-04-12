/**
 * Profile Student JavaScript
 * Платформа: Єдина платформа конкурсів України
 * Реалізація: Профіль студента з CRUD операціями
 */

// ==================== ГЛОБАЛЬНІ ЗМІННІ ====================
let currentUser = null;
let profileData = null;
let editAchievements = [];
let editCertificates = [];
let citiesList = [];
let institutionsList = [];
let selectedCityId = null;

// ==================== КОНФІГУРАЦІЯ МЕНЮ ====================
const MENU_CONFIG = {
    student: {
        title: "Учень",
        sections: [
            {
                title: "Головне",
                items: [
                    {
                        id: "dashboard",
                        label: "Головна",
                        icon: "home",
                        href: "/dashboard.html",
                    },
                    {
                        id: "competitions",
                        label: "Конкурси",
                        icon: "trophy",
                        href: "/competitions.html",
                    },
                    {
                        id: "my-competitions",
                        label: "Мої заявки",
                        icon: "file-text",
                    },
                    { id: "results", label: "Результати", icon: "chart-bar" },
                ],
            },
            {
                title: "Профіль",
                items: [
                    { 
                        id: "profile", 
                        label: "Мій профіль", 
                        icon: "user",
                        href: "/profile-student.html",
                        active: true,
                    },
                    { id: "portfolio", label: "Моє портфоліо", icon: "folder" },
                    { id: "certificates", label: "Сертифікати", icon: "award" },
                    { id: "settings", label: "Налаштування", icon: "settings" },
                ],
            },
        ],
    },
};

// ==================== SVG ICONS ====================
const ICONS = {
    home: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
    trophy: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>',
    "file-text": '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
    "chart-bar": '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>',
    user: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
    folder: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>',
    award: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path></svg>',
    settings: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>',
    check: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    x: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
};

// ==================== ІНІЦІАЛІЗАЦІЯ ====================
document.addEventListener("DOMContentLoaded", () => {
    initializeProfilePage();
});

/**
 * Ініціалізація сторінки профілю з перевіркою авторизації через API
 */
async function initializeProfilePage() {
    const loadingOverlay = document.getElementById("loadingOverlay");
    
    try {
        // Перевірка наявності токена
        const token = localStorage.getItem("authToken");
        if (!token) {
            redirectToAuth();
            return;
        }

        // Отримання даних користувача з бази даних через API
        const response = await fetch("/api/auth/me", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (!data.success) {
            redirectToAuth();
            return;
        }

        // Збереження даних кори��тувача
        currentUser = data.user;
        localStorage.setItem("user", JSON.stringify(currentUser));

        // Визначення ролі з бази даних
        const roleName = currentUser.role?.name || currentUser.role || "student";
        
        // Перевірка ролі - тільки для студентів
        if (roleName !== "student") {
            window.location.href = "/dashboard.html";
            return;
        }

        // Ініціалізація сторінки
        initializePage();

        // Приховати loading overlay
        if (loadingOverlay) {
            loadingOverlay.classList.add("hidden");
        }
    } catch (error) {
        console.error("Помилка ініціалізації профілю:", error);
        showErrorMessage("Не вдалося завантажити дані. Спробуйте оновити сторінку.");
    }
}

/**
 * Перенаправлення на сторінку авторизації
 */
function redirectToAuth() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    window.location.href = "/auth.html";
}

/**
 * Показ повідомлення про помилку
 */
function showErrorMessage(message) {
    const loadingOverlay = document.getElementById("loadingOverlay");
    if (loadingOverlay) {
        loadingOverlay.innerHTML = `
            <div class="error-container">
                <div class="error-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                </div>
                <h2>Помилка завантаження</h2>
                <p>${message}</p>
                <button class="btn-primary" onclick="window.location.reload()">Оновити сторінку</button>
            </div>
        `;
    }
}

/**
 * Ініціалізація сторінки
 */
async function initializePage() {
    renderSidebar();
    renderUserInfo();
    setupEventListeners();
    await loadCities();
    loadProfile();
}

/**
 * Завантаження списку міст
 */
async function loadCities() {
    try {
        const response = await fetch("/api/cities");
        const data = await response.json();
        
        if (data.success) {
            citiesList = data.cities;
            renderCitiesSelect();
        }
    } catch (error) {
        console.error("Помилка завантаження міст:", error);
    }
}

/**
 * Рендер списку міст у select
 */
function renderCitiesSelect() {
    const select = document.getElementById("editCity");
    if (!select) return;
    
    select.innerHTML = '<option value="">Оберіть місто</option>';
    
    citiesList.forEach(city => {
        const option = document.createElement("option");
        option.value = city.id;
        option.textContent = city.name;
        option.dataset.name = city.name;
        select.appendChild(option);
    });

    // Додаємо обробник зміни міста
    select.addEventListener("change", handleCityChange);
}

/**
 * Обробник зміни міста
 */
async function handleCityChange(e) {
    const cityId = e.target.value;
    const institutionSelect = document.getElementById("editInstitution");
    
    if (!cityId) {
        institutionSelect.innerHTML = '<option value="">Спочатку оберіть місто</option>';
        institutionSelect.disabled = true;
        selectedCityId = null;
        return;
    }

    selectedCityId = parseInt(cityId);
    await loadInstitutionsByCity(cityId);
}

/**
 * Завантаження списку навчальних закладів за містом
 */
async function loadInstitutionsByCity(cityId) {
    const institutionSelect = document.getElementById("editInstitution");
    institutionSelect.innerHTML = '<option value="">Завантаження...</option>';
    institutionSelect.disabled = true;

    try {
        const response = await fetch(`/api/institutions?city_id=${cityId}`);
        const data = await response.json();
        
        if (data.success) {
            institutionsList = data.institutions;
            renderInstitutionsSelect();
        }
    } catch (error) {
        console.error("Помилка завантаження закладів:", error);
        institutionSelect.innerHTML = '<option value="">Помилка завантаження</option>';
    }
}

/**
 * Рендер списку навчальних закладів у select
 */
function renderInstitutionsSelect() {
    const select = document.getElementById("editInstitution");
    if (!select) return;
    
    if (institutionsList.length === 0) {
        select.innerHTML = '<option value="">Немає закладів для цього міста</option>';
        select.disabled = true;
        return;
    }

    select.innerHTML = '<option value="">Оберіть навчальний заклад</option>';
    select.disabled = false;
    
    institutionsList.forEach(inst => {
        const option = document.createElement("option");
        option.value = inst.name;
        option.textContent = inst.name;
        select.appendChild(option);
    });
}

/**
 * Рендер бокового меню
 */
function renderSidebar() {
    const sidebarNav = document.getElementById("sidebarNav");
    const menuConfig = MENU_CONFIG.student;

    let html = "";

    menuConfig.sections.forEach((section) => {
        html += `<div class="nav-section">`;
        html += `<div class="nav-section-title">${section.title}</div>`;

        section.items.forEach((item) => {
            const isActive = item.active ? "active" : "";
            const href = item.href ? `href="${item.href}"` : "";
            const badge = item.badge ? `<span class="nav-badge">${item.badge}</span>` : "";

            html += `
                <a class="nav-item ${isActive}" ${href} data-id="${item.id}">
                    ${ICONS[item.icon] || ""}
                    <span>${item.label}</span>
                    ${badge}
                </a>
            `;
        });

        html += `</div>`;
    });

    sidebarNav.innerHTML = html;
}

/**
 * Рендер інформації про користувача
 */
function renderUserInfo() {
    const sidebarUser = document.getElementById("sidebarUser");
    const initials = getInitials(currentUser.first_name, currentUser.last_name);

    sidebarUser.innerHTML = `
        <div class="user-avatar">${initials}</div>
        <div class="user-info">
            <div class="user-name">${currentUser.first_name} ${currentUser.last_name}</div>
            <div class="user-role">${currentUser.role_display_name || "Учень"}</div>
        </div>
    `;
}

/**
 * Отримання ініціалів
 */
function getInitials(firstName, lastName) {
    return `${(firstName || "")[0] || ""}${(lastName || "")[0] || ""}`.toUpperCase();
}

/**
 * Налаштування обробників подій
 */
function setupEventListeners() {
    // Мобільне меню
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");
    const sidebarOverlay = document.getElementById("sidebarOverlay");

    menuToggle?.addEventListener("click", () => {
        sidebar.classList.toggle("open");
        sidebarOverlay.classList.toggle("active");
    });

    sidebarOverlay?.addEventListener("click", () => {
        sidebar.classList.remove("open");
        sidebarOverlay.classList.remove("active");
    });

    // Вихід
    const logoutBtn = document.getElementById("logoutBtn");
    logoutBtn?.addEventListener("click", logout);

    // Редагування профілю
    const editProfileBtn = document.getElementById("editProfileBtn");
    editProfileBtn?.addEventListener("click", openEditModal);

    // Модальне вікно
    const closeModalBtn = document.getElementById("closeModalBtn");
    const cancelEditBtn = document.getElementById("cancelEditBtn");
    const editProfileModal = document.getElementById("editProfileModal");

    closeModalBtn?.addEventListener("click", closeEditModal);
    cancelEditBtn?.addEventListener("click", closeEditModal);
    editProfileModal?.addEventListener("click", (e) => {
        if (e.target === editProfileModal) {
            closeEditModal();
        }
    });

    // Збереження профілю
    const saveProfileBtn = document.getElementById("saveProfileBtn");
    saveProfileBtn?.addEventListener("click", saveProfile);

    // Додавання досягнень та сертифікатів
    const addAchievementBtn = document.getElementById("addAchievementBtn");
    const addCertificateBtn = document.getElementById("addCertificateBtn");

    addAchievementBtn?.addEventListener("click", addAchievementField);
    addCertificateBtn?.addEventListener("click", addCertificateField);

    // Завантаження фото
    const photoEditBtn = document.getElementById("photoEditBtn");
    const photoInput = document.getElementById("photoInput");

    photoEditBtn?.addEventListener("click", () => photoInput.click());
    photoInput?.addEventListener("change", handlePhotoUpload);
}

/**
 * Завантаження профілю
 */
async function loadProfile() {
    try {
        const token = localStorage.getItem("authToken");
        const response = await fetch("/api/profile/student", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (data.success) {
            profileData = data.profile;
            renderProfile();
        } else {
            // Профіль не знайдено - показуємо пустий стан
            profileData = {
                first_name: currentUser.first_name,
                last_name: currentUser.last_name,
                profile_photo: null,
                class: null,
                institution: null,
                city: null,
                interests: [],
                achievements: [],
                certificates: [],
            };
            renderProfile();
        }
    } catch (error) {
        console.error("Помилка завантаження профілю:", error);
        // Використовуємо базові дані користувача
        profileData = {
            first_name: currentUser.first_name,
            last_name: currentUser.last_name,
            profile_photo: null,
            class: null,
            institution: null,
            city: null,
            interests: [],
            achievements: [],
            certificates: [],
        };
        renderProfile();
    } finally {
        loadingOverlay.classList.add("hidden");
    }
}

/**
 * Рендер профілю
 */
function renderProfile() {
    // Header
    document.getElementById("profileName").textContent = 
        `${profileData.first_name} ${profileData.last_name}`;

    // Фото
    const photoEl = document.getElementById("profilePhoto");
    if (profileData.profile_photo) {
        photoEl.innerHTML = `<img src="${profileData.profile_photo}" alt="Фото профілю">`;
    } else {
        photoEl.innerHTML = `<span id="profileInitials">${getInitials(profileData.first_name, profileData.last_name)}</span>`;
    }

    // Локація
    const locationEl = document.getElementById("profileLocation");
    if (profileData.city) {
        locationEl.querySelector("span").textContent = profileData.city;
        locationEl.style.display = "inline-flex";
    } else {
        locationEl.style.display = "none";
    }

    // Основна інформація
    document.getElementById("infoFirstName").textContent = profileData.first_name || "-";
    document.getElementById("infoLastName").textContent = profileData.last_name || "-";
    document.getElementById("infoClass").textContent = profileData.class || "-";
    document.getElementById("infoInstitution").textContent = profileData.institution || "-";
    document.getElementById("infoCity").textContent = profileData.city || "-";

    // Інтереси
    renderInterests();

    // Досягнення
    renderAchievements();

    // Сертифікати
    renderCertificates();

    // Статистика
    updateStats();
}

/**
 * Рендер інтересів
 */
function renderInterests() {
    const container = document.getElementById("interestsTags");
    const interests = profileData.interests || [];

    if (interests.length === 0) {
        container.innerHTML = '<span class="empty-text">Предмети інтересу не вказані</span>';
        return;
    }

    container.innerHTML = interests.map(interest => 
        `<span class="interest-tag">${interest}</span>`
    ).join("");
}

/**
 * Рендер досягнень
 */
function renderAchievements() {
    const container = document.getElementById("achievementsList");
    const countEl = document.getElementById("achievementsCount");
    const achievements = profileData.achievements || [];

    countEl.textContent = achievements.length;

    if (achievements.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="8" r="6"></circle>
                    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path>
                </svg>
                <p>Досягнення ще не додані</p>
            </div>
        `;
        return;
    }

    container.innerHTML = achievements.map(achievement => `
        <div class="achievement-item">
            <div class="achievement-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="8" r="6"></circle>
                    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path>
                </svg>
            </div>
            <div class="achievement-content">
                <h4>${escapeHtml(achievement.title)}</h4>
                <p>${escapeHtml(achievement.description || "")}</p>
                <div class="achievement-meta">
                    ${achievement.level ? `<span class="achievement-level">${escapeHtml(achievement.level)}</span>` : ""}
                    ${achievement.date ? `<span>${formatDate(achievement.date)}</span>` : ""}
                </div>
            </div>
        </div>
    `).join("");
}

/**
 * Рендер сертифікатів
 */
function renderCertificates() {
    const container = document.getElementById("certificatesList");
    const countEl = document.getElementById("certificatesCount");
    const certificates = profileData.certificates || [];

    countEl.textContent = certificates.length;

    if (certificates.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <p>Сертифікати не додані</p>
                <span>Необов'язкове поле</span>
            </div>
        `;
        return;
    }

    container.innerHTML = certificates.map(cert => `
        <div class="certificate-item">
            <div class="certificate-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
            </div>
            <div class="certificate-content">
                <h4>${escapeHtml(cert.title)}</h4>
                <p>${escapeHtml(cert.issuer || "")} ${cert.date ? `• ${formatDate(cert.date)}` : ""}</p>
            </div>
        </div>
    `).join("");
}

/**
 * Оновлення статистики
 */
function updateStats() {
    document.getElementById("statAchievements").textContent = 
        (profileData.achievements || []).length;
    document.getElementById("statCertificates").textContent = 
        (profileData.certificates || []).length;
    // Кількість конкурсів можна завантажити окремим запитом
    document.getElementById("statCompetitions").textContent = "0";
}

/**
 * Відкриття модального вікна редагування
 */
async function openEditModal() {
    const modal = document.getElementById("editProfileModal");
    modal.classList.add("active");
    document.body.style.overflow = "hidden";

    // Заповнення форми поточними даними
    document.getElementById("editFirstName").value = profileData.first_name || "";
    document.getElementById("editLastName").value = profileData.last_name || "";
    document.getElementById("editClass").value = profileData.class || "";

    // Встановлення міста
    const citySelect = document.getElementById("editCity");
    const institutionSelect = document.getElementById("editInstitution");
    
    if (profileData.city_id) {
        citySelect.value = profileData.city_id;
        selectedCityId = profileData.city_id;
        
        // Завантажуємо заклади для цього міста
        await loadInstitutionsByCity(profileData.city_id);
        
        // Встановлюємо вибраний заклад
        if (profileData.institution) {
            institutionSelect.value = profileData.institution;
        }
    } else if (profileData.city) {
        // Якщо є назва міста, шукаємо його id
        const city = citiesList.find(c => c.name === profileData.city);
        if (city) {
            citySelect.value = city.id;
            selectedCityId = city.id;
            await loadInstitutionsByCity(city.id);
            if (profileData.institution) {
                institutionSelect.value = profileData.institution;
            }
        }
    } else {
        institutionSelect.innerHTML = '<option value="">Спочатку оберіть місто</option>';
        institutionSelect.disabled = true;
    }

    // Інтереси
    const interests = profileData.interests || [];
    document.querySelectorAll('input[name="interests"]').forEach(checkbox => {
        checkbox.checked = interests.includes(checkbox.value);
    });

    // Досягнення
    editAchievements = [...(profileData.achievements || [])];
    renderEditAchievements();

    // Сертифікати
    editCertificates = [...(profileData.certificates || [])];
    renderEditCertificates();
}

/**
 * Закриття модального вікна
 */
function closeEditModal() {
    const modal = document.getElementById("editProfileModal");
    modal.classList.remove("active");
    document.body.style.overflow = "";
}

/**
 * Рендер досягнень у формі редагування
 */
function renderEditAchievements() {
    const container = document.getElementById("achievementsEditList");

    if (editAchievements.length === 0) {
        container.innerHTML = "";
        return;
    }

    container.innerHTML = editAchievements.map((ach, index) => `
        <div class="dynamic-item" data-index="${index}">
            <div class="dynamic-item-header">
                <span>Досягнення ${index + 1}</span>
                <button type="button" class="btn-remove" onclick="removeAchievement(${index})">
                    ${ICONS.x}
                </button>
            </div>
            <div class="form-grid">
                <div class="form-group full-width">
                    <label>Назва *</label>
                    <input type="text" value="${escapeHtml(ach.title || "")}" 
                           onchange="updateAchievement(${index}, 'title', this.value)" required>
                </div>
                <div class="form-group full-width">
                    <label>Опис</label>
                    <input type="text" value="${escapeHtml(ach.description || "")}"
                           onchange="updateAchievement(${index}, 'description', this.value)">
                </div>
                <div class="form-group">
                    <label>Рівень</label>
                    <select onchange="updateAchievement(${index}, 'level', this.value)">
                        <option value="">Оберіть рівень</option>
                        <option value="Шкільний" ${ach.level === "Шкільний" ? "selected" : ""}>Шкільний</option>
                        <option value="Районний" ${ach.level === "Районний" ? "selected" : ""}>Районний</option>
                        <option value="Обласний" ${ach.level === "Обласний" ? "selected" : ""}>Обласний</option>
                        <option value="Всеукраїнський" ${ach.level === "Всеукраїнський" ? "selected" : ""}>Всеукраїнський</option>
                        <option value="Міжнародний" ${ach.level === "Міжнародний" ? "selected" : ""}>Міжнародний</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Дата</label>
                    <input type="date" value="${ach.date || ""}"
                           onchange="updateAchievement(${index}, 'date', this.value)">
                </div>
            </div>
        </div>
    `).join("");
}

/**
 * Рендер сертифікатів у формі редагування
 */
function renderEditCertificates() {
    const container = document.getElementById("certificatesEditList");

    if (editCertificates.length === 0) {
        container.innerHTML = "";
        return;
    }

    container.innerHTML = editCertificates.map((cert, index) => `
        <div class="dynamic-item" data-index="${index}">
            <div class="dynamic-item-header">
                <span>Сертифікат ${index + 1}</span>
                <button type="button" class="btn-remove" onclick="removeCertificate(${index})">
                    ${ICONS.x}
                </button>
            </div>
            <div class="form-grid">
                <div class="form-group full-width">
                    <label>Назва *</label>
                    <input type="text" value="${escapeHtml(cert.title || "")}" 
                           onchange="updateCertificate(${index}, 'title', this.value)" required>
                </div>
                <div class="form-group">
                    <label>Видавець</label>
                    <input type="text" value="${escapeHtml(cert.issuer || "")}"
                           onchange="updateCertificate(${index}, 'issuer', this.value)">
                </div>
                <div class="form-group">
                    <label>Дата</label>
                    <input type="date" value="${cert.date || ""}"
                           onchange="updateCertificate(${index}, 'date', this.value)">
                </div>
            </div>
        </div>
    `).join("");
}

/**
 * Додати поле досягнення
 */
function addAchievementField() {
    editAchievements.push({
        title: "",
        description: "",
        level: "",
        date: "",
    });
    renderEditAchievements();
}

/**
 * Видалити досягнення
 */
function removeAchievement(index) {
    editAchievements.splice(index, 1);
    renderEditAchievements();
}

/**
 * Оновити досягнення
 */
function updateAchievement(index, field, value) {
    editAchievements[index][field] = value;
}

/**
 * Додати поле сертифіката
 */
function addCertificateField() {
    editCertificates.push({
        title: "",
        issuer: "",
        date: "",
        file_url: "",
    });
    renderEditCertificates();
}

/**
 * Видалити сертифікат
 */
function removeCertificate(index) {
    editCertificates.splice(index, 1);
    renderEditCertificates();
}

/**
 * Оновити сертифікат
 */
function updateCertificate(index, field, value) {
    editCertificates[index][field] = value;
}

/**
 * Збереження профілю
 */
async function saveProfile(e) {
    e.preventDefault();

    const saveBtn = document.getElementById("saveProfileBtn");
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<div class="loading-spinner" style="width:18px;height:18px;"></div> Збереження...';

    // Збір даних форми
    const citySelect = document.getElementById("editCity");
    const selectedCityOption = citySelect.options[citySelect.selectedIndex];
    const cityName = selectedCityOption && selectedCityOption.dataset.name ? selectedCityOption.dataset.name : null;
    const cityId = citySelect.value ? parseInt(citySelect.value) : null;

    const formData = {
        first_name: document.getElementById("editFirstName").value.trim(),
        last_name: document.getElementById("editLastName").value.trim(),
        class: document.getElementById("editClass").value.trim() || null,
        city: cityName,
        city_id: cityId,
        institution: document.getElementById("editInstitution").value || null,
        interests: Array.from(document.querySelectorAll('input[name="interests"]:checked'))
            .map(cb => cb.value),
        achievements: editAchievements.filter(a => a.title.trim() !== ""),
        certificates: editCertificates.filter(c => c.title.trim() !== ""),
        profile_photo: profileData.profile_photo || null,
    };

    try {
        const token = localStorage.getItem("authToken");
        const response = await fetch("/api/profile/student", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (data.success) {
            profileData = { ...profileData, ...formData };
            renderProfile();
            closeEditModal();
            showToast("Профіль успішно збережено", "success");

            // Оновлення імені в localStorage
            const user = JSON.parse(localStorage.getItem("user"));
            user.first_name = formData.first_name;
            user.last_name = formData.last_name;
            localStorage.setItem("user", JSON.stringify(user));
            currentUser = user;
            renderUserInfo();
        } else {
            showToast(data.message || "Помилка збереження", "error");
        }
    } catch (error) {
        console.error("Помилка збереження профілю:", error);
        showToast("Помилка з'єднання з с��рвером", "error");
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            Зберегти зміни
        `;
    }
}

/**
 * Завантаження фото профілю
 */
async function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Перевірка типу файлу
    if (!file.type.startsWith("image/")) {
        showToast("Будь ласка, оберіть зображення", "error");
        return;
    }

    // Перевірка розміру (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showToast("Розмір файлу не повинен перевищувати 5MB", "error");
        return;
    }

    // Показуємо превью поки завантажуємо
    const reader = new FileReader();
    reader.onload = (event) => {
        document.getElementById("profilePhoto").innerHTML = 
            `<img src="${event.target.result}" alt="Фото профілю">`;
    };
    reader.readAsDataURL(file);

    // Завантажуємо на сервер
    const formData = new FormData();
    formData.append("photo", file);

    try {
        const token = localStorage.getItem("authToken");
        const response = await fetch("/api/profile/photo", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        const data = await response.json();

        if (data.success) {
            // Оновлюємо profileData з URL з сервера
            profileData.profile_photo = data.photo_url;
            document.getElementById("profilePhoto").innerHTML = 
                `<img src="${data.photo_url}" alt="Фото профілю">`;
            showToast("Фото профілю оновлено", "success");
        } else {
            showToast(data.message || "Помилка завантаження фото", "error");
            // Повертаємо старе фото або ініціали
            renderProfilePhoto();
        }
    } catch (error) {
        console.error("Помилка завантаження фото:", error);
        showToast("Помилка з'єднання з сервером", "error");
        renderProfilePhoto();
    }
}

/**
 * Рендер фото профілю
 */
function renderProfilePhoto() {
    const photoEl = document.getElementById("profilePhoto");
    if (profileData.profile_photo) {
        photoEl.innerHTML = `<img src="${profileData.profile_photo}" alt="Фото профілю">`;
    } else {
        photoEl.innerHTML = `<span id="profileInitials">${getInitials(profileData.first_name, profileData.last_name)}</span>`;
    }
}

/**
 * Показати toast повідомлення
 */
function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    const iconEl = toast.querySelector(".toast-icon");
    const messageEl = toast.querySelector(".toast-message");

    toast.className = `toast ${type}`;
    messageEl.textContent = message;

    if (type === "success") {
        iconEl.innerHTML = ICONS.check;
    } else {
        iconEl.innerHTML = ICONS.x;
    }

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

/**
 * Вихід
 */
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/auth.html";
}

/**
 * Екранування HTML
 */
function escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Форматування дати
 */
function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("uk-UA", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

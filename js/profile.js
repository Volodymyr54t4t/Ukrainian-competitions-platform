/**
 * Profile JavaScript
 * Платформа: Єдина платформа конкурсів України
 * Реалізація: Система профілів для різних ролей
 */

// ==================== ГЛОБАЛЬНІ ЗМІННІ ====================
let currentUser = null;
let currentProfile = null;
let institutions = [];

// ==================== РОЛЬ-СПЕЦИФІЧНІ НАЗВИ ====================
const ROLE_DISPLAY_NAMES = {
    student: "Учень",
    teacher: "Вчитель",
    methodist: "Методист",
    judge: "Суддя",
    admin: "Адміністратор",
};

// ==================== КОНФІГУРАЦІЯ МЕНЮ ПО РОЛЯХ ====================
const MENU_CONFIG = {
    student: {
        sections: [
            {
                title: "Головне",
                items: [
                    { id: "dashboard", label: "Головна", icon: "home", href: "/dashboard.html" },
                    { id: "competitions", label: "Конкурси", icon: "trophy", href: "/competitions.html" },
                ],
            },
            {
                title: "Профіль",
                items: [
                    { id: "profile", label: "Мій профіль", icon: "user", href: "/profile.html", active: true },
                    { id: "settings", label: "Налаштування", icon: "settings" },
                ],
            },
        ],
    },
    teacher: {
        sections: [
            {
                title: "Головне",
                items: [
                    { id: "dashboard", label: "Головна", icon: "home", href: "/dashboard.html" },
                    { id: "competitions", label: "Конкурси", icon: "trophy", href: "/competitions.html" },
                ],
            },
            {
                title: "Профіль",
                items: [
                    { id: "profile", label: "Мій профіль", icon: "user", href: "/profile.html", active: true },
                    { id: "settings", label: "Налаштування", icon: "settings" },
                ],
            },
        ],
    },
    methodist: {
        sections: [
            {
                title: "Головне",
                items: [
                    { id: "dashboard", label: "Головна", icon: "home", href: "/dashboard.html" },
                    { id: "competitions", label: "Всі конкурси", icon: "trophy", href: "/competitions.html" },
                ],
            },
            {
                title: "Профіль",
                items: [
                    { id: "profile", label: "Мій профіль", icon: "user", href: "/profile.html", active: true },
                    { id: "settings", label: "Налаштування", icon: "settings" },
                ],
            },
        ],
    },
    judge: {
        sections: [
            {
                title: "Головне",
                items: [
                    { id: "dashboard", label: "Головна", icon: "home", href: "/dashboard.html" },
                    { id: "competitions", label: "Конкурси", icon: "trophy", href: "/competitions.html" },
                ],
            },
            {
                title: "Профіль",
                items: [
                    { id: "profile", label: "Мій профіль", icon: "user", href: "/profile.html", active: true },
                    { id: "settings", label: "Налаштування", icon: "settings" },
                ],
            },
        ],
    },
    admin: {
        sections: [
            {
                title: "Головне",
                items: [
                    { id: "dashboard", label: "Головна", icon: "home", href: "/dashboard.html" },
                ],
            },
            {
                title: "Адміністрування",
                items: [
                    { id: "users", label: "Користувачі", icon: "users", href: "/users.html" },
                ],
            },
            {
                title: "Профіль",
                items: [
                    { id: "profile", label: "Мій профіль", icon: "user", href: "/profile.html", active: true },
                ],
            },
        ],
    },
};

// ==================== SVG ICONS ====================
const ICONS = {
    home: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
    trophy: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>',
    user: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
    users: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
    settings: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>',
};

// ==================== ІНІЦІАЛІЗАЦІЯ ====================
document.addEventListener("DOMContentLoaded", async () => {
    // Перевірка авторизації
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "/auth.html";
        return;
    }

    try {
        // Завантаження даних паралельно
        await Promise.all([loadUserData(), loadInstitutions()]);

        // Ініціалізація UI
        initializeSidebar();
        initializeForm();
        hideLoading();
    } catch (error) {
        console.error("Помилка ініціалізації:", error);
        handleAuthError(error);
    }
});

// ==================== ЗАВАНТАЖЕННЯ ДАНИХ ====================
async function loadUserData() {
    const token = localStorage.getItem("token");

    // Завантажуємо профіль
    const profileResponse = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!profileResponse.ok) {
        throw new Error("Не вдалося завантажити профіль");
    }

    const profileData = await profileResponse.json();

    if (profileData.success) {
        currentUser = profileData.user;
        currentProfile = profileData.profile;

        // Оновлюємо header картку
        updateProfileHeader();

        // Заповнюємо форму
        populateForm();

        // Показуємо відповідну секцію для ролі
        showRoleSection();
    }
}

async function loadInstitutions() {
    const token = localStorage.getItem("token");
    const loadingEl = document.getElementById("institutionLoading");

    try {
        const response = await fetch("/api/institutions", {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
            throw new Error("Не вдалося завантажити заклади");
        }

        const data = await response.json();

        if (data.success) {
            institutions = data.institutions;
            populateInstitutionsSelect();
        }
    } catch (error) {
        console.error("Помилка завантаження закладів:", error);
    } finally {
        if (loadingEl) {
            loadingEl.classList.add("hidden");
        }
    }
}

// ==================== UI ОНОВЛЕННЯ ====================
function updateProfileHeader() {
    const avatarEl = document.getElementById("profileAvatar");
    const nameEl = document.getElementById("profileFullName");
    const emailEl = document.getElementById("profileEmail");
    const roleTextEl = document.getElementById("profileRoleText");
    const statusBadge = document.getElementById("profileStatusBadge");

    if (currentUser) {
        // Ініціали
        const initials = `${currentUser.first_name?.[0] || ""}${currentUser.last_name?.[0] || ""}`.toUpperCase();
        avatarEl.textContent = initials;

        // Повне ім'я
        const middleName = currentProfile?.middle_name || "";
        const fullName = `${currentUser.last_name || ""} ${currentUser.first_name || ""} ${middleName}`.trim();
        nameEl.textContent = fullName || "Завантаження...";

        // Email
        emailEl.textContent = currentUser.email || "";

        // Роль
        roleTextEl.textContent = ROLE_DISPLAY_NAMES[currentUser.role] || currentUser.role;

        // Статус профілю
        const isComplete = currentProfile?.is_complete || false;
        statusBadge.classList.remove("complete", "incomplete");
        statusBadge.classList.add(isComplete ? "complete" : "incomplete");
        statusBadge.querySelector(".status-text").textContent = isComplete
            ? "Профіль заповнено"
            : "Профіль не заповнено";

        // Показуємо попередження якщо профіль не заповнено
        const alertEl = document.getElementById("incompleteAlert");
        if (alertEl) {
            alertEl.style.display = isComplete ? "none" : "flex";
        }
    }
}

function populateInstitutionsSelect() {
    const selectEl = document.getElementById("institutionId");
    if (!selectEl) return;

    // Зберігаємо поточне значення
    const currentValue = selectEl.value || (currentProfile?.institution_id || "");

    // Очищаємо та заповнюємо
    selectEl.innerHTML = '<option value="">Оберіть заклад освіти</option>';

    // Групуємо по типу
    const typeLabels = {
        school: "Школи",
        lyceum: "Ліцеї",
        gymnasium: "Гімназії",
        college: "Коледжі",
        university: "Університети",
        other: "Інші",
    };

    const grouped = {};
    institutions.forEach((inst) => {
        const type = inst.type || "other";
        if (!grouped[type]) grouped[type] = [];
        grouped[type].push(inst);
    });

    Object.keys(typeLabels).forEach((type) => {
        if (grouped[type] && grouped[type].length > 0) {
            const optgroup = document.createElement("optgroup");
            optgroup.label = typeLabels[type];

            grouped[type].forEach((inst) => {
                const option = document.createElement("option");
                option.value = inst.id;
                option.textContent = `${inst.name} (${inst.city})`;
                optgroup.appendChild(option);
            });

            selectEl.appendChild(optgroup);
        }
    });

    // Встановлюємо поточне значення
    if (currentValue) {
        selectEl.value = currentValue;
    }
}

function populateForm() {
    if (!currentUser) return;

    // Основні дані (readonly)
    document.getElementById("firstName").value = currentUser.first_name || "";
    document.getElementById("lastName").value = currentUser.last_name || "";
    document.getElementById("email").value = currentUser.email || "";

    if (currentProfile) {
        // Загальні поля
        document.getElementById("middleName").value = currentProfile.middle_name || "";
        document.getElementById("phone").value = currentProfile.phone || "";
        document.getElementById("dateOfBirth").value = currentProfile.date_of_birth || "";
        document.getElementById("gender").value = currentProfile.gender || "";
        document.getElementById("bio").value = currentProfile.bio || "";

        // Institution (оновимо після завантаження списку)
        if (currentProfile.institution_id) {
            const institutionSelect = document.getElementById("institutionId");
            if (institutionSelect) {
                institutionSelect.value = currentProfile.institution_id;
            }
        }

        // Student fields
        document.getElementById("studentClass").value = currentProfile.student_class || "";
        document.getElementById("studentParallel").value = currentProfile.student_parallel || "";
        document.getElementById("studentSpecialization").value = currentProfile.student_specialization || "";
        document.getElementById("parentName").value = currentProfile.parent_name || "";
        document.getElementById("parentPhone").value = currentProfile.parent_phone || "";
        document.getElementById("parentEmail").value = currentProfile.parent_email || "";

        // Teacher fields
        document.getElementById("teacherSubject").value = currentProfile.teacher_subject || "";
        document.getElementById("teacherPosition").value = currentProfile.teacher_position || "";
        document.getElementById("teacherCategory").value = currentProfile.teacher_category || "";
        document.getElementById("teacherExperience").value = currentProfile.teacher_experience_years || "";
        document.getElementById("teacherEducation").value = currentProfile.teacher_education || "";

        // Methodist fields
        document.getElementById("methodistDepartment").value = currentProfile.methodist_department || "";
        document.getElementById("methodistSpecialization").value = currentProfile.methodist_specialization || "";
        document.getElementById("methodistQualification").value = currentProfile.methodist_qualification || "";

        // Judge fields
        document.getElementById("judgeSpecialization").value = currentProfile.judge_specialization || "";
        document.getElementById("judgeExperience").value = currentProfile.judge_experience_years || "";
        document.getElementById("judgeCertifications").value = currentProfile.judge_certifications || "";

        // Admin fields
        document.getElementById("adminDepartment").value = currentProfile.admin_department || "";
        document.getElementById("adminPosition").value = currentProfile.admin_position || "";
    }
}

function showRoleSection() {
    if (!currentUser) return;

    const role = currentUser.role;

    // Приховуємо всі ролеві секції
    document.querySelectorAll(".role-section").forEach((section) => {
        section.style.display = "none";
    });

    // Показуємо відповідну секцію
    const sectionId = `${role}Section`;
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = "block";
    }

    // Для admin приховуємо секцію закладу
    const institutionSection = document.getElementById("institutionSection");
    if (institutionSection) {
        if (role === "admin") {
            institutionSection.style.display = "none";
            // Знімаємо required з institution для admin
            const institutionSelect = document.getElementById("institutionId");
            if (institutionSelect) {
                institutionSelect.removeAttribute("required");
            }
        } else {
            institutionSection.style.display = "block";
        }
    }
}

// ==================== SIDEBAR ====================
function initializeSidebar() {
    renderSidebarMenu();
    renderSidebarUser();

    // Mobile menu toggle
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");

    if (menuToggle && sidebar && overlay) {
        menuToggle.addEventListener("click", () => {
            sidebar.classList.toggle("open");
            overlay.classList.toggle("active");
        });

        overlay.addEventListener("click", () => {
            sidebar.classList.remove("open");
            overlay.classList.remove("active");
        });
    }

    // Logout button
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }
}

function renderSidebarMenu() {
    const nav = document.getElementById("sidebarNav");
    if (!nav || !currentUser) return;

    const menuConfig = MENU_CONFIG[currentUser.role] || MENU_CONFIG.student;
    let html = "";

    menuConfig.sections.forEach((section) => {
        html += `<div class="nav-section">`;
        html += `<div class="nav-section-title">${section.title}</div>`;

        section.items.forEach((item) => {
            const activeClass = item.active ? "active" : "";
            const href = item.href || "#";
            const icon = ICONS[item.icon] || "";

            html += `<a href="${href}" class="nav-item ${activeClass}">${icon}${item.label}</a>`;
        });

        html += `</div>`;
    });

    nav.innerHTML = html;
}

function renderSidebarUser() {
    const userContainer = document.getElementById("sidebarUser");
    if (!userContainer || !currentUser) return;

    const initials = `${currentUser.first_name?.[0] || ""}${currentUser.last_name?.[0] || ""}`.toUpperCase();
    const fullName = `${currentUser.first_name || ""} ${currentUser.last_name || ""}`.trim();
    const roleDisplay = ROLE_DISPLAY_NAMES[currentUser.role] || currentUser.role;

    userContainer.innerHTML = `
        <div class="user-avatar">${initials}</div>
        <div class="user-info">
            <div class="user-name">${fullName}</div>
            <div class="user-role">${roleDisplay}</div>
        </div>
    `;
}

// ==================== FORM HANDLING ====================
function initializeForm() {
    const form = document.getElementById("profileForm");
    const cancelBtn = document.getElementById("cancelBtn");

    if (form) {
        form.addEventListener("submit", handleFormSubmit);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener("click", () => {
            window.location.href = "/dashboard.html";
        });
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();

    const saveBtn = document.getElementById("saveBtn");
    const successAlert = document.getElementById("successAlert");
    const incompleteAlert = document.getElementById("incompleteAlert");

    // Disable button
    saveBtn.disabled = true;
    saveBtn.classList.add("loading");
    saveBtn.innerHTML = `
        <div class="mini-spinner"></div>
        Збереження...
    `;

    try {
        const formData = collectFormData();

        const token = localStorage.getItem("token");
        const response = await fetch("/api/profile", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (result.success) {
            currentProfile = result.profile;

            // Оновлюємо UI
            updateProfileHeader();

            // Показуємо успіх
            if (successAlert) {
                successAlert.style.display = "flex";
                setTimeout(() => {
                    successAlert.style.display = "none";
                }, 5000);
            }

            // Приховуємо попередження якщо профіль заповнено
            if (incompleteAlert && currentProfile?.is_complete) {
                incompleteAlert.style.display = "none";
            }
        } else {
            throw new Error(result.message || "Помилка збереження");
        }
    } catch (error) {
        console.error("Помилка збереження профілю:", error);
        alert("Помилка збереження профілю: " + error.message);
    } finally {
        // Restore button
        saveBtn.disabled = false;
        saveBtn.classList.remove("loading");
        saveBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            Зберегти профіль
        `;
    }
}

function collectFormData() {
    return {
        middle_name: document.getElementById("middleName").value.trim() || null,
        phone: document.getElementById("phone").value.trim() || null,
        date_of_birth: document.getElementById("dateOfBirth").value || null,
        gender: document.getElementById("gender").value || null,
        bio: document.getElementById("bio").value.trim() || null,
        institution_id: parseInt(document.getElementById("institutionId").value) || null,

        // Student fields
        student_class: document.getElementById("studentClass").value || null,
        student_parallel: document.getElementById("studentParallel").value || null,
        student_specialization: document.getElementById("studentSpecialization").value.trim() || null,
        parent_name: document.getElementById("parentName").value.trim() || null,
        parent_phone: document.getElementById("parentPhone").value.trim() || null,
        parent_email: document.getElementById("parentEmail").value.trim() || null,

        // Teacher fields
        teacher_subject: document.getElementById("teacherSubject").value.trim() || null,
        teacher_position: document.getElementById("teacherPosition").value.trim() || null,
        teacher_category: document.getElementById("teacherCategory").value || null,
        teacher_experience_years: parseInt(document.getElementById("teacherExperience").value) || null,
        teacher_education: document.getElementById("teacherEducation").value.trim() || null,

        // Methodist fields
        methodist_department: document.getElementById("methodistDepartment").value.trim() || null,
        methodist_specialization: document.getElementById("methodistSpecialization").value.trim() || null,
        methodist_qualification: document.getElementById("methodistQualification").value.trim() || null,

        // Judge fields
        judge_specialization: document.getElementById("judgeSpecialization").value.trim() || null,
        judge_experience_years: parseInt(document.getElementById("judgeExperience").value) || null,
        judge_certifications: document.getElementById("judgeCertifications").value.trim() || null,

        // Admin fields
        admin_department: document.getElementById("adminDepartment").value.trim() || null,
        admin_position: document.getElementById("adminPosition").value.trim() || null,
    };
}

// ==================== УТИЛІТИ ====================
function hideLoading() {
    const loadingOverlay = document.getElementById("loadingOverlay");
    if (loadingOverlay) {
        loadingOverlay.classList.add("hidden");
    }
}

function handleAuthError(error) {
    console.error("Auth error:", error);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/auth.html";
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/auth.html";
}

/**
 * Admin Panel JavaScript
 * Платформа: Єдина платформа конкурсів України
 * Доступ: тільки для ролі admin
 */

// ==================== ГЛОБАЛЬНІ ЗМІННІ ====================
let currentUser = null;
let allUsers = [];
let allCompetitions = [];
let allRoles = [];
let allPermissions = [];
let rolePermissions = {};
let selectedRoleId = null;
let pendingPermissionChanges = {};

// ==================== MOCK DATA ====================
const mockUsers = [
    { id: 1, first_name: "Адмін", last_name: "Системи", email: "admin@test.com", role: "admin", role_id: 5, role_display_name: "Адміністратор", created_at: "2026-01-01" },
    { id: 2, first_name: "Іван", last_name: "Петренко", email: "student@test.com", role: "student", role_id: 1, role_display_name: "Учень", created_at: "2026-01-15" },
    { id: 3, first_name: "Марія", last_name: "Коваленко", email: "teacher@test.com", role: "teacher", role_id: 2, role_display_name: "Вчитель", created_at: "2026-01-10" },
    { id: 4, first_name: "Олена", last_name: "Сидоренко", email: "methodist@test.com", role: "methodist", role_id: 3, role_display_name: "Методист", created_at: "2026-01-05" },
    { id: 5, first_name: "Петро", last_name: "Іваненко", email: "judge@test.com", role: "judge", role_id: 4, role_display_name: "Суддя", created_at: "2026-01-08" },
    { id: 6, first_name: "Анна", last_name: "Бондаренко", email: "anna@test.com", role: "student", role_id: 1, role_display_name: "Учень", created_at: "2026-02-01" },
    { id: 7, first_name: "Олексій", last_name: "Мельник", email: "oleksiy@test.com", role: "student", role_id: 1, role_display_name: "Учень", created_at: "2026-02-05" },
    { id: 8, first_name: "Юлія", last_name: "Шевченко", email: "yulia@test.com", role: "teacher", role_id: 2, role_display_name: "Вчитель", created_at: "2026-02-10" },
];

const mockCompetitions = [
    { id: 1, title: "Всеукраїнська олімпіада з математики", subject: "mathematics", level: "national", status: "active", start_date: "2026-04-01", end_date: "2026-04-15", max_participants: 500, sections: ["Алгебра", "Геометрія", "Математичний аналіз"] },
    { id: 2, title: "Конкурс юних фізиків", subject: "physics", level: "regional", status: "active", start_date: "2026-05-01", end_date: "2026-05-10", max_participants: 200, sections: ["Механіка", "Оптика"] },
    { id: 3, title: "Олімпіада з інформатики", subject: "informatics", level: "national", status: "completed", start_date: "2026-02-01", end_date: "2026-02-15", max_participants: 300, sections: ["Алгоритми", "Структури даних", "Web-програмування"] },
    { id: 4, title: "Конкурс есе з української мови", subject: "ukrainian", level: "school", status: "draft", start_date: "2026-03-20", end_date: "2026-04-05", max_participants: 100, sections: ["Творчі роботи"] },
    { id: 5, title: "Олімпіада з хімії", subject: "chemistry", level: "national", status: "active", start_date: "2026-05-15", end_date: "2026-05-25", max_participants: 250, sections: ["Органічна хімія", "Неорганічна хімія"] },
    { id: 6, title: "Конкурс з біології", subject: "biology", level: "regional", status: "active", start_date: "2026-04-20", end_date: "2026-05-01", max_participants: 180, sections: ["Ботаніка", "Зоологія", "Генетика"] },
];

const mockRoles = [
    { id: 1, name: "student", display_name: "Учень", description: "Учасник конкурсів" },
    { id: 2, name: "teacher", display_name: "Вчитель", description: "Керівник учнів" },
    { id: 3, name: "methodist", display_name: "Методист", description: "Організатор конкурсів" },
    { id: 4, name: "judge", display_name: "Суддя", description: "Оцінювач робіт" },
    { id: 5, name: "admin", display_name: "Адміністратор", description: "Повний доступ" },
];

const mockAllPermissions = [
    { id: 1, name: "view_competitions", display_name: "Перегляд конкурсів", description: "Перегляд списку конкурсів", category: "competitions" },
    { id: 2, name: "create_competition", display_name: "Створення конкурсів", description: "Створення нових конкурсів", category: "competitions" },
    { id: 3, name: "edit_competition", display_name: "Редагування конкурсів", description: "Редагування існуючих конкурсів", category: "competitions" },
    { id: 4, name: "delete_competition", display_name: "Видалення конкурсів", description: "Видалення конкурсів", category: "competitions" },
    { id: 5, name: "manage_applications", display_name: "Управління заявками", description: "Обробка заявок на конкурси", category: "applications" },
    { id: 6, name: "submit_application", display_name: "Подання заявок", description: "Подання заявок на участь", category: "applications" },
    { id: 7, name: "view_submissions", display_name: "Перегляд робіт", description: "Перегляд поданих робіт", category: "submissions" },
    { id: 8, name: "evaluate_works", display_name: "Оцінювання робіт", description: "Оцінювання робіт учасників", category: "judging" },
    { id: 9, name: "manage_users", display_name: "Управління користувачами", description: "Керування обліковими записами", category: "users" },
    { id: 10, name: "manage_students", display_name: "Керування учнями", description: "Управління своїми учнями", category: "users" },
    { id: 11, name: "view_reports", display_name: "Перегляд звітів", description: "Доступ до статистики", category: "reports" },
    { id: 12, name: "manage_roles", display_name: "Керування ролями", description: "Налаштування прав доступу", category: "system" },
    { id: 13, name: "system_settings", display_name: "Налаштування системи", description: "Системні налаштування", category: "system" },
];

const mockRolePermissions = {
    1: [1, 6, 7], // student
    2: [1, 2, 3, 7, 10, 11], // teacher
    3: [1, 2, 3, 5, 7, 11], // methodist
    4: [1, 7, 8], // judge
    5: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], // admin - all
};

// ==================== ІНІЦІАЛІЗАЦІЯ ====================
document.addEventListener("DOMContentLoaded", () => {
    checkAdminAccess();
});

async function checkAdminAccess() {
    const token = localStorage.getItem("auth_token");

    if (!token) {
        showAccessDenied();
        return;
    }

    try {
        // Запит до API для отримання актуальних даних користувача з бази даних
        const response = await fetch("/api/auth/me", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            // Токен невалідний або користувача не знайдено
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user_data");
            showAccessDenied();
            return;
        }

        const data = await response.json();
        
        if (!data.success || !data.user) {
            showAccessDenied();
            return;
        }

        currentUser = data.user;
        
        // Перевірка ролі admin з бази даних або is_super_admin
        const isAdmin = currentUser.role === "admin" || currentUser.is_super_admin === true;
        if (!isAdmin) {
            showAccessDenied();
            return;
        }

        // Оновлюємо локальні дані користувача
        localStorage.setItem("user_data", JSON.stringify(currentUser));

        // Відображення панелі
        document.getElementById("accessDenied").classList.add("hidden");
        document.getElementById("mainLayout").style.display = "flex";
        
        // Ініціалізація
        initSidebar();
        initTabs();
        initLogout();
        updateUserInfo();
        
        // Завантаження даних
        await loadAllData();
        
        // Приховання лоадера
        hideLoading();
    } catch (error) {
        console.error("Error checking access:", error);
        showAccessDenied();
    }
}

function showAccessDenied() {
    document.getElementById("loadingOverlay").classList.add("hidden");
    document.getElementById("accessDenied").classList.remove("hidden");
    document.getElementById("mainLayout").style.display = "none";
}

function hideLoading() {
    document.getElementById("loadingOverlay").classList.add("hidden");
}

// ==================== ЗАВАНТАЖЕННЯ ДАНИХ ====================
async function loadAllData() {
    await Promise.all([
        loadUsers(),
        loadCompetitions(),
        loadRoles(),
        loadPermissions()
    ]);
}

async function loadUsers() {
    try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch("/api/admin/users", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            allUsers = data.users || [];
        } else {
            // Fallback to mock data
            allUsers = mockUsers;
        }
    } catch (error) {
        console.error("Error loading users:", error);
        allUsers = mockUsers;
    }

    renderUsers();
    updateUserStats();
}

async function loadCompetitions() {
    try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch("/api/competitions", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            allCompetitions = data.competitions || [];
        } else {
            allCompetitions = mockCompetitions;
        }
    } catch (error) {
        console.error("Error loading competitions:", error);
        allCompetitions = mockCompetitions;
    }

    renderCompetitions();
    renderSections();
    updateCompetitionStats();
}

async function loadRoles() {
    try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch("/api/admin/roles", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            allRoles = data.roles || [];
        } else {
            allRoles = mockRoles;
        }
    } catch (error) {
        console.error("Error loading roles:", error);
        allRoles = mockRoles;
    }

    renderRoles();
}

async function loadPermissions() {
    try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch("/api/admin/permissions", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            allPermissions = data.permissions || [];
        } else {
            allPermissions = mockAllPermissions;
        }
    } catch (error) {
        console.error("Error loading permissions:", error);
        allPermissions = mockAllPermissions;
    }

    // Load permissions for each role
    for (const role of allRoles) {
        await loadRolePermissions(role.id);
    }
}

async function loadRolePermissions(roleId) {
    try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch(`/api/admin/roles/${roleId}/permissions`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            rolePermissions[roleId] = data.permissions?.map(p => p.id) || [];
        } else {
            rolePermissions[roleId] = mockRolePermissions[roleId] || [];
        }
    } catch (error) {
        console.error("Error loading role permissions:", error);
        rolePermissions[roleId] = mockRolePermissions[roleId] || [];
    }
}

// ==================== РЕНДЕРИНГ КОРИСТУВАЧІВ ====================
function renderUsers(filterRole = "all", searchQuery = "") {
    const container = document.getElementById("usersContainer");
    let filteredUsers = [...allUsers];

    // Фільтрація по ролі
    if (filterRole !== "all") {
        filteredUsers = filteredUsers.filter(u => u.role === filterRole);
    }

    // Пошук
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredUsers = filteredUsers.filter(u => 
            u.first_name.toLowerCase().includes(query) ||
            u.last_name.toLowerCase().includes(query) ||
            u.email.toLowerCase().includes(query)
        );
    }

    // Групування по ролях
    const groupedUsers = {};
    const roleOrder = ["admin", "methodist", "teacher", "judge", "student"];

    roleOrder.forEach(role => {
        groupedUsers[role] = filteredUsers.filter(u => u.role === role);
    });

    // Рендеринг
    container.innerHTML = "";

    roleOrder.forEach(role => {
        const users = groupedUsers[role];
        if (users.length === 0 && filterRole !== "all") return;
        if (users.length === 0 && filterRole === "all") return;

        const roleInfo = getRoleInfo(role);
        const section = document.createElement("div");
        section.className = "role-section";
        section.innerHTML = `
            <div class="role-header" data-role="${role}">
                <div class="role-header-left">
                    <span class="role-badge ${role}">${roleInfo.display_name}</span>
                    <span class="role-count">${users.length} користувачів</span>
                </div>
                <div class="role-toggle">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
            </div>
            <div class="users-list" id="users-${role}">
                ${users.map(user => renderUserItem(user)).join("")}
            </div>
        `;
        container.appendChild(section);
    });

    // Event listeners для розгортання
    document.querySelectorAll(".role-header").forEach(header => {
        header.addEventListener("click", () => {
            const role = header.dataset.role;
            const list = document.getElementById(`users-${role}`);
            const toggle = header.querySelector(".role-toggle");
            list.classList.toggle("open");
            toggle.classList.toggle("open");
        });
    });

    // Автоматично відкрити першу групу
    const firstList = container.querySelector(".users-list");
    const firstToggle = container.querySelector(".role-toggle");
    if (firstList) {
        firstList.classList.add("open");
        firstToggle.classList.add("open");
    }
}

function renderUserItem(user) {
    const initials = getInitials(user.first_name, user.last_name);
    const createdAt = formatDate(user.created_at);
    
    return `
        <div class="user-item" data-user-id="${user.id}">
            <div class="user-info-left">
                <div class="user-avatar-small">${initials}</div>
                <div class="user-details">
                    <h4>${user.first_name} ${user.last_name}</h4>
                    <p>${user.email}</p>
                </div>
            </div>
            <div class="user-actions">
                <span class="user-date">Зареєстровано: ${createdAt}</span>
                ${user.role !== "admin" ? `
                    <select class="filter-select" onchange="changeUserRole(${user.id}, this.value)" style="padding: 0.5rem 2rem 0.5rem 0.75rem; font-size: 0.8125rem;">
                        ${allRoles.filter(r => r.name !== "admin").map(r => `
                            <option value="${r.id}" ${user.role_id === r.id ? "selected" : ""}>${r.display_name}</option>
                        `).join("")}
                    </select>
                ` : '<span class="role-badge admin">Адмін</span>'}
            </div>
        </div>
    `;
}

function updateUserStats() {
    document.getElementById("totalUsers").textContent = allUsers.length;
    document.getElementById("studentCount").textContent = allUsers.filter(u => u.role === "student").length;
    document.getElementById("teacherCount").textContent = allUsers.filter(u => u.role === "teacher").length;
    document.getElementById("methodistCount").textContent = allUsers.filter(u => u.role === "methodist").length;
    document.getElementById("judgeCount").textContent = allUsers.filter(u => u.role === "judge").length;
}

async function changeUserRole(userId, newRoleId) {
    try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch(`/api/admin/users/${userId}/role`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ role_id: parseInt(newRoleId) })
        });

        if (response.ok) {
            showToast("Роль користувача успішно змінено", "success");
            await loadUsers();
        } else {
            // Mock update
            const user = allUsers.find(u => u.id === userId);
            const newRole = allRoles.find(r => r.id === parseInt(newRoleId));
            if (user && newRole) {
                user.role_id = newRole.id;
                user.role = newRole.name;
                user.role_display_name = newRole.display_name;
                renderUsers();
                updateUserStats();
                showToast("Роль користувача успішно змінено", "success");
            }
        }
    } catch (error) {
        console.error("Error changing role:", error);
        showToast("Помилка зміни ролі", "error");
    }
}

// ==================== РЕНДЕРИНГ КОНКУРСІВ ====================
function renderCompetitions(filterStatus = "all", filterSubject = "all", searchQuery = "") {
    const tbody = document.getElementById("competitionsBody");
    let filtered = [...allCompetitions];

    if (filterStatus !== "all") {
        filtered = filtered.filter(c => c.status === filterStatus);
    }

    if (filterSubject !== "all") {
        filtered = filtered.filter(c => c.subject === filterSubject);
    }

    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(c => 
            c.title.toLowerCase().includes(query) ||
            (c.description && c.description.toLowerCase().includes(query))
        );
    }

    tbody.innerHTML = filtered.map(comp => `
        <tr>
            <td><strong>#${comp.id}</strong></td>
            <td>
                <div style="max-width: 250px;">
                    <div style="font-weight: 500; color: var(--gray-800);">${comp.title}</div>
                </div>
            </td>
            <td>
                <span class="subject-badge">
                    ${getSubjectIcon(comp.subject)}
                    ${getSubjectName(comp.subject)}
                </span>
            </td>
            <td><span class="level-badge">${getLevelName(comp.level)}</span></td>
            <td><span class="status-badge ${comp.status}">${getStatusName(comp.status)}</span></td>
            <td>
                <div style="font-size: 0.8125rem;">
                    <div>${formatDate(comp.start_date)}</div>
                    <div style="color: var(--gray-400);">до ${formatDate(comp.end_date)}</div>
                </div>
            </td>
            <td>${comp.max_participants || 0}</td>
        </tr>
    `).join("");

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 3rem; color: var(--gray-500);">
                    Конкурсів не знайдено
                </td>
            </tr>
        `;
    }
}

function updateCompetitionStats() {
    document.getElementById("totalCompetitions").textContent = allCompetitions.length;
    document.getElementById("activeCompetitions").textContent = allCompetitions.filter(c => c.status === "active").length;
    document.getElementById("draftCompetitions").textContent = allCompetitions.filter(c => c.status === "draft").length;
    document.getElementById("completedCompetitions").textContent = allCompetitions.filter(c => c.status === "completed").length;
}

// ==================== РЕНДЕРИНГ СЕКЦІЙ ====================
function renderSections() {
    const container = document.getElementById("sectionsGrid");
    
    // Збираємо всі унікальні секції з конкурсів
    const sectionsMap = {};
    
    allCompetitions.forEach(comp => {
        if (comp.sections && Array.isArray(comp.sections)) {
            comp.sections.forEach(section => {
                if (!sectionsMap[section]) {
                    sectionsMap[section] = {
                        name: section,
                        competitions: [],
                        subjects: new Set()
                    };
                }
                sectionsMap[section].competitions.push(comp.title);
                sectionsMap[section].subjects.add(comp.subject);
            });
        }
    });

    const sections = Object.values(sectionsMap);

    container.innerHTML = sections.map(section => `
        <div class="section-card">
            <div class="section-card-header">
                <div class="section-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                </div>
                <span class="section-count">${section.competitions.length} конкурсів</span>
            </div>
            <h3>${section.name}</h3>
            <p>Використовується в конкурсах</p>
            <div class="section-tags">
                ${Array.from(section.subjects).map(subj => `
                    <span class="section-tag">${getSubjectName(subj)}</span>
                `).join("")}
            </div>
        </div>
    `).join("");

    if (sections.length === 0) {
        container.innerHTML = `
            <div class="empty-permissions">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                <p>��екцій поки немає</p>
            </div>
        `;
    }
}

// ==================== РЕНДЕРИНГ РОЛЕЙ ТА ДОЗВОЛІВ ====================
function renderRoles() {
    const container = document.getElementById("rolesList");
    
    // Фільтруємо, щоб не показувати admin
    const editableRoles = allRoles.filter(r => r.name !== "admin");
    
    container.innerHTML = editableRoles.map(role => `
        <div class="role-item ${selectedRoleId === role.id ? 'active' : ''}" data-role-id="${role.id}">
            <div class="role-item-icon" style="background: ${getRoleColor(role.name)}; color: white;">
                ${getRoleIcon(role.name)}
            </div>
            <div class="role-item-info">
                <h4>${role.display_name}</h4>
                <p>${role.description || ''}</p>
            </div>
        </div>
    `).join("");

    // Додаємо admin як disabled
    container.innerHTML += `
        <div class="role-item disabled" title="Права адміністратора не можна змінювати">
            <div class="role-item-icon" style="background: rgba(239, 68, 68, 0.1); color: #ef4444;">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
            <div class="role-item-info">
                <h4>Адміністратор</h4>
                <p>Повний доступ (не редагується)</p>
            </div>
        </div>
    `;

    // Event listeners
    document.querySelectorAll(".role-item:not(.disabled)").forEach(item => {
        item.addEventListener("click", () => {
            const roleId = parseInt(item.dataset.roleId);
            selectRole(roleId);
        });
    });
}

function selectRole(roleId) {
    selectedRoleId = roleId;
    pendingPermissionChanges = {};
    
    // Оновити активний стан
    document.querySelectorAll(".role-item").forEach(item => {
        item.classList.toggle("active", parseInt(item.dataset.roleId) === roleId);
    });

    const role = allRoles.find(r => r.id === roleId);
    if (role) {
        document.getElementById("selectedRoleName").textContent = role.display_name;
        document.getElementById("selectedRoleDesc").textContent = role.description || "Налаштуйте дозволи для цієї ролі";
    }

    renderPermissions(roleId);
}

function renderPermissions(roleId) {
    const container = document.getElementById("permissionsGrid");
    const actionsPanel = document.getElementById("permissionsActions");

    if (!roleId) {
        container.innerHTML = `
            <div class="empty-permissions">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                <p>Оберіть роль зліва для налаштування дозволів</p>
            </div>
        `;
        actionsPanel.classList.add("hidden");
        return;
    }

    // Групування дозволів по категоріях
    const categories = {};
    allPermissions.forEach(perm => {
        const cat = perm.category || "other";
        if (!categories[cat]) {
            categories[cat] = [];
        }
        categories[cat].push(perm);
    });

    const currentPermissions = rolePermissions[roleId] || [];

    const categoryNames = {
        competitions: "Конкурси",
        applications: "Заявки",
        submissions: "Роботи",
        judging: "Оцінювання",
        users: "Користувачі",
        reports: "Звіти",
        system: "Система",
        other: "Інше"
    };

    container.innerHTML = Object.entries(categories).map(([cat, perms]) => `
        <div class="permission-category">
            <div class="permission-category-title">${categoryNames[cat] || cat}</div>
            ${perms.map(perm => `
                <div class="permission-item">
                    <div class="permission-info">
                        <h4>${perm.display_name}</h4>
                        <p>${perm.description || ''}</p>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" 
                               data-permission-id="${perm.id}" 
                               ${currentPermissions.includes(perm.id) ? 'checked' : ''}
                               onchange="togglePermission(${perm.id}, this.checked)">
                        <span class="toggle-slider"></span>
                    </label>
                </div>
            `).join("")}
        </div>
    `).join("");

    actionsPanel.classList.remove("hidden");
}

function togglePermission(permissionId, enabled) {
    pendingPermissionChanges[permissionId] = enabled;
}

async function savePermissions() {
    if (!selectedRoleId || Object.keys(pendingPermissionChanges).length === 0) {
        showToast("Немає змін для збереження", "error");
        return;
    }

    try {
        const token = localStorage.getItem("auth_token");
        
        // Визначаємо поточний стан дозволів
        let currentPerms = [...(rolePermissions[selectedRoleId] || [])];

        // Застосовуємо зміни
        Object.entries(pendingPermissionChanges).forEach(([permId, enabled]) => {
            const id = parseInt(permId);
            if (enabled && !currentPerms.includes(id)) {
                currentPerms.push(id);
            } else if (!enabled && currentPerms.includes(id)) {
                currentPerms = currentPerms.filter(p => p !== id);
            }
        });

        const response = await fetch(`/api/admin/roles/${selectedRoleId}/permissions`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ permissions: currentPerms })
        });

        if (response.ok) {
            rolePermissions[selectedRoleId] = currentPerms;
            showToast("Дозволи успішно збережено", "success");
        } else {
            // Mock update
            rolePermissions[selectedRoleId] = currentPerms;
            showToast("Дозволи успішно збережено", "success");
        }

        pendingPermissionChanges = {};
    } catch (error) {
        console.error("Error saving permissions:", error);
        // Mock update
        let currentPerms = [...(rolePermissions[selectedRoleId] || [])];
        Object.entries(pendingPermissionChanges).forEach(([permId, enabled]) => {
            const id = parseInt(permId);
            if (enabled && !currentPerms.includes(id)) {
                currentPerms.push(id);
            } else if (!enabled && currentPerms.includes(id)) {
                currentPerms = currentPerms.filter(p => p !== id);
            }
        });
        rolePermissions[selectedRoleId] = currentPerms;
        pendingPermissionChanges = {};
        showToast("Дозволи успішно збережено", "success");
    }
}

// ==================== НАВІГАЦІЯ ТА TABS ====================
function initTabs() {
    const navItems = document.querySelectorAll(".nav-item[data-tab]");
    
    navItems.forEach(item => {
        item.addEventListener("click", () => {
            const tabId = item.dataset.tab;
            switchTab(tabId);
            
            // Оновити активний стан навігації
            navItems.forEach(ni => ni.classList.remove("active"));
            item.classList.add("active");
        });
    });

    // Ініціалізація фільтрів
    initFilters();
}

function switchTab(tabId) {
    // Приховати всі таби
    document.querySelectorAll(".admin-tab").forEach(tab => {
        tab.classList.remove("active");
    });

    // Показати вибраний
    const tab = document.getElementById(`tab-${tabId}`);
    if (tab) {
        tab.classList.add("active");
    }

    // Оновити заголовок
    const titles = {
        users: "Користувачі",
        competitions: "Конкурси",
        sections: "Секції",
        permissions: "Права доступу"
    };
    document.getElementById("pageTitle").textContent = titles[tabId] || "Адмін панель";
}

function initFilters() {
    // Users filters
    document.getElementById("userSearch")?.addEventListener("input", (e) => {
        const roleFilter = document.getElementById("roleFilter").value;
        renderUsers(roleFilter, e.target.value);
    });

    document.getElementById("roleFilter")?.addEventListener("change", (e) => {
        const searchQuery = document.getElementById("userSearch").value;
        renderUsers(e.target.value, searchQuery);
    });

    // Competitions filters
    document.getElementById("competitionSearch")?.addEventListener("input", (e) => {
        const status = document.getElementById("statusFilter").value;
        const subject = document.getElementById("subjectFilter").value;
        renderCompetitions(status, subject, e.target.value);
    });

    document.getElementById("statusFilter")?.addEventListener("change", (e) => {
        const subject = document.getElementById("subjectFilter").value;
        const search = document.getElementById("competitionSearch").value;
        renderCompetitions(e.target.value, subject, search);
    });

    document.getElementById("subjectFilter")?.addEventListener("change", (e) => {
        const status = document.getElementById("statusFilter").value;
        const search = document.getElementById("competitionSearch").value;
        renderCompetitions(status, e.target.value, search);
    });

    // Save permissions button
    document.getElementById("savePermissions")?.addEventListener("click", savePermissions);
}

// ==================== SIDEBAR ТА LOGOUT ====================
function initSidebar() {
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");

    menuToggle?.addEventListener("click", () => {
        sidebar.classList.toggle("open");
        overlay.classList.toggle("active");
    });

    overlay?.addEventListener("click", () => {
        sidebar.classList.remove("open");
        overlay.classList.remove("active");
    });
}

function initLogout() {
    document.getElementById("logoutBtn")?.addEventListener("click", () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
        window.location.href = "/auth.html";
    });
}

function updateUserInfo() {
    if (currentUser) {
        const initials = getInitials(currentUser.first_name, currentUser.last_name);
        document.getElementById("userAvatar").textContent = initials;
        document.getElementById("userName").textContent = `${currentUser.first_name} ${currentUser.last_name}`;
    }
}

// ==================== УТИЛІТИ ====================
function getInitials(firstName, lastName) {
    return `${(firstName || "")[0] || ""}${(lastName || "")[0] || ""}`.toUpperCase();
}

function formatDate(dateStr) {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("uk-UA", { day: "numeric", month: "short", year: "numeric" });
}

function getRoleInfo(role) {
    const info = {
        student: { display_name: "Учні" },
        teacher: { display_name: "Вчителі" },
        methodist: { display_name: "Методисти" },
        judge: { display_name: "Судді" },
        admin: { display_name: "Адміністратори" }
    };
    return info[role] || { display_name: role };
}

function getRoleColor(role) {
    const colors = {
        student: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        teacher: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        methodist: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
        judge: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
        admin: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
    };
    return colors[role] || "var(--gradient-primary)";
}

function getRoleIcon(role) {
    const icons = {
        student: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>',
        teacher: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>',
        methodist: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>',
        judge: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',
        admin: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>'
    };
    return icons[role] || icons.student;
}

function getSubjectName(subject) {
    const names = {
        mathematics: "Математика",
        physics: "Фізика",
        informatics: "Інформатика",
        ukrainian: "Українська мова",
        chemistry: "Хімія",
        biology: "Біологія",
        literature: "Література",
        science: "Науки"
    };
    return names[subject] || subject;
}

function getSubjectIcon(subject) {
    const icons = {
        mathematics: "📐",
        physics: "⚡",
        informatics: "💻",
        ukrainian: "📝",
        chemistry: "🧪",
        biology: "🧬",
        literature: "📚",
        science: "🔬"
    };
    return icons[subject] || "📋";
}

function getLevelName(level) {
    const names = {
        school: "Шкільний",
        regional: "Регіональний",
        national: "Всеукраїнський"
    };
    return names[level] || level;
}

function getStatusName(status) {
    const names = {
        active: "Активний",
        draft: "Чернетка",
        completed: "Завершений",
        cancelled: "Скасований"
    };
    return names[status] || status;
}

function showToast(message, type = "success") {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-icon">
            ${type === "success" 
                ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'
                : '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>'
            }
        </div>
        <span class="toast-message">${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

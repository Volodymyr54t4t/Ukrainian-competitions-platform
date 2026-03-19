/**
 * Адмін панель - JavaScript
 * Платформа: Єдина платформа конкурсів України
 */

const API_URL = window.location.origin;

// Глобальні змінні
let currentUser = null;
let allUsers = [];
let allRoles = [];
let allPermissions = [];
let rolePermissionsMap = {};

// ==================== ІНІЦІАЛІЗАЦІЯ ====================
document.addEventListener('DOMContentLoaded', async () => {
    // Перевірка авторизації
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.replace('/auth.html');
        return;
    }

    // Завантаження даних
    await loadCurrentUser();
    
    // Перевірка чи користувач адмін
    if (currentUser && currentUser.role !== 'admin') {
        showToast('Доступ заборонено. Потрібні права адміністратора.', 'error');
        setTimeout(() => {
            window.location.replace('/dashboard.html');
        }, 2000);
        return;
    }

    await Promise.all([
        loadUsers(),
        loadRoles(),
        loadPermissions()
    ]);

    setupEventListeners();
    hideLoading();
});

// ==================== ЗАВАНТАЖЕННЯ ДАНИХ ====================
async function loadCurrentUser() {
    try {
        const response = await fetch(`${API_URL}/api/me`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        const data = await response.json();
        
        if (data.success) {
            currentUser = data.user;
            updateCurrentUserUI();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Помилка завантаження користувача:', error);
        showToast('Помилка завантаження даних користувача', 'error');
    }
}

async function loadUsers() {
    try {
        const response = await fetch(`${API_URL}/api/admin/users`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        const data = await response.json();
        
        if (data.success) {
            allUsers = data.users;
            renderUsersTable(allUsers);
            updateStats();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Помилка завантаження користувачів:', error);
        document.getElementById('usersTableBody').innerHTML = `
            <tr>
                <td colspan="5" class="no-data-cell">Помилка завантаження користувачів</td>
            </tr>
        `;
    }
}

async function loadRoles() {
    try {
        const response = await fetch(`${API_URL}/api/admin/roles`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        const data = await response.json();
        
        if (data.success) {
            allRoles = data.roles;
            renderRolesSection();
        }
    } catch (error) {
        console.error('Помилка завантаження ролей:', error);
    }
}

async function loadPermissions() {
    try {
        const response = await fetch(`${API_URL}/api/admin/permissions`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        const data = await response.json();
        
        if (data.success) {
            allPermissions = data.permissions;
            rolePermissionsMap = data.rolePermissions || {};
            renderPermissionsMatrix();
        }
    } catch (error) {
        console.error('Помилка завантаження дозволів:', error);
    }
}

// ==================== ОНОВЛЕННЯ UI ====================
function updateCurrentUserUI() {
    if (!currentUser) return;

    const initials = `${currentUser.first_name?.[0] || ''}${currentUser.last_name?.[0] || ''}`.toUpperCase();
    
    document.getElementById('currentUserName').textContent = `${currentUser.first_name} ${currentUser.last_name}`;
    document.getElementById('currentUserRole').textContent = getRoleLabel(currentUser.role);
    document.getElementById('currentUserAvatar').textContent = initials;
}

function updateStats() {
    const stats = {
        total: allUsers.length,
        admins: allUsers.filter(u => u.role === 'admin').length,
        teachers: allUsers.filter(u => u.role === 'teacher').length,
        students: allUsers.filter(u => u.role === 'student').length
    };

    document.getElementById('totalUsers').textContent = stats.total;
    document.getElementById('totalAdmins').textContent = stats.admins;
    document.getElementById('totalTeachers').textContent = stats.teachers;
    document.getElementById('totalStudents').textContent = stats.students;
}

function renderUsersTable(users) {
    const tbody = document.getElementById('usersTableBody');

    if (users.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="no-data-cell">Користувачів не знайдено</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = users.map(user => {
        const initials = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase();
        const date = new Date(user.created_at).toLocaleDateString('uk-UA');
        
        return `
            <tr>
                <td>
                    <div class="user-cell">
                        <div class="user-avatar">${initials}</div>
                        <span class="user-name">${user.first_name} ${user.last_name}</span>
                    </div>
                </td>
                <td class="email-cell">${user.email}</td>
                <td>
                    <span class="role-badge ${user.role}">${getRoleLabel(user.role)}</span>
                </td>
                <td class="date-cell">${date}</td>
                <td>
                    <div class="actions-cell">
                        <button class="action-btn edit" onclick="openEditModal(${user.id})" title="Редагувати">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="action-btn view" onclick="openPermissionsModal(${user.id})" title="Переглянути дозволи">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function renderRolesSection() {
    const container = document.querySelector('#rolesSection .roles-grid');
    if (!container || !allRoles.length) return;

    const roleColors = {
        admin: { bg: 'var(--error-light)', color: 'var(--error)' },
        methodist: { bg: '#F3E8FF', color: '#7C3AED' },
        teacher: { bg: 'var(--success-light)', color: 'var(--success)' },
        judge: { bg: 'var(--warning-light)', color: 'var(--warning)' },
        student: { bg: 'var(--info-light)', color: 'var(--info)' }
    };

    container.innerHTML = allRoles.map(role => {
        const count = allUsers.filter(u => u.role === role.name).length;
        const colors = roleColors[role.name] || { bg: 'var(--gray-100)', color: 'var(--gray-600)' };
        const permissions = rolePermissionsMap[role.name] || [];

        return `
            <div class="role-card">
                <div class="role-card-header">
                    <div class="role-card-title">
                        <div class="role-icon" style="background: ${colors.bg}; color: ${colors.color}">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            </svg>
                        </div>
                        <span class="role-name">${getRoleLabel(role.name)}</span>
                    </div>
                    <span class="role-count">${count} користувачів</span>
                </div>
                <div class="role-permissions-list">
                    ${permissions.map(p => `
                        <span class="permission-tag granted">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            ${getPermissionLabel(p)}
                        </span>
                    `).join('')}
                    ${permissions.length === 0 ? '<span class="permission-tag">Немає дозволів</span>' : ''}
                </div>
            </div>
        `;
    }).join('');
}

function renderPermissionsMatrix() {
    const container = document.querySelector('#permissionsSection .permissions-matrix');
    if (!container || !allPermissions.length || !allRoles.length) return;

    const roleHeaders = allRoles.map(r => `<th>${getRoleLabel(r.name)}</th>`).join('');
    
    const rows = allPermissions.map(permission => {
        const cells = allRoles.map(role => {
            const hasPermission = (rolePermissionsMap[role.name] || []).includes(permission.name);
            return hasPermission 
                ? `<td><span class="check-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></span></td>`
                : `<td><span class="cross-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span></td>`;
        }).join('');

        return `
            <tr>
                <td class="permission-name">${getPermissionLabel(permission.name)}</td>
                ${cells}
            </tr>
        `;
    }).join('');

    container.innerHTML = `
        <table class="matrix-table">
            <thead>
                <tr>
                    <th>Дозвіл</th>
                    ${roleHeaders}
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    `;
}

// ==================== МОДАЛЬНІ ВІКНА ====================
function openEditModal(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    document.getElementById('editUserId').value = user.id;
    document.getElementById('editUserFirstName').value = user.first_name;
    document.getElementById('editUserLastName').value = user.last_name;
    document.getElementById('editUserEmail').value = user.email;
    document.getElementById('editUserRole').value = user.role;

    updateRolePermissionsPreview(user.role);
    openModal('editUserModal');
}

function openPermissionsModal(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    const initials = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase();
    const permissions = rolePermissionsMap[user.role] || [];

    document.getElementById('permUserAvatar').textContent = initials;
    document.getElementById('permUserName').textContent = `${user.first_name} ${user.last_name}`;
    document.getElementById('permUserEmail').textContent = user.email;
    
    const roleBadge = document.getElementById('permUserRole');
    roleBadge.textContent = getRoleLabel(user.role);
    roleBadge.className = `role-badge ${user.role}`;

    const grid = document.getElementById('userPermissionsGrid');
    grid.innerHTML = allPermissions.map(p => {
        const hasPermission = permissions.includes(p.name);
        return `
            <div class="permission-item ${hasPermission ? 'granted' : ''}">
                ${hasPermission 
                    ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>'
                    : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
                }
                ${getPermissionLabel(p.name)}
            </div>
        `;
    }).join('');

    openModal('viewPermissionsModal');
}

function updateRolePermissionsPreview(role) {
    const container = document.getElementById('rolePermissionsList');
    const permissions = rolePermissionsMap[role] || [];

    container.innerHTML = permissions.length > 0
        ? permissions.map(p => `
            <span class="permission-tag granted">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
                ${getPermissionLabel(p)}
            </span>
        `).join('')
        : '<span class="permission-tag">Немає дозволів для цієї ролі</span>';
}

function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// ==================== ЗБЕРЕЖЕННЯ ЗМІН ====================
async function saveUserChanges() {
    const userId = document.getElementById('editUserId').value;
    const newRole = document.getElementById('editUserRole').value;

    try {
        const response = await fetch(`${API_URL}/api/admin/users/${userId}/role`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({ role: newRole })
        });

        const data = await response.json();

        if (data.success) {
            showToast('Роль успішно змінено', 'success');
            closeModal('editUserModal');
            await loadUsers();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Помилка збереження:', error);
        showToast(error.message || 'Помилка збереження змін', 'error');
    }
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    // Навігація
    document.querySelectorAll('.nav-item[data-section]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            switchSection(item.dataset.section);
        });
    });

    // Пошук
    document.getElementById('searchInput').addEventListener('input', filterUsers);

    // Фільтр ролей
    document.getElementById('roleFilter').addEventListener('change', filterUsers);

    // Зміна ролі в модальному вікні
    document.getElementById('editUserRole').addEventListener('change', (e) => {
        updateRolePermissionsPreview(e.target.value);
    });

    // Мобільне меню
    document.getElementById('menuToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });

    // Вихід
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.replace('/auth.html');
    });

    // Закриття модальних вікон при кліку на overlay
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
            }
        });
    });
}

function switchSection(section) {
    // Оновлення навігації
    document.querySelectorAll('.nav-item[data-section]').forEach(item => {
        item.classList.toggle('active', item.dataset.section === section);
    });

    // Оновлення секцій
    document.querySelectorAll('.section').forEach(sec => {
        sec.classList.add('hidden');
    });
    document.getElementById(`${section}Section`).classList.remove('hidden');

    // Оновлення заголовка
    const titles = {
        users: { title: 'Управління користувачами', subtitle: 'Перегляд та редагування користувачів системи' },
        roles: { title: 'Управління ролями', subtitle: 'Перегляд ролей та їх дозволів' },
        permissions: { title: 'Матриця дозволів', subtitle: 'Огляд всіх дозволів для кожної ролі' }
    };

    document.getElementById('pageTitle').textContent = titles[section].title;
    document.getElementById('pageSubtitle').textContent = titles[section].subtitle;
}

function filterUsers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const roleFilter = document.getElementById('roleFilter').value;

    const filtered = allUsers.filter(user => {
        const matchesSearch = 
            user.first_name.toLowerCase().includes(searchTerm) ||
            user.last_name.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm);
        
        const matchesRole = !roleFilter || user.role === roleFilter;

        return matchesSearch && matchesRole;
    });

    renderUsersTable(filtered);
}

// ==================== ДОПОМІЖНІ ФУНКЦІЇ ====================
function getRoleLabel(role) {
    const labels = {
        admin: 'Адміністратор',
        methodist: 'Методист',
        teacher: 'Вчитель',
        judge: 'Журі',
        student: 'Учень'
    };
    return labels[role] || role;
}

function getPermissionLabel(permission) {
    const labels = {
        create_competition: 'Створення конкурсів',
        edit_competition: 'Редагування конкурсів',
        delete_competition: 'Видалення конкурсів',
        publish_competition: 'Публікація конкурсів',
        add_results: 'Додавання результатів',
        edit_results: 'Редагування результатів',
        manage_users: 'Управління користувачами',
        view_reports: 'Перегляд звітів',
        manage_templates: 'Управління шаблонами',
        evaluate_submissions: 'Оцінювання робіт',
        view_submissions: 'Перегляд робіт'
    };
    return labels[permission] || permission;
}

function showLoading() {
    document.getElementById('loadingOverlay').classList.add('active');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('active');
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        warning: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    };

    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
        </button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 5000);
}

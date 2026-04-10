/**
 * JavaScript для сторінки управління правами доступу
 * Платформа: Єдина платформа конкурсів України
 */

// ==================== ГЛОБАЛЬНІ ЗМІННІ ====================
let currentUser = null;
let allRoles = [];
let pagePermissions = {};
let originalPermissions = {};
let hasUnsavedChanges = false;

// Визначення сторінок системи
const systemPages = [
    {
        id: 'dashboard',
        name: 'Головна панель',
        path: '/dashboard.html',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>`,
        description: 'Основна панель користувача'
    },
    {
        id: 'competitions',
        name: 'Конкурси',
        path: '/competitions.html',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
            <path d="M4 22h16"></path>
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
        </svg>`,
        description: 'Перегляд та управління конкурсами'
    },
    {
        id: 'users',
        name: 'Користувачі',
        path: '/users.html',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>`,
        description: 'Управління користувачами системи'
    },
    {
        id: 'permissions',
        name: 'Права доступу',
        path: '/permissions.html',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>`,
        description: 'Налаштування прав доступу до сторінок'
    },
    {
        id: 'logs',
        name: 'Логи системи',
        path: '/logs.html',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        </svg>`,
        description: 'Перегляд системних логів'
    }
];

// ==================== ІНІЦІАЛІЗАЦІЯ ====================
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});

/**
 * Перевірка авторизації та ролі admin
 */
async function checkAuth() {
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
        window.location.href = '/auth.html';
        return;
    }

    try {
        const response = await fetch('/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!data.success) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '/auth.html';
            return;
        }

        currentUser = data.user;

        // Перевірка ролі admin
        if (currentUser.role?.name !== 'admin' && currentUser.role !== 'admin') {
            showAccessDenied();
            return;
        }

        // Ініціалізація сторінки
        initPage();

    } catch (error) {
        console.error('Auth check error:', error);
        window.location.href = '/auth.html';
    }
}

/**
 * Показати сторінку заборони доступу
 */
function showAccessDenied() {
    document.getElementById('loadingOverlay').classList.add('hidden');
    document.getElementById('accessDeniedPage').style.display = 'flex';
    document.getElementById('adminLayout').style.display = 'none';
}

/**
 * Ініціалізація сторінки
 */
async function initPage() {
    // Показуємо адмін-панель
    document.getElementById('adminLayout').style.display = 'flex';

    // Рендеримо інформацію про користувача
    renderSidebarUser();

    // Завантажуємо ролі
    await loadRoles();

    // Завантажуємо права доступу
    await loadPagePermissions();

    // Приховуємо лоадер
    document.getElementById('loadingOverlay').classList.add('hidden');

    // Ініціалізація обробників подій
    initEventHandlers();
}

/**
 * Рендер інформації про користувача в сайдбарі
 */
function renderSidebarUser() {
    const sidebarUser = document.getElementById('sidebarUser');
    const initials = `${currentUser.first_name[0]}${currentUser.last_name[0]}`.toUpperCase();
    const roleName = currentUser.role?.display_name || currentUser.role_display_name || 'Адміністратор';

    sidebarUser.innerHTML = `
        <div class="user-avatar">${initials}</div>
        <div class="user-info">
            <div class="user-name">${currentUser.first_name} ${currentUser.last_name}</div>
            <div class="user-role">${roleName}</div>
        </div>
    `;
}

/**
 * Завантаження ролей
 */
async function loadRoles() {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/admin/roles', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.success) {
            allRoles = data.roles;
        } else {
            // Fallback ролі
            allRoles = getDefaultRoles();
        }
    } catch (error) {
        console.error('Load roles error:', error);
        allRoles = getDefaultRoles();
    }

    renderRoleHeaders();
    renderLegend();
}

/**
 * Отримати дефолтні ролі
 */
function getDefaultRoles() {
    return [
        { id: 1, name: 'student', display_name: 'Учень', description: 'Учасник конкурсів' },
        { id: 2, name: 'teacher', display_name: 'Вчитель', description: 'Керівник учнів' },
        { id: 3, name: 'methodist', display_name: 'Методист', description: 'Організатор конкурсів' },
        { id: 4, name: 'judge', display_name: 'Суддя', description: 'Оцінювач робіт' },
        { id: 5, name: 'admin', display_name: 'Адміністратор', description: 'Повний доступ до системи' }
    ];
}

/**
 * Рендер заголовків ролей в таблиці
 */
function renderRoleHeaders() {
    const thead = document.querySelector('.permissions-table thead tr');
    
    // Очищуємо існуючі заголовки ролей (залишаємо тільки перший th)
    const existingHeaders = thead.querySelectorAll('th:not(.page-column)');
    existingHeaders.forEach(th => th.remove());

    // Додаємо заголовки для кожної ролі
    allRoles.forEach(role => {
        const th = document.createElement('th');
        th.innerHTML = `
            <div class="role-header">
                <span class="role-badge ${role.name}">${role.display_name}</span>
            </div>
        `;
        thead.appendChild(th);
    });
}

/**
 * Рендер легенди
 */
function renderLegend() {
    const legendItems = document.getElementById('legendItems');
    legendItems.innerHTML = '';

    allRoles.forEach(role => {
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.innerHTML = `
            <span class="role-badge ${role.name}">${role.display_name}</span>
            <span class="legend-item-description">${role.description || ''}</span>
        `;
        legendItems.appendChild(item);
    });
}

/**
 * Завантаження прав доступу до сторінок
 */
async function loadPagePermissions() {
    const tableLoading = document.getElementById('tableLoading');
    const permissionsTableBody = document.getElementById('permissionsTableBody');

    tableLoading.style.display = 'flex';
    permissionsTableBody.innerHTML = '';

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/admin/page-permissions', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.success) {
            pagePermissions = data.permissions;
        } else {
            // Використовуємо дефолтні права
            pagePermissions = getDefaultPagePermissions();
        }
    } catch (error) {
        console.error('Load page permissions error:', error);
        pagePermissions = getDefaultPagePermissions();
    }

    // Зберігаємо оригінальні права для порівняння
    originalPermissions = JSON.parse(JSON.stringify(pagePermissions));

    renderPermissionsTable();
    tableLoading.style.display = 'none';
}

/**
 * Отримати дефолтні права доступу до сторінок
 */
function getDefaultPagePermissions() {
    return {
        'dashboard': ['student', 'teacher', 'methodist', 'judge', 'admin'],
        'competitions': ['student', 'teacher', 'methodist', 'judge', 'admin'],
        'users': ['admin'],
        'permissions': ['admin'],
        'logs': ['admin']
    };
}

/**
 * Рендер таблиці прав доступу
 */
function renderPermissionsTable() {
    const tbody = document.getElementById('permissionsTableBody');
    tbody.innerHTML = '';

    systemPages.forEach(page => {
        const tr = document.createElement('tr');
        
        // Клітинка з інформацією про сторінку
        let html = `
            <td class="page-cell">
                <div class="page-info">
                    <div class="page-icon">${page.icon}</div>
                    <div class="page-details">
                        <span class="page-name">${page.name}</span>
                        <span class="page-path">${page.path}</span>
                    </div>
                </div>
            </td>
        `;

        // Клітинки з чекбоксами для кожної ролі
        allRoles.forEach(role => {
            const isChecked = pagePermissions[page.id]?.includes(role.name) || false;
            const isAdminPage = page.id === 'permissions' || page.id === 'users' || page.id === 'logs';
            const isDisabled = role.name === 'admin' && isAdminPage; // Admin завжди має доступ до адмін сторінок

            html += `
                <td>
                    <input type="checkbox" 
                           class="permission-checkbox" 
                           data-page="${page.id}" 
                           data-role="${role.name}"
                           ${isChecked ? 'checked' : ''}
                           ${isDisabled ? 'disabled' : ''}
                           onchange="handlePermissionChange(this)">
                </td>
            `;
        });

        tr.innerHTML = html;
        tbody.appendChild(tr);
    });
}

/**
 * Обробка зміни права доступу
 */
function handlePermissionChange(checkbox) {
    const pageId = checkbox.dataset.page;
    const roleName = checkbox.dataset.role;

    if (!pagePermissions[pageId]) {
        pagePermissions[pageId] = [];
    }

    if (checkbox.checked) {
        if (!pagePermissions[pageId].includes(roleName)) {
            pagePermissions[pageId].push(roleName);
        }
    } else {
        pagePermissions[pageId] = pagePermissions[pageId].filter(r => r !== roleName);
    }

    // Перевіряємо чи є незбережені зміни
    checkForChanges();
}

/**
 * Перевірка наявності незбережених змін
 */
function checkForChanges() {
    const currentStr = JSON.stringify(pagePermissions);
    const originalStr = JSON.stringify(originalPermissions);
    hasUnsavedChanges = currentStr !== originalStr;

    const saveBtn = document.getElementById('savePermissionsBtn');
    if (hasUnsavedChanges) {
        saveBtn.classList.add('has-changes');
    } else {
        saveBtn.classList.remove('has-changes');
    }
}

/**
 * Збереження прав доступу
 */
async function savePermissions() {
    const saveBtn = document.getElementById('savePermissionsBtn');
    saveBtn.disabled = true;
    saveBtn.innerHTML = `
        <div class="loading-spinner small" style="width: 20px; height: 20px; border-width: 2px;"></div>
        Збереження...
    `;

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/admin/page-permissions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ permissions: pagePermissions })
        });

        const data = await response.json();

        if (data.success) {
            originalPermissions = JSON.parse(JSON.stringify(pagePermissions));
            hasUnsavedChanges = false;
            showToast('Права доступу успішно збережено', 'success');
        } else {
            showToast(data.message || 'Помилка збереження', 'error');
        }
    } catch (error) {
        console.error('Save permissions error:', error);
        // В mock режимі просто зберігаємо локально
        originalPermissions = JSON.parse(JSON.stringify(pagePermissions));
        hasUnsavedChanges = false;
        showToast('Права доступу збережено (локально)', 'success');
    }

    saveBtn.disabled = false;
    saveBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
        </svg>
        Зберегти зміни
    `;
    checkForChanges();
}

/**
 * Ініціалізація обробників подій
 */
function initEventHandlers() {
    // Кнопка збереження
    document.getElementById('savePermissionsBtn').addEventListener('click', savePermissions);

    // Кнопка оновлення
    document.getElementById('refreshBtn').addEventListener('click', async () => {
        const btn = document.getElementById('refreshBtn');
        btn.classList.add('spinning');
        await loadPagePermissions();
        btn.classList.remove('spinning');
        showToast('Дані оновлено', 'success');
    });

    // Вихід
    document.getElementById('logoutBtn').addEventListener('click', logout);

    // Мобільне меню
    document.getElementById('menuToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
        document.getElementById('sidebarOverlay').classList.toggle('active');
    });

    document.getElementById('sidebarOverlay').addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebarOverlay').classList.remove('active');
    });

    // Попередження про незбережені зміни
    window.addEventListener('beforeunload', (e) => {
        if (hasUnsavedChanges) {
            e.preventDefault();
            e.returnValue = '';
        }
    });
}

/**
 * Вихід з системи
 */
function logout() {
    if (hasUnsavedChanges) {
        if (!confirm('У вас є незбережені зміни. Ви впевнені, що хочете вийти?')) {
            return;
        }
    }
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/auth.html';
}

/**
 * Показати сповіщення
 */
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
        error: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
        warning: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
        info: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`
    };

    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="closeToast(this)">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    `;

    container.appendChild(toast);

    // Автоматичне закриття через 5 секунд
    setTimeout(() => {
        if (toast.parentNode) {
            toast.classList.add('hiding');
            setTimeout(() => toast.remove(), 300);
        }
    }, 5000);
}

/**
 * Закрити сповіщення
 */
function closeToast(btn) {
    const toast = btn.closest('.toast');
    toast.classList.add('hiding');
    setTimeout(() => toast.remove(), 300);
}

/**
 * Показати повідомлення "Не реалізовано"
 */
function showNotImplemented() {
    showToast('Ця функція ще в розробці', 'warning');
}

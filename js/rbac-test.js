/**
 * RBAC Test Page JavaScript
 * Платформа: Єдина платформа конкурсів України
 */

// API URL (змініть на ваш сервер)
const API_URL = window.location.origin;

// Глобальний об'єкт користувача
let currentUser = null;

// Всі можливі permissions для відображення
const ALL_PERMISSIONS = [
    'create_competition',
    'edit_competition',
    'delete_competition',
    'publish_competition',
    'add_results',
    'edit_results',
    'manage_users',
    'view_reports',
    'manage_templates',
    'evaluate_submissions',
    'view_submissions'
];

// ==================== ІНІЦІАЛІЗАЦІЯ ====================

document.addEventListener('DOMContentLoaded', () => {
    initPage();
});

/**
 * Ініціалізація сторінки
 */
async function initPage() {
    showLoading(true);
    
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        // Якщо немає токена, перенаправляємо на авторизацію
        window.location.href = '/auth.html';
        return;
    }
    
    try {
        // Завантажуємо дані користувача
        await loadUserData();
        
        // Якщо користувач admin - показуємо адмін панель
        if (currentUser && currentUser.role === 'admin') {
            document.getElementById('adminPanel').style.display = 'block';
            await loadAllUsers();
        }
    } catch (error) {
        console.error('Помилка ініціалізації:', error);
        showGlobalError('Не вдалося завантажити дані. Спробуйте оновити сторінку.');
    } finally {
        showLoading(false);
    }
}

// ==================== ЗАВАНТАЖЕННЯ ДАНИХ ====================

/**
 * Завантаження даних поточного користувача
 */
async function loadUserData() {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${API_URL}/api/me`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    const data = await response.json();
    
    if (!data.success) {
        // Токен невалідний
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/auth.html';
        return;
    }
    
    currentUser = data.user;
    
    // Оновлюємо UI
    renderUserInfo();
    renderPermissions();
}

/**
 * Завантаження всіх користувачів (для адміна)
 */
async function loadAllUsers() {
    const token = localStorage.getItem('authToken');
    
    try {
        const response = await fetch(`${API_URL}/api/admin/users`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            renderUsersTable(data.users);
        } else {
            document.getElementById('usersTableBody').innerHTML = 
                '<tr><td colspan="5" class="loading-cell">Помилка завантаження користувачів</td></tr>';
        }
    } catch (error) {
        console.error('Помилка завантаження користувачів:', error);
        document.getElementById('usersTableBody').innerHTML = 
            '<tr><td colspan="5" class="loading-cell">Помилка завантаження користувачів</td></tr>';
    }
}

// ==================== РЕНДЕРИНГ UI ====================

/**
 * Рендеринг інформації про користувача
 */
function renderUserInfo() {
    if (!currentUser) return;
    
    // Аватар (перші літери імені та прізвища)
    const initials = `${currentUser.first_name?.charAt(0) || ''}${currentUser.last_name?.charAt(0) || ''}`;
    document.getElementById('userAvatar').textContent = initials.toUpperCase();
    
    // Ім'я
    document.getElementById('userName').textContent = 
        `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() || 'Користувач';
    
    // Email
    document.getElementById('userEmail').textContent = currentUser.email || '--';
    
    // Роль
    const roleBadge = document.getElementById('userRoleBadge');
    const roleName = getRoleName(currentUser.role);
    roleBadge.textContent = roleName;
    roleBadge.className = `user-role-badge ${currentUser.role || ''}`;
}

/**
 * Рендеринг списку permissions
 */
function renderPermissions() {
    const permissionsList = document.getElementById('permissionsList');
    const userPermissions = currentUser?.permissions || [];
    
    permissionsList.innerHTML = ALL_PERMISSIONS.map(permission => {
        const hasPermission = userPermissions.includes(permission);
        const statusClass = hasPermission ? 'granted' : 'denied';
        const icon = hasPermission 
            ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>'
            : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
        
        return `
            <li class="permission-item ${statusClass}">
                <span class="permission-icon ${statusClass}">${icon}</span>
                <span class="permission-name">${permission}</span>
            </li>
        `;
    }).join('');
}

/**
 * Рендеринг таблиці користувачів
 */
function renderUsersTable(users) {
    const tbody = document.getElementById('usersTableBody');
    
    if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading-cell">Користувачів не знайдено</td></tr>';
        return;
    }
    
    const roles = ['student', 'teacher', 'methodist', 'admin', 'judge'];
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${user.first_name || ''} ${user.last_name || ''}</td>
            <td>${user.email}</td>
            <td>
                <select class="role-select" id="role-select-${user.id}" data-user-id="${user.id}" data-current-role="${user.role || 'student'}">
                    ${roles.map(role => 
                        `<option value="${role}" ${(user.role || 'student') === role ? 'selected' : ''}>${getRoleName(role)}</option>`
                    ).join('')}
                </select>
            </td>
            <td>
                <button class="save-role-btn" onclick="changeUserRole(${user.id})" id="save-btn-${user.id}">
                    Змінити
                </button>
            </td>
        </tr>
    `).join('');
}

// ==================== ACTIONS ====================

/**
 * Тестування дії (перевірка permission)
 */
function testAction(permission, actionName) {
    const hasPermission = currentUser?.permissions?.includes(permission) || false;
    
    const modal = document.getElementById('actionModal');
    const modalIcon = document.getElementById('modalIcon');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    
    if (hasPermission) {
        modalIcon.className = 'modal-icon granted';
        modalIcon.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
        modalTitle.textContent = 'Доступ дозволено';
        modalMessage.textContent = `Ви маєте право виконати дію "${actionName}"`;
    } else {
        modalIcon.className = 'modal-icon denied';
        modalIcon.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
        modalTitle.textContent = 'Доступ заборонено';
        modalMessage.textContent = `У вас немає права виконати дію "${actionName}"`;
    }
    
    modal.classList.add('active');
}

/**
 * Закриття модального вікна
 */
function closeModal() {
    document.getElementById('actionModal').classList.remove('active');
}

/**
 * Зміна ролі користувача (адмін)
 */
async function changeUserRole(userId) {
    const select = document.getElementById(`role-select-${userId}`);
    const button = document.getElementById(`save-btn-${userId}`);
    const newRole = select.value;
    const currentRole = select.dataset.currentRole;
    
    if (newRole === currentRole) {
        return;
    }
    
    button.disabled = true;
    button.textContent = 'Збереження...';
    
    const token = localStorage.getItem('authToken');
    
    try {
        const response = await fetch(`${API_URL}/api/admin/users/${userId}/role`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ role: newRole })
        });
        
        const data = await response.json();
        
        if (data.success) {
            select.dataset.currentRole = newRole;
            button.textContent = 'Збережено!';
            setTimeout(() => {
                button.textContent = 'Змінити';
                button.disabled = false;
            }, 1500);
            
            // Якщо змінили свою власну роль - оновлюємо сторінку
            if (userId === currentUser.id) {
                window.location.reload();
            }
        } else {
            showGlobalError(data.message || 'Помилка зміни ролі');
            button.textContent = 'Помилка';
            setTimeout(() => {
                button.textContent = 'Змінити';
                button.disabled = false;
            }, 1500);
        }
    } catch (error) {
        console.error('Помилка зміни ролі:', error);
        showGlobalError('Помилка з\'єднання з сервером');
        button.textContent = 'Помилка';
        setTimeout(() => {
            button.textContent = 'Змінити';
            button.disabled = false;
        }, 1500);
    }
}

/**
 * Перевірка чи користувач має permission
 */
function hasPermission(permissionName) {
    return currentUser?.permissions?.includes(permissionName) || false;
}

// ==================== УТИЛІТИ ====================

/**
 * Отримання назви ролі українською
 */
function getRoleName(role) {
    const roleNames = {
        'student': 'Учень',
        'teacher': 'Вчитель',
        'methodist': 'Методист',
        'admin': 'Адміністратор',
        'judge': 'Суддя'
    };
    return roleNames[role] || role || 'Невідомо';
}

/**
 * Показ/приховування loading overlay
 */
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
        overlay.classList.add('active');
    } else {
        overlay.classList.remove('active');
    }
}

/**
 * Показ глобальної помилки
 */
function showGlobalError(message) {
    const errorEl = document.getElementById('globalError');
    const errorText = document.getElementById('errorText');
    errorText.textContent = message;
    errorEl.classList.add('active');
    
    // Автоматично приховуємо через 5 секунд
    setTimeout(() => {
        hideGlobalError();
    }, 5000);
}

/**
 * Приховування глобальної помилки
 */
function hideGlobalError() {
    document.getElementById('globalError').classList.remove('active');
}

// Закриття модалки по кліку поза нею
document.getElementById('actionModal').addEventListener('click', (e) => {
    if (e.target.id === 'actionModal') {
        closeModal();
    }
});

// Закриття модалки по Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});

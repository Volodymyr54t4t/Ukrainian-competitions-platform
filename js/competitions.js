/**
 * Competitions JavaScript
 * Платформа: Єдина платформа конкурсів України
 * Реалізація: RBAC-based відображення конкурсів
 */

// ==================== ГЛОБАЛЬНІ ЗМІННІ ====================
let currentUser = null;
let userPermissions = [];
let competitions = [];
let currentFilters = {
    subject: 'all',
    level: 'all',
    status: 'all',
    search: ''
};

// ==================== КОНСТАНТИ ====================
const SUBJECTS = {
    mathematics: 'Математика',
    physics: 'Фізика',
    informatics: 'Інформатика',
    ukrainian: 'Українська мова',
    chemistry: 'Хімія',
    biology: 'Біологія',
    literature: 'Література',
    science: 'Природничі науки',
    history: 'Історія',
    geography: 'Географія',
    english: 'Англійська мова'
};

const LEVELS = {
    school: 'Шкільний',
    district: 'Районний',
    regional: 'Регіональний',
    national: 'Всеукраїнський',
    international: 'Міжнародний'
};

const STATUSES = {
    draft: 'Чернетка',
    active: 'Активний',
    completed: 'Завершений',
    cancelled: 'Скасований'
};

// ==================== SVG ICONS ====================
const ICONS = {
    trophy: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>',
    'plus-circle': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>',
    search: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
    calendar: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
    users: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
    edit: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>',
    eye: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>',
    trash: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>',
    x: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
    'check-circle': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
    'alert-circle': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
    info: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
    'file-text': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
    filter: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>',
    refresh: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>',
    'clipboard-check': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><path d="m9 14 2 2 4-4"></path></svg>'
};

// ==================== ІНІЦІАЛІЗАЦІЯ ====================
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        window.location.href = '/auth.html';
        return;
    }

    try {
        await loadCurrentUser();
        renderPage();
        await loadCompetitions();
        setupEventListeners();
        hideLoading();
    } catch (error) {
        console.error('Помилка ініціалізації:', error);
        showError('Помилка завантаження даних');
    }
}

// ==================== API ФУНКЦІЇ ====================
async function loadCurrentUser() {
    const token = localStorage.getItem('authToken');
    const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
        throw new Error('Unauthorized');
    }

    const data = await response.json();
    console.log('[v0] Auth/me response:', data);
    if (data.success) {
        currentUser = data.user;
        console.log('[v0] Current user:', currentUser);
        console.log('[v0] User role object:', currentUser.role);
        userPermissions = data.user.permissions?.map(p => p.name) || [];
        console.log('[v0] User permissions:', userPermissions);
    } else {
        throw new Error(data.message);
    }
}

async function loadCompetitions() {
    const token = localStorage.getItem('authToken');
    const params = new URLSearchParams();
    
    if (currentFilters.subject !== 'all') params.append('subject', currentFilters.subject);
    if (currentFilters.level !== 'all') params.append('level', currentFilters.level);
    if (currentFilters.status !== 'all') params.append('status', currentFilters.status);
    if (currentFilters.search) params.append('search', currentFilters.search);

    showGridLoading();

    try {
        const response = await fetch(`/api/competitions?${params.toString()}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        console.log('[v0] Competitions API response:', data);
        console.log('[v0] Competitions count:', data.competitions?.length);
        if (data.success) {
            competitions = data.competitions;
            const roleName = currentUser.role?.name || currentUser.role || 'student';
            console.log('[v0] User role for rendering:', roleName);
            renderCompetitions(roleName);
        } else {
            showToast('Помилка завантаження конкурсів', 'error');
        }
    } catch (error) {
        console.error('Помилка завантаження конкурсів:', error);
        showToast('Помилка з\'єднання з сервером', 'error');
    }
}

async function applyToCompetition(competitionId) {
    const token = localStorage.getItem('authToken');
    
    try {
        const response = await fetch(`/api/competitions/${competitionId}/apply`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        if (data.success) {
            showToast('Заявку успішно подано!', 'success');
            await loadCompetitions();
        } else {
            showToast(data.message || 'Помилка подання заявки', 'error');
        }
    } catch (error) {
        console.error('Помилка подання заявки:', error);
        showToast('Помилка з\'єднання з сервером', 'error');
    }
}

async function createCompetition(formData) {
    const token = localStorage.getItem('authToken');
    
    try {
        const response = await fetch('/api/competitions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        if (data.success) {
            showToast('Конкурс успішно створено!', 'success');
            closeModal('createModal');
            await loadCompetitions();
        } else {
            showToast(data.message || 'Помилка створення конкурсу', 'error');
        }
    } catch (error) {
        console.error('Помилка створення конкурсу:', error);
        showToast('Помилка з\'єднання з сервером', 'error');
    }
}

async function deleteCompetition(competitionId) {
    if (!confirm('Ви впевнені, що хочете видалити цей конкурс?')) return;
    
    const token = localStorage.getItem('authToken');
    
    try {
        const response = await fetch(`/api/competitions/${competitionId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        if (data.success) {
            showToast('Конкурс успішно видалено!', 'success');
            await loadCompetitions();
        } else {
            showToast(data.message || 'Помилка видалення конкурсу', 'error');
        }
    } catch (error) {
        console.error('Помилка видалення конкурсу:', error);
        showToast('Помилка з\'єднання з сервером', 'error');
    }
}

// ==================== РЕНДЕРИНГ ====================
function renderPage() {
    const role = currentUser.role?.name || 'student';
    
    // Render page header based on role
    renderPageHeader(role);
    
    // Render filters
    renderFilters();
    
    // Update user info in sidebar
    renderSidebarUser();
}

function renderPageHeader(role) {
    const headerActions = document.getElementById('headerActions');
    if (!headerActions) return;

    let actionsHTML = '';

    // Create competition button - check permission
    if (hasPermission('create_competition')) {
        actionsHTML += `
            <button class="btn btn-primary" onclick="openCreateModal()">
                ${ICONS['plus-circle']}
                <span>Створити конкурс</span>
            </button>
        `;
    }

    // Export button for methodist/admin
    if (role === 'methodist' || role === 'admin') {
        actionsHTML += `
            <button class="btn btn-secondary" onclick="exportCompetitions()">
                ${ICONS['file-text']}
                <span>Експорт</span>
            </button>
        `;
    }

    headerActions.innerHTML = actionsHTML;
}

function renderFilters() {
    const filtersSection = document.getElementById('filtersSection');
    if (!filtersSection) return;

    // Build subject options
    let subjectOptions = '<option value="all">Всі предмети</option>';
    for (const [key, value] of Object.entries(SUBJECTS)) {
        subjectOptions += `<option value="${key}">${value}</option>`;
    }

    // Build level options
    let levelOptions = '<option value="all">Всі рівні</option>';
    for (const [key, value] of Object.entries(LEVELS)) {
        levelOptions += `<option value="${key}">${value}</option>`;
    }

    // Build status options based on role
    const role = currentUser.role?.name || 'student';
    let statusOptions = '<option value="all">Всі статуси</option>';
    
    if (role !== 'student') {
        for (const [key, value] of Object.entries(STATUSES)) {
            statusOptions += `<option value="${key}">${value}</option>`;
        }
    }

    filtersSection.innerHTML = `
        <div class="filters-row">
            <div class="filter-group search-wrapper">
                ${ICONS.search}
                <input type="text" class="filter-input" id="searchInput" placeholder="Пошук конкурсів..." value="${currentFilters.search}">
            </div>
            <div class="filter-group">
                <label>Предмет</label>
                <select class="filter-select" id="subjectFilter">${subjectOptions}</select>
            </div>
            <div class="filter-group">
                <label>Рівень</label>
                <select class="filter-select" id="levelFilter">${levelOptions}</select>
            </div>
            ${role !== 'student' ? `
            <div class="filter-group">
                <label>Статус</label>
                <select class="filter-select" id="statusFilter">${statusOptions}</select>
            </div>
            ` : ''}
            <div class="filter-actions">
                <button class="btn btn-secondary btn-sm" onclick="resetFilters()">
                    ${ICONS.refresh}
                </button>
            </div>
        </div>
    `;

    // Add event listeners
    document.getElementById('searchInput')?.addEventListener('input', debounce(handleSearch, 300));
    document.getElementById('subjectFilter')?.addEventListener('change', handleFilterChange);
    document.getElementById('levelFilter')?.addEventListener('change', handleFilterChange);
    document.getElementById('statusFilter')?.addEventListener('change', handleFilterChange);
}

function renderCompetitions(role) {
    const grid = document.getElementById('competitionsGrid');
    if (!grid) return;

    if (competitions.length === 0) {
        grid.innerHTML = renderEmptyState();
        return;
    }

    let html = '';
    competitions.forEach(competition => {
        html += renderCompetitionCard(competition, role);
    });

    grid.innerHTML = html;

    // Update stats
    updateStats();
}

function renderCompetitionCard(competition, role) {
    const statusClass = competition.status || 'draft';
    const subjectClass = competition.subject || 'mathematics';
    const levelClass = competition.level || 'school';

    // Format dates
    const startDate = formatDate(competition.start_date);
    const endDate = formatDate(competition.end_date);

    // Build action buttons based on role
    let actionButtons = '';

    if (role === 'student') {
        actionButtons = `
            <button class="btn btn-secondary btn-sm" onclick="viewCompetition(${competition.id})">
                ${ICONS.eye} Переглянути
            </button>
            ${competition.status === 'active' ? `
                <button class="btn btn-accent btn-sm" onclick="goToApply(${competition.id})">
                    Подати заявку
                </button>
            ` : ''}
        `;
    } else if (role === 'teacher') {
        actionButtons = `
            <button class="btn btn-secondary btn-sm" onclick="viewCompetition(${competition.id})">
                ${ICONS.eye}
            </button>
            ${hasPermission('edit_competition') ? `
                <button class="btn btn-secondary btn-sm" onclick="editCompetition(${competition.id})">
                    ${ICONS.edit}
                </button>
            ` : ''}
        `;
    } else if (role === 'methodist' || role === 'admin') {
        actionButtons = `
            <button class="btn btn-secondary btn-sm" onclick="viewCompetition(${competition.id})">
                ${ICONS.eye}
            </button>
            <button class="btn btn-secondary btn-sm" onclick="editCompetition(${competition.id})">
                ${ICONS.edit}
            </button>
            ${hasPermission('delete_competition') ? `
                <button class="btn btn-secondary btn-sm" onclick="deleteCompetition(${competition.id})" style="color: var(--error);">
                    ${ICONS.trash}
                </button>
            ` : ''}
        `;
    } else if (role === 'judge') {
        actionButtons = `
            <button class="btn btn-primary btn-sm" onclick="viewCompetition(${competition.id})">
                ${ICONS['clipboard-check']} Оцінити
            </button>
        `;
    } else {
        actionButtons = `
            <button class="btn btn-secondary btn-sm" onclick="viewCompetition(${competition.id})">
                Детальніше
            </button>
        `;
    }

    return `
        <div class="competition-card" data-id="${competition.id}">
            <div class="card-header-banner ${subjectClass}"></div>
            <div class="card-body">
                <div class="card-badges">
                    <span class="badge badge-status ${statusClass}">${STATUSES[competition.status] || 'Чернетка'}</span>
                    <span class="badge badge-level ${levelClass}">${LEVELS[competition.level] || 'Шкільний'}</span>
                    <span class="badge badge-subject">${SUBJECTS[competition.subject] || competition.subject}</span>
                </div>
                <h3 class="card-title">${escapeHtml(competition.title)}</h3>
                <p class="card-description">${escapeHtml(competition.description || 'Опис відсутній')}</p>
                <div class="card-meta">
                    <div class="meta-item">
                        ${ICONS.calendar}
                        <span><strong>${startDate}</strong> - <strong>${endDate}</strong></span>
                    </div>
                    <div class="meta-item">
                        ${ICONS.users}
                        <span>Макс. учасників: <strong>${competition.max_participants || 100}</strong></span>
                    </div>
                </div>
            </div>
            <div class="card-footer">
                <div class="participants-count">
                    ${ICONS.users}
                    <span>${competition.applications_count || 0} заявок</span>
                </div>
                <div class="card-actions">
                    ${actionButtons}
                </div>
            </div>
        </div>
    `;
}

function renderEmptyState() {
    return `
        <div class="empty-state">
            <div class="empty-state-icon">
                ${ICONS.trophy}
            </div>
            <h3>Конкурсів не знайдено</h3>
            <p>Спробуйте змінити фільтри або створіть новий конкурс</p>
            ${hasPermission('create_competition') ? `
                <button class="btn btn-primary" onclick="openCreateModal()">
                    ${ICONS['plus-circle']} Створити конкурс
                </button>
            ` : ''}
        </div>
    `;
}

function renderSidebarUser() {
    const sidebarUser = document.getElementById('sidebarUser');
    if (!sidebarUser || !currentUser) return;

    const initials = `${currentUser.first_name?.[0] || ''}${currentUser.last_name?.[0] || ''}`.toUpperCase();
    const roleDisplay = currentUser.role?.display_name || 'Користувач';

    sidebarUser.innerHTML = `
        <div class="user-avatar">${initials}</div>
        <div class="user-info">
            <div class="user-name">${currentUser.first_name} ${currentUser.last_name}</div>
            <div class="user-role">${roleDisplay}</div>
        </div>
    `;

    // Show "My Applications" link for students
    const roleName = currentUser.role?.name || currentUser.role || 'student';
    if (roleName === 'student') {
        const navMyApps = document.getElementById('navMyApplications');
        if (navMyApps) navMyApps.style.display = 'flex';
    }
}

function showGridLoading() {
    const grid = document.getElementById('competitionsGrid');
    if (!grid) return;

    grid.innerHTML = `
        <div class="competitions-loading">
            <div class="loading-spinner"></div>
            <p>Завантаження конкурсів...</p>
        </div>
    `;
}

function updateStats() {
    const statsBar = document.getElementById('statsBar');
    if (!statsBar) return;

    const active = competitions.filter(c => c.status === 'active').length;
    const draft = competitions.filter(c => c.status === 'draft').length;
    const completed = competitions.filter(c => c.status === 'completed').length;
    const total = competitions.length;

    statsBar.innerHTML = `
        <div class="stat-item">
            <span class="stat-value">${total}</span>
            <span class="stat-label">Всього</span>
        </div>
        <div class="stat-item">
            <span class="stat-value">${active}</span>
            <span class="stat-label">Активних</span>
        </div>
        ${currentUser.role?.name !== 'student' ? `
            <div class="stat-item">
                <span class="stat-value">${draft}</span>
                <span class="stat-label">Чернеток</span>
            </div>
        ` : ''}
        <div class="stat-item">
            <span class="stat-value">${completed}</span>
            <span class="stat-label">Завершених</span>
        </div>
    `;
}

// ==================== МОДАЛЬНІ ВІКНА ====================
function openCreateModal() {
    if (!hasPermission('create_competition')) {
        showToast('У вас немає прав для створення конкурсів', 'error');
        return;
    }

    // Build subject options
    let subjectOptions = '';
    for (const [key, value] of Object.entries(SUBJECTS)) {
        subjectOptions += `<option value="${key}">${value}</option>`;
    }

    // Build level options
    let levelOptions = '';
    for (const [key, value] of Object.entries(LEVELS)) {
        levelOptions += `<option value="${key}">${value}</option>`;
    }

    const modalHTML = `
        <div class="modal-overlay active" id="createModal" onclick="closeModalOnOverlay(event, 'createModal')">
            <div class="modal" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h2>Створити конкурс</h2>
                    <button class="modal-close" onclick="closeModal('createModal')">
                        ${ICONS.x}
                    </button>
                </div>
                <div class="modal-body">
                    <form id="createCompetitionForm">
                        <div class="form-group">
                            <label>Назва конкурсу <span>*</span></label>
                            <input type="text" class="form-control" name="title" required placeholder="Введіть назву конкурсу">
                        </div>
                        <div class="form-group">
                            <label>Опис</label>
                            <textarea class="form-control" name="description" placeholder="Опис конкурсу..."></textarea>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Предмет <span>*</span></label>
                                <select class="form-control" name="subject" required>${subjectOptions}</select>
                            </div>
                            <div class="form-group">
                                <label>Рівень <span>*</span></label>
                                <select class="form-control" name="level" required>${levelOptions}</select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Дата початку <span>*</span></label>
                                <input type="date" class="form-control" name="start_date" required>
                            </div>
                            <div class="form-group">
                                <label>Дата завершення <span>*</span></label>
                                <input type="date" class="form-control" name="end_date" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Максимальна кількість учасників</label>
                            <input type="number" class="form-control" name="max_participants" value="100" min="1">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal('createModal')">Скасувати</button>
                    <button class="btn btn-primary" onclick="submitCreateForm()">Створити</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function goToApply(id) {
    window.location.href = `/competition.html?id=${id}`;
}

function viewCompetition(id) {
    const competition = competitions.find(c => c.id === id);
    if (!competition) return;

    // For students, redirect to detail page
    const roleName = currentUser.role?.name || currentUser.role || 'student';
    if (roleName === 'student') {
        window.location.href = `/competition.html?id=${id}`;
        return;
    }

    const startDate = formatDate(competition.start_date);
    const endDate = formatDate(competition.end_date);
    const creatorName = competition.creator_first_name && competition.creator_last_name
        ? `${competition.creator_first_name} ${competition.creator_last_name}`
        : 'Невідомо';

    const modalHTML = `
        <div class="modal-overlay active" id="viewModal" onclick="closeModalOnOverlay(event, 'viewModal')">
            <div class="modal" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h2>${escapeHtml(competition.title)}</h2>
                    <button class="modal-close" onclick="closeModal('viewModal')">
                        ${ICONS.x}
                    </button>
                </div>
                <div class="modal-body">
                    <div class="card-badges" style="margin-bottom: 1.5rem;">
                        <span class="badge badge-status ${competition.status}">${STATUSES[competition.status] || 'Чернетка'}</span>
                        <span class="badge badge-level ${competition.level}">${LEVELS[competition.level] || 'Шкільний'}</span>
                        <span class="badge badge-subject">${SUBJECTS[competition.subject] || competition.subject}</span>
                    </div>
                    
                    <div class="detail-section">
                        <h4>Опис</h4>
                        <div class="detail-content">
                            ${escapeHtml(competition.description || 'Опис відсутній')}
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h4>Деталі</h4>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <span class="label">Дата початку</span>
                                <span class="value">${startDate}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Дата завершення</span>
                                <span class="value">${endDate}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Макс. учасників</span>
                                <span class="value">${competition.max_participants || 100}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Поточні заявки</span>
                                <span class="value">${competition.applications_count || 0}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Автор</span>
                                <span class="value">${escapeHtml(creatorName)}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal('viewModal')">Закрити</button>
                    ${currentUser.role?.name === 'student' && competition.status === 'active' ? `
                        <button class="btn btn-accent" onclick="closeModal('viewModal'); applyToCompetition(${competition.id})">
                            Подати заявку
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function editCompetition(id) {
    const competition = competitions.find(c => c.id === id);
    if (!competition) return;

    // Build subject options
    let subjectOptions = '';
    for (const [key, value] of Object.entries(SUBJECTS)) {
        const selected = competition.subject === key ? 'selected' : '';
        subjectOptions += `<option value="${key}" ${selected}>${value}</option>`;
    }

    // Build level options
    let levelOptions = '';
    for (const [key, value] of Object.entries(LEVELS)) {
        const selected = competition.level === key ? 'selected' : '';
        levelOptions += `<option value="${key}" ${selected}>${value}</option>`;
    }

    // Build status options
    let statusOptions = '';
    for (const [key, value] of Object.entries(STATUSES)) {
        const selected = competition.status === key ? 'selected' : '';
        statusOptions += `<option value="${key}" ${selected}>${value}</option>`;
    }

    const modalHTML = `
        <div class="modal-overlay active" id="editModal" onclick="closeModalOnOverlay(event, 'editModal')">
            <div class="modal" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h2>Редагувати конкурс</h2>
                    <button class="modal-close" onclick="closeModal('editModal')">
                        ${ICONS.x}
                    </button>
                </div>
                <div class="modal-body">
                    <form id="editCompetitionForm" data-id="${competition.id}">
                        <div class="form-group">
                            <label>Назва конкурсу <span>*</span></label>
                            <input type="text" class="form-control" name="title" required value="${escapeHtml(competition.title)}">
                        </div>
                        <div class="form-group">
                            <label>Опис</label>
                            <textarea class="form-control" name="description">${escapeHtml(competition.description || '')}</textarea>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Предмет <span>*</span></label>
                                <select class="form-control" name="subject" required>${subjectOptions}</select>
                            </div>
                            <div class="form-group">
                                <label>Рівень <span>*</span></label>
                                <select class="form-control" name="level" required>${levelOptions}</select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Дата початку <span>*</span></label>
                                <input type="date" class="form-control" name="start_date" required value="${competition.start_date?.split('T')[0] || ''}">
                            </div>
                            <div class="form-group">
                                <label>Дата завершення <span>*</span></label>
                                <input type="date" class="form-control" name="end_date" required value="${competition.end_date?.split('T')[0] || ''}">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Максимальна кількість учасників</label>
                                <input type="number" class="form-control" name="max_participants" value="${competition.max_participants || 100}" min="1">
                            </div>
                            <div class="form-group">
                                <label>Статус</label>
                                <select class="form-control" name="status">${statusOptions}</select>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal('editModal')">Скасувати</button>
                    <button class="btn btn-primary" onclick="submitEditForm()">Зберегти</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

function closeModalOnOverlay(event, modalId) {
    if (event.target.classList.contains('modal-overlay')) {
        closeModal(modalId);
    }
}

async function submitCreateForm() {
    const form = document.getElementById('createCompetitionForm');
    if (!form) return;

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    if (!data.title || !data.subject || !data.level || !data.start_date || !data.end_date) {
        showToast('Заповніть всі обов\'язкові поля', 'error');
        return;
    }

    await createCompetition(data);
}

async function submitEditForm() {
    const form = document.getElementById('editCompetitionForm');
    if (!form) return;

    const competitionId = form.dataset.id;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const token = localStorage.getItem('authToken');

    try {
        const response = await fetch(`/api/competitions/${competitionId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (result.success) {
            showToast('Конкурс успішно оновлено!', 'success');
            closeModal('editModal');
            await loadCompetitions();
        } else {
            showToast(result.message || 'Помилка оновлення конкурсу', 'error');
        }
    } catch (error) {
        console.error('Помилка оновлення конкурсу:', error);
        showToast('Помилка з\'єднання з сервером', 'error');
    }
}

// ==================== ФІЛЬТРИ ====================
function handleSearch(event) {
    currentFilters.search = event.target.value;
    loadCompetitions();
}

function handleFilterChange() {
    currentFilters.subject = document.getElementById('subjectFilter')?.value || 'all';
    currentFilters.level = document.getElementById('levelFilter')?.value || 'all';
    currentFilters.status = document.getElementById('statusFilter')?.value || 'all';
    loadCompetitions();
}

function resetFilters() {
    currentFilters = { subject: 'all', level: 'all', status: 'all', search: '' };
    renderFilters();
    loadCompetitions();
}

// ==================== УТИЛІТИ ====================
function hasPermission(permissionName) {
    return userPermissions.includes(permissionName);
}

function formatDate(dateString) {
    if (!dateString) return 'Не вказано';
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

function showError(message) {
    document.body.innerHTML = `
        <div class="error-page">
            <div class="error-icon">
                ${ICONS['alert-circle']}
            </div>
            <h1 class="error-title">Помилка</h1>
            <p class="error-message">${message}</p>
            <button class="error-btn" onclick="window.location.href='/auth.html'">
                Повернутися до входу
            </button>
        </div>
    `;
}

function showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const iconMap = {
        success: ICONS['check-circle'],
        error: ICONS['alert-circle'],
        info: ICONS.info
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${iconMap[type]}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">
            ${ICONS.x}
        </button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

function exportCompetitions() {
    showToast('Функція експорту в розробці', 'info');
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    // Logout button
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/auth.html';
    });

    // Mobile menu toggle
    document.getElementById('menuToggle')?.addEventListener('click', () => {
        document.getElementById('sidebar')?.classList.toggle('open');
        document.getElementById('sidebarOverlay')?.classList.toggle('active');
    });

    document.getElementById('sidebarOverlay')?.addEventListener('click', () => {
        document.getElementById('sidebar')?.classList.remove('open');
        document.getElementById('sidebarOverlay')?.classList.remove('active');
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal-overlay.active');
            modals.forEach(modal => closeModal(modal.id));
        }
    });
}

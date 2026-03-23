/**
 * My Applications JavaScript
 * Платформа: Єдина платформа конкурсів України
 */

// ==================== ГЛОБАЛЬНІ ЗМІННІ ====================
let currentUser = null;
let applications = [];
let currentFilter = 'all';

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

const APPLICATION_STATUSES = {
    submitted: { label: 'Подано', icon: 'send' },
    under_review: { label: 'На розгляді', icon: 'clock' },
    pending: { label: 'Очікує', icon: 'clock' },
    accepted: { label: 'Прийнято', icon: 'check-circle' },
    approved: { label: 'Схвалено', icon: 'check-circle' },
    rejected: { label: 'Відхилено', icon: 'x-circle' }
};

const ICONS = {
    'send': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>',
    'clock': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
    'check-circle': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
    'x-circle': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
    'calendar': '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
    'folder': '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>',
    'file': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>',
    'eye': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>',
    'trophy': '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>'
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
        
        // Check if user is a student
        const roleName = currentUser.role?.name || currentUser.role;
        if (roleName !== 'student') {
            window.location.href = '/dashboard.html';
            return;
        }
        
        await loadApplications();
        renderPage();
        setupEventListeners();
        hideLoading();
    } catch (error) {
        console.error('Помилка ініціалізації:', error);
        showToast('Помилка завантаження даних', 'error');
    }
}

// ==================== API ФУНКЦІЇ ====================
async function loadCurrentUser() {
    const token = localStorage.getItem('authToken');
    const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Unauthorized');

    const data = await response.json();
    if (data.success) {
        currentUser = data.user;
    } else {
        throw new Error(data.message);
    }
}

async function loadApplications() {
    const token = localStorage.getItem('authToken');
    const response = await fetch('/api/my-applications', {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    if (data.success) {
        applications = data.applications;
    } else {
        throw new Error(data.message || 'Помилка завантаження заявок');
    }
}

// ==================== РЕНДЕРИНГ ====================
function renderPage() {
    renderSidebarUser();
    renderStats();
    renderApplications();
}

function renderSidebarUser() {
    const sidebarUser = document.getElementById('sidebarUser');
    if (!sidebarUser || !currentUser) return;

    const initials = (currentUser.first_name?.charAt(0) || '') + (currentUser.last_name?.charAt(0) || '');
    const roleName = currentUser.role?.display_name || currentUser.role_display_name || 'Користувач';

    sidebarUser.innerHTML = `
        <div class="user-avatar">${initials.toUpperCase()}</div>
        <div class="user-info">
            <div class="user-name">${escapeHtml(currentUser.first_name)} ${escapeHtml(currentUser.last_name)}</div>
            <div class="user-role">${escapeHtml(roleName)}</div>
        </div>
    `;
}

function renderStats() {
    const container = document.getElementById('statsCards');
    if (!container) return;

    const stats = {
        total: applications.length,
        pending: applications.filter(a => ['submitted', 'under_review', 'pending'].includes(a.status)).length,
        accepted: applications.filter(a => ['accepted', 'approved'].includes(a.status)).length,
        rejected: applications.filter(a => a.status === 'rejected').length
    };

    container.innerHTML = `
        <div class="stat-card">
            <div class="stat-card-header">
                <span class="stat-card-label">Всього заявок</span>
                <div class="stat-card-icon blue">${ICONS['send']}</div>
            </div>
            <div class="stat-card-value">${stats.total}</div>
        </div>
        <div class="stat-card">
            <div class="stat-card-header">
                <span class="stat-card-label">На розгляді</span>
                <div class="stat-card-icon yellow">${ICONS['clock']}</div>
            </div>
            <div class="stat-card-value">${stats.pending}</div>
        </div>
        <div class="stat-card">
            <div class="stat-card-header">
                <span class="stat-card-label">Прийнято</span>
                <div class="stat-card-icon green">${ICONS['check-circle']}</div>
            </div>
            <div class="stat-card-value">${stats.accepted}</div>
        </div>
        <div class="stat-card">
            <div class="stat-card-header">
                <span class="stat-card-label">Відхилено</span>
                <div class="stat-card-icon red">${ICONS['x-circle']}</div>
            </div>
            <div class="stat-card-value">${stats.rejected}</div>
        </div>
    `;
}

function renderApplications() {
    const container = document.getElementById('applicationsList');
    if (!container) return;

    // Filter applications
    let filteredApps = applications;
    if (currentFilter !== 'all') {
        if (currentFilter === 'under_review') {
            filteredApps = applications.filter(a => ['under_review', 'pending'].includes(a.status));
        } else if (currentFilter === 'accepted') {
            filteredApps = applications.filter(a => ['accepted', 'approved'].includes(a.status));
        } else {
            filteredApps = applications.filter(a => a.status === currentFilter);
        }
    }

    if (filteredApps.length === 0) {
        container.innerHTML = renderEmptyState();
        return;
    }

    container.innerHTML = filteredApps.map(app => renderApplicationCard(app)).join('');
}

function renderApplicationCard(app) {
    const statusInfo = APPLICATION_STATUSES[app.status] || { label: app.status, icon: 'send' };
    const statusIcon = ICONS[statusInfo.icon] || ICONS['send'];
    
    const competitionTitle = app.competition_title || 'Назва конкурсу';
    const subject = SUBJECTS[app.competition_subject] || app.competition_subject || '';
    const level = LEVELS[app.competition_level] || app.competition_level || '';

    return `
        <div class="application-card">
            <div class="application-card-header">
                <div class="application-info">
                    <div class="application-competition">${escapeHtml(competitionTitle)}</div>
                    <div class="application-title">${escapeHtml(app.title || 'Без назви')}</div>
                    <div class="application-meta">
                        ${app.section_name ? `
                            <div class="application-meta-item">
                                ${ICONS['folder']}
                                <span>${escapeHtml(app.section_name)}</span>
                            </div>
                        ` : ''}
                        ${subject ? `
                            <div class="application-meta-item">
                                <span>${escapeHtml(subject)}</span>
                            </div>
                        ` : ''}
                        ${level ? `
                            <div class="application-meta-item">
                                <span>${escapeHtml(level)}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="application-status-badge ${app.status}">
                    ${statusIcon}
                    <span>${statusInfo.label}</span>
                </div>
            </div>
            ${app.description ? `
                <div class="application-card-body">
                    <p class="application-description">${escapeHtml(app.description)}</p>
                    ${app.file_path ? `
                        <a href="${app.file_path}" class="application-file" target="_blank" download>
                            ${ICONS['file']}
                            <span>${escapeHtml(app.file_name || 'Завантажити файл')}</span>
                        </a>
                    ` : ''}
                </div>
            ` : (app.file_path ? `
                <div class="application-card-body">
                    <a href="${app.file_path}" class="application-file" target="_blank" download>
                        ${ICONS['file']}
                        <span>${escapeHtml(app.file_name || 'Завантажити файл')}</span>
                    </a>
                </div>
            ` : '')}
            <div class="application-card-footer">
                <div class="application-date">
                    ${ICONS['calendar']}
                    <span>Подано: ${formatDate(app.created_at)}</span>
                </div>
                <div class="application-actions">
                    <a href="/competition.html?id=${app.competition_id}" class="btn btn-secondary btn-sm">
                        ${ICONS['eye']}
                        <span>Переглянути конкурс</span>
                    </a>
                </div>
            </div>
        </div>
    `;
}

function renderEmptyState() {
    return `
        <div class="empty-state">
            <div class="empty-state-icon">
                ${ICONS['trophy']}
            </div>
            <h3>${currentFilter === 'all' ? 'У вас ще немає заявок' : 'Заявок з таким статусом не знайдено'}</h3>
            <p>${currentFilter === 'all' ? 'Перегляньте доступні конкурси та подайте свою першу заявку!' : 'Спробуйте змінити фільтр або перегляньте всі заявки'}</p>
            ${currentFilter === 'all' ? `
                <a href="/competitions.html" class="btn btn-primary" style="margin-top: 1rem;">
                    Переглянути конкурси
                </a>
            ` : ''}
        </div>
    `;
}

// ==================== EVENT HANDLERS ====================
function setupEventListeners() {
    // Sidebar toggle
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    menuToggle?.addEventListener('click', () => {
        sidebar?.classList.toggle('open');
        sidebarOverlay?.classList.toggle('active');
    });

    sidebarOverlay?.addEventListener('click', () => {
        sidebar?.classList.remove('open');
        sidebarOverlay?.classList.remove('active');
    });

    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/auth.html';
    });

    // Filter tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.dataset.filter;
            renderApplications();
        });
    });
}

// ==================== ДОПОМІЖНІ ФУНКЦІЇ ====================
function formatDate(dateStr) {
    if (!dateStr) return 'Не вказано';
    const date = new Date(dateStr);
    return date.toLocaleDateString('uk-UA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function hideLoading() {
    document.getElementById('loadingOverlay')?.classList.add('hidden');
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = ICONS['send'];
    if (type === 'success') icon = ICONS['check-circle'];
    if (type === 'error') icon = ICONS['x-circle'];

    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-message">${escapeHtml(message)}</div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
    `;

    container.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
}

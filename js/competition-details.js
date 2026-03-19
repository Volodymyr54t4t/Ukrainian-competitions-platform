/**
 * Competition Details JavaScript
 * Платформа: Єдина платформа конкурсів України
 */

// ==================== ГЛОБАЛЬНІ ЗМІННІ ====================
let currentUser = null;
let userPermissions = [];
let competition = null;
let sections = [];
let existingSubmission = null;
let uploadedFiles = [];

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

const SUBMISSION_STATUSES = {
    draft: { label: 'Чернетка', color: 'gray' },
    submitted: { label: 'Подано', color: 'blue' },
    under_review: { label: 'На розгляді', color: 'yellow' },
    accepted: { label: 'Прийнято', color: 'green' },
    rejected: { label: 'Відхилено', color: 'red' },
    needs_revision: { label: 'Потребує доопрацювання', color: 'orange' }
};

// ==================== ICONS ====================
const ICONS = {
    calendar: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
    users: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
    clock: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
    award: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>',
    mapPin: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>',
    file: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>',
    check: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    x: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
    alertCircle: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>'
};

// ==================== MENU CONFIG ====================
const MENU_CONFIG = {
    student: {
        sections: [
            {
                title: 'Головне',
                items: [
                    { id: 'dashboard', label: 'Головна', icon: 'home', href: '/dashboard.html' },
                    { id: 'competitions', label: 'Конкурси', icon: 'trophy', href: '/competitions.html', active: true },
                    { id: 'my-submissions', label: 'Мої заявки', icon: 'file-text', href: '/submissions.html' }
                ]
            }
        ]
    },
    teacher: {
        sections: [
            {
                title: 'Головне',
                items: [
                    { id: 'dashboard', label: 'Головна', icon: 'home', href: '/dashboard.html' },
                    { id: 'competitions', label: 'Конкурси', icon: 'trophy', href: '/competitions.html', active: true }
                ]
            }
        ]
    },
    admin: {
        sections: [
            {
                title: 'Головне',
                items: [
                    { id: 'dashboard', label: 'Головна', icon: 'home', href: '/dashboard.html' },
                    { id: 'competitions', label: 'Конкурси', icon: 'trophy', href: '/competitions.html', active: true }
                ]
            }
        ]
    }
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

    const competitionId = getCompetitionIdFromUrl();
    if (!competitionId) {
        window.location.href = '/competitions.html';
        return;
    }

    try {
        await loadCurrentUser();
        await loadCompetition(competitionId);
        await loadSections(competitionId);
        await checkExistingSubmission(competitionId);
        renderPage();
        setupEventListeners();
        hideLoading();
    } catch (error) {
        console.error('Помилка ініціалізації:', error);
        showToast('Помилка завантаження даних', 'error');
    }
}

function getCompetitionIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
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
        userPermissions = data.user.permissions?.map(p => p.name) || [];
    } else {
        throw new Error(data.message);
    }
}

async function loadCompetition(id) {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`/api/competitions/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    if (data.success) {
        competition = data.competition;
    } else {
        throw new Error(data.message);
    }
}

async function loadSections(competitionId) {
    const token = localStorage.getItem('authToken');
    try {
        const response = await fetch(`/api/competitions/${competitionId}/sections`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
            sections = data.sections || [];
        }
    } catch (e) {
        sections = [];
    }
}

async function checkExistingSubmission(competitionId) {
    const token = localStorage.getItem('authToken');
    try {
        const response = await fetch(`/api/submissions/my?competition_id=${competitionId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && data.submission) {
            existingSubmission = data.submission;
        }
    } catch (e) {
        existingSubmission = null;
    }
}

async function submitApplication(formData) {
    const token = localStorage.getItem('authToken');
    
    try {
        const response = await fetch('/api/submissions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                competition_id: competition.id,
                ...formData
            })
        });

        const data = await response.json();
        if (data.success) {
            showToast('Заявку успішно подано!', 'success');
            closeModal('submitModal');
            existingSubmission = data.submission;
            renderApplicationCard();
        } else {
            showToast(data.message || 'Помилка подання заявки', 'error');
        }
    } catch (error) {
        console.error('Помилка подання заявки:', error);
        showToast('Помилка з\'єднання з сервером', 'error');
    }
}

// ==================== РЕНДЕРИНГ ====================
function renderPage() {
    renderSidebar();
    renderSidebarUser();
    renderCompetitionHeader();
    renderDescription();
    renderSections();
    renderApplicationCard();
    renderInfoCard();
    renderOrganizerCard();
}

function renderSidebar() {
    const nav = document.getElementById('sidebarNav');
    if (!nav) return;

    const roleName = currentUser.role?.name || currentUser.role || 'student';
    const config = MENU_CONFIG[roleName] || MENU_CONFIG.student;

    let html = '';
    config.sections.forEach(section => {
        html += `<div class="nav-section"><div class="nav-section-title">${section.title}</div>`;
        section.items.forEach(item => {
            const activeClass = item.active ? 'active' : '';
            const href = item.href || '#';
            html += `
                <a href="${href}" class="nav-item ${activeClass}">
                    <span class="nav-icon">${getIcon(item.icon)}</span>
                    <span class="nav-label">${item.label}</span>
                </a>
            `;
        });
        html += '</div>';
    });

    nav.innerHTML = html;
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
}

function renderCompetitionHeader() {
    const header = document.getElementById('competitionHeader');
    const breadcrumb = document.getElementById('breadcrumbTitle');
    if (!header || !competition) return;

    if (breadcrumb) {
        breadcrumb.textContent = competition.title.length > 40 
            ? competition.title.substring(0, 40) + '...' 
            : competition.title;
    }

    const daysLeft = getDaysLeft(competition.end_date);
    const isUrgent = daysLeft <= 7 && daysLeft > 0;

    header.innerHTML = `
        <div class="competition-header-content">
            <div class="competition-header-left">
                <div class="competition-badges">
                    <span class="badge badge-status ${competition.status}">${STATUSES[competition.status] || 'Чернетка'}</span>
                    <span class="badge badge-level ${competition.level}">${LEVELS[competition.level] || 'Шкільний'}</span>
                    <span class="badge badge-subject">${SUBJECTS[competition.subject] || competition.subject}</span>
                </div>
                <h1 class="competition-title">${escapeHtml(competition.title)}</h1>
                <div class="competition-meta">
                    <div class="meta-item">
                        ${ICONS.calendar}
                        <span>${formatDate(competition.start_date)} - ${formatDate(competition.end_date)}</span>
                    </div>
                    <div class="meta-item">
                        ${ICONS.users}
                        <span>Макс. ${competition.max_participants || 100} учасників</span>
                    </div>
                </div>
            </div>
            <div class="competition-header-right">
                <div class="deadline-badge ${isUrgent ? 'urgent' : ''}">
                    ${ICONS.clock}
                    <div>
                        <div class="deadline-label">До завершення</div>
                        <div class="deadline-value">${daysLeft > 0 ? daysLeft + ' днів' : 'Завершено'}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderDescription() {
    const body = document.getElementById('descriptionBody');
    if (!body || !competition) return;

    body.innerHTML = `<p>${escapeHtml(competition.description || 'Опис конкурсу відсутній')}</p>`;
}

function renderSections() {
    const card = document.getElementById('sectionsCard');
    const body = document.getElementById('sectionsBody');
    const selectGroup = document.getElementById('sectionSelectGroup');
    const select = document.getElementById('sectionSelect');
    
    if (!card || !body) return;

    if (sections.length === 0) {
        card.style.display = 'none';
        if (selectGroup) selectGroup.style.display = 'none';
        return;
    }

    card.style.display = 'block';
    if (selectGroup) selectGroup.style.display = 'block';

    let html = '<div class="sections-list">';
    let optionsHtml = '<option value="">Оберіть секцію</option>';

    sections.forEach(section => {
        html += `
            <div class="section-item" data-section-id="${section.id}">
                <div class="section-info">
                    <div class="section-name">${escapeHtml(section.name)}</div>
                    <div class="section-desc">${escapeHtml(section.description || '')}</div>
                </div>
                <div class="section-count">${section.participants_count || 0}/${section.max_participants || 50}</div>
            </div>
        `;
        optionsHtml += `<option value="${section.id}">${escapeHtml(section.name)}</option>`;
    });

    html += '</div>';
    body.innerHTML = html;

    if (select) {
        select.innerHTML = optionsHtml;
    }
}

function renderApplicationCard() {
    const body = document.getElementById('applicationBody');
    if (!body) return;

    const roleName = currentUser.role?.name || currentUser.role || 'student';
    const canApply = roleName === 'student' && competition.status === 'active';
    const isDeadlinePassed = new Date(competition.end_date) < new Date();

    if (existingSubmission) {
        const status = SUBMISSION_STATUSES[existingSubmission.status] || SUBMISSION_STATUSES.draft;
        const iconType = existingSubmission.status === 'accepted' ? 'check' : 
                        existingSubmission.status === 'rejected' ? 'x' : 'alertCircle';
        const iconClass = existingSubmission.status === 'accepted' ? 'success' : 
                         existingSubmission.status === 'rejected' ? 'rejected' : 'pending';

        body.innerHTML = `
            <div class="application-status">
                <div class="status-icon ${iconClass}">
                    ${ICONS[iconType]}
                </div>
                <div class="status-text">${status.label}</div>
                <div class="status-desc">Заявка "${escapeHtml(existingSubmission.title)}"</div>
            </div>
            <a href="/submissions.html" class="btn btn-secondary btn-lg" style="margin-top: 1rem;">
                Переглянути заявку
            </a>
        `;
    } else if (canApply && !isDeadlinePassed) {
        body.innerHTML = `
            <p style="margin-bottom: 1rem; color: var(--gray-600);">
                Подайте заявку для участі у цьому конкурсі. Завантажте необхідні матеріали та заповніть форму.
            </p>
            <button class="btn btn-accent btn-lg" onclick="openSubmitModal()">
                Подати заявку
            </button>
        `;
    } else if (isDeadlinePassed) {
        body.innerHTML = `
            <div class="application-status">
                <div class="status-icon rejected">
                    ${ICONS.x}
                </div>
                <div class="status-text">Дедлайн минув</div>
                <div class="status-desc">Прийом заявок на цей конкурс завершено</div>
            </div>
        `;
    } else if (competition.status !== 'active') {
        body.innerHTML = `
            <div class="application-status">
                <div class="status-icon pending">
                    ${ICONS.alertCircle}
                </div>
                <div class="status-text">Конкурс неактивний</div>
                <div class="status-desc">Наразі подача заявок недоступна</div>
            </div>
        `;
    } else {
        body.innerHTML = `
            <p style="color: var(--gray-600);">
                Подача заявок доступна тільки для учнів.
            </p>
        `;
    }
}

function renderInfoCard() {
    const body = document.getElementById('infoBody');
    if (!body || !competition) return;

    body.innerHTML = `
        <div class="info-list">
            <div class="info-item">
                <div class="info-icon">${ICONS.calendar}</div>
                <div class="info-content">
                    <div class="info-label">Дата початку</div>
                    <div class="info-value">${formatDate(competition.start_date)}</div>
                </div>
            </div>
            <div class="info-item">
                <div class="info-icon">${ICONS.calendar}</div>
                <div class="info-content">
                    <div class="info-label">Дата завершення</div>
                    <div class="info-value">${formatDate(competition.end_date)}</div>
                </div>
            </div>
            <div class="info-item">
                <div class="info-icon">${ICONS.users}</div>
                <div class="info-content">
                    <div class="info-label">Максимум учасників</div>
                    <div class="info-value">${competition.max_participants || 100}</div>
                </div>
            </div>
            <div class="info-item">
                <div class="info-icon">${ICONS.award}</div>
                <div class="info-content">
                    <div class="info-label">Рівень</div>
                    <div class="info-value">${LEVELS[competition.level] || 'Шкільний'}</div>
                </div>
            </div>
        </div>
    `;
}

function renderOrganizerCard() {
    const body = document.getElementById('organizerBody');
    if (!body || !competition) return;

    const firstName = competition.creator_first_name || 'Адмін';
    const lastName = competition.creator_last_name || 'Системи';
    const initials = `${firstName[0]}${lastName[0]}`.toUpperCase();

    body.innerHTML = `
        <div class="organizer-info">
            <div class="organizer-avatar">${initials}</div>
            <div class="organizer-details">
                <div class="organizer-name">${escapeHtml(firstName)} ${escapeHtml(lastName)}</div>
                <div class="organizer-role">Організатор</div>
            </div>
        </div>
    `;
}

// ==================== МОДАЛЬНЕ ВІКНО ====================
function openSubmitModal() {
    document.getElementById('submitModal').classList.add('active');
    document.getElementById('submitForm').reset();
    uploadedFiles = [];
    renderUploadedFiles();
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function saveDraft() {
    const formData = getFormData();
    formData.status = 'draft';
    submitApplication(formData);
}

function getFormData() {
    return {
        title: document.getElementById('submissionTitle').value,
        description: document.getElementById('submissionDescription').value,
        section_id: document.getElementById('sectionSelect')?.value || null,
        files: uploadedFiles
    };
}

// ==================== ФАЙЛИ ====================
function setupFileUpload() {
    const area = document.getElementById('fileUploadArea');
    const input = document.getElementById('fileInput');

    if (!area || !input) return;

    area.addEventListener('dragover', (e) => {
        e.preventDefault();
        area.classList.add('dragover');
    });

    area.addEventListener('dragleave', () => {
        area.classList.remove('dragover');
    });

    area.addEventListener('drop', (e) => {
        e.preventDefault();
        area.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });

    input.addEventListener('change', () => {
        handleFiles(input.files);
    });
}

function handleFiles(files) {
    for (const file of files) {
        if (file.size > 50 * 1024 * 1024) {
            showToast(`Файл ${file.name} перевищує 50MB`, 'error');
            continue;
        }
        uploadedFiles.push({
            name: file.name,
            size: file.size,
            file: file
        });
    }
    renderUploadedFiles();
}

function renderUploadedFiles() {
    const container = document.getElementById('uploadedFiles');
    if (!container) return;

    if (uploadedFiles.length === 0) {
        container.innerHTML = '';
        return;
    }

    let html = '';
    uploadedFiles.forEach((file, index) => {
        html += `
            <div class="uploaded-file">
                <div class="file-info">
                    <div class="file-icon">${ICONS.file}</div>
                    <div class="file-details">
                        <div class="file-name">${escapeHtml(file.name)}</div>
                        <div class="file-size">${formatFileSize(file.size)}</div>
                    </div>
                </div>
                <button class="file-remove" onclick="removeFile(${index})">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
        `;
    });
    container.innerHTML = html;
}

function removeFile(index) {
    uploadedFiles.splice(index, 1);
    renderUploadedFiles();
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        localStorage.removeItem('authToken');
        window.location.href = '/auth.html';
    });

    // Mobile menu
    document.getElementById('menuToggle')?.addEventListener('click', () => {
        document.getElementById('sidebar')?.classList.toggle('open');
        document.getElementById('sidebarOverlay')?.classList.toggle('active');
    });

    document.getElementById('sidebarOverlay')?.addEventListener('click', () => {
        document.getElementById('sidebar')?.classList.remove('open');
        document.getElementById('sidebarOverlay')?.classList.remove('active');
    });

    // Modal close on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
            }
        });
    });

    // Submit form
    document.getElementById('submitForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = getFormData();
        formData.status = 'submitted';
        submitApplication(formData);
    });

    // File upload
    setupFileUpload();
}

// ==================== УТИЛІТИ ====================
function formatDate(dateString) {
    if (!dateString) return 'Не вказано';
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getDaysLeft(endDate) {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <svg class="toast-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            ${type === 'success' ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>' : 
              type === 'error' ? '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>' :
              '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>'}
        </svg>
        <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
}

function getIcon(name) {
    const icons = {
        home: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
        trophy: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>',
        'file-text': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>'
    };
    return icons[name] || '';
}

/**
 * Competition Detail JavaScript
 * Платформа: Єдина платформа конкурсів України
 */

// ==================== ГЛОБАЛЬНІ ЗМІННІ ====================
let currentUser = null;
let competition = null;
let sections = [];
let myApplication = null;

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

const APPLICATION_STATUSES = {
    submitted: 'Подано',
    under_review: 'На розгляді',
    accepted: 'Прийнято',
    rejected: 'Відхилено',
    pending: 'Очікує'
};

const ICONS = {
    'arrow-left': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>',
    calendar: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
    users: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
    'file-text': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
    'list': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>',
    'check-circle': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
    'clock': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
    'x-circle': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
    'alert-circle': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
    'send': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>',
    'check': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    'folder': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>'
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

    // Get competition ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const competitionId = urlParams.get('id');

    if (!competitionId) {
        window.location.href = '/competitions.html';
        return;
    }

    try {
        await loadCurrentUser();
        await loadCompetition(competitionId);
        await loadSections(competitionId);
        await checkMyApplication(competitionId);
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
        
        // Show "My Applications" link for students
        const roleName = currentUser.role?.name || currentUser.role;
        if (roleName === 'student') {
            document.getElementById('navMyApplications').style.display = 'flex';
        }
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
        throw new Error(data.message || 'Конкурс не знайдено');
    }
}

async function loadSections(competitionId) {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`/api/competitions/${competitionId}/sections`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    if (data.success) {
        sections = data.sections;
    }
}

async function checkMyApplication(competitionId) {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`/api/competitions/${competitionId}/my-application`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    if (data.success && data.has_application) {
        myApplication = data.application;
    }
}

async function submitApplication(formData) {
    const token = localStorage.getItem('authToken');
    const submitBtn = document.getElementById('submitApplicationBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Надсилання...';

    try {
        // Handle file upload
        let fileData = null;
        let fileName = null;
        const fileInput = document.getElementById('workFile');
        
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            fileName = file.name;
            
            // Convert file to base64
            fileData = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result.split(',')[1]);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }

        const response = await fetch(`/api/competitions/${competition.id}/apply`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                section_id: formData.section_id,
                title: formData.title,
                description: formData.description,
                file_data: fileData,
                file_name: fileName
            })
        });

        const data = await response.json();
        
        if (data.success) {
            showToast('Заявку успішно подано!', 'success');
            closeModal('applicationModal');
            myApplication = data.application;
            renderApplyCard();
        } else {
            showToast(data.message || 'Помилка подання заявки', 'error');
        }
    } catch (error) {
        console.error('Помилка подання заявки:', error);
        showToast('Помилка з\'єднання з сервером', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Надіслати заявку';
    }
}

// ==================== РЕНДЕРИНГ ====================
function renderPage() {
    renderSidebarUser();
    renderCompetitionDetail();
    populateSectionSelect();
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

function renderCompetitionDetail() {
    const container = document.getElementById('competitionDetail');
    if (!container || !competition) return;

    const isDeadlinePassed = new Date() > new Date(competition.end_date);
    const isStudent = (currentUser.role?.name || currentUser.role) === 'student';
    
    container.innerHTML = `
        <a href="/competitions.html" class="back-link">
            ${ICONS['arrow-left']}
            <span>Назад до списку конкурсів</span>
        </a>

        <div class="competition-header">
            <div class="competition-header-banner ${competition.subject}"></div>
            <div class="competition-header-content">
                <div class="competition-badges">
                    <span class="badge badge-status ${competition.status}">${STATUSES[competition.status] || 'Чернетка'}</span>
                    <span class="badge badge-level ${competition.level}">${LEVELS[competition.level] || 'Шкільний'}</span>
                    <span class="badge badge-subject">${SUBJECTS[competition.subject] || competition.subject}</span>
                </div>
                <h1 class="competition-title">${escapeHtml(competition.title)}</h1>
                <div class="competition-meta-row">
                    <div class="meta-block">
                        ${ICONS.calendar}
                        <div>
                            <div class="label">Дати проведення</div>
                            <div class="value">${formatDate(competition.start_date)} - ${formatDate(competition.end_date)}</div>
                        </div>
                    </div>
                    <div class="meta-block">
                        ${ICONS.users}
                        <div>
                            <div class="label">Учасників</div>
                            <div class="value">${competition.applications_count || 0} / ${competition.max_participants || 100}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="competition-content">
            <div class="content-main">
                <div class="info-card">
                    <div class="info-card-header">
                        ${ICONS['file-text']}
                        <h3>Опис конкурсу</h3>
                    </div>
                    <div class="info-card-body">
                        <p class="description-text">${escapeHtml(competition.description || 'Опис відсутній')}</p>
                    </div>
                </div>

                ${sections.length > 0 ? `
                <div class="info-card">
                    <div class="info-card-header">
                        ${ICONS['folder']}
                        <h3>Секції конкурсу</h3>
                    </div>
                    <div class="info-card-body">
                        <div class="sections-list">
                            ${sections.map((section, index) => `
                                <div class="section-item">
                                    <div class="section-item-icon">${index + 1}</div>
                                    <div class="section-item-content">
                                        <h4>${escapeHtml(section.name)}</h4>
                                        <p>${escapeHtml(section.description || '')}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                ` : ''}

                <div class="info-card">
                    <div class="info-card-header">
                        ${ICONS['list']}
                        <h3>Правила участі</h3>
                    </div>
                    <div class="info-card-body">
                        <ul class="rules-list">
                            <li>
                                ${ICONS['check']}
                                <span>Заявки приймаються до ${formatDate(competition.end_date)}</span>
                            </li>
                            <li>
                                ${ICONS['check']}
                                <span>Один учасник може подати одну заявку</span>
                            </li>
                            <li>
                                ${ICONS['check']}
                                <span>Необхідно обрати секцію та вказати назву роботи</span>
                            </li>
                            <li>
                                ${ICONS['check']}
                                <span>Дозволені формати файлів: PDF, DOC, DOCX, ZIP, RAR</span>
                            </li>
                            <li>
                                ${ICONS['check']}
                                <span>Максимальний розмір файлу: 10MB</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="content-sidebar">
                <div class="apply-card" id="applyCard">
                    ${renderApplyCardContent(isStudent, isDeadlinePassed)}
                </div>
            </div>
        </div>
    `;
}

function renderApplyCardContent(isStudent, isDeadlinePassed) {
    // If student already has an application
    if (myApplication) {
        const statusText = APPLICATION_STATUSES[myApplication.status] || myApplication.status;
        let statusIcon = ICONS['check-circle'];
        if (myApplication.status === 'under_review' || myApplication.status === 'pending') {
            statusIcon = ICONS['clock'];
        } else if (myApplication.status === 'rejected') {
            statusIcon = ICONS['x-circle'];
        }

        return `
            <h3 class="apply-card-title">Ваша заявка</h3>
            <div class="apply-status ${myApplication.status}">
                ${statusIcon}
                <div class="apply-status-text">
                    <h4>${statusText}</h4>
                    <p>${escapeHtml(myApplication.title || 'Назва не вказана')}</p>
                </div>
            </div>
            <div style="margin-top: 1rem;">
                <a href="/my-applications.html" class="btn btn-secondary" style="width: 100%;">
                    Переглянути мої заявки
                </a>
            </div>
        `;
    }

    // If not a student
    if (!isStudent) {
        return `
            <h3 class="apply-card-title">Подача заявок</h3>
            <p style="font-size: 0.875rem; color: var(--gray-600);">
                Подача заявок доступна тільки для учнів.
            </p>
        `;
    }

    // If competition is not active
    if (competition.status !== 'active') {
        return `
            <h3 class="apply-card-title">Подача заявок</h3>
            <p style="font-size: 0.875rem; color: var(--gray-600);">
                Конкурс не активний. Подача заявок недоступна.
            </p>
        `;
    }

    // If deadline has passed
    if (isDeadlinePassed) {
        return `
            <h3 class="apply-card-title">Подача заявок</h3>
            <div class="deadline-info" style="background: rgba(239, 68, 68, 0.1);">
                ${ICONS['alert-circle']}
                <span class="deadline-passed">Дедлайн подачі заявок минув</span>
            </div>
            <button class="btn btn-primary apply-btn" disabled>
                Подати заявку
            </button>
        `;
    }

    // If no sections available
    if (sections.length === 0) {
        return `
            <h3 class="apply-card-title">Подача заявок</h3>
            <p style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: 1rem;">
                Секції конкурсу ще не визначені. Подача заявок тимчасово недоступна.
            </p>
            <button class="btn btn-primary apply-btn" disabled>
                Подати заявку
            </button>
        `;
    }

    // Normal case - can apply
    const daysLeft = Math.ceil((new Date(competition.end_date) - new Date()) / (1000 * 60 * 60 * 24));

    return `
        <h3 class="apply-card-title">Подача заявок</h3>
        <div class="deadline-info">
            ${ICONS['clock']}
            <span>До завершення подачі: <strong>${daysLeft} днів</strong></span>
        </div>
        <div class="participants-info">
            <span>Подано заявок:</span>
            <strong>${competition.applications_count || 0} / ${competition.max_participants || 100}</strong>
        </div>
        <button class="btn btn-primary apply-btn" onclick="openApplicationModal()">
            ${ICONS['send']}
            Подати заявку
        </button>
    `;
}

function renderApplyCard() {
    const applyCard = document.getElementById('applyCard');
    if (!applyCard) return;

    const isStudent = (currentUser.role?.name || currentUser.role) === 'student';
    const isDeadlinePassed = new Date() > new Date(competition.end_date);

    applyCard.innerHTML = renderApplyCardContent(isStudent, isDeadlinePassed);
}

function populateSectionSelect() {
    const select = document.getElementById('sectionSelect');
    if (!select) return;

    select.innerHTML = '<option value="">Оберіть секцію</option>';
    sections.forEach(section => {
        const option = document.createElement('option');
        option.value = section.id;
        option.textContent = section.name;
        select.appendChild(option);
    });
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

    // Application form submit
    document.getElementById('applicationForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = {
            section_id: document.getElementById('sectionSelect').value,
            title: document.getElementById('workTitle').value,
            description: document.getElementById('workDescription').value
        };
        submitApplication(formData);
    });

    // Close modal on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
            }
        });
    });
}

// ==================== МОДАЛЬНІ ВІКНА ====================
function openApplicationModal() {
    document.getElementById('applicationModal')?.classList.add('active');
    document.getElementById('applicationForm')?.reset();
}

function closeModal(modalId) {
    document.getElementById(modalId)?.classList.remove('active');
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
    
    let icon = ICONS['alert-circle'];
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

/**
 * Teacher Students JavaScript
 * Платформа: Єдина платформа конкурсів України
 * Функціонал: Управління учнями та додавання до конкурсів
 */

// ==================== ГЛОБАЛЬНІ ЗМІННІ ====================
let currentUser = null;
let students = [];
let institution = null;
let selectedStudents = new Set();
let availableCompetitions = [];
let selectedCompetitionId = null;

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
        
        // Перевіряємо роль
        const roleName = currentUser.role?.name || currentUser.role;
        if (roleName !== 'teacher' && roleName !== 'deputy_principal' && roleName !== 'admin') {
            window.location.href = '/dashboard.html';
            return;
        }
        
        await loadStudents();
        renderPage();
        setupEventListeners();
        hideLoading();
    } catch (error) {
        console.error('Помилка ініціалізації:', error);
        showToast('Помилка завантаження даних', 'error');
        hideLoading();
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

async function loadStudents() {
    const token = localStorage.getItem('authToken');
    const response = await fetch('/api/institution/students', {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    if (data.success) {
        students = data.students || [];
        institution = data.institution || null;
    } else {
        throw new Error(data.message || 'Помилка завантаження учнів');
    }
}

async function loadAvailableCompetitions() {
    const token = localStorage.getItem('authToken');
    const response = await fetch('/api/competitions', {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    if (data.success) {
        // Фільтруємо тільки активні конкурси
        availableCompetitions = (data.competitions || []).filter(c => 
            c.status === 'active' || c.status === 'published'
        );
    } else {
        availableCompetitions = [];
    }
}

async function addStudentsToCompetition(competitionId, studentIds) {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`/api/competitions/${competitionId}/participants`, {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            student_ids: studentIds
        })
    });

    return await response.json();
}

// ==================== РЕНДЕРИНГ ====================
function renderPage() {
    renderSidebarUser();
    renderInstitutionInfo();
    renderStudents();
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

function renderInstitutionInfo() {
    const institutionName = document.getElementById('institutionName');
    const institutionBadge = document.getElementById('institutionBadge');
    const institutionBadgeName = document.getElementById('institutionBadgeName');

    if (institution) {
        institutionName.textContent = institution.name || 'Навчальний заклад';
        institutionBadge.style.display = 'inline-flex';
        institutionBadgeName.textContent = institution.name || 'Заклад';
    } else {
        institutionName.textContent = 'Ви не прив\'язані до навчального закладу';
        institutionBadge.style.display = 'none';
    }
}

function renderStudents(filteredStudents = null) {
    const grid = document.getElementById('studentsGrid');
    const emptyState = document.getElementById('emptyState');
    const displayStudents = filteredStudents || students;

    if (displayStudents.length === 0) {
        grid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    grid.style.display = 'grid';
    emptyState.style.display = 'none';

    grid.innerHTML = displayStudents.map(student => {
        const initials = (student.first_name?.charAt(0) || '') + (student.last_name?.charAt(0) || '');
        const isSelected = selectedStudents.has(student.id);

        return `
            <div class="student-card ${isSelected ? 'selected' : ''}" data-student-id="${student.id}">
                <div class="student-card-header">
                    <div class="student-avatar">${initials.toUpperCase()}</div>
                    <div class="student-info">
                        <h4>${escapeHtml(student.first_name)} ${escapeHtml(student.last_name)}</h4>
                        <p>${escapeHtml(student.email)}</p>
                    </div>
                    <div class="student-checkbox">
                        <input type="checkbox" ${isSelected ? 'checked' : ''} onclick="event.stopPropagation()">
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Додаємо обробники подій
    grid.querySelectorAll('.student-card').forEach(card => {
        card.addEventListener('click', () => {
            const studentId = parseInt(card.dataset.studentId);
            toggleStudentSelection(studentId);
        });

        card.querySelector('input[type="checkbox"]').addEventListener('change', (e) => {
            const studentId = parseInt(card.dataset.studentId);
            if (e.target.checked) {
                selectedStudents.add(studentId);
            } else {
                selectedStudents.delete(studentId);
            }
            updateSelectionUI();
        });
    });
}

function renderCompetitionList() {
    const list = document.getElementById('competitionList');
    const noCompetitionsMessage = document.getElementById('noCompetitionsMessage');
    const confirmBtn = document.getElementById('confirmAddBtn');

    if (availableCompetitions.length === 0) {
        list.style.display = 'none';
        noCompetitionsMessage.style.display = 'block';
        confirmBtn.disabled = true;
        return;
    }

    list.style.display = 'block';
    noCompetitionsMessage.style.display = 'none';

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

    list.innerHTML = availableCompetitions.map(comp => {
        const isSelected = selectedCompetitionId === comp.id;
        const subject = SUBJECTS[comp.subject] || comp.subject;
        const level = LEVELS[comp.level] || comp.level;

        return `
            <div class="competition-item ${isSelected ? 'selected' : ''}" data-competition-id="${comp.id}">
                <div class="competition-item-radio">
                    <input type="radio" name="competition" ${isSelected ? 'checked' : ''}>
                </div>
                <div class="competition-item-info">
                    <h4>${escapeHtml(comp.title)}</h4>
                    <div class="competition-item-meta">
                        <span>${subject}</span>
                        <span>•</span>
                        <span>${level}</span>
                        <span>•</span>
                        <span>${formatDate(comp.start_date)} - ${formatDate(comp.end_date)}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Додаємо обробники подій
    list.querySelectorAll('.competition-item').forEach(item => {
        item.addEventListener('click', () => {
            const competitionId = parseInt(item.dataset.competitionId);
            selectCompetition(competitionId);
        });
    });
}

// ==================== УПРАВЛІННЯ ВИБОРОМ ====================
function toggleStudentSelection(studentId) {
    if (selectedStudents.has(studentId)) {
        selectedStudents.delete(studentId);
    } else {
        selectedStudents.add(studentId);
    }
    updateSelectionUI();
}

function updateSelectionUI() {
    const selectionBar = document.getElementById('selectionBar');
    const selectionCount = document.getElementById('selectionCount');
    const selectAllBtn = document.getElementById('selectAllBtn');

    if (selectedStudents.size > 0) {
        selectionBar.classList.add('visible');
        selectionCount.textContent = `${selectedStudents.size} учнів вибрано`;
    } else {
        selectionBar.classList.remove('visible');
    }

    // Оновлюємо стан карток
    document.querySelectorAll('.student-card').forEach(card => {
        const studentId = parseInt(card.dataset.studentId);
        const checkbox = card.querySelector('input[type="checkbox"]');
        
        if (selectedStudents.has(studentId)) {
            card.classList.add('selected');
            checkbox.checked = true;
        } else {
            card.classList.remove('selected');
            checkbox.checked = false;
        }
    });

    // Оновлюємо кнопку "Вибрати всіх"
    if (selectedStudents.size === students.length && students.length > 0) {
        selectAllBtn.textContent = 'Скасувати все';
    } else {
        selectAllBtn.textContent = 'Вибрати всіх';
    }
}

function selectCompetition(competitionId) {
    selectedCompetitionId = competitionId;
    const confirmBtn = document.getElementById('confirmAddBtn');
    confirmBtn.disabled = false;

    // Оновлюємо UI
    document.querySelectorAll('.competition-item').forEach(item => {
        const itemId = parseInt(item.dataset.competitionId);
        const radio = item.querySelector('input[type="radio"]');
        
        if (itemId === competitionId) {
            item.classList.add('selected');
            radio.checked = true;
        } else {
            item.classList.remove('selected');
            radio.checked = false;
        }
    });
}

// ==================== ОБРОБНИКИ ПОДІЙ ====================
function setupEventListeners() {
    // Пошук
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (query === '') {
            renderStudents();
        } else {
            const filtered = students.filter(s => 
                `${s.first_name} ${s.last_name}`.toLowerCase().includes(query) ||
                s.email.toLowerCase().includes(query)
            );
            renderStudents(filtered);
        }
    });

    // Вибрати всіх
    document.getElementById('selectAllBtn').addEventListener('click', () => {
        if (selectedStudents.size === students.length) {
            selectedStudents.clear();
        } else {
            students.forEach(s => selectedStudents.add(s.id));
        }
        updateSelectionUI();
    });

    // Скасувати вибір
    document.getElementById('clearSelectionBtn').addEventListener('click', () => {
        selectedStudents.clear();
        updateSelectionUI();
    });

    // Додати до конкурсу
    document.getElementById('addToCompetitionBtn').addEventListener('click', async () => {
        await loadAvailableCompetitions();
        selectedCompetitionId = null;
        renderCompetitionList();
        openModal('competitionModal');
    });

    // Підтвердити додавання
    document.getElementById('confirmAddBtn').addEventListener('click', async () => {
        if (!selectedCompetitionId || selectedStudents.size === 0) {
            showToast('Оберіть конкурс та учнів', 'error');
            return;
        }

        const btn = document.getElementById('confirmAddBtn');
        btn.disabled = true;
        btn.textContent = 'Додавання...';

        try {
            const result = await addStudentsToCompetition(
                selectedCompetitionId, 
                Array.from(selectedStudents)
            );

            if (result.success) {
                showToast(result.message || 'Учнів успішно додано до конкурсу', 'success');
                closeModal('competitionModal');
                selectedStudents.clear();
                updateSelectionUI();
                
                // Показуємо помилки якщо є
                if (result.errors && result.errors.length > 0) {
                    setTimeout(() => {
                        result.errors.forEach(err => showToast(err, 'warning'));
                    }, 1000);
                }
            } else {
                showToast(result.message || 'Помилка додавання учнів', 'error');
            }
        } catch (error) {
            console.error('Помилка:', error);
            showToast('Помилка з\'єднання з сервером', 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Додати учнів';
        }
    });

    // Sidebar toggle
    document.getElementById('menuToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('active');
        document.getElementById('sidebarOverlay').classList.toggle('active');
    });

    document.getElementById('sidebarOverlay').addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('active');
        document.getElementById('sidebarOverlay').classList.remove('active');
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        window.location.href = '/auth.html';
    });
}

// ==================== ДОПОМІЖНІ ФУНКЦІЇ ====================
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('uk-UA', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 300);
    }
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-hide');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

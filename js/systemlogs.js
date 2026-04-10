/**
 * System Logs JavaScript
 * Платформа: Єдина платформа конкурсів України
 * Адмін-панель логів системи
 */

// ==================== ГЛОБАЛЬНІ ЗМІННІ ====================
let currentUser = null;
let logs = [];
let filteredLogs = [];
let currentPage = 1;
let logsPerPage = 50;
let sortField = 'created_at';
let sortDirection = 'desc';
let liveMode = false;
let liveInterval = null;
let selectedLog = null;

// ==================== ІНІЦІАЛІЗАЦІЯ ====================
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
});

/**
 * Перевірка авторизації та ролі
 */
async function checkAuth() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        window.location.href = '/';
        return;
    }
    
    try {
        const response = await fetch('/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Unauthorized');
        }
        
        const data = await response.json();
        currentUser = data.user;
        
        // Перевірка ролі admin (підтримка обох форматів відповіді)
        const userRole = typeof currentUser.role === 'object' ? currentUser.role.name : currentUser.role;
        if (userRole !== 'admin') {
            showAccessDenied();
            return;
        }
        
        // Показуємо адмін-панель
        showAdminPanel();
        
        // Ініціалізуємо сторінку
        initializePage();
        
        // Завантажуємо логи
        await loadLogs();
        
    } catch (error) {
        console.error('Auth error:', error);
        localStorage.removeItem('token');
        window.location.href = '/';
    }
}

/**
 * Показати сторінку "Доступ заборонено"
 */
function showAccessDenied() {
    document.getElementById('loadingOverlay').classList.add('hidden');
    document.getElementById('accessDeniedPage').style.display = 'flex';
    document.getElementById('adminLayout').style.display = 'none';
}

/**
 * Показати адмін-панель
 */
function showAdminPanel() {
    document.getElementById('loadingOverlay').classList.add('hidden');
    document.getElementById('accessDeniedPage').style.display = 'none';
    document.getElementById('adminLayout').style.display = 'flex';
}

/**
 * Ініціалізація сторінки
 */
function initializePage() {
    // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    menuToggle?.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        sidebarOverlay.classList.toggle('active');
    });
    
    sidebarOverlay?.addEventListener('click', () => {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
    });
    
    // Refresh button
    document.getElementById('refreshLogsBtn')?.addEventListener('click', () => {
        loadLogs();
    });
    
    // Export button
    document.getElementById('exportLogsBtn')?.addEventListener('click', () => {
        openModal('exportModal');
    });
    
    // Confirm export
    document.getElementById('confirmExportBtn')?.addEventListener('click', () => {
        exportLogs();
    });
    
    // Live mode toggle
    const liveModeToggle = document.getElementById('liveModeToggle');
    liveModeToggle?.addEventListener('change', (e) => {
        liveMode = e.target.checked;
        const liveDot = document.getElementById('liveDot');
        
        if (liveMode) {
            liveDot.classList.add('active');
            startLiveMode();
        } else {
            liveDot.classList.remove('active');
            stopLiveMode();
        }
    });
    
    // Search input
    const searchInput = document.getElementById('searchInput');
    let searchTimeout;
    searchInput?.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            applyFilters();
        }, 300);
    });
    
    // Filter selects
    document.getElementById('levelFilter')?.addEventListener('change', applyFilters);
    document.getElementById('categoryFilter')?.addEventListener('change', applyFilters);
    document.getElementById('dateFromFilter')?.addEventListener('change', applyFilters);
    document.getElementById('dateToFilter')?.addEventListener('change', applyFilters);
    
    // Clear filters
    document.getElementById('clearFiltersBtn')?.addEventListener('click', clearFilters);
    
    // Pagination
    document.getElementById('prevPageBtn')?.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderLogs();
            updatePagination();
        }
    });
    
    document.getElementById('nextPageBtn')?.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderLogs();
            updatePagination();
        }
    });
    
    document.getElementById('pageInput')?.addEventListener('change', (e) => {
        const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
        let page = parseInt(e.target.value);
        if (page < 1) page = 1;
        if (page > totalPages) page = totalPages;
        currentPage = page;
        e.target.value = page;
        renderLogs();
        updatePagination();
    });
    
    // Sortable columns
    document.querySelectorAll('.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const field = th.dataset.sort;
            if (sortField === field) {
                sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                sortField = field;
                sortDirection = 'desc';
            }
            sortLogs();
            renderLogs();
        });
    });
    
    // Log detail modal
    document.getElementById('closeLogDetailModal')?.addEventListener('click', () => {
        closeModal('logDetailModal');
    });
    
    document.getElementById('copyLogBtn')?.addEventListener('click', () => {
        if (selectedLog) {
            copyLogToClipboard(selectedLog);
        }
    });
    
    // Modal close buttons
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal-overlay');
            if (modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    // Close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
            }
        });
    });
    
    // Set default date filters
    setDefaultDateFilters();
}

/**
 * Встановлення дефолтних дат фільтрів
 */
function setDefaultDateFilters() {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const formatDateTime = (date) => {
        return date.toISOString().slice(0, 16);
    };
    
    document.getElementById('dateFromFilter').value = formatDateTime(weekAgo);
    document.getElementById('dateToFilter').value = formatDateTime(now);
}

/**
 * Завантаження логів
 */
async function loadLogs() {
    const token = localStorage.getItem('token');
    
    try {
        showTableLoading();
        
        const response = await fetch('/api/admin/logs', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load logs');
        }
        
        const data = await response.json();
        logs = data.logs || [];
        
        // Сортуємо та фільтруємо
        sortLogs();
        applyFilters();
        
        // Оновлюємо статистику
        updateStatistics();
        
        showToast('success', 'Успішно', 'Логи завантажено');
        
    } catch (error) {
        console.error('Error loading logs:', error);
        showToast('error', 'Помилка', 'Не вдалося завантажити логи');
        logs = [];
        filteredLogs = [];
        renderLogs();
    }
}

/**
 * Показати loading в таблиці
 */
function showTableLoading() {
    const tbody = document.getElementById('logsTableBody');
    tbody.innerHTML = `
        <tr>
            <td colspan="8" style="text-align: center; padding: 3rem;">
                <div class="loading-spinner small" style="margin: 0 auto;"></div>
                <div style="margin-top: 0.5rem; color: var(--gray-500);">Завантаження логів...</div>
            </td>
        </tr>
    `;
}

/**
 * Сортування логів
 */
function sortLogs() {
    filteredLogs.sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        
        if (sortField === 'created_at') {
            valA = new Date(valA).getTime();
            valB = new Date(valB).getTime();
        }
        
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
}

/**
 * Застосування фільтрів
 */
function applyFilters() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const levelFilter = document.getElementById('levelFilter')?.value || '';
    const categoryFilter = document.getElementById('categoryFilter')?.value || '';
    const dateFrom = document.getElementById('dateFromFilter')?.value;
    const dateTo = document.getElementById('dateToFilter')?.value;
    
    filteredLogs = logs.filter(log => {
        // Search
        if (searchTerm) {
            const searchFields = [
                log.action,
                log.message,
                log.user_email,
                log.ip_address,
                log.category
            ].map(f => (f || '').toLowerCase());
            
            if (!searchFields.some(f => f.includes(searchTerm))) {
                return false;
            }
        }
        
        // Level filter
        if (levelFilter && log.level !== levelFilter) {
            return false;
        }
        
        // Category filter
        if (categoryFilter && log.category !== categoryFilter) {
            return false;
        }
        
        // Date range
        if (dateFrom) {
            const logDate = new Date(log.created_at);
            const fromDate = new Date(dateFrom);
            if (logDate < fromDate) return false;
        }
        
        if (dateTo) {
            const logDate = new Date(log.created_at);
            const toDate = new Date(dateTo);
            if (logDate > toDate) return false;
        }
        
        return true;
    });
    
    // Reset to first page
    currentPage = 1;
    
    // Sort and render
    sortLogs();
    renderLogs();
    updatePagination();
    updateLogsCount();
}

/**
 * Очистити фільтри
 */
function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('levelFilter').value = '';
    document.getElementById('categoryFilter').value = '';
    setDefaultDateFilters();
    applyFilters();
}

/**
 * Рендеринг логів
 */
function renderLogs() {
    const tbody = document.getElementById('logsTableBody');
    const emptyState = document.getElementById('emptyState');
    const tableWrapper = document.querySelector('.table-wrapper');
    
    if (filteredLogs.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'flex';
        tableWrapper.style.display = 'none';
        return;
    }
    
    emptyState.style.display = 'none';
    tableWrapper.style.display = 'block';
    
    const start = (currentPage - 1) * logsPerPage;
    const end = start + logsPerPage;
    const pageLogs = filteredLogs.slice(start, end);
    
    tbody.innerHTML = pageLogs.map(log => createLogRow(log)).join('');
    
    // Add click handlers to view buttons
    tbody.querySelectorAll('.view-log-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const logId = parseInt(btn.dataset.logId);
            const log = logs.find(l => l.id === logId);
            if (log) {
                showLogDetail(log);
            }
        });
    });
}

/**
 * Створення рядка таблиці логу
 */
function createLogRow(log) {
    const date = new Date(log.created_at);
    const timeStr = date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateStr = date.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' });
    
    const levelClass = `log-level-${log.level}`;
    const levelText = getLevelDisplayName(log.level);
    
    const categoryIcon = getCategoryIcon(log.category);
    const categoryText = getCategoryDisplayName(log.category);
    
    return `
        <tr>
            <td>
                <div class="log-time">
                    ${timeStr}
                    <div class="log-time-date">${dateStr}</div>
                </div>
            </td>
            <td>
                <span class="log-level ${levelClass}">
                    <span class="level-dot"></span>
                    ${levelText}
                </span>
            </td>
            <td>
                <span class="log-category">
                    ${categoryIcon}
                    ${categoryText}
                </span>
            </td>
            <td class="log-action">${escapeHtml(log.action || '-')}</td>
            <td class="log-message" title="${escapeHtml(log.message || '')}">${escapeHtml(truncate(log.message || '-', 60))}</td>
            <td>
                <div class="log-user">
                    <span class="log-user-email">${escapeHtml(log.user_email || 'Система')}</span>
                    <span class="log-user-role">${log.user_role || '-'}</span>
                </div>
            </td>
            <td class="log-ip">${escapeHtml(log.ip_address || '-')}</td>
            <td>
                <div class="log-actions">
                    <button class="btn-icon view-log-btn" data-log-id="${log.id}" title="Детальніше">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

/**
 * Отримати назву рівня
 */
function getLevelDisplayName(level) {
    const levels = {
        'debug': 'Debug',
        'info': 'Info',
        'warning': 'Warning',
        'error': 'Error',
        'critical': 'Critical'
    };
    return levels[level] || level;
}

/**
 * Отримати назву категорії
 */
function getCategoryDisplayName(category) {
    const categories = {
        'auth': 'Авториз.',
        'users': 'Користув.',
        'competitions': 'Конкурси',
        'system': 'Система',
        'api': 'API',
        'security': 'Безпека'
    };
    return categories[category] || category || '-';
}

/**
 * Отримати іконку категорії
 */
function getCategoryIcon(category) {
    const icons = {
        'auth': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`,
        'users': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>`,
        'competitions': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>`,
        'system': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
        'api': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
        'security': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`
    };
    return icons[category] || icons['system'];
}

/**
 * Показати деталі логу
 */
function showLogDetail(log) {
    selectedLog = log;
    
    const content = document.getElementById('logDetailContent');
    const date = new Date(log.created_at);
    
    content.innerHTML = `
        <div class="log-detail-section">
            <h4>Основна інформація</h4>
            <div class="log-detail-grid">
                <div class="log-detail-item">
                    <span class="log-detail-label">ID</span>
                    <span class="log-detail-value">#${log.id}</span>
                </div>
                <div class="log-detail-item">
                    <span class="log-detail-label">Дата та час</span>
                    <span class="log-detail-value">${date.toLocaleString('uk-UA')}</span>
                </div>
                <div class="log-detail-item">
                    <span class="log-detail-label">Рівень</span>
                    <span class="log-detail-value">
                        <span class="log-level log-level-${log.level}">
                            <span class="level-dot"></span>
                            ${getLevelDisplayName(log.level)}
                        </span>
                    </span>
                </div>
                <div class="log-detail-item">
                    <span class="log-detail-label">Категорія</span>
                    <span class="log-detail-value">${getCategoryDisplayName(log.category)}</span>
                </div>
                <div class="log-detail-item full-width">
                    <span class="log-detail-label">Дія</span>
                    <span class="log-detail-value">${escapeHtml(log.action || '-')}</span>
                </div>
            </div>
        </div>
        
        <div class="log-detail-section">
            <h4>Повідомлення</h4>
            <div class="log-detail-message">${escapeHtml(log.message || '-')}</div>
        </div>
        
        <div class="log-detail-section">
            <h4>Користувач</h4>
            <div class="log-detail-grid">
                <div class="log-detail-item">
                    <span class="log-detail-label">ID користувача</span>
                    <span class="log-detail-value">${log.user_id || '-'}</span>
                </div>
                <div class="log-detail-item">
                    <span class="log-detail-label">Email</span>
                    <span class="log-detail-value">${escapeHtml(log.user_email || '-')}</span>
                </div>
                <div class="log-detail-item">
                    <span class="log-detail-label">Роль</span>
                    <span class="log-detail-value">${log.user_role || '-'}</span>
                </div>
                <div class="log-detail-item">
                    <span class="log-detail-label">Session ID</span>
                    <span class="log-detail-value">${escapeHtml(log.session_id || '-')}</span>
                </div>
            </div>
        </div>
        
        <div class="log-detail-section">
            <h4>Запит</h4>
            <div class="log-detail-grid">
                <div class="log-detail-item">
                    <span class="log-detail-label">IP адреса</span>
                    <span class="log-detail-value">${escapeHtml(log.ip_address || '-')}</span>
                </div>
                <div class="log-detail-item">
                    <span class="log-detail-label">Метод</span>
                    <span class="log-detail-value">${log.request_method || '-'}</span>
                </div>
                <div class="log-detail-item">
                    <span class="log-detail-label">Статус відповіді</span>
                    <span class="log-detail-value">${log.response_status || '-'}</span>
                </div>
                <div class="log-detail-item">
                    <span class="log-detail-label">Час виконання</span>
                    <span class="log-detail-value">${log.duration_ms ? log.duration_ms + ' мс' : '-'}</span>
                </div>
                <div class="log-detail-item full-width">
                    <span class="log-detail-label">URL</span>
                    <span class="log-detail-value">${escapeHtml(log.request_url || '-')}</span>
                </div>
                <div class="log-detail-item full-width">
                    <span class="log-detail-label">User-Agent</span>
                    <span class="log-detail-value">${escapeHtml(log.user_agent || '-')}</span>
                </div>
            </div>
        </div>
        
        ${log.details ? `
        <div class="log-detail-section">
            <h4>Додаткові дані</h4>
            <pre class="log-detail-code">${JSON.stringify(log.details, null, 2)}</pre>
        </div>
        ` : ''}
        
        ${log.request_body ? `
        <div class="log-detail-section">
            <h4>Тіло запиту</h4>
            <pre class="log-detail-code">${JSON.stringify(log.request_body, null, 2)}</pre>
        </div>
        ` : ''}
        
        ${log.error_stack ? `
        <div class="log-detail-section">
            <h4>Stack Trace</h4>
            <pre class="log-detail-error-stack">${escapeHtml(log.error_stack)}</pre>
        </div>
        ` : ''}
    `;
    
    openModal('logDetailModal');
}

/**
 * Копіювати лог в буфер обміну
 */
function copyLogToClipboard(log) {
    const text = JSON.stringify(log, null, 2);
    navigator.clipboard.writeText(text).then(() => {
        showToast('success', 'Скопійовано', 'Лог скопійовано в буфер обміну');
    }).catch(() => {
        showToast('error', 'Помилка', 'Не вдалося скопіювати');
    });
}

/**
 * Оновлення статистики
 */
function updateStatistics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayLogs = logs.filter(log => new Date(log.created_at) >= today);
    const errors = logs.filter(log => log.level === 'error' || log.level === 'critical');
    const warnings = logs.filter(log => log.level === 'warning');
    
    document.getElementById('statTotalLogs').textContent = logs.length.toLocaleString('uk-UA');
    document.getElementById('statErrors').textContent = errors.length.toLocaleString('uk-UA');
    document.getElementById('statWarnings').textContent = warnings.length.toLocaleString('uk-UA');
    document.getElementById('statToday').textContent = todayLogs.length.toLocaleString('uk-UA');
}

/**
 * Оновлення лічильника логів
 */
function updateLogsCount() {
    const logsCount = document.getElementById('logsCount');
    logsCount.textContent = `Показано ${filteredLogs.length} з ${logs.length} записів`;
}

/**
 * Оновлення пагінації
 */
function updatePagination() {
    const totalPages = Math.ceil(filteredLogs.length / logsPerPage) || 1;
    
    document.getElementById('totalPages').textContent = totalPages;
    document.getElementById('pageInput').value = currentPage;
    document.getElementById('pageInput').max = totalPages;
    
    document.getElementById('prevPageBtn').disabled = currentPage <= 1;
    document.getElementById('nextPageBtn').disabled = currentPage >= totalPages;
}

/**
 * Live Mode
 */
function startLiveMode() {
    liveInterval = setInterval(() => {
        loadLogs();
    }, 5000); // Оновлення кожні 5 секунд
}

function stopLiveMode() {
    if (liveInterval) {
        clearInterval(liveInterval);
        liveInterval = null;
    }
}

/**
 * Експорт логів
 */
async function exportLogs() {
    const format = document.getElementById('exportFormat').value;
    const range = document.getElementById('exportRange').value;
    const includeDetails = document.getElementById('exportIncludeDetails').checked;
    
    let logsToExport = [];
    
    // Вибір діапазону
    switch (range) {
        case 'filtered':
            logsToExport = [...filteredLogs];
            break;
        case 'today':
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            logsToExport = logs.filter(log => new Date(log.created_at) >= today);
            break;
        case 'week':
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            logsToExport = logs.filter(log => new Date(log.created_at) >= weekAgo);
            break;
        case 'month':
            const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            logsToExport = logs.filter(log => new Date(log.created_at) >= monthAgo);
            break;
        case 'all':
            logsToExport = [...logs];
            break;
    }
    
    // Видалення деталей якщо не потрібно
    if (!includeDetails) {
        logsToExport = logsToExport.map(log => {
            const { details, request_body, ...rest } = log;
            return rest;
        });
    }
    
    let content, filename, mimeType;
    
    switch (format) {
        case 'json':
            content = JSON.stringify(logsToExport, null, 2);
            filename = `system-logs-${new Date().toISOString().slice(0, 10)}.json`;
            mimeType = 'application/json';
            break;
        case 'csv':
            content = convertToCSV(logsToExport);
            filename = `system-logs-${new Date().toISOString().slice(0, 10)}.csv`;
            mimeType = 'text/csv';
            break;
        case 'txt':
            content = convertToText(logsToExport);
            filename = `system-logs-${new Date().toISOString().slice(0, 10)}.txt`;
            mimeType = 'text/plain';
            break;
    }
    
    // Завантаження файлу
    const blob = new Blob([content], { type: mimeType + ';charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    closeModal('exportModal');
    showToast('success', 'Експорт', `Експортовано ${logsToExport.length} записів`);
}

/**
 * Конвертація в CSV
 */
function convertToCSV(data) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [];
    
    csvRows.push(headers.join(','));
    
    for (const row of data) {
        const values = headers.map(header => {
            let val = row[header];
            if (typeof val === 'object') val = JSON.stringify(val);
            if (typeof val === 'string') val = `"${val.replace(/"/g, '""')}"`;
            return val ?? '';
        });
        csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
}

/**
 * Конвертація в текст
 */
function convertToText(data) {
    return data.map(log => {
        const date = new Date(log.created_at).toLocaleString('uk-UA');
        return `[${date}] [${log.level.toUpperCase()}] [${log.category}] ${log.action}: ${log.message}${log.user_email ? ` (${log.user_email})` : ''}`;
    }).join('\n');
}

/**
 * Допоміжні функції
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function truncate(text, length) {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
}

function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

/**
 * Toast повідомлення
 */
function showToast(type, title, message) {
    const container = document.getElementById('toastContainer');
    
    const icons = {
        success: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
        error: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
        warning: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`
    };
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-icon">${icons[type]}</div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    `;
    
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.remove();
    });
    
    container.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 5000);
}

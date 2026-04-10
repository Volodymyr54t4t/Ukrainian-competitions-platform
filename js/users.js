/**
 * JavaScript для адмін-панелі управління користувачами
 * Платформа: Єдина платформа конкурсів України
 */

// ==================== ГЛОБАЛЬНІ ЗМІННІ ====================
let currentUser = null;
let allUsers = [];
let filteredUsers = [];
let allRoles = [];
let currentPage = 1;
const itemsPerPage = 10;
let sortField = "created_at";
let sortDirection = "desc";
let editingUserId = null;

// ==================== ІНІЦІАЛІЗАЦІЯ ====================
document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
});

/**
 * Перевірка авторизації та ролі admin
 */
async function checkAuth() {
  const token = localStorage.getItem("authToken");
  const userStr = localStorage.getItem("user");

  if (!token || !userStr) {
    window.location.href = "/auth.html";
    return;
  }

  try {
    const response = await fetch("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!data.success) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      window.location.href = "/auth.html";
      return;
    }

    currentUser = data.user;

    // Перевірка ролі admin
    if (currentUser.role?.name !== "admin" && currentUser.role !== "admin") {
      showAccessDenied();
      return;
    }

    // Ініціалізація сторінки
    initPage();
  } catch (error) {
    console.error("Auth check error:", error);
    window.location.href = "/auth.html";
  }
}

/**
 * Показати сторінку заборони доступу
 */
function showAccessDenied() {
  document.getElementById("loadingOverlay").classList.add("hidden");
  document.getElementById("accessDeniedPage").style.display = "flex";
  document.getElementById("adminLayout").style.display = "none";
}

/**
 * Ініціалізація сторінки
 */
async function initPage() {
  // Показуємо адмін-панель
  document.getElementById("adminLayout").style.display = "flex";

  // Рендеримо інформацію про користувача
  renderSidebarUser();

  // Завантажуємо ролі
  await loadRoles();

  // Завантажуємо користувачів
  await loadUsers();

  // Приховуємо лоадер
  document.getElementById("loadingOverlay").classList.add("hidden");

  // Ініціалізація обробників подій
  initEventHandlers();
}

/**
 * Рендер інформації про користувача в сайдбарі
 */
function renderSidebarUser() {
  const sidebarUser = document.getElementById("sidebarUser");
  const initials =
    `${currentUser.first_name[0]}${currentUser.last_name[0]}`.toUpperCase();
  const roleName =
    currentUser.role?.display_name ||
    currentUser.role_display_name ||
    "Адміністратор";

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
    const token = localStorage.getItem("authToken");
    const response = await fetch("/api/admin/roles", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      allRoles = data.roles;
      renderRoleFilters();
      renderRoleSelect();
    }
  } catch (error) {
    console.error("Load roles error:", error);
    // Fallback ролі
    allRoles = [
      { id: 1, name: "student", display_name: "Учень" },
      { id: 2, name: "teacher", display_name: "Вчитель" },
      { id: 3, name: "methodist", display_name: "Методист" },
      { id: 4, name: "judge", display_name: "Суддя" },
      { id: 5, name: "admin", display_name: "Адміністратор" },
    ];
    renderRoleFilters();
    renderRoleSelect();
  }
}

/**
 * Рендер фільтра ролей
 */
function renderRoleFilters() {
  const roleFilter = document.getElementById("roleFilter");
  roleFilter.innerHTML = '<option value="">Всі ролі</option>';

  allRoles.forEach((role) => {
    const option = document.createElement("option");
    option.value = role.name;
    option.textContent = role.display_name;
    roleFilter.appendChild(option);
  });
}

/**
 * Рендер селекта ролей в модальному вікні
 */
function renderRoleSelect() {
  const roleSelect = document.getElementById("roleSelect");
  roleSelect.innerHTML = "";

  allRoles.forEach((role) => {
    const option = document.createElement("option");
    option.value = role.id;
    option.textContent = role.display_name;
    roleSelect.appendChild(option);
  });
}

/**
 * Завантаження користувачів
 */
async function loadUsers() {
  const tableLoading = document.getElementById("tableLoading");
  const usersTableBody = document.getElementById("usersTableBody");
  const emptyState = document.getElementById("emptyState");

  tableLoading.style.display = "flex";
  usersTableBody.innerHTML = "";
  emptyState.style.display = "none";

  try {
    const token = localStorage.getItem("authToken");
    const response = await fetch("/api/admin/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      allUsers = data.users;
      filterAndRenderUsers();
      updateStats();
    } else {
      showToast("Помилка завантаження користувачів", "error");
    }
  } catch (error) {
    console.error("Load users error:", error);
    showToast("Помилка з'єднання з сервером", "error");
  } finally {
    tableLoading.style.display = "none";
  }
}

/**
 * Оновлення статистики
 */
function updateStats() {
  document.getElementById("totalUsers").textContent = allUsers.length;

  // Нові користувачі за сьогодні
  const today = new Date().toISOString().split("T")[0];
  const newToday = allUsers.filter((u) => {
    if (!u.created_at) return false;
    return u.created_at.split("T")[0] === today;
  }).length;
  document.getElementById("newUsersToday").textContent = newToday;

  // Кількість адміністраторів
  const adminCount = allUsers.filter(
    (u) => u.role === "admin" || u.role_name === "admin",
  ).length;
  document.getElementById("adminCount").textContent = adminCount;

  // Кількість ролей
  document.getElementById("rolesCount").textContent = allRoles.length;
}

/**
 * Фільтрація та рендер користувачів
 */
function filterAndRenderUsers() {
  const searchInput = document.getElementById("searchInput");
  const roleFilter = document.getElementById("roleFilter");

  const searchTerm = searchInput.value.toLowerCase().trim();
  const roleValue = roleFilter.value;

  // Фільтрація
  filteredUsers = allUsers.filter((user) => {
    const matchesSearch =
      !searchTerm ||
      user.first_name.toLowerCase().includes(searchTerm) ||
      user.last_name.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm);

    const matchesRole =
      !roleValue || user.role === roleValue || user.role_name === roleValue;

    return matchesSearch && matchesRole;
  });

  // Сортування
  filteredUsers.sort((a, b) => {
    let aVal, bVal;

    switch (sortField) {
      case "id":
        aVal = a.id;
        bVal = b.id;
        break;
      case "name":
        aVal = `${a.first_name} ${a.last_name}`.toLowerCase();
        bVal = `${b.first_name} ${b.last_name}`.toLowerCase();
        break;
      case "email":
        aVal = a.email.toLowerCase();
        bVal = b.email.toLowerCase();
        break;
      case "role":
        aVal = (a.role_display_name || a.role || "").toLowerCase();
        bVal = (b.role_display_name || b.role || "").toLowerCase();
        break;
      case "created_at":
      default:
        aVal = new Date(a.created_at || 0).getTime();
        bVal = new Date(b.created_at || 0).getTime();
        break;
    }

    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  renderUsers();
  renderPagination();
}

/**
 * Рендер таблиці користувачів
 */
function renderUsers() {
  const usersTableBody = document.getElementById("usersTableBody");
  const emptyState = document.getElementById("emptyState");

  usersTableBody.innerHTML = "";

  if (filteredUsers.length === 0) {
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageUsers = filteredUsers.slice(startIndex, endIndex);

  pageUsers.forEach((user) => {
    const tr = document.createElement("tr");
    const initials = `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    const roleName = user.role_name || user.role;
    const roleDisplayName =
      user.role_display_name || getRoleDisplayName(roleName);
    const createdAt = formatDate(user.created_at);

    tr.innerHTML = `
            <td><input type="checkbox" class="checkbox user-checkbox" data-id="${user.id}"></td>
            <td>${user.id}</td>
            <td>
                <div class="user-cell">
                    <div class="user-cell-avatar">${initials}</div>
                    <div class="user-cell-info">
                        <span class="user-cell-name">${user.first_name} ${user.last_name}</span>
                        <span class="user-cell-id">ID: ${user.id}</span>
                    </div>
                </div>
            </td>
            <td>${user.email}</td>
            <td><span class="role-badge ${roleName}">${roleDisplayName}</span></td>
            <td>${createdAt}</td>
            <td>
                <div class="actions-cell">
                    <button class="btn-icon view" title="Переглянути" onclick="viewUser(${user.id})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                    <button class="btn-icon edit" title="Редагувати" onclick="editUser(${user.id})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="btn-icon delete" title="Видалити" onclick="confirmDeleteUser(${user.id}, '${user.first_name} ${user.last_name}')" ${user.id === currentUser.id ? "disabled" : ""}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                </div>
            </td>
        `;

    usersTableBody.appendChild(tr);
  });
}

/**
 * Рендер пагінації
 */
function renderPagination() {
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginationPages = document.getElementById("paginationPages");
  const prevBtn = document.getElementById("prevPage");
  const nextBtn = document.getElementById("nextPage");

  // Оновлення інформації
  const startIndex =
    filteredUsers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endIndex = Math.min(currentPage * itemsPerPage, filteredUsers.length);
  document.getElementById("showingFrom").textContent = startIndex;
  document.getElementById("showingTo").textContent = endIndex;
  document.getElementById("totalCount").textContent = filteredUsers.length;

  // Кнопки prev/next
  prevBtn.disabled = currentPage <= 1;
  nextBtn.disabled = currentPage >= totalPages;

  // Номери сторінок
  paginationPages.innerHTML = "";

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      addPageButton(paginationPages, i);
    }
  } else {
    addPageButton(paginationPages, 1);

    if (currentPage > 3) {
      const ellipsis = document.createElement("span");
      ellipsis.className = "pagination-ellipsis";
      ellipsis.textContent = "...";
      paginationPages.appendChild(ellipsis);
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      addPageButton(paginationPages, i);
    }

    if (currentPage < totalPages - 2) {
      const ellipsis = document.createElement("span");
      ellipsis.className = "pagination-ellipsis";
      ellipsis.textContent = "...";
      paginationPages.appendChild(ellipsis);
    }

    addPageButton(paginationPages, totalPages);
  }
}

/**
 * Додавання кнопки сторінки
 */
function addPageButton(container, pageNum) {
  const btn = document.createElement("button");
  btn.className = `pagination-page ${pageNum === currentPage ? "active" : ""}`;
  btn.textContent = pageNum;
  btn.onclick = () => goToPage(pageNum);
  container.appendChild(btn);
}

/**
 * Перехід на сторінку
 */
function goToPage(page) {
  currentPage = page;
  renderUsers();
  renderPagination();
}

/**
 * Ініціалізація обробників подій
 */
function initEventHandlers() {
  // Пошук
  const searchInput = document.getElementById("searchInput");
  let searchTimeout;
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentPage = 1;
      filterAndRenderUsers();
    }, 300);
  });

  // Фільтр по ролі
  document.getElementById("roleFilter").addEventListener("change", () => {
    currentPage = 1;
    filterAndRenderUsers();
  });

  // Кнопка оновлення
  document.getElementById("refreshBtn").addEventListener("click", async () => {
    const btn = document.getElementById("refreshBtn");
    btn.classList.add("spinning");
    await loadUsers();
    btn.classList.remove("spinning");
    showToast("Список оновлено", "success");
  });

  // Пагінація
  document.getElementById("prevPage").addEventListener("click", () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  });

  document.getElementById("nextPage").addEventListener("click", () => {
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  });

  // Сортування
  document.querySelectorAll(".sortable").forEach((th) => {
    th.addEventListener("click", () => {
      const field = th.dataset.sort;
      if (sortField === field) {
        sortDirection = sortDirection === "asc" ? "desc" : "asc";
      } else {
        sortField = field;
        sortDirection = "asc";
      }
      filterAndRenderUsers();
    });
  });

  // Вибір всіх
  document.getElementById("selectAll").addEventListener("change", (e) => {
    document.querySelectorAll(".user-checkbox").forEach((cb) => {
      cb.checked = e.target.checked;
    });
  });

  // Модальне вікно додавання користувача
  document
    .getElementById("addUserBtn")
    .addEventListener("click", () => openUserModal());
  document
    .getElementById("modalClose")
    .addEventListener("click", closeUserModal);
  document
    .getElementById("cancelBtn")
    .addEventListener("click", closeUserModal);

  // Модальне вікно перегляду
  document
    .getElementById("viewModalClose")
    .addEventListener("click", closeViewModal);
  document
    .getElementById("closeViewBtn")
    .addEventListener("click", closeViewModal);
  document.getElementById("editFromViewBtn").addEventListener("click", () => {
    closeViewModal();
    if (editingUserId) {
      editUser(editingUserId);
    }
  });

  // Модальне вікно видалення
  document
    .getElementById("deleteModalClose")
    .addEventListener("click", closeDeleteModal);
  document
    .getElementById("cancelDeleteBtn")
    .addEventListener("click", closeDeleteModal);

  // Форма користувача
  document
    .getElementById("userForm")
    .addEventListener("submit", handleUserFormSubmit);

  // Toggle password visibility
  document.querySelectorAll(".password-toggle").forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const targetId = toggle.dataset.target;
      const input = document.getElementById(targetId);
      const icon = toggle.querySelector(".eye-icon");

      if (input.type === "password") {
        input.type = "text";
        icon.innerHTML = `
                    <path d="M2.5 2.5L17.5 17.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M8.33333 8.33333C7.41286 9.25381 7.41286 10.7462 8.33333 11.6667C9.25381 12.5871 10.7462 12.5871 11.6667 11.6667" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M4.16667 5.83333C2.5 7.5 1.66667 10 1.66667 10C1.66667 10 4.16667 15.8333 10 15.8333C11.6667 15.8333 13.0833 15.3333 14.1667 14.5833" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                `;
      } else {
        input.type = "password";
        icon.innerHTML = `
                    <path d="M1.66667 10C1.66667 10 4.16667 4.16666 10 4.16666C15.8333 4.16666 18.3333 10 18.3333 10C18.3333 10 15.8333 15.8333 10 15.8333C4.16667 15.8333 1.66667 10 1.66667 10Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="10" cy="10" r="2.5" stroke="currentColor" stroke-width="1.5"/>
                `;
      }
    });
  });

  // Закриття модалок по кліку на оверлей
  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.classList.remove("active");
      }
    });
  });

  // Вихід
  document.getElementById("logoutBtn").addEventListener("click", logout);

  // Мобільне меню
  document.getElementById("menuToggle").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("open");
    document.getElementById("sidebarOverlay").classList.toggle("active");
  });

  document.getElementById("sidebarOverlay").addEventListener("click", () => {
    document.getElementById("sidebar").classList.remove("open");
    document.getElementById("sidebarOverlay").classList.remove("active");
  });
}

/**
 * Відкрити модалку для додавання/редагування користувача
 */
function openUserModal(user = null) {
  const modal = document.getElementById("userModal");
  const title = document.getElementById("modalTitle");
  const form = document.getElementById("userForm");
  const passwordGroup = document.getElementById("passwordGroup");
  const passwordRequired = document.getElementById("passwordRequired");
  const passwordHint = document.getElementById("passwordHint");
  const passwordInput = document.getElementById("password");

  form.reset();

  if (user) {
    title.textContent = "Редагувати користувача";
    document.getElementById("userId").value = user.id;
    document.getElementById("firstName").value = user.first_name;
    document.getElementById("lastName").value = user.last_name;
    document.getElementById("email").value = user.email;
    document.getElementById("roleSelect").value = user.role_id;

    // Пароль необов'язковий при редагуванні
    passwordRequired.style.display = "none";
    passwordHint.textContent = "Залиште порожнім, щоб не змінювати пароль.";
    passwordInput.required = false;

    editingUserId = user.id;
  } else {
    title.textContent = "Додати користувача";
    document.getElementById("userId").value = "";

    // Пароль обов'язковий при створенні
    passwordRequired.style.display = "inline";
    passwordHint.textContent = "Мінімум 6 символів.";
    passwordInput.required = true;

    editingUserId = null;
  }

  modal.classList.add("active");
}

/**
 * Закрити модалку користувача
 */
function closeUserModal() {
  document.getElementById("userModal").classList.remove("active");
  document.getElementById("userForm").reset();
  editingUserId = null;
}

/**
 * Обробка форми користувача
 */
async function handleUserFormSubmit(e) {
  e.preventDefault();

  const userId = document.getElementById("userId").value;
  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const roleId = document.getElementById("roleSelect").value;

  // Валідація
  if (!firstName || !lastName || !email || !roleId) {
    showToast("Заповніть всі обов'язкові поля", "error");
    return;
  }

  if (!userId && (!password || password.length < 6)) {
    showToast("Пароль повинен містити мінімум 6 символів", "error");
    return;
  }

  const saveBtn = document.getElementById("saveBtn");
  saveBtn.disabled = true;
  saveBtn.innerHTML =
    '<span class="loading-spinner small"></span> Збереження...';

  try {
    const token = localStorage.getItem("authToken");
    const url = userId ? `/api/admin/users/${userId}` : "/api/admin/users";
    const method = userId ? "PUT" : "POST";

    const body = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      role_id: parseInt(roleId),
    };

    if (password) {
      body.password = password;
    }

    const response = await fetch(url, {
      method: method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (data.success) {
      showToast(
        userId ? "Користувача оновлено" : "Користувача створено",
        "success",
      );
      closeUserModal();
      await loadUsers();
    } else {
      showToast(data.message || "Помилка збереження", "error");
    }
  } catch (error) {
    console.error("Save user error:", error);
    showToast("Помилка з'єднання з сервером", "error");
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = "Зберегти";
  }
}

/**
 * Переглянути користувача
 */
function viewUser(userId) {
  const user = allUsers.find((u) => u.id === userId);
  if (!user) return;

  editingUserId = userId;

  const initials = `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
  const roleName = user.role_name || user.role;
  const roleDisplayName =
    user.role_display_name || getRoleDisplayName(roleName);
  const createdAt = formatDate(user.created_at);

  const profileCard = document.getElementById("userProfileCard");
  profileCard.innerHTML = `
        <div class="profile-header">
            <div class="profile-avatar-large">${initials}</div>
            <h3 class="profile-name">${user.first_name} ${user.last_name}</h3>
            <p class="profile-email">${user.email}</p>
            <span class="role-badge ${roleName}">${roleDisplayName}</span>
        </div>
        <div class="profile-details">
            <div class="profile-detail-item">
                <div class="profile-detail-label">ID користувача</div>
                <div class="profile-detail-value">${user.id}</div>
            </div>
            <div class="profile-detail-item">
                <div class="profile-detail-label">Дата реєстрації</div>
                <div class="profile-detail-value">${createdAt}</div>
            </div>
            <div class="profile-detail-item">
                <div class="profile-detail-label">Роль</div>
                <div class="profile-detail-value">${roleDisplayName}</div>
            </div>
            <div class="profile-detail-item">
                <div class="profile-detail-label">Email</div>
                <div class="profile-detail-value">${user.email}</div>
            </div>
        </div>
    `;

  document.getElementById("viewUserModal").classList.add("active");
}

/**
 * Закрити модалку перегляду
 */
function closeViewModal() {
  document.getElementById("viewUserModal").classList.remove("active");
}

/**
 * Редагувати користувача
 */
function editUser(userId) {
  const user = allUsers.find((u) => u.id === userId);
  if (!user) return;

  openUserModal(user);
}

/**
 * Підтвердження видалення користувача
 */
function confirmDeleteUser(userId, userName) {
  if (userId === currentUser.id) {
    showToast("Ви не можете видалити себе", "warning");
    return;
  }

  editingUserId = userId;
  document.getElementById("deleteUserName").textContent = userName;
  document.getElementById("deleteModal").classList.add("active");

  document.getElementById("confirmDeleteBtn").onclick = () =>
    deleteUser(userId);
}

/**
 * Закрити модалку видалення
 */
function closeDeleteModal() {
  document.getElementById("deleteModal").classList.remove("active");
  editingUserId = null;
}

/**
 * Видалити користувача
 */
async function deleteUser(userId) {
  const confirmBtn = document.getElementById("confirmDeleteBtn");
  confirmBtn.disabled = true;
  confirmBtn.innerHTML = '<span class="loading-spinner small"></span>';

  try {
    const token = localStorage.getItem("authToken");
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      showToast("Користувача видалено", "success");
      closeDeleteModal();
      await loadUsers();
    } else {
      showToast(data.message || "Помилка видалення", "error");
    }
  } catch (error) {
    console.error("Delete user error:", error);
    showToast("Помилка з'єднання з сервером", "error");
  } finally {
    confirmBtn.disabled = false;
    confirmBtn.innerHTML = "Видалити";
  }
}

/**
 * Вихід з системи
 */
function logout() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
  window.location.href = "/auth.html";
}

/**
 * Показати повідомлення про нереалізовану функцію
 */
function showNotImplemented() {
  showToast("Ця функція ще в розробці", "info");
}

// ==================== ДОПОМІЖНІ ФУНКЦІЇ ====================

/**
 * Отримати відображуване ім'я ролі
 */
function getRoleDisplayName(roleName) {
  const roleNames = {
    student: "Учень",
    teacher: "Вчитель",
    methodist: "Методист",
    judge: "Суддя",
    admin: "Адміністратор",
  };
  return roleNames[roleName] || roleName;
}

/**
 * Форматування дати
 */
function formatDate(dateStr) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Показати toast повідомлення
 */
function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");

  const icons = {
    success:
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
    error:
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
    warning:
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
    info: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
  };

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    `;

  toast.querySelector(".toast-close").addEventListener("click", () => {
    toast.remove();
  });

  container.appendChild(toast);

  // Автоматичне видалення через 5 секунд
  setTimeout(() => {
    if (toast.parentNode) {
      toast.remove();
    }
  }, 5000);
}

// Експорт для глобального доступу
window.viewUser = viewUser;
window.editUser = editUser;
window.confirmDeleteUser = confirmDeleteUser;
window.showNotImplemented = showNotImplemented;

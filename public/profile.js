// =============================================
// Mock Data (замінити на API запити до бази)
// =============================================

const MOCK_SCHOOLS = [
    { id: 1, system_id: 15699, short_name: 'Салезіянський ліцей "Всесвіт"', ownership_type: 'приватна' },
    { id: 2, system_id: 16907, short_name: 'Вересівський ліцей Житомирської міської ради', ownership_type: 'комунальна' },
    { id: 3, system_id: 24081, short_name: 'Науковий ліцей ЖДУ ім. Івана Франка', ownership_type: 'державна' },
    { id: 4, system_id: 15697, short_name: 'ЖПХЛ "Сяйво"', ownership_type: 'приватна' },
    { id: 5, system_id: 15671, short_name: 'Ліцей № 10 м. Житомира', ownership_type: 'комунальна' },
    { id: 6, system_id: 15679, short_name: 'Ліцей № 21 м. Житомира', ownership_type: 'комунальна' },
    { id: 7, system_id: 15668, short_name: 'Ліцей № 6 м. Житомира ім. В.Г. Короленка', ownership_type: 'комунальна' },
    { id: 8, system_id: 15693, short_name: 'Ліцей № 1 м. Житомира', ownership_type: 'комунальна' },
    { id: 9, system_id: 15672, short_name: 'Ліцей № 12 м. Житомира ім. С. Ковальчука', ownership_type: 'комунальна' },
    { id: 10, system_id: 15673, short_name: 'Ліцей № 14 м. Житомира', ownership_type: 'комунальна' },
    { id: 11, system_id: 15674, short_name: 'Ліцей № 15 м. Житомира', ownership_type: 'комунальна' },
    { id: 12, system_id: 15675, short_name: 'Ліцей № 16 м. Житомира', ownership_type: 'комунальна' },
    { id: 13, system_id: 15676, short_name: 'Ліцей № 17 м. Житомира', ownership_type: 'комунальна' },
    { id: 14, system_id: 15677, short_name: 'Ліцей № 19 м. Житомира', ownership_type: 'комунальна' },
    { id: 15, system_id: 15665, short_name: 'Ліцей № 2 м. Житомира', ownership_type: 'комунальна' },
    { id: 16, system_id: 15678, short_name: 'Ліцей № 20 м. Житомира', ownership_type: 'комунальна' },
    { id: 17, system_id: 15680, short_name: 'Ліцей № 22 м. Житомира ім. В. Кавуна', ownership_type: 'комунальна' },
    { id: 18, system_id: 15681, short_name: 'Ліцей № 23 м. Житомира ім. М.Очерета', ownership_type: 'комунальна' },
    { id: 19, system_id: 15682, short_name: 'Ліцей № 24 м. Житомира', ownership_type: 'комунальна' },
    { id: 20, system_id: 15683, short_name: 'Ліцей № 25 м. Житомира', ownership_type: 'комунальна' },
    { id: 21, system_id: 15684, short_name: 'Ліцей № 26 м. Житомира', ownership_type: 'комунальна' },
    { id: 22, system_id: 15685, short_name: 'Ліцей № 27 м. Житомира', ownership_type: 'комунальна' },
    { id: 23, system_id: 15686, short_name: 'Ліцей № 28 м. Житомира ім. Гетьмана І. Виговського', ownership_type: 'комунальна' },
    { id: 24, system_id: 15666, short_name: 'Ліцей № 3 м. Житомира', ownership_type: 'комунальна' },
    { id: 25, system_id: 15687, short_name: 'Ліцей № 30 м. Житомира', ownership_type: 'комунальна' },
    { id: 26, system_id: 15694, short_name: 'Ліцей № 31 м. Житомира', ownership_type: 'комунальна' },
    { id: 27, system_id: 15688, short_name: 'Ліцей № 32 м. Житомира', ownership_type: 'комунальна' },
    { id: 28, system_id: 15689, short_name: 'Ліцей № 33 м. Житомира', ownership_type: 'комунальна' },
    { id: 29, system_id: 15690, short_name: 'Ліцей № 34 м. Житомира', ownership_type: 'комунальна' },
    { id: 30, system_id: 15691, short_name: 'Ліцей № 35 м. Житомира', ownership_type: 'комунальна' },
    { id: 31, system_id: 15692, short_name: 'Ліцей № 36 м. Житомира ім. Я. Домбровського', ownership_type: 'комунальна' },
    { id: 32, system_id: 15664, short_name: 'Ліцей № 4 м. Житомира', ownership_type: 'комунальна' },
    { id: 33, system_id: 15667, short_name: 'Ліцей № 5 м. Житомира', ownership_type: 'комунальна' },
    { id: 34, system_id: 15669, short_name: 'Ліцей № 7 м. Житомира ім. В.Бражевського', ownership_type: 'комунальна' },
    { id: 35, system_id: 15670, short_name: 'Ліцей № 8 м. Житомира', ownership_type: 'комунальна' },
    { id: 36, system_id: 24066, short_name: 'Науковий ліцей Житомирської політехніки', ownership_type: 'державна' },
    { id: 37, system_id: 15698, short_name: 'ПЛ "Ор Авнер" м. Житомира', ownership_type: 'приватна' },
    { id: 38, system_id: 20075, short_name: 'Початкова школа № 11 м. Житомира', ownership_type: 'комунальна' },
    { id: 39, system_id: 24592, short_name: 'ТОВ "ЗНЗ" "Синергія"', ownership_type: 'приватна' },
    { id: 40, system_id: 24031, short_name: 'ТОВ «ЗАКЛАД ОСВІТИ «УСПІХ»', ownership_type: 'приватна' },
    { id: 41, system_id: 24106, short_name: 'ТОВ «ПРИВАТНИЙ ЛІЦЕЙ «АЙ ТІ СТЕП СКУЛ ЖИТОМИР»', ownership_type: 'приватна' },
    { id: 42, system_id: 24618, short_name: 'Науковий ліцей ПНУ', ownership_type: 'державна' },
    { id: 43, system_id: 24634, short_name: 'Житомирський ліцей КІБіТ', ownership_type: 'приватна' }
];

const MOCK_SUBJECTS = [
    { id: 1, name: 'Математика' },
    { id: 2, name: 'Українська мова' },
    { id: 3, name: 'Українська література' },
    { id: 4, name: 'Англійська мова' },
    { id: 5, name: 'Фізика' },
    { id: 6, name: 'Хімія' },
    { id: 7, name: 'Біологія' },
    { id: 8, name: 'Географія' },
    { id: 9, name: 'Історія України' },
    { id: 10, name: 'Інформатика' },
    { id: 11, name: 'Програмування' },
    { id: 12, name: 'Економіка' }
];

const ROLE_NAMES = {
    student: 'Учень',
    teacher: 'Вчитель',
    vice_principal: 'Завуч',
    methodist: 'Методист',
    jury: 'Журі',
    admin: 'Адміністратор'
};

// =============================================
// State
// =============================================
let currentRole = 'student';
let profileData = {
    firstName: 'Іван',
    lastName: 'Петренко',
    email: 'ivan@example.com',
    phone: '+380 67 123 45 67'
};

// =============================================
// DOM Elements
// =============================================
const roleSelector = document.getElementById('roleSelector');
const profileForm = document.getElementById('profileForm');
const saveBtn = document.getElementById('saveBtn');
const toast = document.getElementById('toast');
const photoInput = document.getElementById('photoInput');

// Sections
const locationSection = document.getElementById('locationSection');
const studentSection = document.getElementById('studentSection');
const teacherSection = document.getElementById('teacherSection');
const vicePrincipalSection = document.getElementById('vicePrincipalSection');
const methodistSection = document.getElementById('methodistSection');
const jurySection = document.getElementById('jurySection');
const adminSection = document.getElementById('adminSection');

// =============================================
// Initialize
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    initRoleSelector();
    initSchoolSelects();
    initSubjectCheckboxes();
    initPhotoUpload();
    initSaveButton();
    updateProfileDisplay();
    switchRole('student');
});

// =============================================
// Role Selector
// =============================================
function initRoleSelector() {
    roleSelector.addEventListener('change', (e) => {
        switchRole(e.target.value);
    });
}

function switchRole(role) {
    currentRole = role;
    
    // Сховати всі секції ролей
    const roleSections = document.querySelectorAll('.role-section');
    roleSections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Показати/сховати секцію локації
    if (role === 'admin') {
        locationSection.style.display = 'none';
    } else {
        locationSection.style.display = 'block';
    }
    
    // Показати відповідну секцію
    switch (role) {
        case 'student':
            studentSection.style.display = 'block';
            break;
        case 'teacher':
            teacherSection.style.display = 'block';
            break;
        case 'vice_principal':
            vicePrincipalSection.style.display = 'block';
            break;
        case 'methodist':
            methodistSection.style.display = 'block';
            break;
        case 'jury':
            jurySection.style.display = 'block';
            break;
        case 'admin':
            adminSection.style.display = 'block';
            break;
    }
    
    // Оновити badge ролі
    document.getElementById('roleBadge').textContent = ROLE_NAMES[role];
}

// =============================================
// School Selects
// =============================================
function initSchoolSelects() {
    const schoolSelects = [
        document.getElementById('studentSchool'),
        document.getElementById('teacherSchool'),
        document.getElementById('vpSchool')
    ];
    
    schoolSelects.forEach(select => {
        if (select) {
            // Очистити і додати опції
            select.innerHTML = '<option value="">Оберіть заклад</option>';
            MOCK_SCHOOLS.forEach(school => {
                const option = document.createElement('option');
                option.value = school.id;
                option.textContent = `${school.short_name} (${school.ownership_type})`;
                select.appendChild(option);
            });
        }
    });
}

// =============================================
// Subject Checkboxes
// =============================================
function initSubjectCheckboxes() {
    const studentSubjectsContainer = document.getElementById('studentSubjects');
    const teacherSubjectsContainer = document.getElementById('teacherSubjects');
    
    const createCheckboxes = (container, prefix) => {
        if (!container) return;
        container.innerHTML = '';
        MOCK_SUBJECTS.forEach(subject => {
            const label = document.createElement('label');
            label.className = 'checkbox-item';
            label.innerHTML = `
                <input type="checkbox" name="${prefix}_subject_${subject.id}" value="${subject.id}">
                <span>${subject.name}</span>
            `;
            container.appendChild(label);
        });
    };
    
    createCheckboxes(studentSubjectsContainer, 'student');
    createCheckboxes(teacherSubjectsContainer, 'teacher');
}

// =============================================
// Photo Upload
// =============================================
function initPhotoUpload() {
    photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const avatarImage = document.getElementById('avatarImage');
                const avatarText = document.getElementById('avatarText');
                
                avatarImage.src = event.target.result;
                avatarImage.style.display = 'block';
                avatarText.style.display = 'none';
                
                // Оновити і в хедері
                const headerAvatar = document.getElementById('headerAvatar');
                headerAvatar.innerHTML = `<img src="${event.target.result}" alt="Avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
            };
            reader.readAsDataURL(file);
        }
    });
}

// =============================================
// Save Button
// =============================================
function initSaveButton() {
    saveBtn.addEventListener('click', (e) => {
        e.preventDefault();
        saveProfile();
    });
}

function saveProfile() {
    // Збір даних з форми
    const formData = new FormData(profileForm);
    const data = Object.fromEntries(formData.entries());
    
    // Додати вибрані чекбокси (предмети)
    const selectedSubjects = [];
    document.querySelectorAll('input[name^="student_subject_"]:checked, input[name^="teacher_subject_"]:checked').forEach(cb => {
        selectedSubjects.push(parseInt(cb.value));
    });
    data.subjects = selectedSubjects;
    
    // Зберегти роль
    data.role = currentRole;
    
    console.log('Saving profile data:', data);
    
    // Тут буде API запит до бази
    // Приклад:
    // await fetch('/api/profile', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(data)
    // });
    
    // Показати toast
    showToast('Зміни успішно збережено!');
    
    // Оновити відображення
    updateProfileDisplay();
}

// =============================================
// Profile Display
// =============================================
function updateProfileDisplay() {
    const firstName = document.getElementById('firstName').value || profileData.firstName;
    const lastName = document.getElementById('lastName').value || profileData.lastName;
    
    // Оновити ім'я
    document.getElementById('profileName').textContent = `${firstName} ${lastName}`;
    
    // Оновити аватар
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    const avatarText = document.getElementById('avatarText');
    const headerAvatarText = document.getElementById('headerAvatarText');
    
    if (avatarText && !document.getElementById('avatarImage').src) {
        avatarText.textContent = initials;
    }
    if (headerAvatarText) {
        headerAvatarText.textContent = initials;
    }
}

// Слухачі для полів імені
document.getElementById('firstName')?.addEventListener('input', updateProfileDisplay);
document.getElementById('lastName')?.addEventListener('input', updateProfileDisplay);

// =============================================
// Toast Notification
// =============================================
function showToast(message) {
    const toastMessage = document.getElementById('toastMessage');
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// =============================================
// API Functions (для інтеграції з базою)
// =============================================

/**
 * Отримати профіль користувача з бази
 * @param {number} userId - ID користувача
 * @returns {Promise<Object>} - Дані профілю
 */
async function fetchProfile(userId) {
    // Замінити на реальний API endpoint
    const response = await fetch(`/api/profile/${userId}`);
    return response.json();
}

/**
 * Зберегти профіль користувача в базу
 * @param {Object} profileData - Дані профілю
 * @returns {Promise<Object>} - Результат збереження
 */
async function saveProfileToDatabase(profileData) {
    // Формуємо SQL запит в залежності від ролі
    const endpoints = {
        student: '/api/profile/student',
        teacher: '/api/profile/teacher',
        vice_principal: '/api/profile/vice-principal',
        methodist: '/api/profile/methodist',
        jury: '/api/profile/jury',
        admin: '/api/profile/admin'
    };
    
    const response = await fetch(endpoints[profileData.role], {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
    });
    
    return response.json();
}

/**
 * Отримати список шкіл з бази за містом
 * @param {number} cityId - ID міста
 * @returns {Promise<Array>} - Список шкіл
 */
async function fetchSchoolsByCity(cityId) {
    const response = await fetch(`/api/schools?city=${cityId}`);
    return response.json();
}

/**
 * Пошук шкіл за назвою
 * @param {string} searchTerm - Пошуковий запит
 * @param {number} cityId - ID міста (опціонально)
 * @returns {Promise<Array>} - Список знайдених шкіл
 */
async function searchSchools(searchTerm, cityId = null) {
    let url = `/api/schools/search?q=${encodeURIComponent(searchTerm)}`;
    if (cityId) {
        url += `&city=${cityId}`;
    }
    const response = await fetch(url);
    return response.json();
}

// =============================================
// Example SQL Queries (для довідки)
// =============================================

/*
-- Отримати профіль учня
SELECT * FROM get_user_profile(1);

-- Оновити профіль учня
SELECT update_student_profile(
    1,                          -- user_id
    'Іван',                     -- first_name
    'Петренко',                 -- last_name
    '+380671234567',            -- phone
    'https://example.com/photo.jpg', -- photo_url
    1,                          -- city_id
    5,                          -- school_id
    '2008-05-15',              -- birth_date
    '10-А',                     -- class_name
    'regional',                 -- participation_level
    'Переможець обласної олімпіади', -- achievements
    'https://portfolio.com',    -- portfolio_url
    'https://github.com/user',  -- github_url
    10.5,                       -- average_grade
    ARRAY['Аналітичне мислення', 'Креативність'], -- strengths
    ARRAY[1, 5, 10]            -- subject_ids
);

-- Отримати школи за містом
SELECT * FROM get_schools_by_city(1);

-- Пошук шкіл
SELECT * FROM search_schools('Ліцей № 1', 1);
*/

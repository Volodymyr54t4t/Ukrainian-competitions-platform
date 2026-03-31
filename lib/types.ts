// Типи ролей користувачів
export type UserRole = 'student' | 'teacher' | 'vice_principal' | 'methodist' | 'judge' | 'admin'

export const ROLE_LABELS: Record<UserRole, string> = {
  student: 'Учень',
  teacher: 'Вчитель',
  vice_principal: 'Завуч',
  methodist: 'Методист',
  judge: 'Журі',
  admin: 'Адмін',
}

// Інтерфейси
export interface Region {
  id: number
  name: string
  code: string
}

export interface City {
  id: number
  name: string
  region_id: number
}

export interface School {
  id: number
  system_id: string
  full_name: string
  short_name: string
  ownership_type: 'державна' | 'комунальна' | 'приватна'
  address: string
  city_id: number
  region_id: number
}

// Базовий профіль
export interface BaseProfile {
  id?: number
  user_id: number
  first_name: string
  last_name: string
  middle_name?: string
  email: string
  phone?: string
  avatar_url?: string
  date_of_birth?: string
  city_id?: number
  region_id?: number
  is_verified: boolean
  last_login?: string
  created_at?: string
}

// Профіль учня
export interface StudentProfile extends BaseProfile {
  role: 'student'
  grade?: string
  school_id?: number
  interests?: string[]
  participation_level?: string
  achievements?: string
  certificates_urls?: string[]
  portfolio_url?: string
  mentor_id?: number
  average_score?: number
  previous_competitions?: string[]
  strengths?: string[]
}

// Профіль вчителя
export interface TeacherProfile extends BaseProfile {
  role: 'teacher'
  school_id?: number
  position?: string
  experience_years?: number
  subjects?: string[]
  teaching_grades?: string[]
  student_achievements?: string
  preparation_experience?: string
  teacher_portfolio_url?: string
  rating?: number
  winners_count?: number
}

// Профіль завуча
export interface VicePrincipalProfile extends BaseProfile {
  role: 'vice_principal'
  school_id?: number
  position?: string
  school_contact_info?: {
    phone?: string
    email?: string
    website?: string
  }
  school_statistics?: {
    students_count?: number
    teachers_count?: number
  }
  school_rating?: number
  participants_count?: number
  victories_count?: number
}

// Профіль методиста
export interface MethodistProfile extends BaseProfile {
  role: 'methodist'
  organization?: string
  activity_direction?: string
  managed_competitions?: string[]
  competition_templates?: string[]
  regional_schools?: number[]
  regional_statistics?: Record<string, unknown>
  access_rights?: Record<string, boolean>
}

// Профіль журі
export interface JudgeProfile extends BaseProfile {
  role: 'judge'
  judge_organization?: string
  specialization?: string
  country?: string
  judge_position?: string
  judge_experience?: string
  evaluation_directions?: string[]
  assigned_competitions?: number[]
  works_to_evaluate?: number
}

// Профіль адміна
export interface AdminProfile extends BaseProfile {
  role: 'admin'
  admin_role?: 'super_admin' | 'support'
  access_logs?: string[]
}

// Union тип для всіх профілів
export type UserProfile =
  | StudentProfile
  | TeacherProfile
  | VicePrincipalProfile
  | MethodistProfile
  | JudgeProfile
  | AdminProfile

// Предмети
export const SUBJECTS = [
  'Математика',
  'Українська мова',
  'Українська література',
  'Англійська мова',
  'Німецька мова',
  'Французька мова',
  'Фізика',
  'Хімія',
  'Біологія',
  'Географія',
  'Історія України',
  'Всесвітня історія',
  'Інформатика',
  'Програмування',
  'Економіка',
  'Правознавство',
  'Астрономія',
  'Екологія',
  'Мистецтво',
  'Музика',
  'Трудове навчання',
  'Фізична культура',
]

// Класи
export const GRADES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11']

// Рівні участі
export const PARTICIPATION_LEVELS = [
  'Шкільний',
  'Районний',
  'Міський',
  'Обласний',
  'Всеукраїнський',
  'Міжнародний',
]

// Напрями оцінювання
export const EVALUATION_DIRECTIONS = [
  'Природничі науки',
  'Математичні науки',
  'Гуманітарні науки',
  'Технічні науки',
  'Мистецтво',
  'Спорт',
  'Соціальні науки',
]

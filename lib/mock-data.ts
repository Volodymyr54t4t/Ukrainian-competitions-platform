import type { Region, City, School } from './types'

// Регіони України
export const REGIONS: Region[] = [
  { id: 1, name: 'Вінницька область', code: 'VIN' },
  { id: 2, name: 'Волинська область', code: 'VOL' },
  { id: 3, name: 'Дніпропетровська область', code: 'DNI' },
  { id: 4, name: 'Донецька область', code: 'DON' },
  { id: 5, name: 'Житомирська область', code: 'ZHY' },
  { id: 6, name: 'Закарпатська область', code: 'ZAK' },
  { id: 7, name: 'Запорізька область', code: 'ZAP' },
  { id: 8, name: 'Івано-Франківська область', code: 'IVF' },
  { id: 9, name: 'Київська область', code: 'KYI' },
  { id: 10, name: 'Кіровоградська область', code: 'KIR' },
  { id: 11, name: 'Луганська область', code: 'LUG' },
  { id: 12, name: 'Львівська область', code: 'LVI' },
  { id: 13, name: 'Миколаївська область', code: 'MYK' },
  { id: 14, name: 'Одеська область', code: 'ODE' },
  { id: 15, name: 'Полтавська область', code: 'POL' },
  { id: 16, name: 'Рівненська область', code: 'RIV' },
  { id: 17, name: 'Сумська область', code: 'SUM' },
  { id: 18, name: 'Тернопільська область', code: 'TER' },
  { id: 19, name: 'Харківська область', code: 'KHA' },
  { id: 20, name: 'Херсонська область', code: 'KHE' },
  { id: 21, name: 'Хмельницька область', code: 'KHM' },
  { id: 22, name: 'Черкаська область', code: 'CHK' },
  { id: 23, name: 'Чернівецька область', code: 'CHN' },
  { id: 24, name: 'Чернігівська область', code: 'CHG' },
  { id: 25, name: 'м. Київ', code: 'KYV' },
]

// Міста (приклад для Житомирської області)
export const CITIES: City[] = [
  { id: 1, name: 'Житомир', region_id: 5 },
  { id: 2, name: 'Бердичів', region_id: 5 },
  { id: 3, name: 'Коростень', region_id: 5 },
  { id: 4, name: 'Новоград-Волинський', region_id: 5 },
  { id: 5, name: 'Київ', region_id: 25 },
]

// Навчальні заклади Житомира
export const SCHOOLS_ZHYTOMYR: School[] = [
  { id: 1, system_id: '15699', full_name: 'Салезіянський приватний ліцей "Всесвіт" м.Житомира', short_name: 'Салезіянський ліцей "Всесвіт"', ownership_type: 'приватна', address: 'вул. Корабельна, 10', city_id: 1, region_id: 5 },
  { id: 2, system_id: '16907', full_name: 'Вересівський ліцей Житомирської міської ради', short_name: 'Вересівський ліцей', ownership_type: 'комунальна', address: 'с.Вереси, вул. Шевченка, 1', city_id: 1, region_id: 5 },
  { id: 3, system_id: '24081', full_name: 'Відокремлений підрозділ "Науковий ліцей Житомирського державного університету імені Івана Франка"', short_name: 'Науковий ліцей ЖДУ ім. Івана Франка', ownership_type: 'державна', address: 'вул. Велика Бердичівська, 40', city_id: 1, region_id: 5 },
  { id: 4, system_id: '15697', full_name: 'ЖИТОМИРСЬКИЙ ПРИВАТНИЙ ХРИСТИЯНСЬКИЙ ЛІЦЕЙ "СЯЙВО" М.ЖИТОМИРА', short_name: 'ЖПХЛ "Сяйво"', ownership_type: 'приватна', address: 'вул. Коцюбинського, 5', city_id: 1, region_id: 5 },
  { id: 5, system_id: '15693', full_name: 'Ліцей № 1 міста Житомира', short_name: 'Ліцей № 1 м. Житомира', ownership_type: 'комунальна', address: 'просп. Миру, 26', city_id: 1, region_id: 5 },
  { id: 6, system_id: '15665', full_name: 'Ліцей № 2 міста Житомира', short_name: 'Ліцей № 2 м. Житомира', ownership_type: 'комунальна', address: 'вул. Саєнка, 56', city_id: 1, region_id: 5 },
  { id: 7, system_id: '15666', full_name: 'Ліцей № 3 міста Житомира', short_name: 'Ліцей № 3 м. Житомира', ownership_type: 'комунальна', address: 'вул. Грушевського, 8', city_id: 1, region_id: 5 },
  { id: 8, system_id: '15664', full_name: 'Ліцей № 4 міста Житомира', short_name: 'Ліцей № 4 м. Житомира', ownership_type: 'комунальна', address: 'вул. Троянівська, 26', city_id: 1, region_id: 5 },
  { id: 9, system_id: '15667', full_name: 'Ліцей № 5 міста Житомира', short_name: 'Ліцей № 5 м. Житомира', ownership_type: 'комунальна', address: 'вул. Клосовського, 16', city_id: 1, region_id: 5 },
  { id: 10, system_id: '15668', full_name: 'Ліцей № 6 міста Житомира ім. В.Г. Короленка', short_name: 'Ліцей № 6 м. Житомира ім. В.Г. Короленка', ownership_type: 'комунальна', address: 'майдан Короленка, 7', city_id: 1, region_id: 5 },
  { id: 11, system_id: '15669', full_name: 'Ліцей № 7 міста Житомира імені Валерія Вікторовича Бражевського', short_name: 'Ліцей № 7 м. Житомира ім. В.Бражевського', ownership_type: 'комунальна', address: 'вул. Перемоги, 79', city_id: 1, region_id: 5 },
  { id: 12, system_id: '15670', full_name: 'Ліцей № 8 міста Житомира', short_name: 'Ліцей № 8 м. Житомира', ownership_type: 'комунальна', address: 'майдан Згоди, 5', city_id: 1, region_id: 5 },
  { id: 13, system_id: '15671', full_name: 'Ліцей № 10 міста Житомира', short_name: 'Ліцей № 10 м. Житомира', ownership_type: 'комунальна', address: 'шосе Київське шосе, 37', city_id: 1, region_id: 5 },
  { id: 14, system_id: '15672', full_name: 'Ліцей № 12 міста Житомира ім. С. Ковальчука', short_name: 'Ліцей № 12 м. Житомира ім. С. Ковальчука', ownership_type: 'комунальна', address: 'б-р Старий, 4', city_id: 1, region_id: 5 },
  { id: 15, system_id: '15673', full_name: 'Ліцей № 14 міста Житомира', short_name: 'Ліцей № 14 м. Житомира', ownership_type: 'комунальна', address: 'вул. Кибальчича, 7', city_id: 1, region_id: 5 },
  { id: 16, system_id: '15674', full_name: 'Ліцей № 15 міста Житомира', short_name: 'Ліцей № 15 м. Житомира', ownership_type: 'комунальна', address: 'вул. Вільський Шлях, 261', city_id: 1, region_id: 5 },
  { id: 17, system_id: '15675', full_name: 'Ліцей № 16 міста Житомира', short_name: 'Ліцей № 16 м. Житомира', ownership_type: 'комунальна', address: 'вул. Тараса Бульби-Боровця, 15', city_id: 1, region_id: 5 },
  { id: 18, system_id: '15676', full_name: 'Ліцей № 17 міста Житомира', short_name: 'Ліцей № 17 м. Житомира', ownership_type: 'комунальна', address: 'вул. Київська, 49', city_id: 1, region_id: 5 },
  { id: 19, system_id: '15677', full_name: 'Ліцей №19 міста Житомира', short_name: 'Ліцей № 19 м. Житомира', ownership_type: 'комунальна', address: 'вул. Лесі Українки, 71', city_id: 1, region_id: 5 },
  { id: 20, system_id: '15678', full_name: 'Ліцей № 20 міста Житомира', short_name: 'Ліцей № 20 м. Житомира', ownership_type: 'комунальна', address: 'вул. Східна, 65', city_id: 1, region_id: 5 },
  { id: 21, system_id: '15679', full_name: 'Ліцей № 21 міста Житомира', short_name: 'Ліцей № 21 м. Житомира', ownership_type: 'комунальна', address: 'вул. Святослава Ріхтера, 6а', city_id: 1, region_id: 5 },
  { id: 22, system_id: '15680', full_name: 'Ліцей № 22 міста Житомира імені Василя Михайловича Кавуна', short_name: 'Ліцей № 22 м. Житомира ім. В. Кавуна', ownership_type: 'комунальна', address: 'вул. Космонавтів, 36', city_id: 1, region_id: 5 },
  { id: 23, system_id: '15681', full_name: 'Ліцей № 23 міста Житомира ім. М. Очерета', short_name: 'Ліцей № 23 м. Житомира ім. М.Очерета', ownership_type: 'комунальна', address: 'вул. Лятошинського, 14', city_id: 1, region_id: 5 },
  { id: 24, system_id: '15682', full_name: 'Ліцей № 24 міста Житомира', short_name: 'Ліцей № 24 м. Житомира', ownership_type: 'комунальна', address: 'вул. Шевченка, 105-Б', city_id: 1, region_id: 5 },
  { id: 25, system_id: '15683', full_name: 'Ліцей № 25 міста Житомира', short_name: 'Ліцей № 25 м. Житомира', ownership_type: 'комунальна', address: 'вул. Мала Бердичівська, 18', city_id: 1, region_id: 5 },
  { id: 26, system_id: '15684', full_name: 'Ліцей № 26 міста Житомира', short_name: 'Ліцей № 26 м. Житомира', ownership_type: 'комунальна', address: 'просп. Миру, 59', city_id: 1, region_id: 5 },
  { id: 27, system_id: '15685', full_name: 'Ліцей № 27 міста Житомира', short_name: 'Ліцей № 27 м. Житомира', ownership_type: 'комунальна', address: 'просп. миру, 27', city_id: 1, region_id: 5 },
  { id: 28, system_id: '15686', full_name: 'Ліцей № 28 міста Житомира імені гетьмана Івана Виговського', short_name: 'Ліцей № 28 м. Житомира ім. Гетьмана І. Виговського', ownership_type: 'комунальна', address: 'вул. Тараса Бульби-Боровця, 17', city_id: 1, region_id: 5 },
  { id: 29, system_id: '15687', full_name: 'Ліцей № 30 міста Житомира', short_name: 'Ліцей № 30 м.Житомира', ownership_type: 'комунальна', address: 'пров. Шкільний, 4', city_id: 1, region_id: 5 },
  { id: 30, system_id: '15694', full_name: 'Ліцей № 31 міста Житомира', short_name: 'Ліцей № 31 м. Житомира', ownership_type: 'комунальна', address: 'вул. Вітрука, 55', city_id: 1, region_id: 5 },
  { id: 31, system_id: '15688', full_name: 'Ліцей № 32 міста Житомира', short_name: 'Ліцей № 32 м. Житомира', ownership_type: 'комунальна', address: 'вул. Чуднівська, 48', city_id: 1, region_id: 5 },
  { id: 32, system_id: '15689', full_name: 'Ліцей № 33 міста Житомира', short_name: 'Ліцей № 33 м. Житомира', ownership_type: 'комунальна', address: 'вул. Велика Бердичівська, 52', city_id: 1, region_id: 5 },
  { id: 33, system_id: '15690', full_name: 'Ліцей № 34 міста Житомира', short_name: 'Ліцей № 34 м. Житомира', ownership_type: 'комунальна', address: 'вул. Івана Мазепи, 18', city_id: 1, region_id: 5 },
  { id: 34, system_id: '15691', full_name: 'Ліцей № 35 міста Житомира', short_name: 'Ліцей № 35 м. Житомира', ownership_type: 'комунальна', address: 'вул. Івана Мазепи, 95-А', city_id: 1, region_id: 5 },
  { id: 35, system_id: '15692', full_name: 'Ліцей № 36 міста Житомира ім. Я. Домбровського', short_name: 'Ліцей № 36 м. Житомира ім. Я. Домбровського', ownership_type: 'комунальна', address: 'вул. Домбровського, 21', city_id: 1, region_id: 5 },
  { id: 36, system_id: '24066', full_name: 'Відокремлений підрозділ «Науковий ліцей» Державного університету «Житомирська політехніка»', short_name: 'Науковий ліцей Житомирської політехніки', ownership_type: 'державна', address: 'вул. Чуднівська, 103', city_id: 1, region_id: 5 },
  { id: 37, system_id: '15698', full_name: 'Приватний ліцей "Ор Авнер" міста Житомира', short_name: 'ПЛ "Ор Авнер" м. Житомира', ownership_type: 'приватна', address: 'вул. Григорія Сковороди, 57', city_id: 1, region_id: 5 },
  { id: 38, system_id: '20075', full_name: 'Початкова школа № 11 міста Житомира', short_name: 'Початкова школа № 11 м. Житомира', ownership_type: 'комунальна', address: 'вул. Західна, 110', city_id: 1, region_id: 5 },
  { id: 39, system_id: '24592', full_name: 'Товариство з обмеженою відповідальністю загальноосвітній навчальний заклад "Синергія"', short_name: 'ТОВ "ЗНЗ" "Синергія"', ownership_type: 'приватна', address: 'вул. Князів Острозьких, 8а к5', city_id: 1, region_id: 5 },
  { id: 40, system_id: '24031', full_name: 'Товариство з обмеженою відповідальністю «ЗАКЛАД ОСВІТИ «УСПІХ»', short_name: 'ТОВ «ЗАКЛАД ОСВІТИ «УСПІХ»', ownership_type: 'приватна', address: 'пров. Кар\'єрний 2, 13', city_id: 1, region_id: 5 },
  { id: 41, system_id: '24106', full_name: 'ТОВАРИСТВО З ОБМЕЖЕНОЮ ВІДПОВІДАЛЬНІСТЮ «ПРИВАТНИЙ ЛІЦЕЙ «АЙ ТІ СТЕП СКУЛ ЖИТОМИР»', short_name: 'ТОВ «ПРИВАТНИЙ ЛІЦЕЙ «АЙ ТІ СТЕП СКУЛ ЖИТОМИР»', ownership_type: 'приватна', address: 'вул. Перемоги, 29', city_id: 1, region_id: 5 },
]

// Функція для отримання шкіл за регіоном
export function getSchoolsByRegion(regionId: number): School[] {
  return SCHOOLS_ZHYTOMYR.filter(school => school.region_id === regionId)
}

// Функція для отримання шкіл за містом
export function getSchoolsByCity(cityId: number): School[] {
  return SCHOOLS_ZHYTOMYR.filter(school => school.city_id === cityId)
}

// Функція для отримання міст за регіоном
export function getCitiesByRegion(regionId: number): City[] {
  return CITIES.filter(city => city.region_id === regionId)
}

// ===== TYPES =====
export interface User {
  id: string; login: string; pass: string; name: string;
  role: string; clinic?: string; mirror?: boolean;
}
export interface Patient {
  id: string; fio: string; sex: string; bd: string; clinic: string; doctors: string[];
}
export interface CatalogItem {
  id: string; cat: string; sub: string; name: string; price: number | null; term: string; termDays: number | null;
}
export interface WorkType {
  id: string; name: string; defPrice: number;
}
export interface Material {
  id: string; name: string; unit: string; stock: number; price: number;
}
export interface StockIn {
  id: string; matId: string; qty: number; price: number; at: number; note: string;
}
export interface Position {
  name: string; svcId: string | null; cat: string; qty: number; price: number;
  ops: PositionOp[];
}
export interface PositionOp {
  id: string; wtId: string; name: string; techId: string; fee: number;
  done: boolean; proddone: boolean; docOk: boolean; docOkAt?: number;
  assignedAt: number; completedAt?: number;
  mats: { matId: string; qty: number; at: number }[];
}
export interface OrderFile {
  id: string; name: string; size: number; typeCat: string; dataUrl: string | null; by: string; at: number;
}
export interface OrderComment {
  by: string; role: string; at: number; txt: string;
}
export interface HistoryEntry {
  at: number; by: string; txt: string;
}
export interface Order {
  id: string; num: string; patientId: string; doctorId: string; clinic: string;
  category: string; notesText: string; positions: Position[];
  files: OrderFile[]; plan: string; dueDate: string; dueTime: string; termDays: number | null;
  status: string; corrections: number; paymentType: string; priceUndefined: boolean;
  paid: boolean; freeApproved: boolean; address: string;
  sent: boolean; received: boolean; handed: boolean;
  finalFixed: boolean; prodReady: boolean; payRecheck: boolean;
  createdAt: number; acceptedAt?: number; completedAt?: number;
  returnReason: string; comments: OrderComment[]; history: HistoryEntry[];
  has_physical_impressions: boolean; type: string; repairOrderNum?: string;
  is_urgent?: boolean; urgentSurcharge?: number;
  priority?: boolean;
}
export interface NewsItem {
  id: string; title: string; text: string; by: string; at: number;
}
export interface MirrorReport {
  id: string; patientId: string; at: number; by: string; text: string;
}
export interface AppData {
  users: User[]; patients: Patient[]; catalog: CatalogItem[];
  workTypes: WorkType[]; materials: Material[]; stockIn: StockIn[];
  orders: Order[]; news: NewsItem[]; mirrorReports: MirrorReport[];
  rolesMeta: Record<string, { label: string; desc: string; seeAll: boolean; statuses: string[] }>;
}

// ===== ROLES META =====
export const ROLES_META: Record<string, { label: string; desc: string; seeAll: boolean; statuses: string[] }> = {
  admin: { label: 'Администратор ЛК', desc: 'Полный доступ ко всем функциям системы', seeAll: true, statuses: ['all'] },
  admin_ztl: { label: 'Администратор ЗТЛ', desc: 'Управление производственными процессами', seeAll: true, statuses: ['all'] },
  manager_support: { label: 'Менеджер сопровождения', desc: 'Сопровождение заказов назначенных докторов', seeAll: false, statuses: ['all'] },
  quality: { label: 'Менеджер по качеству', desc: 'Проверка файлов на соответствие регламенту', seeAll: true, statuses: ['quality', 'returned'] },
  doctor: { label: 'Доктор', desc: 'Создание и согласование заказов', seeAll: false, statuses: ['quality', 'returned', 'accept', 'approve', 'handover', 'correction', 'done', 'cancelled'] },
  doctor_myort: { label: 'Доктор MyOrt', desc: 'Внутренний доктор', seeAll: false, statuses: ['quality', 'returned', 'accept', 'approve', 'handover', 'correction', 'done', 'cancelled'] },
  clinic_mgr: { label: 'Управляющий клиники', desc: 'Просмотр заказов своей клиники', seeAll: false, statuses: ['all'] },
  cadcam: { label: 'Специалист CAD/CAM', desc: 'Виртуальное моделирование', seeAll: false, statuses: ['cadcam', 'correction', 'approve'] },
  keramist: { label: 'Керамист', desc: 'Изготовление керамических конструкций', seeAll: false, statuses: ['production', 'correction'] },
  gips: { label: 'Гипсовщик', desc: 'Изготовление гипсовых моделей', seeAll: false, statuses: ['gypsum'] },
  print3d: { label: '3D-печать', desc: '3D-печать конструкций', seeAll: false, statuses: ['production', 'correction'] },
  tech_phys: { label: 'Техник физ. производства', desc: 'Физическое производство', seeAll: false, statuses: ['production', 'correction'] },
  scan: { label: 'Специалист сканирования', desc: 'Сканирование моделей', seeAll: false, statuses: ['scanning'] },
  marketer: { label: 'Маркетолог', desc: 'Публикация новостей', seeAll: false, statuses: [] },
};

export const ALL_STATUSES = [
  'quality', 'returned', 'accept', 'gypsum', 'scanning', 'admin_pricing',
  'payment', 'cadcam', 'approve', 'production', 'delivery', 'handover',
  'correction', 'closing', 'done', 'cancelled',
  'repair_create', 'repair_approve', 'repair_payment', 'repair_production', 'repair_delivery', 'repair_closing',
  'guarantee_create', 'guarantee_approve', 'guarantee_production', 'guarantee_delivery'
];

export const STATUS_LABELS: Record<string, string> = {
  quality: 'Проверка файлов', returned: 'Возврат на доработку', accept: 'Принятие решения',
  gypsum: 'Гипсовка', scanning: 'Сканирование', admin_pricing: 'Ценообразование',
  payment: 'Оплата', cadcam: 'CAD/CAM', approve: 'Согласование',
  production: 'Производство', delivery: 'Доставка', handover: 'Сдача',
  correction: 'Коррекция', closing: 'Закрытие', done: 'Выполнен', cancelled: 'Отменён',
  repair_create: 'Заявка на ремонт', repair_approve: 'Согласование ремонта',
  repair_payment: 'Оплата ремонта', repair_production: 'Ремонт — производство',
  repair_delivery: 'Ремонт — доставка', repair_closing: 'Ремонт — закрытие',
  guarantee_create: 'Заявка по гарантии', guarantee_approve: 'Согласование гарантии',
  guarantee_production: 'Гарантия — производство', guarantee_delivery: 'Гарантия — доставка',
};

export const STATUS_COLORS: Record<string, string> = {
  quality: '#0e7490', returned: '#dc2626', accept: '#7c3aed',
  gypsum: '#0891b2', scanning: '#0284c7', admin_pricing: '#4f46e5',
  payment: '#d97706', cadcam: '#2563eb', approve: '#9333ea',
  production: '#059669', delivery: '#0d9488', handover: '#16a34a',
  correction: '#ef4444', closing: '#6366f1', done: '#15803d', cancelled: '#6b7280',
  repair_create: '#ea580c', repair_approve: '#c2410c',
  repair_payment: '#b45309', repair_production: '#9a3412',
  repair_delivery: '#78350f', repair_closing: '#451a03',
  guarantee_create: '#7e22ce', guarantee_approve: '#6b21a8',
  guarantee_production: '#581c87', guarantee_delivery: '#3b0764',
};

// ===== DEMO DATA =====
export function createDemoData(): AppData {
  const users: User[] = [
    { id: 'u1', login: 'admin', pass: 'admin', name: 'Главный администратор', role: 'admin', clinic: 'MyOrt Lab' },
    { id: 'u2', login: 'ztl', pass: 'ztl', name: 'Иванов А.В.', role: 'admin_ztl', clinic: 'MyOrt Lab' },
    { id: 'u3', login: 'support', pass: 'support', name: 'Петрова М.С.', role: 'manager_support', clinic: 'MyOrt Lab' },
    { id: 'u4', login: 'quality', pass: 'quality', name: 'Сидоров К.Л.', role: 'quality', clinic: 'MyOrt Lab' },
    { id: 'u5', login: 'doctor', pass: 'doctor', name: 'Д-р Козлов И.П.', role: 'doctor', clinic: 'Стоматология Плюс' },
    { id: 'u6', login: 'doctor2', pass: 'doctor2', name: 'Д-р Белова Н.А.', role: 'doctor', clinic: 'ДентаЛюкс' },
    { id: 'u7', login: 'myort', pass: 'myort', name: 'Д-р Орлов В.С.', role: 'doctor_myort', clinic: 'MyOrt Lab' },
    { id: 'u8', login: 'clinic1', pass: 'clinic1', name: 'Менеджер клиники 1', role: 'clinic_mgr', clinic: 'Стоматология Плюс' },
    { id: 'u9', login: 'clinic2', pass: 'clinic2', name: 'Менеджер клиники 2', role: 'clinic_mgr', clinic: 'ДентаЛюкс' },
    { id: 'u10', login: 'marker', pass: 'marker', name: 'Маркетолог Анна', role: 'marketer', clinic: 'MyOrt Lab' },
    { id: 'u11', login: 'tech1', pass: 'tech1', name: 'CAD-техник Роман', role: 'cadcam', clinic: 'MyOrt Lab' },
    { id: 'u12', login: 'tech2', pass: 'tech2', name: 'CAD-техник Елена', role: 'cadcam', clinic: 'MyOrt Lab' },
    { id: 'u13', login: 'keramist', pass: 'keramist', name: 'Керамист Дмитрий', role: 'keramist', clinic: 'MyOrt Lab' },
    { id: 'u14', login: 'finisher', pass: 'finisher', name: 'Техник finishing Олег', role: 'tech_phys', clinic: 'MyOrt Lab' },
    { id: 'u15', login: 'gips', pass: 'gips', name: 'Гипсовщик Сергей', role: 'gips', clinic: 'MyOrt Lab' },
    { id: 'u16', login: 'print', pass: 'print', name: '3D-печать Михаил', role: 'print3d', clinic: 'MyOrt Lab' },
    { id: 'u17', login: 'frezer', pass: 'frezer', name: 'Фрезеровщик Андрей', role: 'tech_phys', clinic: 'MyOrt Lab' },
    { id: 'u18', login: 'scan', pass: 'scan', name: 'Сканер-оператор Виктор', role: 'scan', clinic: 'MyOrt Lab' },
  ];

  const patients: Patient[] = [
    { id: 'p1', fio: 'Смирнов Алексей Иванович', sex: 'М', bd: '1975-03-15', clinic: 'Стоматология Плюс', doctors: ['u5'] },
    { id: 'p2', fio: 'Кузнецова Мария Петровна', sex: 'Ж', bd: '1988-07-22', clinic: 'ДентаЛюкс', doctors: ['u6'] },
    { id: 'p3', fio: 'Волков Дмитрий Сергеевич', sex: 'М', bd: '1960-11-03', clinic: 'Стоматология Плюс', doctors: ['u5'] },
    { id: 'p4', fio: 'Новикова Елена Андреевна', sex: 'Ж', bd: '1992-05-18', clinic: 'MyOrt Lab', doctors: ['u7'] },
    { id: 'p5', fio: 'Морозов Игорь Викторович', sex: 'М', bd: '1980-09-30', clinic: 'ДентаЛюкс', doctors: ['u6', 'u5'] },
  ];

  const catalog: CatalogItem[] = [
    { id: 'c1', cat: 'ЗТЛ', sub: 'Ортопедия', name: 'Коронка металлокерамическая', price: 8500, term: '5 дней', termDays: 5 },
    { id: 'c2', cat: 'ЗТЛ', sub: 'Ортопедия', name: 'Коронка безметалловая (циркон)', price: 12000, term: '7 дней', termDays: 7 },
    { id: 'c3', cat: 'ЗТЛ', sub: 'Ортопедия', name: 'Коронка E-max', price: 15000, term: '7 дней', termDays: 7 },
    { id: 'c4', cat: 'ЗТЛ', sub: 'Ортопедия', name: 'Винир E-max', price: 18000, term: '7 дней', termDays: 7 },
    { id: 'c5', cat: 'ЗТЛ', sub: 'Ортопедия', name: 'Вкладка керамическая', price: 9500, term: '5 дней', termDays: 5 },
    { id: 'c6', cat: 'ЗТЛ', sub: 'Ортопедия', name: 'Мостовидный протез (за ед.)', price: 10000, term: '7 дней', termDays: 7 },
    { id: 'c7', cat: 'ЗТЛ', sub: 'Моделировка', name: 'Моделирование коронки CAD', price: 3000, term: '2 дня', termDays: 2 },
    { id: 'c8', cat: 'ЗТЛ', sub: 'Моделировка', name: 'Моделирование моста CAD', price: 4500, term: '3 дня', termDays: 3 },
    { id: 'c9', cat: 'ЗТЛ', sub: 'Ортодонтия', name: 'Элайнер (1 челюсть)', price: 25000, term: '10 дней', termDays: 10 },
    { id: 'c10', cat: 'ЗТЛ', sub: 'Ортодонтия', name: 'Каппа стабилизирующая', price: 8000, term: '3 дня', termDays: 3 },
    { id: 'c11', cat: 'ЗТЛ', sub: 'Ортодонтия', name: 'Ретейнер', price: 5000, term: '3 дня', termDays: 3 },
    { id: 'c12', cat: 'ЗТЛ', sub: 'Протезирование Ao4', name: 'Балочная конструкция Ao4 (верх)', price: 85000, term: '14 дней', termDays: 14 },
    { id: 'c13', cat: 'ЗТЛ', sub: 'Протезирование Ao4', name: 'Балочная конструкция Ao4 (низ)', price: 85000, term: '14 дней', termDays: 14 },
    { id: 'c14', cat: 'ЗТЛ', sub: 'Протезирование Ao6', name: 'Балочная конструкция Ao6 (верх)', price: 120000, term: '18 дней', termDays: 18 },
    { id: 'c15', cat: 'ЗТЛ', sub: 'Протезирование Ao6', name: 'Балочная конструкция Ao6 (низ)', price: 120000, term: '18 дней', termDays: 18 },
    { id: 'c16', cat: 'ЗТЛ', sub: 'Балочные', name: 'Балка титановая (сегмент)', price: 35000, term: '10 дней', termDays: 10 },
    { id: 'c17', cat: 'ЗТЛ', sub: 'Балочные', name: 'Балка кобальт-хром', price: 25000, term: '8 дней', termDays: 8 },
    { id: 'c18', cat: 'ЗТЛ', sub: 'Хирургические шаблоны', name: 'Хирургический шаблон (1 челюсть)', price: 7000, term: '2 дня', termDays: 2 },
    { id: 'c19', cat: 'ЗТЛ', sub: 'Хирургические шаблоны', name: 'Хирургический шаблон (полный)', price: 12000, term: '3 дня', termDays: 3 },
    { id: 'c20', cat: 'ЗТЛ', sub: 'Временные протезы', name: 'Временная коронка (акрил)', price: 3000, term: '1 день', termDays: 1 },
    { id: 'c21', cat: 'ЗТЛ', sub: 'Временные протезы', name: 'Временный мост (акрил)', price: 5000, term: '2 дня', termDays: 2 },
    { id: 'c22', cat: 'ЗТЛ', sub: 'Временные протезы', name: 'Временная коронка (3D-печать)', price: 2500, term: '1 день', termDays: 1 },
    { id: 'c23', cat: 'ЗТЛ', sub: 'Съёмные протезы', name: 'Полный съёмный протез (1 челюсть)', price: 35000, term: '10 дней', termDays: 10 },
    { id: 'c24', cat: 'ЗТЛ', sub: 'Съёмные протезы', name: 'Частичный съёмный протез', price: 25000, term: '7 дней', termDays: 7 },
    { id: 'c25', cat: 'ЗТЛ', sub: 'Съёмные протезы', name: 'Бюгельный протез', price: 45000, term: '12 дней', termDays: 12 },
    { id: 'c26', cat: 'ЗТЛ', sub: 'Имплантация', name: 'Абатмент индивидуальный (титан)', price: 8000, term: '5 дней', termDays: 5 },
    { id: 'c27', cat: 'ЗТЛ', sub: 'Имплантация', name: 'Абатмент индивидуальный (циркон)', price: 12000, term: '7 дней', termDays: 7 },
    { id: 'c28', cat: 'ЗТЛ', sub: 'Имплантация', name: 'Исправительный абатмент', price: 6000, term: '3 дня', termDays: 3 },
    { id: 'c29', cat: 'ЗТЛ', sub: 'Ремонт', name: 'Ремонт съёмного протеза (трещина)', price: 3000, term: '1 день', termDays: 1 },
    { id: 'c30', cat: 'ЗТЛ', sub: 'Ремонт', name: 'Ремонт протеза (замена зуба)', price: 2000, term: '1 день', termDays: 1 },
    { id: 'c31', cat: 'ЗТЛ', sub: 'Ремонт', name: 'Перебазировка протеза', price: 2500, term: '1 день', termDays: 1 },
    { id: 'c32', cat: 'ЗТЛ', sub: 'Ремонт', name: 'Приварка зуба/кламмера', price: 1500, term: '1 день', termDays: 1 },
    { id: 'c33', cat: 'ЗТЛ', sub: '3D-печать', name: 'Печать модели', price: 2000, term: '1 день', termDays: 1 },
    { id: 'c34', cat: 'ЗТЛ', sub: '3D-печать', name: 'Печать хирургического шаблона', price: 5000, term: '1 день', termDays: 1 },
    { id: 'c35', cat: 'ЗТЛ', sub: '3D-печать', name: 'Печать временной коронки', price: 2500, term: '1 день', termDays: 1 },
    { id: 'c36', cat: 'ЗТЛ', sub: 'Фрезеровка', name: 'Фрезеровка циркон (1 ед.)', price: 4000, term: '2 дня', termDays: 2 },
    { id: 'c37', cat: 'ЗТЛ', sub: 'Фрезеровка', name: 'Фрезеровка PMMA', price: 2500, term: '1 день', termDays: 1 },
    { id: 'c38', cat: 'ЗТЛ', sub: 'Фрезеровка', name: 'Фрезеровка титан', price: 8000, term: '3 дня', termDays: 3 },
    { id: 'c39', cat: 'ЗТЛ', sub: 'Прочее', name: 'Диагностическая модель', price: 3000, term: '2 дня', termDays: 2 },
    { id: 'c40', cat: 'ЗТЛ', sub: 'Прочее', name: 'Индивидуальная ложка', price: 2000, term: '1 день', termDays: 1 },
    { id: 'c41', cat: 'ЗТЛ', sub: 'Прочее', name: 'Восковая репозиция', price: 1500, term: '1 день', termDays: 1 },
    { id: 'c42', cat: 'ЗТЛ', sub: 'Прочее', name: 'Артикуляция (перенос в артикулятор)', price: 3000, term: '1 день', termDays: 1 },
    { id: 'c43', cat: 'Гнатология', sub: 'Сплинты', name: 'Сплинт-терапия (верх)', price: 25000, term: '10 дней', termDays: 10 },
    { id: 'c44', cat: 'Гнатология', sub: 'Сплинты', name: 'Сплинт-терапия (низ)', price: 25000, term: '10 дней', termDays: 10 },
    { id: 'c45', cat: 'Гнатология', sub: 'Сплинты', name: 'Сплинт диагностический', price: 15000, term: '5 дней', termDays: 5 },
    { id: 'c46', cat: 'Гнатология', sub: 'Накладки', name: 'Окклюзионная накладка', price: 8000, term: '5 дней', termDays: 5 },
    { id: 'c47', cat: 'Гнатология', sub: 'Накладки', name: 'Депрограмматор', price: 6000, term: '3 дня', termDays: 3 },
    { id: 'c48', cat: 'Гнатология', sub: 'Накладки', name: 'Готическая дуга', price: 4000, term: '2 дня', termDays: 2 },
    { id: 'c49', cat: 'Гнатология', sub: 'Диагностика', name: 'Лицевая дуга', price: 3000, term: '1 день', termDays: 1 },
    { id: 'c50', cat: 'Гнатология', sub: 'Диагностика', name: 'Регистратор прикуса', price: 2500, term: '1 день', termDays: 1 },
    { id: 'c51', cat: 'Ремонтные работы', sub: 'Базовый', name: 'Ремонт коронки (скол керамики)', price: 3500, term: '2 дня', termDays: 2 },
    { id: 'c52', cat: 'Ремонтные работы', sub: 'Базовый', name: 'Ремонт винира (трещина)', price: null, term: 'по запросу', termDays: null },
    { id: 'c53', cat: 'Ремонтные работы', sub: 'Сложный', name: 'Переделка конструкции', price: null, term: 'по запросу', termDays: null },
  ];

  const workTypes: WorkType[] = [
    { id: 'wt1', name: 'CAD-моделирование', defPrice: 3000 },
    { id: 'wt2', name: 'Фрезеровка', defPrice: 4000 },
    { id: 'wt3', name: '3D-печать', defPrice: 2000 },
    { id: 'wt4', name: 'Гипсовка', defPrice: 1000 },
    { id: 'wt5', name: 'Шлифовка', defPrice: 1500 },
    { id: 'wt6', name: 'Керамика (нанесение)', defPrice: 5000 },
    { id: 'wt7', name: 'Спекание', defPrice: 1500 },
    { id: 'wt8', name: 'Сборка/финиш', defPrice: 2000 },
    { id: 'wt9', name: 'Окклюзия/артикуляция', defPrice: 2500 },
    { id: 'wt10', name: 'Сплинт-моделирование', defPrice: 6000 },
  ];

  const materials: Material[] = [
    { id: 'm1', name: 'Циркон-диск (98мм)', unit: 'шт', stock: 25, price: 4500 },
    { id: 'm2', name: 'E-max блок', unit: 'шт', stock: 15, price: 6000 },
    { id: 'm3', name: 'PMMA-диск', unit: 'шт', stock: 30, price: 2000 },
    { id: 'm4', name: 'Смола для 3D-печати', unit: 'мл', stock: 500, price: 15 },
    { id: 'm5', name: 'Гипс супертвердый', unit: 'кг', stock: 50, price: 200 },
    { id: 'm6', name: 'Керамическая масса', unit: 'г', stock: 200, price: 50 },
    { id: 'm7', name: 'Титановый сплав', unit: 'г', stock: 100, price: 120 },
    { id: 'm8', name: 'Акриловая масса', unit: 'г', stock: 300, price: 30 },
    { id: 'm9', name: 'Воск моделировочный', unit: 'г', stock: 150, price: 25 },
    { id: 'm10', name: 'Абразивные диски', unit: 'шт', stock: 100, price: 50 },
  ];

  const now = Date.now();
  const day = 86400000;

  const orders: Order[] = [
    {
      id: 'o1', num: 'GT-101', patientId: 'p1', doctorId: 'u5', clinic: 'Стоматология Плюс',
      category: 'ЗТЛ', notesText: 'Пациент с бруксизмом, учесть защитную капу', positions: [
        { name: 'Коронка безметалловая (циркон)', svcId: 'c2', cat: 'ЗТЛ', qty: 3, price: 12000, ops: [
          { id: 'op1', wtId: 'wt1', name: 'CAD-моделирование', techId: 'u11', fee: 3000, done: true, proddone: false, docOk: false, assignedAt: now - 3*day, completedAt: now - 2*day, mats: [] },
          { id: 'op2', wtId: 'wt2', name: 'Фрезеровка', techId: 'u17', fee: 4000, done: false, proddone: false, docOk: false, assignedAt: now - 2*day, mats: [{matId:'m1',qty:1,at:now-2*day}] },
        ]}
      ],
      files: [{ id: 'f1', name: 'scan_upper.stl', size: 850000, typeCat: 'scan', dataUrl: null, by: 'u5', at: now - 5*day }],
      plan: 'Установка 3 коронок на жевательную группу', dueDate: '2026-02-20', dueTime: '14:00', termDays: 7,
      status: 'cadcam', corrections: 0, paymentType: 'pre100', priceUndefined: false,
      paid: true, freeApproved: false, address: 'г. Москва, ул. Ленина 15',
      sent: false, received: false, handed: false, finalFixed: false, prodReady: false, payRecheck: false,
      createdAt: now - 5*day, acceptedAt: now - 4*day, returnReason: '',
      comments: [{ by: 'u4', role: 'quality', at: now - 4*day, txt: 'Файлы проверены, всё в норме' }],
      history: [
        { at: now - 5*day, by: 'u5', txt: 'Заказ создан' },
        { at: now - 4*day, by: 'u4', txt: 'Файлы приняты' },
        { at: now - 3*day, by: 'u2', txt: 'Назначен техник CAD: Роман' },
      ],
      has_physical_impressions: false, type: 'cadcam_only',
    },
    {
      id: 'o2', num: 'GT-102', patientId: 'p2', doctorId: 'u6', clinic: 'ДентаЛюкс',
      category: 'ЗТЛ', notesText: '', positions: [
        { name: 'Винир E-max', svcId: 'c4', cat: 'ЗТЛ', qty: 6, price: 18000, ops: [
          { id: 'op3', wtId: 'wt1', name: 'CAD-моделирование', techId: 'u12', fee: 4500, done: true, proddone: false, docOk: true, docOkAt: now - 1*day, assignedAt: now - 6*day, completedAt: now - 3*day, mats: [] },
          { id: 'op4', wtId: 'wt6', name: 'Керамика (нанесение)', techId: 'u13', fee: 5000, done: false, proddone: true, docOk: false, assignedAt: now - 2*day, mats: [{matId:'m6',qty:20,at:now-2*day}] },
        ]}
      ],
      files: [{ id: 'f2', name: 'face_photo.jpg', size: 1200000, typeCat: 'face', dataUrl: null, by: 'u6', at: now - 7*day }],
      plan: 'Эстетическая реабилитация фронтальной зоны', dueDate: '2026-02-18', dueTime: '10:00', termDays: 7,
      status: 'production', corrections: 0, paymentType: 'pre50', priceUndefined: false,
      paid: true, freeApproved: false, address: '',
      sent: false, received: false, handed: false, finalFixed: false, prodReady: false, payRecheck: false,
      createdAt: now - 7*day, acceptedAt: now - 6*day, returnReason: '',
      comments: [], history: [
        { at: now - 7*day, by: 'u6', txt: 'Заказ создан' },
        { at: now - 6*day, by: 'u4', txt: 'Файлы приняты' },
      ],
      has_physical_impressions: true, type: 'full',
    },
    {
      id: 'o3', num: 'GT-103', patientId: 'p3', doctorId: 'u5', clinic: 'Стоматология Плюс',
      category: 'ЗТЛ', notesText: 'Срочный заказ!', positions: [
        { name: 'Балочная конструкция Ao4 (верх)', svcId: 'c12', cat: 'ЗТЛ', qty: 1, price: 85000, ops: [
          { id: 'op5', wtId: 'wt1', name: 'CAD-моделирование', techId: 'u11', fee: 8000, done: true, proddone: false, docOk: true, docOkAt: now - 1*day, assignedAt: now - 10*day, completedAt: now - 5*day, mats: [] },
          { id: 'op6', wtId: 'wt2', name: 'Фрезеровка', techId: 'u17', fee: 8000, done: false, proddone: false, docOk: false, assignedAt: now - 4*day, mats: [{matId:'m7',qty:30,at:now-4*day}] },
        ]}
      ],
      files: [], plan: 'Полная реабилитация верхней челюсти All-on-4', dueDate: '2026-02-15', dueTime: '12:00', termDays: 14,
      status: 'correction', corrections: 2, paymentType: 'pre100', priceUndefined: false,
      paid: true, freeApproved: false, address: '',
      sent: false, received: false, handed: false, finalFixed: false, prodReady: false, payRecheck: false,
      createdAt: now - 12*day, acceptedAt: now - 10*day, returnReason: 'Неверная окклюзионная плоскость, требуется корректировка',
      comments: [{ by: 'u5', role: 'doctor', at: now - 1*day, txt: 'Нужно изменить угол наклона балки на 2 градуса' }],
      history: [
        { at: now - 12*day, by: 'u5', txt: 'Заказ создан' },
        { at: now - 10*day, by: 'u4', txt: 'Файлы приняты' },
        { at: now - 5*day, by: 'u11', txt: 'CAD-моделирование завершено' },
        { at: now - 3*day, by: 'u5', txt: 'Возврат: неверная окклюзия' },
        { at: now - 1*day, by: 'u5', txt: 'Повторный возврат: угол наклона' },
      ],
      has_physical_impressions: true, type: 'full', is_urgent: true,
    },
    {
      id: 'o4', num: 'GT-104', patientId: 'p4', doctorId: 'u7', clinic: 'MyOrt Lab',
      category: 'ЗТЛ', notesText: '', positions: [
        { name: 'Сплинт-терапия (верх)', svcId: 'c43', cat: 'Гнатология', qty: 1, price: 25000, ops: [
          { id: 'op7', wtId: 'wt10', name: 'Сплинт-моделирование', techId: 'u11', fee: 6000, done: true, proddone: false, docOk: true, docOkAt: now, assignedAt: now - 3*day, completedAt: now - 1*day, mats: [] },
          { id: 'op8', wtId: 'wt3', name: '3D-печать', techId: 'u16', fee: 2000, done: false, proddone: false, docOk: false, assignedAt: now - 1*day, mats: [{matId:'m4',qty:50,at:now-1*day}] },
        ]}
      ],
      files: [{ id: 'f3', name: 'ct_scan.dcm', size: 5000000, typeCat: 'ct', dataUrl: null, by: 'u7', at: now - 4*day }],
      plan: 'Сплинт-терапия при ВНЧС', dueDate: '2026-02-22', dueTime: '16:00', termDays: 10,
      status: 'approve', corrections: 0, paymentType: 'pre100', priceUndefined: false,
      paid: true, freeApproved: false, address: '',
      sent: false, received: false, handed: false, finalFixed: false, prodReady: false, payRecheck: false,
      createdAt: now - 4*day, acceptedAt: now - 3*day, returnReason: '',
      comments: [], history: [
        { at: now - 4*day, by: 'u7', txt: 'Заказ создан' },
        { at: now - 3*day, by: 'u4', txt: 'Файлы приняты' },
      ],
      has_physical_impressions: false, type: 'cadcam_only',
    },
    {
      id: 'o5', num: 'GT-105', patientId: 'p5', doctorId: 'u6', clinic: 'ДентаЛюкс',
      category: 'Ремонтные работы', notesText: 'Сломался кламмер на нижнем протезе', positions: [
        { name: 'Приварка кламмера', svcId: 'c32', cat: 'Ремонтные работы', qty: 1, price: 1500, ops: [] }
      ],
      files: [{ id: 'f4', name: 'break_photo.jpg', size: 450000, typeCat: 'photo', dataUrl: null, by: 'u6', at: now - 1*day }],
      plan: '', dueDate: '2026-02-16', dueTime: '10:00', termDays: 1,
      status: 'repair_approve', corrections: 0, paymentType: 'pre100', priceUndefined: false,
      paid: false, freeApproved: false, address: '',
      sent: false, received: false, handed: false, finalFixed: false, prodReady: false, payRecheck: false,
      createdAt: now - 1*day, returnReason: '',
      comments: [], history: [{ at: now - 1*day, by: 'u6', txt: 'Заявка на ремонт создана' }],
      has_physical_impressions: false, type: 'repair',
    },
    {
      id: 'o6', num: 'GT-106', patientId: 'p1', doctorId: 'u5', clinic: 'Стоматология Плюс',
      category: 'Гарантия', notesText: 'Скол керамики на коронке, установленной 2 месяца назад', positions: [
        { name: 'Ремонт коронки (скол керамики)', svcId: 'c51', cat: 'Ремонтные работы', qty: 1, price: 0, ops: [] }
      ],
      files: [{ id: 'f5', name: 'chip_photo.jpg', size: 380000, typeCat: 'photo', dataUrl: null, by: 'u5', at: now - 2*day }],
      plan: '', dueDate: '2026-02-19', dueTime: '14:00', termDays: 2,
      status: 'guarantee_approve', corrections: 0, paymentType: 'free', priceUndefined: false,
      paid: false, freeApproved: false, address: '',
      sent: false, received: false, handed: false, finalFixed: false, prodReady: false, payRecheck: false,
      createdAt: now - 2*day, returnReason: '',
      comments: [], history: [{ at: now - 2*day, by: 'u5', txt: 'Заявка по гарантии создана' }],
      has_physical_impressions: false, type: 'guarantee', repairOrderNum: 'GT-089',
    },
    {
      id: 'o7', num: 'GT-107', patientId: 'p3', doctorId: 'u5', clinic: 'Стоматология Плюс',
      category: 'ЗТЛ', notesText: '', positions: [
        { name: 'Хирургический шаблон (1 челюсть)', svcId: 'c18', cat: 'ЗТЛ', qty: 1, price: 7000, ops: [
          { id: 'op9', wtId: 'wt1', name: 'CAD-моделирование', techId: 'u12', fee: 3000, done: true, proddone: false, docOk: false, assignedAt: now - 2*day, completedAt: now - 1*day, mats: [] },
          { id: 'op10', wtId: 'wt3', name: '3D-печать', techId: 'u16', fee: 2000, done: false, proddone: false, docOk: false, assignedAt: now - 1*day, mats: [{matId:'m4',qty:30,at:now-1*day}] },
        ]}
      ],
      files: [{ id: 'f6', name: 'planning.stl', size: 920000, typeCat: 'scan', dataUrl: null, by: 'u5', at: now - 3*day }],
      plan: 'Установка 2 имплантатов в области 15, 16', dueDate: '2026-02-17', dueTime: '09:00', termDays: 2,
      status: 'payment', corrections: 0, paymentType: 'pre100', priceUndefined: false,
      paid: false, freeApproved: false, address: '',
      sent: false, received: false, handed: false, finalFixed: false, prodReady: false, payRecheck: false,
      createdAt: now - 3*day, acceptedAt: now - 2*day, returnReason: '',
      comments: [], history: [
        { at: now - 3*day, by: 'u5', txt: 'Заказ создан' },
        { at: now - 2*day, by: 'u4', txt: 'Файлы приняты' },
        { at: now - 1*day, by: 'u2', txt: 'Стоимость определена, ожидание оплаты' },
      ],
      has_physical_impressions: false, type: 'cadcam_only',
    },
    {
      id: 'o8', num: 'GT-108', patientId: 'p2', doctorId: 'u6', clinic: 'ДентаЛюкс',
      category: 'ЗТЛ', notesText: 'Физические слепки отправлены курьером', positions: [
        { name: 'Полный съёмный протез (1 челюсть)', svcId: 'c23', cat: 'ЗТЛ', qty: 1, price: 35000, ops: [
          { id: 'op11', wtId: 'wt4', name: 'Гипсовка', techId: 'u15', fee: 1000, done: false, proddone: true, docOk: false, assignedAt: now - 1*day, completedAt: now, mats: [{matId:'m5',qty:2,at:now}] },
        ]}
      ],
      files: [{ id: 'f7', name: 'impression_photo.jpg', size: 600000, typeCat: 'photo', dataUrl: null, by: 'u6', at: now - 2*day }],
      plan: 'Полный съёмный протез нижней челюсти', dueDate: '2026-02-25', dueTime: '12:00', termDays: 10,
      status: 'gypsum', corrections: 0, paymentType: 'pre100', priceUndefined: false,
      paid: false, freeApproved: false, address: '',
      sent: false, received: false, handed: false, finalFixed: false, prodReady: false, payRecheck: false,
      createdAt: now - 2*day, returnReason: '',
      comments: [], history: [
        { at: now - 2*day, by: 'u6', txt: 'Заказ создан' },
        { at: now - 1*day, by: 'u4', txt: 'Файлы приняты, слепки получены' },
      ],
      has_physical_impressions: true, type: 'phys_only',
    },
  ];

  const news: NewsItem[] = [
    { id: 'n1', title: 'Обновление графика работы', text: 'Уважаемые коллеги! С 15 февраля лаборатория переходит на расширенный график работы: пн-пт 8:00-20:00, сб 9:00-15:00. Это позволит ускорить выполнение срочных заказов.', by: 'u10', at: now - 3*day },
    { id: 'n2', title: 'Новая услуга: цифровые элайнеры', text: 'Рады сообщить о запуске нового направления — изготовление цифровых элайнеров. Полный цикл от планирования до печати. Подробности в каталоге услуг.', by: 'u1', at: now - 1*day },
  ];

  return {
    users, patients, catalog, workTypes, materials, stockIn: [],
    orders, news, mirrorReports: [], rolesMeta: ROLES_META,
  };
}

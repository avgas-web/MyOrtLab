// ===== TYPES =====
export interface User {
  id: string; login: string; pass: string; name: string;
  role: string; clinic?: string; mirror?: boolean;
  subscription?: GMAISubscription;
  permissions?: UserPermissions;
  email?: string;
  phone?: string;
  telegramChatId?: string;
  maxChatId?: string;
}

export interface GMAISubscription {
  tariff: 'basic' | 'extended';
  period: 'month' | 'year';
  startDate: number;
  endDate: number;
  active: boolean;
  analysesUsed: number;
  analysesLimit: number; // 5 for basic, Infinity for extended
}

export interface Patient {
  id: string; fio: string; sex: string; bd: string;
  clinic: string; doctors: string[];
}

export interface Service {
  id: string; cat: string; sub: string; name: string;
  price: number | null; term: string; termDays: number | null;
}

export interface WorkType {
  id: string; name: string; defPrice: number; timeNorm: number;
  materials?: { matId: string; qtyPerUnit: number }[];
}

export interface Material {
  id: string; name: string; unit: string;
  costPerUnit: number; currentStock: number; minStock: number;
}

export interface StockIn {
  id: string; matId: string; qty: number; price: number;
  at: number; note: string;
}

export interface MaterialUsage {
  matId: string; qty: number; at: number; orderId: string;
}

export interface OrderPosition {
  id: string; name: string; svcId: string | null; cat: string;
  qty: number; price: number;
  ops: WorkItem[];
}

export interface WorkItem {
  id: string; wtId: string; name: string;
  techId: string; fee: number;
  done: boolean; proddone: boolean; docOk: boolean;
  docOkAt: number | null; assignedAt: number; completedAt: number | null;
  mats: MaterialUsage[];
}

export interface OrderFile {
  id: string; name: string; size: number;
  typeCat: 'face' | 'photo' | 'ct' | 'scan' | 'video' | 'other';
  dataUrl: string | null; by: string; at: number;
}

export interface Comment {
  by: string; role: string; at: number; txt: string;
  mentions?: string[];
}

export interface HistoryItem {
  at: number; by: string; txt: string;
}

export interface Order {
  id: string; num: string;
  patientId: string; doctorId: string; clinic: string;
  category: string; notesText: string;
  positions: OrderPosition[];
  files: OrderFile[];
  plan: string; dueDate: string; dueTime: string; termDays: number;
  status: string; corrections: number;
  paymentType: 'pre100' | 'pre50' | 'post100' | 'internal' | 'free';
  priceUndefined: boolean; paid: boolean; freeApproved: boolean;
  address: string; sent: boolean; received: boolean; handed: boolean;
  finalFixed: boolean; prodReady: boolean; payRecheck: boolean;
  createdAt: number; acceptedAt: number | null; completedAt: number | null;
  returnReason: string; comments: Comment[]; history: HistoryItem[];
  has_physical_impressions: boolean;
  type: 'full' | 'cadcam_only' | 'phys_only' | 'repair' | 'guarantee';
  repairOrderNum?: string;
  is_urgent?: boolean;
  priority?: boolean;
  repairPhotos?: string[];
  guaranteePhotos?: string[];
  repairDescription?: string;
  guaranteeDescription?: string;
}

export interface NewsItem {
  id: string; title: string; txt: string; at: number; by: string;
}

export interface AIReport {
  id: string; patientId: string; doctorId: string;
  content: {
    diagnosis: string;
    services: string[];
    plan: string;
    recommendations: string[];
    estimatedCost: number;
    estimatedTerm: number;
  };
  createdAt: number;
  pdfUrl?: string;
}

export interface RoleMeta {
  label: string; desc: string; seeAll: boolean;
  statuses: string[];
}

export interface NotificationSettings {
  telegram?: { enabled: boolean; botToken?: string; chatId?: string };
  max?: { enabled: boolean; apiKey?: string; chatId?: string };
  email?: { enabled: boolean; smtp?: { host: string; port: number; user: string; pass: string }; from?: string };
}

export interface UserPermissions {
  canCreateOrders?: boolean;
  canEditOrders?: boolean;
  canDeleteOrders?: boolean;
  canViewAllOrders?: boolean;
  canManagePatients?: boolean;
  canManageCatalog?: boolean;
  canManageMaterials?: boolean;
  canManageUsers?: boolean;
  canViewReports?: boolean;
  canExportData?: boolean;
  customPermissions?: Record<string, boolean>;
}

export interface AppData {
  users: User[];
  patients: Patient[];
  catalog: Service[];
  workTypes: WorkType[];
  materials: Material[];
  stockIn: StockIn[];
  materialUsage: MaterialUsage[];
  orders: Order[];
  news: NewsItem[];
  mirrorReports: AIReport[];
  rolesMeta: Record<string, RoleMeta>;
  settings: {
    language: 'ru' | 'en' | 'kz';
    gmaiPrices: {
      basic_month: number;
      basic_year: number;
      extended_month: number;
      extended_year: number;
    };
    alignersUrl?: string;
    notifications?: NotificationSettings;
  };
}

// ===== UTILITY FUNCTIONS =====
export function determineOrderType(positions: { svcId: string | null; cat: string }[]): 'full' | 'cadcam_only' | 'phys_only' {
  if (positions.length === 0) return 'full';
  
  let hasCad = false;
  let hasPhys = false;
  
  for (const pos of positions) {
    // CAD/CAM услуги
    if (pos.cat === 'Моделировка' || pos.cat === 'Ортопедия' || pos.cat === 'Имплантология') {
      hasCad = true;
    }
    // Физические услуги
    if (pos.cat === 'Протезирование Ао4/6' || pos.cat === 'Балочные' || pos.cat === 'Ортодонтия') {
      hasPhys = true;
    }
    // Если услуга из категории, которая требует и CAD и физики
    if (pos.cat === 'Протезирование Ао4/6' || pos.cat === 'Балочные') {
      hasCad = true;
      hasPhys = true;
    }
  }
  
  if (hasCad && hasPhys) return 'full';
  if (hasCad) return 'cadcam_only';
  if (hasPhys) return 'phys_only';
  return 'full'; // default
}

// ===== CONSTANTS =====
export const STATUS_NAMES: Record<string, string> = {
  quality: 'Проверка файлов',
  returned: 'Возврат',
  accept: 'Принятие решения',
  gypsum: 'Гипсовка',
  scanning: 'Сканирование',
  admin_pricing: 'Ценообразование',
  payment: 'Оплата',
  cadcam: 'CAD/CAM',
  approve: 'Согласование',
  correction: 'Коррекция',
  production: 'Производство',
  delivery: 'Доставка',
  handover: 'Сдача',
  closing: 'Закрытие',
  done: 'Выполнено',
  cancelled: 'Отменён',
  repair_create: 'Ремонт: заявка',
  repair_approve: 'Ремонт: согласование',
  guarantee_create: 'Гарантия: заявка',
  guarantee_approve: 'Гарантия: согласование',
};

export const STATUS_COLORS: Record<string, string> = {
  quality: '#c084fc', returned: '#f97316', accept: '#a78bfa',
  gypsum: '#8b5cf6', scanning: '#7c3aed', admin_pricing: '#6366f1',
  payment: '#3b82f6', cadcam: '#0ea5e9', approve: '#06b6d4',
  correction: '#f59e0b', production: '#0891b2', delivery: '#0e7490',
  handover: '#0f766e', closing: '#14b8a6', done: '#10b981',
  cancelled: '#64748b', repair_create: '#ec4899', repair_approve: '#db2777',
  guarantee_create: '#be185d', guarantee_approve: '#9d174d',
};

export const ROLE_LABELS: Record<string, string> = {
  admin: 'Администратор ЛК',
  admin_ztl: 'Администратор ЗТЛ',
  manager_support: 'Менеджер сопровождения',
  quality: 'Менеджер по качеству',
  doctor: 'Доктор',
  doctor_myort: 'Доктор MyOrt',
  clinic_mgr: 'Управляющий клиники',
  cadcam: 'Специалист CAD/CAM',
  keramist: 'Керамист',
  gips: 'Гипсовщик',
  print3d: '3D-печать',
  tech_phys: 'Техник физ. производства',
  scan: 'Специалист сканирования',
  marketer: 'Маркетолог',
};

export const DEFAULT_ROLES_META: Record<string, RoleMeta> = {
  admin: {
    label: 'Администратор ЛК',
    desc: 'Полный доступ ко всем функциям системы',
    seeAll: true,
    statuses: ['quality','returned','accept','gypsum','scanning','admin_pricing','payment','cadcam','approve','correction','production','delivery','handover','closing','done','cancelled','repair_create','repair_approve','guarantee_create','guarantee_approve'],
  },
  admin_ztl: {
    label: 'Администратор ЗТЛ',
    desc: 'Управление заказами, ценообразование, контроль выполнения',
    seeAll: true,
    statuses: ['quality','returned','accept','gypsum','scanning','admin_pricing','payment','cadcam','approve','correction','production','delivery','handover','closing','done','cancelled','repair_create','repair_approve','guarantee_create','guarantee_approve'],
  },
  manager_support: {
    label: 'Менеджер сопровождения',
    desc: 'Сопровождение заказов назначенных докторов',
    seeAll: false,
    statuses: ['quality','returned','accept','gypsum','scanning','admin_pricing','payment','cadcam','approve','correction','production','delivery','handover','closing','done','cancelled'],
  },
  quality: {
    label: 'Менеджер по качеству',
    desc: 'Проверка файлов и принятие решений',
    seeAll: false,
    statuses: ['quality','returned','accept'],
  },
  doctor: {
    label: 'Доктор',
    desc: 'Создание заказов, согласование работ',
    seeAll: false,
    statuses: ['quality','returned','accept','gypsum','scanning','admin_pricing','payment','cadcam','approve','correction','production','delivery','handover','closing','done','repair_create','repair_approve','guarantee_create','guarantee_approve'],
  },
  doctor_myort: {
    label: 'Доктор MyOrt',
    desc: 'Доктор с доступом к MyOrt',
    seeAll: false,
    statuses: ['quality','returned','accept','gypsum','scanning','admin_pricing','payment','cadcam','approve','correction','production','delivery','handover','closing','done','repair_create','repair_approve','guarantee_create','guarantee_approve'],
  },
  clinic_mgr: {
    label: 'Управляющий клиники',
    desc: 'Просмотр заказов своей клиники',
    seeAll: false,
    statuses: ['quality','returned','accept','gypsum','scanning','admin_pricing','payment','cadcam','approve','correction','production','delivery','handover','closing','done','cancelled'],
  },
  cadcam: {
    label: 'Специалист CAD/CAM',
    desc: 'Виртуальное моделирование',
    seeAll: false,
    statuses: ['cadcam','approve','correction'],
  },
  keramist: {
    label: 'Керамист',
    desc: 'Физическое производство (керамика)',
    seeAll: false,
    statuses: ['production','correction'],
  },
  gips: {
    label: 'Гипсовщик',
    desc: 'Изготовление гипсовых моделей',
    seeAll: false,
    statuses: ['gypsum'],
  },
  print3d: {
    label: '3D-печать',
    desc: '3D-печать изделий',
    seeAll: false,
    statuses: ['production','correction'],
  },
  tech_phys: {
    label: 'Техник физ. производства',
    desc: 'Физическое производство',
    seeAll: false,
    statuses: ['production','correction'],
  },
  scan: {
    label: 'Специалист сканирования',
    desc: 'Сканирование моделей',
    seeAll: false,
    statuses: ['scanning'],
  },
  marketer: {
    label: 'Маркетолог',
    desc: 'Публикация новостей',
    seeAll: false,
    statuses: [],
  },
};

// ===== DEMO DATA =====
export function createDemoData(): AppData {
  const now = Date.now();
  const day = 86400000;

  const users: User[] = [
    { id: '1', login: 'admin', pass: 'admin', name: 'Администратор', role: 'admin', clinic: '', mirror: true, email: 'admin@myortlab.com', permissions: { canCreateOrders: true, canEditOrders: true, canDeleteOrders: true, canViewAllOrders: true, canManagePatients: true, canManageCatalog: true, canManageMaterials: true, canManageUsers: true, canViewReports: true, canExportData: true } },
    { id: '2', login: 'ztl', pass: 'ztl', name: 'Админ ЗТЛ', role: 'admin_ztl', clinic: '', mirror: true, email: 'ztl@myortlab.com', permissions: { canCreateOrders: true, canEditOrders: true, canDeleteOrders: true, canViewAllOrders: true, canManagePatients: true, canManageCatalog: true, canManageMaterials: true, canViewReports: true, canExportData: true } },
    { id: '3', login: 'support', pass: 'support', name: 'Менеджер поддержки', role: 'manager_support', clinic: '', mirror: true, email: 'support@myortlab.com', permissions: { canCreateOrders: true, canEditOrders: true, canViewAllOrders: true, canManagePatients: true, canViewReports: true } },
    { id: '4', login: 'quality', pass: 'quality', name: 'Менеджер качества', role: 'quality', clinic: '', mirror: true, email: 'quality@myortlab.com', permissions: { canEditOrders: true, canViewAllOrders: false } },
    { id: '5', login: 'doctor', pass: 'doctor', name: 'Доктор Иванов', role: 'doctor', clinic: 'Клиника 1', mirror: true, email: 'doctor1@clinic1.com', phone: '+79991234567', telegramChatId: '123456789',
      subscription: { tariff: 'extended', period: 'year', startDate: now - 30*day, endDate: now + 335*day, active: true, analysesUsed: 2, analysesLimit: Infinity },
      permissions: { canCreateOrders: true, canEditOrders: false, canViewAllOrders: false, canManagePatients: true } },
    { id: '6', login: 'doctor2', pass: 'doctor2', name: 'Доктор Петров', role: 'doctor', clinic: 'Клиника 2', mirror: true, email: 'doctor2@clinic2.com', phone: '+79997654321', maxChatId: '987654321',
      subscription: { tariff: 'basic', period: 'month', startDate: now - 10*day, endDate: now + 20*day, active: true, analysesUsed: 3, analysesLimit: 5 },
      permissions: { canCreateOrders: true, canEditOrders: false, canViewAllOrders: false, canManagePatients: true } },
    { id: '7', login: 'myort', pass: 'myort', name: 'Доктор MyOrt', role: 'doctor_myort', clinic: 'MyOrt', mirror: true, email: 'myort@myortlab.com', permissions: { canCreateOrders: true, canEditOrders: false, canViewAllOrders: false, canManagePatients: true } },
    { id: '8', login: 'clinic1', pass: 'clinic1', name: 'Управляющий 1', role: 'clinic_mgr', clinic: 'Клиника 1', mirror: false, email: 'mgr1@clinic1.com', permissions: { canViewAllOrders: false, canViewReports: true } },
    { id: '9', login: 'clinic2', pass: 'clinic2', name: 'Управляющий 2', role: 'clinic_mgr', clinic: 'Клиника 2', mirror: false, email: 'mgr2@clinic2.com', permissions: { canViewAllOrders: false, canViewReports: true } },
    { id: '10', login: 'marker', pass: 'marker', name: 'Маркетолог', role: 'marketer', clinic: '', mirror: false, email: 'marketing@myortlab.com', permissions: {} },
    { id: '11', login: 'tech1', pass: 'tech1', name: 'Техник CAD', role: 'cadcam', clinic: '', mirror: false, email: 'cad@myortlab.com', permissions: { canEditOrders: true } },
    { id: '12', login: 'tech2', pass: 'tech2', name: 'Техник 2', role: 'tech_phys', clinic: '', mirror: false, email: 'tech2@myortlab.com', permissions: { canEditOrders: true } },
    { id: '13', login: 'keramist', pass: 'keramist', name: 'Керамист', role: 'keramist', clinic: '', mirror: false, email: 'keramist@myortlab.com', permissions: { canEditOrders: true } },
    { id: '14', login: 'finisher', pass: 'finisher', name: 'Финишер', role: 'tech_phys', clinic: '', mirror: false, email: 'finisher@myortlab.com', permissions: { canEditOrders: true } },
    { id: '15', login: 'gips', pass: 'gips', name: 'Гипсовщик', role: 'gips', clinic: '', mirror: false, email: 'gips@myortlab.com', permissions: { canEditOrders: true } },
    { id: '16', login: 'print', pass: 'print', name: '3D-печать', role: 'print3d', clinic: '', mirror: false, email: 'print@myortlab.com', permissions: { canEditOrders: true } },
    { id: '17', login: 'frezer', pass: 'frezer', name: 'Фрезеровка', role: 'tech_phys', clinic: '', mirror: false, email: 'frezer@myortlab.com', permissions: { canEditOrders: true } },
    { id: '18', login: 'scan', pass: 'scan', name: 'Сканер', role: 'scan', clinic: '', mirror: false, email: 'scan@myortlab.com', permissions: { canEditOrders: true } },
  ];

  const patients: Patient[] = [
    { id: 'p1', fio: 'Иванов Иван Иванович', sex: 'мужской', bd: '1985-05-15', clinic: 'Клиника 1', doctors: ['5'] },
    { id: 'p2', fio: 'Петрова Мария Сергеевна', sex: 'женский', bd: '1990-08-22', clinic: 'Клиника 2', doctors: ['6'] },
    { id: 'p3', fio: 'Сидоров Алексей Петрович', sex: 'мужской', bd: '1978-12-03', clinic: 'MyOrt', doctors: ['7'] },
    { id: 'p4', fio: 'Козлова Анна Владимировна', sex: 'женский', bd: '1988-03-17', clinic: 'Клиника 1', doctors: ['5'] },
    { id: 'p5', fio: 'Волков Дмитрий Андреевич', sex: 'мужской', bd: '1982-11-09', clinic: 'Клиника 2', doctors: ['6'] },
  ];

  const catalog: Service[] = [
    { id: 'svc1', cat: 'ЗТЛ', sub: 'Ортопедия', name: 'Коронка металлокерамическая', price: 15000, term: '14 дней', termDays: 14 },
    { id: 'svc2', cat: 'ЗТЛ', sub: 'Ортопедия', name: 'Мостовидный протез металлокерамический', price: 45000, term: '21 день', termDays: 21 },
    { id: 'svc3', cat: 'ЗТЛ', sub: 'Ортопедия', name: 'Винир керамический', price: 20000, term: '10 дней', termDays: 10 },
    { id: 'svc4', cat: 'ЗТЛ', sub: 'Ортопедия', name: 'Абатмент индивидуальный', price: 12000, term: '14 дней', termDays: 14 },
    { id: 'svc5', cat: 'ЗТЛ', sub: 'Моделировка', name: 'Анализ модели', price: 3000, term: '3 дня', termDays: 3 },
    { id: 'svc6', cat: 'ЗТЛ', sub: 'Моделировка', name: 'Виртуальное планирование', price: 8000, term: '5 дней', termDays: 5 },
    { id: 'svc7', cat: 'ЗТЛ', sub: 'Ортодонтия', name: 'Капа ретенционная', price: 5000, term: '7 дней', termDays: 7 },
    { id: 'svc8', cat: 'ЗТЛ', sub: 'Ортодонтия', name: 'Алайнеры (1 пара)', price: 25000, term: '14 дней', termDays: 14 },
    { id: 'svc9', cat: 'ЗТЛ', sub: 'Протезирование Ао4/6', name: 'Коронка цельнолитая', price: 8000, term: '10 дней', termDays: 10 },
    { id: 'svc10', cat: 'ЗТЛ', sub: 'Протезирование Ао4/6', name: 'Шинирующий бюгель', price: 35000, term: '21 день', termDays: 21 },
    { id: 'svc11', cat: 'ЗТЛ', sub: 'Балочные', name: 'Балочный протез', price: 55000, term: '28 дней', termDays: 28 },
    { id: 'svc12', cat: 'ЗТЛ', sub: 'Хирургия', name: 'Хирургический шаблон', price: 15000, term: '7 дней', termDays: 7 },
    { id: 'svc13', cat: 'ЗТЛ', sub: 'Хирургия', name: 'Графт костный', price: 12000, term: '10 дней', termDays: 10 },
    { id: 'svc14', cat: 'ЗТЛ', sub: 'Временные', name: 'Временная коронка', price: 3000, term: '3 дня', termDays: 3 },
    { id: 'svc15', cat: 'ЗТЛ', sub: 'Временные', name: 'Временный мост', price: 8000, term: '5 дней', termDays: 5 },
    { id: 'svc16', cat: 'Гнатология', sub: 'Сплинты', name: 'Сплинт релаксационный', price: 8000, term: '7 дней', termDays: 7 },
    { id: 'svc17', cat: 'Гнатология', sub: 'Сплинты', name: 'Сплинт каплевидный', price: 9000, term: '7 дней', termDays: 7 },
    { id: 'svc18', cat: 'Гнатология', sub: 'Накладки', name: 'Накладка на верхнюю челюсть', price: 6000, term: '5 дней', termDays: 5 },
    { id: 'svc19', cat: 'Гнатология', sub: 'Накладки', name: 'Накладка на нижнюю челюсть', price: 6000, term: '5 дней', termDays: 5 },
    { id: 'svc20', cat: 'Ремонтные работы', sub: 'Ремонт', name: 'Ремонт протеза', price: 5000, term: '5 дней', termDays: 5 },
    { id: 'svc21', cat: 'Ремонтные работы', sub: 'Ремонт', name: 'Перебазировка протеза', price: 7000, term: '7 дней', termDays: 7 },
    { id: 'svc22', cat: 'ЗТЛ', sub: 'Имплантология', name: 'Коронка на имплант', price: 25000, term: '14 дней', termDays: 14 },
    { id: 'svc23', cat: 'ЗТЛ', sub: 'Имплантология', name: 'Абатмент с интерфейсом', price: 15000, term: '14 дней', termDays: 14 },
    { id: 'svc24', cat: 'ЗТЛ', sub: 'Моделировка', name: 'Модель анатомическая', price: 2000, term: '3 дня', termDays: 3 },
    { id: 'svc25', cat: 'ЗТЛ', sub: 'Ортопедия', name: 'Коронка цельнокерамическая', price: 22000, term: '14 дней', termDays: 14 },
    { id: 'svc26', cat: 'ЗТЛ', sub: 'Ортопедия', name: 'Винир цельнокерамический', price: 25000, term: '10 дней', termDays: 10 },
    { id: 'svc27', cat: 'ЗТЛ', sub: 'Ортопедия', name: 'Коронка циркониевая', price: 20000, term: '14 дней', termDays: 14 },
    { id: 'svc28', cat: 'ЗТЛ', sub: 'Ортопедия', name: 'Мостовидный протез цельнокерамический', price: 60000, term: '21 день', termDays: 21 },
    { id: 'svc29', cat: 'ЗТЛ', sub: 'Протезирование Ао4/6', name: 'Коронка с керамической облицовкой', price: 18000, term: '14 дней', termDays: 14 },
    { id: 'svc30', cat: 'ЗТЛ', sub: 'Протезирование Ао4/6', name: 'Мостовидный протез с керамической облицовкой', price: 50000, term: '21 день', termDays: 21 },
    { id: 'svc31', cat: 'ЗТЛ', sub: 'Протезирование Ао4/6', name: 'Несъемный протез на замках', price: 70000, term: '28 дней', termDays: 28 },
    { id: 'svc32', cat: 'ЗТЛ', sub: 'Балочные', name: 'Балочный протез с кламмерами', price: 60000, term: '28 дней', termDays: 28 },
    { id: 'svc33', cat: 'ЗТЛ', sub: 'Балочные', name: 'Балочный протез с телескопическими коронками', price: 80000, term: '35 дней', termDays: 35 },
    { id: 'svc34', cat: 'ЗТЛ', sub: 'Хирургия', name: 'Остеопластика', price: 18000, term: '10 дней', termDays: 10 },
    { id: 'svc35', cat: 'ЗТЛ', sub: 'Хирургия', name: 'Гингивопластика', price: 10000, term: '7 дней', termDays: 7 },
    { id: 'svc36', cat: 'ЗТЛ', sub: 'Временные', name: 'Временный штифтовой вкладыш', price: 4000, term: '3 дня', termDays: 3 },
    { id: 'svc37', cat: 'ЗТЛ', sub: 'Временные', name: 'Временный культевой вкладыш', price: 4500, term: '3 дня', termDays: 3 },
    { id: 'svc38', cat: 'Гнатология', sub: 'Сплинты', name: 'Сплинт окклюзионный', price: 10000, term: '7 дней', termDays: 7 },
    { id: 'svc39', cat: 'Гнатология', sub: 'Сплинты', name: 'Сплинт для бруксизма', price: 9500, term: '7 дней', termDays: 7 },
    { id: 'svc40', cat: 'Гнатология', sub: 'Накладки', name: 'Накладка функциональная', price: 8000, term: '5 дней', termDays: 5 },
    { id: 'svc41', cat: 'Гнатология', sub: 'Накладки', name: 'Накладка суставная', price: 12000, term: '7 дней', termDays: 7 },
    { id: 'svc42', cat: 'Ремонтные работы', sub: 'Ремонт', name: 'Замена искусственного зуба', price: 6000, term: '5 дней', termDays: 5 },
    { id: 'svc43', cat: 'Ремонтные работы', sub: 'Ремонт', name: 'Полировка протеза', price: 3000, term: '3 дня', termDays: 3 },
    { id: 'svc44', cat: 'Ремонтные работы', sub: 'Ремонт', name: 'Замена кламмера', price: 4000, term: '3 дня', termDays: 3 },
    { id: 'svc45', cat: 'Ремонтные работы', sub: 'Ремонт', name: 'Замена замка', price: 15000, term: '10 дней', termDays: 10 },
    { id: 'svc46', cat: 'ЗТЛ', sub: 'Имплантология', name: 'Коронка на абатмент', price: 28000, term: '14 дней', termDays: 14 },
    { id: 'svc47', cat: 'ЗТЛ', sub: 'Имплантология', name: 'Протез на имплантах', price: 120000, term: '28 дней', termDays: 28 },
    { id: 'svc48', cat: 'ЗТЛ', sub: 'Моделировка', name: 'Модель диагностическая', price: 1500, term: '2 дня', termDays: 2 },
    { id: 'svc49', cat: 'ЗТЛ', sub: 'Моделировка', name: 'Модель рабочая', price: 2500, term: '3 дня', termDays: 3 },
    { id: 'svc50', cat: 'ЗТЛ', sub: 'Моделировка', name: 'Модель для 3D печати', price: 3000, term: '3 дня', termDays: 3 },
  ];

  const workTypes: WorkType[] = [
    { id: 'wt1', name: 'CAD-моделирование', defPrice: 3000, timeNorm: 120, materials: [{ matId: 'mat6', qtyPerUnit: 0.1 }] },
    { id: 'wt2', name: 'Фрезеровка', defPrice: 2500, timeNorm: 60, materials: [{ matId: 'mat1', qtyPerUnit: 1 }] },
    { id: 'wt3', name: '3D-печать', defPrice: 2000, timeNorm: 90, materials: [{ matId: 'mat6', qtyPerUnit: 0.5 }] },
    { id: 'wt4', name: 'Гипсовка', defPrice: 1500, timeNorm: 30, materials: [{ matId: 'mat7', qtyPerUnit: 0.5 }] },
    { id: 'wt5', name: 'Шлифовка', defPrice: 1000, timeNorm: 20, materials: [{ matId: 'mat9', qtyPerUnit: 0.1 }] },
    { id: 'wt6', name: 'Керамика', defPrice: 4000, timeNorm: 180, materials: [{ matId: 'mat2', qtyPerUnit: 1 }] },
    { id: 'wt7', name: 'Спекание', defPrice: 2000, timeNorm: 60, materials: [] },
    { id: 'wt8', name: 'Сборка', defPrice: 1500, timeNorm: 45, materials: [{ matId: 'mat8', qtyPerUnit: 0.1 }] },
    { id: 'wt9', name: 'Окклюзия', defPrice: 2000, timeNorm: 30, materials: [] },
    { id: 'wt10', name: 'Сплинт', defPrice: 3000, timeNorm: 90, materials: [{ matId: 'mat5', qtyPerUnit: 0.2 }] },
  ];

  const materials: Material[] = [
    { id: 'mat1', name: 'Керамика Zirconia', unit: 'шт', costPerUnit: 1500, currentStock: 50, minStock: 10 },
    { id: 'mat2', name: 'Керамика Porcelain', unit: 'шт', costPerUnit: 800, currentStock: 100, minStock: 20 },
    { id: 'mat3', name: 'Металл CoCr', unit: 'шт', costPerUnit: 2000, currentStock: 80, minStock: 15 },
    { id: 'mat4', name: 'Металл Ti', unit: 'шт', costPerUnit: 3000, currentStock: 30, minStock: 5 },
    { id: 'mat5', name: 'Пластик ABS', unit: 'кг', costPerUnit: 1500, currentStock: 10, minStock: 2 },
    { id: 'mat6', name: 'Порошок для печати', unit: 'кг', costPerUnit: 2500, currentStock: 20, minStock: 5 },
    { id: 'mat7', name: 'Гипс', unit: 'кг', costPerUnit: 200, currentStock: 100, minStock: 20 },
    { id: 'mat8', name: 'Клей для керамики', unit: 'шт', costPerUnit: 500, currentStock: 50, minStock: 10 },
    { id: 'mat9', name: 'Паста для полировки', unit: 'шт', costPerUnit: 300, currentStock: 60, minStock: 10 },
    { id: 'mat10', name: 'Сплав золотой', unit: 'г', costPerUnit: 5000, currentStock: 150, minStock: 30 },
  ];

  const stockIn: StockIn[] = [
    { id: 'si1', matId: 'mat1', qty: 10, price: 1500, at: now - day, note: 'Поставка от ООО "Материалы"' },
    { id: 'si2', matId: 'mat2', qty: 20, price: 800, at: now - 2*day, note: 'Поставка от ООО "Керамика"' },
    { id: 'si3', matId: 'mat3', qty: 15, price: 2000, at: now - 3*day, note: 'Поставка от ООО "Металлы"' },
  ];

  const orders: Order[] = [
    {
      id: 'o1', num: 'GT-101', patientId: 'p1', doctorId: '5', clinic: 'Клиника 1',
      category: 'ЗТЛ', notesText: 'Коронка на 14 зуб',
      positions: [{
        id: 'pos1', name: 'Коронка металлокерамическая', svcId: 'svc1', cat: 'Ортопедия', qty: 1, price: 15000,
        ops: [{ id: 'op1', wtId: 'wt1', name: 'CAD-моделирование', techId: '11', fee: 3000, done: true, proddone: false, docOk: false, docOkAt: null, assignedAt: now - day, completedAt: now - day/2, mats: [] }]
      }],
      files: [{ id: 'f1', name: 'scan_14.stl', size: 2048000, typeCat: 'scan', dataUrl: null, by: '5', at: now - day }],
      plan: 'Изготовить коронку на 14 зуб', dueDate: '2026-09-21', dueTime: '10:00', termDays: 14,
      status: 'cadcam', corrections: 0, paymentType: 'pre100', priceUndefined: false, paid: true, freeApproved: false,
      address: 'ул. Примерная, д. 1', sent: false, received: false, handed: false, finalFixed: false, prodReady: false, payRecheck: false,
      createdAt: now - 2*day, acceptedAt: now - day, completedAt: null, returnReason: '',
      comments: [], history: [{ at: now - 2*day, by: '5', txt: 'Создан заказ' }, { at: now - day, by: '4', txt: 'Файлы приняты' }],
      has_physical_impressions: false, type: 'cadcam_only'
    },
    {
      id: 'o2', num: 'GT-102', patientId: 'p2', doctorId: '6', clinic: 'Клиника 2',
      category: 'ЗТЛ', notesText: 'Мостовидный протез на 11-21',
      positions: [{
        id: 'pos2', name: 'Мостовидный протез металлокерамический', svcId: 'svc2', cat: 'Ортопедия', qty: 1, price: 45000,
        ops: [{ id: 'op2', wtId: 'wt1', name: 'CAD-моделирование', techId: '11', fee: 5000, done: true, proddone: false, docOk: false, docOkAt: null, assignedAt: now - day, completedAt: now - day/2, mats: [] }]
      }],
      files: [{ id: 'f2', name: 'scan_11-21.stl', size: 3072000, typeCat: 'scan', dataUrl: null, by: '6', at: now - day }],
      plan: 'Изготовить мостовидный протез на 11-21 зубы', dueDate: '2026-09-28', dueTime: '14:00', termDays: 21,
      status: 'approve', corrections: 0, paymentType: 'pre50', priceUndefined: false, paid: true, freeApproved: false,
      address: 'ул. Тестовая, д. 2', sent: false, received: false, handed: false, finalFixed: false, prodReady: false, payRecheck: false,
      createdAt: now - 3*day, acceptedAt: now - 2*day, completedAt: null, returnReason: '',
      comments: [], history: [{ at: now - 3*day, by: '6', txt: 'Создан заказ' }, { at: now - 2*day, by: '4', txt: 'Файлы приняты' }],
      has_physical_impressions: true, type: 'full'
    },
    {
      id: 'o3', num: 'GT-103', patientId: 'p3', doctorId: '7', clinic: 'MyOrt',
      category: 'Гнатология', notesText: 'Сплинт релаксационный',
      positions: [{
        id: 'pos3', name: 'Сплинт релаксационный', svcId: 'svc16', cat: 'Сплинты', qty: 1, price: 8000,
        ops: [{ id: 'op3', wtId: 'wt10', name: 'Сплинт', techId: '12', fee: 2000, done: false, proddone: true, docOk: false, docOkAt: null, assignedAt: now - day, completedAt: now - day/2, mats: [] }]
      }],
      files: [{ id: 'f3', name: 'scan_lower.stl', size: 1536000, typeCat: 'scan', dataUrl: null, by: '7', at: now - day }],
      plan: 'Изготовить сплинт релаксационный', dueDate: '2026-09-14', dueTime: '12:00', termDays: 7,
      status: 'production', corrections: 0, paymentType: 'post100', priceUndefined: false, paid: false, freeApproved: false,
      address: 'ул. Гнатологическая, д. 3', sent: false, received: false, handed: false, finalFixed: false, prodReady: false, payRecheck: false,
      createdAt: now - 2*day, acceptedAt: now - day, completedAt: null, returnReason: '',
      comments: [], history: [{ at: now - 2*day, by: '7', txt: 'Создан заказ' }],
      has_physical_impressions: false, type: 'phys_only'
    },
    {
      id: 'o4', num: 'RT-001', patientId: 'p4', doctorId: '5', clinic: 'Клиника 1',
      category: 'Ремонтные работы', notesText: 'Ремонт протеза - трещина на базисе',
      positions: [{
        id: 'pos4', name: 'Ремонт протеза', svcId: 'svc20', cat: 'Ремонт', qty: 1, price: 5000,
        ops: [{ id: 'op4', wtId: 'wt8', name: 'Сборка', techId: '14', fee: 1500, done: false, proddone: false, docOk: false, docOkAt: null, assignedAt: now - day, completedAt: null, mats: [] }]
      }],
      files: [{ id: 'f4', name: 'photo_damage.jpg', size: 1024000, typeCat: 'photo', dataUrl: null, by: '5', at: now - day }],
      plan: 'Ремонт протеза с заменой поврежденного участка', dueDate: '2026-09-18', dueTime: '16:00', termDays: 5,
      status: 'repair_approve', corrections: 0, paymentType: 'pre100', priceUndefined: false, paid: true, freeApproved: false,
      address: 'ул. Примерная, д. 1', sent: false, received: false, handed: false, finalFixed: false, prodReady: false, payRecheck: false,
      createdAt: now - 2*day, acceptedAt: now - day, completedAt: null, returnReason: '',
      comments: [], history: [{ at: now - 2*day, by: '5', txt: 'Создан заказ на ремонт' }],
      has_physical_impressions: false, type: 'repair'
    },
    {
      id: 'o5', num: 'GT-104', patientId: 'p5', doctorId: '6', clinic: 'Клиника 2',
      category: 'Гарантия', notesText: 'Замена сломанного винира',
      positions: [{
        id: 'pos5', name: 'Замена винира', svcId: null, cat: 'Гарантия', qty: 1, price: 0,
        ops: [{ id: 'op5', wtId: 'wt6', name: 'Керамика', techId: '13', fee: 0, done: false, proddone: false, docOk: false, docOkAt: null, assignedAt: now - day, completedAt: null, mats: [] }]
      }],
      files: [{ id: 'f5', name: 'photo_broken.jpg', size: 2048000, typeCat: 'photo', dataUrl: null, by: '6', at: now - day }],
      plan: 'Замена винира по гарантии', dueDate: '2026-09-20', dueTime: '11:00', termDays: 7,
      status: 'guarantee_approve', corrections: 0, paymentType: 'internal', priceUndefined: false, paid: true, freeApproved: false,
      address: 'ул. Тестовая, д. 2', sent: false, received: false, handed: false, finalFixed: false, prodReady: false, payRecheck: false,
      createdAt: now - 2*day, acceptedAt: now - day, completedAt: null, returnReason: '',
      comments: [], history: [{ at: now - 2*day, by: '6', txt: 'Создан заказ на гарантию' }],
      has_physical_impressions: false, type: 'guarantee', repairOrderNum: 'GT-098'
    },
    {
      id: 'o6', num: 'GT-105', patientId: 'p1', doctorId: '5', clinic: 'Клиника 1',
      category: 'ЗТЛ', notesText: 'Коронка на имплант',
      positions: [{
        id: 'pos6', name: 'Коронка на имплант', svcId: 'svc22', cat: 'Имплантология', qty: 1, price: 25000,
        ops: [{ id: 'op6', wtId: 'wt1', name: 'CAD-моделирование', techId: '11', fee: 3000, done: false, proddone: false, docOk: false, docOkAt: null, assignedAt: now - day, completedAt: null, mats: [] }]
      }],
      files: [{ id: 'f6', name: 'implant_scan.stl', size: 2560000, typeCat: 'scan', dataUrl: null, by: '5', at: now - day }],
      plan: 'Изготовить коронку на имплант 46', dueDate: '2026-09-25', dueTime: '15:00', termDays: 14,
      status: 'admin_pricing', corrections: 0, paymentType: 'pre100', priceUndefined: false, paid: true, freeApproved: false,
      address: 'ул. Примерная, д. 1', sent: false, received: false, handed: false, finalFixed: false, prodReady: false, payRecheck: false,
      createdAt: now - 3*day, acceptedAt: now - 2*day, completedAt: null, returnReason: '',
      comments: [], history: [{ at: now - 3*day, by: '5', txt: 'Создан заказ' }],
      has_physical_impressions: false, type: 'cadcam_only'
    },
    {
      id: 'o7', num: 'GT-106', patientId: 'p2', doctorId: '6', clinic: 'Клиника 2',
      category: 'ЗТЛ', notesText: 'Виниры на передние зубы',
      positions: [{
        id: 'pos7', name: 'Винир керамический', svcId: 'svc3', cat: 'Ортопедия', qty: 6, price: 120000,
        ops: [{ id: 'op7', wtId: 'wt1', name: 'CAD-моделирование', techId: '11', fee: 3000, done: false, proddone: false, docOk: false, docOkAt: null, assignedAt: now - day, completedAt: null, mats: [] }]
      }],
      files: [{ id: 'f7', name: 'scan_front.stl', size: 4096000, typeCat: 'scan', dataUrl: null, by: '6', at: now - day }],
      plan: 'Изготовить 6 виниров на передние зубы', dueDate: '2026-09-22', dueTime: '10:00', termDays: 10,
      status: 'quality', corrections: 0, paymentType: 'pre100', priceUndefined: false, paid: false, freeApproved: false,
      address: 'ул. Тестовая, д. 2', sent: false, received: false, handed: false, finalFixed: false, prodReady: false, payRecheck: false,
      createdAt: now - day, acceptedAt: null, completedAt: null, returnReason: '',
      comments: [], history: [{ at: now - day, by: '6', txt: 'Создан заказ' }],
      has_physical_impressions: false, type: 'cadcam_only'
    },
    {
      id: 'o8', num: 'GT-107', patientId: 'p3', doctorId: '7', clinic: 'MyOrt',
      category: 'Гнатология', notesText: 'Сплинт для бруксизма',
      positions: [{
        id: 'pos8', name: 'Сплинт для бруксизма', svcId: 'svc39', cat: 'Сплинты', qty: 1, price: 9500,
        ops: [{ id: 'op8', wtId: 'wt10', name: 'Сплинт', techId: '12', fee: 2500, done: false, proddone: false, docOk: false, docOkAt: null, assignedAt: now - day, completedAt: null, mats: [] }]
      }],
      files: [{ id: 'f8', name: 'jaw_scan.stl', size: 3072000, typeCat: 'scan', dataUrl: null, by: '7', at: now - day }],
      plan: 'Изготовить сплинт для лечения бруксизма', dueDate: '2026-09-16', dueTime: '13:00', termDays: 7,
      status: 'returned', corrections: 0, paymentType: 'internal', priceUndefined: false, paid: true, freeApproved: false,
      address: 'ул. Гнатологическая, д. 3', sent: false, received: false, handed: false, finalFixed: false, prodReady: false, payRecheck: false,
      createdAt: now - 2*day, acceptedAt: now - day, completedAt: null, returnReason: 'Необходимо изменить толщину сплинта',
      comments: [], history: [{ at: now - 2*day, by: '7', txt: 'Создан заказ' }, { at: now - day, by: '4', txt: 'Файлы возвращены на доработку' }],
      has_physical_impressions: false, type: 'phys_only'
    },
  ];

  const news: NewsItem[] = [
    { id: 'n1', title: 'Обновление цен в каталоге', txt: 'С 1 сентября 2026 года обновлены цены на услуги в каталоге. Обратите внимание на новые расценки.', at: now - day, by: '1' },
    { id: 'n2', title: 'Новый функционал в системе', txt: 'Добавлена возможность экспорта отчётов в формате CSV. Теперь можно скачивать данные для анализа.', at: now - 2*day, by: '1' },
  ];

  return {
    users, patients, catalog, workTypes, materials, stockIn,
    materialUsage: [],
    orders, news,
    mirrorReports: [],
    rolesMeta: JSON.parse(JSON.stringify(DEFAULT_ROLES_META)),
    settings: {
      language: 'ru',
      gmaiPrices: { basic_month: 9900, basic_year: 99000, extended_month: 19900, extended_year: 199000 },
      alignersUrl: 'https://myortlab.com/aligners',
      notifications: {
        telegram: { enabled: false, botToken: '', chatId: '' },
        max: { enabled: false, apiKey: '', chatId: '' },
        email: { enabled: false, smtp: { host: '', port: 587, user: '', pass: '' }, from: '' }
      }
    },
  };
}

// Демо-данные для калькулятора прайса
// Источник: НК1.html

export interface CostRowData {
  type: 'material_percent' | 'material' | 'work';
  name: string;
  percent?: number;
  unit?: string;
  qty?: number;
  unitCost?: number;
}

export interface ProductData {
  id: string;
  name: string;
  price: number;
  marketingRate: number;
  insuranceRate: number;
  fixedRate: number;
  useMaterialPercent: boolean;
  materialPercent: number;
  costRows: CostRowData[];
}

export interface CategoryData {
  products: ProductData[];
}

export const PRICE_CALCULATOR_DEMO_DATA: Record<string, CategoryData> = {
  "Диагностика и планирование": {
    products: [
      {
        id: "digital_variator",
        name: "Цифровой вариатор",
        price: 4000,
        marketingRate: 0.044,
        insuranceRate: 0.30,
        fixedRate: 0.15,
        useMaterialPercent: true,
        materialPercent: 0.038,
        costRows: [
          { type: "material_percent", name: "Общие расходные материалы (% от цены)", percent: 0.038 },
          { type: "work", name: "Работа в 3Д (Цифровой Вариатор)", qty: 1, unitCost: 900 }
        ]
      },
      {
        id: "modeling_virtual",
        name: "Моделировка виртуальная (1 ед) под ХШ",
        price: 1500,
        marketingRate: 0.044,
        insuranceRate: 0.30,
        fixedRate: 0.15,
        useMaterialPercent: true,
        materialPercent: 0.04,
        costRows: [
          { type: "material_percent", name: "Общие расходные материалы (% от цены)", percent: 0.04 },
          { type: "work", name: "Работа в 3Д (ХШ)", qty: 1, unitCost: 400 }
        ]
      },
      {
        id: "modeling_esthetic",
        name: "Функционально-эстетическая моделировка (1 ед)",
        price: 2150,
        marketingRate: 0.044,
        insuranceRate: 0.30,
        fixedRate: 0.15,
        useMaterialPercent: true,
        materialPercent: 0.04,
        costRows: [
          { type: "material_percent", name: "Общие расходные материалы (% от цены)", percent: 0.04 },
          { type: "work", name: "Работа в 3Д (Эстетическая моделировка)", qty: 1, unitCost: 550 }
        ]
      },
      {
        id: "modeling_total",
        name: "Комплексная (тотальная) моделировка",
        price: 46000,
        marketingRate: 0.044,
        insuranceRate: 0.30,
        fixedRate: 0.12,
        useMaterialPercent: true,
        materialPercent: 0.035,
        costRows: [
          { type: "material_percent", name: "Общие расходные материалы (% от цены)", percent: 0.035 },
          { type: "work", name: "Работа в 3Д (Тотал)", qty: 1, unitCost: 8000 }
        ]
      },
      {
        id: "adapt_total",
        name: "Адаптация тотальной моделировки к рабочим сканам",
        price: 23000,
        marketingRate: 0.044,
        insuranceRate: 0.30,
        fixedRate: 0.12,
        useMaterialPercent: true,
        materialPercent: 0.035,
        costRows: [
          { type: "material_percent", name: "Общие расходные материалы (% от цены)", percent: 0.035 },
          { type: "work", name: "Работа в 3Д (АдапТотал)", qty: 1, unitCost: 4000 }
        ]
      },
      {
        id: "complex_sequential",
        name: "Комплексная моделировка (Последовательная дезокклюзия)",
        price: 65000,
        marketingRate: 0.044,
        insuranceRate: 0.30,
        fixedRate: 0.12,
        useMaterialPercent: true,
        materialPercent: 0.03,
        costRows: [
          { type: "material_percent", name: "Общие расходные материалы (% от цены)", percent: 0.03 },
          { type: "material", name: "Смола", unit: "г.", qty: 30, unitCost: 6.5 },
          { type: "work", name: "Работа в 3Д (КомплекснаяМод)", qty: 1, unitCost: 12000 }
        ]
      }
    ]
  },
  "Ортопедия": {
    products: [
      {
        id: "zro2_crown_full",
        name: "ZrO2 коронка полная анатомия",
        price: 8500,
        marketingRate: 0.05,
        insuranceRate: 0.30,
        fixedRate: 0.10,
        useMaterialPercent: true,
        materialPercent: 0.04,
        costRows: [
          { type: "material_percent", name: "Общие расходные материалы (% от цены)", percent: 0.04 },
          { type: "material", name: "Печать Модель (или Гипс)", unit: "мл", qty: 0.03, unitCost: 1800 },
          { type: "material", name: "Щётка для полировки КОЗА", unit: "шт", qty: 0.1, unitCost: 379 },
          { type: "material", name: "Паста для полировки Renfert", unit: "гр", qty: 0.02, unitCost: 1383 },
          { type: "material", name: "Фреза", unit: "шт", qty: 1, unitCost: 5 },
          { type: "material", name: "Циркон", unit: "шт", qty: 0.04, unitCost: 1600 },
          { type: "material", name: "Краска для керамики", unit: "Грамм", qty: 0.1, unitCost: 66 },
          { type: "material", name: "Глазурь керамическая", unit: "Грамм", qty: 2, unitCost: 63 },
          { type: "material", name: "Полир для керамики/Zn", unit: "шт", qty: 1, unitCost: 88 },
          { type: "work", name: "Покраска Эстетика (глазурь)", qty: 1, unitCost: 350 },
          { type: "work", name: "Обработка Коронки", qty: 1, unitCost: 400 },
          { type: "work", name: "Работа в 3Д (ZrO2)", qty: 1, unitCost: 1200 }
        ]
      },
      {
        id: "zro2_implant_full",
        name: "ZrO2 на имплантате полная анатомия (без тит. основания)",
        price: 9500,
        marketingRate: 0.05,
        insuranceRate: 0.30,
        fixedRate: 0.10,
        useMaterialPercent: true,
        materialPercent: 0.04,
        costRows: [
          { type: "material_percent", name: "Общие расходные материалы (% от цены)", percent: 0.04 },
          { type: "material", name: "Печать Модель (или Гипс)", unit: "мл", qty: 0.03, unitCost: 1800 },
          { type: "material", name: "Щётка для полировки КОЗА", unit: "шт", qty: 0.1, unitCost: 379 },
          { type: "material", name: "Паста для полировки Renfert", unit: "гр", qty: 0.02, unitCost: 1383 },
          { type: "material", name: "Фреза", unit: "шт", qty: 1, unitCost: 5 },
          { type: "material", name: "Циркон", unit: "шт", qty: 0.04, unitCost: 1600 },
          { type: "material", name: "Краска для керамики", unit: "Грамм", qty: 0.01, unitCost: 6100 },
          { type: "material", name: "Глазурь керамическая", unit: "Грамм", qty: 0.02, unitCost: 6300 },
          { type: "material", name: "Полир для керамики/Zn", unit: "шт", qty: 1, unitCost: 88 },
          { type: "work", name: "Вклейка (ZrO2)", qty: 1, unitCost: 500 },
          { type: "work", name: "Покраска Эстетика (глазурь)", qty: 1, unitCost: 350 },
          { type: "work", name: "Обработка Коронки", qty: 1, unitCost: 400 },
          { type: "work", name: "Работа в 3Д (ZrO2 Импл)", qty: 1, unitCost: 1400 }
        ]
      },
      {
        id: "zro2_crown_ceramic",
        name: "ZrO2 коронка с нанесением керамики",
        price: 11800,
        marketingRate: 0.05,
        insuranceRate: 0.30,
        fixedRate: 0.10,
        useMaterialPercent: true,
        materialPercent: 0.04,
        costRows: [
          { type: "material_percent", name: "Общие расходные материалы (% от цены)", percent: 0.04 },
          { type: "material", name: "Печать Модель (или Гипс)", unit: "мл", qty: 0.03, unitCost: 1800 },
          { type: "material", name: "Щётка для полировки КОЗА", unit: "шт", qty: 0.1, unitCost: 379 },
          { type: "material", name: "Паста для полировки Renfert", unit: "гр", qty: 0.02, unitCost: 1383 },
          { type: "material", name: "Фреза", unit: "шт", qty: 1, unitCost: 5 },
          { type: "material", name: "Циркон", unit: "шт", qty: 0.04, unitCost: 1600 },
          { type: "material", name: "Краска для керамики", unit: "Грамм", qty: 0.01, unitCost: 6100 },
          { type: "material", name: "Глазурь керамическая", unit: "Грамм", qty: 0.02, unitCost: 6300 },
          { type: "material", name: "Полир для керамики/Zn", unit: "шт", qty: 1, unitCost: 88 },
          { type: "material", name: "Масса керамическая", unit: "Грамм", qty: 0.02, unitCost: 7000 },
          { type: "work", name: "Покраска ZrO2 (глазурь)", qty: 1, unitCost: 400 },
          { type: "work", name: "Нанесение Керамической Массы", qty: 1, unitCost: 800 },
          { type: "work", name: "Обработка Коронки", qty: 1, unitCost: 450 },
          { type: "work", name: "Работа в 3Д (ZrO2)", qty: 1, unitCost: 1400 }
        ]
      },
      {
        id: "vinir_emax_full",
        name: "Винир / Накладка E.max полная анатомия",
        price: 13000,
        marketingRate: 0.05,
        insuranceRate: 0.30,
        fixedRate: 0.10,
        useMaterialPercent: true,
        materialPercent: 0.04,
        costRows: [
          { type: "material_percent", name: "Общие расходные материалы (% от цены)", percent: 0.04 },
          { type: "material", name: "Печать Модель (или Гипс)", unit: "мл", qty: 0.015, unitCost: 1800 },
          { type: "material", name: "Воск (Диск)", unit: "шт", qty: 0.1, unitCost: 44 },
          { type: "material", name: "Таблетка ЕМАХ", unit: "шт", qty: 1, unitCost: 1400 },
          { type: "material", name: "Паковочная масса e-max", unit: "грамм", qty: 1, unitCost: 25 },
          { type: "material", name: "Жидкость для паковки e-max", unit: "мл", qty: 0.02, unitCost: 2700 },
          { type: "material", name: "Полир для керамики/Zn", unit: "шт", qty: 1, unitCost: 88 },
          { type: "material", name: "Щетка для полировки БИЗОН", unit: "шт", qty: 0.1, unitCost: 379 },
          { type: "material", name: "Паста для полировки Renfert", unit: "гр", qty: 0.02, unitCost: 1383 },
          { type: "material", name: "Краска для керамики", unit: "грамм", qty: 0.01, unitCost: 6100 },
          { type: "material", name: "Глазурь керамическая", unit: "грамм", qty: 0.02, unitCost: 6300 },
          { type: "work", name: "Покраска Эстетика (глазурь)", qty: 1, unitCost: 350 },
          { type: "work", name: "Обработка Винир/Накладка", qty: 1, unitCost: 500 },
          { type: "work", name: "Пресс каркаса Винир/Накладка", qty: 1, unitCost: 600 },
          { type: "work", name: "Работа в 3Д Винир/Накладка", qty: 1, unitCost: 1800 }
        ]
      },
      {
        id: "temp_crown_pmma",
        name: "Изготовление временных коронок PMMA на культях (1 ед.)",
        price: 3200,
        marketingRate: 0.04,
        insuranceRate: 0.30,
        fixedRate: 0.10,
        useMaterialPercent: true,
        materialPercent: 0.04,
        costRows: [
          { type: "material_percent", name: "Общие расходные материалы (% от цены)", percent: 0.04 },
          { type: "material", name: "Печать Модель (или Гипс)", unit: "мл", qty: 0.015, unitCost: 1800 },
          { type: "material", name: "Диск РММА", unit: "шт", qty: 0.01, unitCost: 1500 },
          { type: "material", name: "Фреза", unit: "шт", qty: 1, unitCost: 5 },
          { type: "material", name: "Полир", unit: "шт", qty: 1, unitCost: 5 },
          { type: "work", name: "Обработка Временной Коронки", qty: 1, unitCost: 250 },
          { type: "work", name: "Работа в 3Д Временная Коронка", qty: 1, unitCost: 400 },
          { type: "work", name: "Вклейка (ТитанОснование)", qty: 1, unitCost: 200 }
        ]
      },
      {
        id: "ind_abutment_ti",
        name: "Индивидуальный абатмент Ti",
        price: 8500,
        marketingRate: 0.04,
        insuranceRate: 0.30,
        fixedRate: 0.10,
        useMaterialPercent: true,
        materialPercent: 0.03,
        costRows: [
          { type: "material_percent", name: "Общие расходные материалы (% от цены)", percent: 0.03 },
          { type: "material", name: "Фотополимерная смола для моделей", unit: "Грамм", qty: 0.03, unitCost: 1800 },
          { type: "material", name: "Фрез.центр (Аутсорс)", unit: "", qty: 1, unitCost: 2000 },
          { type: "material", name: "Фреза", unit: "шт", qty: 1, unitCost: 5 },
          { type: "material", name: "Полир", unit: "шт", qty: 1, unitCost: 5 },
          { type: "work", name: "Проектировка инд. абатмента", qty: 1, unitCost: 1200 },
          { type: "work", name: "Обработка инд. Абатмента", qty: 1, unitCost: 600 }
        ]
      }
    ]
  },
  "Сплинты и накладки": {
    products: [
      {
        id: "splint_with_diag",
        name: "Сплинт с диагностикой",
        price: 13000,
        marketingRate: 0.04,
        insuranceRate: 0.30,
        fixedRate: 0.12,
        useMaterialPercent: true,
        materialPercent: 0.035,
        costRows: [
          { type: "material_percent", name: "Общие расходные материалы (% от цены)", percent: 0.035 },
          { type: "material", name: "Фотополимерная смола для моделей", unit: "Грамм", qty: 0.015, unitCost: 1800 },
          { type: "material", name: "Диск фрезеровочный РММА", unit: "шт", qty: 0.5, unitCost: 1500 },
          { type: "material", name: "Паста для полировки Blue shine", unit: "грамм", qty: 0.05, unitCost: 5500 },
          { type: "material", name: "Фреза", unit: "шт", qty: 1, unitCost: 5 },
          { type: "material", name: "Щетка для полировки БЕЗОН", unit: "шт", qty: 1, unitCost: 5 },
          { type: "work", name: "Работа в 3Д (проектировка сплинта)", qty: 1, unitCost: 2300 },
          { type: "work", name: "Обработка Сплинта", qty: 1, unitCost: 800 }
        ]
      },
      {
        id: "splint_without_diag",
        name: "Изготовление сплинта без диагностики",
        price: 10500,
        marketingRate: 0.04,
        insuranceRate: 0.30,
        fixedRate: 0.12,
        useMaterialPercent: true,
        materialPercent: 0.035,
        costRows: [
          { type: "material_percent", name: "Общие расходные материалы (% от цены)", percent: 0.035 },
          { type: "material", name: "Фотополимерная смола для моделей", unit: "Грамм", qty: 0.015, unitCost: 1800 },
          { type: "material", name: "Диск фрезеровочный РММА", unit: "шт", qty: 0.5, unitCost: 1500 },
          { type: "material", name: "Паста для полировки Blue shine", unit: "грамм", qty: 0.05, unitCost: 5500 },
          { type: "work", name: "Работа в 3Д (проектировка сплинта без диагностики)", qty: 1, unitCost: 1800 },
          { type: "work", name: "Обработка Сплинта", qty: 1, unitCost: 700 }
        ]
      },
      {
        id: "splint_no_frez",
        name: "Изготовление сплинта без фрезеровки",
        price: 9000,
        marketingRate: 0.04,
        insuranceRate: 0.30,
        fixedRate: 0.12,
        useMaterialPercent: true,
        materialPercent: 0.03,
        costRows: [
          { type: "material_percent", name: "Общие расходные материалы (% от цены)", percent: 0.03 },
          { type: "work", name: "Работа в 3Д (проектировка сплинта)", qty: 1, unitCost: 2500 }
        ]
      },
      {
        id: "nakladki_4_diag",
        name: "Изготовление накладок с диагностикой (4 шт.)",
        price: 16500,
        marketingRate: 0.04,
        insuranceRate: 0.30,
        fixedRate: 0.12,
        useMaterialPercent: true,
        materialPercent: 0.035,
        costRows: [
          { type: "material_percent", name: "Общие расходные материалы (% от цены)", percent: 0.035 },
          { type: "material", name: "Фотополимерная смола для моделей", unit: "Грамм", qty: 0.03, unitCost: 1800 },
          { type: "material", name: "Фотополимерная смола для накладок", unit: "Грамм", qty: 0.2, unitCost: 8700 },
          { type: "material", name: "Фреза", unit: "шт", qty: 1, unitCost: 5 },
          { type: "material", name: "Резинка полировочная", unit: "шт", qty: 1, unitCost: 5 },
          { type: "material", name: "Щетка для полировки", unit: "шт", qty: 1, unitCost: 5 },
          { type: "work", name: "Проектировка 4х Накладок с Диагностикой", qty: 1, unitCost: 2300 },
          { type: "work", name: "Обработка Накладки", qty: 4, unitCost: 300 }
        ]
      }
    ]
  },
  "Ортодонтические аппараты": {
    products: [
      {
        id: "derichsweiler",
        name: "Аппарат Дерихсвайлера",
        price: 19000,
        marketingRate: 0.04,
        insuranceRate: 0.30,
        fixedRate: 0.12,
        useMaterialPercent: true,
        materialPercent: 0.03,
        costRows: [
          { type: "material_percent", name: "Общие расходные материалы (% от цены)", percent: 0.03 },
          { type: "material", name: "Винт Hyrax", unit: "шт", qty: 1, unitCost: 3500 },
          { type: "material", name: "Цемент для фиксации", unit: "гр", qty: 0.15, unitCost: 2200 },
          { type: "material", name: "Металл", unit: "шт", qty: 1, unitCost: 345 },
          { type: "material", name: "Паковочная масса", unit: "шт", qty: 1, unitCost: 690 },
          { type: "material", name: "Полир", unit: "шт", qty: 1, unitCost: 100 },
          { type: "work", name: "Обработка Аппарат Дерихсвайлера", qty: 1, unitCost: 2000 },
          { type: "work", name: "Проектировка Аппарат Дерихсвайлера", qty: 1, unitCost: 2500 }
        ]
      },
      {
        id: "marco_rossa",
        name: "Марко-Росса",
        price: 18000,
        marketingRate: 0.04,
        insuranceRate: 0.30,
        fixedRate: 0.12,
        useMaterialPercent: true,
        materialPercent: 0.03,
        costRows: [
          { type: "material_percent", name: "Общие расходные материалы (% от цены)", percent: 0.03 },
          { type: "material", name: "Полимер + Мономер", unit: "мл", qty: 1, unitCost: 430 },
          { type: "material", name: "Металл", unit: "шт", qty: 1, unitCost: 345 },
          { type: "material", name: "Паковочная масса", unit: "шт", qty: 1, unitCost: 690 },
          { type: "material", name: "Винт Hyrax", unit: "шт", qty: 1, unitCost: 3500 },
          { type: "material", name: "Изолирующая жидкость", unit: "мл", qty: 2, unitCost: 200 },
          { type: "work", name: "Полимеризация", qty: 1, unitCost: 600 },
          { type: "work", name: "Обработка Марко-Росса", qty: 1, unitCost: 1800 },
          { type: "work", name: "Проектировка Марко-Росса", qty: 1, unitCost: 2200 }
        ]
      },
      {
        id: "knopka_nansa",
        name: "Кнопка Нанса",
        price: 10000,
        marketingRate: 0.04,
        insuranceRate: 0.30,
        fixedRate: 0.12,
        useMaterialPercent: true,
        materialPercent: 0.03,
        costRows: [
          { type: "material_percent", name: "Общие расходные материалы (% от цены)", percent: 0.03 },
          { type: "material", name: "Полимер + Мономер", unit: "мл", qty: 1, unitCost: 430 },
          { type: "material", name: "Металл", unit: "шт", qty: 1, unitCost: 230 },
          { type: "material", name: "Паковочная масса + Жидкость", unit: "шт", qty: 1, unitCost: 920 },
          { type: "material", name: "Полир", unit: "шт", qty: 1, unitCost: 100 },
          { type: "work", name: "Обработка Кнопки Нанса", qty: 1, unitCost: 1000 },
          { type: "work", name: "Проектировка Кнопки Нанса", qty: 1, unitCost: 1200 }
        ]
      },
      {
        id: "apparat_gerbsta",
        name: "Аппарат Гербста",
        price: 40000,
        marketingRate: 0.04,
        insuranceRate: 0.30,
        fixedRate: 0.12,
        useMaterialPercent: true,
        materialPercent: 0.03,
        costRows: [
          { type: "material_percent", name: "Общие расходные материалы (% от цены)", percent: 0.03 },
          { type: "material", name: "Комплект Материала (винт)", unit: "шт", qty: 1, unitCost: 10000 },
          { type: "material", name: "Пайка", unit: "шт", qty: 1, unitCost: 450 },
          { type: "material", name: "Литье", unit: "шт", qty: 1, unitCost: 575 },
          { type: "material", name: "Паковочная масса", unit: "гр", qty: 260, unitCost: 3.15 },
          { type: "material", name: "Жидкость", unit: "мл", qty: 12, unitCost: 8.33 },
          { type: "material", name: "Полир", unit: "шт", qty: 1, unitCost: 300 },
          { type: "work", name: "Обработка Аппарат Гербста", qty: 1, unitCost: 3500 },
          { type: "work", name: "Проектировка Аппарат Гербста", qty: 1, unitCost: 5000 }
        ]
      }
    ]
  },
  "Элайнеры": {
    products: [
      {
        id: "elainer_gnaton",
        name: "Элайнер Гнатон",
        price: 5200,
        marketingRate: 0.04,
        insuranceRate: 0.30,
        fixedRate: 0.12,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: [
          { type: "material", name: "Фотополимерная смола для элайнеров", unit: "мл", qty: 0.03, unitCost: 1800 },
          { type: "material", name: "Экспорт STL", unit: "шт", qty: 2, unitCost: 70 },
          { type: "material", name: "Пластина", unit: "шт", qty: 2, unitCost: 100 },
          { type: "material", name: "Коробка Гнатон", unit: "шт", qty: 1, unitCost: 96 },
          { type: "material", name: "Крючок для Элайнеров", unit: "шт", qty: 1, unitCost: 10 },
          { type: "material", name: "Бокс Для элайнера", unit: "шт", qty: 1, unitCost: 8.9 },
          { type: "material", name: "Зип пакет", unit: "шт", qty: 1, unitCost: 14 },
          { type: "work", name: "Физическая Работа (Печать Модели для Элайнера)", qty: 1, unitCost: 200 },
          { type: "work", name: "Физическая Работа (Вакум.Обрезка..Полировка)", qty: 1, unitCost: 350 },
          { type: "work", name: "Физическая работа (мойка)", qty: 1, unitCost: 100 },
          { type: "work", name: "Физическая Работа (Упаковка Кейса Gnatone)", qty: 1, unitCost: 150 }
        ]
      }
    ]
  },
  "Условно-съемные протезы": {
    products: [
      {
        id: "all4_acryl_cocr",
        name: "All on 4 акрил, CoCr армирование (Литая Балка)",
        price: 53000,
        marketingRate: 0.04,
        insuranceRate: 0.30,
        fixedRate: 0.10,
        useMaterialPercent: true,
        materialPercent: 0.025,
        costRows: [
          { type: "material_percent", name: "Общие расходные материалы (% от цены)", percent: 0.025 },
          { type: "material", name: "Зубы ямагачи 1 плашка", unit: "шт", qty: 1, unitCost: 550 },
          { type: "material", name: "Пластмасса кондюлор блю", unit: "гр", qty: 0.03, unitCost: 8800 },
          { type: "material", name: "Воск", unit: "гр", qty: 0.02, unitCost: 750 },
          { type: "material", name: "Десна (Durasill)", unit: "гр", qty: 0.07, unitCost: 3400 },
          { type: "material", name: "Силикон База", unit: "гр", qty: 0.01, unitCost: 4400 },
          { type: "material", name: "Гипс (Синий + Желтый)", unit: "гр", qty: 0.03, unitCost: 6000 },
          { type: "material", name: "Литая Балка", unit: "шт", qty: 1, unitCost: 5000 },
          { type: "material", name: "Прочие расходы", unit: "", qty: 1, unitCost: 150 },
          { type: "work", name: "Физ Работа ALL4/6 СoCr", qty: 1, unitCost: 6000 }
        ]
      },
      {
        id: "all6_acryl_cocr",
        name: "All on 6 акрил, CoCr армирование (Литая Балка)",
        price: 60000,
        marketingRate: 0.04,
        insuranceRate: 0.30,
        fixedRate: 0.10,
        useMaterialPercent: true,
        materialPercent: 0.025,
        costRows: [
          { type: "material_percent", name: "Общие расходные материалы (% от цены)", percent: 0.025 },
          { type: "material", name: "Зубы ямагачи 1 плашка", unit: "шт", qty: 1, unitCost: 550 },
          { type: "material", name: "Пластмасса кондюлор блю", unit: "гр", qty: 0.03, unitCost: 8800 },
          { type: "material", name: "Воск", unit: "гр", qty: 0.02, unitCost: 750 },
          { type: "material", name: "Десна (Durasill)", unit: "гр", qty: 0.07, unitCost: 3400 },
          { type: "material", name: "Силикон База", unit: "гр", qty: 0.01, unitCost: 4400 },
          { type: "material", name: "Гипс (Синий + Желтый)", unit: "гр", qty: 0.03, unitCost: 6000 },
          { type: "material", name: "Литая Балка", unit: "шт", qty: 1, unitCost: 5000 },
          { type: "material", name: "Прочие расходы", unit: "", qty: 1, unitCost: 150 },
          { type: "work", name: "Физ Работа ALL4/6 СoCr", qty: 1, unitCost: 7000 }
        ]
      },
      {
        id: "perebaz_all4_6",
        name: "Перебазировка АО4, АО6, Акрил",
        price: 6700,
        marketingRate: 0.04,
        insuranceRate: 0.30,
        fixedRate: 0.10,
        useMaterialPercent: true,
        materialPercent: 0.03,
        costRows: [
          { type: "material_percent", name: "Общие расходные материалы (% от цены)", percent: 0.03 },
          { type: "material", name: "Зубы ямагачи 1 плашка", unit: "шт", qty: 1, unitCost: 550 },
          { type: "material", name: "Десна (Durasill)", unit: "гр", qty: 0.07, unitCost: 3400 },
          { type: "material", name: "Гипс (Синий)", unit: "гр", qty: 0.06, unitCost: 6000 },
          { type: "material", name: "КорАкрил Мономер", unit: "мл", qty: 0.04, unitCost: 1000 },
          { type: "material", name: "КорАкрил Полимер", unit: "гр", qty: 0.08, unitCost: 800 },
          { type: "material", name: "Прочие расходы", unit: "", qty: 1, unitCost: 170 },
          { type: "work", name: "Перебазировка All4/6 Акрил", qty: 1, unitCost: 1500 }
        ]
      }
    ]
  },
  "Балочные конструкции": {
    products: [
      {
        id: "balka_ti_4",
        name: "Балка титановая 4 опоры",
        price: 50000,
        marketingRate: 0.04,
        insuranceRate: 0.30,
        fixedRate: 0.10,
        useMaterialPercent: true,
        materialPercent: 0.02,
        costRows: [
          { type: "material_percent", name: "Общие расходные материалы (% от цены)", percent: 0.02 },
          { type: "material", name: "Балка Титановая", unit: "шт", qty: 1, unitCost: 11000 },
          { type: "work", name: "Обработка Балка Титан 4 Опоры", qty: 1, unitCost: 3000 },
          { type: "work", name: "Проектировка Балка Титан 4 Опоры", qty: 1, unitCost: 5000 }
        ]
      },
      {
        id: "balka_ti_6",
        name: "Балка титановая 6 опор",
        price: 75000,
        marketingRate: 0.04,
        insuranceRate: 0.30,
        fixedRate: 0.10,
        useMaterialPercent: true,
        materialPercent: 0.02,
        costRows: [
          { type: "material_percent", name: "Общие расходные материалы (% от цены)", percent: 0.02 },
          { type: "material", name: "Балка Титановая", unit: "шт", qty: 1, unitCost: 16000 },
          { type: "work", name: "Обработка Балка Титан 6 Опоры", qty: 1, unitCost: 2000 },
          { type: "work", name: "Проектировка Балка Титан 6 Опоры", qty: 1, unitCost: 4500 }
        ]
      }
    ]
  },
  "Навигационные шаблоны": {
    products: [
      {
        id: "shablon_1_imp",
        name: "Шаблон на 1 имплант",
        price: 8800,
        marketingRate: 0.04,
        insuranceRate: 0.30,
        fixedRate: 0.12,
        useMaterialPercent: true,
        materialPercent: 0.03,
        costRows: [
          { type: "material_percent", name: "Общие расходные материалы (% от цены)", percent: 0.03 },
          { type: "material", name: "Фотополимерная смола для элайнеров", unit: "мл", qty: 0.03, unitCost: 1800 },
          { type: "material", name: "Фотополимерная смола для ХШ", unit: "мл", qty: 0.05, unitCost: 18000 },
          { type: "material", name: "Установка втулки", unit: "шт", qty: 1, unitCost: 50 },
          { type: "work", name: "Обработка ХШ", qty: 1, unitCost: 400 },
          { type: "work", name: "Проектировка ХШ 1 имп", qty: 1, unitCost: 1200 }
        ]
      },
      {
        id: "shablon_2_imp",
        name: "Шаблон на 2 импланта",
        price: 9800,
        marketingRate: 0.04,
        insuranceRate: 0.30,
        fixedRate: 0.12,
        useMaterialPercent: true,
        materialPercent: 0.03,
        costRows: [
          { type: "material_percent", name: "Общие расходные материалы (% от цены)", percent: 0.03 },
          { type: "material", name: "Фотополимерная смола для элайнеров", unit: "мл", qty: 0.03, unitCost: 1800 },
          { type: "material", name: "Фотополимерная смола для ХШ", unit: "мл", qty: 0.05, unitCost: 18000 },
          { type: "material", name: "Установка втулки", unit: "шт", qty: 2, unitCost: 50 },
          { type: "work", name: "Обработка ХШ", qty: 1, unitCost: 500 },
          { type: "work", name: "Проектировка ХШ 2 имп", qty: 1, unitCost: 1600 }
        ]
      }
    ]
  },
  "ЧСП / ПСП Акрил и Акри-фри": {
    products: [
      {
        id: "chsp_acryl",
        name: "ЧСП Акрил",
        price: 16000,
        marketingRate: 0.04,
        insuranceRate: 0.30,
        fixedRate: 0.10,
        useMaterialPercent: true,
        materialPercent: 0.03,
        costRows: [
          { type: "material_percent", name: "Общие расходные материалы (% от цены)", percent: 0.03 },
          { type: "material", name: "Зубы ямагачи 1 плашка", unit: "шт", qty: 1, unitCost: 550 },
          { type: "material", name: "Пластмасса кондюлор ред Мономер", unit: "гр", qty: 0.03, unitCost: 7300 },
          { type: "material", name: "Пластмасса кондюлор ред Полимер", unit: "гр", qty: 0.03, unitCost: 8300 },
          { type: "material", name: "Воск", unit: "гр", qty: 0.02, unitCost: 750 },
          { type: "material", name: "Десна (Durasill)", unit: "гр", qty: 0.07, unitCost: 3400 },
          { type: "material", name: "Силикон База", unit: "гр", qty: 0.01, unitCost: 4400 },
          { type: "material", name: "Гипс (Синий + Желтый)", unit: "гр", qty: 0.03, unitCost: 6000 },
          { type: "material", name: "Прочие расходы", unit: "", qty: 1, unitCost: 150 },
          { type: "work", name: "Физ Работа ЧСП Акрил", qty: 1, unitCost: 3000 }
        ]
      },
      {
        id: "psp_acryl",
        name: "ПСП Акрил",
        price: 18000,
        marketingRate: 0.04,
        insuranceRate: 0.30,
        fixedRate: 0.10,
        useMaterialPercent: true,
        materialPercent: 0.03,
        costRows: [
          { type: "material_percent", name: "Общие расходные материалы (% от цены)", percent: 0.03 },
          { type: "material", name: "Зубы ямагачи 1 плашка", unit: "шт", qty: 1, unitCost: 550 },
          { type: "material", name: "Пластмасса кондюлор ред Мономер", unit: "гр", qty: 0.03, unitCost: 7300 },
          { type: "material", name: "Пластмасса кондюлор ред Полимер", unit: "гр", qty: 0.03, unitCost: 8300 },
          { type: "material", name: "Воск", unit: "гр", qty: 0.02, unitCost: 750 },
          { type: "material", name: "Десна (Durasill)", unit: "гр", qty: 0.07, unitCost: 3400 },
          { type: "material", name: "Силикон База", unit: "гр", qty: 0.01, unitCost: 4400 },
          { type: "material", name: "Гипс (Синий + Желтый)", unit: "гр", qty: 0.03, unitCost: 6000 },
          { type: "material", name: "Прочие расходы", unit: "", qty: 1, unitCost: 150 },
          { type: "work", name: "Физ Работа ПСП Акрил", qty: 1, unitCost: 3500 }
        ]
      }
    ]
  }
};

// Функция для преобразования демо-данных в формат PriceCalculator
export function convertDemoDataToPriceCalculator() {
  const categories: any[] = [];
  
  Object.entries(PRICE_CALCULATOR_DEMO_DATA).forEach(([categoryName, categoryData]) => {
    const products = categoryData.products.map(product => ({
      id: product.id,
      name: product.name,
      basePrice: product.price,
      customRates: true,
      marketingPercent: product.marketingRate * 100,
      insurancePercent: product.insuranceRate * 100,
      fixedCostPercent: product.fixedRate * 100,
      materialPercent: product.useMaterialPercent ? product.materialPercent * 100 : undefined,
      costRows: product.costRows.map((row, index) => ({
        id: `${product.id}_row_${index}`,
        type: row.type,
        name: row.name,
        percent: row.percent ? row.percent * 100 : undefined,
        unit: row.unit,
        qty: row.qty,
        unitCost: row.unitCost
      }))
    }));
    
    categories.push({
      id: categoryName.replace(/\s+/g, '_').toLowerCase(),
      name: categoryName,
      products,
      collapsed: false
    });
  });
  
  return categories;
}

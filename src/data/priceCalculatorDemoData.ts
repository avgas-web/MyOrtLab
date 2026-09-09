// Пустые данные для калькулятора прайса
// Все числовые значения установлены в 0 для заполнения администратором

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
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "modeling_virtual",
        name: "Моделировка виртуальная (1 ед) под ХШ",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "modeling_esthetic",
        name: "Функционально-эстетическая моделировка (1 ед)",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "modeling_total",
        name: "Комплексная (тотальная) моделировка",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "adapt_total",
        name: "Адаптация тотальной моделировки к рабочим сканам",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "complex_sequential",
        name: "Комплексная моделировка (Последовательная дезокклюзия)",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "model_analysis",
        name: "Анализ модели",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "virtual_planning",
        name: "Виртуальное планирование",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "model_anatomic",
        name: "Модель анатомическая",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "model_diagnostic",
        name: "Модель диагностическая",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "model_working",
        name: "Модель рабочая",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "model_3d_print",
        name: "Модель для 3D печати",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      }
    ]
  },
  "Ортопедия": {
    products: [
      {
        id: "zro2_crown_full",
        name: "ZrO2 коронка полная анатомия",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "zro2_implant_full",
        name: "ZrO2 на имплантате полная анатомия (без тит. основания)",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "zro2_crown_ceramic",
        name: "ZrO2 коронка с нанесением керамики",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "vinir_emax_full",
        name: "Винир / Накладка E.max полная анатомия",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "temp_crown_pmma",
        name: "Изготовление временных коронок PMMA на культях (1 ед.)",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "ind_abutment_ti",
        name: "Индивидуальный абатмент Ti",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "crown_metal_ceramic",
        name: "Коронка металлокерамическая",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "bridge_metal_ceramic",
        name: "Мостовидный протез металлокерамический",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "vinir_ceramic",
        name: "Винир керамический",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "abutment_individual",
        name: "Абатмент индивидуальный",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "crown_full_ceramic",
        name: "Коронка цельнокерамическая",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "vinir_full_ceramic",
        name: "Винир цельнокерамический",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "crown_zirconium",
        name: "Коронка циркониевая",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "bridge_full_ceramic",
        name: "Мостовидный протез цельнокерамический",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      }
    ]
  },
  "Сплинты и накладки": {
    products: [
      {
        id: "splint_with_diag",
        name: "Сплинт с диагностикой",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "splint_without_diag",
        name: "Изготовление сплинта без диагностики",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "splint_no_frez",
        name: "Изготовление сплинта без фрезеровки",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "nakladki_4_diag",
        name: "Изготовление накладок с диагностикой (4 шт.)",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "splint_relaxation",
        name: "Сплинт релаксационный",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "splint_drop",
        name: "Сплинт каплевидный",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "splint_occlusal",
        name: "Сплинт окклюзионный",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "splint_bruxism",
        name: "Сплинт для бруксизма",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "nakladka_upper",
        name: "Накладка на верхнюю челюсть",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "nakladka_lower",
        name: "Накладка на нижнюю челюсть",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "nakladka_functional",
        name: "Накладка функциональная",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "nakladka_joint",
        name: "Накладка суставная",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      }
    ]
  },
  "Ортодонтические аппараты": {
    products: [
      {
        id: "derichsweiler",
        name: "Аппарат Дерихсвайлера",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "marco_rossa",
        name: "Марко-Росса",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "knopka_nansa",
        name: "Кнопка Нанса",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "apparat_gerbsta",
        name: "Аппарат Гербста",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "capa_retention",
        name: "Капа ретенционная",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "aligners_pair",
        name: "Алайнеры (1 пара)",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      }
    ]
  },
  "Элайнеры": {
    products: [
      {
        id: "elainer_gnaton",
        name: "Элайнер Гнатон",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      }
    ]
  },
  "Условно-съемные протезы": {
    products: [
      {
        id: "all4_acryl_cocr",
        name: "All on 4 акрил, CoCr армирование (Литая Балка)",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "all6_acryl_cocr",
        name: "All on 6 акрил, CoCr армирование (Литая Балка)",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "perebaz_all4_6",
        name: "Перебазировка АО4, АО6, Акрил",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      }
    ]
  },
  "Балочные конструкции": {
    products: [
      {
        id: "balka_ti_4",
        name: "Балка титановая 4 опоры",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "balka_ti_6",
        name: "Балка титановая 6 опор",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "crown_full_cast",
        name: "Коронка цельнолитая",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "splint_bugel",
        name: "Шинирующий бюгель",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "bugel_prot",
        name: "Балочный протез",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "bugel_clammers",
        name: "Балочный протез с кламмерами",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "bugel_telescopic",
        name: "Балочный протез с телескопическими коронками",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "removable_locks",
        name: "Несъемный протез на замках",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "crown_ceramic_coating",
        name: "Коронка с керамической облицовкой",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "bridge_ceramic_coating",
        name: "Мостовидный протез с керамической облицовкой",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      }
    ]
  },
  "Навигационные шаблоны": {
    products: [
      {
        id: "shablon_1_imp",
        name: "Шаблон на 1 имплант",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "shablon_2_imp",
        name: "Шаблон на 2 импланта",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "surgical_template",
        name: "Хирургический шаблон",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "bone_graft",
        name: "Графт костный",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "osteoplasty",
        name: "Остеопластика",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "gingivoplasty",
        name: "Гингивопластика",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      }
    ]
  },
  "ЧСП / ПСП Акрил и Акри-фри": {
    products: [
      {
        id: "chsp_acryl",
        name: "ЧСП Акрил",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "psp_acryl",
        name: "ПСП Акрил",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      }
    ]
  },
  "Временные конструкции": {
    products: [
      {
        id: "temp_crown",
        name: "Временная коронка",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "temp_bridge",
        name: "Временный мост",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "temp_shtift",
        name: "Временный штифтовой вкладыш",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "temp_core",
        name: "Временный культевой вкладыш",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      }
    ]
  },
  "Имплантология": {
    products: [
      {
        id: "crown_implant",
        name: "Коронка на имплант",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "abutment_interface",
        name: "Абатмент с интерфейсом",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "crown_abutment",
        name: "Коронка на абатмент",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "prosthesis_implants",
        name: "Протез на имплантах",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      }
    ]
  },
  "Ремонтные работы": {
    products: [
      {
        id: "repair_prosthesis",
        name: "Ремонт протеза",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "rebase_prosthesis",
        name: "Перебазировка протеза",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "replace_tooth",
        name: "Замена искусственного зуба",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "polish_prosthesis",
        name: "Полировка протеза",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "replace_clammer",
        name: "Замена кламмера",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
      },
      {
        id: "replace_lock",
        name: "Замена замка",
        price: 0,
        marketingRate: 0,
        insuranceRate: 0,
        fixedRate: 0,
        useMaterialPercent: false,
        materialPercent: 0,
        costRows: []
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

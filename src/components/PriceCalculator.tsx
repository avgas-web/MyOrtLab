import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { convertDemoDataToPriceCalculator } from '../data/priceCalculatorDemoData';

interface CostRow {
  id: string;
  type: 'material_percent' | 'material' | 'work';
  name: string;
  percent?: number;
  unit?: string;
  qty?: number;
  unitCost?: number;
}

interface Product {
  id: string;
  name: string;
  basePrice: number;
  customRates: boolean;
  marketingPercent: number;
  insurancePercent: number;
  fixedCostPercent: number;
  materialPercent?: number;
  costRows: CostRow[];
}

interface Category {
  id: string;
  name: string;
  products: Product[];
  collapsed?: boolean;
}

interface GlobalParams {
  ndflRate: number;
  insuranceRate: number;
  marketingRate: number;
  fixedCostRate: number;
  targetProfitability: number;
}

interface PriceCalculatorProps {
  data: any;
  updateData: (fn: (d: any) => any) => void;
  toast: (msg: string, type?: string) => void;
}

export default function PriceCalculator({ data, updateData, toast }: PriceCalculatorProps) {
  // Инициализация с демо-данными при первой загрузке
  const [categories, setCategories] = useState<Category[]>(() => {
    if (data.priceCategories && data.priceCategories.length > 0) {
      return data.priceCategories;
    }
    // Загружаем демо-данные из НК1.html
    return convertDemoDataToPriceCalculator();
  });
  
  const [globalParams, setGlobalParams] = useState<GlobalParams>(data.globalPriceParams || {
    ndflRate: 13,
    insuranceRate: 30.2,
    marketingRate: 5,
    fixedCostRate: 10,
    targetProfitability: 20
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  useEffect(() => {
    // Сохранение в localStorage (в реальном приложении - API запрос)
    updateData((d: any) => ({
      ...d,
      priceCategories: categories,
      globalPriceParams: globalParams
    }));
  }, [categories, globalParams]);

  // Расчёт показателей для продукта
  const calculateProductMetrics = (product: Product) => {
    const price = product.basePrice;
    
    // Материалы
    let materialsTotal = 0;
    product.costRows.forEach(row => {
      if (row.type === 'material_percent') {
        materialsTotal += price * (row.percent || 0) / 100;
      } else if (row.type === 'material') {
        materialsTotal += (row.qty || 0) * (row.unitCost || 0);
      }
    });

    // Маркетинг
    const marketingPercent = product.customRates ? product.marketingPercent : globalParams.marketingRate;
    const marketing = price * marketingPercent / 100;

    // ЗП техника
    let workTotal = 0;
    product.costRows.forEach(row => {
      if (row.type === 'work') {
        workTotal += (row.qty || 0) * (row.unitCost || 0);
      }
    });

    // ЗП с НДФЛ
    const ndflRate = globalParams.ndflRate;
    const workWithNdfl = workTotal / (1 - ndflRate / 100);

    // ЗП со взносами
    const insurancePercent = product.customRates ? product.insurancePercent : globalParams.insuranceRate;
    const workWithInsurance = workWithNdfl + workWithNdfl * insurancePercent / 100;

    // Итого переменные расходы
    const variableCosts = materialsTotal + marketing + workWithInsurance;

    // Маржинальность
    const margin = price - variableCosts;
    const marginPercent = price > 0 ? (margin / price) * 100 : 0;

    // Постоянные расходы
    const fixedCostPercent = product.customRates ? product.fixedCostPercent : globalParams.fixedCostRate;
    const fixedCosts = price * fixedCostPercent / 100;

    // Чистая прибыль
    const netProfit = price - variableCosts - fixedCosts;
    const profitability = price > 0 ? (netProfit / price) * 100 : 0;

    // Целевая цена
    const targetPrice = (variableCosts + fixedCosts) / (1 - globalParams.targetProfitability / 100);
    const priceDelta = price - targetPrice;

    return {
      materialsTotal,
      marketing,
      workTotal,
      workWithNdfl,
      workWithInsurance,
      variableCosts,
      margin,
      marginPercent,
      fixedCosts,
      netProfit,
      profitability,
      targetPrice,
      priceDelta
    };
  };

  // Добавление категории
  const addCategory = () => {
    const name = prompt('Название категории:');
    if (name) {
      setCategories([...categories, {
        id: Date.now().toString(),
        name,
        products: [],
        collapsed: false
      }]);
      toast('Категория добавлена');
    }
  };

  // Удаление категории
  const deleteCategory = (categoryId: string) => {
    if (confirm('Удалить категорию и все её продукты?')) {
      setCategories(categories.filter(c => c.id !== categoryId));
      toast('Категория удалена');
    }
  };

  // Добавление продукта
  const addProduct = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setEditingProduct({
      id: Date.now().toString(),
      name: '',
      basePrice: 0,
      customRates: false,
      marketingPercent: globalParams.marketingRate,
      insurancePercent: globalParams.insuranceRate,
      fixedCostPercent: globalParams.fixedCostRate,
      costRows: []
    });
    setShowProductModal(true);
  };

  // Сохранение продукта
  const saveProduct = () => {
    if (!editingProduct || !editingProduct.name) {
      toast('Заполните название продукта', 'error');
      return;
    }

    setCategories(categories.map(cat => {
      if (cat.id === selectedCategoryId) {
        const existingIndex = cat.products.findIndex(p => p.id === editingProduct.id);
        if (existingIndex >= 0) {
          // Редактирование
          const newProducts = [...cat.products];
          newProducts[existingIndex] = editingProduct;
          return { ...cat, products: newProducts };
        } else {
          // Добавление
          return { ...cat, products: [...cat.products, editingProduct] };
        }
      }
      return cat;
    }));

    setShowProductModal(false);
    setEditingProduct(null);
    toast('Продукт сохранён');
  };

  // Удаление продукта
  const deleteProduct = (categoryId: string, productId: string) => {
    if (confirm('Удалить продукт?')) {
      setCategories(categories.map(cat => {
        if (cat.id === categoryId) {
          return { ...cat, products: cat.products.filter(p => p.id !== productId) };
        }
        return cat;
      }));
      toast('Продукт удалён');
    }
  };

  // Редактирование продукта
  const editProduct = (categoryId: string, product: Product) => {
    setSelectedCategoryId(categoryId);
    setEditingProduct({ ...product });
    setShowProductModal(true);
  };

  // Добавление строки затрат
  const addCostRow = (type: 'material_percent' | 'material' | 'work') => {
    if (!editingProduct) return;
    
    const newRow: CostRow = {
      id: Date.now().toString(),
      type,
      name: type === 'material_percent' ? 'Процент материалов' : type === 'material' ? 'Материал' : 'Работа',
      percent: type === 'material_percent' ? 10 : undefined,
      unit: type === 'material' ? 'шт' : undefined,
      qty: type !== 'material_percent' ? 1 : undefined,
      unitCost: type !== 'material_percent' ? 0 : undefined
    };

    setEditingProduct({
      ...editingProduct,
      costRows: [...editingProduct.costRows, newRow]
    });
  };

  // Удаление строки затрат
  const deleteCostRow = (rowId: string) => {
    if (!editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      costRows: editingProduct.costRows.filter(r => r.id !== rowId)
    });
  };

  // Обновление строки затрат
  const updateCostRow = (rowId: string, field: string, value: any) => {
    if (!editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      costRows: editingProduct.costRows.map(r => 
        r.id === rowId ? { ...r, [field]: value } : r
      )
    });
  };

  // Экспорт в JSON
  const exportToJSON = () => {
    const data = { categories, globalParams };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'price_calculator_data.json';
    a.click();
    URL.revokeObjectURL(url);
    toast('Данные экспортированы в JSON');
  };

  // Импорт из JSON
  const importFromJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.categories && data.globalParams) {
          setCategories(data.categories);
          setGlobalParams(data.globalParams);
          toast('Данные импортированы');
        } else {
          toast('Неверный формат файла', 'error');
        }
      } catch (error) {
        toast('Ошибка чтения файла', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Экспорт в Excel (полная таблица)
  const exportToExcel = () => {
    const rows: any[] = [];
    
    categories.forEach(category => {
      rows.push(['КАТЕГОРИЯ:', category.name, '', '', '', '', '', '', '', '', '', '', '', '']);
      rows.push(['Название', 'Цена', 'Материалы', 'Маркетинг', 'ЗП техника', 'ЗП с НДФЛ', 'ЗП со взносами', 'Переменные', 'Маржа', 'Маржа %', 'Постоянные', 'Чистая прибыль', 'Рентабельность %', 'Целевая цена', 'Δ цены']);
      
      category.products.forEach(product => {
        const metrics = calculateProductMetrics(product);
        rows.push([
          product.name,
          product.basePrice,
          metrics.materialsTotal,
          metrics.marketing,
          metrics.workTotal,
          metrics.workWithNdfl,
          metrics.workWithInsurance,
          metrics.variableCosts,
          metrics.margin,
          metrics.marginPercent.toFixed(2),
          metrics.fixedCosts,
          metrics.netProfit,
          metrics.profitability.toFixed(2),
          metrics.targetPrice,
          metrics.priceDelta
        ]);
      });
      
      rows.push([]); // Пустая строка между категориями
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Прайс');
    XLSX.writeFile(wb, 'price_calculator_full.xlsx');
    toast('Экспортировано в Excel');
  };

  // Экспорт чистого прайса
  const exportCleanPrice = () => {
    const rows: any[] = [['Категория', 'Услуга', 'Цена']];
    
    categories.forEach(category => {
      category.products.forEach(product => {
        rows.push([category.name, product.name, product.basePrice]);
      });
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Прайс');
    XLSX.writeFile(wb, 'price_list.xlsx');
    toast('Прайс экспортирован');
  };

  // Переключение сворачивания категории
  const toggleCategory = (categoryId: string) => {
    setCategories(categories.map(cat => 
      cat.id === categoryId ? { ...cat, collapsed: !cat.collapsed } : cat
    ));
  };

  return (
    <div className="space-y-6">
      {/* Заголовок и кнопки */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">📊 Калькулятор прайса</h2>
          <div className="flex gap-2">
            <button onClick={addCategory} className="btn-primary">+ Категория</button>
            <button onClick={exportToJSON} className="btn-outline">📥 JSON</button>
            <label className="btn-outline cursor-pointer">
              📤 JSON
              <input type="file" accept=".json" onChange={importFromJSON} className="hidden" />
            </label>
            <button onClick={exportToExcel} className="btn-outline">📊 Excel</button>
            <button onClick={exportCleanPrice} className="btn-outline">📋 Прайс</button>
          </div>
        </div>

        {/* Глобальные параметры */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="font-semibold mb-3">🌍 Глобальные параметры</h3>
          <div className="grid grid-cols-5 gap-4">
            <div>
              <label className="text-xs text-gray-600">НДФЛ (%)</label>
              <input
                type="number"
                value={globalParams.ndflRate}
                onChange={e => setGlobalParams({ ...globalParams, ndflRate: Number(e.target.value) })}
                className="input-field"
                step="0.1"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Страховые (%)</label>
              <input
                type="number"
                value={globalParams.insuranceRate}
                onChange={e => setGlobalParams({ ...globalParams, insuranceRate: Number(e.target.value) })}
                className="input-field"
                step="0.1"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Маркетинг (%)</label>
              <input
                type="number"
                value={globalParams.marketingRate}
                onChange={e => setGlobalParams({ ...globalParams, marketingRate: Number(e.target.value) })}
                className="input-field"
                step="0.1"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Постоянные (%)</label>
              <input
                type="number"
                value={globalParams.fixedCostRate}
                onChange={e => setGlobalParams({ ...globalParams, fixedCostRate: Number(e.target.value) })}
                className="input-field"
                step="0.1"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Целевая рент. (%)</label>
              <input
                type="number"
                value={globalParams.targetProfitability}
                onChange={e => setGlobalParams({ ...globalParams, targetProfitability: Number(e.target.value) })}
                className="input-field"
                step="0.1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Категории и продукты */}
      {categories.map(category => (
        <div key={category.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Заголовок категории */}
          <div 
            className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white p-4 flex justify-between items-center cursor-pointer"
            onClick={() => toggleCategory(category.id)}
          >
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span>{category.collapsed ? '▶' : '▼'}</span>
              {category.name}
              <span className="text-sm opacity-80">({category.products.length} продуктов)</span>
            </h3>
            <div className="flex gap-2" onClick={e => e.stopPropagation()}>
              <button onClick={() => addProduct(category.id)} className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm">
                + Продукт
              </button>
              <button onClick={() => deleteCategory(category.id)} className="bg-red-500/80 hover:bg-red-500 px-3 py-1 rounded text-sm">
                🗑️
              </button>
            </div>
          </div>

          {/* Таблица продуктов */}
          {!category.collapsed && category.products.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">Название</th>
                    <th className="px-3 py-2 text-right">Цена</th>
                    <th className="px-3 py-2 text-right">Материалы</th>
                    <th className="px-3 py-2 text-right">Маркетинг</th>
                    <th className="px-3 py-2 text-right">ЗП техника</th>
                    <th className="px-3 py-2 text-right">ЗП с НДФЛ</th>
                    <th className="px-3 py-2 text-right">ЗП со взносами</th>
                    <th className="px-3 py-2 text-right">Переменные</th>
                    <th className="px-3 py-2 text-right">Маржа</th>
                    <th className="px-3 py-2 text-right">Маржа %</th>
                    <th className="px-3 py-2 text-right">Постоянные</th>
                    <th className="px-3 py-2 text-right">Чистая прибыль</th>
                    <th className="px-3 py-2 text-right">Рент. %</th>
                    <th className="px-3 py-2 text-right">Целевая цена</th>
                    <th className="px-3 py-2 text-right">Δ цены</th>
                    <th className="px-3 py-2 text-center">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {category.products.map(product => {
                    const metrics = calculateProductMetrics(product);
                    return (
                      <tr key={product.id} className="border-t hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium">{product.name}</td>
                        <td className="px-3 py-2 text-right font-semibold">{product.basePrice.toLocaleString()} ₽</td>
                        <td className="px-3 py-2 text-right">{metrics.materialsTotal.toLocaleString()} ₽</td>
                        <td className="px-3 py-2 text-right">{metrics.marketing.toLocaleString()} ₽</td>
                        <td className="px-3 py-2 text-right">{metrics.workTotal.toLocaleString()} ₽</td>
                        <td className="px-3 py-2 text-right">{metrics.workWithNdfl.toLocaleString()} ₽</td>
                        <td className="px-3 py-2 text-right">{metrics.workWithInsurance.toLocaleString()} ₽</td>
                        <td className="px-3 py-2 text-right font-semibold">{metrics.variableCosts.toLocaleString()} ₽</td>
                        <td className="px-3 py-2 text-right text-green-600">{metrics.margin.toLocaleString()} ₽</td>
                        <td className="px-3 py-2 text-right text-green-600">{metrics.marginPercent.toFixed(1)}%</td>
                        <td className="px-3 py-2 text-right">{metrics.fixedCosts.toLocaleString()} ₽</td>
                        <td className="px-3 py-2 text-right font-semibold text-blue-600">{metrics.netProfit.toLocaleString()} ₽</td>
                        <td className="px-3 py-2 text-right font-semibold text-blue-600">{metrics.profitability.toFixed(1)}%</td>
                        <td className="px-3 py-2 text-right">{metrics.targetPrice.toLocaleString()} ₽</td>
                        <td className={`px-3 py-2 text-right font-semibold ${metrics.priceDelta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {metrics.priceDelta >= 0 ? '+' : ''}{metrics.priceDelta.toLocaleString()} ₽
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button onClick={() => editProduct(category.id, product)} className="text-cyan-600 hover:text-cyan-800 mr-2">✏️</button>
                          <button onClick={() => deleteProduct(category.id, product.id)} className="text-red-600 hover:text-red-800">🗑️</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!category.collapsed && category.products.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              Нет продуктов. Нажмите "+ Продукт" для добавления.
            </div>
          )}
        </div>
      ))}

      {categories.length === 0 && (
        <div className="bg-white rounded-lg p-12 text-center text-gray-400">
          <div className="text-6xl mb-4">📊</div>
          <div className="text-lg mb-2">Нет категорий</div>
          <div>Нажмите "+ Категория" для создания первой категории</div>
        </div>
      )}

      {/* Модальное окно продукта */}
      {showProductModal && editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">
                  {categories.find(c => c.id === selectedCategoryId)?.products.find(p => p.id === editingProduct.id) 
                    ? 'Редактировать продукт' 
                    : 'Добавить продукт'}
                </h3>
                <button onClick={() => setShowProductModal(false)} className="text-2xl text-gray-400 hover:text-gray-600">×</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Название продукта *</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="input-field"
                    placeholder="Например: Коронка металлокерамическая"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">Базовая цена (руб.) *</label>
                    <input
                      type="number"
                      value={editingProduct.basePrice}
                      onChange={e => setEditingProduct({ ...editingProduct, basePrice: Number(e.target.value) })}
                      className="input-field"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <input
                        type="checkbox"
                        checked={editingProduct.customRates}
                        onChange={e => setEditingProduct({ ...editingProduct, customRates: e.target.checked })}
                      />
                      Индивидуальные ставки
                    </label>
                  </div>
                </div>

                {editingProduct.customRates && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-3">Индивидуальные ставки</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs text-gray-600">Маркетинг (%)</label>
                        <input
                          type="number"
                          value={editingProduct.marketingPercent}
                          onChange={e => setEditingProduct({ ...editingProduct, marketingPercent: Number(e.target.value) })}
                          className="input-field"
                          step="0.1"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Страховые (%)</label>
                        <input
                          type="number"
                          value={editingProduct.insurancePercent}
                          onChange={e => setEditingProduct({ ...editingProduct, insurancePercent: Number(e.target.value) })}
                          className="input-field"
                          step="0.1"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Постоянные (%)</label>
                        <input
                          type="number"
                          value={editingProduct.fixedCostPercent}
                          onChange={e => setEditingProduct({ ...editingProduct, fixedCostPercent: Number(e.target.value) })}
                          className="input-field"
                          step="0.1"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Строки затрат */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">Строки затрат</h4>
                    <div className="flex gap-2">
                      <button onClick={() => addCostRow('material_percent')} className="btn-outline text-xs">+ % материалов</button>
                      <button onClick={() => addCostRow('material')} className="btn-outline text-xs">+ Материал</button>
                      <button onClick={() => addCostRow('work')} className="btn-outline text-xs">+ Работа</button>
                    </div>
                  </div>

                  {editingProduct.costRows.length > 0 && (
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-2 py-1 text-left">Тип</th>
                          <th className="px-2 py-1 text-left">Название</th>
                          <th className="px-2 py-1 text-right">%</th>
                          <th className="px-2 py-1 text-left">Ед.</th>
                          <th className="px-2 py-1 text-right">Кол-во</th>
                          <th className="px-2 py-1 text-right">Цена/ед.</th>
                          <th className="px-2 py-1 text-right">Сумма</th>
                          <th className="px-2 py-1"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {editingProduct.costRows.map(row => (
                          <tr key={row.id} className="border-t">
                            <td className="px-2 py-1">
                              {row.type === 'material_percent' ? '% материалов' : row.type === 'material' ? 'Материал' : 'Работа'}
                            </td>
                            <td className="px-2 py-1">
                              <input
                                type="text"
                                value={row.name}
                                onChange={e => updateCostRow(row.id, 'name', e.target.value)}
                                className="input-field text-xs"
                              />
                            </td>
                            <td className="px-2 py-1">
                              {row.type === 'material_percent' ? (
                                <input
                                  type="number"
                                  value={row.percent || 0}
                                  onChange={e => updateCostRow(row.id, 'percent', Number(e.target.value))}
                                  className="input-field text-xs text-right"
                                  step="0.1"
                                />
                              ) : '-'}
                            </td>
                            <td className="px-2 py-1">
                              {row.type !== 'material_percent' ? (
                                <input
                                  type="text"
                                  value={row.unit || ''}
                                  onChange={e => updateCostRow(row.id, 'unit', e.target.value)}
                                  className="input-field text-xs"
                                />
                              ) : '-'}
                            </td>
                            <td className="px-2 py-1">
                              {row.type !== 'material_percent' ? (
                                <input
                                  type="number"
                                  value={row.qty || 0}
                                  onChange={e => updateCostRow(row.id, 'qty', Number(e.target.value))}
                                  className="input-field text-xs text-right"
                                  step="0.01"
                                />
                              ) : '-'}
                            </td>
                            <td className="px-2 py-1">
                              {row.type !== 'material_percent' ? (
                                <input
                                  type="number"
                                  value={row.unitCost || 0}
                                  onChange={e => updateCostRow(row.id, 'unitCost', Number(e.target.value))}
                                  className="input-field text-xs text-right"
                                />
                              ) : '-'}
                            </td>
                            <td className="px-2 py-1 text-right font-semibold">
                              {row.type === 'material_percent' 
                                ? (editingProduct.basePrice * (row.percent || 0) / 100).toLocaleString()
                                : ((row.qty || 0) * (row.unitCost || 0)).toLocaleString()
                              } ₽
                            </td>
                            <td className="px-2 py-1 text-center">
                              <button onClick={() => deleteCostRow(row.id)} className="text-red-600 hover:text-red-800">🗑️</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t">
                  <button onClick={() => setShowProductModal(false)} className="btn-outline">Отмена</button>
                  <button onClick={saveProduct} className="btn-primary">Сохранить</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

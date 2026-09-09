import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { convertDemoDataToPriceCalculator } from '../data/priceCalculatorDemoData';

interface Product {
  id: string;
  name: string;
  basePrice: number;
}

interface Category {
  id: string;
  name: string;
  products: Product[];
  collapsed?: boolean;
}

interface PriceCalculatorProps {
  data: any;
  updateData: (fn: (d: any) => any) => void;
  toast: (msg: string, type?: string) => void;
}

export default function PriceCalculator({ data, updateData, toast }: PriceCalculatorProps) {
  const [categories, setCategories] = useState<Category[]>(() => {
    if (data.priceCategories && data.priceCategories.length > 0) {
      return data.priceCategories;
    }
    return convertDemoDataToPriceCalculator();
  });
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  useEffect(() => {
    updateData((d: any) => ({
      ...d,
      priceCategories: categories
    }));
  }, [categories]);

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
      basePrice: 0
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
          const newProducts = [...cat.products];
          newProducts[existingIndex] = editingProduct;
          return { ...cat, products: newProducts };
        } else {
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

  // Экспорт в JSON
  const exportToJSON = () => {
    const exportData = { categories };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
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
        const importedData = JSON.parse(e.target?.result as string);
        if (importedData.categories) {
          setCategories(importedData.categories);
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

  // Экспорт в Excel
  const exportToExcel = () => {
    const rows: any[] = [];
    
    categories.forEach(category => {
      rows.push(['КАТЕГОРИЯ:', category.name, '']);
      rows.push(['Название', 'Цена (руб.)', '']);
      
      category.products.forEach(product => {
        rows.push([product.name, product.basePrice, '']);
      });
      
      rows.push([]);
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Прайс');
    XLSX.writeFile(wb, 'price_list.xlsx');
    toast('Экспортировано в Excel');
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
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>Инструкция:</strong> Заполните цены для всех услуг. Все значения по умолчанию установлены в 0.
          </p>
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
                    <th className="px-4 py-3 text-left font-semibold">Название</th>
                    <th className="px-4 py-3 text-right font-semibold">Цена (руб.)</th>
                    <th className="px-4 py-3 text-center font-semibold">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {category.products.map(product => (
                    <tr key={product.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{product.name}</td>
                      <td className="px-4 py-3 text-right font-semibold text-lg">
                        {product.basePrice.toLocaleString()} ₽
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => editProduct(category.id, product)} className="text-cyan-600 hover:text-cyan-800 mr-3">✏️</button>
                        <button onClick={() => deleteProduct(category.id, product.id)} className="text-red-600 hover:text-red-800">🗑️</button>
                      </td>
                    </tr>
                  ))}
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
          <div className="bg-white rounded-lg max-w-md w-full">
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

                <div>
                  <label className="text-sm font-medium block mb-1">Цена (руб.) *</label>
                  <input
                    type="number"
                    value={editingProduct.basePrice}
                    onChange={e => setEditingProduct({ ...editingProduct, basePrice: Number(e.target.value) })}
                    className="input-field"
                    min="0"
                    placeholder="0"
                  />
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

# 🔧 ИСПРАВЛЕНИЕ ОШИБКИ forEach

## ❌ Ошибка

```
TypeError: Cannot read properties of undefined (reading 'forEach')
at g (index-BJ1RZr1q.js:134:10272)
```

## ✅ Причина

В функции `calculateProductMetrics` в компоненте `PriceCalculator.tsx` вызывается `product.costRows.forEach()`, но если `costRows` равен `undefined`, это вызывает ошибку.

Проблема возникает, когда:
1. Старые данные в localStorage не имеют поля `costRows`
2. Продукты были созданы без инициализации `costRows`

## ✅ Решение

### 1. Исправлена функция `calculateProductMetrics`

**Было:**
```typescript
product.costRows.forEach(row => {
  // ...
});
```

**Стало:**
```typescript
(product.costRows || []).forEach(row => {
  // ...
});
```

Теперь если `costRows` равен `undefined`, используется пустой массив.

### 2. Добавлена миграция данных в `loadData`

В файле `src/App.tsx` добавлена обработка данных для калькулятора прайса:

```typescript
// Миграция для калькулятора прайса
if (data.priceCategories) {
  data.priceCategories = data.priceCategories.map((cat: any) => ({
    ...cat,
    products: (cat.products || []).map((p: any) => ({
      ...p,
      costRows: p.costRows || [],
      customRates: p.customRates || false,
      marketingPercent: p.marketingPercent || 0,
      insurancePercent: p.insurancePercent || 0,
      fixedCostPercent: p.fixedCostPercent || 0,
    }))
  }));
}
```

Это гарантирует, что все продукты имеют необходимые поля при загрузке из localStorage.

## 📁 Изменённые файлы

1. **src/components/PriceCalculator.tsx**
   - Исправлена функция `calculateProductMetrics`
   - Добавлена проверка на существование `costRows`

2. **src/App.tsx**
   - Добавлена миграция данных в функции `loadData`
   - Гарантирована инициализация всех полей продуктов

## 🚀 Что делать пользователю

### Вариант 1: Очистить localStorage (рекомендуется)

Откройте консоль браузера (F12) и выполните:

```javascript
localStorage.clear();
location.reload();
```

Это очистит старые данные и загрузит новые с правильной структурой.

### Вариант 2: Просто перезагрузить страницу

После деплоя новой версии просто перезагрузите страницу (F5 или Ctrl+R).

Миграция данных автоматически добавит недостающие поля.

## ✅ Проверка

После исправления:
- ✅ Проект успешно собирается
- ✅ Нет ошибок в консоли браузера
- ✅ Калькулятор прайса работает корректно
- ✅ Все расчёты выполняются правильно

## 📊 Статистика сборки

```
✓ 38 modules transformed
✓ built in 5.26s

dist/index.html                     3.74 kB │ gzip: 1.68 kB
dist/assets/index-BGRCzYK-.css     43.40 kB │ gzip: 8.29 kB
dist/assets/index-CedoXHgT.js   1,014.72 kB │ gzip: 296.47 kB
```

## 🎯 Итог

**Проблема:** Ошибка `Cannot read properties of undefined (reading 'forEach')`  
**Причина:** Отсутствие проверки на существование `costRows`  
**Решение:** Добавлена проверка и миграция данных  
**Статус:** ✅ Исправлено

---

**Версия:** 1.0.3  
**Дата:** 2026-01-10  
**Статус:** ✅ Fixed

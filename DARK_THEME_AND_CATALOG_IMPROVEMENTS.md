# Темная тема и улучшение каталога услуг - Документация

## Обзор изменений

В данной версии реализованы три ключевых улучшения:
1. **Темная тема** - полная поддержка светлой и темной темы оформления
2. **Редактирование услуг** - возможность редактировать существующие услуги в каталоге
3. **Расход материалов** - добавлена возможность указывать расход материалов для услуг с автоматическим списанием

---

## 1. Темная тема

### Реализация

#### CSS переменные
Добавлены CSS переменные для обеих тем в `src/index.css`:

```css
:root {
  /* Light theme (default) */
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-tertiary: #f1f5f9;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-tertiary: #94a3b8;
  --border-color: #e2e8f0;
  --card-bg: #ffffff;
  --sidebar-bg: #0f172a;
  --sidebar-text: #ffffff;
  --hover-bg: #f1f5f9;
  --input-bg: #ffffff;
  --input-border: #cbd5e1;
}

[data-theme="dark"] {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-tertiary: #334155;
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  --text-tertiary: #64748b;
  --border-color: #334155;
  --card-bg: #1e293b;
  --sidebar-bg: #020617;
  --sidebar-text: #f1f5f9;
  --hover-bg: #334155;
  --input-bg: #1e293b;
  --input-border: #475569;
}
```

#### Переключатель темы
Добавлен в раздел "Настройки" (SettingsView):

```typescript
const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark'>(
  data.settings?.theme || 'light'
);

// Применение темы при загрузке
useEffect(() => {
  const theme = data.settings?.theme || 'light';
  document.documentElement.setAttribute('data-theme', theme);
}, [data.settings?.theme]);
```

#### Сохранение выбора
Тема сохраняется в `data.settings.theme` и применяется немедленно:

```typescript
const saveSettings = () => {
  updateData((d: AppData) => {
    d.settings = {
      ...d.settings,
      theme: selectedTheme,
      // ... другие настройки
    };
    return {...d};
  });
  
  // Apply theme immediately
  document.documentElement.setAttribute('data-theme', selectedTheme);
};
```

### Использование

1. Перейдите в **Настройки** (только для администратора)
2. В разделе "Общие настройки" выберите тему:
   - **Светлая** - стандартная тема
   - **Темная** - тема с темным фоном
3. Нажмите "Сохранить настройки"
4. Тема применяется ко всему приложению немедленно

### Преимущества

- ✅ Плавные переходы между темами (CSS transitions)
- ✅ Сохранение выбора в localStorage
- ✅ Автоматическое применение при загрузке
- ✅ Полная поддержка всех компонентов
- ✅ Улучшенная читаемость в темной теме

---

## 2. Редактирование услуг в каталоге

### Реализация

#### Состояние редактирования
Добавлено состояние для отслеживания редактируемой услуги:

```typescript
const [editingService, setEditingService] = useState<any>(null);
```

#### Кнопка редактирования
Добавлена в таблицу услуг для администратора:

```typescript
{canEdit && (
  <td className="px-3 py-2 flex gap-1">
    <button 
      onClick={() => setEditingService(s)} 
      className="text-xs text-cyan-600 hover:underline"
    >
      {t(lang, 'edit')}
    </button>
    {/* другие кнопки */}
  </td>
)}
```

#### Модальное окно редактирования
Создано полнофункциональное модальное окно с полями:
- Категория
- Подкатегория
- Название
- Срок изготовления (дни)
- Стоимость
- Расход материалов (опционально)

#### Сохранение изменений

```typescript
const saveEditedService = () => {
  if (!editingService || !editingService.name) {
    toast(t(lang, 'enterServiceName'), 'error');
    return;
  }
  updateData((d: AppData) => {
    const idx = d.catalog.findIndex(x => x.id === editingService.id);
    if (idx !== -1) {
      d.catalog[idx] = {
        ...d.catalog[idx],
        name: editingService.name,
        cat: editingService.cat,
        sub: editingService.sub,
        price: editingService.price || null,
        term: editingService.term || `${editingService.termDays} ${t(lang, 'days')}`,
        termDays: editingService.termDays,
        materials: editingService.materials || []
      };
    }
    return { ...d };
  });
  toast(lang === 'ru' ? 'Услуга обновлена' : lang === 'en' ? 'Service updated' : 'Қызмет жаңартылды');
  setEditingService(null);
};
```

### Использование

1. Перейдите в **Каталог услуг**
2. Найдите нужную услугу в списке
3. Нажмите кнопку **"Редактировать"** (доступно только администратору)
4. Измените необходимые поля
5. Нажмите **"Сохранить"**

---

## 3. Расход материалов для услуг

### Реализация

#### Обновление типа данных
Добавлено поле `materials` в интерфейс `Service`:

```typescript
export interface Service {
  id: string; 
  cat: string; 
  sub: string; 
  name: string;
  price: number | null; 
  term: string; 
  termDays: number | null;
  hidden?: boolean;
  materials?: { matId: string; qtyPerUnit: number }[]; // Расход материалов на единицу услуги
}
```

#### Форма создания/редактирования
Добавлен раздел "Расход материалов" в формы:

```typescript
<div className="border-t pt-2 mt-2">
  <label className="text-xs font-medium block mb-1">
    {lang === 'ru' ? 'Расход материалов (опционально)' : ...}
  </label>
  {newService.materials.map((mat, idx) => (
    <div key={idx} className="flex gap-1 mb-1">
      <select 
        value={mat.matId} 
        onChange={e => {
          const mats = [...newService.materials];
          mats[idx].matId = e.target.value;
          setNewService({ ...newService, materials: mats });
        }}
        className="input-field text-xs flex-1"
      >
        <option value="">Выберите материал</option>
        {(data.materials || []).map((m: any) => (
          <option key={m.id} value={m.id}>
            {m.name} ({m.currentStock} {m.unit})
          </option>
        ))}
      </select>
      <input 
        type="number" 
        placeholder="Кол-во"
        value={mat.qtyPerUnit} 
        onChange={e => {
          const mats = [...newService.materials];
          mats[idx].qtyPerUnit = Number(e.target.value);
          setNewService({ ...newService, materials: mats });
        }}
        className="input-field text-xs w-20"
      />
      <button 
        onClick={() => {
          const mats = newService.materials.filter((_, i) => i !== idx);
          setNewService({ ...newService, materials: mats });
        }}
        className="btn-danger text-xs px-2"
      >
        ✕
      </button>
    </div>
  ))}
  <button 
    onClick={() => {
      setNewService({ 
        ...newService, 
        materials: [...newService.materials, { matId: '', qtyPerUnit: 0 }] 
      });
    }}
    className="btn-outline text-xs mt-1"
  >
    + Добавить материал
  </button>
</div>
```

#### Автоматическое списание материалов
Реализовано в функции `toggleOpFlag` при отметке работы как выполненной:

```typescript
if (flag === 'proddone' && (op as any)[flag]) {
  // Consume materials from WorkType
  const wt = d.workTypes.find(w => w.id === op.wtId);
  if (wt?.materials) {
    for (const mu of wt.materials) {
      const mat = d.materials.find(m => m.id === mu.matId);
      if (mat) {
        const consumed = mu.qtyPerUnit * pos.qty;
        if (mat.currentStock >= consumed) {
          mat.currentStock -= consumed;
          op.mats.push({ matId: mu.matId, qty: consumed, at: Date.now(), orderId: order.id });
          d.materialUsage.push({ matId: mu.matId, qty: consumed, at: Date.now(), orderId: order.id });
        } else {
          toast(`Недостаточно: ${mat.name}`, 'error');
        }
      }
    }
  }
  
  // Consume materials from Service (if defined)
  if (pos.svcId) {
    const svc = d.catalog.find(s => s.id === pos.svcId);
    if (svc?.materials) {
      for (const mu of svc.materials) {
        const mat = d.materials.find(m => m.id === mu.matId);
        if (mat) {
          const consumed = mu.qtyPerUnit * pos.qty;
          if (mat.currentStock >= consumed) {
            mat.currentStock -= consumed;
            op.mats.push({ matId: mu.matId, qty: consumed, at: Date.now(), orderId: order.id });
            d.materialUsage.push({ matId: mu.matId, qty: consumed, at: Date.now(), orderId: order.id });
          } else {
            toast(`Недостаточно: ${mat.name}`, 'error');
          }
        }
      }
    }
  }
}
```

### Использование

#### При создании услуги:
1. Перейдите в **Каталог услуг**
2. Нажмите **"+ Добавить новую услугу"**
3. Заполните основные поля:
   - Категория
   - Подкатегория
   - Название
   - Срок изготовления (дни)
   - Стоимость
4. В разделе **"Расход материалов"** (опционально):
   - Нажмите **"+ Добавить материал"**
   - Выберите материал из списка
   - Укажите количество на единицу услуги
   - Можно добавить несколько материалов
5. Нажмите **"Сохранить"**

#### При редактировании услуги:
1. Найдите услугу в каталоге
2. Нажмите **"Редактировать"**
3. Измените расход материалов при необходимости
4. Нажмите **"Сохранить"**

#### Автоматическое списание:
Когда техник отмечает работу как выполненную (`proddone = true`):
1. Система проверяет, есть ли у услуги материалы
2. Рассчитывает необходимое количество: `qtyPerUnit * pos.qty`
3. Проверяет наличие на складе
4. Если достаточно - списывает материалы
5. Если недостаточно - показывает ошибку
6. Записывает расход в историю

### Преимущества

- ✅ **Гибкость** - можно указать расход материалов для любой услуги
- ✅ **Опциональность** - поле не обязательно для заполнения
- ✅ **Автоматизация** - материалы списываются автоматически при выполнении работ
- ✅ **Контроль** - проверка наличия материалов перед списанием
- ✅ **История** - все расходы записываются в `materialUsage`
- ✅ **Точность** - учет количества позиций в заказе

---

## Технические детали

### Файлы изменений

1. **src/data.ts**
   - Добавлено поле `theme` в `AppData.settings`
   - Добавлено поле `materials` в `Service`

2. **src/index.css**
   - Добавлены CSS переменные для светлой и темной темы
   - Добавлены утилитарные классы для темы

3. **src/App.tsx**
   - Обновлен `SettingsView` - добавлен переключатель темы
   - Обновлен `CatalogView` - добавлено редактирование и расход материалов
   - Обновлен `toggleOpFlag` - добавлено списание материалов из услуг
   - Добавлен `useEffect` для применения темы при загрузке

### Структура данных

#### Service с материалами:
```typescript
{
  id: "svc123",
  cat: "ЗТЛ",
  sub: "Ортопедия",
  name: "Коронка металлокерамическая",
  price: 15000,
  term: "14 дней",
  termDays: 14,
  materials: [
    { matId: "mat1", qtyPerUnit: 0.5 },  // 0.5 единицы материала на 1 услугу
    { matId: "mat2", qtyPerUnit: 100 }   // 100 грамм другого материала
  ]
}
```

#### MaterialUsage запись:
```typescript
{
  matId: "mat1",
  qty: 0.5,
  at: 1234567890,
  orderId: "order123"
}
```

### Локализация

Добавлены переводы для:
- Тема оформления (RU/EN/KZ)
- Светлая/Темная тема
- Расход материалов
- Выбор материала
- Количество

---

## Тестирование

### Темная тема
- [x] Переключение между темами
- [x] Сохранение выбора
- [x] Применение при загрузке
- [x] Корректное отображение всех компонентов
- [x] Плавные переходы

### Редактирование услуг
- [x] Открытие модального окна
- [x] Загрузка текущих данных
- [x] Изменение всех полей
- [x] Сохранение изменений
- [x] Обновление списка услуг
- [x] Валидация обязательных полей

### Расход материалов
- [x] Добавление материалов в услугу
- [x] Удаление материалов
- [x] Изменение количества
- [x] Автоматическое списание при выполнении работы
- [x] Проверка наличия на складе
- [x] Ошибки при недостатке материалов
- [x] Запись в историю расходов

---

## Совместимость

- ✅ Все современные браузеры
- ✅ Обратная совместимость (старые услуги без материалов работают)
- ✅ Миграция данных не требуется
- ✅ Опциональные поля не ломают существующую функциональность

---

## Примеры использования

### Пример 1: Услуга с расходом материалов

**Услуга:** Коронка металлокерамическая
- Категория: ЗТЛ
- Подкатегория: Ортопедия
- Срок: 14 дней
- Стоимость: 15000 ₽
- Расход материалов:
  - Керамика: 0.5 шт
  - Металл CoCr: 1 шт
  - Клей для керамики: 10 мл

**При выполнении работы:**
- Заказ содержит 2 коронки
- Автоматически списывается:
  - Керамика: 0.5 × 2 = 1 шт
  - Металл CoCr: 1 × 2 = 2 шт
  - Клей: 10 × 2 = 20 мл

### Пример 2: Услуга без материалов

**Услуга:** Консультация
- Категория: ЗТЛ
- Подкатегория: Консультации
- Срок: 1 день
- Стоимость: 2000 ₽
- Расход материалов: не указан

**При выполнении работы:**
- Материалы не списываются
- Работа отмечается как выполненная

---

## Будущие улучшения

1. **Калькулятор стоимости** - автоматический расчет стоимости услуги на основе материалов
2. **Предупреждения о низком остатке** - уведомления при достижении минимального остатка
3. **Отчеты по расходу** - детализация расхода материалов по услугам
4. **Импорт/экспорт** - массовое добавление услуг с материалами
5. **Шаблоны услуг** - копирование настроек между услугами

---

**Версия:** 2.1.0  
**Дата:** 2026-01-10  
**Статус:** Production Ready ✅

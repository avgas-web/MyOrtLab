# MyOrtLab/GnatOne - Руководство разработчика

## 📋 Содержание

1. [Обзор проекта](#обзор-проекта)
2. [Архитектура](#архитектура)
3. [Технологический стек](#технологический-стек)
4. [Структура проекта](#структура-проекта)
5. [Установка и запуск](#установка-и-запуск)
6. [Типы данных](#типы-данных)
7. [Компоненты](#компоненты)
8. [Бизнес-логика](#бизнес-логика)
9. [Локализация](#локализация)
10. [Уведомления](#уведомления)
11. [Права доступа](#права-доступа)
12. [API интеграции](#api-интеграции)
13. [Тестирование](#тестирование)
14. [Деплой](#деплой)
15. [Поддержка браузеров и ОС](#поддержка-браузеров-и-ос)

---

## 🎯 Обзор проекта

MyOrtLab/GnatOne - полнофункциональное веб-приложение для управления зуботехнической лабораторией. Система обеспечивает полный жизненный цикл заказов от создания до сдачи, включая:

- Управление заказами (ортопедия, ортодонтия, протезирование, гнатология)
- Конвейерную обработку с множеством статусов
- Отдельные ветки для ремонта и гарантии
- Управление пациентами, материалами, пользователями
- CRM-функции и аналитику
- AI-отчёты (GnatoneMirror)
- Многопользовательскую работу с разграничением ролей

---

## 🏗️ Архитектура

### Frontend
- **React 18** с TypeScript
- **Vite** для сборки
- **Tailwind CSS** для стилизации
- **localStorage** для хранения данных (демо-режим)

### Состояние приложения
Глобальное состояние хранится в объекте `AppData` и сохраняется в localStorage. Основные сущности:

```typescript
interface AppData {
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
  settings: Settings;
}
```

---

## 🛠️ Технологический стек

### Основные технологии
- **React 18.3.1** - UI библиотека
- **TypeScript 5.6.2** - типизация
- **Vite 6.0.3** - сборщик
- **Tailwind CSS 3.4.17** - утилитарные CSS классы

### Инструменты разработки
- **ESLint** - линтинг кода
- **@vitejs/plugin-react** - React поддержка для Vite

---

## 📁 Структура проекта

```
myortlab/
├── src/
│   ├── App.tsx           # Главный компонент приложения
│   ├── data.ts           # Типы данных, константы, демо-данные
│   ├── i18n.ts           # Локализация (RU, EN, KZ)
│   ├── index.css         # Глобальные стили
│   └── main.tsx          # Точка входа
├── public/               # Статические файлы
├── dist/                 # Собранный проект
├── index.html            # HTML шаблон
├── package.json          # Зависимости
├── tsconfig.json         # Конфигурация TypeScript
├── vite.config.ts        # Конфигурация Vite
├── README.md             # Документация для пользователей
├── DEVELOPER_GUIDE.md    # Это руководство
└── CHECKLIST.md          # Чеклист соответствия ТЗ
```

---

## 🚀 Установка и запуск

### Требования
- Node.js 18+ 
- npm 9+

### Установка зависимостей
```bash
npm install
```

### Запуск в режиме разработки
```bash
npm run dev
```
Приложение будет доступно по адресу `http://localhost:5173`

### Сборка для продакшена
```bash
npm run build
```
Собранные файлы будут в директории `dist/`

### Предпросмотр продакшен-сборки
```bash
npm run preview
```

---

## 📊 Типы данных

### User (Пользователь)
```typescript
interface User {
  id: string;
  login: string;
  pass: string;
  name: string;
  role: string;
  clinic?: string;
  mirror?: boolean;
  subscription?: GMAISubscription;
  permissions?: UserPermissions;
  email?: string;
  phone?: string;
  telegramChatId?: string;
  maxChatId?: string;
}
```

### Order (Заказ)
```typescript
interface Order {
  id: string;
  num: string;
  patientId: string;
  doctorId: string;
  clinic: string;
  category: string;
  type: 'full' | 'cadcam_only' | 'phys_only' | 'repair' | 'guarantee';
  positions: OrderPosition[];
  files: OrderFile[];
  status: string;
  corrections: number;
  paymentType: 'pre100' | 'pre50' | 'post100' | 'internal' | 'free';
  has_physical_impressions: boolean;
  is_urgent?: boolean;
  // ... другие поля
}
```

### Patient (Пациент)
```typescript
interface Patient {
  id: string;
  fio: string;
  sex: string;
  bd: string;
  clinic: string;
  doctors: string[];
}
```

### Service (Услуга)
```typescript
interface Service {
  id: string;
  cat: string;
  sub: string;
  name: string;
  price: number | null;
  term: string;
  termDays: number | null;
}
```

---

## 🧩 Компоненты

### Основные компоненты

#### App
Главный компонент приложения. Управляет:
- Авторизацией
- Навигацией
- Глобальным состоянием
- Модальными окнами

#### DashboardView
Главная страница с:
- KPI карточками
- Канбан-доской заказов
- Лентой новостей

#### OrdersView
Список заказов с:
- Фильтрацией по статусу и категории
- Поиском
- Переключением между канбаном и списком

#### OrderModal
Модальное окно заказа с вкладками:
- Информация и действия
- Позиции и виды работ
- Файлы
- Чат
- История

#### NewOrderView
Форма создания нового заказа:
- Выбор типа заказа
- Поиск и добавление услуг
- Создание нового пациента
- Автоматическое определение маршрута

#### PatientsView
Управление пациентами:
- Список пациентов
- Добавление нового пациента
- Ограничение прав для докторов

#### MaterialsView
Управление материалами:
- Номенклатура
- Приход материалов
- Отчёты за месяц

#### UsersView
Управление пользователями:
- Список пользователей
- Добавление/редактирование
- Управление правами доступа

#### NotificationsView
Настройка уведомлений:
- Telegram
- Max
- Email

---

## 💼 Бизнес-логика

### Статусы заказов

#### Основной конвейер
```
quality → accept → (gypsum → scanning) → admin_pricing → payment → 
cadcam → approve → production → delivery → handover → closing → done
```

#### Ветка ремонта
```
repair_create → repair_approve → payment → production → delivery → closing → done
```

#### Ветка гарантии
```
guarantee_create → guarantee_approve → production → delivery → done
```

### Автоматическое определение типа заказа

Функция `determineOrderType()` анализирует выбранные услуги и определяет маршрут:

```typescript
function determineOrderType(positions: {svcId, cat}[]): 'full' | 'cadcam_only' | 'phys_only' {
  let hasCad = false;
  let hasPhys = false;
  
  for (const pos of positions) {
    if (pos.cat === 'Моделировка' || pos.cat === 'Ортопедия') {
      hasCad = true;
    }
    if (pos.cat === 'Протезирование Ао4/6' || pos.cat === 'Балочные') {
      hasPhys = true;
    }
  }
  
  if (hasCad && hasPhys) return 'full';
  if (hasCad) return 'cadcam_only';
  if (hasPhys) return 'phys_only';
  return 'full';
}
```

### Ограничения прав при создании пациента

- **Доктор**: может создать пациента только с собой в списке докторов
- **Админ**: может назначать любых докторов

```typescript
if (isDoctor && !isAdmin) {
  patientDoctors = [user.id];
}
```

---

## 🌍 Локализация

### Поддерживаемые языки
- Русский (ru) - по умолчанию
- Английский (en)
- Казахский (kz)

### Использование

```typescript
import { t, type Lang } from './i18n';

// В компоненте
const lang: Lang = data.settings?.language || 'ru';
const label = t(lang, 'dashboard'); // "Главная" / "Dashboard" / "Басты бет"
```

### Добавление новых переводов

В файле `src/i18n.ts`:

```typescript
export const translations = {
  ru: {
    newKey: 'Новый текст',
  },
  en: {
    newKey: 'New text',
  },
  kz: {
    newKey: 'Жаңа мәтін',
  }
};
```

---

## 🔔 Уведомления

### Настройка

В разделе "Уведомления" администратор может настроить:

#### Telegram
```typescript
{
  enabled: boolean;
  botToken: string;
  chatId: string;
}
```

#### Max
```typescript
{
  enabled: boolean;
  apiKey: string;
  chatId: string;
}
```

#### Email
```typescript
{
  enabled: boolean;
  smtp: {
    host: string;
    port: number;
    user: string;
    pass: string;
  };
  from: string;
}
```

### Интеграция (будущая)

Для реальной отправки уведомлений необходимо:

1. **Telegram**: Использовать Telegram Bot API
```typescript
async function sendTelegramNotification(token: string, chatId: string, message: string) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: message })
  });
}
```

2. **Max**: Использовать Max API (документация уточняется)

3. **Email**: Использовать SMTP сервер или сервис типа SendGrid

---

## 🔐 Права доступа

### Система прав

Каждый пользователь имеет индивидуальные права:

```typescript
interface UserPermissions {
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
}
```

### Проверка прав

```typescript
const canCreate = user.permissions?.canCreateOrders || 
                  user.role === 'admin' || 
                  user.role === 'doctor';
```

### Роли по умолчанию

- **admin**: Полный доступ
- **admin_ztl**: Управление заказами, ценообразование
- **doctor**: Создание заказов, согласование работ
- **quality**: Проверка файлов
- **cadcam/keramist/gips/scan**: Выполнение технических работ

---

## 🔌 API интеграции

### GnatoneMirror (AI-отчёты)

Webhook для интеграции с AI-сервисом:

```typescript
async function generateAIReport(patientId: string, files: OrderFile[]) {
  const webhookUrl = 'https://api.gnatone.com/ai-report';
  
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patientId,
      files: files.map(f => ({ name: f.name, type: f.typeCat })),
      history: getPatientHistory(patientId)
    })
  });
  
  return await response.json();
}
```

### Экспорт данных

CSV экспорт с BOM для корректной кодировки:

```typescript
function exportCSV(data: any[], filename: string) {
  const BOM = '\uFEFF';
  const csv = BOM + data.map(row => 
    Object.values(row).map(v => `"${v}"`).join(';')
  ).join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
}
```

---

## 🧪 Тестирование

### Ручное тестирование

1. **Авторизация**
   - Вход с разными ролями
   - Проверка прав доступа

2. **Создание заказа**
   - Обычный заказ с автоматическим определением типа
   - Ремонтный заказ
   - Гарантийный заказ
   - Создание нового пациента в процессе

3. **Конвейер заказов**
   - Переходы между статусами
   - Коррекции
   - Согласования

4. **Управление материалами**
   - Добавление прихода
   - Проверка остатков
   - Отчёты

### Демо-аккаунты

```
admin / admin - Администратор ЛК
ztl / ztl - Администратор ЗТЛ
doctor / doctor - Доктор
quality / quality - Менеджер по качеству
tech1 / tech1 - Специалист CAD/CAM
keramist / keramist - Керамист
```

---

## 🚢 Деплой

### Сборка для продакшена

```bash
npm run build
```

### Размещение

Скопируйте содержимое `dist/` на ваш веб-сервер:

```bash
# Пример для Nginx
sudo cp -r dist/* /var/www/html/
```

### Переменные окружения

Для продакшена рекомендуется вынести настройки в `.env`:

```env
VITE_API_URL=https://api.myortlab.com
VITE_TELEGRAM_BOT_TOKEN=your_bot_token
VITE_GMAI_WEBHOOK_URL=https://api.gnatone.com/webhook
```

---

## 💻 Поддержка браузеров и ОС

### Браузеры

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Opera 76+

### Операционные системы

#### Windows
- ✅ Windows 10 (1903+)
- ✅ Windows 11
- ✅ Windows Server 2019+

#### Linux
- ✅ Ubuntu 20.04+
- ✅ Debian 11+
- ✅ CentOS 8+
- ✅ Fedora 34+

#### macOS
- ✅ macOS 11 (Big Sur)+
- ✅ macOS 12 (Monterey)
- ✅ macOS 13 (Ventura)
- ✅ macOS 14 (Sonoma)

### Мобильные устройства

- ✅ iOS Safari 14+
- ✅ Android Chrome 90+
- ✅ Адаптивный дизайн для планшетов

### Тестирование на разных ОС

#### Windows
```powershell
# Запуск в режиме разработки
npm run dev

# Проверка в разных браузерах
start chrome http://localhost:5173
start firefox http://localhost:5173
start msedge http://localhost:5173
```

#### Linux
```bash
# Запуск в режиме разработки
npm run dev

# Проверка в разных браузерах
google-chrome http://localhost:5173 &
firefox http://localhost:5173 &
```

#### macOS
```bash
# Запуск в режиме разработки
npm run dev

# Проверка в разных браузерах
open -a "Google Chrome" http://localhost:5173
open -a "Firefox" http://localhost:5173
open -a "Safari" http://localhost:5173
```

---

## 🔧 Расширение функциональности

### Добавление нового статуса заказа

1. Добавьте статус в `STATUS_NAMES` и `STATUS_COLORS` в `data.ts`
2. Добавьте логику перехода в соответствующем компоненте
3. Обновите роли в `DEFAULT_ROLES_META`

### Добавление новой роли

1. Добавьте роль в `ROLE_LABELS` в `data.ts`
2. Настройте права в `DEFAULT_ROLES_META`
3. Обновите логику фильтрации заказов в `getFilteredOrders()`

### Добавление нового типа отчёта

1. Создайте компонент отчёта
2. Добавьте пункт меню в `App.tsx`
3. Реализуйте функцию экспорта в CSV

---

## 📝 Лучшие практики

### Код

- Используйте TypeScript для типизации
- Следуйте принципу единственной ответственности
- Избегайте дублирования кода
- Комментируйте сложную бизнес-логику

### Производительность

- Используйте `useMemo` для тяжёлых вычислений
- Избегайте лишних ре-рендеров
- Оптимизируйте размер компонентов

### Безопасность

- Не храните пароли в открытом виде (в продакшене)
- Валидируйте все входные данные
- Используйте HTTPS для API запросов

---

## 🆘 Поддержка

### Известные ограничения

- Данные хранятся в localStorage (демо-режим)
- Нет реальной интеграции с AI-сервисом (webhook заглушка)
- Уведомления не отправляются (только настройка)

### Будущие улучшения

- [ ] Интеграция с базой данных (PostgreSQL)
- [ ] Реальная отправка уведомлений
- [ ] Интеграция с AI-сервисом GnatoneMirror
- [ ] Мобильное приложение
- [ ] API для внешних интеграций
- [ ] Печать заказ-нарядов с QR-кодами

---

## 📄 Лицензия

Проект разработан для MyOrtLab/GnatOne. Все права защищены.

---

**Версия документа**: 2.0  
**Дата обновления**: 2026-01-10  
**Автор**: AI Assistant

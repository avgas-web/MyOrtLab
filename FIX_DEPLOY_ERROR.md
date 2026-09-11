# 🔧 Исправление ошибки деплоя на GitHub Pages

## ❌ Ошибка

```
HttpError: Not Found - Get Pages site failed
Node.js 20 is deprecated
```

## ✅ Что нужно сделать

### 1. Включите GitHub Pages в настройках репозитория

**Это главная причина ошибки!**

1. Откройте ваш репозиторий на GitHub
2. Нажмите **Settings** (Настройки) в правом верхнем углу
3. В левом меню найдите **Pages**
4. В разделе **Build and deployment**:
   - **Source**: выберите **GitHub Actions** ⚠️ (НЕ "Deploy from a branch")
5. Нажмите **Save**

### 2. Обновления в workflow файле (уже сделано)

В файле `.github/workflows/deploy.yml` исправлено:

- ✅ Node.js версия: 20 → 22 (исправлено устаревание)
- ✅ Actions версия: configure-pages@v4 → @v5 (исправлено)
- ✅ Permissions настроены правильно

### 3. Запустите workflow заново

1. Перейдите на вкладку **Actions**
3. Нажмите **Run workflow**
4. Выберите branch (main или master)
5. Нажмите **Run workflow**

### 4. Проверьте результат

После успешного деплоя (зеленая галочка ✓) сайт будет доступен:

```
https://ВАШ_ЛОГИН.github.io/ИМЯ_РЕПОЗИТОРИЯ/
```

## 📋 Чеклист

- [ ] Репозиторий публичный (Public)
- [ ] Settings → Pages → Source: **GitHub Actions**
- [ ] Workflow permissions: **Read and write permissions**
- [ ] Файл `.github/workflows/deploy.yml` существует
- [ ] Workflow использует Node.js 22
- [ ] Workflow использует `actions/configure-pages@v5`

## 🐛 Если не работает

### Проверка 1: Pages включен?

Settings → Pages → должно быть написано "Your site is live at..."

### Проверка 2: Правильный source?

Source должен быть **GitHub Actions**, а НЕ "Deploy from a branch"

### Проверка 3: Permissions?

Settings → Actions → General → Workflow permissions → **Read and write permissions**

### Проверка 4: Репозиторий публичный?

Settings → General → Repository visibility → **Public**

## 📖 Подробная документация

Полная инструкция: [GITHUB_PAGES_SETUP.md](GITHUB_PAGES_SETUP.md)

## ✅ Готово!

После выполнения всех шагов сайт будет успешно задеплоен на GitHub Pages.

---

**Версия**: 2.5.4  
**Дата**: 2026-01-10

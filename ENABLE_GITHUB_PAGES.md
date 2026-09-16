# 🚀 ВКЛЮЧЕНИЕ GITHUB PAGES - ПОШАГОВАЯ ИНСТРУКЦИЯ

## ❌ Ошибка

```
Get Pages site failed. Please verify that the repository has Pages enabled 
and configured to build using GitHub Actions
```

Эта ошибка означает, что **GitHub Pages не включен** в настройках репозитория.

---

## ✅ РЕШЕНИЕ: Включите GitHub Pages

### Шаг 1: Откройте настройки репозитория

1. Перейдите на GitHub в ваш репозиторий
2. Нажмите на вкладку **"Settings"** (Настройки) в правом верхнем углу

![Settings](https://docs.github.com/assets/cb-60473/mw-1000/images/help/repository/repo-actions-settings.webp)

---

### Шаг 2: Перейдите в раздел Pages

1. В левом меню найдите раздел **"Pages"**
2. Нажмите на него

![Pages Menu](https://docs.github.com/assets/cb-33811/mw-1000/images/help/settings/settings-pages-sidebar.webp)

---

### Шаг 3: Настройте GitHub Pages

В разделе **"Build and deployment"** найдите поле **"Source"** и выберите:

**⚠️ ВАЖНО: Выберите "GitHub Actions" (НЕ "Deploy from a branch")**

![Source Selection](https://docs.github.com/assets/cb-8655/mw-1000/images/help/pages/pages-source-selection.webp)

```
Source: GitHub Actions  ✅ ПРАВИЛЬНО
Source: Deploy from a branch  ❌ НЕПРАВИЛЬНО
```

---

### Шаг 4: Сохраните настройки

Нажмите кнопку **"Save"** (Сохранить) внизу страницы

---

### Шаг 5: Проверьте настройки

После сохранения вы должны увидеть сообщение:

```
✅ Your site is live at https://ВАШ_ЛОГИН.github.io/ИМЯ_РЕПО/
```

Или:

```
⏳ GitHub Pages is building your site...
```

---

## 🔄 Запустите Workflow заново

После включения GitHub Pages:

1. Перейдите на вкладку **"Actions"** в вашем репозитории
2. Найдите workflow **"Deploy to GitHub Pages"**
3. Если он не запустился автоматически, нажмите **"Run workflow"**
4. Выберите branch: **main** или **master**
5. Нажмите **"Run workflow"**

---

## ✅ Проверка успешного деплоя

### 1. Проверьте статус workflow

1. Перейдите в **Actions**
2. Найдите последний запуск
3. Убедитесь, что все шаги завершились с зеленой галочкой ✓

### 2. Откройте сайт

Сайт будет доступен по адресу:

```
https://ВАШ_ЛОГИН.github.io/ИМЯ_РЕПОЗИТОРИЯ/
```

**Пример:**
- Логин: `john123`
- Репозиторий: `MyOrtLab`
- URL: `https://john123.github.io/MyOrtLab/`

---

## 🔧 Дополнительные проверки

### Проверка 1: Репозиторий публичный?

GitHub Pages работает только с **публичными** репозиториями (для бесплатных аккаунтов).

1. Settings → General
2. Прокрутите до **"Danger Zone"**
3. Убедитесь, что написано **"This repository is public"**
4. Если Private, нажмите **"Change visibility"** → **"Public"**

---

### Проверка 2: Permissions настроены?

1. Settings → Actions → General
2. Прокрутите до **"Workflow permissions"**
3. Выберите **"Read and write permissions"**
4. Нажмите **"Save"**

---

### Проверка 3: Workflow файл существует?

Убедитесь, что файл `.github/workflows/deploy.yml` существует в вашем репозитории.

---

## 📋 Полный чеклист

Перед деплоем убедитесь, что:

- [ ] Репозиторий **публичный** (Public)
- [ ] Settings → Pages → Source: **GitHub Actions**
- [ ] Workflow permissions: **Read and write permissions**
- [ ] Файл `.github/workflows/deploy.yml` существует
- [ ] Workflow использует Node.js 22
- [ ] Workflow использует `actions/configure-pages@v5`
- [ ] Все зависимости установлены (`npm ci` проходит)
- [ ] Проект собирается локально (`npm run build` работает)

---

## 🐛 Если проблема не решена

### Проблема 1: "Get Pages site failed"

**Решение:** Включите Pages в Settings → Pages → Source: "GitHub Actions"

### Проблема 2: "404 Not Found" после деплоя

**Решение:**
- Подождите 5-10 минут (GitHub Pages кэширует)
- Очистите кэш браузера (Ctrl+Shift+Delete)
- Проверьте, что имя репозитория совпадает с `base` в `vite.config.js`

### Проблема 3: "Workflow failed"

**Решение:**
- Проверьте логи в Actions
- Убедитесь, что все зависимости установлены
- Проверьте, что проект собирается локально

### Проблема 4: "Node.js 20 is deprecated"

**Решение:** Обновите workflow файл (уже исправлено в новой версии)

---

## 📊 Ожидаемое время деплоя

- **Сборка проекта:** 1-2 минуты
- **Загрузка артефактов:** 30 секунд
- **Деплой на Pages:** 1-2 минуты
- **Общее время:** 3-5 минут

---

## 🎯 Итоговая проверка

После успешного деплоя:

1. ✅ Сайт открывается по URL `https://ВАШ_ЛОГИН.github.io/ИМЯ_РЕПО/`
2. ✅ Все страницы работают
3. ✅ Стили загружаются
4. ✅ JavaScript работает
5. ✅ Нет ошибок в консоли браузера (F12)

---

## 📞 Нужна помощь?

Если проблема не решена:

1. Проверьте все пункты чеклиста выше
2. Проверьте логи workflow в Actions
3. Убедитесь, что Pages включен в Settings
4. Попробуйте ручной запуск workflow
5. Создайте issue в репозитории с описанием проблемы

---

## 📝 Пример успешного деплоя

После успешного деплоя вы увидите:

```
✅ Your site is live at https://john123.github.io/MyOrtLab/
```

И сайт будет доступен по этому адресу!

---

**Версия:** 1.0.0  
**Дата:** 2026-01-10  
**Статус:** ✅ Tested

---

## ✅ ГОТОВО!

После выполнения всех шагов ваш сайт будет успешно задеплоен на GitHub Pages! 🚀

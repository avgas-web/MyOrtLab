# 🌿 MyOrtLab - Стратегия ветвления Git

**Версия:** 1.0.0  
**Дата:** 2026-01-10  
**Статус:** ✅ Active

---

## 📋 Обзор

Этот документ описывает стратегию ветвления Git для проекта MyOrtLab/GnatOne. Мы используем модифицированную модель **Git Flow** с элементами **GitHub Flow** для гибкости и простоты.

---

## 🎯 Основные ветки

### `main` (protected)
**Статус:** ✅ Production Ready  
**Защита:** ✅ Включена  
**Описание:** Основная ветка для продакшена

- ✅ Всегда стабильна и готова к деплою
- ✅ Каждый коммит автоматически деплоится на GitHub Pages
- ✅ Запрещены прямые коммиты (только через Pull Request)
- ✅ Требуется минимум 1 approval перед слиянием
- ✅ Автоматические проверки (lint, build, tests)

**Правила:**
```bash
# Запрещено:
git push origin main  # ❌ Прямой push запрещен

# Разрешено:
# Только через Pull Request из develop или hotfix веток
```

---

### `develop` (protected)
**Статус:** 🔄 Development  
**Защита:** ✅ Включена  
**Описание:** Основная ветка для разработки

- 🔄 Интеграционная ветка для всех feature веток
- 🔄 Всегда содержит последние стабильные изменения
- 🔄 Готовится к следующему релизу
- ✅ Требуется минимум 1 approval перед слиянием в main

**Правила:**
```bash
# Создание из main:
git checkout main
git pull origin main
git checkout -b develop
git push -u origin develop

# Слияние feature веток:
git checkout develop
git merge feature/название-фичи
git push origin develop
```

---

## 🚀 Ветки функций (Feature Branches)

### `feature/*`
**Описание:** Ветки для новых функций и улучшений

**Правила именования:**
```
feature/название-фичи
feature/калькулятор-себестоимости
feature/генератор-договоров
feature/темная-тема
feature/мультиязычность
```

**Workflow:**
```bash
# 1. Создание ветки из develop:
git checkout develop
git pull origin develop
git checkout -b feature/калькулятор-себестоимости

# 2. Разработка:
git add .
git commit -m "feat: добавлен калькулятор себестоимости"
git push -u origin feature/калькулятор-себестоимости

# 3. Создание Pull Request в develop
# 4. После approval - слияние через GitHub UI
# 5. Удаление ветки после слияния
```

**Примеры:**
- `feature/price-calculator` - калькулятор себестоимости
- `feature/contract-generator` - генератор договоров
- `feature/dark-theme` - темная тема
- `feature/i18n-support` - мультиязычность
- `feature/user-roles` - система ролей

---

## 🐛 Ветки исправлений (Bugfix Branches)

### `bugfix/*`
**Описание:** Ветки для исправления багов в develop

**Правила именования:**
```
bugfix/описание-проблемы
bugfix/исправление-расчетов
bugfix/ошибка-авторизации
bugfix/не-загружаются-файлы
```

**Workflow:**
```bash
# 1. Создание ветки из develop:
git checkout develop
git pull origin develop
git checkout -b bugfix/исправление-расчетов

# 2. Исправление:
git add .
git commit -m "fix: исправлены расчеты в калькуляторе"
git push -u origin bugfix/исправление-расчетов

# 3. Создание Pull Request в develop
# 4. После approval - слияние
```

---

## 🔥 Ветки срочных исправлений (Hotfix Branches)

### `hotfix/*`
**Описание:** Ветки для срочных исправлений в production

**Правила именования:**
```
hotfix/описание-проблемы
hotfix/критическая-ошибка
hotfix/безопасность-xss
hotfix/потеря-данных
```

**Workflow:**
```bash
# 1. Создание ветки из main:
git checkout main
git pull origin main
git checkout -b hotfix/критическая-ошибка

# 2. Исправление:
git add .
git commit -m "hotfix: исправлена критическая ошибка"
git push -u origin hotfix/критическая-ошибка

# 3. Создание Pull Request в main И develop
# 4. После approval - слияние в обе ветки
# 5. Автоматический деплой на production
```

**Важно:** Hotfix сливается в ОБЕ ветки: main и develop

---

## 📦 Ветки релизов (Release Branches)

### `release/*`
**Описание:** Ветки для подготовки релиза

**Правила именования:**
```
release/v3.0.0
release/v3.1.0
release/v3.0.1
```

**Workflow:**
```bash
# 1. Создание ветки из develop:
git checkout develop
git pull origin develop
git checkout -b release/v3.0.0

# 2. Финальные исправления (только багфиксы):
git add .
git commit -m "release: подготовка версии 3.0.0"

# 3. Обновление версии в package.json:
npm version 3.0.0

# 4. Создание Pull Request в main
# 5. После approval - слияние в main
# 6. Создание тега:
git tag -a v3.0.0 -m "Release 3.0.0"
git push origin v3.0.0

# 7. Слияние обратно в develop:
git checkout develop
git merge release/v3.0.0
git push origin develop
```

---

## 🏷️ Теги (Tags)

**Описание:** Теги для маркировки версий

**Правила именования:**
```
v3.0.0          # Major release
v3.1.0          # Minor release
v3.0.1          # Patch release
v3.0.0-beta.1   # Beta release
v3.0.0-rc.1     # Release candidate
```

**Создание тегов:**
```bash
# Создание тега:
git tag -a v3.0.0 -m "Release 3.0.0"

# Push тега:
git push origin v3.0.0

# Список тегов:
git tag -l

# Удаление тега:
git tag -d v3.0.0
git push origin :refs/tags/v3.0.0
```

---

## 📊 Диаграмма workflow

```
main       ●────────────────────────────────●────────● (production)
            ↑                               ↑        ↑
            │                               │        │
release     │    ●──────────────────────────●        │
            │    ↑                          │        │
            │    │                          │        │
develop     ●────┼──────────────────────────┼────────┼ (development)
            ↑    ↑                          ↑        ↑
            │    │                          │        │
feature     │  ●─┴──●                       │        │
            │       ↑                       │        │
            │       │                       │        │
bugfix      │       │    ●────────●         │        │
            │       │    ↑        ↑         │        │
            │       │    │        │         │        │
hotfix      │       │    │        │      ●──┴──●     │
            │       │    │        │      ↑     ↑     │
            └───────┴────┴────────┴──────┴─────┴─────┘
```

---

## 🔐 Защита веток (Branch Protection)

### Правила для `main`:
- ✅ Требуются Pull Request
- ✅ Минимум 1 approval
- ✅ Требуются status checks (build, lint)
- ✅ Запрещены force push
- ✅ Запрещено удаление ветки

### Правила для `develop`:
- ✅ Требуются Pull Request
- ✅ Минимум 1 approval
- ✅ Требуются status checks
- ✅ Запрещены force push

### Настройка в GitHub:
1. Settings → Branches → Add rule
2. Branch name pattern: `main` или `develop`
3. Включить:
   - Require pull request reviews
   - Require status checks
   - Require branches to be up to date
   - Include administrators (опционально)

---

## 📝 Сообщения коммитов (Commit Messages)

### Формат:
```
<тип>(<область>): <описание>

[опциональное тело]

[опциональные footers]
```

### Типы коммитов:
```
feat:     Новая функция
fix:      Исправление бага
docs:     Изменения в документации
style:    Форматирование, отсутствие изменения кода
refactor: Рефакторинг кода
test:     Добавление тестов
chore:    Изменения в сборке или инструментах
perf:     Улучшение производительности
ci:       Изменения в CI/CD
build:    Изменения в системе сборки
revert:   Отмена коммита
```

### Примеры:
```bash
# Новая функция:
git commit -m "feat(calculator): добавлен калькулятор себестоимости"

# Исправление бага:
git commit -m "fix(auth): исправлена ошибка авторизации"

# Документация:
git commit -m "docs(readme): обновлена инструкция по установке"

# Рефакторинг:
git commit -m "refactor(components): вынесена логика в отдельные хуки"

# Breaking change:
git commit -m "feat(api)!: изменена структура API

BREAKING CHANGE: удален метод getUser(), используйте findUser()"
```

---

## 🔄 Pull Request Workflow

### Создание Pull Request:

1. **Из feature ветки в develop:**
```bash
git push origin feature/название-фичи
# Перейти в GitHub → Pull Requests → New Pull Request
# Base: develop ← Compare: feature/название-фичи
```

2. **Из hotfix ветки в main:**
```bash
git push origin hotfix/критическая-ошибка
# Base: main ← Compare: hotfix/критическая-ошибка
```

### Шаблон Pull Request:
```markdown
## Описание
Краткое описание изменений

## Тип изменения
- [ ] Новая функция (feat)
- [ ] Исправление бага (fix)
- [ ] Документация (docs)
- [ ] Рефакторинг (refactor)
- [ ] Другое: ___

## Тестирование
- [ ] Протестировано локально
- [ ] Добавлены тесты
- [ ] Проверена сборка

## Checklist
- [ ] Код соответствует стилю проекта
- [ ] Добавлена документация
- [ ] Обновлены зависимости (если нужно)
- [ ] Проверена работа на разных браузерах

## Скриншоты (если применимо)
[Скриншоты изменений]

## Дополнительные заметки
[Любая дополнительная информация]
```

---

## 🧹 Очистка веток

### Удаление локальных веток:
```bash
# Удаление одной ветки:
git branch -d feature/название-фичи

# Принудительное удаление:
git branch -D feature/название-фичи

# Удаление всех слитых веток:
git branch --merged | grep -v "\* main" | grep -v "\* develop" | xargs -n 1 git branch -d
```

### Удаление удаленных веток:
```bash
# Удаление одной ветки:
git push origin --delete feature/название-фичи

# Очистка всех удаленных веток:
git remote prune origin

# Просмотр удаленных веток:
git branch -r
```

---

## 📋 Примеры сценариев

### Сценарий 1: Разработка новой функции

```bash
# 1. Обновить develop:
git checkout develop
git pull origin develop

# 2. Создать feature ветку:
git checkout -b feature/price-calculator

# 3. Разработать функцию:
# ... код ...
git add .
git commit -m "feat(calculator): добавлен калькулятор себестоимости"

# 4. Push и создание PR:
git push -u origin feature/price-calculator
# Создать PR в GitHub: feature/price-calculator → develop

# 5. После approval - слияние через GitHub UI
# 6. Удалить ветку после слияния
```

### Сценарий 2: Срочное исправление в production

```bash
# 1. Создать hotfix ветку из main:
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug

# 2. Исправить баг:
# ... код ...
git add .
git commit -m "hotfix: исправлена критическая ошибка"

# 3. Push и создание PR в main:
git push -u origin hotfix/critical-bug
# Создать PR: hotfix/critical-bug → main

# 4. После approval - слияние в main (автоматический деплой)

# 5. Слить hotfix обратно в develop:
git checkout develop
git merge hotfix/critical-bug
git push origin develop

# 6. Удалить hotfix ветку
```

### Сценарий 3: Подготовка релиза

```bash
# 1. Создать release ветку из develop:
git checkout develop
git pull origin develop
git checkout -b release/v3.0.0

# 2. Обновить версию:
npm version 3.0.0

# 3. Финальные исправления (только багфиксы):
git add .
git commit -m "release: подготовка версии 3.0.0"

# 4. Создать PR в main:
git push -u origin release/v3.0.0
# Создать PR: release/v3.0.0 → main

# 5. После approval - слияние в main

# 6. Создать тег:
git tag -a v3.0.0 -m "Release 3.0.0"
git push origin v3.0.0

# 7. Слить release обратно в develop:
git checkout develop
git merge release/v3.0.0
git push origin develop
```

---

## 🎯 Лучшие практики

### ✅ Делай:
- ✅ Создавай ветки для каждой функции/багфикса
- ✅ Используй понятные имена веток
- ✅ Пиши информативные сообщения коммитов
- ✅ Делай маленькие, атомарные коммиты
- ✅ Регулярно синхронизируй ветки с develop
- ✅ Удаляй слитые ветки
- ✅ Используй Pull Request для ревью кода
- ✅ Тестируй локально перед push

### ❌ Не делай:
- ❌ Не делай прямые коммиты в main или develop
- ❌ Не используй force push на защищенных ветках
- ❌ Не храни большие файлы в Git (используй Git LFS)
- ❌ Не коммить секретные данные (пароли, ключи)
- ❌ Не создавай слишком большие Pull Request
- ❌ Не забывай обновлять ветки перед созданием PR
- ❌ Не удаляй ветки до слияния

---

## 🔧 Полезные команды Git

###日常工作:
```bash
# Статус:
git status

# Добавление файлов:
git add .
git add файл.txt

# Коммит:
git commit -m "описание"

# Push:
git push origin имя-ветки

# Pull:
git pull origin имя-ветки

# Переключение веток:
git checkout имя-ветки

# Создание новой ветки:
git checkout -b имя-ветки
```

### Продвинутые команды:
```bash
# Rebase на develop:
git rebase develop

# Interactive rebase (для изменения коммитов):
git rebase -i HEAD~3

# Stash (временное сохранение изменений):
git stash
git stash pop

# Cherry-pick (перенос коммита):
git cherry-pick commit-hash

# Reset (осторожно!):
git reset --soft HEAD~1  # Отменить коммит, сохранить изменения
git reset --hard HEAD~1  # Отменить коммит, удалить изменения
```

---

## 📊 Метрики и мониторинг

### Отслеживаемые метрики:
- 📈 Количество активных веток
- 📈 Среднее время жизни feature ветки
- 📈 Количество открытых Pull Request
- 📈 Время ревью Pull Request
- 📈 Частота релизов
- 📈 Количество hotfix за период

### Инструменты:
- GitHub Insights
- GitHub Actions
- GitHub Projects
- External tools (Jira, Trello)

---

## 📞 Поддержка

### Вопросы по Git:
- Документация Git: https://git-scm.com/doc
- GitHub Docs: https://docs.github.com
- Atlassian Git Tutorial: https://www.atlassian.com/git/tutorials

### Внутренние контакты:
- Team Lead: [имя]
- DevOps: [имя]
- Slack: #git-help

---

## 📝 История изменений

### v1.0.0 (2026-01-10)
- ✅ Первоначальная версия стратегии ветвления
- ✅ Определены основные ветки
- ✅ Описан workflow
- ✅ Добавлены примеры и шаблоны

---

**Версия:** 1.0.0  
**Дата:** 2026-01-10  
**Статус:** ✅ Active

---

## ✅ Чеклист для разработчиков

Перед началом работы:
- [ ] Прочитал этот документ
- [ ] Понимаю стратегию ветвления
- [ ] Знаю правила именования веток
- [ ] Знаю формат сообщений коммитов
- [ ] Настроил Git (имя, email)

Перед созданием Pull Request:
- [ ] Ветка создана из develop (или main для hotfix)
- [ ] Код протестирован локально
- [ ] Коммиты имеют понятные сообщения
- [ ] Ветка актуальна (pull перед push)
- [ ] Создан Pull Request с описанием

Перед слиянием:
- [ ] Получен минимум 1 approval
- [ ] Все checks пройдены
- [ ] Конфликты разрешены
- [ ] Код ревьюирован

После слияния:
- [ ] Ветка удалена
- [ ] Локальные ветки обновлены
- [ ] Проверена работа на production (если нужно)

---

**🎯 Следуйте этой стратегии для успешной разработки!** 🚀

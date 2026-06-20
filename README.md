# VinylScout

Расширение для Google Chrome, которое позволяет выделить название альбома на любой странице и добавить его в [Discogs Wantlist](https://www.discogs.com/wantlist) через контекстное меню.

## Как это работает

1. Выдели текст с названием альбома на любой веб-странице
2. Нажми правую кнопку мыши → **VinylScout: добавить в Wantlist**
3. В правом верхнем углу появится панель с результатами поиска из Discogs
4. Нажми **+ Wantlist** рядом с нужным релизом

## Установка

### 1. Получи Discogs Personal Access Token

1. Зайди на страницу [discogs.com/settings/developers](https://www.discogs.com/settings/developers)
2. Нажми кнопку **Generate new token**
3. Скопируй токен — он понадобится на следующем шаге

### 2. Загрузи расширение в Chrome

1. Открой `chrome://extensions/`
2. Включи **Режим разработчика** (переключатель в правом верхнем углу)
3. Нажми **Загрузить распакованное расширение**
4. Выбери папку с этим проектом

### 3. Настрой расширение

1. Нажми на иконку VinylScout в панели инструментов Chrome
2. Нажми кнопку **Настройки**
3. Вставь токен и свой логин на Discogs (виден в адресе профиля: `discogs.com/user/твой_логин`)
4. Нажми **Сохранить и проверить**

## Структура файлов

```
├── manifest.json     — конфигурация расширения (Manifest V3)
├── background.js     — service worker: контекстное меню и запросы к Discogs API
├── content.js        — всплывающая панель с результатами на странице
├── content.css       — стили панели
├── popup.html/js     — попап при клике на иконку расширения
├── options.html/js   — страница настроек
└── icons/
    └── icon.svg      — иконка расширения
```

## Технические детали

- **Manifest V3** — актуальный стандарт расширений Chrome
- **Discogs API** — аутентификация через Personal Access Token (`Authorization: Discogs token=...`)
- Поиск выполняется по выделенному тексту через endpoint `/database/search`
- Добавление в Wantlist через `PUT /users/{username}/wants/{release_id}`
- Данные (токен, логин) хранятся локально в `chrome.storage.local`

## Требования

- Google Chrome 88 или новее
- Аккаунт на [Discogs](https://www.discogs.com)

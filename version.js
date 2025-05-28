// version.js - Система версионирования для Mini App
const APP_VERSION = "2.0.0";
const BUILD_DATE = "2025-01-28";

// Функция для отображения версии
function displayVersion() {
    const footer = document.querySelector('footer');
    if (footer) {
        const versionElement = document.createElement('div');
        versionElement.className = 'version-info';
        versionElement.innerHTML = `
            <div class="version-text">
                Версия: ${APP_VERSION} | Сборка: ${BUILD_DATE} | Регистрация: v2.0
            </div>
        `;
        footer.appendChild(versionElement);
    }
}

// Функция для проверки кеша и принудительного обновления
function checkForUpdates() {
    const cachedVersion = localStorage.getItem('app_version');
    const currentVersion = APP_VERSION;
    
    if (cachedVersion && cachedVersion !== currentVersion) {
        console.log(`Обновление с версии ${cachedVersion} до ${currentVersion}`);
        
        // Очищаем кеш регистрации при major обновлении
        const oldMajor = cachedVersion.split('.')[0];
        const newMajor = currentVersion.split('.')[0];
        
        if (oldMajor !== newMajor) {
            console.log('Major версия изменилась - очищаем данные регистрации');
            // Очищаем данные регистрации при major обновлении
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('user_registered_')) {
                    localStorage.removeItem(key);
                }
            });
        }
        
        // Очищаем кеш для принудительного обновления
        if ('caches' in window) {
            caches.keys().then(function(names) {
                names.forEach(function(name) {
                    caches.delete(name);
                });
            });
        }
    }
    
    localStorage.setItem('app_version', currentVersion);
}

// Функция для получения истории версий
function getVersionHistory() {
    return [
        {
            version: "2.0.0",
            date: "2025-01-28",
            features: [
                "Добавлена система регистрации пользователей",
                "Отображение информации о пользователе",
                "База данных SQLite для хранения данных",
                "API для валидации данных Telegram",
                "Контроль доступа к ассистентам"
            ]
        },
        {
            version: "1.0.1", 
            date: "2025-01-28",
            features: [
                "Улучшена обработка ошибок",
                "Добавлена система версионирования",
                "Исправлены мелкие баги"
            ]
        },
        {
            version: "1.0.0",
            date: "2025-01-27", 
            features: [
                "Первый релиз",
                "Выбор из 4 бизнес-ассистентов",
                "Telegram Mini App интерфейс",
                "Поддержка темной и светлой темы"
            ]
        }
    ];
}

// Функция для проверки совместимости
function checkCompatibility() {
    const userAgent = navigator.userAgent;
    const isAndroid = /Android/i.test(userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
    const isTelegram = window.Telegram && window.Telegram.WebApp;
    
    return {
        isTelegram: isTelegram,
        isAndroid: isAndroid,
        isIOS: isIOS,
        supportsRegistration: isTelegram && (isAndroid || isIOS),
        browserVersion: getBrowserVersion()
    };
}

// Функция для получения версии браузера
function getBrowserVersion() {
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Chrome/')) {
        const match = userAgent.match(/Chrome\/(\d+)/);
        return match ? `Chrome ${match[1]}` : 'Chrome Unknown';
    } else if (userAgent.includes('Safari/')) {
        const match = userAgent.match(/Version\/(\d+)/);
        return match ? `Safari ${match[1]}` : 'Safari Unknown';
    }
    
    return 'Unknown Browser';
}

// Функция для диагностики проблем
function runDiagnostics() {
    const compatibility = checkCompatibility();
    const hasLocalStorage = typeof(Storage) !== "undefined";
    const hasTelegramWebApp = !!(window.Telegram && window.Telegram.WebApp);
    
    const diagnostics = {
        version: APP_VERSION,
        buildDate: BUILD_DATE,
        compatibility: compatibility,
        localStorage: hasLocalStorage,
        telegramWebApp: hasTelegramWebApp,
        initData: hasTelegramWebApp ? !!window.Telegram.WebApp.initData : false,
        user: hasTelegramWebApp ? !!window.Telegram.WebApp.initDataUnsafe.user : false,
        timestamp: new Date().toISOString()
    };
    
    console.log('App Diagnostics:', diagnostics);
    return diagnostics;
}

// CSS стили для версии (обновленные)
const versionStyles = `
.version-info {
    text-align: center;
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid var(--tg-theme-secondary-bg-color);
}

.version-text {
    font-size: 11px;
    color: var(--tg-theme-hint-color);
    opacity: 0.7;
    font-family: monospace;
    line-height: 1.3;
}

.version-badge {
    display: inline-block;
    background-color: var(--tg-theme-button-color);
    color: var(--tg-theme-button-text-color);
    padding: 2px 6px;
    border-radius: 8px;
    font-size: 9px;
    font-weight: 600;
    margin-left: 4px;
    text-transform: uppercase;
}
`;

// Экспортируем переменные для использования в других файлах
window.AppVersion = {
    version: APP_VERSION,
    buildDate: BUILD_DATE,
    displayVersion: displayVersion,
    checkForUpdates: checkForUpdates,
    getVersionHistory: getVersionHistory,
    checkCompatibility: checkCompatibility,
    runDiagnostics: runDiagnostics,
    styles: versionStyles
};

// Автоматически запускаем диагностику в режиме разработки
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    setTimeout(() => {
        console.log('🔧 Development Mode - Running Diagnostics');
        runDiagnostics();
    }, 1000);
}
